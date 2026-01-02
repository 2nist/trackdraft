-- ========================================
-- CHORD TRACK CREATION
-- Create chord markers/regions in Reaper
-- ========================================

local commands = {}

-- Note names for chord roots (0-11)
local NOTE_NAMES = {
    [0] = "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"
}

-- Convert chord type to display string
local function chord_type_to_string(chord_type)
    local type_map = {
        maj = "",
        min = "m",
        dim = "dim",
        aug = "aug",
        ["7"] = "7",
        maj7 = "maj7",
        min7 = "m7",
        sus2 = "sus2",
        sus4 = "sus4"
    }
    return type_map[chord_type] or ""
end

-- Create chord markers in Reaper
commands.create_chord_track = function(data)
    local sections = data.sections or {}
    
    -- Debug logging
    reaper.ShowConsoleMsg("=== create_chord_track called ===\n")
    reaper.ShowConsoleMsg("Number of sections: " .. #sections .. "\n")
    
    if #sections == 0 then
        reaper.ShowConsoleMsg("ERROR: No sections provided\n")
        return {
            success = false,
            error = "No sections provided"
        }
    end
    
    -- Get tempo from first section (or use default)
    local tempo = 120
    if #sections > 0 and sections[1].tempo then
        tempo = sections[1].tempo
        reaper.ShowConsoleMsg("Using tempo: " .. tempo .. " BPM\n")
    else
        reaper.ShowConsoleMsg("Using default tempo: " .. tempo .. " BPM\n")
    end
    
    -- Calculate beats per second
    local beats_per_second = tempo / 60
    
    -- Track current time position
    local current_time = 0
    local marker_count = 0
    
    -- Clear existing TrackDraft chord markers (markers starting with "CHORD_")
    local _, num_markers, num_regions = reaper.CountProjectMarkers(0)
    for i = num_markers + num_regions - 1, 0, -1 do
        local retval, isrgn, pos, rgnend, name, marker_idx = reaper.EnumProjectMarkers3(0, i)
        if retval and name and name:find("^CHORD_") then
            reaper.DeleteProjectMarker(0, marker_idx, isrgn)
        end
    end
    
    -- Process each section
    for section_idx, section in ipairs(sections) do
        local section_chords = section.chords or {}
        reaper.ShowConsoleMsg("Section " .. section_idx .. ": " .. (section.name or "unnamed") .. "\n")
        reaper.ShowConsoleMsg("  Section bars: " .. (section.bars or "nil") .. "\n")
        reaper.ShowConsoleMsg("  Number of chords: " .. #section_chords .. "\n")
        
        -- Process each chord in the section
        for chord_idx, chord in ipairs(section_chords) do
            -- Get chord properties
            local root = chord.root or 0
            local chord_type = chord.type or "maj"
            local duration = chord.duration or 2  -- Duration in beats
            local start_beat = chord.startBeat or 0
            
            -- Calculate time position
            local chord_start_time = current_time + (start_beat / beats_per_second)
            local chord_duration_seconds = duration / beats_per_second
            local chord_end_time = chord_start_time + chord_duration_seconds
            
            -- Build chord name
            local root_name = NOTE_NAMES[root] or "C"
            local type_suffix = chord_type_to_string(chord_type)
            local chord_name = "CHORD_" .. root_name .. type_suffix
            
            -- Debug logging for this chord
            reaper.ShowConsoleMsg("  Chord " .. chord_idx .. ": " .. chord_name .. "\n")
            reaper.ShowConsoleMsg("    Time: " .. string.format("%.2f", chord_start_time) .. "s - " .. string.format("%.2f", chord_end_time) .. "s\n")
            reaper.ShowConsoleMsg("    Duration: " .. duration .. " beats\n")
            
            -- Create chord as a region marker
            -- Color: Use a light blue color for chords
            local chord_color = 0x00AAFF  -- Light blue in BBGGRR format
            
            local marker_index = reaper.AddProjectMarker2(
                0,              -- project (0 = current)
                true,           -- isrgn (true = region)
                chord_start_time,
                chord_end_time,
                chord_name,
                -1,             -- wantidx (auto)
                chord_color     -- color
            )
            
            if marker_index >= 0 then
                reaper.ShowConsoleMsg("    ✓ Created marker index: " .. marker_index .. "\n")
                marker_count = marker_count + 1
            else
                reaper.ShowConsoleMsg("    ✗ Failed to create marker\n")
            end
        end
        
        -- Move current time to end of section
        local section_bars = section.bars or 8
        local section_beats = section_bars * 4  -- Assuming 4/4 time
        current_time = current_time + (section_beats / beats_per_second)
    end
    
    -- Refresh Reaper's arrange view
    reaper.UpdateArrange()
    
    reaper.ShowConsoleMsg("=== Chord track creation complete ===\n")
    reaper.ShowConsoleMsg("Total markers created: " .. marker_count .. "\n")
    
    return {
        success = true,
        message = "Created " .. marker_count .. " chord markers",
        markerCount = marker_count
    }
end

-- Export
return {
    commands = commands
}

