-- ========================================
-- TrackDraft Reaper Bridge Server
-- HTTP server for bidirectional sync between TrackDraft and Reaper
-- ========================================

-- Check for LuaSocket
-- Add Reaper Scripts directory to package.path if not already there
local reaper_scripts = reaper.GetResourcePath() .. "/Scripts"
if not string.find(package.path, reaper_scripts, 1, true) then
    package.path = package.path .. ";" .. reaper_scripts .. "/?.lua"
    -- Critical: Add the pattern that translates socket.core to socket/core.dll
    package.cpath = package.cpath .. ";" .. reaper_scripts .. "/?/?.dll"
    package.cpath = package.cpath .. ";" .. reaper_scripts .. "/?.dll"
end

local socket_ok, socket = pcall(require, "socket")
if not socket_ok then
    reaper.ShowMessageBox(
        "LuaSocket not found!\n\n" ..
        "Please install LuaSocket to use the TrackDraft bridge.\n\n" ..
        "package.cpath: " .. package.cpath .. "\n\n" ..
        "Error: " .. tostring(socket),
        "TrackDraft Bridge Error",
        0
    )
    return
end

-- Check for JSON library (dkjson)
-- Try multiple loading strategies
local json_ok, json = pcall(function()
    -- Strategy 1: Try require("json") - if json.lua exists with dkjson contents
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

-- Make JSON module globally available for timeline.lua
package.loaded["json"] = json
_G.json = json

-- Load timeline commands module
-- Try multiple path strategies
local timeline_ok, timeline_module = pcall(function()
    -- Strategy 1: Try relative path (if script is in TrackDraft folder)
    local function try_relative()
        local ok, module = pcall(dofile, "lib/commands/timeline.lua")
        if ok then return module end
    end
    
    -- Strategy 2: Try absolute path from script location
    local function try_absolute()
        local script_path = debug.getinfo(1, "S").source
        if script_path:match("^@") then
            script_path = script_path:sub(2)  -- Remove @ prefix
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
    
    -- Strategy 3: Try resource path
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
local server = nil
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

-- HTTP request handler
local function handle_http(client)
    local request = ""
    local content_length = 0
    local body_received = false
    local headers_received = false
    
    -- Read headers
    while not headers_received do
        local line, err = client:receive("*l")
        if not line then
            if err == "closed" then
                return
            end
            return
        end
        
        if line == "" then
            headers_received = true
        else
            request = request .. line .. "\r\n"
            
            -- Extract Content-Length
            local cl = line:match("Content%-Length:%s*(%d+)")
            if cl then
                content_length = tonumber(cl) or 0
            end
        end
    end
    
    -- Read body
    if content_length > 0 then
        local body, err = client:receive(content_length)
        if not body then
            return
        end
        request = body
    end
    
    -- Handle request
    local response_body = handle_request(request)
    
    -- Send HTTP response
    local response = "HTTP/1.1 200 OK\r\n"
    response = response .. "Content-Type: application/json\r\n"
    response = response .. "Content-Length: " .. #response_body .. "\r\n"
    response = response .. "Access-Control-Allow-Origin: *\r\n"
    response = response .. "\r\n"
    response = response .. response_body
    
    client:send(response)
    client:close()
end

-- Main server loop
local function server_loop()
    if not running then
        return
    end
    
    if server then
        -- Check for incoming connections (non-blocking)
        server:settimeout(0.01)  -- 10ms timeout
        local client = server:accept()
        
        if client then
            client:settimeout(5)  -- 5 second timeout for request handling
            local ok, err = pcall(handle_http, client)
            if not ok then
                reaper.ShowConsoleMsg("TrackDraft Bridge: Error handling request: " .. tostring(err) .. "\n")
                pcall(client.close, client)
            end
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
    
    -- Create TCP server
    server = socket.tcp()
    server:setoption("reuseaddr", true)
    server:settimeout(0.01)  -- Non-blocking
    
    local ok, err = server:bind("127.0.0.1", PORT)
    if not ok then
        reaper.ShowMessageBox(
            "Failed to bind to port " .. PORT .. "!\n\n" ..
            "Error: " .. tostring(err) .. "\n\n" ..
            "Another instance may be running, or the port is in use.",
            "TrackDraft Bridge Error",
            0
        )
        return false
    end
    
    ok, err = server:listen(5)  -- Allow up to 5 pending connections
    if not ok then
        reaper.ShowMessageBox(
            "Failed to listen on port " .. PORT .. "!\n\n" ..
            "Error: " .. tostring(err),
            "TrackDraft Bridge Error",
            0
        )
        return false
    end
    
    running = true
    
    -- Start timeline monitoring
    if start_monitoring then
        start_monitoring()
    end
    
    reaper.ShowConsoleMsg("TrackDraft Bridge: Listening on port " .. PORT .. "\n")
    
    -- Start main loop
    reaper.defer(server_loop)
    
    return true
end

-- Stop server
local function stop_server()
    running = false
    if server then
        server:close()
        server = nil
    end
    reaper.ShowConsoleMsg("TrackDraft Bridge: Server stopped\n")
end

-- Initialize
local function init()
    local ok = start_server()
    if ok then
        reaper.ShowConsoleMsg("TrackDraft Bridge: Started successfully\n")
    end
end

-- Start the server
init()

-- Note: Server runs in background using reaper.defer()
-- To stop, user must reload the script or close Reaper
