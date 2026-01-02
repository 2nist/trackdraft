/**
 * Bridge Protocol Types
 * Shared types for communication between TrackDraft and Reaper
 */

/**
 * Base command interface
 */
export interface BridgeCommand {
  command: string;
  [key: string]: any;
}

/**
 * Timeline Management Commands
 */
export interface CreateArrangementCommand extends BridgeCommand {
  command: 'create_arrangement';
  sections: Array<{
    name: string;          // "Verse", "Chorus", etc.
    bars: number;
    tempo: number;
    key: number;           // 0-11 (C=0, C#=1, etc.)
    startTime: number;     // seconds
    endTime: number;       // seconds
    color: number;         // 0xBBGGRR format
  }>;
}

export interface UpdateSectionCommand extends BridgeCommand {
  command: 'update_section';
  sectionId: string;
  changes: Partial<{
    name: string;
    bars: number;
    tempo: number;
    key: number;
    startTime: number;
    endTime: number;
    color: number;
  }>;
}

/**
 * Chord/Harmony Commands
 */
export interface CreateChordTrackCommand extends BridgeCommand {
  command: 'create_chord_track';
  sections: Array<{
    name: string;
    bars: number;      // Section duration in bars
    tempo: number;     // Tempo in BPM
    chords: Array<{
      root: number;      // 0-11
      type: string;      // "maj7", "m7", "7", etc.
      duration: number;  // beats
      startBeat: number;
    }>;
  }>;
}

/**
 * MIDI Generation Commands
 */
export interface CreateMidiCommand extends BridgeCommand {
  command: 'create_midi';
  track: number;
  start: number;
  end: number;
  notes: Array<{
    pitch: number;         // 0-127
    velocity: number;      // 0-127
    start_ppq: number;     // Position in PPQ
    end_ppq: number;
    channel: number;       // 0-15
  }>;
}

/**
 * Audio Recording Commands
 */
export interface ArmTrackGroupCommand extends BridgeCommand {
  command: 'arm_track_group';
  group: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;  // Track group number
  armed: boolean;
}

export interface StartRecordingCommand extends BridgeCommand {
  command: 'start_recording';
  section?: string;          // Optional: auto-stop at section end
}

export interface StopRecordingCommand extends BridgeCommand {
  command: 'stop_recording';
}

/**
 * Audio Analysis Commands
 */
export interface AnalyzeAudioToMidiCommand extends BridgeCommand {
  command: 'analyze_audio_to_midi';
  trackName: string;
  outputTrack: string;
}

/**
 * Lyrics Commands
 */
export interface DisplayLyricsCommand extends BridgeCommand {
  command: 'display_lyrics';
  section: string;
  lines: string[];
  syllableTiming?: number[];
}

/**
 * Playback Control Commands
 */
export interface PlayCommand extends BridgeCommand {
  command: 'play';
}

export interface StopCommand extends BridgeCommand {
  command: 'stop';
}

export interface SetPositionCommand extends BridgeCommand {
  command: 'set_position';
  position: number;          // seconds
}

/**
 * Query Commands
 */
export interface GetProjectInfoCommand extends BridgeCommand {
  command: 'get_project_info';
}

export interface GetCurrentSectionCommand extends BridgeCommand {
  command: 'get_current_section';
}

export interface PingCommand extends BridgeCommand {
  command: 'ping';
}

/**
 * ========================================
 * BIDIRECTIONAL SYNC PROTOCOL
 * ========================================
 */

/**
 * Get current Reaper timeline state
 * TrackDraft calls this to detect changes made in Reaper
 */
export interface GetTimelineStateCommand extends BridgeCommand {
  command: 'get_timeline_state';
  lastSyncVersion?: number; // For delta updates
}

/**
 * Timeline Section (returned from Reaper)
 */
export interface TimelineSection {
  id: string; // TrackDraft section ID
  name: string;
  startTime: number; // seconds
  endTime: number; // seconds
  bars: number; // Calculated from time
  tempo: number;
  key: number; // 0-11 (C=0, C#=1, etc.)
  color: number; // 0xBBGGRR format
  modifiedInReaper: boolean; // True if manually changed in Reaper
}

/**
 * Timeline State (returned from Reaper)
 */
export interface TimelineState {
  syncVersion: number; // Increments on any change
  lastModified: string; // ISO timestamp
  sections: TimelineSection[];
}

/**
 * Change information for timeline updates
 */
export interface TimelineChange {
  sectionId: string;
  changeType: 'moved' | 'resized' | 'renamed' | 'deleted' | 'created';
  oldValue?: any;
  newValue?: any;
}

/**
 * Response for get_timeline_state command
 */
export interface GetTimelineStateResponse extends BridgeResponse {
  success: boolean;
  state: TimelineState;
  changes?: TimelineChange[];
}

/**
 * Sync TrackDraft state to Reaper
 * (Enhanced version of create_arrangement with conflict resolution)
 */
export interface SyncToReaperCommand extends BridgeCommand {
  command: 'sync_to_reaper';
  sections: Array<{
    id: string;
    name: string;
    bars: number;
    tempo: number;
    key: number; // 0-11 (C=0, C#=1, etc.)
    startTime: number; // seconds
    endTime: number; // seconds
    color?: number; // 0xBBGGRR format
  }>;
  syncVersion: number;
  conflictResolution?: 'reaper-wins' | 'trackdraft-wins' | 'merge';
}

/**
 * Conflict information when syncing
 */
export interface SyncConflict {
  sectionId: string;
  reaperValue: any;
  trackdraftValue: any;
  resolution: string;
}

/**
 * Response for sync_to_reaper command
 */
export interface SyncToReaperResponse extends BridgeResponse {
  success: boolean;
  syncVersion: number; // New version after sync
  conflicts?: SyncConflict[];
}

/**
 * Hardware Sync Commands
 */
export interface SyncHardwareCommand extends BridgeCommand {
  command: 'sync_hardware';
  device: 'apc64' | 'atom' | 'launch';
  sections: Array<{
    name: string;
    bars: number;
    tempo: number;
    key: number;
  }>;
}

/**
 * Response Format
 */
export interface BridgeResponse {
  success: boolean;
  data?: any;
  error?: string;
}

/**
 * Union type of all possible commands
 */
export type BridgeCommandUnion =
  | CreateArrangementCommand
  | UpdateSectionCommand
  | CreateChordTrackCommand
  | CreateMidiCommand
  | ArmTrackGroupCommand
  | StartRecordingCommand
  | StopRecordingCommand
  | AnalyzeAudioToMidiCommand
  | DisplayLyricsCommand
  | PlayCommand
  | StopCommand
  | SetPositionCommand
  | GetProjectInfoCommand
  | GetCurrentSectionCommand
  | PingCommand
  | GetTimelineStateCommand
  | SyncToReaperCommand
  | SyncHardwareCommand;

