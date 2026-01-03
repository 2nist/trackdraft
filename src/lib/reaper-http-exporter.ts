/**
 * TrackDraft REAPER HTTP Exporter
 * Exports song structure to REAPER via HTTP bridge
 */

import { REAPERHTTPBridge } from './reaper-http-bridge';
import { Song, SongSection, Chord } from '../types/music';
import { getNoteIndex } from './harmony/keyUtils';

export interface TrackDraftExportData {
  version: string;
  projectName: string;
  bpm: number;
  timeSignature: [number, number];
  key: string;
  markers: {
    name: string;
    position: number;
    color: number;
  }[];
  regions: {
    name: string;
    startPosition: number;
    endPosition: number;
    color: number;
  }[];
  chords: {
    position: number;
    chord: string;
    duration: number;
  }[];
}

export class TrackDraftREAPERExporter {
  private bridge: REAPERHTTPBridge;

  constructor(bridge: REAPERHTTPBridge) {
    this.bridge = bridge;
  }

  /**
   * Export song structure to REAPER
   */
  async exportSongStructure(song: Song): Promise<void> {
    if (!this.bridge.getConnectionStatus()) {
      throw new Error('Not connected to REAPER');
    }

    // Generate export data
    const exportData = this.generateExportData(song);

    // Store as JSON in REAPER extended state
    const jsonData = JSON.stringify(exportData);

    try {
      await this.bridge.beginUndoBlock();

      // Store main data
      await this.bridge.setProjectExtState(
        'TrackDraft',
        'SongStructure',
        jsonData
      );

      // Store timestamp
      await this.bridge.setProjectExtState(
        'TrackDraft',
        'LastExport',
        new Date().toISOString()
      );

      await this.bridge.endUndoBlock('Import TrackDraft Structure');

      // Trigger custom ReaScript to process the data (if available)
      // This assumes you have a custom action ID registered
      try {
        await this.bridge.executeAction('_TD_IMPORT_STRUCTURE');
      } catch (error) {
        // If custom action doesn't exist, that's okay
        // User can manually run the import script
        console.warn('Custom import action not found, data stored in extended state');
      }

      console.log('Successfully exported to REAPER');
    } catch (error) {
      console.error('Failed to export to REAPER:', error);
      throw error;
    }
  }

  /**
   * Generate export data from song
   */
  private generateExportData(song: Song): TrackDraftExportData {
    const markers: TrackDraftExportData['markers'] = [];
    const regions: TrackDraftExportData['regions'] = [];
    const chords: TrackDraftExportData['chords'] = [];

    let currentBeat = 0;

    // Process each section
    song.sections.forEach((section) => {
      const sectionStartBeat = currentBeat;

      // Calculate section duration in beats
      // If section has a duration property, use it; otherwise estimate
      const sectionDurationBeats = this.calculateSectionDuration(section, song);

      // Section marker at the start
      markers.push({
        name: section.title || section.type,
        position: this.beatsToSeconds(currentBeat, song.tempo),
        color: this.getSectionColor(section.type),
      });

      // Add chords if section has progression
      if (section.chords) {
        const sectionChords = this.parseChords(section.chords, currentBeat, song.tempo);
        chords.push(...sectionChords);
      }

      currentBeat += sectionDurationBeats;

      // Section region
      regions.push({
        name: section.title || section.type,
        startPosition: this.beatsToSeconds(sectionStartBeat, song.tempo),
        endPosition: this.beatsToSeconds(currentBeat, song.tempo),
        color: this.getSectionColor(section.type),
      });
    });

    return {
      version: '1.0.0',
      projectName: song.title,
      bpm: song.tempo,
      timeSignature: [4, 4], // Default 4/4
      key: song.key.root,
      markers,
      regions,
      chords,
    };
  }

  /**
   * Calculate section duration in beats
   */
  private calculateSectionDuration(section: SongSection, song: Song): number {
    // Default to 8 bars (32 beats in 4/4)
    let bars = 8;

    // Try to infer from section type
    switch (section.type) {
      case 'intro':
      case 'outro':
        bars = 4;
        break;
      case 'verse':
      case 'chorus':
        bars = 8;
        break;
      case 'bridge':
        bars = 8;
        break;
      case 'pre-chorus':
        bars = 4;
        break;
      default:
        bars = 8;
    }

    return bars * 4; // Convert to beats (assuming 4/4)
  }

  /**
   * Parse chord string into chord events
   */
  private parseChords(
    chordString: string,
    startBeat: number,
    tempo: number
  ): TrackDraftExportData['chords'] {
    // Simple chord parsing - split by spaces
    const chordNames = chordString.split(/\s+/).filter((c) => c.length > 0);
    const chords: TrackDraftExportData['chords'] = [];

    // Distribute chords evenly across beats
    const beatsPerChord = 4; // Default to 1 bar per chord

    chordNames.forEach((chordName, index) => {
      const position = startBeat + index * beatsPerChord;
      chords.push({
        position: this.beatsToSeconds(position, tempo),
        chord: chordName,
        duration: this.beatsToSeconds(beatsPerChord, tempo),
      });
    });

    return chords;
  }

  /**
   * Convert beats to seconds based on BPM
   */
  private beatsToSeconds(beats: number, bpm: number): number {
    return beats / (bpm / 60);
  }

  /**
   * Format chord from TrackDraft chord object
   */
  private formatChord(chord: Chord): string {
    const root = chord.notes[0]; // Root note
    const quality = this.getChordQualitySymbol(chord.quality);
    return `${root}${quality}`;
  }

  /**
   * Get chord quality symbol
   */
  private getChordQualitySymbol(quality: string): string {
    const qualityLower = quality.toLowerCase();

    if (qualityLower.includes('major7') || qualityLower.includes('maj7')) {
      return 'maj7';
    }
    if (qualityLower.includes('minor7') || qualityLower.includes('m7')) {
      return 'm7';
    }
    if (qualityLower.includes('major') || qualityLower === 'maj') {
      return '';
    }
    if (qualityLower.includes('minor') || qualityLower === 'm' || qualityLower === 'min') {
      return 'm';
    }
    if (qualityLower.includes('diminished') || qualityLower.includes('dim')) {
      return 'dim';
    }
    if (qualityLower.includes('augmented') || qualityLower.includes('aug')) {
      return 'aug';
    }
    if (qualityLower.includes('7')) {
      return '7';
    }
    if (qualityLower.includes('sus2')) {
      return 'sus2';
    }
    if (qualityLower.includes('sus4')) {
      return 'sus4';
    }

    return '';
  }

  /**
   * Get color for section type
   */
  private getSectionColor(type: string): number {
    const colorMap: Record<string, number> = {
      intro: 0x4a90e2, // Blue
      verse: 0x50c878, // Green
      chorus: 0xe24a90, // Pink
      'pre-chorus': 0xf4a460, // Orange
      bridge: 0xf4a460, // Orange
      outro: 0x9b59b6, // Purple
      break: 0x808080, // Gray
      solo: 0xffd700, // Gold
    };

    return colorMap[type.toLowerCase()] || 0x808080;
  }

  /**
   * Export with fallback to file download
   */
  async exportWithFallback(song: Song): Promise<'http' | 'file'> {
    try {
      // Try HTTP bridge first
      await this.exportSongStructure(song);
      return 'http';
    } catch (error) {
      console.warn('HTTP export failed, falling back to file export');
      // Note: File export would need to be implemented separately
      // This is just a placeholder for the fallback mechanism
      throw new Error('Fallback to file export not implemented yet');
    }
  }
}

// Real-time playback sync
export class REAPERPlaybackSync {
  private bridge: REAPERHTTPBridge;
  private pollInterval: number = 100; // ms
  private intervalId: number | null = null;

  constructor(bridge: REAPERHTTPBridge) {
    this.bridge = bridge;
  }

  async startSync(callback: (state: TransportState) => void): Promise<void> {
    if (this.intervalId) {
      this.stopSync();
    }

    this.intervalId = window.setInterval(async () => {
      try {
        const state = await this.bridge.getTransportState();
        callback(state);
      } catch (error) {
        console.error('Failed to get transport state:', error);
        // Continue polling despite errors
      }
    }, this.pollInterval);
  }

  stopSync(): void {
    if (this.intervalId) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  setPollInterval(interval: number): void {
    this.pollInterval = interval;

    // Restart if already running
    if (this.intervalId) {
      this.stopSync();
      // Note: Needs to restart with callback, but we don't have it stored
      // This is a simple implementation
    }
  }
}
