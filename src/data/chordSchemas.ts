import { ChordProgression } from '../types/music';

/**
 * Comprehensive database of chord progression schemas
 * Based on common progressions used in popular music across various genres
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
  {
    name: 'Pachelbel',
    progression: ['I', 'V', 'vi', 'iii', 'IV', 'I', 'IV', 'V'],
    rotations: [
      ['V', 'vi', 'iii', 'IV', 'I', 'IV', 'V', 'I'],
      ['vi', 'iii', 'IV', 'I', 'IV', 'V', 'I', 'V'],
      ['iii', 'IV', 'I', 'IV', 'V', 'I', 'V', 'vi'],
    ],
    substitutions: [
      ['I', 'iii'],
      ['V', 'vii°'],
      ['vi', 'ii'],
      ['iii', 'I'],
      ['IV', 'ii'],
    ],
    emotionalContext: 'Classical, Elegant, Timeless',
    examples: [
      'Canon in D - Johann Pachelbel',
      'Basket Case - Green Day (simplified)',
      'Cryin\' - Aerosmith',
    ],
    difficulty: 'advanced',
  },
  {
    name: 'Blues',
    progression: ['I', 'I', 'I', 'I', 'IV', 'IV', 'I', 'I', 'V', 'IV', 'I', 'I'],
    rotations: [
      ['I', 'I', 'I', 'IV', 'IV', 'I', 'I', 'V', 'IV', 'I', 'I', 'I'],
    ],
    substitutions: [
      ['I', 'I7'],
      ['IV', 'IV7'],
      ['V', 'V7'],
    ],
    emotionalContext: 'Soulful, Expressive, Classic',
    examples: [
      'Sweet Home Chicago - Robert Johnson',
      'Crossroads - Cream',
      'Pride and Joy - Stevie Ray Vaughan',
    ],
    difficulty: 'beginner',
  },
  {
    name: 'Jazz Standard',
    progression: ['ii', 'V', 'I', 'vi'],
    rotations: [
      ['V', 'I', 'vi', 'ii'],
      ['I', 'vi', 'ii', 'V'],
      ['vi', 'ii', 'V', 'I'],
    ],
    substitutions: [
      ['ii', 'ii7'],
      ['V', 'V7'],
      ['I', 'Imaj7'],
      ['vi', 'vi7'],
    ],
    emotionalContext: 'Sophisticated, Smooth, Harmonically Rich',
    examples: [
      'Autumn Leaves',
      'All The Things You Are',
      'Take The A Train',
    ],
    difficulty: 'intermediate',
  },
  {
    name: 'Backdoor',
    progression: ['I', 'IV', 'bVII', 'I'],
    rotations: [
      ['IV', 'bVII', 'I', 'I'],
      ['bVII', 'I', 'I', 'IV'],
      ['I', 'I', 'IV', 'bVII'],
    ],
    substitutions: [
      ['I', 'iii'],
      ['IV', 'ii'],
      ['bVII', 'V'],
    ],
    emotionalContext: 'Modal, Modern, Unexpected',
    examples: [
      'Sweet Home Alabama - Lynyrd Skynyrd',
      'All Along The Watchtower - Bob Dylan',
    ],
    difficulty: 'advanced',
  },
  {
    name: 'Plagal Cadence',
    progression: ['I', 'IV', 'I', 'V'],
    rotations: [
      ['IV', 'I', 'V', 'I'],
      ['I', 'V', 'I', 'IV'],
      ['V', 'I', 'IV', 'I'],
    ],
    substitutions: [
      ['I', 'iii'],
      ['IV', 'ii'],
      ['V', 'vii°'],
    ],
    emotionalContext: 'Resolving, Peaceful, Stable',
    examples: [
      'Hey Jude - The Beatles',
      'Let It Be - The Beatles',
      'Hallelujah - Leonard Cohen',
    ],
    difficulty: 'beginner',
  },
  {
    name: 'Circle Progression',
    progression: ['I', 'V', 'ii', 'vi', 'iii', 'vii°', 'IV', 'I'],
    rotations: [
      ['V', 'ii', 'vi', 'iii', 'vii°', 'IV', 'I', 'I'],
      ['ii', 'vi', 'iii', 'vii°', 'IV', 'I', 'I', 'V'],
      ['vi', 'iii', 'vii°', 'IV', 'I', 'I', 'V', 'ii'],
    ],
    substitutions: [
      ['V', 'V7'],
      ['ii', 'ii7'],
      ['vii°', 'vii°7'],
    ],
    emotionalContext: 'Classical, Circular, Flowing',
    examples: [
      'Various classical compositions',
      'Sweet Child O\' Mine - Guns N\' Roses (bridge)',
    ],
    difficulty: 'advanced',
  },
  {
    name: 'Pop Rock',
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
      ['V', 'vii°'],
    ],
    emotionalContext: 'Energetic, Modern, Catchy',
    examples: [
      'Someone Like You - Adele',
      'Complicated - Avril Lavigne',
      'What Makes You Beautiful - One Direction',
    ],
    difficulty: 'beginner',
  },
  {
    name: 'Minor Plagal',
    progression: ['i', 'iv', 'i', 'V'],
    rotations: [
      ['iv', 'i', 'V', 'i'],
      ['i', 'V', 'i', 'iv'],
      ['V', 'i', 'iv', 'i'],
    ],
    substitutions: [
      ['i', 'i°'],
      ['iv', 'ii°'],
      ['V', 'VII'],
    ],
    emotionalContext: 'Melancholic, Dark, Resolved',
    examples: [
      'Stairway to Heaven - Led Zeppelin',
      'Losing My Religion - R.E.M.',
    ],
    difficulty: 'intermediate',
  },
  {
    name: 'Misty',
    progression: ['I', 'vi', 'ii', 'V'],
    rotations: [
      ['vi', 'ii', 'V', 'I'],
      ['ii', 'V', 'I', 'vi'],
      ['V', 'I', 'vi', 'ii'],
    ],
    substitutions: [
      ['I', 'Imaj7'],
      ['vi', 'vi7'],
      ['ii', 'ii7'],
      ['V', 'V7'],
    ],
    emotionalContext: 'Jazz Ballad, Romantic, Intimate',
    examples: [
      'Misty - Erroll Garner',
      'The Girl From Ipanema',
      'Blue Moon (jazz version)',
    ],
    difficulty: 'intermediate',
  },
];

