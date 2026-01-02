# LuaSocket Windows Setup for Reaper

## Current Status

✅ **Done:**
- Copied `socket.lua`, `ltn12.lua`, and `mime.lua` to `%APPDATA%\REAPER\Scripts\`

❌ **Still Needed:**
- The `socket/` folder with compiled DLL files (core.dll, mime.dll, etc.)

## The Problem

You extracted the **source code** release (`luasocket-3.1.0.zip`), which contains:
- ✅ Lua source files (`.lua` files) - **These are now in the correct location**
- ❌ Compiled DLL files (`.dll` files) - **These are missing and required**

Reaper needs pre-built Windows DLL files to use LuaSocket. The source code release doesn't include these.

## Solution: Get Pre-built Windows Binaries

You need to find a LuaSocket release that includes pre-built Windows DLL files. Here are your options:

### Option 1: Find an Older Release with Windows Binaries
1. Visit: https://github.com/diegonehab/luasocket/releases
2. Look for older releases (before 3.1.0) that include Windows ZIP files
3. Look for files named something like:
   - `luasocket-X.X.X-WIN32.zip`
   - `luasocket-X.X.X-win32.zip`
   - `luasocket-X.X.X-windows.zip`
4. Download and extract that ZIP file
5. Copy the `socket/` folder (containing DLL files) to `%APPDATA%\REAPER\Scripts\socket\`

### Option 2: Compile from Source (Advanced)
If you have Visual Studio or MinGW installed, you can compile the source code:
1. The source includes build files: `win32.cmd`, `win64.cmd`, `vc32.bat`, `vc64.bat`
2. Run the appropriate build script for your system
3. Copy the resulting DLL files to `%APPDATA%\REAPER\Scripts\socket\`

### Option 3: Use a Third-Party Pre-built Package
Some Reaper communities or forums may have pre-built LuaSocket packages for Windows.

## Required File Structure

After installation, your `%APPDATA%\REAPER\Scripts\` directory should contain:

```
Scripts/
├── socket.lua          ✅ (already installed)
├── ltn12.lua           ✅ (already installed)
├── mime.lua            ✅ (already installed)
└── socket/             ❌ (MISSING - needs DLL files)
    ├── core.dll        ❌
    ├── mime.dll        ❌
    └── (other .dll files)
```

## Verification

Once you have the `socket/` folder with DLL files:

1. Open Reaper
2. Try to load the TrackDraft bridge script
3. Check Reaper's console (View → Show Console)
4. If LuaSocket loads correctly, you should see: `TrackDraft Bridge: Listening on port 8888`
5. If you see "LuaSocket not found", the DLL files are still missing or in the wrong location

## Note

The `luasocket-3.1.0` folder you extracted can be deleted once you have the pre-built binaries, as the `.lua` files have been moved to the correct location.

