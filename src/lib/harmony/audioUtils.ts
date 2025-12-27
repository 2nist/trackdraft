import * as Tone from 'tone';

/**
 * Audio utilities for chord playback
 */

/**
 * Convert a note name (e.g., "C", "C#", "Db") to a frequency
 * Uses octave 4 by default
 */
export function noteToFrequency(note: string, octave: number = 4): number {
  // Normalize note name
  const normalized = note.toUpperCase().trim();
  
  // Map note names to semitones from C
  const noteMap: Record<string, number> = {
    'C': 0,
    'C#': 1, 'DB': 1,
    'D': 2,
    'D#': 3, 'EB': 3,
    'E': 4,
    'F': 5,
    'F#': 6, 'GB': 6,
    'G': 7,
    'G#': 8, 'AB': 8,
    'A': 9,
    'A#': 10, 'BB': 10,
    'B': 11,
  };

  // Extract base note (handle both sharp and flat notation)
  let baseNote = normalized;
  if (normalized.includes('#')) {
    baseNote = normalized;
  } else if (normalized.length > 1 && normalized[1] === 'B') {
    baseNote = normalized.substring(0, 2);
  } else {
    baseNote = normalized[0];
  }

  const semitones = noteMap[baseNote] ?? 0;
  const midiNote = (octave + 1) * 12 + semitones;
  
  return Tone.Frequency(midiNote, 'midi').toFrequency();
}

/**
 * Play a chord using Tone.js
 */
export async function playChord(
  synth: Tone.PolySynth,
  notes: string[],
  duration: string = '2n'
): Promise<void> {
  const frequencies = notes.map((note) => noteToFrequency(note));
  synth.triggerAttackRelease(frequencies, duration);
}

/**
 * Play a chord progression in sequence
 */
export async function playProgression(
  synth: Tone.PolySynth,
  chords: Array<{ notes: string[] }>,
  chordDuration: string = '2n',
  tempo: number = 120
): Promise<void> {
  // Start Tone.js if not already started
  if (Tone.context.state !== 'running') {
    await Tone.start();
  }

  // Set tempo
  Tone.Transport.bpm.value = tempo;

  // Schedule each chord
  chords.forEach((chord, index) => {
    const time = `+${index * 2}`; // Each chord plays 2 beats apart
    const frequencies = chord.notes.map((note) => noteToFrequency(note));
    synth.triggerAttackRelease(frequencies, chordDuration, time);
  });
}

