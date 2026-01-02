import { useEffect, useRef } from 'react';
import { reaperBridge } from '../lib/reaper-bridge';
import { Song, SongSection } from '../types/music';
import { useReaperConnection } from './useReaperConnection';

interface UseAutoSyncOptions {
  enabled?: boolean;
  debounceMs?: number;
  onSyncSuccess?: () => void;
  onSyncError?: (error: Error) => void;
}

/**
 * Hook for automatic syncing to Reaper when sections change
 * Implements debounced auto-sync to avoid too many requests
 */
export function useAutoSync(
  song: Song | null,
  options: UseAutoSyncOptions = {}
) {
  const { enabled = false, debounceMs = 1000, onSyncSuccess, onSyncError } = options;
  const { connected } = useReaperConnection();
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSyncedSectionsRef = useRef<string>('');

  // Generate a hash of sections to detect changes
  const getSectionsHash = (sections: SongSection[]): string => {
    return JSON.stringify(
      sections.map((s) => ({
        id: s.id,
        type: s.type,
        duration: s.duration,
      }))
    );
  };

  // Sync to Reaper
  const syncToReaper = async () => {
    if (!connected || !song || song.sections.length === 0) return;

    try {
      const result = await reaperBridge.syncToReaper(
        song.sections,
        song.tempo,
        song.key,
        'trackdraft-wins'
      );

      if (result.success) {
        const currentHash = getSectionsHash(song.sections);
        lastSyncedSectionsRef.current = currentHash;
        onSyncSuccess?.();
      } else {
        throw new Error(result.error || 'Sync failed');
      }
    } catch (error) {
      console.error('Auto-sync failed:', error);
      onSyncError?.(error instanceof Error ? error : new Error('Unknown error'));
    }
  };

  // Watch for section changes
  useEffect(() => {
    if (!enabled || !connected || !song) return;

    const currentHash = getSectionsHash(song.sections);
    const hasChanged = currentHash !== lastSyncedSectionsRef.current;

    if (hasChanged) {
      // Clear existing timeout
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }

      // Debounce the sync
      syncTimeoutRef.current = setTimeout(() => {
        syncToReaper();
      }, debounceMs);
    }

    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [song?.sections, song?.tempo, song?.key, enabled, connected, debounceMs]);

  // Initialize last synced hash on mount
  useEffect(() => {
    if (song && song.sections.length > 0) {
      lastSyncedSectionsRef.current = getSectionsHash(song.sections);
    }
  }, [song?.id]); // Only reset when song changes

  return {
    syncToReaper,
  };
}

