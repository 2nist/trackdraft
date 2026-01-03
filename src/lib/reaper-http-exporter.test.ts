import { describe, it, expect, vi, beforeEach } from 'vitest'
import { TrackDraftREAPERExporter } from './reaper-http-exporter'
import { REAPERHTTPBridge } from './reaper-http-bridge'
import { Song } from '../types/music'

// Mock the bridge
const mockBridge = {
  getConnectionStatus: vi.fn(),
  setProjectExtState: vi.fn(),
  beginUndoBlock: vi.fn(),
  endUndoBlock: vi.fn(),
  executeAction: vi.fn(),
} as unknown as REAPERHTTPBridge

describe('TrackDraftREAPERExporter', () => {
  let exporter: TrackDraftREAPERExporter
  let mockSong: Song

  beforeEach(() => {
    vi.clearAllMocks()
    exporter = new TrackDraftREAPERExporter(mockBridge)

    mockSong = {
      id: 'test-song-1',
      title: 'Test Song',
      key: { root: 'C', mode: 'major' },
      tempo: 120,
      sections: [
        {
          id: 'verse-1',
          type: 'verse',
          title: 'Verse 1',
          lyrics: 'Test lyrics',
          chords: 'C G Am F',
          order: 0,
        },
        {
          id: 'chorus-1',
          type: 'chorus',
          title: 'Chorus',
          lyrics: 'Chorus lyrics',
          chords: 'F C G Am',
          order: 1,
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  })

  describe('Export validation', () => {
    it('throws error when not connected', async () => {
      mockBridge.getConnectionStatus.mockReturnValue(false)

      await expect(exporter.exportSongStructure(mockSong)).rejects.toThrow(
        'Not connected to REAPER'
      )
    })

    it('exports successfully when connected', async () => {
      mockBridge.getConnectionStatus.mockReturnValue(true)
      mockBridge.beginUndoBlock.mockResolvedValue(undefined)
      mockBridge.setProjectExtState.mockResolvedValue(undefined)
      mockBridge.endUndoBlock.mockResolvedValue(undefined)
      mockBridge.executeAction.mockResolvedValue(undefined)

      await exporter.exportSongStructure(mockSong)

      expect(mockBridge.beginUndoBlock).toHaveBeenCalled()
      expect(mockBridge.setProjectExtState).toHaveBeenCalledWith(
        'TrackDraft',
        'SongStructure',
        expect.any(String)
      )
      expect(mockBridge.endUndoBlock).toHaveBeenCalledWith('Import TrackDraft Structure')
    })
  })

  describe('Data generation', () => {
    it('generates export data with correct structure', async () => {
      mockBridge.getConnectionStatus.mockReturnValue(true)
      mockBridge.setProjectExtState.mockResolvedValue(undefined)

      let capturedData: string = ''
      mockBridge.setProjectExtState.mockImplementation(async (section, key, value) => {
        if (key === 'SongStructure') {
          capturedData = value
        }
      })

      await exporter.exportSongStructure(mockSong)

      const exportData = JSON.parse(capturedData)

      expect(exportData).toHaveProperty('version')
      expect(exportData).toHaveProperty('projectName', 'Test Song')
      expect(exportData).toHaveProperty('bpm', 120)
      expect(exportData).toHaveProperty('markers')
      expect(exportData).toHaveProperty('regions')
      expect(exportData).toHaveProperty('chords')
    })

    it('creates markers for each section', async () => {
      mockBridge.getConnectionStatus.mockReturnValue(true)
      let capturedData: string = ''
      mockBridge.setProjectExtState.mockImplementation(async (section, key, value) => {
        if (key === 'SongStructure') {
          capturedData = value
        }
      })

      await exporter.exportSongStructure(mockSong)

      const exportData = JSON.parse(capturedData)

      expect(exportData.markers).toHaveLength(2)
      expect(exportData.markers[0]).toHaveProperty('name', 'Verse 1')
      expect(exportData.markers[0]).toHaveProperty('position')
      expect(exportData.markers[0]).toHaveProperty('color')
    })

    it('creates regions for each section', async () => {
      mockBridge.getConnectionStatus.mockReturnValue(true)
      let capturedData: string = ''
      mockBridge.setProjectExtState.mockImplementation(async (section, key, value) => {
        if (key === 'SongStructure') {
          capturedData = value
        }
      })

      await exporter.exportSongStructure(mockSong)

      const exportData = JSON.parse(capturedData)

      expect(exportData.regions).toHaveLength(2)
      expect(exportData.regions[0]).toHaveProperty('name', 'Verse 1')
      expect(exportData.regions[0]).toHaveProperty('startPosition')
      expect(exportData.regions[0]).toHaveProperty('endPosition')
      expect(exportData.regions[0]).toHaveProperty('color')
    })

    it('parses and includes chords from sections', async () => {
      mockBridge.getConnectionStatus.mockReturnValue(true)
      let capturedData: string = ''
      mockBridge.setProjectExtState.mockImplementation(async (section, key, value) => {
        if (key === 'SongStructure') {
          capturedData = value
        }
      })

      await exporter.exportSongStructure(mockSong)

      const exportData = JSON.parse(capturedData)

      expect(exportData.chords.length).toBeGreaterThan(0)
      expect(exportData.chords[0]).toHaveProperty('position')
      expect(exportData.chords[0]).toHaveProperty('chord')
      expect(exportData.chords[0]).toHaveProperty('duration')
    })

    it('assigns correct colors to section types', async () => {
      mockBridge.getConnectionStatus.mockReturnValue(true)
      let capturedData: string = ''
      mockBridge.setProjectExtState.mockImplementation(async (section, key, value) => {
        if (key === 'SongStructure') {
          capturedData = value
        }
      })

      await exporter.exportSongStructure(mockSong)

      const exportData = JSON.parse(capturedData)

      // Verse should have green color (0x50C878)
      const verseMarker = exportData.markers.find((m: any) => m.name === 'Verse 1')
      expect(verseMarker.color).toBe(0x50c878)

      // Chorus should have pink color (0xE24A90)
      const chorusMarker = exportData.markers.find((m: any) => m.name === 'Chorus')
      expect(chorusMarker.color).toBe(0xe24a90)
    })
  })

  describe('Timestamp tracking', () => {
    it('stores export timestamp', async () => {
      mockBridge.getConnectionStatus.mockReturnValue(true)
      mockBridge.setProjectExtState.mockResolvedValue(undefined)

      const timestampCalls: string[] = []
      mockBridge.setProjectExtState.mockImplementation(async (section, key, value) => {
        if (key === 'LastExport') {
          timestampCalls.push(value)
        }
      })

      await exporter.exportSongStructure(mockSong)

      expect(timestampCalls.length).toBe(1)
      expect(timestampCalls[0]).toMatch(/^\d{4}-\d{2}-\d{2}T/)
    })
  })

  describe('Custom action execution', () => {
    it('tries to execute custom import action', async () => {
      mockBridge.getConnectionStatus.mockReturnValue(true)
      mockBridge.executeAction.mockResolvedValue(undefined)

      await exporter.exportSongStructure(mockSong)

      expect(mockBridge.executeAction).toHaveBeenCalledWith('_TD_IMPORT_STRUCTURE')
    })

    it('continues gracefully if custom action does not exist', async () => {
      mockBridge.getConnectionStatus.mockReturnValue(true)
      mockBridge.executeAction.mockRejectedValue(new Error('Action not found'))

      // Should not throw
      await expect(exporter.exportSongStructure(mockSong)).resolves.not.toThrow()
    })
  })

  describe('Beats to seconds conversion', () => {
    it('converts beats to seconds correctly', () => {
      // At 120 BPM, 1 beat = 0.5 seconds
      const seconds = exporter['beatsToSeconds'](4, 120)
      expect(seconds).toBe(2)
    })

    it('handles different tempos', () => {
      // At 60 BPM, 1 beat = 1 second
      const seconds = exporter['beatsToSeconds'](4, 60)
      expect(seconds).toBe(4)

      // At 90 BPM, 1 beat = 0.666... seconds
      const seconds2 = exporter['beatsToSeconds'](3, 90)
      expect(seconds2).toBeCloseTo(2, 1)
    })
  })

  describe('Section duration calculation', () => {
    it('assigns appropriate duration to different section types', () => {
      const introSection = { ...mockSong.sections[0], type: 'intro' }
      const duration = exporter['calculateSectionDuration'](introSection, mockSong)

      // Intro should be 4 bars = 16 beats
      expect(duration).toBe(16)
    })

    it('uses default duration for unknown section types', () => {
      const unknownSection = { ...mockSong.sections[0], type: 'unknown' }
      const duration = exporter['calculateSectionDuration'](unknownSection, mockSong)

      // Default should be 8 bars = 32 beats
      expect(duration).toBe(32)
    })
  })

  describe('Chord parsing', () => {
    it('parses chord string into events', () => {
      const chords = exporter['parseChords']('C G Am F', 0, 120)

      expect(chords).toHaveLength(4)
      expect(chords[0].chord).toBe('C')
      expect(chords[1].chord).toBe('G')
      expect(chords[2].chord).toBe('Am')
      expect(chords[3].chord).toBe('F')
    })

    it('calculates chord positions correctly', () => {
      const chords = exporter['parseChords']('C G', 16, 120)

      // Starting at beat 16, each chord is 4 beats apart
      expect(chords[0].position).toBe(exporter['beatsToSeconds'](16, 120))
      expect(chords[1].position).toBe(exporter['beatsToSeconds'](20, 120))
    })

    it('handles empty chord string', () => {
      const chords = exporter['parseChords']('', 0, 120)

      expect(chords).toHaveLength(0)
    })

    it('handles chord string with extra spaces', () => {
      const chords = exporter['parseChords']('  C    G   Am  ', 0, 120)

      expect(chords).toHaveLength(3)
    })
  })
})