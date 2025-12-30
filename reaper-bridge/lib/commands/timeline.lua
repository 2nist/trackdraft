-- ========================================
-- BIDIRECTIONAL SYNC IMPLEMENTATION
-- Timeline Change Detection for Reaper Bridge
-- ========================================

local sync_version = 0
local last_marker_count = 0
local marker_cache = {}

--- Load sync version from project state
local function load_sync_version()
    local _, version_str = reaper.GetProjExtState(0, "TrackDraft", "sync_version")
    if version_str and version_str ~= "" then
        sync_version = tonumber(version_str) or 0
    end
end

--- Increment sync version (call on any change)
local function increment_sync_version()
    sync_version = sync_version + 1
    reaper.SetProjExtState(0, "TrackDraft", "sync_version", tostring(sync_version))
end

--- Get marker metadata from project state
local function get_marker_metadata(section_id)
    local _, key_str = reaper.GetProjExtState(0, "TrackDraft", "section_" .. section_id .. "_key")
    local _, tempo_str = reaper.GetProjExtState(0, "TrackDraft", "section_" .. section_id .. "_tempo")
    
    local metadata = {}
    if key_str and key_str ~= "" then
        metadata.key = tonumber(key_str)
    end
    if tempo_str and tempo_str ~= "" then
        metadata.tempo = tonumber(tempo_str)
    end
    
    return metadata
end

--- Clear all TrackDraft markers
local function clear_trackdraft_markers()
    local _, num_markers, num_regions = reaper.CountProjectMarkers(0)
    
    -- Delete in reverse order to avoid index shifting
    for i = num_markers + num_regions - 1, 0, -1 do
        local retval, isrgn, pos, rgnend, name, marker_idx = reaper.EnumProjectMarkers3(0, i)
        if retval and name and name:find("TD_") then
            reaper.DeleteProjectMarker(0, marker_idx, isrgn)
        end
    end
end

--- Create a TrackDraft marker
local function create_trackdraft_marker(section)
    local marker_name = "TD_" .. section.id .. "_" .. section.name
    local start_time = section.startTime or 0
    local end_time = section.endTime or (start_time + (section.bars or 8) * 4 * 60 / (section.tempo or 120))
    local color = section.color or 0x808080
    
    reaper.AddProjectMarker2(0, true, start_time, end_time, marker_name, -1, color)
    
    -- Store metadata
    if section.key then
        reaper.SetProjExtState(0, "TrackDraft", "section_" .. section.id .. "_key", tostring(section.key))
    end
    if section.tempo then
        reaper.SetProjExtState(0, "TrackDraft", "section_" .. section.id .. "_tempo", tostring(section.tempo))
    end
end

--- Get current timeline state from Reaper
local function get_current_timeline_state()
    local _, num_markers, num_regions = reaper.CountProjectMarkers(0)
    local sections = {}
    
    -- Enumerate all markers/regions
    for i = 0, num_markers + num_regions - 1 do
        local retval, isrgn, pos, rgnend, name, marker_idx, color = 
            reaper.EnumProjectMarkers3(0, i)
        
        if retval and isrgn then  -- Only regions (not point markers)
            -- Check if it's a TrackDraft marker
            local is_td_marker = name and name:find("TD_")
            
            if is_td_marker then
                -- Extract section ID from name (format: TD_<id>_<name>)
                local section_id = name:match("TD_([^_]+)")
                
                -- Calculate bars from time (approximate)
                local duration = rgnend - pos
                local tempo = reaper.Master_GetTempo()
                local bars = math.floor((duration * tempo / 60) / 4 + 0.5)
                
                -- Get metadata from storage
                local metadata = get_marker_metadata(section_id) or {}
                local section_tempo = metadata.tempo or tempo
                
                -- Recalculate bars with actual tempo if available
                if metadata.tempo then
                    bars = math.floor((duration * section_tempo / 60) / 4 + 0.5)
                end
                
                -- Check if modified since last sync
                local modified = false
                local cached = marker_cache[section_id]
                if cached then
                    if math.abs(cached.pos - pos) > 0.01 or 
                       math.abs(cached.rgnend - rgnend) > 0.01 then
                        modified = true
                    end
                else
                    -- First time seeing this marker, assume it's new/changed
                    modified = true
                end
                
                table.insert(sections, {
                    id = section_id,
                    name = name:gsub("TD_" .. section_id .. "_", ""),
                    startTime = pos,
                    endTime = rgnend,
                    bars = bars,
                    tempo = section_tempo,
                    key = metadata.key or 0,
                    color = color,
                    modifiedInReaper = modified
                })
                
                -- Update cache
                marker_cache[section_id] = {
                    pos = pos,
                    rgnend = rgnend,
                    name = name
                }
            end
        end
    end
    
    return {
        syncVersion = sync_version,
        lastModified = os.date("!%Y-%m-%dT%H:%M:%SZ"),
        sections = sections
    }
end

--- Detect changes since last sync
local function detect_timeline_changes(last_sync_version)
    local current_state = get_current_timeline_state()
    
    -- If version hasn't changed, no changes
    if last_sync_version and last_sync_version >= sync_version then
        return {
            hasChanges = false,
            state = current_state
        }
    end
    
    -- Compute changes (if we have history)
    local changes = {}
    
    -- For now, just return full state
    -- Could implement detailed diff in future
    
    return {
        hasChanges = true,
        state = current_state,
        changes = changes
    }
end

--- Command: Get timeline state
commands.get_timeline_state = function(data)
    local last_sync = data.lastSyncVersion or 0
    local result = detect_timeline_changes(last_sync)
    
    return {
        success = true,
        data = {
            state = result.state,
            changes = result.changes,
            hasChanges = result.hasChanges
        }
    }
end

--- Command: Sync from TrackDraft to Reaper
commands.sync_to_reaper = function(data)
    local current_state = get_current_timeline_state()
    local conflicts = {}
    
    -- Check for conflicts
    if data.syncVersion and data.syncVersion < sync_version then
        -- TrackDraft is behind - there were changes in Reaper
        
        if data.conflictResolution == 'reaper-wins' then
            -- Don't update, return current Reaper state
            return {
                success = true,
                data = {
                    syncVersion = sync_version,
                    conflicts = {
                        {
                            type = 'version-mismatch',
                            resolution = 'reaper-wins',
                            message = 'Reaper changes preserved'
                        }
                    }
                }
            }
        end
        
        -- Default: trackdraft-wins
        -- Continue with update...
    end
    
    -- Clear existing markers
    clear_trackdraft_markers()
    
    -- Create new markers from TrackDraft
    for _, section in ipairs(data.sections or {}) do
        create_trackdraft_marker(section)
    end
    
    -- Increment version
    increment_sync_version()
    
    reaper.UpdateArrange()
    
    return {
        success = true,
        data = {
            syncVersion = sync_version,
            conflicts = conflicts
        }
    }
end

--- Background: Monitor for changes in Reaper
local last_check_time = 0
local CHECK_INTERVAL = 2  -- Check every 2 seconds
local monitoring_active = false

local function monitor_timeline_changes()
    if not monitoring_active then
        return
    end
    
    local now = reaper.time_precise()
    
    if now - last_check_time > CHECK_INTERVAL then
        local _, num_markers, num_regions = reaper.CountProjectMarkers(0)
        local total_markers = num_markers + num_regions
        
        -- If marker count changed, something happened
        if total_markers ~= last_marker_count then
            increment_sync_version()
            last_marker_count = total_markers
            
            reaper.ShowConsoleMsg(
                "TrackDraft: Timeline changed (version " .. 
                sync_version .. ")\n"
            )
        else
            -- Check if positions changed
            local current_state = get_current_timeline_state()
            
            for _, section in ipairs(current_state.sections) do
                if section.modifiedInReaper then
                    increment_sync_version()
                    
                    reaper.ShowConsoleMsg(
                        "TrackDraft: Section '" .. section.name .. 
                        "' moved in Reaper (version " .. sync_version .. ")\n"
                    )
                    break
                end
            end
        end
        
        last_check_time = now
    end
    
    reaper.defer(monitor_timeline_changes)
end

--- Start monitoring timeline changes
local function start_monitoring()
    if not monitoring_active then
        monitoring_active = true
        load_sync_version()
        local _, num_markers, num_regions = reaper.CountProjectMarkers(0)
        last_marker_count = num_markers + num_regions
        monitor_timeline_changes()
    end
end

--- Stop monitoring
local function stop_monitoring()
    monitoring_active = false
end

-- Initialize sync version on load
load_sync_version()

-- Export functions (if using module system)
if commands then
    -- Already registered above
end

-- Note: Start monitoring should be called from main bridge script
-- start_monitoring()

