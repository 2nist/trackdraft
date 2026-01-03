-- TrackDraft HTTP Import Script
-- Imports song structure from TrackDraft via REAPER Extended State
-- Place this script in your REAPER Scripts folder and add to Actions list
-- 
-- Usage:
-- 1. Export from TrackDraft (stores data in extended state)
-- 2. Run this script in REAPER to create markers, regions, and chords
--
-- Requires: REAPER v6.0+
-- Optional: JSON parsing library (or uses built-in string parsing)

-- Simple JSON decoder (handles basic JSON without external dependencies)
local function decodeJSON(str)
  -- Remove outer braces
  str = str:gsub("^%s*{%s*", ""):gsub("%s*}%s*$", "")
  
  local result = {}
  
  -- Simple parser for our specific JSON structure
  -- Note: For production, consider using a proper JSON library
  local function parseArray(s)
    s = s:gsub("^%s*%[%s*", ""):gsub("%s*%]%s*$", "")
    local items = {}
    local depth = 0
    local current = ""
    
    for i = 1, #s do
      local c = s:sub(i, i)
      if c == "{" then
        depth = depth + 1
        current = current .. c
      elseif c == "}" then
        depth = depth - 1
        current = current .. c
        if depth == 0 then
          table.insert(items, current)
          current = ""
        end
      elseif c == "," and depth == 0 then
        -- Skip
      else
        current = current .. c
      end
    end
    
    if #current > 0 then
      table.insert(items, current)
    end
    
    return items
  end
  
  -- Extract fields
  result.version = str:match('"version"%s*:%s*"([^"]+)"') or "1.0.0"
  result.projectName = str:match('"projectName"%s*:%s*"([^"]+)"') or "Untitled"
  result.bpm = tonumber(str:match('"bpm"%s*:%s*([%d.]+)')) or 120
  
  -- Parse markers array
  local markersStr = str:match('"markers"%s*:%s*(%b[])')
  result.markers = {}
  if markersStr then
    local markerItems = parseArray(markersStr)
    for _, item in ipairs(markerItems) do
      local marker = {}
      marker.name = item:match('"name"%s*:%s*"([^"]+)"') or ""
      marker.position = tonumber(item:match('"position"%s*:%s*([%d.]+)')) or 0
      marker.color = tonumber(item:match('"color"%s*:%s*(%d+)')) or 0
      table.insert(result.markers, marker)
    end
  end
  
  -- Parse regions array
  local regionsStr = str:match('"regions"%s*:%s*(%b[])')
  result.regions = {}
  if regionsStr then
    local regionItems = parseArray(regionsStr)
    for _, item in ipairs(regionItems) do
      local region = {}
      region.name = item:match('"name"%s*:%s*"([^"]+)"') or ""
      region.startPosition = tonumber(item:match('"startPosition"%s*:%s*([%d.]+)')) or 0
      region.endPosition = tonumber(item:match('"endPosition"%s*:%s*([%d.]+)')) or 0
      region.color = tonumber(item:match('"color"%s*:%s*(%d+)')) or 0
      table.insert(result.regions, region)
    end
  end
  
  -- Parse chords array
  local chordsStr = str:match('"chords"%s*:%s*(%b[])')
  result.chords = {}
  if chordsStr then
    local chordItems = parseArray(chordsStr)
    for _, item in ipairs(chordItems) do
      local chord = {}
      chord.position = tonumber(item:match('"position"%s*:%s*([%d.]+)')) or 0
      chord.chord = item:match('"chord"%s*:%s*"([^"]+)"') or ""
      chord.duration = tonumber(item:match('"duration"%s*:%s*([%d.]+)')) or 0
      table.insert(result.chords, chord)
    end
  end
  
  return result
end

-- Main import function
function ImportTrackDraftStructure()
  -- Get data from extended state
  local retval, data = reaper.GetProjExtState(0, "TrackDraft", "SongStructure")
  
  if retval == 0 or data == "" then
    reaper.MB("No TrackDraft data found in project.\n\nMake sure to:\n1. Connect TrackDraft to REAPER\n2. Click 'Export to REAPER' button", "TrackDraft Import", 0)
    return
  end
  
  -- Parse JSON data
  local success, structure = pcall(decodeJSON, data)
  
  if not success or not structure then
    reaper.MB("Failed to parse TrackDraft data.\n\nThe data may be corrupted.", "TrackDraft Import Error", 0)
    return
  end
  
  -- Begin undo block
  reaper.Undo_BeginBlock()
  
  -- Set project tempo
  if structure.bpm then
    reaper.SetCurrentBPM(0, structure.bpm, false)
  end
  
  -- Create markers
  if structure.markers then
    for i, marker in ipairs(structure.markers) do
      reaper.AddProjectMarker2(
        0,                    -- project
        false,                -- isrgn (marker, not region)
        marker.position,      -- position
        0,                    -- rgnend (not used for markers)
        marker.name,          -- name
        -1,                   -- wantidx (auto-assign)
        marker.color          -- color
      )
    end
  end
  
  -- Create regions
  if structure.regions then
    for i, region in ipairs(structure.regions) do
      reaper.AddProjectMarker2(
        0,                      -- project
        true,                   -- isrgn (region)
        region.startPosition,   -- start
        region.endPosition,     -- end
        region.name,            -- name
        -1,                     -- wantidx (auto-assign)
        region.color            -- color
      )
    end
  end
  
  -- Create chord track
  if structure.chords and #structure.chords > 0 then
    local chordTrack = GetOrCreateChordTrack()
    
    for i, chordEvent in ipairs(structure.chords) do
      -- Create empty item for chord
      local item = reaper.AddMediaItemToTrack(chordTrack)
      reaper.SetMediaItemPosition(item, chordEvent.position, false)
      reaper.SetMediaItemLength(item, chordEvent.duration, false)
      
      -- Add take with chord name
      local take = reaper.AddTakeToMediaItem(item)
      reaper.GetSetMediaItemTakeInfo_String(take, "P_NAME", chordEvent.chord, true)
      
      -- Color the item
      reaper.SetMediaItemInfo_Value(item, "I_CUSTOMCOLOR", 0x1000FF80) -- Green tint
    end
  end
  
  -- End undo block
  reaper.Undo_EndBlock("Import TrackDraft Structure", -1)
  
  -- Update arrange view
  reaper.UpdateArrange()
  
  -- Success message
  local stats = string.format(
    "Successfully imported TrackDraft structure!\n\n" ..
    "Project: %s\n" ..
    "Tempo: %d BPM\n" ..
    "Markers: %d\n" ..
    "Regions: %d\n" ..
    "Chords: %d",
    structure.projectName or "Untitled",
    structure.bpm or 120,
    structure.markers and #structure.markers or 0,
    structure.regions and #structure.regions or 0,
    structure.chords and #structure.chords or 0
  )
  
  reaper.MB(stats, "TrackDraft Import Complete", 0)
end

-- Helper: Get or create chord track
function GetOrCreateChordTrack()
  -- Find existing chord track
  local trackCount = reaper.CountTracks(0)
  
  for i = 0, trackCount - 1 do
    local track = reaper.GetTrack(0, i)
    local retval, name = reaper.GetSetMediaTrackInfo_String(track, "P_NAME", "", false)
    if name == "TrackDraft Chords" then
      return track
    end
  end
  
  -- Create new track
  reaper.InsertTrackAtIndex(0, true)
  local track = reaper.GetTrack(0, 0)
  reaper.GetSetMediaTrackInfo_String(track, "P_NAME", "TrackDraft Chords", true)
  
  -- Color the track
  reaper.SetMediaTrackInfo_Value(track, "I_CUSTOMCOLOR", 0x1000FF80) -- Green
  
  return track
end

-- Run the import
reaper.PreventUIRefresh(1)
ImportTrackDraftStructure()
reaper.PreventUIRefresh(-1)
