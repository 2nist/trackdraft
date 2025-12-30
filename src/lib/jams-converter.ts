/**
 * JAMS Converter Service
 * Converts between JAMS format and TrackDraft project format
 * Supports: JAMS, JCRD (Isophonics), McGill Billboard / SALAMI
 */

import {
  JAMSFile,
  JAMSAnnotation,
  TrackDraftProject,
  TrackDraftSection,
  TrackDraftChord,
  ChordType,
  ScaleType,
} from '../types/jams';
import {
  progressionDetector,
  EnhancedProgression,
  EnhancedSection,
} from './progression-detector';

export class JAMSConverter {
  /**
   * Detect format from JSON structure
   */
  detectFormat(json: any): 'jams' | 'jcrd' | 'mcgill-billboard' | 'salami' | 'unknown' {
    // JAMS format
    if (json.file_metadata && json.annotations) {
      return 'jams';
    }

    // JCRD (Isophonics)
    if (
      json.chord_progression &&
      json.sections &&
      json.sections[0]?.start_time !== undefined
    ) {
      return 'jcrd';
    }

    // McGill Billboard / SALAMI
    if (
      json.sections &&
      json.sections[0]?.start_ms !== undefined &&
      json.sections[0]?.sectionType !== undefined
    ) {
      if (json.source?.includes('SALAMI') || json.sections[0]?.tags?.includes('salami_annotated')) {
        return 'salami';
      }
      return 'mcgill-billboard';
    }

    return 'unknown';
  }

  /**
   * Import from McGill Billboard / SALAMI format
   */
  async importFromMcGillBillboard(data: any): Promise<JAMSFile> {
    const totalDuration = this.calculateTotalDuration(data.sections);

    const jams: JAMSFile = {
      file_metadata: {
        title: data.title || 'Untitled',
        artist: data.artist,
        duration: totalDuration,
        identifiers: {
          source: data.source || 'McGill Billboard + SALAMI',
        },
        jams_version: '0.3.4',
      },
      annotations: [],
      sandbox: {},
    };

    // ----------------------------------------
    // 1. Section/Segment Annotation
    // ----------------------------------------
    const segmentData = data.sections.map((s: any) => ({
      time: s.start_ms / 1000, // Convert ms to seconds
      duration: s.duration_ms / 1000,
      value: s.sectionType.toLowerCase(),
      confidence: s.tags?.includes('timing_confidence:high') ? 1.0 : 0.8,
    }));

    jams.annotations.push({
      namespace: 'segment_salami_function',
      annotation_metadata: {
        curator: { name: 'SALAMI Project' },
        version: '2.0',
        corpus: 'McGill Billboard',
        data_source: data.source || 'McGill Billboard + SALAMI',
      },
      data: segmentData,
    });

    // ----------------------------------------
    // 2. Chord Annotation (with timing distribution)
    // ----------------------------------------
    const chordData: any[] = [];

    for (const section of data.sections) {
      if (!section.chords || section.chords.length === 0) continue;

      // Filter out "N" (no chord) markers
      const validChords = section.chords.filter((c: string) => c !== 'N' && c !== '');

      if (validChords.length === 0) continue;

      // Distribute chords evenly across section duration
      const chordDuration = (section.duration_ms / 1000) / validChords.length;
      const sectionStartTime = section.start_ms / 1000;

      validChords.forEach((chord: string, i: number) => {
        chordData.push({
          time: sectionStartTime + i * chordDuration,
          duration: chordDuration,
          value: chord, // Already in Harte notation
          confidence: 0.9,
        });
      });
    }

    if (chordData.length > 0) {
      jams.annotations.push({
        namespace: 'chord_harte',
        annotation_metadata: {
          curator: { name: 'SALAMI Project' },
          version: '2.0',
          corpus: 'McGill Billboard',
          annotation_rules: 'Harte et al. 2005',
          data_source: data.source || 'McGill Billboard + SALAMI',
        },
        data: chordData,
      });
    }

    // ----------------------------------------
    // 3. Tempo Annotation (if available)
    // ----------------------------------------
    if (data.bpm && data.bpm !== 120) {
      // 120 is usually placeholder
      jams.annotations.push({
        namespace: 'tempo',
        annotation_metadata: {
          curator: { name: 'SALAMI Project' },
          version: '2.0',
          data_source: data.source || 'McGill Billboard + SALAMI',
        },
        data: [
          {
            time: 0,
            duration: totalDuration,
            value: data.bpm,
            confidence: 0.7, // Lower confidence for McGill tempo
          },
        ],
      });
    }

    // ----------------------------------------
    // 4. Key Annotation (detect from chords)
    // ----------------------------------------
    const detectedKey = this.detectKeyFromChords(chordData);
    if (detectedKey) {
      jams.annotations.push({
        namespace: 'key_mode',
        annotation_metadata: {
          curator: { name: 'TrackDraft Analysis' },
          version: '1.0.0',
          annotation_tools: 'Key detection from chord progression',
          data_source: 'Computed',
        },
        data: [
          {
            time: 0,
            duration: totalDuration,
            value: detectedKey,
            confidence: 0.8,
          },
        ],
      });
    }

    // ----------------------------------------
    // 5. TrackDraft Sandbox (extended metadata)
    // ----------------------------------------
    jams.sandbox = {
      trackdraft: {
        version: '1.0.0',
        sections: data.sections.map((s: any, i: number) => ({
          id: s.id,
          jams_annotation_index: 0, // Segment annotation
          sectionLetter: s.sectionLetter,
          sectionFunction: s.sectionFunction,
          sectionLabel: s.sectionLabel,
          bars: this.estimateBars(s.duration_ms, data.bpm || 120),
          color: this.getSectionColor(s.sectionType),
          tags: s.tags,
        })),
        source: {
          dataset: data.source || 'McGill Billboard + SALAMI',
          originalFormat: 'McGill Billboard / SALAMI',
        },
      },
    };

    return jams;
  }

  /**
   * Auto-detect format and import
   */
  async importAuto(json: any): Promise<JAMSFile> {
    const format = this.detectFormat(json);

    switch (format) {
      case 'jams':
        return json as JAMSFile;

      case 'jcrd':
        return this.importFromJCRD(json);

      case 'mcgill-billboard':
      case 'salami':
        return this.importFromMcGillBillboard(json);

      default:
        throw new Error(`Unknown format: ${format}`);
    }
  }

  /**
   * Import from JCRD (Isophonics) format
   * Placeholder - to be implemented
   */
  async importFromJCRD(json: any): Promise<JAMSFile> {
    // TODO: Implement JCRD import
    throw new Error('JCRD import not yet implemented');
  }

  /**
   * Convert JAMS to TrackDraft project with optional progression detection
   */
  async jamsToTrackDraft(
    jams: JAMSFile,
    options?: { detectProgressions?: boolean }
  ): Promise<TrackDraftProject> {
    // Find annotations
    const segmentAnnotation = jams.annotations.find((a) =>
      a.namespace.includes('segment')
    );
    const chordAnnotation = jams.annotations.find((a) => a.namespace.includes('chord'));
    const keyAnnotation = jams.annotations.find((a) => a.namespace === 'key_mode');
    const tempoAnnotation = jams.annotations.find((a) => a.namespace === 'tempo');

    // Get default values
    const defaultTempo = (tempoAnnotation?.data[0]?.value as number) || 120;
    const defaultKey = this.parseKeyMode(
      (keyAnnotation?.data[0]?.value as string) || 'C:major'
    );

    // Build sections from segment annotation
    const sections: TrackDraftSection[] = [];

    if (segmentAnnotation) {
      for (let i = 0; i < segmentAnnotation.data.length; i++) {
        const segment = segmentAnnotation.data[i];

        // Get chords for this time range
        const sectionChords = this.getChordsInRange(
          segment.time,
          segment.time + (segment.duration || 0),
          chordAnnotation
        );

        // Get sandbox metadata if available
        const sandboxSection = (jams.sandbox as any)?.trackdraft?.sections?.[i];

        const section: TrackDraftSection = {
          id: sandboxSection?.id || `section_${i}`,
          name: this.capitalizeSectionName(segment.value),
          type: segment.value as TrackDraftSection['type'],
          bars: sandboxSection?.bars || this.estimateBars((segment.duration || 0) * 1000, defaultTempo),
          tempo: defaultTempo,
          key: defaultKey,
          timeSignature: { numerator: 4, denominator: 4 },
          startTime: segment.time,
          endTime: segment.time + (segment.duration || 0),
          startBar: sections.reduce((sum, s) => sum + s.bars, 0),
          color: sandboxSection?.color || this.getSectionColor(segment.value),
          chords: sectionChords,
        };

        sections.push(section);
      }
    }

    // Basic project structure
    let finalSections: TrackDraftSection[] = sections;
    let progressions: EnhancedProgression[] = [];

    // If progression detection is enabled (default: true)
    if (options?.detectProgressions !== false) {
      try {
        const analysis = await progressionDetector.analyzeAndExtractProgressions(
          sections
        );
        finalSections = analysis.sections;
        progressions = analysis.progressions;
      } catch (error) {
        console.warn('Progression detection failed, using basic import:', error);
        // Continue with basic sections if detection fails
      }
    }

    return {
      version: '1.0.0',
      metadata: {
        title: jams.file_metadata.title,
        artist: jams.file_metadata.artist,
        album: jams.file_metadata.release,
        bpm: defaultTempo,
        key: this.formatKeyMode(defaultKey),
        timeSignature: { numerator: 4, denominator: 4 },
        created: new Date().toISOString(),
        modified: new Date().toISOString(),
        tags: ['imported', 'mir-dataset', ...(progressions.length > 0 ? ['detected-progressions'] : [])],
      },
      structure: {
        sections: finalSections,
        totalDuration: jams.file_metadata.duration || 0,
        totalBars: finalSections.reduce((sum, s) => sum + s.bars, 0),
      },
      harmony: {
        progressions: progressions.map((p) => ({
          id: p.id,
          name: p.name,
          key: p.key,
          chords: p.chords,
          tags: p.tags,
          usageCount: p.usageCount,
          created: p.created,
          modified: p.modified,
        })),
      },
    };
  }

  /**
   * Calculate total duration from sections
   */
  private calculateTotalDuration(sections: any[]): number {
    if (sections.length === 0) return 0;

    const lastSection = sections[sections.length - 1];
    return (lastSection.start_ms + lastSection.duration_ms) / 1000;
  }

  /**
   * Estimate bars from duration and tempo
   */
  private estimateBars(durationMs: number, bpm: number): number {
    const durationSeconds = durationMs / 1000;
    const beatsPerSecond = bpm / 60;
    const totalBeats = durationSeconds * beatsPerSecond;
    const bars = Math.round(totalBeats / 4); // Assume 4/4 time
    return Math.max(1, bars);
  }

  /**
   * Get section color based on type
   */
  private getSectionColor(sectionType: string): number {
    const colors: { [key: string]: number } = {
      intro: 0x4a90e2, // Blue
      verse: 0x7ed321, // Green
      chorus: 0xf5a623, // Orange
      bridge: 0xbd10e0, // Purple
      outro: 0x50e3c2, // Cyan
      transition: 0x9013fe, // Purple
    };
    return colors[sectionType.toLowerCase()] || 0x808080;
  }

  /**
   * Detect key from chord progression
   */
  private detectKeyFromChords(chordData: any[]): string | null {
    if (chordData.length === 0) return null;

    // Count chord roots
    const rootCounts: { [key: string]: number } = {};

    for (const chord of chordData) {
      const root = (chord.value as string).split(':')[0]; // "E:maj" -> "E"
      rootCounts[root] = (rootCounts[root] || 0) + 1;
    }

    // Find most common root (likely tonic)
    let maxCount = 0;
    let tonic = '';
    for (const [root, count] of Object.entries(rootCounts)) {
      if (count > maxCount) {
        maxCount = count;
        tonic = root;
      }
    }

    if (!tonic) return null;

    // Detect major vs minor from chord qualities
    let majorCount = 0;
    let minorCount = 0;

    for (const chord of chordData) {
      const value = chord.value as string;
      if (value.includes(':maj')) majorCount++;
      if (value.includes(':min')) minorCount++;
    }

    const mode = majorCount >= minorCount ? 'major' : 'minor';

    return `${tonic}:${mode}`;
  }

  /**
   * Get chords within a time range
   */
  private getChordsInRange(
    startTime: number,
    endTime: number,
    chordAnnotation?: JAMSAnnotation
  ): TrackDraftChord[] {
    if (!chordAnnotation) return [];

    const chords: TrackDraftChord[] = [];

    for (const chordData of chordAnnotation.data) {
      const chordStart = chordData.time;
      const chordEnd = chordData.time + (chordData.duration || 0);

      // Check if chord overlaps with section
      if (chordEnd > startTime && chordStart < endTime) {
        const parsedChord = this.parseHarteChord(chordData.value as string);

        chords.push({
          root: parsedChord.root,
          type: parsedChord.type,
          duration: (chordData.duration || 0) / 0.5, // Convert to beats (approx)
          startBeat: (chordStart - startTime) / 0.5,
          confidence: chordData.confidence,
        });
      }
    }

    return chords;
  }

  /**
   * Parse Harte chord notation
   * Examples: "C:maj", "G:min7", "D:7", "A:sus4"
   */
  private parseHarteChord(harte: string): { root: number; type: ChordType } {
    const [rootStr, qualityStr] = harte.split(':');

    // Parse root
    const rootMap: { [key: string]: number } = {
      C: 0,
      'C#': 1,
      Db: 1,
      D: 2,
      'D#': 3,
      Eb: 3,
      E: 4,
      F: 5,
      'F#': 6,
      Gb: 6,
      G: 7,
      'G#': 8,
      Ab: 8,
      A: 9,
      'A#': 10,
      Bb: 10,
      B: 11,
    };
    const root = rootMap[rootStr] || 0;

    // Parse quality
    const quality = qualityStr || 'maj';

    // Map Harte qualities to TrackDraft chord types
    const typeMap: { [key: string]: ChordType } = {
      maj: 'major',
      maj7: 'maj7',
      maj6: 'maj7', // Approximate
      maj9: 'maj7', // Approximate
      min: 'minor',
      min7: 'm7',
      min9: 'm7', // Approximate
      '7': '7',
      '9': '7', // Approximate
      '13': '7', // Approximate
      dim: 'dim',
      dim7: 'dim7',
      hdim7: 'm7b5',
      aug: 'aug',
      sus2: 'sus2',
      sus4: 'sus4',
    };

    // Handle complex qualities (e.g., "maj6(9)")
    for (const [pattern, chordType] of Object.entries(typeMap)) {
      if (quality.startsWith(pattern)) {
        return { root, type: chordType };
      }
    }

    return { root, type: 'major' };
  }

  /**
   * Parse key:mode notation
   */
  private parseKeyMode(keyMode: string): { root: number; scale: ScaleType } {
    const [rootStr, modeStr] = keyMode.split(':');

    const rootMap: { [key: string]: number } = {
      C: 0,
      'C#': 1,
      Db: 1,
      D: 2,
      'D#': 3,
      Eb: 3,
      E: 4,
      F: 5,
      'F#': 6,
      Gb: 6,
      G: 7,
      'G#': 8,
      Ab: 8,
      A: 9,
      'A#': 10,
      Bb: 10,
      B: 11,
    };
    const root = rootMap[rootStr] || 0;
    const scale: ScaleType = modeStr === 'minor' ? 'minor' : 'major';

    return { root, scale };
  }

  /**
   * Format key for display
   */
  private formatKeyMode(key: { root: number; scale: ScaleType }): string {
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
    return `${notes[key.root]} ${key.scale === 'minor' ? 'Minor' : 'Major'}`;
  }

  /**
   * Capitalize section name
   */
  private capitalizeSectionName(name: string): string {
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  }
}

// Singleton instance
export const jamsConverter = new JAMSConverter();

