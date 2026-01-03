import React, { useState, useEffect, useCallback } from 'react';
import { X, Save, RotateCcw, Music } from 'lucide-react';
import { Chord, Key } from '../../types/music';
import { romanNumeralToChord } from '../../lib/harmony/keyUtils';
import CircularProgressionView from './CircularProgressionView';
import { TheoryPanel } from './TheoryPanel';
import { useToastStore } from '../../store/toastStore';

export interface ProgressionModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback to close the modal */
  onClose: () => void;
  /** Initial progression to edit */
  initialProgression?: Chord[];
  /** Initial key */
  initialKey?: Key;
  /** Initial name */
  initialName?: string;
  /** Section type context */
  sectionType?: 'verse' | 'chorus' | 'bridge' | 'pre-chorus' | 'intro' | 'outro';
  /** Focus on a specific chord index when opening */
  focusChordIndex?: number;
  /** Total beats for the progression */
  totalBeats?: number;
  /** Beats per bar */
  beatsPerBar?: number;
  /** BPM for playback */
  bpm?: number;
  /** Callback when progression is saved */
  onSave: (progression: Chord[], name: string, key: Key) => void;
  /** Whether this is creating a new progression */
  isNew?: boolean;
  /** Modal title override */
  title?: string;
}

export const ProgressionModal: React.FC<ProgressionModalProps> = ({
  isOpen,
  onClose,
  initialProgression = [],
  initialKey = { root: 'C', mode: 'major' },
  initialName = '',
  sectionType,
  focusChordIndex,
  totalBeats: initialTotalBeats = 16,
  beatsPerBar: initialBeatsPerBar = 4,
  bpm: initialBpm = 120,
  onSave,
  isNew = false,
  title,
}) => {
  const { showSuccess, showError } = useToastStore();

  // Local state for editing
  const [progression, setProgression] = useState<Chord[]>(initialProgression);
  const [currentKey, setCurrentKey] = useState<Key>(initialKey);
  const [name, setName] = useState(initialName);
  const [selectedChordIndex, setSelectedChordIndex] = useState<number | null>(focusChordIndex ?? null);
  const [bars, setBars] = useState(Math.ceil(initialTotalBeats / initialBeatsPerBar));
  const [beatsPerBar, setBeatsPerBar] = useState(initialBeatsPerBar);
  const [bpm, setBpm] = useState(initialBpm);
  const [hasChanges, setHasChanges] = useState(false);

  const totalBeats = bars * beatsPerBar;

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setProgression(initialProgression);
      setCurrentKey(initialKey);
      setName(initialName);
      setSelectedChordIndex(focusChordIndex ?? null);
      setBars(Math.ceil(initialTotalBeats / initialBeatsPerBar));
      setBeatsPerBar(initialBeatsPerBar);
      setBpm(initialBpm);
      setHasChanges(false);
    }
  }, [isOpen, initialProgression, initialKey, initialName, focusChordIndex, initialTotalBeats, initialBeatsPerBar, initialBpm]);

  // Track changes
  useEffect(() => {
    const progressionChanged = JSON.stringify(progression) !== JSON.stringify(initialProgression);
    const keyChanged = currentKey.root !== initialKey.root || currentKey.mode !== initialKey.mode;
    const nameChanged = name !== initialName;
    setHasChanges(progressionChanged || keyChanged || nameChanged);
  }, [progression, currentKey, name, initialProgression, initialKey, initialName]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        handleClose();
      } else if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, progression, name, currentKey]);

  const handleAddChord = useCallback((chord: Chord) => {
    const newChordBeats = 2;
    const currentTotal = progression.reduce((sum, c) => sum + (c.beats || 2), 0);
    const newTotal = currentTotal + newChordBeats;

    let newProgression: Chord[];

    if (newTotal > totalBeats) {
      const availableBeats = totalBeats - newChordBeats;
      const scaleFactor = availableBeats / currentTotal;

      newProgression = progression.map((c) => ({
        ...c,
        beats: Math.max(0.5, (c.beats || 2) * scaleFactor),
      }));

      newProgression.push({ ...chord, beats: newChordBeats });

      const finalTotal = newProgression.reduce((sum, c) => sum + (c.beats || 0), 0);
      const adjustment = totalBeats - finalTotal;
      if (Math.abs(adjustment) > 0.01 && newProgression.length > 0) {
        const lastIndex = newProgression.length - 1;
        newProgression[lastIndex] = {
          ...newProgression[lastIndex],
          beats: Math.max(0.5, (newProgression[lastIndex].beats || 0) + adjustment),
        };
      }
    } else {
      newProgression = [...progression, { ...chord, beats: newChordBeats }];
    }

    setProgression(newProgression);
  }, [progression, totalBeats]);

  const handleRemoveChord = useCallback((index: number) => {
    const newProgression = progression.filter((_, i) => i !== index);
    setProgression(newProgression);
    setSelectedChordIndex(null);
  }, [progression]);

  const handleBeatsChange = useCallback((index: number, beats: number) => {
    const newProgression = [...progression];
    newProgression[index] = { ...newProgression[index], beats };

    const newTotal = newProgression.reduce((sum, chord) => sum + (chord.beats || 2), 0);
    if (newTotal > totalBeats) {
      const scaleFactor = totalBeats / newTotal;
      newProgression.forEach((chord, i) => {
        newProgression[i] = {
          ...chord,
          beats: Math.max(0.5, (chord.beats || 2) * scaleFactor),
        };
      });
    }

    setProgression(newProgression);
  }, [progression, totalBeats]);

  const handleChordClick = useCallback((index: number) => {
    setSelectedChordIndex(index);
  }, []);

  const handleChordModify = useCallback((index: number, modifiedChord: Chord) => {
    const newProgression = [...progression];
    const beats = newProgression[index].beats || 2;
    newProgression[index] = { ...modifiedChord, beats };
    setProgression(newProgression);
  }, [progression]);

  const handleSave = () => {
    if (!name.trim() && isNew) {
      showError('Please enter a name for the progression');
      return;
    }

    onSave(progression, name || 'Untitled Progression', currentKey);
    showSuccess(`Progression "${name || 'Untitled'}" saved!`);
    onClose();
  };

  const handleClose = () => {
    if (hasChanges) {
      if (!confirm('You have unsaved changes. Are you sure you want to close?')) {
        return;
      }
    }
    onClose();
  };

  const handleClear = () => {
    if (progression.length === 0) return;
    if (confirm('Clear the entire progression?')) {
      setProgression([]);
      setSelectedChordIndex(null);
    }
  };

  if (!isOpen) return null;

  const modalTitle = title || (isNew ? 'New Progression' : `Edit: ${name || 'Progression'}`);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-gray-900 rounded-xl border border-gray-700 shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <Music className="w-5 h-5 text-accent" />
            <h2 className="text-lg font-semibold text-white">{modalTitle}</h2>
            {sectionType && (
              <span className="px-2 py-0.5 text-xs bg-accent/20 text-accent rounded-full capitalize">
                {sectionType}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {hasChanges && (
              <span className="text-xs text-yellow-400">Unsaved changes</span>
            )}
            <button
              onClick={handleClose}
              className="p-1.5 text-gray-400 hover:text-white transition-colors rounded hover:bg-gray-800"
              title="Close (Esc)"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Left: Settings & Name */}
          <div className="w-48 border-r border-gray-800 p-3 flex flex-col gap-3 overflow-y-auto">
            {/* Name input */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Verse Progression"
                className="w-full px-2 py-1.5 text-sm bg-black border border-gray-700 rounded text-white focus:outline-none focus:border-accent"
              />
            </div>

            {/* Time settings */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                Time
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-gray-500 mb-0.5">Bars</label>
                  <input
                    type="number"
                    min="1"
                    max="16"
                    value={bars}
                    onChange={(e) => setBars(Math.max(1, Math.min(16, parseInt(e.target.value) || 1)))}
                    className="w-full px-1.5 py-1 text-xs bg-black border border-gray-700 rounded text-white focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-500 mb-0.5">Beats/Bar</label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    value={beatsPerBar}
                    onChange={(e) => setBeatsPerBar(Math.max(1, Math.min(8, parseInt(e.target.value) || 4)))}
                    className="w-full px-1.5 py-1 text-xs bg-black border border-gray-700 rounded text-white focus:outline-none focus:border-accent"
                  />
                </div>
              </div>
              <div className="text-xs text-gray-500">
                Total: {totalBeats} beats
              </div>
            </div>

            {/* BPM */}
            <div>
              <label className="block text-[10px] text-gray-500 mb-0.5">BPM (preview)</label>
              <input
                type="number"
                min="40"
                max="240"
                value={bpm}
                onChange={(e) => setBpm(Math.max(40, Math.min(240, parseInt(e.target.value) || 120)))}
                className="w-full px-1.5 py-1 text-xs bg-black border border-gray-700 rounded text-white focus:outline-none focus:border-accent"
              />
            </div>

            {/* Key display */}
            <div className="space-y-1">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                Key
              </div>
              <div className="text-lg font-bold text-white">
                {currentKey.root} {currentKey.mode}
              </div>
              <div className="text-[10px] text-gray-500">
                Click circle to change key
              </div>
            </div>

            {/* Clear button */}
            {progression.length > 0 && (
              <button
                onClick={handleClear}
                className="flex items-center justify-center gap-1 px-2 py-1 text-xs bg-black border border-gray-700 rounded text-gray-400 hover:text-white hover:border-gray-500 transition-colors"
              >
                <RotateCcw size={12} />
                Clear All
              </button>
            )}
          </div>

          {/* Center: Chord Wheel */}
          <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
            <CircularProgressionView
              progression={progression}
              selectedIndex={selectedChordIndex}
              onChordClick={handleChordClick}
              onChordRemove={handleRemoveChord}
              onBeatsChange={handleBeatsChange}
              totalBeats={totalBeats}
              beatsPerBar={beatsPerBar}
              onChordModify={handleChordModify}
              onProgressionReorder={setProgression}
              onAddChord={handleAddChord}
              focusChordIndex={focusChordIndex}
              showKeyRing={true}
            />
          </div>

          {/* Right: Theory Panel */}
          <div className="w-64 border-l border-gray-800 p-3 overflow-y-auto">
            <TheoryPanel
              selectedChord={selectedChordIndex !== null ? progression[selectedChordIndex] : null}
              selectedIndex={selectedChordIndex}
              currentProgression={progression}
              currentKey={currentKey}
              onExtend={(chord) => {
                if (selectedChordIndex !== null) {
                  handleChordModify(selectedChordIndex, chord);
                }
              }}
              onBorrow={(chord) => {
                if (selectedChordIndex !== null) {
                  handleChordModify(selectedChordIndex, chord);
                }
              }}
              onModulate={(newRoot) => {
                setCurrentKey({ ...currentKey, root: newRoot });
              }}
              onSubstitute={(chord) => {
                if (selectedChordIndex !== null) {
                  handleChordModify(selectedChordIndex, chord);
                }
              }}
              onInsertProgression={(romanProgression) => {
                const newChords = romanProgression.map((rn) => {
                  const chord = romanNumeralToChord(rn, currentKey);
                  chord.beats = 2;
                  return chord;
                });
                setProgression([...progression, ...newChords]);
              }}
              onAddNextChord={(roman) => {
                const chord = romanNumeralToChord(roman, currentKey);
                chord.beats = 2;
                handleAddChord(chord);
              }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-800 bg-gray-900/50">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>{progression.length} chord{progression.length !== 1 ? 's' : ''}</span>
            <span>•</span>
            <span>{totalBeats} beats</span>
            <span>•</span>
            <span>{bars} bar{bars !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={progression.length === 0}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-accent hover:bg-accent/80 text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={14} />
              Save Progression
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressionModal;
