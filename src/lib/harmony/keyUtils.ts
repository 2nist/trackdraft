import { Key, Chord } from '../../types/music';

/**
 * Utility functions for working with musical keys and chords
 */

const CHROMATIC_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const FLAT_NOTES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

const MAJOR_SCALE_DEGREES = [0, 2, 4, 5, 7, 9, 11]; // C, D, E, F, G, A, B
const MINOR_SCALE_DEGREES = [0, 2, 3, 5, 7, 8, 10]; // C, D, Eb, F, G, Ab, Bb

const ROMAN_NUMERALS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
const ROMAN_NUMERALS_MINOR = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii'];

/**
 * Get the note name in the preferred format (sharp or flat)
 */
export function getNoteName(noteIndex: number, preferFlats: boolean = false): string {
  return preferFlats ? FLAT_NOTES[noteIndex] : CHROMATIC_NOTES[noteIndex];
}

/**
 * Get the index of a note in the chromatic scale
 */
export function getNoteIndex(note: string): number {
  const sharpIndex = CHROMATIC_NOTES.indexOf(note);
  if (sharpIndex !== -1) return sharpIndex;
  
  const flatIndex = FLAT_NOTES.indexOf(note);
  if (flatIndex !== -1) return flatIndex;
  
  return 0; // Default to C
}

/**
 * Normalize a note name to sharp notation for comparison
 */
export function normalizeNoteName(note: string): string {
  const flatToSharp: Record<string, string> = {
    'Db': 'C#',
    'Eb': 'D#',
    'Gb': 'F#',
    'Ab': 'G#',
    'Bb': 'A#',
  };
  return flatToSharp[note] || note;
}

/**
 * Check if two note names represent the same note
 */
export function notesEqual(note1: string, note2: string): boolean {
  return normalizeNoteName(note1) === normalizeNoteName(note2);
}

/**
 * Get the scale degrees for a given key
 */
export function getScaleDegrees(key: Key): number[] {
  const rootIndex = getNoteIndex(key.root);
  const scalePattern = key.mode === 'major' ? MAJOR_SCALE_DEGREES : MINOR_SCALE_DEGREES;
  
  return scalePattern.map((degree) => (rootIndex + degree) % 12);
}

/**
 * Get the notes in a key's scale
 */
export function getScaleNotes(key: Key): string[] {
  const degrees = getScaleDegrees(key);
  return degrees.map((index) => CHROMATIC_NOTES[index]);
}

/**
 * Convert a roman numeral to a chord in the given key
 */
export function romanNumeralToChord(romanNumeral: string, key: Key): Chord {
  const isMinor = romanNumeral === romanNumeral.toLowerCase();
  const numeralIndex = ROMAN_NUMERALS.indexOf(romanNumeral.toUpperCase());
  
  if (numeralIndex === -1) {
    // Handle extended chords (e.g., "I7", "ii7")
    const baseNumeral = romanNumeral.replace(/[°+7-9sus]/g, '').toUpperCase();
    const baseIndex = ROMAN_NUMERALS.indexOf(baseNumeral);
    if (baseIndex === -1) {
      throw new Error(`Invalid roman numeral: ${romanNumeral}`);
    }
    // For now, return the base chord
    return romanNumeralToChord(baseNumeral, key);
  }
  
  const scaleDegrees = getScaleDegrees(key);
  const rootNoteIndex = scaleDegrees[numeralIndex];
  const rootNote = CHROMATIC_NOTES[rootNoteIndex];
  
  // Determine chord quality
  let quality = 'major';
  let notes: string[] = [];
  
  if (key.mode === 'major') {
    if (numeralIndex === 0 || numeralIndex === 3 || numeralIndex === 4) {
      quality = 'major';
      // Major triad: root, major third, perfect fifth
      notes = [
        CHROMATIC_NOTES[rootNoteIndex],
        CHROMATIC_NOTES[(rootNoteIndex + 4) % 12],
        CHROMATIC_NOTES[(rootNoteIndex + 7) % 12],
      ];
    } else if (numeralIndex === 1 || numeralIndex === 2 || numeralIndex === 5) {
      quality = 'minor';
      // Minor triad: root, minor third, perfect fifth
      notes = [
        CHROMATIC_NOTES[rootNoteIndex],
        CHROMATIC_NOTES[(rootNoteIndex + 3) % 12],
        CHROMATIC_NOTES[(rootNoteIndex + 7) % 12],
      ];
    } else if (numeralIndex === 6) {
      quality = 'diminished';
      // Diminished triad: root, minor third, diminished fifth
      notes = [
        CHROMATIC_NOTES[rootNoteIndex],
        CHROMATIC_NOTES[(rootNoteIndex + 3) % 12],
        CHROMATIC_NOTES[(rootNoteIndex + 6) % 12],
      ];
    }
  } else {
    // Minor key
    if (numeralIndex === 0 || numeralIndex === 3 || numeralIndex === 4) {
      quality = 'minor';
      notes = [
        CHROMATIC_NOTES[rootNoteIndex],
        CHROMATIC_NOTES[(rootNoteIndex + 3) % 12],
        CHROMATIC_NOTES[(rootNoteIndex + 7) % 12],
      ];
    } else if (numeralIndex === 2 || numeralIndex === 5 || numeralIndex === 6) {
      quality = 'major';
      notes = [
        CHROMATIC_NOTES[rootNoteIndex],
        CHROMATIC_NOTES[(rootNoteIndex + 4) % 12],
        CHROMATIC_NOTES[(rootNoteIndex + 7) % 12],
      ];
    }
  }
  
  // Determine function based on key mode
  let chordFunction: 'tonic' | 'subdominant' | 'dominant' = 'tonic';
  if (key.mode === 'major') {
    if (numeralIndex === 0 || numeralIndex === 3 || numeralIndex === 6) {
      chordFunction = 'tonic';
    } else if (numeralIndex === 1 || numeralIndex === 4) {
      chordFunction = 'subdominant';
    } else if (numeralIndex === 2 || numeralIndex === 5) {
      chordFunction = 'dominant';
    }
  } else {
    // Minor key functions
    if (numeralIndex === 0 || numeralIndex === 3) {
      chordFunction = 'tonic';
    } else if (numeralIndex === 1 || numeralIndex === 4 || numeralIndex === 6) {
      chordFunction = 'subdominant';
    } else if (numeralIndex === 2 || numeralIndex === 5) {
      chordFunction = 'dominant';
    }
  }
  
  return {
    romanNumeral,
    quality,
    notes,
    function: chordFunction,
    name: `${rootNote} ${quality}`,
  };
}

/**
 * Get all 12 chromatic notes for key selection
 */
export function getAllNotes(): string[] {
  return CHROMATIC_NOTES;
}

/**
 * Get the circle of fifths order
 */
export function getCircleOfFifths(): string[] {
  // Circle of fifths: C, G, D, A, E, B, F#, C#, G#, D#, A#, F
  const circleOrder = [0, 7, 2, 9, 4, 11, 6, 1, 8, 3, 10, 5];
  return circleOrder.map((index) => CHROMATIC_NOTES[index]);
}

