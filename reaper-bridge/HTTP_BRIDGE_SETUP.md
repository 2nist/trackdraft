# TrackDraft HTTP REAPER Bridge Setup Guide

**Live Integration with REAPER via Built-in Web Interface**

## Overview

This bridge allows TrackDraft to communicate **directly** with a running REAPER instance using REAPER's built-in HTTP web interface. No additional server software is required!

### Features
- ✅ **Real-time communication** with REAPER
- ✅ **Export song structure** (markers, regions, chords)
- ✅ **Transport control** (play, pause, stop, record)
- ✅ **Live playback sync** (position tracking)
- ✅ **No bridge server** required - uses REAPER's native HTTP API
- ✅ **Cross-platform** (Windows, macOS, Linux)

---

## Setup Instructions

### Step 1: Enable REAPER's Web Interface

1. **Open REAPER**
2. Go to `Options → Preferences → Control/OSC/Web`
3. Click **`Add`** → **`Web Browser Interface`**
4. Configure the settings:
   - **Interface**: Default web interface (or custom)
   - **Port**: `8080` (or choose another available port)
   - **Username/Password**: *(Optional but recommended)*
     - Example: `trackdraft` / `yourpassword`
   - Click **`OK`** to enable

5. **Verify it's working**:
   - Open your web browser
   - Go to `http://localhost:8080`
   - You should see REAPER's web interface

### Step 2: Install TrackDraft Import Script (Optional)

The HTTP bridge stores song data in REAPER's extended state. To automatically process this data and create markers/regions, install the import script:

1. **Locate the script**:
   - Find `TrackDraft_HTTP_Import.lua` in the `reaper-bridge` folder

2. **Add to REAPER**:
   - In REAPER: `Actions → Show Action List`
   - Click **`New Action → Load ReaScript`**
   - Select `TrackDraft_HTTP_Import.lua`
   - *(Optional)* Assign a keyboard shortcut

3. **Usage**:
   - After exporting from TrackDraft, run this script in REAPER
   - It will create markers, regions, and a chord track

---

## Using the HTTP Bridge

### Step 3: Connect from TrackDraft

1. **Open TrackDraft**
2. Go to **`Settings`** tab
3. Scroll to **`REAPER Integration`** section
4. Click **`Configure Connection`**
5. Enter your connection details:
   - **Host**: `localhost` (or IP if remote)
   - **Port**: `8080` (or your custom port)
   - **Username**: *(if you set one)*
   - **Password**: *(if you set one)*
6. Click **`Connect to REAPER`**

### Step 4: Export Your Song

1. **Create a song** in TrackDraft with sections
2. In **Settings**, scroll to the REAPER Integration panel
3. Click **`Export to REAPER`**
4. The song structure will be sent to REAPER
5. **In REAPER**: Run the `TrackDraft HTTP Import` script to create markers/regions

---

## Complete Workflow

```
TrackDraft (Create Song)
          ↓
Add sections (Verse, Chorus, etc.)
          ↓
Add chords to each section
          ↓
Settings → REAPER Integration
          ↓
Connect to REAPER (HTTP connection)
          ↓
Export to REAPER (stores in extended state)
          ↓
REAPER → Run TrackDraft Import script
          ↓
Markers, Regions, and Chords created!
```

---

## Features

### 🎵 Song Structure Export
- **Markers**: Section start points (Verse 1, Chorus, etc.)
- **Regions**: Section boundaries with correct timing
- **Color Coding**:
  - Verse: Green
  - Chorus: Pink
  - Bridge: Orange
  - Intro/Outro: Blue/Purple

### 🎸 Chord Track
- Creates a dedicated "TrackDraft Chords" track
- Each chord displayed as a media item
- Chord names in item labels
- Green color coding for easy identification

### 🎮 Transport Control
- View REAPER's playback state
- Control playback from TrackDraft
- Live position tracking

### ⚙️ Technical Details
- Uses REAPER's native `/_/COMMAND` HTTP API
- Stores song data in project extended state
- Supports authentication for secure connections
- Automatic retry logic for reliability

---

## Troubleshooting

### Can't Connect to REAPER

**Problem**: "Failed to connect to REAPER" error

**Solutions**:
1. ✅ **Check REAPER web interface is enabled**:
   - Options → Preferences → Control/OSC/Web
   - Should show "Web Browser Interface" in the list
   - Port should be 8080 (or your custom port)

2. ✅ **Verify port is not blocked**:
   - Try accessing `http://localhost:8080` in your browser
   - If it doesn't load, the web interface isn't running

3. ✅ **Check firewall settings**:
   - Windows Firewall might block local HTTP connections
   - Add an exception for port 8080

4. ✅ **Try a different port**:
   - Change port in both REAPER and TrackDraft
   - Restart REAPER after changing settings

### Authentication Issues

**Problem**: Connection fails with 401 error

**Solutions**:
- Verify username/password match REAPER settings exactly
- Try without authentication first (leave fields empty in both)
- Check for special characters in password

### Export Succeeds but No Markers

**Problem**: Export completes but nothing appears in REAPER

**Solutions**:
- Run the `TrackDraft HTTP Import` script in REAPER
- Check if script is installed: Actions → Show Action List
- View extended state: Check if data is stored (`GetProjExtState`)

### Playback Position Not Updating

**Problem**: Transport state shows 0:00

**Solutions**:
- Disconnect and reconnect to REAPER
- Check if REAPER's web interface is responsive
- Try refreshing the connection

---

## Advanced Features

### Remote Connection

Connect to REAPER running on another computer:

1. **On REAPER machine**:
   - Note the IP address
   - Enable web interface with port 8080
   - Ensure firewall allows connections

2. **On TrackDraft machine**:
   - Use IP address instead of `localhost`
   - Example: `192.168.1.100:8080`

### Custom Scripts

Extend the Lua import script to:
- Create MIDI tracks with chord voicings
- Set up routing and effects
- Auto-arrange instruments
- Generate click tracks

### Automation Workflow

1. **Create in TrackDraft** (fast songwriting)
2. **Export to REAPER** (one click)
3. **Record in REAPER** (professional DAW)
4. **Mix and master** (production-ready)

---

## Comparison: HTTP Bridge vs Original Bridge

| Feature | HTTP Bridge | Original Bridge |
|---------|-------------|-----------------|
| **Setup Complexity** | ⭐ Simple | ⭐⭐⭐ Complex |
| **Dependencies** | None (REAPER only) | Node.js + Bridge Server |
| **Connection Method** | Direct HTTP | WebSocket via Node |
| **Platform Support** | All platforms | All platforms |
| **Reliability** | High | High |
| **Real-time Sync** | ✅ Yes | ✅ Yes |
| **Transport Control** | ✅ Yes | ✅ Yes |
| **Best For** | Simple integration | Advanced features |

**Recommendation**: Use HTTP Bridge for most users. It's simpler and works out of the box!

---

## Technical Reference

### HTTP API Commands Used
```
TRANSPORT           → Get transport state
1007               → Play
1008               → Pause
1016               → Stop
1013               → Record
MARKER_LIST        → Get all markers
REGION_LIST        → Get all regions
SET/PROJEXTSTATE   → Store data
GET/PROJEXTSTATE   → Retrieve data
SET/UNDO_BEGINBLOCK → Start undo group
SET/UNDO_ENDBLOCK   → End undo group
```

### Extended State Keys
```
Section: "TrackDraft"
Keys:
  - "SongStructure" → Full song data (JSON)
  - "LastExport" → Export timestamp (ISO 8601)
```

### Data Format
```typescript
{
  version: "1.0.0",
  projectName: "My Song",
  bpm: 120,
  timeSignature: [4, 4],
  key: "C",
  markers: [{name, position, color}],
  regions: [{name, startPosition, endPosition, color}],
  chords: [{position, chord, duration}]
}
```

---

## Support

For issues or questions:
1. Check REAPER's web interface is accessible
2. Review the troubleshooting section
3. Check console logs in both TrackDraft and REAPER
4. Verify REAPER version (6.0+ required)

---

## License

MIT - Same as TrackDraft main project
