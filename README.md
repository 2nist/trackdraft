# TrackDraft - Songwriting Productivity Application

A comprehensive songwriting productivity application based on the "How To Write Songs" (HTWS) Seven-Step Formula. TrackDraft guides users from initial chord progression to finished song, incorporating music theory, NLP for lyrics, and productivity features to eliminate writer's block.

## Features

### Core Application ✅

TrackDraft is a standalone songwriting application that works completely independently. All features below work without any external dependencies.

### Phase 1: Core Architecture ✅

- React + TypeScript + Vite setup
- Zustand state management
- Tailwind CSS with dark theme
- Professional DAW-like interface

### Phase 2: Harmonic Engine ✅

- **Key Selection**: Interactive circle of fifths key selector
- **Chord Schema Database**: Expanded library of chord progressions (Doo-wop, Axis of Awesome, and more)
- **Chord Progression Builder**: Visual timeline with chord cards
- **Music Theory Integration**: Automatic chord generation from roman numerals
- **Audio Playback**: Play chord progressions with Tone.js integration

### Phase 3: Song Structure ✅

- **MAP Templates**: Multiple narrative structure templates (PEC, Journey, etc.)
- **Structure Visualizer**: Visual timeline of song sections
- **Narrative Prompter**: Guided prompts for each section's purpose
- **Bridge Builder**: Intelligent bridge creation with chord substitution strategies

### Phase 4: Lyrics ✅

- **Multi-mode Editor**: Typewriter, Hemingway, Focus, and Normal editing modes
- **Syllable Counter**: Real-time syllable analysis with rhythm matching
- **Rhyme Analysis**: Visual rhyme detection and rhyme suggestion panel
- **Section Management**: Add, delete, and reorder song sections

### Phase 5: Melody ✅

- **Melody View**: Melody analysis and recording interface

### Phase 6: Finishing Tools ✅

- **Finishing View**: Tools for polishing your song
- **Mix Dashboard**: Production checklist and mixing guidance
- **Ending Types**: Multiple song ending strategies
- **Export Options**: Export lyrics, structure, chord charts, and complete JSON
- **Auto-Save**: Automatic saving with debouncing (saves 1.5 seconds after changes)

### Additional Features ✅

- **Settings Page**: Data management, export options, and app information
- **Error Handling**: Comprehensive error boundaries and user-friendly notifications
- **Keyboard Shortcuts**: Ctrl+S (save), Ctrl+Z (undo), Ctrl+Shift+Z (redo), Space (play/pause)
- **Undo/Redo**: Full history management for song edits
- **Drag & Drop**: Reorder song sections with react-beautiful-dnd

### Coming Soon

- Audio recording (melody/vocal recording interface)
- Virtual keyboard with audio playback
- AI writing assistant
- Real-time collaboration
- Cloud sync

## Tech Stack

- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Zustand** for state management
- **Tone.js** for audio playback (integrated)
- **react-beautiful-dnd** for drag-and-drop (integrated in structure visualizer)
- **Lucide React** for icons

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm

### Installation

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Open your browser to the URL shown in the terminal (typically `http://localhost:5173`)

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Testing

TrackDraft uses Vitest for unit and integration testing, with React Testing Library for component testing.

### Running Tests

```bash
# Run tests once
npm run test:run

# Run tests in watch mode
npm run test

# Run tests with UI
npm run test:ui

# Run tests with coverage report
npm run test:coverage
```

### Test Structure

Tests are located alongside the code they test, following the naming convention `*.test.ts` or `*.test.tsx`.

```
src/
├── components/
│   └── common/
│       ├── Toast.tsx
│       └── Toast.test.tsx        # Component tests
├── lib/
│   └── lyrics/
│       ├── syllableCounter.ts
│       └── syllableCounter.test.ts # Utility tests
└── test/
    ├── setup.ts                  # Global test setup
    └── test-utils.tsx            # Testing utilities
```

### Writing Tests

#### Component Tests
```tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { MyComponent } from './MyComponent'

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })
})
```

#### Utility Tests
```ts
import { describe, it, expect } from 'vitest'
import { myUtility } from './myUtility'

describe('myUtility', () => {
  it('returns expected result', () => {
    const result = myUtility('input')
    expect(result).toBe('expected output')
  })
})
```

### Test Utilities

The `src/test/test-utils.tsx` file provides:
- Custom render function with providers
- Mock data generators
- Common test helpers

### Coverage

Tests include coverage reporting with Istanbul (v8). Coverage reports are generated in the `coverage/` directory when running `npm run test:coverage`.

## Project Structure

```
src/
├── components/          # React components
│   ├── common/         # Shared components (ErrorBoundary, Toast)
│   ├── dashboard/      # Dashboard and project management
│   ├── harmony/        # Key selection and chord progression
│   ├── structure/      # Song structure visualizer
│   ├── lyrics/         # Lyric editor and analysis
│   ├── melody/         # Melody tools and recorder
│   ├── finishing/      # Mix and polish tools
│   ├── settings/       # Settings page
│   └── layout/         # App shell components
├── lib/                # Utility functions and music theory
│   ├── harmony/        # Chord and key utilities
│   ├── lyrics/         # Lyric analysis (syllable counting, rhyme detection)
│   ├── export.ts       # Export utilities
│   └── errors.ts       # Error handling utilities
├── types/              # TypeScript interfaces
│   ├── music.ts        # Core music types
│   └── structure.ts    # Song structure types
├── data/               # Reference data
│   ├── chordSchemas.ts # Chord progression templates
│   └── songMaps.ts     # MAP narrative structure templates
└── store/              # Zustand stores
    ├── songStore.ts    # Main song state management
    └── toastStore.ts   # Toast notification state
```

## Development Roadmap

### MVP Features (Completed) ✅

- [x] Project setup and core architecture
- [x] Key selection component
- [x] Chord progression builder with schemas
- [x] Song structure visualizer with MAP templates
- [x] Basic lyric editor with syllable counting
- [x] Section management (add/delete/reorder with drag-and-drop)
- [x] Bridge builder with chord substitution strategies
- [x] Finishing tools and mix dashboard
- [x] Export functionality (lyrics, structure, chord charts, JSON)
- [x] Auto-save functionality
- [x] Settings page
- [x] Error handling and user notifications
- [x] Keyboard shortcuts (save, undo, redo, play/pause)
- [x] Audio playback for chord progressions

### V2 Features (Future)

- [ ] Audio recording (melody/vocal recording)
- [ ] Virtual keyboard with audio playback
- [ ] AI lyric generation
- [ ] Real-time collaboration
- [ ] Advanced NLP analysis
- [ ] Cloud sync

## Contributing

This is a personal project, but suggestions and feedback are welcome!

## Optional: Reaper DAW Integration

TrackDraft includes an optional Reaper DAW bridge that allows syncing song sections and structures with Reaper. **This feature is completely optional** - TrackDraft works fully without it.

The bridge uses a lightweight Node.js server for communication (no complex dependencies like LuaSocket required). It works reliably on all platforms including Windows.

To set up the Reaper bridge:
1. See `reaper-bridge/ALTERNATIVE_SETUP.md` for detailed installation instructions
2. Start the bridge server with `npm run bridge`
3. Load the bridge script in Reaper

For more information, see `reaper-bridge/ALTERNATIVE_SETUP.md`.

## License

MIT

## Acknowledgments

Based on the "How To Write Songs" (HTWS) methodology and songwriting best practices.
