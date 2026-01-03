import { create } from "zustand";
import { Chord, Key, ChordInProgression } from "../types/music";

/**
 * Named progression that can be assigned to sections
 * @deprecated Use Progression type instead for new code
 */
export interface NamedProgression {
  id: string;
  name: string;
  progression: Chord[];
  key: Key;
  createdAt: string;
  updatedAt: string;
}

/**
 * Enhanced named progression with beat-based timing
 */
export interface EnhancedNamedProgression {
  id: string;
  name: string;
  chords: ChordInProgression[];
  key: Key;
  timeSignature: [number, number];
  totalBeats: number;
  bpm: number;
  sectionType?: "verse" | "chorus" | "bridge" | "pre-chorus" | "intro" | "outro";
  createdAt: string;
  updatedAt: string;
}

/**
 * Convert legacy progression to enhanced format
 */
export function migrateProgression(legacy: NamedProgression): EnhancedNamedProgression {
  let currentBeat = 0;
  const chords: ChordInProgression[] = legacy.progression.map((chord, index) => {
    const durationBeats = chord.durationBeats ?? chord.beats ?? 2;
    const chordInProg: ChordInProgression = {
      ...chord,
      id: `${legacy.id}-chord-${index}`,
      durationBeats,
      startBeat: currentBeat,
    };
    currentBeat += durationBeats;
    return chordInProg;
  });

  return {
    id: legacy.id,
    name: legacy.name,
    chords,
    key: legacy.key,
    timeSignature: [4, 4],
    totalBeats: currentBeat || 16,
    bpm: 120,
    createdAt: legacy.createdAt,
    updatedAt: legacy.updatedAt,
  };
}

/**
 * Convert enhanced progression back to legacy format for compatibility
 */
export function toLegacyProgression(enhanced: EnhancedNamedProgression): NamedProgression {
  return {
    id: enhanced.id,
    name: enhanced.name,
    progression: enhanced.chords.map(chord => ({
      ...chord,
      beats: chord.durationBeats,
    })),
    key: enhanced.key,
    createdAt: enhanced.createdAt,
    updatedAt: enhanced.updatedAt,
  };
}

interface ProgressionState {
  progressions: NamedProgression[];
  enhancedProgressions: EnhancedNamedProgression[];
  loadProgressions: () => void;
  saveProgression: (progression: NamedProgression) => void;
  saveEnhancedProgression: (progression: EnhancedNamedProgression) => void;
  deleteProgression: (id: string) => void;
  updateProgression: (id: string, updates: Partial<NamedProgression>) => void;
  updateEnhancedProgression: (id: string, updates: Partial<EnhancedNamedProgression>) => void;
  getEnhancedProgression: (id: string) => EnhancedNamedProgression | undefined;
}

export const useProgressionStore = create<ProgressionState>((set, get) => ({
  progressions: [],
  enhancedProgressions: [],

  loadProgressions: () => {
    if (typeof window === "undefined") return;

    try {
      // Load legacy progressions
      const stored = localStorage.getItem("trackdraft-progressions");
      if (stored) {
        const parsed = JSON.parse(stored);
        set({ progressions: parsed });
      }

      // Load enhanced progressions
      const enhancedStored = localStorage.getItem("trackdraft-enhanced-progressions");
      if (enhancedStored) {
        const parsed = JSON.parse(enhancedStored);
        set({ enhancedProgressions: parsed });
      }
    } catch (error) {
      console.error("Failed to load progressions:", error);
    }
  },

  saveProgression: (progression: NamedProgression) => {
    const { progressions } = get();

    // Check if progression with same id already exists
    const existingIndex = progressions.findIndex((p) => p.id === progression.id);
    const updatedProgressions =
      existingIndex >= 0
        ? progressions.map((p, i) => (i === existingIndex ? progression : p))
        : [...progressions, progression];

    set({ progressions: updatedProgressions });

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(
          "trackdraft-progressions",
          JSON.stringify(updatedProgressions)
        );
      } catch (error) {
        console.error("Failed to save progression:", error);
      }
    }
  },

  saveEnhancedProgression: (progression: EnhancedNamedProgression) => {
    const { enhancedProgressions } = get();

    const existingIndex = enhancedProgressions.findIndex((p) => p.id === progression.id);
    const updatedProgressions =
      existingIndex >= 0
        ? enhancedProgressions.map((p, i) => (i === existingIndex ? progression : p))
        : [...enhancedProgressions, progression];

    set({ enhancedProgressions: updatedProgressions });

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(
          "trackdraft-enhanced-progressions",
          JSON.stringify(updatedProgressions)
        );
      } catch (error) {
        console.error("Failed to save enhanced progression:", error);
      }
    }
  },

  deleteProgression: (id: string) => {
    const { progressions, enhancedProgressions } = get();
    const updatedProgressions = progressions.filter((p) => p.id !== id);
    const updatedEnhanced = enhancedProgressions.filter((p) => p.id !== id);

    set({ progressions: updatedProgressions, enhancedProgressions: updatedEnhanced });

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(
          "trackdraft-progressions",
          JSON.stringify(updatedProgressions)
        );
        localStorage.setItem(
          "trackdraft-enhanced-progressions",
          JSON.stringify(updatedEnhanced)
        );
      } catch (error) {
        console.error("Failed to delete progression:", error);
      }
    }
  },

  updateProgression: (id: string, updates: Partial<NamedProgression>) => {
    const { progressions } = get();
    const updatedProgressions = progressions.map((p) =>
      p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
    );

    set({ progressions: updatedProgressions });

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(
          "trackdraft-progressions",
          JSON.stringify(updatedProgressions)
        );
      } catch (error) {
        console.error("Failed to update progression:", error);
      }
    }
  },

  updateEnhancedProgression: (id: string, updates: Partial<EnhancedNamedProgression>) => {
    const { enhancedProgressions } = get();
    const updatedProgressions = enhancedProgressions.map((p) =>
      p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
    );

    set({ enhancedProgressions: updatedProgressions });

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(
          "trackdraft-enhanced-progressions",
          JSON.stringify(updatedProgressions)
        );
      } catch (error) {
        console.error("Failed to update enhanced progression:", error);
      }
    }
  },

  getEnhancedProgression: (id: string) => {
    const { enhancedProgressions, progressions } = get();
    
    // First check enhanced progressions
    const enhanced = enhancedProgressions.find((p) => p.id === id);
    if (enhanced) return enhanced;

    // Fall back to migrating legacy progression
    const legacy = progressions.find((p) => p.id === id);
    if (legacy) return migrateProgression(legacy);

    return undefined;
  },
}));

// Load progressions on initialization
if (typeof window !== "undefined") {
  useProgressionStore.getState().loadProgressions();
}

