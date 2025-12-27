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

### Phase 3-11: Coming Soon
- Song structure mapping with MAP templates
- Lyric editor with multiple modes
- Melody analyzer and recorder
- Bridge builder and finishing tools
- AI writing assistant
- Collaboration features

## Tech Stack

- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Zustand** for state management
- **Tone.js** for audio playback (to be integrated)
- **react-beautiful-dnd** for drag-and-drop (to be integrated)
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
├── hooks/              # Custom React hooks
├── lib/                # Utility functions and music theory
│   └── harmony/        # Chord and key utilities
├── types/              # TypeScript interfaces
│   └── music.ts        # Core music types
├── data/               # Reference data
│   └── chordSchemas.ts # Chord progression templates
└── store/              # Zustand stores
    └── songStore.ts    # Main song state management
```

## Development Roadmap

### MVP Features (Priority)
- [x] Project setup and core architecture
- [x] Key selection component
- [x] Chord progression builder with schemas
- [ ] Song structure visualizer with MAP templates
- [ ] Basic lyric editor with syllable counting
- [ ] Section management (add/delete/reorder)
- [ ] Export lyrics and structure
- [ ] Auto-save functionality

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

