import { useReaperConnection } from '../../hooks/useReaperConnection';
import { Wifi, WifiOff, Loader } from 'lucide-react';

/**
 * Bridge Status Component
 * Displays connection status to Reaper bridge
 */
export function BridgeStatus() {
  const { connected, connecting } = useReaperConnection();

  return (
    <div className="bridge-status flex items-center gap-2 px-3 py-2 rounded-lg bg-black/50 border border-gray-800">
      {connecting ? (
        <>
          <Loader size={16} className="animate-spin text-gray-400" />
          <span className="text-sm text-gray-400">Connecting to Reaper...</span>
        </>
      ) : connected ? (
        <>
          <Wifi size={16} className="text-green-500" />
          <span className="text-sm text-green-400">Reaper Connected</span>
        </>
      ) : (
        <>
          <WifiOff size={16} className="text-red-500" />
          <span className="text-sm text-red-400">Reaper Disconnected</span>
        </>
      )}

      {!connected && !connecting && (
        <span className="text-xs text-gray-500 ml-2">
          (Make sure Reaper is running and bridge script is loaded)
        </span>
      )}
    </div>
  );
}

export default BridgeStatus;

