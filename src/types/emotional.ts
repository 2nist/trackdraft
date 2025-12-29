/**
 * Emotional profile types for chord progressions
 */

export type EmotionalTag =
  | "uplifting"
  | "melancholic"
  | "tense"
  | "romantic"
  | "hopeful"
  | "dark"
  | "neutral";

export interface EmotionalProfile {
  primary: EmotionalTag;
  secondary?: EmotionalTag;
  intensity: number; // 1-10 scale
}

export interface ProgressionVibe {
  label: string; // "Uplifting & Anthemic"
  description: string; // "The 'Don't Stop Believin'' Progression"
  famousExamples: Array<{
    artist: string;
    song: string;
    spotifyUrl?: string;
  }>;
  whenToUse: string; // "Choruses that need to soar, triumphant moments"
}

export interface ChordProgressionAnalysis {
  // Technical data
  romanNumerals: string;
  degrees: string[];
  key: string;
  
  // Emotional layer
  emotionalProfile: EmotionalProfile;
  vibe: ProgressionVibe;
  
  // Computed flag
  showTechnicalByDefault: boolean;
}

