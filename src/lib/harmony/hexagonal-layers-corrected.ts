/**
 * Hexagonal Harmony Wheel - Corrected Visual System
 * 
 * Geometry: 6 concentric hexagonal rings, always visible
 * Meaning: Fades in/out based on active layer
 * 
 * Layer structure:
 * - Root (center, always visible)
 * - Diatonic (ring 1: 7 chords)
 * - Extensions (ring 2: 7 chords with 7ths)
 * - Borrowed (ring 3: modal interchange chords)
 * - Substitutions (ring 4: functional substitutes)
 * - Circle of 5ths (ring 5: key relations)
 * - Chromatic (ring 6: raw pitches, neutral)
 */

import { Key } from '../../types/music';
import { getScaleDegrees, getCircleOfFifths } from './keyUtils';
import { PITCH_NAMES } from './constants';

export type Mode = Key['mode'];
export type LayerType = 'root' | 'diatonic' | 'extensions' | 'borrowed' | 'substitutions' | 'circle-fifths' | 'chromatic';

// Helper to get note index (0-11)
function getNoteIndex(note: string): number {
  const CHROMATIC_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const FLAT_NOTES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
  const sharpIndex = CHROMATIC_NOTES.indexOf(note);
  if (sharpIndex !== -1) return sharpIndex;
  const flatIndex = FLAT_NOTES.indexOf(note);
  if (flatIndex !== -1) return flatIndex;
  return 0; // Default to C
}

export interface HexPosition {
  layer: LayerType;
  position: number; // 0-based index in layer
  pitchClass: number; // 0-11 (C=0, C#=1, etc.)
  chord: string; // Display name (e.g., "C", "Am", "C7")
  romanNumeral?: string; // Roman numeral if applicable
  angle: number; // Angle in degrees (0-360)
  color?: string; // Optional color override
  source?: string; // For borrowed chords: source mode
  substitutesFor?: string; // For substitutions: what it replaces
}

export interface HexLayer {
  layer: LayerType;
  radius: number; // Distance from center
  chords: HexPosition[];
}

const CHROMATIC_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Layer radii (distance from center in SVG units)
// Tight packing: center hex (size 50) + gap (8) + regular hex (size 32) = ~90
// Subsequent rings: previous radius + hex size (32) + gap (8) = previous + 40
const RADII = {
  root: 0,
  diatonic: 90,      // Tight against center hex
  extensions: 130,   // Tight against diatonic
  borrowed: 170,     // Tight against extensions
  substitutions: 210, // Tight against borrowed
  'circle-fifths': 250, // Tight against substitutions
  chromatic: 290,    // Tight against circle-fifths
};

// Chord quality colors
const QUALITY_COLORS: Record<string, string> = {
  major: '#4A90E2',
  minor: '#7ED321',
  diminished: '#F5A623',
  augmented: '#BD10E0',
  dominant: '#FF6B6B',
};

// Get chord quality from roman numeral
function getQualityFromRoman(roman: string, mode: Mode): string {
  if (mode === 'major') {
    const qualities: Record<string, string> = {
      'I': 'major', 'ii': 'minor', 'iii': 'minor', 'IV': 'major',
      'V': 'major', 'vi': 'minor', 'vii°': 'diminished'
    };
    return qualities[roman] || 'major';
  } else {
    const qualities: Record<string, string> = {
      'i': 'minor', 'ii°': 'diminished', 'III': 'major', 'iv': 'minor',
      'v': 'minor', 'VI': 'major', 'VII': 'major'
    };
    return qualities[roman] || 'minor';
  }
}

// Generate diatonic layer (6 chords, excluding root since center is I)
function generateDiatonicLayer(rootPitch: number, mode: Mode): HexPosition[] {
  const scaleDegrees = getScaleDegrees({ root: CHROMATIC_NOTES[rootPitch], mode });
  const romanNumerals = mode === 'major'
    ? ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°']
    : ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII'];
  
  // Skip root (index 0), use positions 1-6 for 6 hexagons
  const positions: HexPosition[] = [];
  for (let i = 1; i < 7; i++) {
    const degree = scaleDegrees[i];
    const noteName = CHROMATIC_NOTES[degree];
    const roman = romanNumerals[i];
    const quality = getQualityFromRoman(roman, mode);
    const chordName = quality === 'minor' ? noteName + 'm' : noteName;
    // 6 hexagons evenly spaced: 0°, 60°, 120°, 180°, 240°, 300°
    const angle = (i - 1) * 60;
    
    positions.push({
      layer: 'diatonic',
      position: i - 1, // 0-5 for 6 positions
      pitchClass: degree,
      chord: chordName,
      romanNumeral: roman,
      angle,
      color: QUALITY_COLORS[quality] || '#4A90E2',
    });
  }
  
  return positions;
}

// Generate extensions layer (6 chords, 7th chords excluding root)
function generateExtensionsLayer(rootPitch: number, mode: Mode): HexPosition[] {
  const diatonic = generateDiatonicLayer(rootPitch, mode);
  
  return diatonic.map((diatonicChord) => {
    const extension = diatonicChord.romanNumeral === 'vii°' || diatonicChord.romanNumeral === 'ii°' ? 'ø7' : '7';
    const chordName = diatonicChord.chord + extension;
    
    return {
      ...diatonicChord,
      layer: 'extensions',
      chord: chordName,
      color: '#7ED321',
    };
  });
}

// Generate borrowed chords layer (modal interchange)
function generateBorrowedLayer(rootPitch: number, mode: Mode): HexPosition[] {
  const parallelMode: Mode = mode === 'major' ? 'minor' : 'major';
  const parallelScale = getScaleDegrees({ root: CHROMATIC_NOTES[rootPitch], mode: parallelMode });
  
  const borrowedRomans = mode === 'major'
    ? ['i', 'bIII', 'iv', 'bVI', 'bVII'] // Common borrowed from minor
    : ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII']; // All from major
  
  // Map to actual scale degrees
  const borrowedChords: HexPosition[] = [];
  const romanMap = parallelMode === 'major'
    ? ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°']
    : ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII'];
  
  borrowedRomans.forEach((roman, index) => {
    // Find position in parallel scale
    let degreeIndex = -1;
    if (roman.startsWith('b')) {
      // Flat chords - flatten the major scale degree
      const baseRoman = roman.slice(1);
      const majorIndex = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'].indexOf(baseRoman);
      if (majorIndex >= 0) {
        const majorDegree = getScaleDegrees({ root: CHROMATIC_NOTES[rootPitch], mode: 'major' })[majorIndex];
        degreeIndex = (majorDegree - 1 + 12) % 12;
      }
    } else {
      degreeIndex = romanMap.indexOf(roman);
    }
    
    if (degreeIndex >= 0 && parallelScale[degreeIndex] !== undefined) {
      const degree = parallelScale[degreeIndex];
      const noteName = CHROMATIC_NOTES[degree];
      // 6 hexagons evenly spaced: 0°, 60°, 120°, 180°, 240°, 300°
      const angle = index * 60;
      const chordName = roman.includes('i') || roman.includes('ii') || roman.includes('iv') || roman.includes('v') 
        ? noteName + 'm' 
        : noteName;
      
      borrowedChords.push({
        layer: 'borrowed' as LayerType,
        position: index,
        pitchClass: degree,
        chord: chordName,
        romanNumeral: roman,
        angle,
        color: '#F5A623',
        source: parallelMode,
      });
    }
  });
  
  // Ensure exactly 6 positions (pad if needed, or take first 6)
  return borrowedChords.slice(0, 6).map((chord, i) => ({
    ...chord,
    position: i,
    angle: i * 60, // Recalculate angles for 6 positions
  }));
}

// Generate substitutions layer (functional substitutes)
function generateSubstitutionsLayer(rootPitch: number, mode: Mode): HexPosition[] {
  // Common substitutions: iii substitutes for I, vi substitutes for I, ii substitutes for IV
  const substitutions = mode === 'major'
    ? [
        { from: 'I', to: 'iii', label: 'iii' },
        { from: 'I', to: 'vi', label: 'vi' },
        { from: 'IV', to: 'ii', label: 'ii' },
        { from: 'V', to: 'vii°', label: 'vii°' },
      ]
    : [
        { from: 'i', to: 'III', label: 'III' },
        { from: 'i', to: 'VI', label: 'VI' },
        { from: 'iv', to: 'ii°', label: 'ii°' },
        { from: 'v', to: 'VII', label: 'VII' },
      ];
  
  const diatonic = generateDiatonicLayer(rootPitch, mode);
  const subChords: HexPosition[] = [];
  
  substitutions.forEach((sub, index) => {
    const diatonicChord = diatonic.find(d => d.romanNumeral === sub.to);
    if (diatonicChord) {
      subChords.push({
        ...diatonicChord,
        layer: 'substitutions',
        position: index,
        angle: index * 60, // 6 hexagons: 0°, 60°, 120°, 180°, 240°, 300°
        color: '#BD10E0',
        substitutesFor: sub.from,
      });
    }
  });
  
  // Ensure exactly 6 positions (pad with additional common substitutions if needed)
  while (subChords.length < 6) {
    // Add common substitutions that weren't already included
    const allDiatonic = generateDiatonicLayer(rootPitch, mode);
    const usedRomans = new Set(subChords.map(c => c.romanNumeral));
    const available = allDiatonic.find(d => !usedRomans.has(d.romanNumeral));
    if (available) {
      subChords.push({
        ...available,
        layer: 'substitutions',
        position: subChords.length,
        angle: subChords.length * 60,
        color: '#BD10E0',
        substitutesFor: 'I',
      });
    } else {
      break; // Can't find more, stop
    }
  }
  
  return subChords.slice(0, 6).map((chord, i) => ({
    ...chord,
    position: i,
    angle: i * 60, // Recalculate angles for 6 positions
  }));
}

// Generate circle of fifths layer (6 keys - most closely related)
function generateCircleOfFifthsLayer(rootPitch: number): HexPosition[] {
  const circle = getCircleOfFifths();
  const rootIndex = circle.findIndex(note => getNoteIndex(note) === rootPitch);
  
  // Pick 6 most closely related keys: root + 5 adjacent in circle of fifths
  const relatedKeys: string[] = [];
  for (let i = -2; i <= 3; i++) {
    const idx = (rootIndex + i + circle.length) % circle.length;
    relatedKeys.push(circle[idx]);
  }
  
  return relatedKeys.map((noteName, index) => {
    const pitchClass = getNoteIndex(noteName);
    const angle = index * 60; // 6 hexagons: 0°, 60°, 120°, 180°, 240°, 300°
    
    return {
      layer: 'circle-fifths',
      position: index,
      pitchClass,
      chord: noteName,
      angle,
      color: '#00D4FF',
    };
  });
}

// Generate chromatic layer (12 pitches, neutral)
function generateChromaticLayer(): HexPosition[] {
  // Chromatic layer shows pairs: C/C#, D/D#, etc.
  const pairs = [
    ['C', 'C#'], ['D', 'D#'], ['E', 'F'], ['F#', 'G'], ['G#', 'A'], ['A#', 'B']
  ];
  
  return pairs.map(([note1, note2], index) => {
    const angle = (index * 360) / 6; // 6 pairs
    const pitchClass = getNoteIndex(note1);
    const display = `${note1} / ${note2}`;
    
    return {
      layer: 'chromatic' as LayerType,
      position: index,
      pitchClass,
      chord: display,
      angle,
      color: '#808080', // Neutral gray
    };
  });
}

// Generate root layer (single center node)
function generateRootLayer(rootPitch: number): HexPosition[] {
  return [{
    layer: 'root',
    position: 0,
    pitchClass: rootPitch,
    chord: PITCH_NAMES[rootPitch],
    romanNumeral: 'I',
    angle: 0,
    color: '#667eea',
  }];
}

/**
 * Generate all layers for the hexagonal wheel
 */
export function generateAllLayers(rootPitch: number, mode: Mode): Record<string, HexLayer> {
  return {
    root: {
      layer: 'root',
      radius: RADII.root,
      chords: generateRootLayer(rootPitch),
    },
    diatonic: {
      layer: 'diatonic',
      radius: RADII.diatonic,
      chords: generateDiatonicLayer(rootPitch, mode),
    },
    extensions: {
      layer: 'extensions',
      radius: RADII.extensions,
      chords: generateExtensionsLayer(rootPitch, mode),
    },
    borrowed: {
      layer: 'borrowed',
      radius: RADII.borrowed,
      chords: generateBorrowedLayer(rootPitch, mode),
    },
    substitutions: {
      layer: 'substitutions',
      radius: RADII.substitutions,
      chords: generateSubstitutionsLayer(rootPitch, mode),
    },
    'circle-fifths': {
      layer: 'circle-fifths',
      radius: RADII['circle-fifths'],
      chords: generateCircleOfFifthsLayer(rootPitch),
    },
    chromatic: {
      layer: 'chromatic',
      radius: RADII.chromatic,
      chords: generateChromaticLayer(),
    },
  };
}

