# AGENTS.md

Guidance for coding agents working in this repository.

## Project summary

**TrackDraft** is a React + TypeScript + Vite app for songwriting productivity (harmony, structure, lyrics, melody, finishing tools). UI is Tailwind-based with a DAW-like dark theme.

## Key commands

- **Install**: `npm install`
- **Dev server**: `npm run dev`
- **Lint (must pass)**: `npm run lint`
- **Build (must pass)**: `npm run build`
- **Preview build**: `npm run preview`

There is no dedicated test runner configured; use **lint + build** as the primary correctness gates.

## Repo map (high-signal)

- `src/main.tsx`: app entry
- `src/App.tsx`: top-level routing/layout
- `src/components/`: feature UI (harmony/structure/lyrics/melody/finishing/settings, plus `layout/` and `common/`)
- `src/store/`: Zustand stores (app state)
- `src/lib/`: domain logic (music theory, lyrics analysis, import/export, bridge utilities)
- `src/types/`: TypeScript types shared across features
- `src/data/`: reference datasets (chord schemas, song maps)
- `reaper-bridge/`: REAPER integration assets (Lua scripts, docs)

## Engineering conventions

- **TypeScript-first**: prefer precise types; avoid `any` unless unavoidable and localized.
- **React style**: functional components + hooks; keep side effects inside `useEffect`/custom hooks.
- **State management**: use existing Zustand stores in `src/store/` rather than introducing new global patterns.
- **Styling**: Tailwind; match existing dark/DAW UI patterns. Prefer reusing existing component patterns over inventing new ones.
- **Error UX**: use existing error/notification mechanisms (`src/components/common/`, toast store) instead of `alert()`.

## REAPER bridge notes

The `reaper-bridge/` folder contains scripts meant to run inside REAPER (not in the browser). When working on integration:

- Keep the browser app resilient to “bridge not connected” scenarios.
- Prefer updating shared protocol/types in `src/types/` and connection logic in `src/hooks/` / `src/lib/reaper-bridge.ts`.
- Avoid changing Lua scripts unless the task explicitly requires it.

## Dependency changes

If you add/remove dependencies:

- Use npm (`npm install <pkg>` / `npm uninstall <pkg>`) so `package-lock.json` stays consistent.
- Keep changes minimal and aligned with existing stack (React/Vite/Tailwind/Zustand).

## PR/change expectations (for agents)

- Keep diffs focused and readable.
- Update/extend types when behavior changes.
- Ensure `npm run lint` and `npm run build` succeed (or clearly explain any limitations in the environment).
- Include a brief “test plan” in the description of your changes (what you ran and what you clicked).

