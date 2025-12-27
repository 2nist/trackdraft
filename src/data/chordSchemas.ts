import { ChordProgression } from '../types/music';

/**
 * Comprehensive database of four-chord schemas
 * Based on common progressions used in popular music
 */

export interface ChordSchema {
  name: string;
  progression: string[]; // Roman numerals
  rotations: string[][]; // Alternate starting points
  substitutions: string[][]; // Common chord swaps
  emotionalContext: string;
  examples: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export const chordSchemas: ChordSchema[] = [
  {
    name: 'Doo-wop',
    progression: ['I', 'vi', 'IV', 'V'],
    rotations: [
      ['vi', 'IV', 'V', 'I'],
      ['IV', 'V', 'I', 'vi'],
      ['V', 'I', 'vi', 'IV'],
    ],
    substitutions: [
      ['I', 'iii'],
      ['IV', 'ii'],
      ['V', 'vii°'],
    ],
    emotionalContext: 'Nostalgic, Stable, Classic',
    examples: [
      'Stand By Me - Ben E. King',
      'Earth Angel - The Penguins',
      'All I Have to Do Is Dream - The Everly Brothers',
    ],
    difficulty: 'beginner',
  },
  {
    name: 'Singer/Songwriter',
    progression: ['vi', 'IV', 'I', 'V'],
    rotations: [
      ['IV', 'I', 'V', 'vi'],
      ['I', 'V', 'vi', 'IV'],
      ['V', 'vi', 'IV', 'I'],
    ],
    substitutions: [
      ['vi', 'iii'],
      ['IV', 'ii'],
      ['I', 'iii'],
    ],
    emotionalContext: 'Melancholic, Modern, Emotional',
    examples: [
      'Someone Like You - Adele',
      'Let It Be - The Beatles',
      'Hallelujah - Leonard Cohen',
    ],
    difficulty: 'beginner',
  },
  {
    name: 'Hopscotch',
    progression: ['IV', 'V', 'vi', 'I'],
    rotations: [
      ['V', 'vi', 'I', 'IV'],
      ['vi', 'I', 'IV', 'V'],
      ['I', 'IV', 'V', 'vi'],
    ],
    substitutions: [
      ['IV', 'ii'],
      ['V', 'vii°'],
      ['vi', 'iii'],
    ],
    emotionalContext: 'Uplifting, Recent Pop, Energetic',
    examples: [
      'Don\'t Stop Believin\' - Journey',
      'I\'m Yours - Jason Mraz',
      'Poker Face - Lady Gaga',
    ],
    difficulty: 'intermediate',
  },
  {
    name: 'Harmonic Minor',
    progression: ['i', 'VI', 'III', 'VII'],
    rotations: [
      ['VI', 'III', 'VII', 'i'],
      ['III', 'VII', 'i', 'VI'],
      ['VII', 'i', 'VI', 'III'],
    ],
    substitutions: [
      ['i', 'i°'],
      ['VI', 'iv'],
      ['III', 'III+'],
    ],
    emotionalContext: 'Dark, Intense, Dramatic',
    examples: [
      'Stairway to Heaven - Led Zeppelin',
      'Hotel California - The Eagles',
    ],
    difficulty: 'advanced',
  },
  {
    name: 'Axis of Awesome',
    progression: ['I', 'V', 'vi', 'IV'],
    rotations: [
      ['V', 'vi', 'IV', 'I'],
      ['vi', 'IV', 'I', 'V'],
      ['IV', 'I', 'V', 'vi'],
    ],
    substitutions: [
      ['I', 'iii'],
      ['V', 'vii°'],
      ['vi', 'iii'],
      ['IV', 'ii'],
    ],
    emotionalContext: 'Classic Pop, Versatile, Catchy',
    examples: [
      'Let It Be - The Beatles',
      'Don\'t Stop Believin\' - Journey',
      'I\'m Yours - Jason Mraz',
      'Poker Face - Lady Gaga',
      'No Woman No Cry - Bob Marley',
    ],
    difficulty: 'beginner',
  },
  {
    name: 'Royal Road',
    progression: ['IV', 'V', 'iii', 'vi'],
    rotations: [
      ['V', 'iii', 'vi', 'IV'],
      ['iii', 'vi', 'IV', 'V'],
      ['vi', 'IV', 'V', 'iii'],
    ],
    substitutions: [
      ['IV', 'ii'],
      ['V', 'vii°'],
      ['iii', 'I'],
      ['vi', 'IV'],
    ],
    emotionalContext: 'Japanese Pop/Anime, Nostalgic, Melodic',
    examples: [
      'Various J-Pop and anime theme songs',
    ],
    difficulty: 'intermediate',
  },
  {
    name: 'Andalusian Cadence',
    progression: ['i', 'VII', 'VI', 'V'],
    rotations: [
      ['VII', 'VI', 'V', 'i'],
      ['VI', 'V', 'i', 'VII'],
      ['V', 'i', 'VII', 'VI'],
    ],
    substitutions: [
      ['i', 'i°'],
      ['VII', 'v'],
      ['VI', 'iv'],
    ],
    emotionalContext: 'Spanish/Flamenco, Passionate, Dramatic',
    examples: [
      'Hit the Road Jack - Ray Charles',
      'Stairway to Heaven - Led Zeppelin (bridge)',
    ],
    difficulty: 'advanced',
  },
  {
    name: '50s Progression',
    progression: ['I', 'vi', 'ii', 'V'],
    rotations: [
      ['vi', 'ii', 'V', 'I'],
      ['ii', 'V', 'I', 'vi'],
      ['V', 'I', 'vi', 'ii'],
    ],
    substitutions: [
      ['I', 'iii'],
      ['vi', 'iii'],
      ['ii', 'IV'],
      ['V', 'vii°'],
    ],
    emotionalContext: 'Classic Jazz/Pop, Sophisticated, Smooth',
    examples: [
      'Heart and Soul - Hoagy Carmichael',
      'Blue Moon - Richard Rodgers',
      'All of Me - Gerald Marks',
    ],
    difficulty: 'intermediate',
  },
];

