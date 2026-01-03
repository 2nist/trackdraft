/**
 * REAPER HTTP Bridge Panel
 * UI for connecting to REAPER's built-in web interface
 */

import { useState, useEffect } from 'react';
import { Wifi, WifiOff, Download, Settings, Play, Pause, RefreshCw } from 'lucide-react';
import { REAPERHTTPBridge, reaperHTTPBridge } from '../../lib/reaper-http-bridge';
import { TrackDraftREAPERExporter, REAPERPlaybackSync } from '../../lib/reaper-http-exporter';
import { useSongStore } from '../../store/songStore';
import { useToastStore } from '../../store/toastStore';

export default function REAPERHTTPBridgePanel() {
  const [bridge] = useState(() => reaperHTTPBridge);
  const [exporter] = useState(() => new TrackDraftREAPERExporter(bridge));
  const [playbackSync] = useState(() => new REAPERPlaybackSync(bridge));

  const [isConnected, setIsConnected] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const [config, setConfig] = useState({
    host: 'localhost',
    port: 8080,
    username: '',
    password: '',
  });

  const [transportState, setTransportState] = useState({
    isPlaying: false,
    isRecording: false,
    position: 0,
  });

  const { currentSong } = useSongStore();
  const { showSuccess, showError, showInfo } = useToastStore();

  // Check connection status on mount
  useEffect(() => {
    const checkConnection = async () => {
      const connected = await bridge.connect();
      setIsConnected(connected);
    };

    checkConnection();
  }, [bridge]);

  // Start playback sync when connected
  useEffect(() => {
    if (isConnected) {
      playbackSync.startSync((state) => {
        setTransportState(state);
      });

      return () => playbackSync.stopSync();
    }
  }, [isConnected, playbackSync]);

  const handleConnect = async () => {
    setIsConnecting(true);

    try {
      // Update bridge config
      bridge['config'].host = config.host;
      bridge['config'].port = config.port;
      bridge['config'].username = config.username || undefined;
      bridge['config'].password = config.password || undefined;

      // Rebuild base URL with new config
      bridge['baseUrl'] = bridge['buildBaseUrl']();

      const connected = await bridge.connect();
      setIsConnected(connected);

      if (connected) {
        showSuccess('Connected to REAPER!');
        setShowSettings(false);
      } else {
        showError('Failed to connect to REAPER. Make sure the web interface is enabled.');
      }
    } catch (error) {
      console.error('Connection error:', error);
      showError('Failed to connect to REAPER');
      setIsConnected(false);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    await bridge.disconnect();
    setIsConnected(false);
    showInfo('Disconnected from REAPER');
  };

  const handleExport = async () => {
    if (!isConnected) {
      showError('Not connected to REAPER');
      return;
    }

    if (!currentSong) {
      showError('No song to export');
      return;
    }

    if (currentSong.sections.length === 0) {
      showError('Song has no sections to export');
      return;
    }

    setIsExporting(true);

    try {
      await exporter.exportSongStructure(currentSong);
      showSuccess('Song structure exported to REAPER!');
    } catch (error) {
      console.error('Export failed:', error);
      showError('Failed to export to REAPER');
    } finally {
      setIsExporting(false);
    }
  };

  const handlePlayPause = async () => {
    try {
      if (transportState.isPlaying) {
        await bridge.pause();
      } else {
        await bridge.play();
      }
    } catch (error) {
      console.error('Transport control failed:', error);
      showError('Failed to control REAPER transport');
    }
  };

  return (
    <div className="card space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-3 h-3 rounded-full ${
              isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-500'
            }`}
          />
          <h3 className="text-lg font-semibold text-white">REAPER HTTP Bridge</h3>
        </div>

        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 text-text-secondary hover:text-text-primary hover:bg-surface-2 rounded transition-colors"
          title="Connection settings"
        >
          <Settings size={18} />
        </button>
      </div>

      {/* Connection Settings */}
      {showSettings && !isConnected && (
        <div className="space-y-3 p-4 bg-surface-1 rounded-lg border border-surface-2">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Host
            </label>
            <input
              type="text"
              value={config.host}
              onChange={(e) => setConfig({ ...config, host: e.target.value })}
              placeholder="localhost"
              className="w-full px-3 py-2 bg-surface-2 border border-surface-3 rounded text-white text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Port
            </label>
            <input
              type="number"
              value={config.port}
              onChange={(e) => setConfig({ ...config, port: Number(e.target.value) })}
              placeholder="8080"
              className="w-full px-3 py-2 bg-surface-2 border border-surface-3 rounded text-white text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Username (optional)
            </label>
            <input
              type="text"
              value={config.username}
              onChange={(e) => setConfig({ ...config, username: e.target.value })}
              placeholder="Optional"
              className="w-full px-3 py-2 bg-surface-2 border border-surface-3 rounded text-white text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Password (optional)
            </label>
            <input
              type="password"
              value={config.password}
              onChange={(e) => setConfig({ ...config, password: e.target.value })}
              placeholder="Optional"
              className="w-full px-3 py-2 bg-surface-2 border border-surface-3 rounded text-white text-sm"
            />
          </div>

          <button
            onClick={handleConnect}
            disabled={isConnecting}
            className="w-full px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isConnecting ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Wifi size={16} />
                Connect to REAPER
              </>
            )}
          </button>
        </div>
      )}

      {/* Connected State */}
      {isConnected && (
        <div className="space-y-4">
          {/* Status */}
          <div className="flex items-center gap-2 text-sm">
            <Wifi size={16} className="text-green-500" />
            <span className="text-text-primary">
              Connected to REAPER at {config.host}:{config.port}
            </span>
          </div>

          {/* Transport State */}
          <div className="p-3 bg-surface-1 rounded-lg border border-surface-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-text-secondary">Transport State</p>
                <p className="text-sm text-white">
                  {transportState.isPlaying ? 'Playing' : transportState.isRecording ? 'Recording' : 'Stopped'}
                </p>
                <p className="text-xs text-text-tertiary mt-1">
                  Position: {transportState.position.toFixed(2)}s
                </p>
              </div>

              <button
                onClick={handlePlayPause}
                className="p-2 text-white hover:bg-surface-2 rounded transition-colors"
                title={transportState.isPlaying ? 'Pause' : 'Play'}
              >
                {transportState.isPlaying ? <Pause size={20} /> : <Play size={20} />}
              </button>
            </div>
          </div>

          {/* Export Button */}
          <button
            onClick={handleExport}
            disabled={isExporting || !currentSong || currentSong.sections.length === 0}
            className="w-full px-4 py-3 bg-accent hover:bg-accent-hover text-white rounded transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting ? (
              <>
                <RefreshCw size={18} className="animate-spin" />
                Exporting to REAPER...
              </>
            ) : (
              <>
                <Download size={18} />
                Export to REAPER
              </>
            )}
          </button>

          {/* Disconnect Button */}
          <button
            onClick={handleDisconnect}
            className="w-full px-4 py-2 bg-surface-2 hover:bg-surface-3 text-text-primary rounded transition-colors flex items-center justify-center gap-2"
          >
            <WifiOff size={16} />
            Disconnect
          </button>
        </div>
      )}

      {/* Not Connected State */}
      {!isConnected && !showSettings && (
        <div className="text-center py-8 space-y-4">
          <WifiOff size={48} className="mx-auto text-text-tertiary" />
          <p className="text-text-secondary">Not connected to REAPER</p>
          <button
            onClick={() => setShowSettings(true)}
            className="px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded transition-colors"
          >
            Configure Connection
          </button>
        </div>
      )}

      {/* Help Text */}
      <div className="text-xs text-text-tertiary p-3 bg-surface-1 rounded border border-surface-2">
        <p className="font-semibold text-text-secondary mb-1">Setup Instructions:</p>
        <ol className="list-decimal list-inside space-y-1">
          <li>Open REAPER → Options → Preferences</li>
          <li>Go to Control/OSC/Web</li>
          <li>Add → Web Browser Interface</li>
          <li>Set port to 8080 and enable</li>
          <li>Connect from TrackDraft</li>
        </ol>
      </div>
    </div>
  );
}
