import { Key, Chord } from '../../types/music';

/**
 * Utility functions for working with musical keys and chords
 */

const CHROMATIC_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const FLAT_NOTES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

// Scale degrees for different modes (relative to major scale starting on each degree)
const MAJOR_SCALE_DEGREES = [0, 2, 4, 5, 7, 9, 11]; // Ionian (major): C, D, E, F, G, A, B
const MINOR_SCALE_DEGREES = [0, 2, 3, 5, 7, 8, 10]; // Aeolian (natural minor): C, D, Eb, F, G, Ab, Bb
const DORIAN_SCALE_DEGREES = [0, 2, 3, 5, 7, 9, 10]; // Dorian: C, D, Eb, F, G, A, Bb
const PHRYGIAN_SCALE_DEGREES = [0, 1, 3, 5, 7, 8, 10]; // Phrygian: C, Db, Eb, F, G, Ab, Bb
const LYDIAN_SCALE_DEGREES = [0, 2, 4, 6, 7, 9, 11]; // Lydian: C, D, E, F#, G, A, B
const MIXOLYDIAN_SCALE_DEGREES = [0, 2, 4, 5, 7, 9, 10]; // Mixolydian: C, D, E, F, G, A, Bb
const LOCRIAN_SCALE_DEGREES = [0, 1, 3, 5, 6, 8, 10]; // Locrian: C, Db, Eb, F, Gb, Ab, Bb

const ROMAN_NUMERALS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];

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
  let scalePattern: number[];
  
  switch (key.mode) {
    case 'major':
      scalePattern = MAJOR_SCALE_DEGREES;
      break;
    case 'minor':
      scalePattern = MINOR_SCALE_DEGREES;
      break;
    case 'dorian':
      scalePattern = DORIAN_SCALE_DEGREES;
      break;
    case 'phrygian':
      scalePattern = PHRYGIAN_SCALE_DEGREES;
      break;
    case 'lydian':
      scalePattern = LYDIAN_SCALE_DEGREES;
      break;
    case 'mixolydian':
      scalePattern = MIXOLYDIAN_SCALE_DEGREES;
      break;
    case 'locrian':
      scalePattern = LOCRIAN_SCALE_DEGREES;
      break;
    default:
      scalePattern = MAJOR_SCALE_DEGREES;
  }
  
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
  // Check for flat notation (e.g., "bVII", "bIII")
  const hasFlat = romanNumeral.toLowerCase().startsWith('b');
  const baseNumeralStr = hasFlat ? romanNumeral.slice(1) : romanNumeral;
  
  // Remove extensions/suffixes to get the base numeral (e.g., "I7" -> "I", "vii°" -> "VII")
  const cleanNumeral = baseNumeralStr.replace(/[°+7-9sus]/g, '').toUpperCase();
  const numeralIndex = ROMAN_NUMERALS.indexOf(cleanNumeral);
  
  if (numeralIndex === -1) {
    throw new Error(`Invalid roman numeral: ${romanNumeral}`);
  }
  
  const scaleDegrees = getScaleDegrees(key);
  let rootNoteIndex: number;
  
  if (hasFlat) {
    // For flat notation (e.g., "bVII"), take the normal scale degree and flatten by one semitone
    // In C major, VII = B, so bVII = Bb
    const normalNoteIndex = scaleDegrees[numeralIndex];
    rootNoteIndex = (normalNoteIndex - 1 + 12) % 12;
  } else {
    rootNoteIndex = scaleDegrees[numeralIndex];
  }
  
  const rootNote = CHROMATIC_NOTES[rootNoteIndex];
  
  // Get the third and fifth scale degrees relative to the root
  // For flat chords, use major quality intervals from the flattened root
  let thirdNoteIndex: number;
  let fifthNoteIndex: number;
  
  if (hasFlat) {
    // For flat chords (borrowed chords), use major intervals from the flattened root
    // Major third = +4 semitones, Perfect fifth = +7 semitones
    thirdNoteIndex = (rootNoteIndex + 4) % 12;
    fifthNoteIndex = (rootNoteIndex + 7) % 12;
  } else {
    // For diatonic chords, use the scale degrees
    const thirdDegreeIndex = (numeralIndex + 2) % 7;
    const fifthDegreeIndex = (numeralIndex + 4) % 7;
    thirdNoteIndex = scaleDegrees[thirdDegreeIndex];
    fifthNoteIndex = scaleDegrees[fifthDegreeIndex];
  }
  
  // Calculate intervals in semitones from root
  const thirdIntervalSemitones = (thirdNoteIndex - rootNoteIndex + 12) % 12;
  const fifthIntervalSemitones = (fifthNoteIndex - rootNoteIndex + 12) % 12;
  
  // Determine chord quality based on intervals
  let quality = 'major';
  if (hasFlat) {
    // Flat chords are typically major (borrowed from parallel key)
    quality = 'major';
  } else if (thirdIntervalSemitones === 4 && fifthIntervalSemitones === 7) {
    quality = 'major';
  } else if (thirdIntervalSemitones === 3 && fifthIntervalSemitones === 7) {
    quality = 'minor';
  } else if (thirdIntervalSemitones === 3 && fifthIntervalSemitones === 6) {
    quality = 'diminished';
  } else if (thirdIntervalSemitones === 4 && fifthIntervalSemitones === 8) {
    quality = 'augmented';
  }
  
  // Build the chord notes using the calculated intervals
  const notes = [
    CHROMATIC_NOTES[rootNoteIndex],
    CHROMATIC_NOTES[thirdNoteIndex],
    CHROMATIC_NOTES[fifthNoteIndex],
  ];
  
  // Determine function based on key mode (simplified - can be enhanced)
  let chordFunction: 'tonic' | 'subdominant' | 'dominant' = 'tonic';
  if (numeralIndex === 0) {
    chordFunction = 'tonic';
  } else if (numeralIndex === 1 || numeralIndex === 4) {
    chordFunction = 'subdominant';
  } else if (numeralIndex === 2 || numeralIndex === 5) {
    chordFunction = 'dominant';
  } else if (numeralIndex === 3 || numeralIndex === 6) {
    // IV and vii° typically function as subdominant/dominant depending on context
    chordFunction = numeralIndex === 3 ? 'subdominant' : 'dominant';
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

