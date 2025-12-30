import { create } from "zustand";
import { Chord, Key } from "../types/music";

/**
 * Named progression that can be assigned to sections
 */
export interface NamedProgression {
  id: string;
  name: string;
  progression: Chord[];
  key: Key;
  createdAt: string;
  updatedAt: string;
}

interface ProgressionState {
  progressions: NamedProgression[];
  loadProgressions: () => void;
  saveProgression: (progression: NamedProgression) => void;
  deleteProgression: (id: string) => void;
  updateProgression: (id: string, updates: Partial<NamedProgression>) => void;
}

export const useProgressionStore = create<ProgressionState>((set, get) => ({
  progressions: [],

  loadProgressions: () => {
    if (typeof window === "undefined") return;

    try {
      const stored = localStorage.getItem("trackdraft-progressions");
      if (stored) {
        const parsed = JSON.parse(stored);
        set({ progressions: parsed });
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

  deleteProgression: (id: string) => {
    const { progressions } = get();
    const updatedProgressions = progressions.filter((p) => p.id !== id);

    set({ progressions: updatedProgressions });

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(
          "trackdraft-progressions",
          JSON.stringify(updatedProgressions)
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
}));

// Load progressions on initialization
if (typeof window !== "undefined") {
  useProgressionStore.getState().loadProgressions();
}

