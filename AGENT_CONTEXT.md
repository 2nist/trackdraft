# TrackDraft - Agent Context Prompt

## Project Overview

**TrackDraft** is a comprehensive songwriting productivity application that guides users from initial chord progression to finished song. It's based on the "How To Write Songs" (HTWS) Seven-Step Formula and integrates with Reaper DAW for professional music production workflows.

### Core Purpose
- **Songwriting Assistant**: Helps users structure, write, and refine songs
- **Music Theory Tool**: Provides intelligent harmony and chord progression guidance
- **DAW Integration**: Bidirectional sync with Reaper for seamless production workflow
- **Productivity Focus**: Eliminates writer's block through structured templates and prompts

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling and dev server
- **Tailwind CSS** for styling (dark theme, DAW-like interface)
- **React Router DOM** for navigation
- **Zustand** for state management (lightweight, no providers needed)
- **Lucide React** for icons
- **Tone.js** for audio playback
- **react-beautiful-dnd** for drag-and-drop

### Backend/Integration
- **Reaper Bridge**: Lua-based TCP server running in Reaper DAW
- **HTTP over TCP**: Communication protocol between TrackDraft and Reaper
- **LocalStorage**: Persistence for songs, progressions, and schemas

## Project Structure

```
src/
├── components/          # React components (organized by feature)
│   ├── common/         # Shared components (ErrorBoundary, Toast, ImportDialog)
│   ├── dashboard/      # Project management and song list
│   ├── harmony/        # Key selection, chord progressions, Hexagonal Wheel
│   ├── structure/      # Song structure visualizer and section management
│   ├── lyrics/         # Lyric editor, rhyme detection, syllable counting
│   ├── melody/         # Melody analysis and recording interface
│   ├── finishing/      # Mix dashboard and polish tools
│   ├── settings/       # Settings and export options
│   └── layout/         # App shell (Sidebar, TopBar, PlayerBar)
├── lib/                # Core logic and utilities
│   ├── harmony/        # Music theory utilities
│   │   ├── keyUtils.ts              # Key/chord calculations
│   │   ├── substitutions.ts         # Chord substitution logic
│   │   ├── bridgeStrategies.ts      # Bridge building strategies
│   │   ├── emotionDetection.ts      # Emotional analysis
│   │   ├── audioUtils.ts            # Tone.js audio playback
│   │   ├── constants.ts             # Musical constants
│   │   ├── dissonance.ts            # Harmonic dissonance calculations
│   │   └── hexagonal-layers-corrected.ts  # Hexagonal Harmony Wheel layers
│   ├── lyrics/         # Lyric analysis
│   │   ├── syllableCounter.ts       # Syllable counting
│   │   ├── rhymeDetector.ts         # Rhyme detection
│   │   └── datamuseApi.ts           # External rhyme API integration
│   ├── reaper-bridge.ts      # ReaperBridge service class
│   ├── export.ts             # Export utilities (JSON, lyrics, chord charts)
│   ├── import-utils.ts       # Import handling
│   ├── jams-converter.ts     # JAMS format import/export
│   ├── progression-detector.ts  # Chord progression detection
│   └── errors.ts             # Error handling utilities
├── store/              # Zustand state management stores
│   ├── songStore.ts          # Main song state (CRUD, undo/redo, auto-save)
│   ├── progressionStore.ts   # Named chord progression library
│   ├── schemaStore.ts        # Custom chord schema templates
│   └── toastStore.ts         # Toast notification state
├── types/              # TypeScript type definitions
│   ├── music.ts              # Core music types (Song, Chord, Key, SongSection)
│   ├── structure.ts          # Song structure types (SectionType, SongMap)
│   ├── bridge-protocol.ts    # Reaper bridge protocol types
│   ├── emotional.ts          # Emotional analysis types
│   └── jams.ts               # JAMS format types
├── data/               # Reference data (static)
│   ├── chordSchemas.ts       # Chord progression templates
│   └── songMaps.ts           # Narrative structure templates (MAP)
├── hooks/              # Custom React hooks
│   ├── useReaperConnection.ts  # Reaper bridge connection management
│   └── useAutoSync.ts          # Auto-sync with Reaper
├── App.tsx             # Main app component (routing, layout)
├── main.tsx            # React entry point
└── index.css           # Global styles and Tailwind imports

reaper-bridge/          # Lua server for Reaper integration
├── reaper_bridge.lua   # Main TCP server
├── lib/
│   ├── json.lua        # dkjson library (placeholder - needs actual library)
│   └── commands/
│       └── timeline.lua  # Timeline sync commands
└── README.md           # Installation and protocol documentation
```

## Key Conventions & Patterns

### State Management (Zustand)
- **No Providers**: Zustand stores are imported directly, no context providers needed
- **LocalStorage Integration**: Stores handle their own persistence (songStore, progressionStore, schemaStore)
- **Actions Pattern**: Stores export actions as functions that update state
- **Immutable Updates**: Always create new objects/arrays when updating state

Example:
```typescript
// Using a store
const { currentSong, updateProgression } = useSongStore();

// Updating state
updateProgression([...currentSong.progression, newChord]);
```

### Component Organization
- **Feature-based**: Components organized by feature area (harmony, lyrics, structure)
- **Single Responsibility**: Each component has a clear, focused purpose
- **Composition**: Complex UIs built from smaller, reusable components
- **Error Boundaries**: Components wrapped in ErrorBoundary for graceful error handling

### Styling (Tailwind CSS)
- **Dark Theme**: Black/dark gray background (`bg-black`, `bg-surface-0`)
- **Design System**: Uses Tailwind config colors (draft-blue, track-orange, surface, text)
- **Button Style**: Transparent buttons with border and highlight effects (no gradients)
- **Responsive**: Mobile-first approach, but primarily desktop-focused

Button Pattern:
```tsx
<button className="px-4 py-2 rounded-md border border-gray-700 
                   bg-transparent text-white hover:bg-gray-900 
                   hover:border-gray-600 transition-colors">
  Click Me
</button>
```

### Code Style Guidelines

#### No Emojis Policy ⚠️
**CRITICAL**: Do NOT use emojis in:
- Code comments
- UI text (buttons, labels, messages)
- Error/success messages
- Any user-facing text

Use clear, descriptive text instead. This ensures:
- Better accessibility (screen readers)
- Consistent cross-platform rendering
- Professional appearance

#### TypeScript
- **Strict Mode**: TypeScript configured for strict type checking
- **Interfaces Over Types**: Prefer interfaces for object shapes
- **Exported Types**: Types in `src/types/` are exported for reuse
- **Type Safety**: Always type function parameters and return values

#### File Naming
- **PascalCase**: React components (`HarmonyView.tsx`, `ErrorBoundary.tsx`)
- **camelCase**: Utilities and hooks (`keyUtils.ts`, `useAutoSync.ts`)
- **kebab-case**: CSS files when needed (`hexagonal-wheel.css`)

## Core State Management

### songStore (Primary State)
Manages the current song and all song-related operations:

**State:**
- `currentSong: Song | null` - Currently active song
- `songs: Song[]` - List of all songs
- `history: Song[]` - Undo/redo history stack
- `historyIndex: number` - Current position in history

**Key Actions:**
- `createNewSong(title)` - Create a new song
- `updateSong(updates)` - Update song properties (triggers history push)
- `updateKey(key)` - Update song key
- `updateProgression(chords)` - Update chord progression
- `addSection(section)` - Add a new song section
- `updateSection(id, updates)` - Update a section
- `deleteSection(id)` - Delete a section
- `reorderSections(sections)` - Reorder sections (drag-and-drop)
- `undo()` / `redo()` - Undo/redo operations
- `saveSong()` - Persist to localStorage
- `loadSong(id)` - Load song from localStorage
- `autoSave()` - Auto-save (debounced, called after changes)

**History Management:**
- Every update pushes to history (max 50 entries)
- `undo()` restores previous state from history
- `redo()` restores next state from history

### progressionStore
Manages named chord progressions (user-created library):

**State:**
- `progressions: NamedProgression[]` - Array of saved progressions

**Actions:**
- `saveProgression(progression)` - Save/update a progression
- `deleteProgression(id)` - Delete a progression
- `loadProgressions()` - Load from localStorage
- `updateProgression(id, updates)` - Update a progression

### schemaStore
Manages chord schema templates (built-in and user-created):

**State:**
- `schemas: ChordSchema[]` - Array of chord schemas

**Actions:**
- `loadSchemas()` - Load from localStorage
- `saveSchema(schema)` - Save a new schema
- `deleteSchema(id)` - Delete a schema
- `convertProgressionToSchema(progression, name)` - Convert progression to schema

### toastStore
Manages toast notifications:

**State:**
- `toasts: Toast[]` - Array of active toasts

**Actions:**
- `showSuccess(message)` - Show success toast
- `showError(message)` - Show error toast
- `showWarning(message)` - Show warning toast
- `removeToast(id)` - Remove a toast

## Reaper Bridge Integration

### Architecture
- **Lua Server**: Runs inside Reaper DAW (TCP server on port 8888)
- **HTTP over TCP**: TrackDraft sends HTTP POST requests to `http://127.0.0.1:8888`
- **JSON Protocol**: All communication via JSON

### ReaperBridge Service Class
Located in `src/lib/reaper-bridge.ts`:

**Key Methods:**
- `connect()` - Establish connection to Reaper
- `isConnected()` - Check connection status
- `syncToReaper(sections)` - Sync song sections to Reaper markers
- `getTimelineState()` - Get current timeline state from Reaper
- `createArrangement(sections)` - Create arrangement in Reaper
- `createChordTrack(chords)` - Create chord track
- `displayLyrics(lyrics)` - Display lyrics in Reaper

**Sync Version System:**
- Tracks version numbers to detect conflicts
- `syncVersion` increments on each sync
- Conflict resolution strategies: `trackdraft-wins`, `reaper-wins`, `merge`

### Protocol Commands
See `src/types/bridge-protocol.ts` for full protocol:

**Key Commands:**
- `ping` - Test connectivity
- `get_timeline_state` - Get current timeline from Reaper
- `sync_to_reaper` - Sync sections from TrackDraft to Reaper
- `create_arrangement` - Create arrangement in Reaper
- `create_chord_track` - Create chord track with MIDI
- `display_lyrics` - Show lyrics in Reaper

### Marker Naming Convention
TrackDraft markers in Reaper use format: `TD_{section_id}_{section_name}`
- Example: `TD_verse1_Verse`, `TD_chorus1_Chorus`
- All markers start with `TD_` prefix

## Music Theory Integration

### Key System
- **Root Notes**: C, C#, D, D#, E, F, F#, G, G#, A, A#, B (0-11)
- **Modes**: major, minor, dorian, phrygian, lydian, mixolydian, locrian
- **Representation**: `Key` interface with `root: string` and `mode: string`

### Chord System
- **Roman Numerals**: I, ii, iii, IV, V, vi, vii° (with quality)
- **Chord Quality**: major, minor, diminished, augmented, dominant, etc.
- **Chord Function**: tonic, subdominant, dominant
- **Notes Array**: Array of note names (e.g., `["C", "E", "G"]`)

### Chord Progressions
- **Named Progressions**: User can save progressions with custom names
- **Schemas**: Template progressions (Doo-wop, Axis of Awesome, etc.)
- **Substitutions**: Intelligent chord substitution suggestions
- **Bridge Strategies**: Automatic bridge building using substitutions

### Hexagonal Harmony Wheel
New visualization system for chord exploration:
- **6 Concentric Rings**: Different harmonic layers (diatonic, extensions, borrowed, etc.)
- **Dissonance Overlay**: Visual indicators for harmonic tension
- **Layer-based Exploration**: Switch between harmonic layers
- **Interactive Tooltips**: Detailed theory explanations on hover

## UI/UX Patterns

### Navigation
- **Sidebar**: Main navigation (Dashboard, Harmony, Structure, Lyrics, Melody, Finishing, Settings)
- **Routes**: React Router with path-based routing
- **No Logo Text**: Just logo image (enlarged, centered)
- **Dark Theme**: Black background, gray surfaces

### Views
1. **Dashboard**: Song list, create new song, import/export
2. **Harmony**: Key selection, chord progression builder, Hexagonal Wheel
3. **Structure**: Visual timeline, section management, progression assignment
4. **Lyrics**: Multi-mode editor, rhyme detection, syllable counting
5. **Melody**: Melody analysis and recording (no virtual keyboard)
6. **Finishing**: Mix dashboard, production checklist
7. **Settings**: Data management, export options

### Common UI Components
- **ErrorBoundary**: Catches React errors, shows fallback UI
- **Toast**: Notification system (success, error, warning)
- **ImportDialog**: File import handling
- **ConflictDialog**: Reaper sync conflict resolution
- **BridgeStatus**: Reaper connection status indicator

### Auto-Save
- **Debounced**: Saves 1.5 seconds after last change
- **Automatic**: No manual save button needed
- **LocalStorage**: Persists to browser storage

### Keyboard Shortcuts
- `Ctrl+S`: Save song
- `Ctrl+Z`: Undo
- `Ctrl+Shift+Z`: Redo
- `Space`: Play/pause (context-dependent)

## Type System Overview

### Core Types (src/types/music.ts)
- `Song`: Complete song object (id, title, key, tempo, sections, progression)
- `SongSection`: Section of a song (id, type, chords, lyrics, melody, duration)
- `Chord`: Chord object (romanNumeral, quality, notes, function, beats)
- `Key`: Musical key (root, mode)
- `ChordProgression`: Named progression with chords and emotional context
- `MIDINote`: MIDI note representation
- `MelodyAnalysis`: Analysis results for melodies
- `ContrastScore`: Contrast analysis between melodies

### Structure Types (src/types/structure.ts)
- `SectionType`: 'intro' | 'verse' | 'chorus' | 'bridge' | 'outro'
- `SectionPurpose`: Narrative purpose description
- `SongMap`: Template structure (PEC, Journey, etc.)

### Bridge Protocol Types (src/types/bridge-protocol.ts)
- `BridgeCommand`: Base command interface
- `BridgeResponse`: Base response interface
- Command-specific types: `SyncToReaperCommand`, `GetTimelineStateCommand`, etc.
- `TimelineState`: Timeline representation from Reaper
- `TimelineSection`: Section in timeline
- `SyncConflict`: Conflict information

## Development Workflow

### Running the App
```bash
npm install          # Install dependencies
npm run dev         # Start dev server (typically http://localhost:5173)
npm run build       # Build for production
npm run lint        # Run ESLint
```

### Adding a New Feature
1. **Plan**: Identify which store(s) need updates
2. **Types**: Define/update types in `src/types/`
3. **Store**: Update or create Zustand store if needed
4. **Component**: Create React component in appropriate feature folder
5. **Route**: Add route in `App.tsx` if new view
6. **Test**: Test with real song data

### Common Patterns

#### Creating a New View Component
```typescript
import { useSongStore } from "../../store/songStore";

export default function MyNewView() {
  const { currentSong, updateSong } = useSongStore();
  
  if (!currentSong) {
    return <div>No song selected</div>;
  }
  
  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-white">My View</h1>
      {/* Your component content */}
    </div>
  );
}
```

#### Updating Song State
```typescript
// Always use store actions (they handle history)
const { updateSong, updateProgression, addSection } = useSongStore();

// Don't directly mutate currentSong
updateSong({ title: "New Title" });
updateProgression([...currentSong.progression, newChord]);
addSection({ id: "verse1", type: "verse", /* ... */ });
```

#### Showing Toast Notifications
```typescript
import { useToastStore } from "../../store/toastStore";

const { showSuccess, showError } = useToastStore();

try {
  await someOperation();
  showSuccess("Operation completed successfully");
} catch (error) {
  showError("Operation failed: " + error.message);
}
```

#### Using Reaper Bridge
```typescript
import { reaperBridge } from "../../lib/reaper-bridge";

// Check connection
if (!reaperBridge.isConnected()) {
  await reaperBridge.connect();
}

// Sync to Reaper
await reaperBridge.syncToReaper(currentSong.sections);
```

## Important Notes

### Data Persistence
- **LocalStorage Keys**:
  - `trackdraft-songs`: All songs
  - `trackdraft-current-song-id`: Currently active song ID
  - `trackdraft-progressions`: Named progressions
  - `trackdraft-schemas`: Custom chord schemas

### Error Handling
- **Error Boundaries**: Wrap components to catch React errors
- **Toast Notifications**: User-friendly error messages
- **Graceful Degradation**: App continues working if Reaper bridge is disconnected

### Performance Considerations
- **Auto-Save Debouncing**: 1.5 second delay prevents excessive saves
- **History Limit**: Max 50 entries in undo/redo history
- **LocalStorage**: All data stored client-side (no backend)

### Music Theory Accuracy
- **Roman Numeral System**: Uses standard music theory notation
- **Chord Qualities**: Supports major, minor, diminished, augmented, dominant, etc.
- **Key Calculations**: Accurate circle of fifths and mode calculations
- **Substitutions**: Music-theory-based chord substitution logic

## Testing Considerations

### Manual Testing Checklist
1. **Song CRUD**: Create, update, delete songs
2. **Undo/Redo**: Test history navigation
3. **Auto-Save**: Verify localStorage persistence
4. **Reaper Bridge**: Test connection and sync (requires Reaper running)
5. **Export**: Test all export formats (JSON, lyrics, chord charts)
6. **Import**: Test JAMS import
7. **All Views**: Navigate through all views, test functionality

### Known Limitations
- **No Backend**: All data stored locally (no cloud sync)
- **No Collaboration**: Single-user application
- **Reaper Dependency**: Some features require Reaper bridge running
- **Browser Only**: Currently web app (no Electron packaging)

## Future Enhancements (Not Implemented)
- Audio recording (melody/vocal recording)
- Virtual keyboard with audio playback
- AI lyric generation
- Real-time collaboration
- Cloud sync
- Advanced NLP analysis

## Resources

### Documentation Files
- `README.md`: Project overview and features
- `CONTRIBUTING.md`: Contribution guidelines (including no emojis policy)
- `reaper-bridge/README.md`: Reaper bridge installation and protocol
- `AUDIT_REPORT.md`: Codebase audit findings

### External Dependencies
- **React Router**: Navigation
- **Zustand**: State management
- **Tailwind CSS**: Styling
- **Tone.js**: Audio playback
- **Lucide React**: Icons
- **react-beautiful-dnd**: Drag and drop

### Key Files to Review for New Contributors
1. `src/App.tsx` - App structure and routing
2. `src/store/songStore.ts` - Primary state management
3. `src/types/music.ts` - Core type definitions
4. `src/components/harmony/HarmonyView.tsx` - Example of a complex view
5. `src/lib/reaper-bridge.ts` - Reaper integration service
6. `tailwind.config.js` - Design system colors

---

**Last Updated**: Based on codebase state as of feature/hexagonal-harmony-wheel branch
