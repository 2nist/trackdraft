# Reaper Bridge - Bidirectional Sync Implementation

This directory contains the Lua scripts for the Reaper side of the TrackDraft bridge.

## Architecture

The Reaper bridge provides bidirectional sync between TrackDraft (Electron app) and Reaper (DAW).

### Change Detection System

```
┌─────────────────────────────────────┐
│         TRACKDRAFT                  │
│                                     │
│  Structure State (Local)            │
│  ├─ sections[]                      │
│  ├─ lastModified                    │
│  └─ syncVersion                     │
│                                     │
│  Change Detection:                  │
│  • User edits → Update local state  │
│  • Send to Reaper immediately       │
│  • Poll Reaper every 2s for changes │
└──────────────┬──────────────────────┘
               │
               │ HTTP/WebSocket
               │
┌──────────────▼──────────────────────┐
│         REAPER BRIDGE               │
│                                     │
│  Timeline State (Canonical)         │
│  ├─ markers[] (from Reaper)         │
│  ├─ lastModified                    │
│  └─ syncVersion                     │
│                                     │
│  Change Detection:                  │
│  • Monitor marker changes           │
│  • Compute diff on request          │
│  • Send changes to TrackDraft       │
└─────────────────────────────────────┘
```

## Files

- `lib/commands/timeline.lua` - Timeline change detection and sync commands
- `reaper_bridge.lua` - Main HTTP server and command router (to be implemented)
- `the_environment_setup.lua` - Track template setup
- `THE_ENVIRONMENT.RTrackTemplate` - Reaper template file

## Timeline Commands

### `get_timeline_state`

Returns the current timeline state from Reaper.

**Request:**
```json
{
  "command": "get_timeline_state",
  "lastSyncVersion": 0
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "state": {
      "syncVersion": 5,
      "lastModified": "2024-01-01T12:00:00Z",
      "sections": [
        {
          "id": "abc123",
          "name": "Verse 1",
          "startTime": 0.0,
          "endTime": 8.0,
          "bars": 8,
          "tempo": 120,
          "key": 0,
          "color": 8421504,
          "modifiedInReaper": false
        }
      ]
    },
    "hasChanges": true
  }
}
```

### `sync_to_reaper`

Syncs sections from TrackDraft to Reaper.

**Request:**
```json
{
  "command": "sync_to_reaper",
  "sections": [
    {
      "id": "abc123",
      "name": "Verse 1",
      "bars": 8,
      "tempo": 120,
      "key": 0,
      "startTime": 0.0,
      "endTime": 8.0,
      "color": 8421504
    }
  ],
  "syncVersion": 4,
  "conflictResolution": "trackdraft-wins"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "syncVersion": 6,
    "conflicts": []
  }
}
```

## Sync Version System

The sync version increments whenever the timeline changes in Reaper:
- User moves a marker/region
- User adds/removes markers
- TrackDraft syncs changes

Each sync operation includes the sync version to detect conflicts.

## Change Detection

### Monitoring

The bridge monitors timeline changes every 2 seconds by:
1. Checking marker count
2. Comparing marker positions with cached values
3. Incrementing sync version on changes

### Conflict Detection

Conflicts occur when:
- TrackDraft sync version < Reaper sync version
- Both sides have uncommitted changes

Resolution strategies:
- `trackdraft-wins`: Overwrite Reaper with TrackDraft state
- `reaper-wins`: Keep Reaper state, return to TrackDraft

## Installation

1. Copy `reaper-bridge/` directory to your Reaper Scripts folder
2. Load `reaper_bridge.lua` in Reaper (Actions → Load)
3. Start the HTTP server
4. TrackDraft will connect automatically

## Integration with TrackDraft

TrackDraft's TypeScript bridge service (`src/lib/reaper-bridge.ts`) communicates with this Lua implementation via HTTP POST requests to `http://127.0.0.1:8888`.

See TrackDraft documentation for client-side implementation details.

