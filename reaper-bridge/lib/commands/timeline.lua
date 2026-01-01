-- ========================================
-- BIDIRECTIONAL SYNC IMPLEMENTATION
-- Timeline Change Detection for Reaper Bridge
-- ========================================

local commands = {}

local sync_version = 0
local last_marker_count = 0
local marker_cache = {}

-- Load sync version from project state
local function load_sync_version()
    local _, version_str = reaper.GetProjExtState(0, "TrackDraft", "sync_version")
    if version_str and version_str ~= "" then
        sync_version = tonumber(version_str) or 0
    end
end

-- Increment sync version (call on any change)
local function increment_sync_version()
    sync_version = sync_version + 1
    reaper.SetProjExtState(0, "TrackDraft", "sync_version", tostring(sync_version))
end

-- Get marker metadata from project state
local function get_marker_metadata(section_id)
    local _, metadata_json = reaper.GetProjExtState(0, "TrackDraft", "marker_" .. section_id)
    if metadata_json and metadata_json ~= "" then
        -- Parse JSON metadata
        local json = require("json")
        local ok, metadata = pcall(json.decode, metadata_json)
        if ok and metadata then
            return metadata
        end
    end
    
    -- Fallback to legacy format
    local metadata = {}
    local _, key_str = reaper.GetProjExtState(0, "TrackDraft", "section_" .. section_id .. "_key")
    local _, tempo_str = reaper.GetProjExtState(0, "TrackDraft", "section_" .. section_id .. "_tempo")
    
    if key_str and key_str ~= "" then
        metadata.key = tonumber(key_str)
    end
    if tempo_str and tempo_str ~= "" then
        metadata.tempo = tonumber(tempo_str)
    end
    
    return metadata
end

-- Store marker metadata in project state (JSON format)
local function store_marker_metadata(section_id, metadata)
    local json = require("json")
    local metadata_json = json.encode(metadata)
    reaper.SetProjExtState(0, "TrackDraft", "marker_" .. section_id, metadata_json)
end

-- Clear all TrackDraft markers
local function clear_trackdraft_markers()
    local _, num_markers, num_regions = reaper.CountProjectMarkers(0)
    
    -- Delete in reverse order to avoid index shifting
    for i = num_markers + num_regions - 1, 0, -1 do
        local retval, isrgn, pos, rgnend, name, marker_idx = reaper.EnumProjectMarkers3(0, i)
        if retval and name and name:find("^TD_") then
            reaper.DeleteProjectMarker(0, marker_idx, isrgn)
        end
    end
end

-- Create a TrackDraft marker/region
local function create_trackdraft_marker(section)
    local marker_name = "TD_" .. section.id .. "_" .. section.name
    local start_time = section.startTime or 0
    local end_time = section.endTime or (start_time + (section.bars or 8) * 4 * 60 / (section.tempo or 120))
    local color = section.color or 0x808080
    
    -- Create region (not point marker)
    reaper.AddProjectMarker2(0, true, start_time, end_time, marker_name, -1, color)
    
    -- Store metadata as JSON
    local metadata = {
        key = section.key or 0,
        tempo = section.tempo or 120,
        bars = section.bars or 8
    }
    store_marker_metadata(section.id, metadata)
    
    -- Update cache
    marker_cache[section.id] = {
        pos = start_time,
        rgnend = end_time,
        name = marker_name,
        color = color
    }
end

-- Get current timeline state from Reaper
local function get_current_timeline_state()
    local _, num_markers, num_regions = reaper.CountProjectMarkers(0)
    local sections = {}
    
    -- Enumerate all markers/regions
    for i = 0, num_markers + num_regions - 1 do
        local retval, isrgn, pos, rgnend, name, marker_idx, color = 
            reaper.EnumProjectMarkers3(0, i)
        
        if retval and isrgn then  -- Only regions (not point markers)
            -- Check if it's a TrackDraft marker (starts with TD_)
            if name and name:find("^TD_") then
                -- Extract section ID and name from format: TD_{id}_{name}
                local section_id = name:match("^TD_([^_]+)")
                local section_name = name:gsub("^TD_" .. section_id .. "_", "")
                
                if section_id then
                    -- Calculate bars from time (approximate)
                    local duration = rgnend - pos
                    local metadata = get_marker_metadata(section_id) or {}
                    local section_tempo = metadata.tempo or reaper.Master_GetTempo()
                    local bars = math.floor((duration * section_tempo / 60) / 4 + 0.5)
                    
                    -- Check if modified since last sync
                    local modified = false
                    local cached = marker_cache[section_id]
                    if cached then
                        if math.abs(cached.pos - pos) > 0.001 or 
                           math.abs(cached.rgnend - rgnend) > 0.001 then
                            modified = true
                        end
                    else
                        -- First time seeing this marker
                        modified = true
                    end
                    
                    table.insert(sections, {
                        id = section_id,
                        name = section_name,
                        startTime = pos,
                        endTime = rgnend,
                        bars = bars,
                        tempo = section_tempo,
                        key = metadata.key or 0,
                        color = color or 0,
                        modifiedInReaper = modified
                    })
                    
                    -- Update cache
                    marker_cache[section_id] = {
                        pos = pos,
                        rgnend = rgnend,
                        name = name,
                        color = color
                    }
                end
            end
        end
    end
    
    return {
        syncVersion = sync_version,
        lastModified = os.date("!%Y-%m-%dT%H:%M:%SZ"),
        sections = sections
    }
end

-- Detect changes since last sync
local function detect_timeline_changes(last_sync_version)
    local current_state = get_current_timeline_state()
    local changes = {}
    
    -- If version hasn't changed, no changes
    if last_sync_version and last_sync_version >= sync_version then
        return {
            state = current_state,
            changes = changes
        }
    end
    
    -- Build changes array based on modified sections
    for _, section in ipairs(current_state.sections) do
        if section.modifiedInReaper then
            local cached = marker_cache[section.id]
            if cached then
                table.insert(changes, {
                    sectionId = section.id,
                    changeType = "moved",
                    oldValue = {
                        startTime = cached.pos,
                        endTime = cached.rgnend
                    },
                    newValue = {
                        startTime = section.startTime,
                        endTime = section.endTime
                    }
                })
            end
        end
    end
    
    return {
        state = current_state,
        changes = changes
    }
end

-- Command: Get timeline state
commands.get_timeline_state = function(data)
    local last_sync = data.lastSyncVersion or 0
    local result = detect_timeline_changes(last_sync)
    
    -- Return format matches spec: { success, state, changes }
    return {
        success = true,
        state = result.state,
        changes = result.changes or {}
    }
end

-- Command: Sync from TrackDraft to Reaper
commands.sync_to_reaper = function(data)
    local conflicts = {}
    
    -- Check for conflicts
    if data.syncVersion and data.syncVersion < sync_version then
        -- TrackDraft is behind - there were changes in Reaper
        if data.conflictResolution == 'reaper-wins' then
            -- Don't update, return current Reaper state
            return {
                success = true,
                syncVersion = sync_version,
                conflicts = {
                    {
                        sectionId = "*",
                        type = 'version-mismatch',
                        reaperValue = sync_version,
                        trackdraftValue = data.syncVersion,
                        resolution = 'reaper-wins'
                    }
                }
            }
        end
        -- Default: trackdraft-wins - continue with update
    end
    
    -- Clear existing markers
    clear_trackdraft_markers()
    
    -- Create new markers from TrackDraft
    for _, section in ipairs(data.sections or {}) do
        create_trackdraft_marker(section)
    end
    
    -- Increment version
    increment_sync_version()
    
    -- Refresh UI
    reaper.UpdateArrange()
    
    -- Return format matches spec: { success, syncVersion, conflicts }
    return {
        success = true,
        syncVersion = sync_version,
        conflicts = conflicts
    }
end

-- Background: Monitor for changes in Reaper
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
        
        -- Check if marker count changed
        if total_markers ~= last_marker_count then
            increment_sync_version()
            last_marker_count = total_markers
        else
            -- Check if positions changed
            local current_state = get_current_timeline_state()
            
            for _, section in ipairs(current_state.sections) do
                if section.modifiedInReaper then
                    increment_sync_version()
                    break
                end
            end
        end
        
        last_check_time = now
    end
    
    reaper.defer(monitor_timeline_changes)
end

-- Start monitoring timeline changes
local function start_monitoring()
    if not monitoring_active then
        monitoring_active = true
        load_sync_version()
        local _, num_markers, num_regions = reaper.CountProjectMarkers(0)
        last_marker_count = num_markers + num_regions
        monitor_timeline_changes()
    end
end

-- Stop monitoring
local function stop_monitoring()
    monitoring_active = false
end

-- Initialize sync version on load
load_sync_version()

-- Export
return {
    commands = commands,
    start_monitoring = start_monitoring,
    stop_monitoring = stop_monitoring
}