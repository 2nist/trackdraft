import { useState } from 'react';
import { useSongStore } from '../../store/songStore';
import { Settings, Trash2, Download, Upload, Save } from 'lucide-react';
import { useToastStore } from '../../store/toastStore';
import { exportSong } from '../../lib/export';
import ImportDialog from '../common/ImportDialog';

export default function SettingsView() {
  const { songs, currentSong } = useSongStore();
  const { showSuccess, showError, showWarning } = useToastStore();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);

  const handleExportAll = () => {
    if (songs.length === 0) {
      showWarning('No songs to export');
      return;
    }

    try {
      // Export all songs as JSON
      const allSongsData = JSON.stringify(songs, null, 2);
      const blob = new Blob([allSongsData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'trackdraft-all-songs.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showSuccess('All songs exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      showError('Failed to export songs');
    }
  };

  const handleClearAllData = () => {
    try {
      localStorage.removeItem('trackdraft-songs');
      window.location.reload(); // Reload to reset state
    } catch (error) {
      console.error('Clear data error:', error);
      showError('Failed to clear data');
    }
  };

  const handleExportCurrentSong = () => {
    if (!currentSong) {
      showWarning('No song selected');
      return;
    }
    exportSong(currentSong, 'json');
    showSuccess('Current song exported');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <Settings size={32} />
          Settings
        </h1>
        <p className="text-gray-400">Manage your application preferences and data</p>
      </div>

      <div className="space-y-6">
        {/* Data Management */}
        <div className="card">
          <h2 className="text-xl font-semibold text-white mb-4">Data Management</h2>
          
          <div className="space-y-4">
            <div className="p-4 bg-dark-elevated rounded border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-white mb-1">Import Project</h3>
                  <p className="text-sm text-gray-400">
                    Import songs from JAMS, JCRD, or McGill Billboard / SALAMI formats
                  </p>
                </div>
                <button
                  onClick={() => setShowImportDialog(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors flex items-center gap-2"
                >
                  <Upload size={18} />
                  Import
                </button>
              </div>
            </div>

            <div className="p-4 bg-dark-elevated rounded border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-white mb-1">Export Current Song</h3>
                  <p className="text-sm text-gray-400">
                    Export the currently open song as JSON
                  </p>
                </div>
                <button
                  onClick={handleExportCurrentSong}
                  disabled={!currentSong}
                  className="px-4 py-2 border-2 border-accent bg-accent/10 hover:bg-accent/20 text-white rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Download size={18} />
                  Export
                </button>
              </div>
            </div>

            <div className="p-4 bg-dark-elevated rounded border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-white mb-1">Export All Songs</h3>
                  <p className="text-sm text-gray-400">
                    Export all your songs as a single JSON file for backup
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {songs.length} song{songs.length !== 1 ? 's' : ''} in library
                  </p>
                </div>
                <button
                  onClick={handleExportAll}
                  disabled={songs.length === 0}
                  className="px-4 py-2 border-2 border-accent bg-accent/10 hover:bg-accent/20 text-white rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Download size={18} />
                  Export All
                </button>
              </div>
            </div>

            <div className="p-4 bg-dark-elevated rounded border border-red-500/50">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-white mb-1">Clear All Data</h3>
                  <p className="text-sm text-gray-400">
                    Permanently delete all songs and reset the application
                  </p>
                  <p className="text-xs text-red-400 mt-1">
                    This action cannot be undone. Make sure to export your songs first.
                  </p>
                </div>
                {!showDeleteConfirm ? (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors flex items-center gap-2"
                  >
                    <Trash2 size={18} />
                    Clear All
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleClearAllData}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                    >
                      Confirm Delete
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Application Info */}
        <div className="card">
          <h2 className="text-xl font-semibold text-white mb-4">About</h2>
          
          <div className="space-y-4">
            <div className="p-4 bg-dark-elevated rounded border border-gray-800">
              <h3 className="font-semibold text-white mb-2">TRACKdrafT</h3>
              <p className="text-sm text-gray-400 mb-4">
                A comprehensive songwriting productivity application based on the "How To Write Songs" (HTWS) Seven-Step Formula.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Version</span>
                  <span className="text-white">0.1.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Storage</span>
                  <span className="text-white">Local Browser Storage</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Songs</span>
                  <span className="text-white">{songs.length}</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-dark-elevated rounded border border-gray-800">
              <h3 className="font-semibold text-white mb-2">Keyboard Shortcuts</h3>
              <div className="space-y-2 text-sm text-gray-400">
                <div className="flex justify-between">
                  <span>Save Song</span>
                  <kbd className="px-2 py-1 bg-gray-800 rounded text-white">Ctrl+S</kbd>
                </div>
                <div className="flex justify-between">
                  <span>Undo</span>
                  <kbd className="px-2 py-1 bg-gray-800 rounded text-white">Ctrl+Z</kbd>
                </div>
                <div className="flex justify-between">
                  <span>Redo</span>
                  <kbd className="px-2 py-1 bg-gray-800 rounded text-white">Ctrl+Shift+Z</kbd>
                </div>
                <div className="flex justify-between">
                  <span>Play/Pause</span>
                  <kbd className="px-2 py-1 bg-gray-800 rounded text-white">Space</kbd>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="card">
          <h2 className="text-xl font-semibold text-white mb-4">Tips</h2>
          
          <div className="space-y-3 text-sm text-gray-400">
            <div className="p-3 bg-dark-elevated rounded border border-gray-800">
              <p className="font-semibold text-white mb-1">Auto-Save</p>
              <p>Your songs are automatically saved 1.5 seconds after you stop typing. No need to manually save!</p>
            </div>
            <div className="p-3 bg-dark-elevated rounded border border-gray-800">
              <p className="font-semibold text-white mb-1">Export Regularly</p>
              <p>Export your songs regularly as JSON backups to ensure you never lose your work.</p>
            </div>
            <div className="p-3 bg-dark-elevated rounded border border-gray-800">
              <p className="font-semibold text-white mb-1">Play Progressions</p>
              <p>Use the Space key or Play button in the top bar to preview your chord progressions.</p>
            </div>
          </div>
        </div>
      </div>

      {showImportDialog && (
        <ImportDialog onClose={() => setShowImportDialog(false)} />
      )}
    </div>
  );
}

