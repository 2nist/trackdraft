import { create } from "zustand";
import { Song, Key, SongSection, Chord } from "../types/music";

interface SongState {
  currentSong: Song | null;
  songs: Song[];
  history: Song[]; // History stack for undo/redo
  historyIndex: number; // Current position in history

  // Actions
  setCurrentSong: (song: Song | null) => void;
  createNewSong: (title?: string) => void;
  updateSong: (updates: Partial<Song>) => void;
  updateKey: (key: Key) => void;
  updateTempo: (tempo: number) => void;
  updateProgression: (progression: Chord[]) => void;
  addSection: (section: SongSection) => void;
  updateSection: (sectionId: string, updates: Partial<SongSection>) => void;
  deleteSection: (sectionId: string) => void;
  reorderSections: (sections: SongSection[]) => void;
  saveSong: () => void;
  loadSong: (songId: string) => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  autoSave: () => void;
}

const createDefaultSong = (title: string = "Untitled Song"): Song => ({
  id: crypto.randomUUID(),
  title,
  key: { root: "C", mode: "major" },
  tempo: 120,
  sections: [],
  progression: undefined,
  createdAt: new Date(),
  updatedAt: new Date(),
});

// Deep clone a song for history
const cloneSong = (song: Song): Song => {
  const cloned = JSON.parse(JSON.stringify(song));
  // Restore Date objects (JSON.parse converts them to strings)
  cloned.createdAt = new Date(cloned.createdAt);
  cloned.updatedAt = new Date(cloned.updatedAt);
  return cloned;
};

// Helper to push to history before making a change
const pushToHistory = (currentSong: Song | null, history: Song[], historyIndex: number): { history: Song[], historyIndex: number } => {
  if (!currentSong) return { history, historyIndex };
  
  // Clone the current song
  const cloned = cloneSong(currentSong);
  
  // If we're not at the end of history, truncate future states
  const newHistory = history.slice(0, historyIndex + 1);
  newHistory.push(cloned);
  
  // Limit history size to prevent memory issues (keep last 50 states)
  const maxHistorySize = 50;
  if (newHistory.length > maxHistorySize) {
    newHistory.shift();
    return { history: newHistory, historyIndex: newHistory.length - 1 };
  }
  
  return { history: newHistory, historyIndex: newHistory.length - 1 };
};

export const useSongStore = create<SongState>((set, get) => ({
  currentSong: null,
  songs: [],
  history: [],
  historyIndex: -1,

  setCurrentSong: (song) => {
    if (song) {
      // Initialize history with the new song
      const cloned = cloneSong(song);
      set({ 
        currentSong: song,
        history: [cloned],
        historyIndex: 0
      });
    } else {
      set({ 
        currentSong: null,
        history: [],
        historyIndex: -1
      });
    }
  },

  createNewSong: (title) => {
    const newSong = createDefaultSong(title);
    const cloned = cloneSong(newSong);
    set({ 
      currentSong: newSong,
      history: [cloned],
      historyIndex: 0
    });
  },

  updateSong: (updates) => {
    const { currentSong, history, historyIndex } = get();
    if (!currentSong) return;

    const updatedSong: Song = {
      ...currentSong,
      ...updates,
      updatedAt: new Date(),
    };

    // Push to history before updating
    const { history: newHistory, historyIndex: newIndex } = pushToHistory(currentSong, history, historyIndex);

    set({
      currentSong: updatedSong,
      history: newHistory,
      historyIndex: newIndex,
    });
  },

  updateKey: (key) => {
    get().updateSong({ key });
  },

  updateTempo: (tempo) => {
    get().updateSong({ tempo });
  },

  updateProgression: (progression) => {
    get().updateSong({ progression });
  },

  addSection: (section) => {
    const { currentSong, history, historyIndex } = get();
    if (!currentSong) return;

    const updatedSong: Song = {
      ...currentSong,
      sections: [...currentSong.sections, section],
      updatedAt: new Date(),
    };

    const { history: newHistory, historyIndex: newIndex } = pushToHistory(currentSong, history, historyIndex);

    set({
      currentSong: updatedSong,
      history: newHistory,
      historyIndex: newIndex,
    });
  },

  updateSection: (sectionId, updates) => {
    const { currentSong, history, historyIndex } = get();
    if (!currentSong) return;

    const updatedSong: Song = {
      ...currentSong,
      sections: currentSong.sections.map((section) =>
        section.id === sectionId ? { ...section, ...updates } : section
      ),
      updatedAt: new Date(),
    };

    const { history: newHistory, historyIndex: newIndex } = pushToHistory(currentSong, history, historyIndex);

    set({
      currentSong: updatedSong,
      history: newHistory,
      historyIndex: newIndex,
    });
  },

  deleteSection: (sectionId) => {
    const { currentSong, history, historyIndex } = get();
    if (!currentSong) return;

    const updatedSong: Song = {
      ...currentSong,
      sections: currentSong.sections.filter(
        (section) => section.id !== sectionId
      ),
      updatedAt: new Date(),
    };

    const { history: newHistory, historyIndex: newIndex } = pushToHistory(currentSong, history, historyIndex);

    set({
      currentSong: updatedSong,
      history: newHistory,
      historyIndex: newIndex,
    });
  },

  reorderSections: (sections) => {
    const { currentSong, history, historyIndex } = get();
    if (!currentSong) return;

    const updatedSong: Song = {
      ...currentSong,
      sections,
      updatedAt: new Date(),
    };

    const { history: newHistory, historyIndex: newIndex } = pushToHistory(currentSong, history, historyIndex);

    set({
      currentSong: updatedSong,
      history: newHistory,
      historyIndex: newIndex,
    });
  },

  saveSong: () => {
    const { currentSong, songs } = get();
    if (!currentSong) return;

    const existingIndex = songs.findIndex((s) => s.id === currentSong.id);
    const updatedSongs =
      existingIndex >= 0
        ? songs.map((s, i) => (i === existingIndex ? currentSong : s))
        : [...songs, currentSong];

    set({ songs: updatedSongs });

    // Save to localStorage
    try {
      const serialized = JSON.stringify(updatedSongs);
      localStorage.setItem("trackdraft-songs", serialized);
    } catch (error) {
      console.error("Failed to save songs to localStorage:", error);
      // Show user-friendly error message (import will be added at top)
      if (typeof window !== 'undefined') {
        // Dynamically import to avoid circular dependencies
        import('./toastStore').then(({ useToastStore }) => {
          useToastStore.getState().showError(
            error instanceof Error && error.name === 'QuotaExceededError'
              ? 'Storage is full. Please delete some songs to free up space.'
              : 'Failed to save song. Please try again.'
          );
        });
      }
    }
  },

  // Auto-save function (called with debouncing from components)
  autoSave: () => {
    get().saveSong();
  },

  loadSong: (songId) => {
    const { songs } = get();
    const song = songs.find((s) => s.id === songId);
    if (song) {
      const cloned = cloneSong(song);
      set({ 
        currentSong: song,
        history: [cloned],
        historyIndex: 0
      });
    }
  },

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex > 0) {
      const previousState = cloneSong(history[historyIndex - 1]);
      set({
        currentSong: previousState,
        historyIndex: historyIndex - 1,
      });
    }
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex < history.length - 1) {
      const nextState = cloneSong(history[historyIndex + 1]);
      set({
        currentSong: nextState,
        historyIndex: historyIndex + 1,
      });
    }
  },

  canUndo: () => {
    const { historyIndex } = get();
    return historyIndex > 0;
  },

  canRedo: () => {
    const { history, historyIndex } = get();
    return historyIndex < history.length - 1;
  },
}));

// Load songs from localStorage on initialization
if (typeof window !== "undefined") {
  try {
    const savedSongs = localStorage.getItem("trackdraft-songs");
    if (savedSongs) {
      const parsed = JSON.parse(savedSongs);
      // Convert date strings back to Date objects
      const songs = parsed.map((song: any) => ({
        ...song,
        createdAt: new Date(song.createdAt),
        updatedAt: new Date(song.updatedAt),
      }));
      useSongStore.setState({ songs });
    }
  } catch (error) {
    console.error("Failed to load songs from localStorage:", error);
    // Show user-friendly error message
    import('./toastStore').then(({ useToastStore }) => {
      useToastStore.getState().showWarning(
        'Some songs may not have loaded correctly. If you see missing data, please check your browser storage.'
      );
    });
  }
}
