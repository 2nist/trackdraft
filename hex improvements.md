# TrackDraft Repository Audit Report
*Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")*

## 📊 Executive Summary

**Total Files Analyzed:** ~100+ TypeScript/TSX files
**Largest File:** `songMaps.ts` (875 lines)
**Most Complex Component:** `EnhancedProgressionBuilder.tsx` (874 lines)

---

## 📁 1. Service/Library Files (Core Logic)

### Main Library (`src/lib/`)
- `errors.ts` - Error handling utilities
- `export.ts` - Export functionality (JSON, lyrics, structure, chord charts)
- `import-utils.ts` - Import utilities for converting external formats
- `jams-converter.ts` - JAMS format converter (515 lines)
- `progression-detector.ts` - Chord progression pattern detection (321 lines)
- `reaper-bridge.ts` - Reaper DAW integration bridge (517 lines)

### Harmony Library (`src/lib/harmony/`)
- `audioUtils.ts` - Audio playback utilities
- `bridgeStrategies.ts` - Bridge building strategies (289 lines)
- `emotionDetection.ts` - Emotional profile detection
- `keyUtils.ts` - Key/scale utilities
- `substitutions.ts` - Chord substitution logic (206 lines)

### Lyrics Library (`src/lib/lyrics/`)
- `datamuseApi.ts` - Datamuse API integration (rhymes, synonyms)
- `rhymeDetector.ts` - Rhyme detection (237 lines)
- `syllableCounter.ts` - Syllable counting

---

## 🎨 2. Component Directories

```
BridgeStatus/          - Reaper bridge connection status
common/                - Shared components (ErrorBoundary, ImportDialog, Toast)
ConflictDialog/        - Conflict resolution dialog
dashboard/             - Main dashboard view
finishing/             - Finishing tools (MixDashboard, FinishingTools)
harmony/               - Harmony/progression builder components
layout/                - Layout components (Sidebar, TopBar, PlayerBar)
lyrics/                - Lyrics editing components
melody/                - Melody view
settings/              - Settings view
structure/             - Song structure components
SyncStatus/            - Sync status indicator
```

---

## 📈 3. Largest/Most Complex Files (Top 25)

| Lines | File | Path |
|-------|------|------|
| 875 | songMaps.ts | src/data/songMaps.ts |
| 874 | EnhancedProgressionBuilder.tsx | src/components/harmony/EnhancedProgressionBuilder.tsx |
| 776 | CircularProgressionView.tsx | src/components/harmony/CircularProgressionView.tsx |
| 620 | StructureVisualizer.tsx | src/components/structure/StructureVisualizer.tsx |
| 529 | BridgeBuilder.tsx | src/components/structure/BridgeBuilder.tsx |
| 517 | reaper-bridge.ts | src/lib/reaper-bridge.ts |
| 515 | jams-converter.ts | src/lib/jams-converter.ts |
| 376 | LyricsView.tsx | src/components/lyrics/LyricsView.tsx |
| 374 | chordSchemas.ts | src/data/chordSchemas.ts |
| 372 | FinishingTools.tsx | src/components/finishing/FinishingTools.tsx |
| 367 | ProgressionBuilder.tsx | src/components/harmony/ProgressionBuilder.tsx |
| 321 | progression-detector.ts | src/lib/progression-detector.ts |
| 319 | ImportDialog.tsx | src/components/common/ImportDialog.tsx |
| 289 | bridgeStrategies.ts | src/lib/harmony/bridgeStrategies.ts |
| 281 | songStore.ts | src/store/songStore.ts |
| 259 | LyricEditor.tsx | src/components/lyrics/LyricEditor.tsx |
| 258 | bridge-protocol.ts | src/types/bridge-protocol.ts |
| 243 | TopBar.tsx | src/components/layout/TopBar.tsx |
| 241 | ChordShape.tsx | src/components/harmony/ChordShape.tsx |
| 237 | rhymeDetector.ts | src/lib/lyrics/rhymeDetector.ts |
| 235 | SettingsView.tsx | src/components/settings/SettingsView.tsx |
| 230 | MixDashboard.tsx | src/components/finishing/MixDashboard.tsx |
| 211 | NarrativePrompter.tsx | src/components/structure/NarrativePrompter.tsx |
| 210 | RhymeVisualizer.tsx | src/components/lyrics/RhymeVisualizer.tsx |
| 206 | substitutions.ts | src/lib/harmony/substitutions.ts |

**Analysis:**
- **Most complex components:** EnhancedProgressionBuilder (874 lines) - consider splitting
- **Large data files:** songMaps.ts (875 lines), chordSchemas.ts (374 lines) - data, not logic
- **Large services:** reaper-bridge.ts (517 lines), jams-converter.ts (515 lines) - core features

---

## 🗄️ 4. Store Files (State Management)

- `songStore.ts` - Song state management (281 lines) ✅ Active
- `schemaStore.ts` - Chord schema storage
- `progressionStore.ts` - Named progression storage (NEW)
- `toastStore.ts` - Toast notifications

---

## 📝 5. Type Definitions (`src/types/`)

- `bridge-protocol.ts` - Reaper bridge protocol types (258 lines)
- `emotional.ts` - Emotional analysis types
- `jams.ts` - JAMS format types (NEW)
- `music.ts` - Core music theory types
- `structure.ts` - Song structure types

---

## 🔍 6. Unused/Underused Exports

### Potentially Unused Exports Found:

**Utility Functions:**
- `useAutoSync` hook - Auto-sync functionality (may be optional feature)
- `handleError` from errors.ts - Error handler
- `getSongMapsByDifficulty` / `getSongMapsByGenre` from songMaps.ts

**Components:**
- `KeyChordPalette` - May be legacy/unused
- `KeySelector` - May be legacy/unused
- `ProgressionBuilder` - Legacy component (EnhancedProgressionBuilder exists)

**Library Functions:**
- `playChord` from audioUtils.ts
- `getScaleNotes` from keyUtils.ts
- `getSynonyms` from datamuseApi.ts
- Individual substitution functions (getCommonToneSubstitutions, etc.) - may be used internally

**Types:**
- `ChordProgressionAnalysis` from emotional.ts
- `MelodyAnalysis` from music.ts
- `ContrastScore` from music.ts
- `BridgeCommandUnion` from bridge-protocol.ts

### ⚠️ Notes:
- Some exports may be used dynamically or in development
- Some may be part of incomplete features
- Review and either use or remove for cleaner codebase

---

## 🎯 7. Feature Inventory

### ✅ Core Features Implemented:

1. **Song Management**
   - Song creation, editing, saving
   - Song store with undo/redo
   - Export (JSON, lyrics, structure, chord charts)

2. **Harmony System**
   - Chord progression builder (Enhanced)
   - Circular progression view
   - Key/scale utilities
   - Chord substitutions (common tone, functional, modal interchange)
   - Progression labeling and assignment
   - Emotional profile detection

3. **Structure System**
   - Section management
   - MAP templates
   - Narrative prompts
   - Bridge builder
   - Drag-and-drop reordering

4. **Lyrics System**
   - Lyric editor
   - Rhyme detection
   - Syllable counting
   - Datamuse API integration
   - Rhyme visualizer

5. **Integration Features**
   - Reaper DAW bidirectional sync
   - JAMS format import/export
   - McGill Billboard / SALAMI dataset import
   - Progression detection from imported data

6. **UI/UX**
   - Toast notifications
   - Error boundaries
   - Import dialog with auto-detection
   - Conflict resolution dialog
   - Sync status indicators

---

## 🔧 8. Recommendations

### High Priority:
1. **Split Large Components:**
   - `EnhancedProgressionBuilder.tsx` (874 lines) → Consider splitting into:
     - ProgressionEditor
     - ProgressionControls
     - ProgressionModal
   
   - `CircularProgressionView.tsx` (776 lines) → Consider extracting:
     - CircularCanvas
     - ChordSegmentRenderer

2. **Review Unused Exports:**
   - Remove or document unused exports
   - Consider deprecating `ProgressionBuilder` if `EnhancedProgressionBuilder` is the standard

3. **Type Safety:**
   - Review `BridgeCommandUnion` usage
   - Ensure all types in `emotional.ts` are used

### Medium Priority:
1. **Code Organization:**
   - Consider grouping related components in subdirectories
   - Extract large data files to separate repo or build step

2. **Documentation:**
   - Document exported functions in library files
   - Add JSDoc comments to complex functions

### Low Priority:
1. **Performance:**
   - Review large data files (songMaps, chordSchemas) for lazy loading
   - Consider code splitting for large components

---

## 📊 Statistics

- **Total Library Files:** 14
- **Total Component Directories:** 12
- **Largest File:** 875 lines (songMaps.ts - data file)
- **Largest Component:** 874 lines (EnhancedProgressionBuilder.tsx)
- **Largest Service:** 517 lines (reaper-bridge.ts)
- **Average Component Size:** ~250 lines (healthy)
- **Average Service Size:** ~200 lines (healthy)

---

*End of Audit Report*

