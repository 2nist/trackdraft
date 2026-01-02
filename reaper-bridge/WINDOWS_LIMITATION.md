# TrackDraft Reaper Bridge - Windows Limitation

## The Problem

The TrackDraft Reaper bridge requires **LuaSocket** to create an HTTP server inside Reaper. On Windows, this requires:
- `socket.lua` (installed ✅)
- `socket/core.dll` (installed ❌ - wrong version)

The `core.dll` file **must be compiled for the exact Lua version that Reaper uses**. Reaper for Windows uses **Lua 5.3 or 5.4**, but finding or compiling compatible Windows DLLs is difficult.

## Current Status

❌ **Bridge is NOT working** - The DLL we have is likely compiled for a different Lua version or missing dependencies.

## Solutions

### Option 1: Manual Installation (Advanced Users)

If you're comfortable compiling C code:

1. **Find out Reaper's Lua version:**
   - In Reaper Console: Run a script with `print(_VERSION)`
   
2. **Download LuaSocket source:**
   - https://github.com/lunarmodules/luasocket

3. **Compile for your Lua version:**
   - Requires MinGW or Visual Studio
   - Must compile against Reaper's Lua headers
   - Generate `socket/core.dll` and `mime/core.dll`

4. **Copy DLLs to:** `%APPDATA%\REAPER\Scripts\socket\`

### Option 2: Use TrackDraft Without Bridge (Recommended)

TrackDraft works **completely standalone** without the Reaper bridge:

✅ **Full songwriting features:**
- Chord progression builder with hexagonal wheel
- Structure visualization and templates
- Lyrics editor with rhyme detection
- Harmony analysis and suggestions

✅ **Export/Import workflow:**
1. Build your song in TrackDraft
2. Export structure as MIDI/JAMS
3. Import into Reaper manually
4. Continue production in Reaper

The bridge is **optional** - it only adds:
- Live sync of sections/markers
- Bidirectional timeline updates
- Real-time playback sync

**Most users don't need the bridge for productive songwriting!**

### Option 3: Linux/Mac Users

The bridge works better on Linux/Mac where LuaSocket is easier to install:

**Linux:**
```bash
sudo apt install lua-socket
```

**Mac:**
```bash
brew install luarocks
luarocks install luasocket
```

Then follow the setup instructions in `README.md`.

### Option 4: External Bridge Server (Future)

We could create a standalone HTTP server that:
- Runs outside Reaper as a separate process
- Reaper communicates with it via Reaper's built-in HTTP functions
- Acts as a bridge between TrackDraft and Reaper

This would avoid the LuaSocket dependency but requires additional development.

## Recommendation

**For Windows users: Use TrackDraft standalone without the bridge.**

The bridge is a nice-to-have feature, but TrackDraft's core songwriting tools work perfectly without it. Export your arrangements when ready and import them into Reaper manually.

## Questions?

File an issue on GitHub or contact the TrackDraft team for support.

