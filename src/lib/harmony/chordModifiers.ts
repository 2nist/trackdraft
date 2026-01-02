/**
 * Utilities for modifying chords (extend, change quality, transpose, etc.)
 */

import { Chord, Key } from '../../types/music';
import { getNoteIndex, getNoteName } from './keyUtils';

const CHROMATIC_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

/**
 * Extend a chord (add 7th, 9th, 11th, 13th)
 */
export function extendChord(chord: Chord, extension: '7' | '9' | '11' | '13'): Chord {
  const rootNote = chord.name?.split(' ')[0] || chord.notes[0];
  
  // Get current quality
  const isMinor = chord.quality.toLowerCase().includes('minor') || chord.quality === 'm';
  const isDiminished = chord.quality.toLowerCase().includes('diminished') || chord.quality.toLowerCase().includes('dim');
  const isAugmented = chord.quality.toLowerCase().includes('augmented') || chord.quality.toLowerCase().includes('aug');
  
  // Build extension name
  let extensionName = '';
  if (extension === '7') {
    if (isDiminished) {
      extensionName = '°7';
    } else if (isMinor) {
      extensionName = 'm7';
    } else {
      extensionName = '7'; // Dominant 7th
    }
  } else {
    // For 9, 11, 13, preserve quality
    const qualityPrefix = isMinor ? 'm' : isDiminished ? '°' : isAugmented ? '+' : '';
    extensionName = `${qualityPrefix}${extension}`;
  }
  
  // Update roman numeral with extension
  let newRomanNumeral = chord.romanNumeral;
  // Remove existing extensions
  newRomanNumeral = newRomanNumeral.replace(/[7-9sus°+]/g, '');
  // Add new extension
  newRomanNumeral = `${newRomanNumeral}${extensionName}`;
  
  // Update name
  const qualityStr = isMinor ? 'minor' : isDiminished ? 'diminished' : isAugmented ? 'augmented' : 'major';
  const newName = `${rootNote} ${qualityStr} ${extension}`;
  
  return {
    ...chord,
    romanNumeral: newRomanNumeral,
    name: newName,
  };
}

/**
 * Modify chord quality (augmented, diminished, dominant)
 */
export function modifyChordQuality(chord: Chord, quality: 'augmented' | 'diminished' | 'dominant'): Chord {
  const rootNote = chord.name?.split(' ')[0] || chord.notes[0];
  const rootIndex = getNoteIndex(rootNote);
  
  // Calculate new intervals based on quality
  let thirdIndex: number;
  let fifthIndex: number;
  
  if (quality === 'augmented') {
    thirdIndex = (rootIndex + 4) % 12; // Major third
    fifthIndex = (rootIndex + 8) % 12; // Augmented fifth
  } else if (quality === 'diminished') {
    thirdIndex = (rootIndex + 3) % 12; // Minor third
    fifthIndex = (rootIndex + 6) % 12; // Diminished fifth
  } else { // dominant
    thirdIndex = (rootIndex + 4) % 12; // Major third
    fifthIndex = (rootIndex + 7) % 12; // Perfect fifth
  }
  
  const newNotes = [
    CHROMATIC_NOTES[rootIndex],
    CHROMATIC_NOTES[thirdIndex],
    CHROMATIC_NOTES[fifthIndex],
  ];
  
  // Update roman numeral
  let newRomanNumeral = chord.romanNumeral;
  // Remove quality markers
  newRomanNumeral = newRomanNumeral.replace(/[°+]/g, '');
  // Add new quality marker
  if (quality === 'diminished') {
    newRomanNumeral = newRomanNumeral.replace(/([ivx]+)/i, '$1°');
  } else if (quality === 'augmented') {
    newRomanNumeral = newRomanNumeral + '+';
  }
  
  // Update name
  const qualityStr = quality === 'diminished' ? 'diminished' : quality === 'augmented' ? 'augmented' : 'dominant';
  const newName = `${rootNote} ${qualityStr}`;
  
  return {
    ...chord,
    quality,
    notes: newNotes,
    romanNumeral: newRomanNumeral,
    name: newName,
  };
}

/**
 * Add suspension (sus2, sus4)
 */
export function addSuspension(chord: Chord, suspension: 'sus2' | 'sus4'): Chord {
  const rootNote = chord.name?.split(' ')[0] || chord.notes[0];
  const rootIndex = getNoteIndex(rootNote);
  
  // Calculate suspended note
  let suspendedIndex: number;
  if (suspension === 'sus2') {
    suspendedIndex = (rootIndex + 2) % 12; // Major second
  } else { // sus4
    suspendedIndex = (rootIndex + 5) % 12; // Perfect fourth
  }
  
  // Replace third with suspended note
  const fifthIndex = (rootIndex + 7) % 12; // Keep perfect fifth
  const newNotes = [
    CHROMATIC_NOTES[rootIndex],
    CHROMATIC_NOTES[suspendedIndex],
    CHROMATIC_NOTES[fifthIndex],
  ];
  
  // Update roman numeral
  let newRomanNumeral = chord.romanNumeral;
  // Remove existing sus markers
  newRomanNumeral = newRomanNumeral.replace(/sus[24]/g, '');
  // Add new suspension
  newRomanNumeral = `${newRomanNumeral}${suspension}`;
  
  // Update name
  const newName = `${rootNote} ${suspension}`;
  
  return {
    ...chord,
    quality: suspension,
    notes: newNotes,
    romanNumeral: newRomanNumeral,
    name: newName,
  };
}

/**
 * Transpose chord up or down by semitone
 */
export function transposeChord(chord: Chord, direction: 'up' | 'down'): Chord {
  const rootNote = chord.name?.split(' ')[0] || chord.notes[0];
  const rootIndex = getNoteIndex(rootNote);
  
  const newRootIndex = direction === 'up' 
    ? (rootIndex + 1) % 12 
    : (rootIndex - 1 + 12) % 12;
  
  const newRootNote = CHROMATIC_NOTES[newRootIndex];
  
  // Transpose all notes
  const semitoneChange = direction === 'up' ? 1 : -1;
  const newNotes = chord.notes.map(note => {
    const noteIndex = getNoteIndex(note);
    const newIndex = (noteIndex + semitoneChange + 12) % 12;
    return CHROMATIC_NOTES[newIndex];
  });
  
  // Update name (preserve quality and extensions)
  const nameParts = chord.name?.split(' ') || [];
  const qualityAndExtensions = nameParts.slice(1).join(' ');
  const newName = `${newRootNote} ${qualityAndExtensions}`.trim();
  
  return {
    ...chord,
    notes: newNotes,
    name: newName,
  };
}
