import { useState, useEffect } from 'react';
import { reaperBridge } from '../../lib/reaper-bridge';
import { TimelineState } from '../../types/bridge-protocol';
import { RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';

interface SyncStatusProps {
  onTimelineChange?: (state: TimelineState) => void;
}

/**
 * Sync Status Component
 * Shows sync status and handles timeline change notifications
 */
export function SyncStatus({ onTimelineChange }: SyncStatusProps) {
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    // Listen for timeline changes from Reaper
    reaperBridge.startTimelinePolling(2000, (state) => {
      // Timeline changed in Reaper!
      setHasChanges(true);

      if (onTimelineChange) {
        onTimelineChange(state);
      }
    });

    return () => {
      reaperBridge.stopTimelinePolling();
    };
  }, [onTimelineChange]);

  const formatTime = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);

    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/50 border border-gray-800">
      {syncing ? (
        <>
          <RefreshCw size={14} className="text-blue-400 animate-spin" />
          <span className="text-sm text-blue-400">Syncing...</span>
        </>
      ) : hasChanges ? (
        <>
          <AlertCircle size={14} className="text-yellow-500" />
          <span className="text-sm text-yellow-400">Changes in Reaper</span>
        </>
      ) : lastSync ? (
        <>
          <CheckCircle2 size={14} className="text-green-500" />
          <span className="text-sm text-green-400">
            Synced {formatTime(lastSync)}
          </span>
        </>
      ) : (
        <span className="text-sm text-gray-400">Not synced</span>
      )}
    </div>
  );
}

export default SyncStatus;

