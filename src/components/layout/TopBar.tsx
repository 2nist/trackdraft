import { useSongStore } from '../../store/songStore';
import { useToastStore } from '../../store/toastStore';
import { Save, Undo2, Redo2, Play, Pause } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { playProgression } from '../../lib/harmony/audioUtils';
import * as Tone from 'tone';

export default function TopBar() {
  const { currentSong, updateSong, saveSong, undo, redo, canUndo, canRedo } = useSongStore();
  const { showError, showInfo, showSuccess } = useToastStore();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(currentSong?.title || '');
  const synthRef = useRef<Tone.PolySynth | null>(null);
  const stopTimeoutRef = useRef<number | null>(null);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitleValue(e.target.value);
  };

  const handleTitleBlur = () => {
    if (titleValue.trim() && currentSong) {
      updateSong({ title: titleValue.trim() });
    } else {
      setTitleValue(currentSong?.title || '');
    }
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleTitleBlur();
    }
  };

  // Initialize Tone.js synth
  useEffect(() => {
    if (typeof window !== 'undefined' && !synthRef.current) {
      try {
        synthRef.current = new Tone.PolySynth(Tone.Synth).toDestination();
      } catch (error) {
        console.error('Failed to initialize audio:', error);
        showError('Unable to initialize audio. Please check your browser audio settings.');
      }
      
      return () => {
        if (synthRef.current) {
          synthRef.current.dispose();
          synthRef.current = null;
        }
      };
    }
  }, [showError]);

  // Update title value when currentSong changes
  useEffect(() => {
    setTitleValue(currentSong?.title || '');
  }, [currentSong?.title]);

  // Handle play/pause
  const handlePlayPause = useCallback(async () => {
    if (!currentSong || !synthRef.current) return;

    // If already playing, stop
    if (isPlaying) {
      if (synthRef.current) {
        synthRef.current.releaseAll();
      }
      if (stopTimeoutRef.current !== null) {
        clearTimeout(stopTimeoutRef.current);
        stopTimeoutRef.current = null;
      }
      setIsPlaying(false);
      return;
    }

    // Check if we have a progression to play
    if (!currentSong.progression || currentSong.progression.length === 0) {
      showInfo('No chord progression to play. Create a progression in the Harmony view first.');
      return;
    }

    setIsPlaying(true);

    try {
      // Start Tone.js context if needed (required for user interaction)
      if (Tone.context.state !== 'running') {
        await Tone.start();
      }

      // Play the progression
      await playProgression(
        synthRef.current,
        currentSong.progression.map((chord) => ({ notes: chord.notes })),
        '2n', // 2 beats per chord
        currentSong.tempo || 120
      );

      // Calculate duration: 2 beats per chord at the song's tempo
      const beatsPerMinute = currentSong.tempo || 120;
      const secondsPerBeat = 60 / beatsPerMinute;
      const durationMs = currentSong.progression.length * 2 * secondsPerBeat * 1000;

      // Stop after progression finishes
      stopTimeoutRef.current = window.setTimeout(() => {
        if (synthRef.current) {
          synthRef.current.releaseAll();
        }
        setIsPlaying(false);
        stopTimeoutRef.current = null;
      }, durationMs);
    } catch (error) {
      console.error('Error playing progression:', error);
      if (synthRef.current) {
        synthRef.current.releaseAll();
      }
      setIsPlaying(false);
      showError('Unable to play audio. Please check your browser audio settings and try again.');
    }
  }, [currentSong, isPlaying, showError, showInfo]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (synthRef.current) {
        synthRef.current.releaseAll();
      }
      if (stopTimeoutRef.current !== null) {
        clearTimeout(stopTimeoutRef.current);
      }
    };
  }, []);

  // Keyboard shortcuts handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input, textarea, or contenteditable element
      const target = e.target as HTMLElement;
      const isInputFocused = 
        target.tagName === 'INPUT' || 
        target.tagName === 'TEXTAREA' || 
        target.isContentEditable ||
        target.closest('input, textarea, [contenteditable="true"]');
      
      // Spacebar: Play/Pause (only if not typing)
      if (e.key === ' ' && !isInputFocused) {
        e.preventDefault();
        handlePlayPause();
        return;
      }

      // Ctrl+S: Save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveSong();
        showSuccess('Song saved');
        return;
      }

      // Ctrl+Z: Undo (only if not typing)
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey && !isInputFocused) {
        e.preventDefault();
        if (canUndo()) {
          undo();
        }
        return;
      }

      // Ctrl+Shift+Z or Ctrl+Y: Redo (only if not typing)
      if (
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z') ||
        ((e.ctrlKey || e.metaKey) && e.key === 'y')
      ) {
        if (!isInputFocused) {
          e.preventDefault();
          if (canRedo()) {
            redo();
          }
        }
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [saveSong, undo, redo, canUndo, canRedo, handlePlayPause, showSuccess]);

  return (
    <header className="h-16 bg-surface-1 border-b border-surface-2 flex items-center justify-between px-6">
      <div className="flex items-center gap-4 flex-1">
        {isEditingTitle ? (
          <input
            type="text"
            value={titleValue}
            onChange={handleTitleChange}
            onBlur={handleTitleBlur}
            onKeyDown={handleTitleKeyDown}
            className="bg-surface-0 border-2 border-track-orange-700 rounded-lg px-3 py-1 text-lg font-semibold text-text-primary focus:outline-none focus:ring-4 focus:ring-track-orange-700/10"
            autoFocus
          />
        ) : (
          <h2
            onClick={() => setIsEditingTitle(true)}
            className="text-lg font-semibold text-text-primary cursor-pointer hover:text-track-orange-700 transition-colors"
          >
            {currentSong?.title || 'Untitled Song'}
          </h2>
        )}
        
        <div className="flex items-center gap-2 text-xs text-text-tertiary">
          <span className="px-2 py-1 bg-surface-2 rounded border border-surface-3">
            {currentSong?.key.root} {currentSong?.key.mode}
          </span>
          <span className="px-2 py-1 bg-surface-2 rounded border border-surface-3">
            {currentSong?.tempo} BPM
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => {
            saveSong();
            showSuccess('Song saved');
          }}
          className="p-2 text-text-secondary hover:text-text-primary hover:bg-surface-2 rounded transition-colors"
          title="Save (Ctrl+S)"
        >
          <Save size={20} />
        </button>
        
        <button
          onClick={undo}
          disabled={!canUndo()}
          className="p-2 text-text-secondary hover:text-text-primary hover:bg-surface-2 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Undo (Ctrl+Z)"
        >
          <Undo2 size={20} />
        </button>
        
        <button
          onClick={redo}
          disabled={!canRedo()}
          className="p-2 text-text-secondary hover:text-text-primary hover:bg-surface-2 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Redo (Ctrl+Shift+Z)"
        >
          <Redo2 size={20} />
        </button>

        <div className="w-px h-6 bg-surface-2 mx-2" />

        <button
          onClick={handlePlayPause}
          disabled={!currentSong?.progression || currentSong.progression.length === 0}
          className="p-2 text-text-secondary hover:text-text-primary hover:bg-surface-2 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title={currentSong?.progression && currentSong.progression.length > 0 ? "Play/Pause (Space)" : "No progression to play"}
        >
          {isPlaying ? <Pause size={20} /> : <Play size={20} />}
        </button>
      </div>
    </header>
  );
}

