# TrackDraft - Songwriting Productivity Application

A comprehensive songwriting productivity application based on the "How To Write Songs" (HTWS) Seven-Step Formula. TrackDraft guides users from initial chord progression to finished song, incorporating music theory, NLP for lyrics, and productivity features to eliminate writer's block.

## Features

### Phase 1: Core Architecture ✅

- React + TypeScript + Vite setup
- Zustand state management
- Tailwind CSS with dark theme
- Professional DAW-like interface

### Phase 2: Harmonic Engine ✅

- **Key Selection**: Interactive circle of fifths key selector
- **Chord Schema Database**: 8 common chord progressions (Doo-wop, Axis of Awesome, etc.)
- **Chord Progression Builder**: Visual timeline with chord cards
- **Music Theory Integration**: Automatic chord generation from roman numerals

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

### Coming Soon

- Audio recording and playback (Tone.js integration)
- AI writing assistant
- Real-time collaboration
- Export functionality
- Auto-save and cloud sync

## Tech Stack

- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Zustand** for state management
- **Tone.js** for audio playback (installed, integration in progress)
- **react-beautiful-dnd** for drag-and-drop (installed, integration in progress)
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

3. Open your browser to `http://localhost:3000`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
src/
├── components/          # React components
│   ├── dashboard/      # Dashboard and project management
│   ├── harmony/        # Key selection and chord progression
│   ├── structure/      # Song structure visualizer
│   ├── lyrics/         # Lyric editor and analysis
│   ├── melody/         # Melody tools and recorder
│   ├── finishing/      # Mix and polish tools
│   └── layout/         # App shell components
├── lib/                # Utility functions and music theory
│   ├── harmony/        # Chord and key utilities
│   └── lyrics/         # Lyric analysis (syllable counting, rhyme detection)
├── types/              # TypeScript interfaces
│   ├── music.ts        # Core music types
│   └── structure.ts    # Song structure types
├── data/               # Reference data
│   ├── chordSchemas.ts # Chord progression templates
│   └── songMaps.ts     # MAP narrative structure templates
└── store/              # Zustand stores
    └── songStore.ts    # Main song state management
```

## Development Roadmap

### MVP Features (Priority)

- [x] Project setup and core architecture
- [x] Key selection component
- [x] Chord progression builder with schemas
- [x] Song structure visualizer with MAP templates
- [x] Basic lyric editor with syllable counting
- [x] Section management (add/delete/reorder)
- [x] Bridge builder with chord substitution strategies
- [x] Finishing tools and mix dashboard
- [x] Export lyrics and structure
- [x] Auto-save functionality

### V2 Features

- [ ] Audio recording and playback
- [ ] AI lyric generation
- [ ] Real-time collaboration
- [ ] Advanced NLP analysis
- [ ] Cloud sync

## Contributing

This is a personal project, but suggestions and feedback are welcome!

## License

MIT

## Acknowledgments

Based on the "How To Write Songs" (HTWS) methodology and songwriting best practices.
