import { useState, useEffect } from 'react';
import { reaperBridge } from '../lib/reaper-bridge';

/**
 * React hook for managing Reaper bridge connection state
 */
export function useReaperConnection() {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    const checkConnection = async () => {
      setConnecting(true);
      try {
        const isConnected = await reaperBridge.connect();
        setConnected(isConnected);
      } catch (error) {
        setConnected(false);
      } finally {
        setConnecting(false);
      }
    };

    // Initial connection check
    checkConnection();

    // Check every 5 seconds
    const interval = setInterval(checkConnection, 5000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return { connected, connecting };
}

