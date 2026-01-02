import { Chord, Key } from '../../types/music';
import { romanNumeralToChord, getScaleDegrees } from './keyUtils';

/**
 * Bridge building strategies and suggestions
 */

export interface ChordSuggestion {
  chord: Chord;
  reason: string;
  strength: 'safe' | 'moderate' | 'spicy';
}

export interface RhythmSuggestion {
  type: string;
  description: string;
  example: string;
}

export interface PerspectivePrompt {
  category: string;
  prompts: string[];
  examples: string[];
}

/**
 * Get chord suggestions for bridge (avoiding Tonic, using IV or V)
 */
export function getBridgeChordSuggestions(key: Key, currentProgression: Chord[]): ChordSuggestion[] {
  const suggestions: ChordSuggestion[] = [];
  
  // Avoid the tonic chord - use IV or V instead
  const scaleDegrees = getScaleDegrees(key);
  const romanNumerals = key.mode === 'major'
    ? ['IV', 'V', 'ii', 'vi', 'iii']
    : ['iv', 'v', 'VI', 'VII', 'III'];
  
  // Get non-tonic chords
  for (const romanNumeral of romanNumerals) {
    try {
      const chord = romanNumeralToChord(romanNumeral, key);
      
      // Check if this chord is already in the progression
      const isInProgression = currentProgression.some(
        (c) => c.romanNumeral === chord.romanNumeral
      );
      
      if (!isInProgression) {
        let strength: 'safe' | 'moderate' | 'spicy' = 'safe';
        let reason = '';
        
        if (romanNumeral === 'IV' || romanNumeral === 'iv') {
          reason = 'Subdominant - provides contrast while staying in key';
          strength = 'safe';
        } else if (romanNumeral === 'V' || romanNumeral === 'v') {
          reason = 'Dominant - creates tension and leads back to chorus';
          strength = 'safe';
        } else if (romanNumeral === 'ii' || romanNumeral === 'vi') {
          reason = 'Provides color while maintaining function';
          strength = 'moderate';
        } else {
          reason = 'Adds harmonic interest';
          strength = 'moderate';
        }
        
        suggestions.push({ chord, reason, strength });
      }
    } catch (error) {
      continue;
    }
  }
  
  return suggestions;
}

/**
 * Get non-diatonic chord options (borrowed from parallel minor/major)
 */
export function getBorrowedChords(key: Key): ChordSuggestion[] {
  const suggestions: ChordSuggestion[] = [];
  
  // Parallel key
  const parallelKey: Key = {
    root: key.root,
    mode: key.mode === 'major' ? 'minor' : 'major',
  };
  
  // Common borrowed chords
  const borrowedNumerals = key.mode === 'major'
    ? ['bIII', 'bVI', 'bVII', 'iv'] // Borrowed from minor
    : ['III', 'VI', 'VII', 'IV']; // Borrowed from major
  
  for (const romanNumeral of borrowedNumerals) {
    try {
      // Map to actual parallel key numerals
      const parallelNumeral = key.mode === 'major'
        ? romanNumeral.replace('b', '').toLowerCase()
        : romanNumeral.toUpperCase();
      
      const chord = romanNumeralToChord(parallelNumeral, parallelKey);
      
      const isSpicy = ['bIII', 'bVI', 'bVII'].includes(romanNumeral) || 
                      ['III', 'VI', 'VII'].includes(romanNumeral);
      
      suggestions.push({
        chord: {
          ...chord,
          romanNumeral, // Keep the flat notation for display
        },
        reason: isSpicy 
          ? `Borrowed from ${parallelKey.mode} - adds dramatic color`
          : `Borrowed from ${parallelKey.mode} - safe but interesting`,
        strength: isSpicy ? 'spicy' : 'moderate',
      });
    } catch (error) {
      continue;
    }
  }
  
  return suggestions;
}

/**
 * Get rhythm change suggestions
 */
export function getRhythmSuggestions(): RhythmSuggestion[] {
  return [
    {
      type: 'Anticipate Downbeats',
      description: 'Start phrases slightly before the beat for forward momentum',
      example: 'Instead of hitting on beat 1, start on the "and" of beat 4',
    },
    {
      type: 'Syncopation',
      description: 'Emphasize off-beats to create rhythmic interest',
      example: 'Accent beats 2 and 4 instead of 1 and 3',
    },
    {
      type: 'Half-Time Feel',
      description: 'Slow down the perceived tempo while keeping the same BPM',
      example: 'Double the note values - whole notes become half notes',
    },
    {
      type: 'Double-Time Feel',
      description: 'Speed up the perceived tempo',
      example: 'Halve the note values - quarter notes become eighth notes',
    },
    {
      type: 'Rhythmic Rest',
      description: 'Use strategic silence for impact',
      example: 'Rest on the downbeat, then enter on beat 2',
    },
  ];
}

/**
 * Get meter change suggestions
 */
export function getMeterSuggestions(currentMeter: string = '4/4'): Array<{
  meter: string;
  description: string;
  bars: number;
}> {
  if (currentMeter === '4/4') {
    return [
      {
        meter: '3/4',
        description: 'Waltz feel - creates a different groove',
        bars: 2,
      },
      {
        meter: '6/8',
        description: 'Compound time - flowing, lyrical feel',
        bars: 2,
      },
      {
        meter: '5/4',
        description: 'Odd meter - creates tension and interest',
        bars: 2,
      },
    ];
  }
  
  return [
    {
      meter: '4/4',
      description: 'Return to common time',
      bars: 2,
    },
  ];
}

/**
 * Get perspective shift writing prompts
 */
export function getPerspectivePrompts(): PerspectivePrompt[] {
  return [
    {
      category: 'Future Thinking',
      prompts: [
        'What happens next?',
        'What would you do differently?',
        'Where do you see this going?',
        'What if things changed?',
        'Someday, when...',
        'Maybe when...',
        'What would it take to...',
      ],
      examples: [
        '"Someday we\'ll find ourselves"',
        '"Maybe when the stars align"',
        '"What if we started over"',
      ],
    },
    {
      category: 'Moral of the Story',
      prompts: [
        'What did you learn?',
        'What is the takeaway?',
        'What would you tell someone else?',
        'What is the truth you discovered?',
        'What matters most?',
      ],
      examples: [
        '"The truth is, we all need love"',
        '"I learned that time heals all wounds"',
        '"What matters is how we treat each other"',
      ],
    },
    {
      category: 'Crisis at Act 2',
      prompts: [
        'What is the breaking point?',
        'What is the worst that could happen?',
        'What is the moment of truth?',
        'What decision must be made?',
        'What is the turning point?',
      ],
      examples: [
        '"This is where it all falls apart"',
        '"I can\'t keep pretending"',
        '"Something has to change"',
      ],
    },
    {
      category: 'Time Shift',
      prompts: [
        'Flash back to the beginning',
        'Jump to the future',
        'Compare then and now',
        'What was it like before?',
        'What will it be like after?',
      ],
      examples: [
        '"Remember when we first met"',
        '"Years from now, we\'ll look back"',
        '"Before all this happened"',
      ],
    },
    {
      category: 'New Perspective',
      prompts: [
        'See it from their point of view',
        'What would an outsider say?',
        'What does it look like from above?',
        'How would you explain it to a child?',
        'What would your future self say?',
      ],
      examples: [
        '"If you could see what I see"',
        '"From the outside looking in"',
        '"Imagine if you were me"',
      ],
    },
  ];
}

/**
 * Calculate harmonic tension/intensity
 */
export function calculateHarmonicTension(chord: Chord, key: Key): number {
  // Tension based on function and distance from tonic
  let tension = 0;
  
  if (chord.function === 'dominant') {
    tension = 80;
  } else if (chord.function === 'subdominant') {
    tension = 40;
  } else if (chord.function === 'tonic') {
    tension = 10;
  }
  
  // Add tension for non-diatonic chords
  if (chord.romanNumeral.includes('b') || chord.romanNumeral.includes('#')) {
    tension += 20;
  }
  
  return Math.min(100, tension);
}

