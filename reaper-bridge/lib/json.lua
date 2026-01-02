-- JSON Library Wrapper
-- This file should contain the dkjson library code
-- Download dkjson.lua from: http://dkolf.de/src/dkjson-lua.fsl/home
-- Copy the contents of dkjson.lua into this file

-- For now, this is a placeholder that will attempt to load dkjson
-- Users should replace this file with the actual dkjson.lua contents

local function load_json()
    -- Try to load as module first
    local ok, json = pcall(require, "dkjson")
    if ok then
        return json
    end
    
    -- Try to load json module
    ok, json = pcall(require, "json")
    if ok then
        return json
    end
    
    -- If dkjson.lua is in the same directory, try to load it directly
    -- This requires the actual dkjson code to be in this file
    error("dkjson library not found. Please download dkjson.lua and place its contents in lib/json.lua")
end

return load_json()
