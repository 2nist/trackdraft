/**
 * Core music theory types for TrackDraft
 */

/**
 * Represents a musical key with root note and mode
 */
export interface Key {
  /** The root note of the key (e.g., "C", "D", "F#") */
  root: string;
  /** The mode of the key - major or minor */
  mode: "major" | "minor";
}

/**
 * Represents a chord with its harmonic properties
 */
export interface Chord {
  /** Roman numeral representation (e.g., "I", "ii", "V7") */
  romanNumeral: string;
  /** Chord quality (e.g., "major", "minor", "diminished", "augmented") */
  quality: string;
  /** Array of note names in the chord (e.g., ["C", "E", "G"]) */
  notes: string[];
  /** Harmonic function: tonic, subdominant, or dominant */
  function: "tonic" | "subdominant" | "dominant";
  /** Optional: actual chord name (e.g., "C Major", "Am") */
  name?: string;
}

/**
 * Represents a chord progression with emotional context
 */
export interface ChordProgression {
  /** Name of the progression (e.g., "Doo-wop", "Axis of Awesome") */
  name: string;
  /** Array of chords in the progression */
  chords: Chord[];
  /** Emotional context or vibe of the progression */
  emotionalContext: string;
  /** Optional: difficulty level */
  difficulty?: "beginner" | "intermediate" | "advanced";
}

/**
 * Represents a section of a song (verse, chorus, bridge, etc.)
 */
export interface SongSection {
  /** Unique identifier for the section */
  id: string;
  /** Type of section */
  type: "intro" | "verse" | "chorus" | "bridge" | "outro";
  /** Optional: chord progression for this section */
  chords?: Chord[];
  /** Optional: lyrics for this section */
  lyrics?: string;
  /** Optional: melody data (MIDI notes or audio) */
  melody?: MIDINote[] | string;
  /** Duration in bars */
  duration?: number;
  /** Optional: narrative purpose from MAP template */
  narrativePurpose?: string;
}

/**
 * MIDI note representation
 */
export interface MIDINote {
  /** MIDI note number (0-127) */
  note: number;
  /** Start time in seconds */
  time: number;
  /** Duration in seconds */
  duration: number;
  /** Optional: velocity (0-127) */
  velocity?: number;
}

/**
 * Represents a complete song
 */
export interface Song {
  /** Unique identifier for the song */
  id: string;
  /** Title of the song */
  title: string;
  /** Key of the song */
  key: Key;
  /** Tempo in BPM */
  tempo: number;
  /** Array of song sections */
  sections: SongSection[];
  /** Optional: Main chord progression for the song */
  progression?: Chord[];
  /** Creation timestamp */
  createdAt: Date;
  /** Last update timestamp */
  updatedAt: Date;
}

/**
 * Melody analysis results
 */
export interface MelodyAnalysis {
  /** Average pitch value */
  averagePitch: number;
  /** Pitch range (max - min) */
  pitchRange: number;
  /** Sum of absolute intervals */
  intervalSum: number;
  /** Notes per bar */
  noteDensity: number;
  /** Percentage of stepwise motion vs leaps */
  stepwisePercent: number;
  /** Rhythmic complexity score */
  rhythmicComplexity: number;
}

/**
 * Contrast score between two melodies
 */
export interface ContrastScore {
  /** Pitch contrast score (0-100) */
  pitchContrast: number;
  /** Rhythmic contrast score (0-100) */
  rhythmicContrast: number;
  /** Motion contrast score (0-100) */
  motionContrast: number;
  /** Overall contrast score (0-100) */
  overallContrast: number;
  /** Array of recommendations */
  recommendations: string[];
}
