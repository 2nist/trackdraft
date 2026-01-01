import { useState } from 'react';
import { jamsConverter } from '../../lib/jams-converter';
import { trackDraftProjectToSong } from '../../lib/import-utils';
import { TrackDraftProject } from '../../types/jams';
import { useSongStore } from '../../store/songStore';
import { useToastStore } from '../../store/toastStore';
import { Upload, X, CheckCircle2, AlertCircle } from 'lucide-react';

interface ImportDialogProps {
  onClose: () => void;
}

/**
 * Import Dialog Component
 * Supports JAMS, JCRD, McGill Billboard / SALAMI formats with auto-detection
 */
export function ImportDialog({ onClose }: ImportDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<TrackDraftProject | null>(null);
  const [format, setFormat] = useState<string>('');
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { setCurrentSong, saveSong } = useSongStore();
  const { showSuccess, showError } = useToastStore();

  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile);
    setError(null);
    setPreview(null);
    setFormat('');

    try {
      const text = await selectedFile.text();
      const json = JSON.parse(text);

      // Auto-detect format
      const detectedFormat = jamsConverter.detectFormat(json);
      setFormat(detectedFormat);

      if (detectedFormat === 'unknown') {
        setError('Unknown file format. Supported formats: JAMS, JCRD, McGill Billboard / SALAMI');
        return;
      }

      // Convert to JAMS format
      const jams = await jamsConverter.importAuto(json);
      
      // Convert to TrackDraft project format
      const project = await jamsConverter.jamsToTrackDraft(jams);
      
      setPreview(project);
    } catch (err) {
      console.error('Import error:', err);
      setError(
        err instanceof Error
          ? `Failed to parse file: ${err.message}`
          : 'Failed to parse file. Please check the file format.'
      );
    }
  };

  const handleImport = async () => {
    if (!preview) return;

    setImporting(true);
    try {
      // Convert to Song format
      const song = trackDraftProjectToSong(preview);

      // Set as current song
      setCurrentSong(song);
      
      // Save to store
      saveSong();

      showSuccess('Project imported successfully!');
      onClose();
    } catch (err) {
      console.error('Import error:', err);
      showError(
        err instanceof Error
          ? `Import failed: ${err.message}`
          : 'Import failed. Please try again.'
      );
    } finally {
      setImporting(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-black border border-gray-700 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
            <Upload size={24} />
            Import Project
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {!file ? (
            <div
              className="border-2 border-dashed border-gray-700 rounded-lg p-12 text-center hover:border-gray-600 transition-colors cursor-pointer"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-input')?.click()}
            >
              <Upload className="mx-auto text-gray-500 mb-4" size={48} />
              <p className="text-white text-lg mb-2">Drop JSON file here</p>
              <p className="text-gray-400 mb-4">or</p>
              <button className="px-6 py-2 border-2 border-gray-700 bg-transparent hover:bg-gray-800/20 hover:border-gray-600 text-white rounded transition-all">
                Browse Files
              </button>
              <p className="text-gray-500 text-sm mt-4">
                Supported formats: JAMS, JCRD, McGill Billboard / SALAMI
              </p>
              <input
                id="file-input"
                type="file"
                accept=".json,.jams,.jcrd"
                style={{ display: 'none' }}
                onChange={handleFileInputChange}
              />
            </div>
          ) : error ? (
            <div className="border border-red-500/50 rounded-lg p-6 bg-red-500/10">
              <div className="flex items-start gap-3">
                <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <h3 className="text-red-400 font-semibold mb-2">Import Error</h3>
                  <p className="text-red-300 text-sm">{error}</p>
                  <button
                    onClick={() => {
                      setFile(null);
                      setError(null);
                    }}
                    className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors"
                  >
                    Try Different File
                  </button>
                </div>
              </div>
            </div>
          ) : preview ? (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-blue-500/20 border border-blue-500/50 rounded text-blue-300 text-sm font-medium">
                  Format: {format.toUpperCase()}
                </span>
                {preview.metadata.tags?.includes('mir-dataset') && (
                  <span className="px-3 py-1 bg-purple-500/20 border border-purple-500/50 rounded text-purple-300 text-sm">
                    MIR Dataset
                  </span>
                )}
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-1">
                  {preview.metadata.title}
                </h3>
                {preview.metadata.artist && (
                  <p className="text-gray-400">{preview.metadata.artist}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Key</p>
                  <p className="text-white font-semibold">{preview.metadata.key}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">BPM</p>
                  <p className="text-white font-semibold">{preview.metadata.bpm}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Duration</p>
                  <p className="text-white font-semibold">
                    {preview.structure.totalDuration.toFixed(1)}s
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Sections</p>
                  <p className="text-white font-semibold">
                    {preview.structure.sections.length}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-3">Structure:</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {preview.structure.sections.map((s, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-3 bg-gray-900 rounded border border-gray-800"
                    >
                      <div
                        className="w-3 h-3 rounded flex-shrink-0"
                        style={{
                          backgroundColor: s.color
                            ? `#${s.color.toString(16).padStart(6, '0')}`
                            : '#808080',
                        }}
                      />
                      <div className="flex-1">
                        <div className="text-white font-medium">{s.name}</div>
                        <div className="text-gray-400 text-sm">
                          {s.bars} bars • {s.startTime.toFixed(1)}s - {s.endTime.toFixed(1)}s
                          {(s as any).chordProgressionId && (
                            <span className="ml-2 text-blue-400 text-xs">
                              (Progression linked)
                            </span>
                          )}
                        </div>
                      </div>
                      {s.chords && s.chords.length > 0 && (
                        <div className="text-gray-500 text-sm">
                          {s.chords.length} chord{s.chords.length !== 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Show detected progressions */}
              {preview.harmony?.progressions && preview.harmony.progressions.length > 0 && (
                <div>
                  <h4 className="text-white font-semibold mb-3">
                    Detected Progressions ({preview.harmony.progressions.length}):
                  </h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {preview.harmony.progressions.map((prog, i) => (
                      <div
                        key={i}
                        className="p-3 bg-purple-500/10 border border-purple-500/30 rounded"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="text-white font-medium">{prog.name}</div>
                          {prog.usageCount && (
                            <div className="text-purple-400 text-sm">
                              Used {prog.usageCount}x
                            </div>
                          )}
                        </div>
                        {prog.tags && prog.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {prog.tags
                              .filter((tag) => tag !== 'imported' && tag !== 'detected')
                              .map((tag, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-0.5 bg-purple-500/20 border border-purple-500/30 rounded text-purple-300 text-xs"
                                >
                                  {tag}
                                </span>
                              ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-gray-700">
                <button
                  onClick={handleImport}
                  disabled={importing}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {importing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={18} />
                      Import
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setFile(null);
                    setPreview(null);
                    setFormat('');
                  }}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
                >
                  Choose Different File
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-400">Analyzing file...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ImportDialog;

