import { create } from "zustand";
import { ChordSchema } from "../data/chordSchemas";
import { Chord } from "../types/music";

interface SchemaState {
  customSchemas: ChordSchema[];
  loadCustomSchemas: () => void;
  saveCustomSchema: (schema: ChordSchema) => void;
  deleteCustomSchema: (schemaName: string) => void;
  convertProgressionToSchema: (progression: Chord[], name: string) => ChordSchema;
}

export const useSchemaStore = create<SchemaState>((set, get) => ({
  customSchemas: [],

  loadCustomSchemas: () => {
    if (typeof window === "undefined") return;
    
    try {
      const stored = localStorage.getItem("trackdraft-custom-schemas");
      if (stored) {
        const parsed = JSON.parse(stored);
        set({ customSchemas: parsed });
      }
    } catch (error) {
      console.error("Failed to load custom schemas:", error);
    }
  },

  saveCustomSchema: (schema: ChordSchema) => {
    const { customSchemas } = get();
    
    // Check if schema with same name already exists
    const existingIndex = customSchemas.findIndex((s) => s.name === schema.name);
    const updatedSchemas = existingIndex >= 0
      ? customSchemas.map((s, i) => (i === existingIndex ? schema : s))
      : [...customSchemas, schema];

    set({ customSchemas: updatedSchemas });

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("trackdraft-custom-schemas", JSON.stringify(updatedSchemas));
      } catch (error) {
        console.error("Failed to save custom schema:", error);
      }
    }
  },

  deleteCustomSchema: (schemaName: string) => {
    const { customSchemas } = get();
    const updatedSchemas = customSchemas.filter((s) => s.name !== schemaName);
    
    set({ customSchemas: updatedSchemas });

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("trackdraft-custom-schemas", JSON.stringify(updatedSchemas));
      } catch (error) {
        console.error("Failed to delete custom schema:", error);
      }
    }
  },

  convertProgressionToSchema: (progression: Chord[], name: string): ChordSchema => {
    // Extract roman numerals from the progression
    const romanNumerals = progression.map((chord) => chord.romanNumeral);

    // Create a basic schema (simplified - users can enhance later)
    return {
      name,
      progression: romanNumerals,
      rotations: [], // Could generate these automatically, but leaving empty for simplicity
      substitutions: [], // Could generate these automatically, but leaving empty for simplicity
      emotionalContext: "Custom progression",
      examples: [],
      difficulty: "intermediate", // Default to intermediate
    };
  },
}));

// Load custom schemas on initialization
if (typeof window !== "undefined") {
  useSchemaStore.getState().loadCustomSchemas();
}



