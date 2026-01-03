import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { REAPERHTTPBridge, REAPERBridgeConfig } from './reaper-http-bridge'

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('REAPERHTTPBridge', () => {
  let bridge: REAPERHTTPBridge

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('Construction and configuration', () => {
    it('creates bridge with default configuration', () => {
      bridge = new REAPERHTTPBridge()

      expect(bridge).toBeInstanceOf(REAPERHTTPBridge)
      expect(bridge.getConnectionStatus()).toBe(false)
    })

    it('creates bridge with custom configuration', () => {
      const customConfig: Partial<REAPERBridgeConfig> = {
        host: '192.168.1.100',
        port: 9090,
        username: 'testuser',
        password: 'testpass',
      }

      bridge = new REAPERHTTPBridge(customConfig)

      expect(bridge).toBeInstanceOf(REAPERHTTPBridge)
    })

    it('builds correct base URL without authentication', () => {
      bridge = new REAPERHTTPBridge({ host: 'localhost', port: 8080 })

      // Private method, but we can test by making a request
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(''),
      })

      bridge['request']('TEST')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('http://localhost:8080'),
        expect.any(Object)
      )
    })

    it('builds correct base URL with authentication', () => {
      bridge = new REAPERHTTPBridge({
        host: 'localhost',
        port: 8080,
        username: 'user',
        password: 'pass',
      })

      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(''),
      })

      bridge['request']('TEST')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('http://user:pass@localhost:8080'),
        expect.any(Object)
      )
    })
  })

  describe('Connection management', () => {
    beforeEach(() => {
      bridge = new REAPERHTTPBridge()
    })

    it('connects successfully when REAPER responds', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('TRANSPORT\t0\t0\t0.0'),
      })

      const connected = await bridge.connect()

      expect(connected).toBe(true)
      expect(bridge.getConnectionStatus()).toBe(true)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/_/TRANSPORT'),
        expect.any(Object)
      )
    })

    it('fails to connect when REAPER does not respond', async () => {
      // Mock all retry attempts to fail
      mockFetch.mockRejectedValue(new Error('Connection refused'))

      const connectPromise = bridge.connect()

      // Fast-forward all timers
      await vi.runAllTimersAsync()

      const connected = await connectPromise

      expect(connected).toBe(false)
      expect(bridge.getConnectionStatus()).toBe(false)
    })

    it('disconnects and updates status', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('TRANSPORT\t0\t0\t0.0'),
      })

      await bridge.connect()
      expect(bridge.getConnectionStatus()).toBe(true)

      await bridge.disconnect()
      expect(bridge.getConnectionStatus()).toBe(false)
    })
  })

  describe('Transport control', () => {
    beforeEach(async () => {
      bridge = new REAPERHTTPBridge()
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('TRANSPORT\t0\t0\t0.0'),
      })
      await bridge.connect()
    })

    it('sends play command', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(''),
      })

      await bridge.play()

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/_/1007'),
        expect.any(Object)
      )
    })

    it('sends pause command', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(''),
      })

      await bridge.pause()

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/_/1008'),
        expect.any(Object)
      )
    })

    it('sends stop command', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(''),
      })

      await bridge.stop()

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/_/1016'),
        expect.any(Object)
      )
    })

    it('sends record command', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(''),
      })

      await bridge.record()

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/_/1013'),
        expect.any(Object)
      )
    })

    it('gets transport state', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('TRANSPORT\t0\t1\t0\t45.5'),
      })

      const state = await bridge.getTransportState()

      // parts[0]=TRANSPORT, parts[1]=0, parts[2]=1 (playing), parts[3]=0 (not recording), parts[4]=45.5 (position)
      expect(state).toEqual({
        isPlaying: true,
        isRecording: false,
        position: 45.5,
      })
    })

    it('parses playing state correctly', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('TRANSPORT\t0\t1\t1\t10.0'),
      })

      const state = await bridge.getTransportState()

      expect(state.isPlaying).toBe(true)
      expect(state.isRecording).toBe(true)
    })

    it('sets edit cursor position', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(''),
      })

      await bridge.setEditCursorPosition(30.5)

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/_/SET%2FPOS%2F30.5'),
        expect.any(Object)
      )
    })
  })

  describe('Markers and regions', () => {
    beforeEach(async () => {
      bridge = new REAPERHTTPBridge()
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('TRANSPORT\t0\t0\t0.0'),
      })
      await bridge.connect()
    })

    it('gets markers from REAPER', async () => {
      const mockResponse = `MARKER_LIST
MARKER\tVerse 1\t1\t0.0\t0x50C878
MARKER\tChorus\t2\t16.0\t0xE24A90
MARKER_LIST_END`

      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(mockResponse),
      })

      const markers = await bridge.getMarkers()

      expect(markers).toHaveLength(2)
      expect(markers[0]).toEqual({
        name: 'Verse 1',
        id: 1,
        position: 0.0,
        color: 0x50c878,
      })
      expect(markers[1]).toEqual({
        name: 'Chorus',
        id: 2,
        position: 16.0,
        color: 0xe24a90,
      })
    })

    it('handles empty marker list', async () => {
      const mockResponse = `MARKER_LIST
MARKER_LIST_END`

      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(mockResponse),
      })

      const markers = await bridge.getMarkers()

      expect(markers).toHaveLength(0)
    })

    it('gets regions from REAPER', async () => {
      const mockResponse = `REGION_LIST
REGION\tVerse 1\t1\t0.0\t16.0\t0x50C878
REGION\tChorus\t2\t16.0\t32.0\t0xE24A90
REGION_LIST_END`

      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(mockResponse),
      })

      const regions = await bridge.getRegions()

      expect(regions).toHaveLength(2)
      expect(regions[0]).toEqual({
        name: 'Verse 1',
        id: 1,
        startPosition: 0.0,
        endPosition: 16.0,
        color: 0x50c878,
      })
      expect(regions[1]).toEqual({
        name: 'Chorus',
        id: 2,
        startPosition: 16.0,
        endPosition: 32.0,
        color: 0xe24a90,
      })
    })
  })

  describe('Project extended state', () => {
    beforeEach(async () => {
      bridge = new REAPERHTTPBridge()
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('TRANSPORT\t0\t0\t0.0'),
      })
      await bridge.connect()
    })

    it('sets project extended state', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(''),
      })

      await bridge.setProjectExtState('TrackDraft', 'SongData', '{"test":"data"}')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('SET%2FPROJEXTSTATE%2FTrackDraft%2FSongData'),
        expect.any(Object)
      )
    })

    it('gets project extended state', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('PROJEXTSTATE\t0\tTrackDraft\tSongData\t%7B%22test%22%3A%22data%22%7D'),
      })

      const value = await bridge.getProjectExtState('TrackDraft', 'SongData')

      expect(value).toBe('{"test":"data"}')
    })

    it('handles missing extended state gracefully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('PROJEXTSTATE\t0\tTrackDraft\tMissing'),
      })

      const value = await bridge.getProjectExtState('TrackDraft', 'Missing')

      expect(value).toBe('')
    })
  })

  describe('Actions and commands', () => {
    beforeEach(async () => {
      bridge = new REAPERHTTPBridge()
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('TRANSPORT\t0\t0\t0.0'),
      })
      await bridge.connect()
    })

    it('executes action by ID', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(''),
      })

      await bridge.executeAction(40044)

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/_/ACTION%2F40044'),
        expect.any(Object)
      )
    })

    it('executes action by string ID', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(''),
      })

      await bridge.executeAction('_TD_CUSTOM_ACTION')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/_/ACTION%2F_TD_CUSTOM_ACTION'),
        expect.any(Object)
      )
    })

    it('gets action state', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('CMDSTATE\t0\t40044\t1'),
      })

      const state = await bridge.getActionState(40044)

      expect(state).toBe(1)
    })
  })

  describe('Undo block management', () => {
    beforeEach(async () => {
      bridge = new REAPERHTTPBridge()
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('TRANSPORT\t0\t0\t0.0'),
      })
      await bridge.connect()
    })

    it('begins undo block', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(''),
      })

      await bridge.beginUndoBlock()

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/_/SET%2FUNDO_BEGINBLOCK'),
        expect.any(Object)
      )
    })

    it('ends undo block with description', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(''),
      })

      await bridge.endUndoBlock('Test Operation')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('SET%2FUNDO_ENDBLOCK%2FTest%2520Operation'),
        expect.any(Object)
      )
    })
  })

  describe('Track operations', () => {
    beforeEach(async () => {
      bridge = new REAPERHTTPBridge()
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('TRANSPORT\t0\t0\t0.0'),
      })
      await bridge.connect()
    })

    it('gets track property', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('TRACK\t0\tP_NAME\tGuitar'),
      })

      const property = await bridge.getTrackProperty(0, 'P_NAME')

      expect(property).toBe('TRACK\t0\tP_NAME\tGuitar')
    })

    it('sets track property', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(''),
      })

      await bridge.setTrackProperty(0, 'P_NAME', 'Drums')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/_/SET%2FTRACK%2F0%2FP_NAME%2FDrums'),
        expect.any(Object)
      )
    })
  })

  describe('Error handling and retries', () => {
    beforeEach(() => {
      bridge = new REAPERHTTPBridge({ retryAttempts: 2 })
    })

    it('retries failed requests up to max attempts', async () => {
      mockFetch
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          text: () => Promise.resolve('SUCCESS'),
        })

      const requestPromise = bridge['request']('TEST')

      // Fast-forward timers to skip retry delays
      await vi.runAllTimersAsync()

      const result = await requestPromise

      expect(mockFetch).toHaveBeenCalledTimes(3)
      expect(result).toBe('SUCCESS')
    })

    it('throws error after max retry attempts', async () => {
      mockFetch
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))

      const requestPromise = bridge['request']('TEST')

      // Fast-forward timers to skip retry delays
      await vi.runAllTimersAsync()

      await expect(requestPromise).rejects.toThrow('Network error')

      expect(mockFetch).toHaveBeenCalledTimes(3) // Initial + 2 retries
    })

    it('handles HTTP error responses', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      })

      const requestPromise = bridge['request']('TEST')

      // Fast-forward timers
      await vi.runAllTimersAsync()

      await expect(requestPromise).rejects.toThrow('REAPER request failed: 404 Not Found')
    })

    it('has configurable timeout', () => {
      bridge = new REAPERHTTPBridge({ timeout: 100, retryAttempts: 0 })

      // Verify the bridge was created with custom timeout
      expect(bridge['config'].timeout).toBe(100)
      expect(bridge['config'].retryAttempts).toBe(0)
    })
  })

  describe('Request formatting and encoding', () => {
    beforeEach(async () => {
      bridge = new REAPERHTTPBridge()
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('TRANSPORT\t0\t0\t0.0'),
      })
      await bridge.connect()
    })

    it('properly encodes special characters in commands', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(''),
      })

      await bridge.setProjectExtState('Section', 'Key', 'Value with spaces')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('Value%2520with%2520spaces'),
        expect.any(Object)
      )
    })

    it('sets cache-control header', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(''),
      })

      await bridge['request']('TEST')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Cache-Control': 'no-cache',
          }),
        })
      )
    })
  })

  describe('Connection status tracking', () => {
    beforeEach(() => {
      bridge = new REAPERHTTPBridge()
    })

    it('updates connection status on successful connection', async () => {
      expect(bridge.getConnectionStatus()).toBe(false)

      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('TRANSPORT\t0\t0\t0.0'),
      })

      await bridge.connect()

      expect(bridge.getConnectionStatus()).toBe(true)
    })

    it('tracks connection status through lifecycle', async () => {
      // Initially disconnected
      expect(bridge.getConnectionStatus()).toBe(false)

      // Connect
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('TRANSPORT\t0\t0\t0\t0.0'),
      })

      await bridge.connect()
      expect(bridge.getConnectionStatus()).toBe(true)

      // Disconnect
      await bridge.disconnect()
      expect(bridge.getConnectionStatus()).toBe(false)
    })
  })
})