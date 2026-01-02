import { TimelineState } from '../../types/bridge-protocol';
import { SongSection } from '../../types/music';
import { X, AlertTriangle } from 'lucide-react';

interface ConflictDialogProps {
  reaperState: TimelineState;
  trackdraftSections: SongSection[];
  onResolve: (resolution: 'reaper' | 'trackdraft' | 'merge') => void;
  onCancel: () => void;
}

/**
 * Conflict Resolution Dialog
 * Shows when timeline changes are detected in both TrackDraft and Reaper
 */
export function ConflictDialog({
  reaperState,
  trackdraftSections,
  onResolve,
  onCancel,
}: ConflictDialogProps) {
  const changedSections = reaperState.sections.filter(
    (s) => s.modifiedInReaper
  );

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-black border border-gray-700 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-yellow-500" size={24} />
            <h2 className="text-xl font-semibold text-white">
              Timeline Conflict Detected
            </h2>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <p className="text-gray-300 mb-6">
          The timeline was changed in both TrackDraft and Reaper. How would you
          like to resolve this?
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="border border-gray-700 rounded-lg p-4 hover:border-yellow-500 transition-colors">
            <h3 className="text-lg font-semibold text-white mb-2">
              Keep Reaper Changes
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              Discard TrackDraft changes, use Reaper timeline
            </p>
            <button
              onClick={() => onResolve('reaper')}
              className="w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded transition-colors"
            >
              Use Reaper
            </button>
          </div>

          <div className="border border-gray-700 rounded-lg p-4 hover:border-yellow-500 transition-colors">
            <h3 className="text-lg font-semibold text-white mb-2">
              Keep TrackDraft Changes
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              Overwrite Reaper with TrackDraft structure
            </p>
            <button
              onClick={() => onResolve('trackdraft')}
              className="w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded transition-colors"
            >
              Use TrackDraft
            </button>
          </div>

          <div className="border border-gray-700 rounded-lg p-4 hover:border-yellow-500 transition-colors">
            <h3 className="text-lg font-semibold text-white mb-2">
              Merge Changes
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              Review each section individually (Coming soon)
            </p>
            <button
              onClick={() => onResolve('merge')}
              disabled
              className="w-full px-4 py-2 bg-gray-800/50 text-gray-500 rounded cursor-not-allowed"
            >
              Merge... (Soon)
            </button>
          </div>
        </div>

        {/* Changes Preview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="border border-gray-700 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-white mb-3">
              Reaper State ({reaperState.sections.length} sections)
            </h4>
            <ul className="space-y-2 max-h-48 overflow-y-auto">
              {reaperState.sections.map((s) => (
                <li
                  key={s.id}
                  className={`text-xs p-2 rounded ${
                    s.modifiedInReaper
                      ? 'bg-yellow-500/20 border border-yellow-500/50 text-yellow-300'
                      : 'bg-gray-800 text-gray-300'
                  }`}
                >
                  <div className="font-medium">{s.name}</div>
                  <div className="text-gray-400">
                    {s.startTime.toFixed(1)}s - {s.endTime.toFixed(1)}s ({s.bars}{' '}
                    bars)
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="border border-gray-700 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-white mb-3">
              TrackDraft State ({trackdraftSections.length} sections)
            </h4>
            <ul className="space-y-2 max-h-48 overflow-y-auto">
              {trackdraftSections.map((s) => (
                <li
                  key={s.id}
                  className="text-xs p-2 rounded bg-gray-800 text-gray-300"
                >
                  <div className="font-medium">
                    {s.type.charAt(0).toUpperCase() + s.type.slice(1)}
                  </div>
                  <div className="text-gray-400">
                    {s.duration || 8} bars
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {changedSections.length > 0 && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded p-3 mb-4">
            <p className="text-sm text-yellow-300">
              <strong>Modified in Reaper:</strong>{' '}
              {changedSections.map((s) => s.name).join(', ')}
            </p>
          </div>
        )}

        <div className="flex justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConflictDialog;

