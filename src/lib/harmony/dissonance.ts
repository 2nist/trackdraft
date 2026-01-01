/**
 * Dissonance calculation for harmonic analysis
 */

import { HexPosition } from './hexagonal-layers-corrected';

/**
 * Calculate dissonance value (0-1) for a hex position
 * Higher values = more dissonant/tension
 */
export function calculateDissonance(node: HexPosition): number {
  let dissonance = 0;
  
  // Chromatic layer = neutral (no dissonance assigned)
  if (node.layer === 'chromatic') {
    return 0;
  }
  
  // Root = no dissonance
  if (node.layer === 'root') {
    return 0;
  }
  
  // Diminished chords = high dissonance
  if (node.romanNumeral?.includes('°') || node.chord.includes('°')) {
    dissonance = 0.8;
  }
  
  // Augmented chords = high dissonance
  if (node.chord.includes('+') || node.chord.includes('aug')) {
    dissonance = 0.75;
  }
  
  // Dominant 7th = moderate dissonance
  if (node.chord.includes('7') && !node.chord.includes('maj7') && !node.chord.includes('m7')) {
    dissonance = 0.5;
  }
  
  // Minor 7th = lower dissonance
  if (node.chord.includes('m7')) {
    dissonance = 0.3;
  }
  
  // Major 7th = very low dissonance
  if (node.chord.includes('maj7')) {
    dissonance = 0.2;
  }
  
  // Borrowed chords = moderate dissonance (out of key)
  if (node.layer === 'borrowed') {
    dissonance = Math.max(dissonance, 0.4);
  }
  
  // Substitutions = moderate dissonance (functional replacement)
  if (node.layer === 'substitutions') {
    dissonance = Math.max(dissonance, 0.35);
  }
  
  // Diatonic major = low dissonance
  if (node.layer === 'diatonic' && !node.chord.includes('m') && !node.chord.includes('°')) {
    dissonance = Math.max(dissonance, 0.1);
  }
  
  // Diatonic minor = slightly higher dissonance
  if (node.layer === 'diatonic' && node.chord.includes('m')) {
    dissonance = Math.max(dissonance, 0.2);
  }
  
  // Circle of fifths = very low dissonance (stable key relations)
  if (node.layer === 'circle-fifths') {
    dissonance = 0.15;
  }
  
  return Math.min(1.0, dissonance);
}

