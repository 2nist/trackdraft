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
  chords: Array<{ notes: string[]; beats?: number }>,
  chordDuration: string = '2n',
  tempo: number = 120
): Promise<void> {
  // Start Tone.js if not already started
  if (Tone.context.state !== 'running') {
    await Tone.start();
  }

  // Set tempo
  Tone.Transport.bpm.value = tempo;

  // Calculate cumulative time for each chord based on beats
  let cumulativeTime = 0;
  
  // Schedule each chord
  chords.forEach((chord) => {
    const beats = chord.beats || 2; // Default to 2 beats if not specified
    
    // Convert beats to Tone.js duration notation
    // 1 beat = '4n' (quarter note), 2 beats = '2n' (half note), 4 beats = '1n' (whole note)
    let duration: string;
    if (beats === 1) {
      duration = '4n';
    } else if (beats === 2) {
      duration = '2n';
    } else if (beats === 4) {
      duration = '1n';
    } else {
      // For other values, use quarter note multiples
      duration = `${beats * 4}n`;
    }
    
    const time = `+${cumulativeTime}`;
    const frequencies = chord.notes.map((note) => noteToFrequency(note));
    synth.triggerAttackRelease(frequencies, duration, time);
    
    // Increment time by beats (each beat is a quarter note in Tone.js)
    cumulativeTime += beats;
  });
}

