import { create } from "zustand";
import { Song, Key, SongSection } from "../types/music";

interface SongState {
  currentSong: Song | null;
  songs: Song[];

  // Actions
  setCurrentSong: (song: Song | null) => void;
  createNewSong: (title?: string) => void;
  updateSong: (updates: Partial<Song>) => void;
  updateKey: (key: Key) => void;
  updateTempo: (tempo: number) => void;
  addSection: (section: SongSection) => void;
  updateSection: (sectionId: string, updates: Partial<SongSection>) => void;
  deleteSection: (sectionId: string) => void;
  reorderSections: (sections: SongSection[]) => void;
  saveSong: () => void;
  loadSong: (songId: string) => void;
}

const createDefaultSong = (title: string = "Untitled Song"): Song => ({
  id: crypto.randomUUID(),
  title,
  key: { root: "C", mode: "major" },
  tempo: 120,
  sections: [],
  createdAt: new Date(),
  updatedAt: new Date(),
});

export const useSongStore = create<SongState>((set, get) => ({
  currentSong: null,
  songs: [],

  setCurrentSong: (song) => set({ currentSong: song }),

  createNewSong: (title) => {
    const newSong = createDefaultSong(title);
    set({ currentSong: newSong });
  },

  updateSong: (updates) => {
    const { currentSong } = get();
    if (!currentSong) return;

    set({
      currentSong: {
        ...currentSong,
        ...updates,
        updatedAt: new Date(),
      },
    });
  },

  updateKey: (key) => {
    get().updateSong({ key });
  },

  updateTempo: (tempo) => {
    get().updateSong({ tempo });
  },

  addSection: (section) => {
    const { currentSong } = get();
    if (!currentSong) return;

    set({
      currentSong: {
        ...currentSong,
        sections: [...currentSong.sections, section],
        updatedAt: new Date(),
      },
    });
  },

  updateSection: (sectionId, updates) => {
    const { currentSong } = get();
    if (!currentSong) return;

    set({
      currentSong: {
        ...currentSong,
        sections: currentSong.sections.map((section) =>
          section.id === sectionId ? { ...section, ...updates } : section
        ),
        updatedAt: new Date(),
      },
    });
  },

  deleteSection: (sectionId) => {
    const { currentSong } = get();
    if (!currentSong) return;

    set({
      currentSong: {
        ...currentSong,
        sections: currentSong.sections.filter(
          (section) => section.id !== sectionId
        ),
        updatedAt: new Date(),
      },
    });
  },

  reorderSections: (sections) => {
    const { currentSong } = get();
    if (!currentSong) return;

    set({
      currentSong: {
        ...currentSong,
        sections,
        updatedAt: new Date(),
      },
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
      localStorage.setItem("trackdraft-songs", JSON.stringify(updatedSongs));
    } catch (error) {
      console.error("Failed to save songs to localStorage:", error);
    }
  },

  loadSong: (songId) => {
    const { songs } = get();
    const song = songs.find((s) => s.id === songId);
    if (song) {
      set({ currentSong: song });
    }
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
  }
}
