/**
 * Import utilities for converting external formats to TrackDraft Song format
 */

import { Song, Key, SongSection, Chord } from '../types/music';
import { TrackDraftProject, TrackDraftChord } from '../types/jams';
import { getNoteIndex } from './harmony/keyUtils';

/**
 * Convert TrackDraftProject to Song format
 */
export function trackDraftProjectToSong(project: TrackDraftProject): Song {
  // TrackDraft key strings are commonly like "C major" / "F# minor", but can be inconsistent.
  // Default to C major if parsing fails.
  const keyString = (project.metadata.key || '').trim();
  const match = keyString.match(/^([A-G](?:#|b)?)(?:\s+(\w+))?$/i);
  const root = (match?.[1] ?? 'C').toUpperCase();
  const modeRaw = (match?.[2] ?? 'major').toLowerCase();
  const mode: Key['mode'] =
    modeRaw === 'minor' || modeRaw === 'major'
      ? (modeRaw as Key['mode'])
      : 'major';

  // Convert sections
  const sections: SongSection[] = project.structure.sections.map((section) => {
    // Convert chords if present
    const chords: Chord[] | undefined = section.chords
      ? section.chords.map((chord) => trackDraftChordToChord(chord, { root, mode }))
      : undefined;

    return {
      id: section.id,
      // TrackDraft allows a "transition" section; TrackDraft SongSection does not.
      // Treat transitions as bridges by default so they remain visible/editable.
      type: (section.type === 'transition' ? 'bridge' : section.type) as SongSection['type'],
      duration: section.bars,
      chords,
      // Note: lyrics and melody not in TrackDraftProject format
      // Can be added manually after import
    };
  });

  const song: Song = {
    id: crypto.randomUUID(),
    title: project.metadata.title,
    key: { root, mode },
    tempo: project.metadata.bpm,
    sections,
    progression: undefined, // Could extract from sections if needed
    createdAt: new Date(project.metadata.created),
    updatedAt: new Date(project.metadata.modified),
  };

  return song;
}

/**
 * Convert TrackDraftChord to Chord format
 * This is a simplified conversion - full conversion would require key context
 */
function trackDraftChordToChord(trackDraftChord: TrackDraftChord, key: Key): Chord {
  const noteNames = [
    'C',
    'C#',
    'D',
    'D#',
    'E',
    'F',
    'F#',
    'G',
    'G#',
    'A',
    'A#',
    'B',
  ];

  const normalizedRootIndex =
    Number.isFinite(trackDraftChord.root) ? ((trackDraftChord.root % 12) + 12) % 12 : 0;
  const rootNote = noteNames[normalizedRootIndex];
  
  // Map chord type to quality string
  const typeToQuality: { [key: string]: string } = {
    major: 'major',
    minor: 'minor',
    dim: 'diminished',
    dim7: 'diminished',
    aug: 'augmented',
    sus2: 'sus2',
    sus4: 'sus4',
    '7': 'dominant7',
    m7: 'minor7',
    maj7: 'major7',
    m7b5: 'half-diminished',
  };

  const quality = typeToQuality[trackDraftChord.type] || trackDraftChord.type;

  // Generate chord name
  const chordName = `${rootNote}${quality === 'minor' ? 'm' : quality === 'major' ? '' : quality}`;

  // For now, use a simple roman numeral approximation
  // Full conversion would require key analysis
  const rootIndex = normalizedRootIndex;
  const keyRootIndex = getNoteIndex(key.root);
  const interval = (rootIndex - keyRootIndex + 12) % 12;
  
  const romanNumerals = ['I', 'bII', 'II', 'bIII', 'III', 'IV', 'bV', 'V', 'bVI', 'VI', 'bVII', 'VII'];
  const romanNumeral = romanNumerals[interval] || 'I';

  // Generate notes (simplified - full implementation would use music theory)
  const notes = generateChordNotes(rootNote, quality);

  return {
    romanNumeral,
    quality,
    notes,
    function: determineFunction(interval, quality),
    name: chordName,
    beats: trackDraftChord.duration,
  };
}

/**
 * Generate notes for a chord (simplified)
 */
function generateChordNotes(root: string, quality: string): string[] {
  const notes = [
    'C',
    'C#',
    'D',
    'D#',
    'E',
    'F',
    'F#',
    'G',
    'G#',
    'A',
    'A#',
    'B',
  ];

  const rootIndex = notes.indexOf(root);
  if (rootIndex === -1) return [root];

  const intervals: { [key: string]: number[] } = {
    major: [0, 4, 7],
    minor: [0, 3, 7],
    diminished: [0, 3, 6],
    augmented: [0, 4, 8],
    sus2: [0, 2, 7],
    sus4: [0, 5, 7],
    dominant7: [0, 4, 7, 10],
    minor7: [0, 3, 7, 10],
    major7: [0, 4, 7, 11],
    'half-diminished': [0, 3, 6, 10],
  };

  const chordIntervals = intervals[quality] || intervals.major;
  return chordIntervals.map((interval) => notes[(rootIndex + interval) % 12]);
}

/**
 * Determine harmonic function from interval and quality
 */
function determineFunction(interval: number, quality: string): 'tonic' | 'subdominant' | 'dominant' {
  // Simplified function detection based on scale-degree distance from key root.
  // interval is semitone distance (0-11) from key root -> chord root.
  //
  // Common-practice approximations:
  // - Tonic: I (0), iii (4), vi (9)
  // - Subdominant: ii (2), IV (5), bII (1)
  // - Dominant: V (7), vii° (11), bVII (10)
  if (interval === 0 || interval === 4 || interval === 9) return 'tonic';
  if (interval === 2 || interval === 5 || interval === 1) return 'subdominant';
  if (interval === 7 || interval === 11 || interval === 10) return 'dominant';

  // Heuristic: sevenths tend to feel dominant when they aren't clearly tonic/subdominant.
  if (quality.includes('7')) return 'dominant';

  return 'tonic';
}

