# TrackDraft Reaper Bridge

Lua server implementation for bidirectional synchronization between TrackDraft (Electron app) and Reaper DAW.

## Prerequisites

- Reaper DAW (v6.0+)
- LuaSocket library
- dkjson library

### Installing LuaSocket

**Windows:**
1. Download LuaSocket from https://github.com/diegonehab/luasocket/releases
2. Extract to Reaper's Lua directory:
   - `%APPDATA%\REAPER\Scripts\` (user scripts)
   - OR `C:\Program Files\REAPER\Scripts\` (system-wide)
3. Ensure `socket` folder and `socket.lua`, `ltn12.lua`, `mime.lua` are present

**Mac:**
```bash
# Using Homebrew
brew install luarocks
luarocks install luasocket

# Or manually download from GitHub releases
```

**Linux:**
```bash
sudo apt install lua-socket
# or
sudo yum install lua-socket
```

### Installing dkjson

1. Download `dkjson.lua` from: http://dkolf.de/src/dkjson-lua.fsl/home
2. Copy the entire contents of `dkjson.lua` into `reaper-bridge/lib/json.lua`
   - Replace the placeholder code with the actual dkjson library code
   - The file should contain the complete dkjson implementation

## Installation

1. Copy the entire `reaper-bridge/` folder to your Reaper Scripts directory:
   - **Windows:** `%APPDATA%\REAPER\Scripts\TrackDraft\`
   - **Mac:** `~/Library/Application Support/REAPER/Scripts/TrackDraft/`
   - **Linux:** `~/.config/REAPER/Scripts/TrackDraft/`

   The structure should be:
   ```
   Scripts/TrackDraft/
   ├── reaper_bridge.lua
   └── lib/
       ├── json.lua (dkjson contents)
       └── commands/
           └── timeline.lua
   ```

2. In Reaper:
   - Actions → Show action list
   - New action... → Load ReaScript...
   - Navigate to and select `reaper_bridge.lua`
   - Click "Run" or assign a keyboard shortcut

3. Verify it's running:
   - Open Reaper Console (View → Show Console)
   - You should see: `TrackDraft Bridge: Listening on port 8888`

4. (Optional) Add to Reaper startup:
   - Actions → Set action to run on startup
   - Select "TrackDraft Bridge"

## Usage

Once the bridge is running, TrackDraft can connect automatically. The bridge:

- Listens on `http://127.0.0.1:8888`
- Responds to commands from TrackDraft
- Monitors timeline changes in Reaper
- Syncs markers/regions between TrackDraft and Reaper

## Protocol

### Commands

#### `ping`
Test connectivity.

**Request:**
```json
{ "command": "ping" }
```

**Response:**
```json
{ "success": true, "message": "pong" }
```

#### `get_timeline_state`
Get current timeline state from Reaper.

**Request:**
```json
{
  "command": "get_timeline_state",
  "lastSyncVersion": 5
}
```

**Response:**
```json
{
  "success": true,
  "state": {
    "syncVersion": 7,
    "lastModified": "2025-01-20T10:30:00Z",
    "sections": [
      {
        "id": "verse1",
        "name": "Verse",
        "startTime": 0.0,
        "endTime": 16.0,
        "bars": 8,
        "tempo": 120,
        "key": 0,
        "color": 8441665,
        "modifiedInReaper": false
      }
    ]
  },
  "changes": []
}
```

#### `sync_to_reaper`
Sync sections from TrackDraft to Reaper.

**Request:**
```json
{
  "command": "sync_to_reaper",
  "syncVersion": 5,
  "conflictResolution": "trackdraft-wins",
  "sections": [
    {
      "id": "verse1",
      "name": "Verse",
      "startTime": 0.0,
      "endTime": 16.0,
      "bars": 8,
      "tempo": 120,
      "key": 0,
      "color": 8441665
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "syncVersion": 8,
  "conflicts": []
}
```

## Marker Naming Convention

TrackDraft markers in Reaper use the format:
```
TD_{section_id}_{section_name}
```

Examples:
- `TD_verse1_Verse`
- `TD_chorus1_Chorus`
- `TD_bridge1_Bridge`

All TrackDraft markers start with `TD_` prefix. Only regions (not point markers) are used.

## Sync Version System

The bridge maintains a sync version number that increments whenever:
- Sections are synced from TrackDraft
- Markers are moved/resized in Reaper
- Markers are added/removed

TrackDraft includes its sync version when syncing, allowing conflict detection.

## Conflict Resolution

When TrackDraft's sync version is behind Reaper's:
- `trackdraft-wins` (default): Overwrite Reaper state
- `reaper-wins`: Keep Reaper state, return conflicts

## Change Detection

The bridge monitors timeline changes every 2 seconds:
- Detects marker count changes
- Detects position/end time changes
- Increments sync version on changes
- Returns `modifiedInReaper: true` for changed sections

## Troubleshooting

### "LuaSocket not found"
- Install LuaSocket (see Prerequisites)
- Ensure it's in Reaper's Lua path
- Restart Reaper after installation

### "JSON library not found"
- Download dkjson.lua
- Copy its contents into `lib/json.lua`
- Ensure the file contains the complete dkjson code

### "Failed to bind to port 8888"
- Another instance of the bridge may be running
- Close other Reaper instances
- Check if another application is using port 8888

### Markers not appearing
- Check Reaper Console for errors
- Verify the bridge is running
- Ensure TrackDraft is connected
- Check that sections have valid IDs and names

### Changes not detected
- Wait 2 seconds after making changes (polling interval)
- Check that markers use `TD_` prefix
- Verify sync version is incrementing in console

## Architecture

```
┌─────────────────────┐
│    TRACKDRAFT       │
│   (Electron App)    │
│                     │
│  HTTP POST          │
│  127.0.0.1:8888     │
└──────────┬──────────┘
           │
           │ JSON Commands
           │
┌──────────▼──────────┐
│  REAPER BRIDGE      │
│  (Lua Server)       │
│                     │
│  - TCP/HTTP Server  │
│  - Command Router   │
│  - Timeline Monitor │
└──────────┬──────────┘
           │
           │ Reaper API
           │
┌──────────▼──────────┐
│      REAPER         │
│   (DAW)             │
│                     │
│  - Markers/Regions  │
│  - Timeline State   │
└─────────────────────┘
```

## Files

- `reaper_bridge.lua` - Main HTTP server and command router
- `lib/commands/timeline.lua` - Timeline operations and change detection
- `lib/json.lua` - JSON encoder/decoder (dkjson library)

## Development

To modify the bridge:

1. Edit Lua files in `reaper-bridge/`
2. Reload script in Reaper (Actions → Load ReaScript)
3. Check console for errors
4. Test with TrackDraft client

## License

See TrackDraft project license.