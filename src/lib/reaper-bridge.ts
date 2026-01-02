/**
 * Reaper Bridge Service
 * Manages HTTP connection to Reaper bridge
 */

import {
  BridgeCommand,
  BridgeResponse,
  CreateArrangementCommand,
  CreateChordTrackCommand,
  CreateMidiCommand,
  StartRecordingCommand,
  StopRecordingCommand,
  AnalyzeAudioToMidiCommand,
  DisplayLyricsCommand,
  ArmTrackGroupCommand,
  PlayCommand,
  StopCommand,
  SetPositionCommand,
  GetProjectInfoCommand,
  GetCurrentSectionCommand,
  SyncHardwareCommand,
  GetTimelineStateCommand,
  SyncToReaperCommand,
  TimelineState,
  SyncToReaperResponse,
  GetTimelineStateResponse,
} from '../types/bridge-protocol';
import { SongSection, Chord, Song, Key } from '../types/music';
import { getNoteIndex } from './harmony/keyUtils';

/**
 * Reaper Bridge Service Class
 */
export class ReaperBridge {
  private baseUrl = 'http://127.0.0.1:8888';
  private connected = false;
  private reconnectInterval: NodeJS.Timeout | null = null;
  private syncVersion: number = 0;
  private pollInterval: NodeJS.Timeout | null = null;
  private onTimelineChange?: (state: TimelineState) => void;

  constructor() {
    this.startHeartbeat();
  }

  /**
   * Connect to Reaper bridge
   */
  async connect(): Promise<boolean> {
    try {
      const response = await this.send({ command: 'ping' });
      this.connected = response.success;
      return this.connected;
    } catch (error) {
      this.connected = false;
      return false;
    }
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.connected;
  }

  /**
   * Send command to Reaper
   */
  private async send(command: BridgeCommand): Promise<BridgeResponse> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(command),
      });

      if (!response.ok) {
        throw new Error(`Bridge error: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      this.connected = false;
      throw error;
    }
  }

  /**
   * Convert key to numeric representation (0-11, where C=0)
   */
  private keyToNumber(key: Key): number {
    return getNoteIndex(key.root);
  }

  /**
   * Convert chord quality to Reaper format
   */
  private chordQualityToType(quality: string): string {
    const qualityLower = quality.toLowerCase();
    if (qualityLower.includes('major') || qualityLower === '' || qualityLower === 'maj') {
      return 'maj';
    }
    if (qualityLower.includes('minor') || qualityLower === 'm') {
      return 'min';
    }
    if (qualityLower.includes('diminished') || qualityLower.includes('dim')) {
      return 'dim';
    }
    if (qualityLower.includes('augmented') || qualityLower.includes('aug')) {
      return 'aug';
    }
    if (qualityLower.includes('7')) {
      if (qualityLower.includes('major') || qualityLower.includes('maj')) {
        return 'maj7';
      }
      if (qualityLower.includes('minor') || qualityLower.includes('m')) {
        return 'min7';
      }
      return '7'; // dominant 7
    }
    if (qualityLower.includes('sus2')) {
      return 'sus2';
    }
    if (qualityLower.includes('sus4')) {
      return 'sus4';
    }
    return 'maj'; // default
  }

  /**
   * Convert note name to MIDI note number (0-127)
   * Uses octave 4 as default
   */
  private noteToMidi(note: string, octave: number = 4): number {
    const noteIndex = getNoteIndex(note);
    return (octave + 1) * 12 + noteIndex;
  }

  /**
   * Calculate section start/end times from bars and tempo
   */
  private calculateSectionTimes(
    sections: SongSection[],
    tempo: number
  ): Array<{ startTime: number; endTime: number }> {
    let currentTime = 0;
    const beatsPerSecond = tempo / 60;
    
    return sections.map((section) => {
      const bars = section.duration || 8;
      const beats = bars * 4; // Assuming 4/4 time
      const duration = beats / beatsPerSecond;
      const startTime = currentTime;
      const endTime = currentTime + duration;
      currentTime = endTime;
      return { startTime, endTime };
    });
  }

  /**
   * Create arrangement in Reaper from sections
   */
  async createArrangement(song: Song): Promise<BridgeResponse> {
    const sections = song.sections || [];
    if (sections.length === 0) {
      return {
        success: false,
        error: 'No sections to create arrangement',
      };
    }

    const times = this.calculateSectionTimes(sections, song.tempo);
    const keyNumber = this.keyToNumber(song.key);

    const command: CreateArrangementCommand = {
      command: 'create_arrangement',
      sections: sections.map((section, index) => ({
        name: section.type.charAt(0).toUpperCase() + section.type.slice(1),
        bars: section.duration || 8,
        tempo: song.tempo,
        key: keyNumber,
        startTime: times[index].startTime,
        endTime: times[index].endTime,
        color: this.getSectionColor(section.type),
      })),
    };

    return this.send(command);
  }

  /**
   * Get color for section type (0xBBGGRR format)
   */
  private getSectionColor(type: string): number {
    const colors: Record<string, number> = {
      intro: 0x808080,      // Gray
      verse: 0x000080,      // Dark blue
      chorus: 0x00ffff,     // Yellow (0x00FFFF in BBGGRR = yellow)
      bridge: 0xff00ff,     // Purple (0xFF00FF in BBGGRR = purple)
      outro: 0x808080,      // Gray
    };
    return colors[type.toLowerCase()] || 0x808080;
  }

  /**
   * Create chord track in Reaper
   */
  async createChordTrack(song: Song): Promise<BridgeResponse> {
    const sections = song.sections || [];
    if (sections.length === 0) {
      return {
        success: false,
        error: 'No sections available',
      };
    }

    // Convert chords to Reaper format
    const sectionData = sections.map((section) => {
      const chords = section.chords || song.progression || [];
      let currentBeat = 0;
      
      const chordData = chords.map((chord) => {
        const rootNote = chord.notes[0] || 'C';
        const rootIndex = getNoteIndex(rootNote);
        const chordType = this.chordQualityToType(chord.quality);
        const duration = chord.beats || 2;
        const startBeat = currentBeat;
        currentBeat += duration;
        
        return {
          root: rootIndex,
          type: chordType,
          duration,
          startBeat,
        };
      });

      return {
        name: section.type.charAt(0).toUpperCase() + section.type.slice(1),
        bars: section.duration || 8,
        tempo: song.tempo,
        chords: chordData,
      };
    });

    const command: CreateChordTrackCommand = {
      command: 'create_chord_track',
      sections: sectionData,
    };

    return this.send(command);
  }

  /**
   * Create MIDI item in Reaper
   */
  async createMidi(
    track: number,
    notes: Array<{
      pitch: number;
      velocity: number;
      start_ppq: number;
      end_ppq: number;
      channel: number;
    }>
  ): Promise<BridgeResponse> {
    if (notes.length === 0) {
      return {
        success: false,
        error: 'No notes to create MIDI item',
      };
    }

    const command: CreateMidiCommand = {
      command: 'create_midi',
      track,
      start: notes[0]?.start_ppq || 0,
      end: notes[notes.length - 1]?.end_ppq || 1920, // Default 1 bar at 480 PPQ
      notes,
    };

    return this.send(command);
  }

  /**
   * Start recording in Reaper
   */
  async startRecording(section?: string): Promise<BridgeResponse> {
    const command: StartRecordingCommand = {
      command: 'start_recording',
      section,
    };
    return this.send(command);
  }

  /**
   * Stop recording
   */
  async stopRecording(): Promise<BridgeResponse> {
    const command: StopRecordingCommand = {
      command: 'stop_recording',
    };
    return this.send(command);
  }

  /**
   * Arm/disarm track group
   */
  async armTrackGroup(
    group: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8,
    armed: boolean
  ): Promise<BridgeResponse> {
    const command: ArmTrackGroupCommand = {
      command: 'arm_track_group',
      group,
      armed,
    };
    return this.send(command);
  }

  /**
   * Analyze audio to MIDI
   */
  async analyzeAudioToMidi(
    trackName: string,
    outputTrack: string
  ): Promise<BridgeResponse> {
    const command: AnalyzeAudioToMidiCommand = {
      command: 'analyze_audio_to_midi',
      trackName,
      outputTrack,
    };
    return this.send(command);
  }

  /**
   * Display lyrics in Reaper
   */
  async displayLyrics(
    section: string,
    lines: string[],
    syllableTiming?: number[]
  ): Promise<BridgeResponse> {
    const command: DisplayLyricsCommand = {
      command: 'display_lyrics',
      section,
      lines,
      syllableTiming,
    };
    return this.send(command);
  }

  /**
   * Play in Reaper
   */
  async play(): Promise<BridgeResponse> {
    const command: PlayCommand = {
      command: 'play',
    };
    return this.send(command);
  }

  /**
   * Stop playback in Reaper
   */
  async stop(): Promise<BridgeResponse> {
    const command: StopCommand = {
      command: 'stop',
    };
    return this.send(command);
  }

  /**
   * Set playback position
   */
  async setPosition(position: number): Promise<BridgeResponse> {
    const command: SetPositionCommand = {
      command: 'set_position',
      position,
    };
    return this.send(command);
  }

  /**
   * Get project info
   */
  async getProjectInfo(): Promise<BridgeResponse> {
    const command: GetProjectInfoCommand = {
      command: 'get_project_info',
    };
    return this.send(command);
  }

  /**
   * Get current section
   */
  async getCurrentSection(): Promise<BridgeResponse> {
    const command: GetCurrentSectionCommand = {
      command: 'get_current_section',
    };
    return this.send(command);
  }

  /**
   * Sync hardware
   */
  async syncHardware(
    device: 'apc64' | 'atom' | 'launch',
    sections: Array<{
      name: string;
      bars: number;
      tempo: number;
      key: number;
    }>
  ): Promise<BridgeResponse> {
    const command: SyncHardwareCommand = {
      command: 'sync_hardware',
      device,
      sections,
    };
    return this.send(command);
  }

  /**
   * Get current timeline state from Reaper
   */
  async getTimelineState(): Promise<{ state: TimelineState; changes?: any[] } | null> {
    try {
      const command: GetTimelineStateCommand = {
        command: 'get_timeline_state',
        lastSyncVersion: this.syncVersion,
      };
      const response = await this.send(command);

      if (response.success && response.data) {
        const timelineResponse = response as GetTimelineStateResponse;
        if (timelineResponse.state) {
          return {
            state: timelineResponse.state,
            changes: timelineResponse.changes,
          };
        }
      }
    } catch (error) {
      console.error('Failed to get timeline state:', error);
    }

    return null;
  }

  /**
   * Sync TrackDraft state to Reaper (with conflict handling)
   */
  async syncToReaper(
    sections: SongSection[],
    tempo: number,
    key: Key,
    conflictResolution: 'reaper-wins' | 'trackdraft-wins' | 'merge' = 'trackdraft-wins'
  ): Promise<SyncToReaperResponse> {
    const times = this.calculateSectionTimes(sections, tempo);
    const keyNumber = this.keyToNumber(key);

    const command: SyncToReaperCommand = {
      command: 'sync_to_reaper',
      sections: sections.map((section, index) => ({
        id: section.id,
        name: section.type.charAt(0).toUpperCase() + section.type.slice(1),
        bars: section.duration || 8,
        tempo: tempo,
        key: keyNumber,
        startTime: times[index].startTime,
        endTime: times[index].endTime,
        color: this.getSectionColor(section.type),
      })),
      syncVersion: this.syncVersion,
      conflictResolution,
    };

    const response = await this.send(command);

    if (response.success && (response as SyncToReaperResponse).syncVersion !== undefined) {
      this.syncVersion = (response as SyncToReaperResponse).syncVersion!;
    }

    return response as SyncToReaperResponse;
  }

  /**
   * Start polling Reaper for changes (call on connect)
   */
  startTimelinePolling(
    intervalMs: number = 2000,
    onChangeCallback: (state: TimelineState) => void
  ) {
    this.onTimelineChange = onChangeCallback;

    // Clear existing interval if any
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
    }

    this.pollInterval = setInterval(async () => {
      if (!this.connected) return;

      const result = await this.getTimelineState();

      if (result && result.state.syncVersion > this.syncVersion) {
        // Timeline changed in Reaper!
        console.log('🔄 Timeline changed in Reaper:', result.state);
        if (result.changes && result.changes.length > 0) {
          console.log('Changes:', result.changes);
        }

        this.syncVersion = result.state.syncVersion;

        if (this.onTimelineChange) {
          this.onTimelineChange(result.state);
        }
      }
    }, intervalMs);
  }

  /**
   * Stop polling
   */
  stopTimelinePolling() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
    this.onTimelineChange = undefined;
  }

  /**
   * Check for conflicts before syncing
   */
  async hasConflicts(): Promise<boolean> {
    const result = await this.getTimelineState();
    return result ? result.state.syncVersion > this.syncVersion : false;
  }

  /**
   * Get current sync version
   */
  getSyncVersion(): number {
    return this.syncVersion;
  }

  /**
   * Start heartbeat to maintain connection
   */
  private startHeartbeat() {
    this.reconnectInterval = setInterval(async () => {
      if (!this.connected) {
        await this.connect();
      }
    }, 5000); // Check every 5 seconds
  }

  /**
   * Cleanup
   */
  destroy() {
    if (this.reconnectInterval) {
      clearInterval(this.reconnectInterval);
      this.reconnectInterval = null;
    }
    this.stopTimelinePolling();
  }
}

// Singleton instance
export const reaperBridge = new ReaperBridge();

