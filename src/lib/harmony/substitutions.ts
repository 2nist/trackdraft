import { Chord, Key } from '../../types/music';
import { getScaleDegrees, romanNumeralToChord } from './keyUtils';

/**
 * Chord substitution engine based on music theory
 * Provides intelligent chord alternatives based on common tone, function, and modal interchange
 */

export interface SubstitutionOption {
  chord: Chord;
  reason: string;
  strength: number; // 0-1 score
  sharedNotes?: string[];
  type: 'common-tone' | 'functional' | 'modal-interchange';
}

/**
 * Get chords that share at least 2 notes with the input chord
 * Common tone substitutions maintain harmonic color while changing function
 */
export function getCommonToneSubstitutions(chord: Chord, key: Key): SubstitutionOption[] {
  const substitutions: SubstitutionOption[] = [];
  const chordNotes = new Set(chord.notes.map((n) => n.toUpperCase()));

  // Get all possible chords in the key
  const scaleDegrees = getScaleDegrees(key);
  const romanNumerals = key.mode === 'major'
    ? ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°']
    : ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII'];

  for (let i = 0; i < romanNumerals.length; i++) {
    try {
      const candidate = romanNumeralToChord(romanNumerals[i], key);
      const candidateNotes = new Set(candidate.notes.map((n) => n.toUpperCase()));

      // Find shared notes
      const shared = Array.from(chordNotes).filter((note) => candidateNotes.has(note));

      // If at least 2 notes are shared, it's a valid substitution
      if (shared.length >= 2 && candidate.romanNumeral !== chord.romanNumeral) {
        substitutions.push({
          chord: candidate,
          reason: `Shares ${shared.length} notes: ${shared.join(', ')}`,
          strength: shared.length / Math.max(chordNotes.size, candidateNotes.size),
          sharedNotes: shared,
          type: 'common-tone',
        });
      }
    } catch (error) {
      // Skip invalid chords
      continue;
    }
  }

  // Sort by strength (most shared notes first)
  return substitutions.sort((a, b) => b.strength - a.strength);
}

/**
 * Get chords with similar harmonic function
 * Functional substitutions maintain the harmonic role while changing color
 */
export function getFunctionalSubstitutions(chord: Chord, key: Key): SubstitutionOption[] {
  const substitutions: SubstitutionOption[] = [];

  // Functional harmony rules:
  // - Tonic function: I, iii, vi (in major) or i, III, VI (in minor)
  // - Subdominant function: IV, ii (in major) or iv, ii° (in minor)
  // - Dominant function: V, vii° (in major) or v, VII (in minor)

  const functionMap: Record<string, string[]> = key.mode === 'major'
    ? {
        tonic: ['I', 'iii', 'vi'],
        subdominant: ['IV', 'ii'],
        dominant: ['V', 'vii°'],
      }
    : {
        tonic: ['i', 'III', 'VI'],
        subdominant: ['iv', 'ii°'],
        dominant: ['v', 'VII'],
      };

  const chordFunction = chord.function;
  const alternatives = functionMap[chordFunction] || [];

  for (const romanNumeral of alternatives) {
    try {
      const candidate = romanNumeralToChord(romanNumeral, key);

      // Don't suggest the same chord
      if (candidate.romanNumeral === chord.romanNumeral) continue;

      // Calculate strength based on how closely related they are
      let strength = 0.7; // Base strength for functional equivalence

      // Same function = high strength
      if (candidate.function === chordFunction) {
        strength = 0.9;
      }

      // Check if they share notes (bonus)
      const chordNotes = new Set(chord.notes.map((n) => n.toUpperCase()));
      const candidateNotes = new Set(candidate.notes.map((n) => n.toUpperCase()));
      const shared = Array.from(chordNotes).filter((note) => candidateNotes.has(note));
      if (shared.length > 0) {
        strength = Math.min(1.0, strength + 0.1 * shared.length);
      }

      substitutions.push({
        chord: candidate,
        reason: `Same ${chordFunction} function`,
        strength,
        type: 'functional',
      });
    } catch (error) {
      continue;
    }
  }

  return substitutions.sort((a, b) => b.strength - a.strength);
}

/**
 * Get borrowed chords from parallel major/minor (modal interchange)
 * Adds color and interest by borrowing from the parallel key
 */
export function getModalInterchange(chord: Chord, key: Key): SubstitutionOption[] {
  const substitutions: SubstitutionOption[] = [];

  // Parallel key: same root, different mode
  const parallelKey: Key = {
    root: key.root,
    mode: key.mode === 'major' ? 'minor' : 'major',
  };

  // Get all chords from parallel key
  const parallelRomanNumerals = parallelKey.mode === 'major'
    ? ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°']
    : ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII'];

  for (const romanNumeral of parallelRomanNumerals) {
    try {
      const borrowed = romanNumeralToChord(romanNumeral, parallelKey);

      // Don't suggest the same chord
      if (borrowed.romanNumeral === chord.romanNumeral && borrowed.quality === chord.quality) {
        continue;
      }

      // Determine if it's "spicy" or "safe"
      // Spicy: bIII, bVI, bVII (borrowed from minor in major key)
      // Safe: III, VI, VII (borrowed from major in minor key)
      const isSpicy = key.mode === 'major' && ['bIII', 'bVI', 'bVII'].some((n) =>
        romanNumeral.includes('b') || ['III', 'VI', 'VII'].includes(romanNumeral)
      );

      // Calculate strength based on how "safe" the substitution is
      let strength = isSpicy ? 0.5 : 0.8;

      // Check for shared notes (makes it safer)
      const chordNotes = new Set(chord.notes.map((n) => n.toUpperCase()));
      const borrowedNotes = new Set(borrowed.notes.map((n) => n.toUpperCase()));
      const shared = Array.from(chordNotes).filter((note) => borrowedNotes.has(note));
      if (shared.length >= 2) {
        strength = Math.min(1.0, strength + 0.2);
      }

      substitutions.push({
        chord: borrowed,
        reason: `Borrowed from ${parallelKey.mode} (${isSpicy ? 'spicy' : 'safe'})`,
        strength,
        type: 'modal-interchange',
      });
    } catch (error) {
      continue;
    }
  }

  return substitutions.sort((a, b) => b.strength - a.strength);
}

/**
 * Analyze the strength of a chord progression
 * Returns a score 0-100 based on voice leading, resolution tendency, and functional harmony
 */
export function analyzeProgressionStrength(progression: Chord[]): number {
  if (progression.length < 2) return 50; // Neutral score for single chord

  let score = 50; // Start with neutral
  let totalWeight = 0;

  for (let i = 0; i < progression.length - 1; i++) {
    const current = progression[i];
    const next = progression[i + 1];
    const weight = 1.0 / (progression.length - 1);

    // Voice leading: check for common tones
    const currentNotes = new Set(current.notes.map((n) => n.toUpperCase()));
    const nextNotes = new Set(next.notes.map((n) => n.toUpperCase()));
    const commonTones = Array.from(currentNotes).filter((note) => nextNotes.has(note));
    const voiceLeadingScore = (commonTones.length / Math.max(currentNotes.size, nextNotes.size)) * 30;
    score += voiceLeadingScore * weight;

    // Resolution tendency: dominant to tonic is strong
    if (current.function === 'dominant' && next.function === 'tonic') {
      score += 20 * weight;
    } else if (current.function === 'subdominant' && next.function === 'dominant') {
      score += 15 * weight;
    } else if (current.function === 'subdominant' && next.function === 'tonic') {
      score += 10 * weight;
    }

    // Functional progression: avoid awkward jumps
    const functionOrder = ['tonic', 'subdominant', 'dominant'];
    const currentIndex = functionOrder.indexOf(current.function);
    const nextIndex = functionOrder.indexOf(next.function);

    // Good progressions: forward motion or return to tonic
    if (nextIndex > currentIndex || next.function === 'tonic') {
      score += 10 * weight;
    } else if (nextIndex < currentIndex && next.function !== 'tonic') {
      score -= 5 * weight; // Slight penalty for backward motion
    }

    totalWeight += weight;
  }

  // Normalize to 0-100
  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Get all substitution options for a chord, sorted by type and strength
 */
export function getAllSubstitutions(chord: Chord, key: Key): {
  commonTone: SubstitutionOption[];
  functional: SubstitutionOption[];
  modalInterchange: SubstitutionOption[];
} {
  return {
    commonTone: getCommonToneSubstitutions(chord, key),
    functional: getFunctionalSubstitutions(chord, key),
    modalInterchange: getModalInterchange(chord, key),
  };
}

