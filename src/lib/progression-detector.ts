/**
 * Progression Detection Engine
 * Analyzes imported sections to detect recurring chord patterns
 * and extract them as reusable progressions
 */

import { TrackDraftSection, TrackDraftChord } from '../types/jams';
import { Chord, Key } from '../types/music';
import { ChordType, ScaleType } from '../types/jams';

/**
 * Chord Sequence extracted from a section
 */
interface ChordSequence {
  sectionId: string;
  sectionType: string;
  chords: NormalizedChord[];
  originalChords: TrackDraftChord[];
  key: { root: number; scale: ScaleType };
}

/**
 * Normalized chord (relative to key)
 */
interface NormalizedChord {
  degree: number; // 0-11, relative to key root
  type: ChordType;
  duration: number;
}

/**
 * Detected chord pattern
 */
interface ChordPattern {
  signature: string;
  chords: NormalizedChord[];
  count: number;
  occurrences: Array<{
    sectionId: string;
    sectionType: string;
  }>;
  key: { root: number; scale: ScaleType };
}

/**
 * Progression analysis result
 */
interface ProgressionAnalysis {
  name: string;
  tags: string[];
}

/**
 * Enhanced section with progression link
 */
export interface EnhancedSection extends TrackDraftSection {
  chordProgressionId?: string;
  _originalChords?: TrackDraftChord[];
}

/**
 * Enhanced progression with usage info
 */
export interface EnhancedProgression {
  id: string;
  name: string;
  key: { root: number; scale: ScaleType };
  chords: TrackDraftChord[];
  tags: string[];
  usageCount: number;
  created: string;
  modified: string;
}

/**
 * Analysis result
 */
export interface ProgressionAnalysisResult {
  sections: EnhancedSection[];
  progressions: EnhancedProgression[];
}

export class ProgressionDetector {
  /**
   * Analyze imported project and extract chord progressions
   */
  async analyzeAndExtractProgressions(
    sections: TrackDraftSection[]
  ): Promise<ProgressionAnalysisResult> {
    // 1. Extract all chord sequences from sections
    const chordSequences = this.extractChordSequences(sections);

    // 2. Find recurring patterns
    const patterns = this.findRecurringPatterns(chordSequences);

    // 3. Create progression library
    const progressions = this.createProgressionLibrary(patterns);

    // 4. Link sections to progressions
    const updatedSections = this.linkSectionsToProgressions(
      sections,
      progressions
    );

    return {
      sections: updatedSections,
      progressions,
    };
  }

  /**
   * Extract chord sequences from sections
   */
  private extractChordSequences(sections: TrackDraftSection[]): ChordSequence[] {
    const sequences: ChordSequence[] = [];

    for (const section of sections) {
      if (!section.chords || section.chords.length === 0) continue;

      // Normalize chord sequence (relative to key)
      const normalized = this.normalizeToKey(section.chords, section.key);

      sequences.push({
        sectionId: section.id,
        sectionType: section.type,
        chords: normalized,
        originalChords: section.chords,
        key: section.key,
      });
    }

    return sequences;
  }

  /**
   * Find recurring patterns across sections
   */
  private findRecurringPatterns(sequences: ChordSequence[]): ChordPattern[] {
    const patterns = new Map<string, ChordPattern>();

    for (const sequence of sequences) {
      // Create signature (pattern identifier)
      const signature = this.createSignature(sequence.chords);

      if (patterns.has(signature)) {
        // Pattern already exists, add occurrence
        const pattern = patterns.get(signature)!;
        pattern.occurrences.push({
          sectionId: sequence.sectionId,
          sectionType: sequence.sectionType,
        });
        pattern.count++;
      } else {
        // New pattern
        patterns.set(signature, {
          signature,
          chords: sequence.chords,
          count: 1,
          occurrences: [
            {
              sectionId: sequence.sectionId,
              sectionType: sequence.sectionType,
            },
          ],
          key: sequence.key,
        });
      }
    }

    // Filter: only keep patterns that occur 2+ times
    return Array.from(patterns.values())
      .filter((p) => p.count >= 2)
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Create progression library from patterns
   */
  private createProgressionLibrary(patterns: ChordPattern[]): EnhancedProgression[] {
    const progressions: EnhancedProgression[] = [];

    for (let i = 0; i < patterns.length; i++) {
      const pattern = patterns[i];

      // Analyze pattern (detect common progressions)
      const analysis = this.analyzePattern(pattern);

      // Convert normalized chords back to absolute chords in the pattern's key
      const absoluteChords = this.convertToAbsoluteChords(pattern.chords, pattern.key);

      // Create progression
      const progression: EnhancedProgression = {
        id: `prog_${i + 1}`,
        name: analysis.name || `Progression ${i + 1}`,
        key: pattern.key,
        chords: absoluteChords,
        tags: ['imported', 'detected', ...analysis.tags],
        usageCount: pattern.count,
        created: new Date().toISOString(),
        modified: new Date().toISOString(),
      };

      progressions.push(progression);
    }

    return progressions;
  }

  /**
   * Link sections to detected progressions
   */
  private linkSectionsToProgressions(
    sections: TrackDraftSection[],
    progressions: EnhancedProgression[]
  ): EnhancedSection[] {
    return sections.map((section) => {
      if (!section.chords || section.chords.length === 0) {
        return section as EnhancedSection;
      }

      // Find matching progression
      const normalized = this.normalizeToKey(section.chords, section.key);
      const signature = this.createSignature(normalized);

      const matchingProg = progressions.find((p) => {
        const progNormalized = this.normalizeToKey(p.chords, p.key);
        const progSig = this.createSignature(progNormalized);
        return progSig === signature;
      });

      const enhanced: EnhancedSection = {
        ...section,
        chordProgressionId: matchingProg?.id,
        _originalChords: section.chords, // Keep original for reference
      };

      return enhanced;
    });
  }

  /**
   * Normalize chords to key (make them relative)
   */
  private normalizeToKey(
    chords: TrackDraftChord[],
    key: { root: number; scale: ScaleType }
  ): NormalizedChord[] {
    return chords.map((chord) => ({
      // Relative to key root (0 = tonic)
      degree: (chord.root - key.root + 12) % 12,
      type: chord.type as ChordType,
      duration: chord.duration,
    }));
  }

  /**
   * Convert normalized chords back to absolute chords
   */
  private convertToAbsoluteChords(
    normalized: NormalizedChord[],
    key: { root: number; scale: ScaleType }
  ): TrackDraftChord[] {
    let currentBeat = 0;

    return normalized.map((nc) => {
      const absoluteRoot = (nc.degree + key.root) % 12;

      const chord: TrackDraftChord = {
        root: absoluteRoot,
        type: nc.type,
        duration: nc.duration || 4,
        startBeat: currentBeat,
      };

      currentBeat += chord.duration;

      return chord;
    });
  }

  /**
   * Create signature for pattern matching
   */
  private createSignature(chords: NormalizedChord[]): string {
    return chords.map((c) => `${c.degree}-${c.type}`).join('|');
  }

  /**
   * Analyze pattern and detect common progressions
   */
  private analyzePattern(pattern: ChordPattern): ProgressionAnalysis {
    const signature = pattern.signature;

    // Common progressions (by degree pattern)
    const commonProgressions: { [key: string]: string } = {
      '0-major|5-major|7-major|0-major': 'I-IV-V-I',
      '0-major|7-major|9-minor|5-major': 'I-V-vi-IV', // Axis progression
      '0-major|5-major|0-major|7-major': 'I-IV-I-V',
      '0-minor|10-major|5-major|7-major': 'i-bVII-IV-V',
      '0-major|9-minor|5-major|7-major': 'I-vi-IV-V', // 50s progression
      '9-minor|5-major|0-major|7-major': 'vi-IV-I-V', // Axis progression variant
      '0-major|7-major|2-major|0-major': 'I-V-vi-I',
      '0-major|5-major|7-major|0-major|5-major|7-major': 'I-IV-V-I-IV-V',
      '0-major|9-minor|7-major|0-major': 'I-vi-V-I',
      '0-major|2-major|5-major|0-major': 'I-iii-IV-I',
    };

    let name = commonProgressions[signature];
    const tags: string[] = [];

    if (!name) {
      // Generate descriptive name from roman numerals
      const romanNumerals = [
        'I',
        'bII',
        'II',
        'bIII',
        'III',
        'IV',
        'bV',
        'V',
        'bVI',
        'VI',
        'bVII',
        'VII',
      ];
      name = pattern.chords
        .map((c) => {
          const roman = romanNumerals[c.degree];
          // Add quality indicator
          if (c.type === 'minor') {
            return roman.toLowerCase();
          }
          return roman;
        })
        .join('-');
    } else {
      tags.push('common-progression');
    }

    // Detect genre tags based on pattern
    if (
      signature.includes('0-major|5-major|7-major') ||
      signature.includes('0-major|7-major|9-minor|5-major')
    ) {
      tags.push('pop', 'rock');
    }
    if (
      signature.includes('0-minor|10-major|5-major') ||
      signature.includes('0-minor|10-major|7-major')
    ) {
      tags.push('modern', 'indie');
    }
    if (signature.includes('9-minor|5-major|0-major|7-major')) {
      tags.push('pop', 'anthemic');
    }
    if (
      signature.includes('0-major|9-minor|5-major|7-major') &&
      !signature.includes('9-minor|5-major|0-major')
    ) {
      tags.push('classic', 'ballad');
    }

    return { name, tags };
  }
}

// Singleton instance
export const progressionDetector = new ProgressionDetector();

