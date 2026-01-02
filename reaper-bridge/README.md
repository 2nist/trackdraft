# TrackDraft Reaper Bridge (Optional Feature)

Node.js-based bridge for bidirectional synchronization between TrackDraft and Reaper DAW.

**⚠️ IMPORTANT: This is an OPTIONAL feature. TrackDraft works completely without it.** This bridge only adds Reaper DAW integration capabilities. If you don't use Reaper or don't need this integration, you can ignore this entire directory.

## Quick Start

**For setup instructions, see `ALTERNATIVE_SETUP.md`** - this is the recommended approach for all users (Windows, Mac, Linux).

## Prerequisites

- **Reaper DAW** (v6.0+)
- **Node.js** (v14 or higher)
- **dkjson library** for Lua

### Installing dkjson

1. Download `dkjson.lua` from: http://dkolf.de/src/dkjson-lua.fsl/home
2. Copy the entire contents of `dkjson.lua` into `reaper-bridge/lib/json.lua`
   - Replace the placeholder code with the actual dkjson library code
   - The file should contain the complete dkjson implementation

## Installation

**For detailed setup instructions, see `ALTERNATIVE_SETUP.md`**

Quick overview:
1. Copy the `reaper-bridge/` folder to your Reaper Scripts directory
2. Start the Node.js bridge server: `npm run bridge`
3. Load `reaper_bridge_ipc.lua` in Reaper
4. TrackDraft will connect automatically

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

### "JSON library not found"
- Download dkjson.lua
- Copy its contents into `lib/json.lua`
- Ensure the file contains the complete dkjson code

### "Failed to connect to Reaper"
- Make sure the Node.js bridge server is running (`npm run bridge`)
- Verify `reaper_bridge_ipc.lua` is loaded in Reaper
- Check if port 8888 is available

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

- `bridge-server.js` - Node.js HTTP server
- `reaper_bridge_ipc.lua` - Reaper script for IPC communication
- `lib/commands/timeline.lua` - Timeline operations and change detection
- `lib/commands/chords.lua` - Chord operations
- `lib/json.lua` - JSON encoder/decoder (dkjson library)
- `ALTERNATIVE_SETUP.md` - Detailed setup instructions

## Development

To modify the bridge:

1. Edit Lua files in `reaper-bridge/`
2. Reload script in Reaper (Actions → Load ReaScript)
3. Check console for errors
4. Test with TrackDraft client

## License

See TrackDraft project license.