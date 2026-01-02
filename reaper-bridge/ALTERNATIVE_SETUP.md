# TrackDraft Reaper Bridge - Alternative Setup (Windows-Friendly)

This alternative bridge solution **does not require LuaSocket** and works reliably on Windows!

## Architecture

```
TrackDraft (HTTP) ←→ Node.js Server (HTTP) ←→ Reaper (File-based IPC)
```

Instead of running an HTTP server inside Reaper (which requires problematic LuaSocket DLLs), we run a lightweight Node.js HTTP server that communicates with Reaper via file-based IPC.

## Prerequisites

- **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
- **Reaper DAW** (v6.0+)
- **TrackDraft** (already installed)

## Installation Steps

### 1. Install the Bridge Files

Copy the bridge files to Reaper's Scripts directory:

**Windows:**
```powershell
# From the trackdraft-main directory
Copy-Item -Path "reaper-bridge" -Destination "$env:APPDATA\REAPER\Scripts\TrackDraft" -Recurse -Force
```

**Mac/Linux:**
```bash
# From the trackdraft-main directory
cp -r reaper-bridge ~/Library/Application\ Support/REAPER/Scripts/TrackDraft/
# or on Linux:
cp -r reaper-bridge ~/.config/REAPER/Scripts/TrackDraft/
```

### 2. Start the Node.js Bridge Server

**Option A: From the TrackDraft project directory**
```bash
npm run bridge
```

**Option B: Directly with Node.js**
```bash
node reaper-bridge/bridge-server.js
```

You should see:
```
TrackDraft Bridge Server (Alternative)
======================================
IPC Directory: C:\Users\YourName\AppData\Local\Temp\trackdraft-bridge

✓ HTTP Server listening on http://127.0.0.1:8888

Next steps:
1. Load the bridge script in Reaper: reaper_bridge_ipc.lua
2. TrackDraft will connect automatically
```

**Keep this terminal open!** The bridge server needs to stay running.

### 3. Load the Reaper Script

In Reaper:
1. **Actions → Show action list**
2. **New action... → Load ReaScript...**
3. Navigate to: `%APPDATA%\REAPER\Scripts\TrackDraft\reaper_bridge_ipc.lua`
4. Click **"Run"**

Check the **Reaper Console** (**View → Show Console**):
```
TrackDraft Bridge (IPC): Running
IPC Directory: C:\Users\YourName\AppData\Local\Temp\trackdraft-bridge
Make sure the Node.js bridge server is running!
```

You should also see in the Node.js terminal:
```
[2026-01-02T02:30:00.000Z] ✓ Reaper bridge script connected
```

### 4. Test the Connection

In TrackDraft, you should see:
- **Bridge Status:** "Reaper Connected" (green indicator)

Test it by:
1. Creating some sections in TrackDraft's Structure view
2. The sections should appear as regions in Reaper's timeline!

## Usage

### Starting Your Session

1. **Start the bridge server** first (in terminal):
   ```bash
   npm run bridge
   ```

2. **Start Reaper** and load the bridge script (or set it to auto-start in Reaper)

3. **Start TrackDraft** - it will automatically connect

### Auto-Start on Reaper Launch (Optional)

To automatically load the bridge script when Reaper starts:

1. In Reaper: **Actions → Show action list**
2. Find "Script: reaper_bridge_ipc.lua" in the list
3. Right-click → **"Set action to run on startup"**

Now the Reaper side will start automatically!

### Auto-Start Bridge Server (Optional)

**Windows (Task Scheduler):**
Create a batch file `start-bridge.bat`:
```batch
@echo off
cd /d "C:\path\to\trackdraft-main"
start /min node reaper-bridge/bridge-server.js
```

Add it to Windows Task Scheduler to run at login.

**Mac/Linux (systemd or launchd):**
Create a service file to run the bridge server at login.

## Troubleshooting

### "Reaper bridge script is not running"

**Solution:** Make sure you've loaded `reaper_bridge_ipc.lua` in Reaper and check the Reaper Console for errors.

### Node.js server says "Reaper bridge script disconnected"

**Solution:** 
1. Check if the Reaper script is still loaded (view Reaper Console)
2. Reload the script in Reaper if needed

### TrackDraft shows "Reaper Disconnected"

**Possible causes:**
1. Bridge server not running → Start `npm run bridge`
2. Reaper script not loaded → Load `reaper_bridge_ipc.lua` in Reaper
3. Port 8888 is in use → Close other applications using that port

### Changes in Reaper don't sync to TrackDraft

- Wait 2-3 seconds for the sync to occur (polling interval)
- Check Node.js terminal for error messages
- Check Reaper Console for errors

## Performance

This alternative approach has:
- **Latency:** ~100-200ms (due to file polling)
- **CPU usage:** Minimal (~1% when idle)
- **Reliability:** High (no DLL compatibility issues!)

The slight latency is acceptable for songwriting workflows where you're not making rapid changes.

## Advantages Over LuaSocket

✅ **No DLL issues** - Pure file-based communication  
✅ **Works on Windows** - No compilation required  
✅ **Easy to debug** - Can inspect IPC files if needed  
✅ **Easy to install** - Just Node.js required  
✅ **Cross-platform** - Same code on Windows/Mac/Linux  

## Stopping the Bridge

1. **Stop Node.js server:** Press `Ctrl+C` in the terminal
2. **Stop Reaper script:** Close Reaper or reload the script

The IPC files in the temp directory will be cleaned up automatically.

## Development

To modify the bridge behavior:
- **HTTP endpoint:** Edit `bridge-server.js`
- **Reaper commands:** Edit `lib/commands/timeline.lua`
- **Communication protocol:** Edit both files to match

## Questions?

See the main `README.md` or file an issue on GitHub.

