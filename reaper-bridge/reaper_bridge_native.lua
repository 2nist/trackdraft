-- ========================================
-- TrackDraft Reaper Bridge Server (Native HTTP)
-- HTTP server using Reaper's built-in defer for polling
-- NO LuaSocket required!
-- ========================================

-- Check for JSON library (dkjson)
local json_ok, json = pcall(function()
    -- Strategy 1: Try require("json")
    local ok, json_mod = pcall(require, "json")
    if ok then return json_mod end
    
    -- Strategy 2: Try loading from relative path
    local function try_relative()
        local ok, json_mod = pcall(dofile, "lib/json.lua")
        if ok then return json_mod end
    end
    
    -- Strategy 3: Try absolute path
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
    
    -- Strategy 4: Try resource path
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

-- Server configuration
local PORT = 8888
local running = false

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
    end
}

-- Handle HTTP request
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

-- Use Reaper's built-in HTTP request file monitoring
-- This is a workaround since we can't use LuaSocket
local request_file = reaper.GetResourcePath() .. "/TrackDraft_request.txt"
local response_file = reaper.GetResourcePath() .. "/TrackDraft_response.txt"

-- Main server loop using file-based communication
local function server_loop()
    if not running then
        return
    end
    
    -- Check if there's a new request file
    local file = io.open(request_file, "r")
    if file then
        local request_body = file:read("*all")
        file:close()
        
        if request_body and #request_body > 0 then
            -- Process request
            local response_body = handle_request(request_body)
            
            -- Write response
            local resp_file = io.open(response_file, "w")
            if resp_file then
                resp_file:write(response_body)
                resp_file:close()
            end
            
            -- Delete request file to signal completion
            os.remove(request_file)
        end
    end
    
    -- Schedule next iteration
    reaper.defer(server_loop)
end

-- Start server
local function start_server()
    if running then
        return
    end
    
    running = true
    
    -- Clean up any existing request/response files
    os.remove(request_file)
    os.remove(response_file)
    
    -- Start timeline monitoring
    if start_monitoring then
        start_monitoring()
    end
    
    reaper.ShowConsoleMsg("TrackDraft Bridge: Running in file-based mode\n")
    reaper.ShowConsoleMsg("Note: This uses file-based communication instead of HTTP\n")
    reaper.ShowConsoleMsg("TrackDraft needs to be configured for file-based bridge mode\n")
    
    -- Start main loop
    reaper.defer(server_loop)
    
    return true
end

-- Stop server
local function stop_server()
    running = false
    os.remove(request_file)
    os.remove(response_file)
    reaper.ShowConsoleMsg("TrackDraft Bridge: Server stopped\n")
end

-- Initialize
local function init()
    reaper.ShowMessageBox(
        "TrackDraft Bridge - File-Based Mode\n\n" ..
        "This version uses file-based communication instead of HTTP/LuaSocket.\n\n" ..
        "Unfortunately, Reaper's Lua doesn't have a way to create a true HTTP server without LuaSocket.\n\n" ..
        "Options:\n" ..
        "1. Install compatible LuaSocket DLLs (difficult on Windows)\n" ..
        "2. Use TrackDraft's export/import features instead of live sync\n" ..
        "3. Run a separate HTTP bridge server outside of Reaper\n\n" ..
        "For now, the bridge features will not work.",
        "TrackDraft Bridge - Limited Mode",
        0
    )
end

-- Start the server
init()

