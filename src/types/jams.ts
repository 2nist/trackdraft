/**
 * JAMS (JSON Annotated Music Specification) Types
 * Based on JAMS specification v0.3.4
 */

/**
 * JAMS File Structure
 */
export interface JAMSFile {
  file_metadata: JAMSFileMetadata;
  annotations: JAMSAnnotation[];
  sandbox?: any;
}

/**
 * File Metadata
 */
export interface JAMSFileMetadata {
  title: string;
  artist?: string;
  duration?: number;
  release?: string;
  identifiers?: {
    source?: string;
    [key: string]: any;
  };
  jams_version: string;
}

/**
 * Annotation Metadata
 */
export interface JAMSAnnotationMetadata {
  curator?: {
    name: string;
  };
  version?: string;
  corpus?: string;
  data_source?: string;
  annotation_rules?: string;
  annotation_tools?: string;
  [key: string]: any;
}

/**
 * Annotation Data Point
 */
export interface JAMSDataPoint {
  time: number;
  duration?: number;
  value: any;
  confidence?: number;
}

/**
 * JAMS Annotation
 */
export interface JAMSAnnotation {
  namespace: string;
  annotation_metadata: JAMSAnnotationMetadata;
  data: JAMSDataPoint[];
  sandbox?: any;
}

/**
 * TrackDraft Project Format (for conversion)
 */
export interface TrackDraftProject {
  version: string;
  metadata: {
    title: string;
    artist?: string;
    album?: string;
    bpm: number;
    key: string;
    timeSignature: {
      numerator: number;
      denominator: number;
    };
    created: string;
    modified: string;
    tags?: string[];
  };
  structure: {
    sections: TrackDraftSection[];
    totalDuration: number;
    totalBars: number;
  };
  harmony?: {
    progressions?: Array<{
      id: string;
      name: string;
      key: {
        root: number;
        scale: ScaleType;
      };
      chords: TrackDraftChord[];
      tags?: string[];
      usageCount?: number;
      created?: string;
      modified?: string;
    }>;
  };
}

/**
 * TrackDraft Section (imported)
 */
export interface TrackDraftSection {
  id: string;
  name: string;
  type: 'intro' | 'verse' | 'chorus' | 'bridge' | 'outro' | 'transition';
  bars: number;
  tempo: number;
  key: {
    root: number;
    scale: 'major' | 'minor';
  };
  timeSignature: {
    numerator: number;
    denominator: number;
  };
  startTime: number;
  endTime: number;
  startBar: number;
  color?: number;
  chords?: TrackDraftChord[];
}

/**
 * TrackDraft Chord (imported)
 */
export interface TrackDraftChord {
  root: number;
  type: string;
  duration: number;
  startBeat: number;
  confidence?: number;
}

/**
 * Chord Type
 */
export type ChordType =
  | 'major'
  | 'minor'
  | 'dim'
  | 'dim7'
  | 'aug'
  | 'sus2'
  | 'sus4'
  | '7'
  | 'm7'
  | 'maj7'
  | 'm7b5';

/**
 * Scale Type
 */
export type ScaleType = 'major' | 'minor';

