-- ========================================
-- TrackDraft Reaper Bridge (IPC Version)
-- File-based communication - NO LuaSocket required!
-- Works on Windows, Mac, and Linux
-- ========================================

-- This script communicates with the Node.js bridge server via files
-- No DLL dependencies required!

-- Check for JSON library (dkjson)
local json_ok, json = pcall(function()
    local ok, json_mod = pcall(require, "json")
    if ok then return json_mod end
    
    local function try_relative()
        local ok, json_mod = pcall(dofile, "lib/json.lua")
        if ok then return json_mod end
    end
    
    local function try_absolute()
        local script_path = debug.getinfo(1, "S").source
        if script_path:match("^@") then
            script_path = script_path:sub(2)
            local script_dir = script_path:match("(.*[/\\])")
            if script_dir then
                local json_path = script_dir .. "lib/json.lua"
                local chunk = loadfile(json_path)
                if chunk then
                    return chunk()
                end
            end
        end
    end
    
    local function try_resource()
        local resource_path = reaper.GetResourcePath()
        local json_path = resource_path .. "/Scripts/TrackDraft/lib/json.lua"
        local chunk = loadfile(json_path)
        if chunk then
            return chunk()
        end
    end
    
    return try_relative() or try_absolute() or try_resource()
end)

if not json_ok or not json then
    reaper.ShowMessageBox(
        "JSON library not found!\n\n" ..
        "Please download dkjson.lua and copy its contents into lib/json.lua\n\n" ..
        "Download from: http://dkolf.de/src/dkjson-lua.fsl/home",
        "TrackDraft Bridge Error",
        0
    )
    return
end

-- Make JSON module globally available for timeline.lua
package.loaded["json"] = json
_G.json = json

-- Load timeline commands module
local timeline_ok, timeline_module = pcall(function()
    local function try_relative()
        local ok, module = pcall(dofile, "lib/commands/timeline.lua")
        if ok then return module end
    end
    
    local function try_absolute()
        local script_path = debug.getinfo(1, "S").source
        if script_path:match("^@") then
            script_path = script_path:sub(2)
            local script_dir = script_path:match("(.*[/\\])")
            if script_dir then
                local timeline_path = script_dir .. "lib/commands/timeline.lua"
                local chunk = loadfile(timeline_path)
                if chunk then
                    return chunk()
                end
            end
        end
    end
    
    local function try_resource()
        local resource_path = reaper.GetResourcePath()
        local timeline_path = resource_path .. "/Scripts/TrackDraft/lib/commands/timeline.lua"
        local chunk = loadfile(timeline_path)
        if chunk then
            return chunk()
        end
    end
    
    return try_relative() or try_absolute() or try_resource()
end)

if not timeline_ok or not timeline_module then
    reaper.ShowMessageBox(
        "Failed to load timeline module!\n\n" ..
        "Please ensure lib/commands/timeline.lua exists.",
        "TrackDraft Bridge Error",
        0
    )
    return
end

local timeline_commands = timeline_module.commands
local start_monitoring = timeline_module.start_monitoring

-- Load chords commands module
local chords_ok, chords_module = pcall(function()
    local function try_relative()
        local ok, module = pcall(dofile, "lib/commands/chords.lua")
        if ok then return module end
    end
    
    local function try_absolute()
        local script_path = debug.getinfo(1, "S").source
        if script_path:match("^@") then
            script_path = script_path:sub(2)
            local script_dir = script_path:match("(.*[/\\])")
            if script_dir then
                local chords_path = script_dir .. "lib/commands/chords.lua"
                local chunk = loadfile(chords_path)
                if chunk then
                    return chunk()
                end
            end
        end
    end
    
    local function try_resource()
        local resource_path = reaper.GetResourcePath()
        local chords_path = resource_path .. "/Scripts/TrackDraft/lib/commands/chords.lua"
        local chunk = loadfile(chords_path)
        if chunk then
            return chunk()
        end
    end
    
    return try_relative() or try_absolute() or try_resource()
end)

if not chords_ok or not chords_module then
    reaper.ShowConsoleMsg("Warning: Failed to load chords module. Chord track creation will not be available.\n")
end

local chords_commands = (chords_ok and chords_module and chords_module.commands) or {}

-- IPC configuration
local function get_temp_dir()
    local temp = os.getenv("TEMP") or os.getenv("TMP") or "/tmp"
    return temp
end

local IPC_DIR = get_temp_dir() .. "/trackdraft-bridge"
local REQUEST_FILE = IPC_DIR .. "/request.json"
local RESPONSE_FILE = IPC_DIR .. "/response.json"
local HEARTBEAT_FILE = IPC_DIR .. "/heartbeat.txt"

-- Ensure IPC directory exists
local function ensure_ipc_dir()
    -- Try to create directory (platform-independent)
    local success = reaper.RecursiveCreateDirectory(IPC_DIR, 0)
    if not success then
        -- Try mkdir command
        if reaper.GetOS():match("Win") then
            os.execute('mkdir "' .. IPC_DIR .. '" 2>nul')
        else
            os.execute('mkdir -p "' .. IPC_DIR .. '"')
        end
    end
end

-- Command handlers
local commands = {
    ping = function(data)
        return {
            success = true,
            message = "pong"
        }
    end,
    
    get_timeline_state = function(data)
        return timeline_commands.get_timeline_state(data)
    end,
    
    sync_to_reaper = function(data)
        return timeline_commands.sync_to_reaper(data)
    end,
    
    create_chord_track = function(data)
        if chords_commands.create_chord_track then
            return chords_commands.create_chord_track(data)
        else
            return {
                success = false,
                error = "Chord track creation not available (module not loaded)"
            }
        end
    end
}

-- Handle request
local function handle_request(request_body)
    local ok, request = pcall(json.decode, request_body)
    if not ok or not request then
        return json.encode({
            success = false,
            error = "Invalid JSON request"
        })
    end
    
    local command_name = request.command
    if not command_name then
        return json.encode({
            success = false,
            error = "Missing 'command' field"
        })
    end
    
    local handler = commands[command_name]
    if not handler then
        return json.encode({
            success = false,
            error = "Unknown command: " .. tostring(command_name)
        })
    end
    
    -- Execute command with error handling
    local ok, result = pcall(handler, request)
    if not ok then
        reaper.ShowConsoleMsg("TrackDraft Bridge Error: " .. tostring(result) .. "\n")
        return json.encode({
            success = false,
            error = "Command execution failed: " .. tostring(result)
        })
    end
    
    return json.encode(result)
end

-- Update heartbeat
local function update_heartbeat()
    local file = io.open(HEARTBEAT_FILE, "w")
    if file then
        file:write(tostring(os.time()))
        file:close()
    end
end

-- Main loop
local running = false
local last_heartbeat = 0

local function main_loop()
    if not running then
        return
    end
    
    -- Update heartbeat every 2 seconds
    local now = reaper.time_precise()
    if now - last_heartbeat > 2 then
        update_heartbeat()
        last_heartbeat = now
    end
    
    -- Check for requests
    local file = io.open(REQUEST_FILE, "r")
    if file then
        local request_body = file:read("*all")
        file:close()
        
        if request_body and #request_body > 0 then
            -- Process request
            local response_body = handle_request(request_body)
            
            -- Write response
            local resp_file = io.open(RESPONSE_FILE, "w")
            if resp_file then
                resp_file:write(response_body)
                resp_file:close()
            end
            
            -- Delete request file
            os.remove(REQUEST_FILE)
        end
    end
    
    -- Schedule next iteration
    reaper.defer(main_loop)
end

-- Start bridge
local function start_bridge()
    if running then
        return
    end
    
    -- Ensure IPC directory exists
    ensure_ipc_dir()
    
    -- Clean up old files
    os.remove(REQUEST_FILE)
    os.remove(RESPONSE_FILE)
    
    running = true
    
    -- Start timeline monitoring
    if start_monitoring then
        start_monitoring()
    end
    
    -- Update initial heartbeat
    update_heartbeat()
    
    reaper.ShowConsoleMsg("TrackDraft Bridge (IPC): Running\n")
    reaper.ShowConsoleMsg("IPC Directory: " .. IPC_DIR .. "\n")
    reaper.ShowConsoleMsg("Make sure the Node.js bridge server is running!\n")
    reaper.ShowConsoleMsg("Run: node reaper-bridge/bridge-server.js\n")
    
    -- Start main loop
    main_loop()
    
    return true
end

-- Stop bridge
local function stop_bridge()
    running = false
    os.remove(REQUEST_FILE)
    os.remove(RESPONSE_FILE)
    os.remove(HEARTBEAT_FILE)
    reaper.ShowConsoleMsg("TrackDraft Bridge: Stopped\n")
end

-- Initialize
start_bridge()

-- Note: Bridge runs in background using reaper.defer()
-- To stop, user must reload the script or close Reaper

