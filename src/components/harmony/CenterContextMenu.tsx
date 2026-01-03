import React, { useEffect, useRef } from 'react';
import { Key } from '../../types/music';
import './ChordContextMenu.css';

interface CenterContextMenuProps {
  readonly x: number;
  readonly y: number;
  readonly onClose: () => void;
  
  // Progression settings
  readonly name?: string;
  readonly onNameChange?: (name: string) => void;
  
  readonly sectionType?: 'verse' | 'chorus' | 'bridge' | 'pre-chorus' | 'intro' | 'outro';
  readonly onSectionTypeChange?: (type: 'verse' | 'chorus' | 'bridge' | 'pre-chorus' | 'intro' | 'outro') => void;
  
  readonly currentKey?: Key;
  readonly onKeyChange?: (key: Key) => void;
  
  readonly timeSignature?: [number, number];
  readonly onTimeSignatureChange?: (sig: [number, number]) => void;
  
  readonly totalBars?: number;
  readonly onTotalBarsChange?: (bars: number) => void;
  
  readonly bpm?: number;
  readonly onBpmChange?: (bpm: number) => void;
  
  // Actions
  readonly onLoadSchema?: () => void;
  readonly onSaveAsSchema?: () => void;
  readonly onClearAll?: () => void;
}

const SECTION_TYPES = [
  { value: 'verse', label: 'Verse' },
  { value: 'chorus', label: 'Chorus' },
  { value: 'bridge', label: 'Bridge' },
  { value: 'pre-chorus', label: 'Pre-Chorus' },
  { value: 'intro', label: 'Intro' },
  { value: 'outro', label: 'Outro' },
] as const;

const MODES = [
  { value: 'major', label: 'Major (Ionian)' },
  { value: 'minor', label: 'Minor (Aeolian)' },
  { value: 'dorian', label: 'Dorian' },
  { value: 'phrygian', label: 'Phrygian' },
  { value: 'lydian', label: 'Lydian' },
  { value: 'mixolydian', label: 'Mixolydian' },
  { value: 'locrian', label: 'Locrian' },
] as const;

const KEYS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export function CenterContextMenu({
  x,
  y,
  onClose,
  name,
  onNameChange,
  sectionType,
  onSectionTypeChange,
  currentKey,
  onKeyChange,
  timeSignature = [4, 4],
  onTimeSignatureChange,
  totalBars,
  onTotalBarsChange,
  bpm,
  onBpmChange,
  onLoadSchema,
  onSaveAsSchema,
  onClearAll,
}: CenterContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  // Adjust position to keep menu in viewport
  const menuStyle: React.CSSProperties = {
    position: 'fixed',
    left: `${Math.min(x, window.innerWidth - 280)}px`,
    top: `${Math.min(y, window.innerHeight - 400)}px`,
    zIndex: 1000,
    minWidth: '260px',
  };

  return (
    <div
      ref={menuRef}
      className="chord-context-menu"
      style={menuStyle}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="chord-context-menu-header">
        <span className="chord-context-menu-title">Progression Settings</span>
      </div>

      {/* Name Input */}
      {onNameChange && (
        <div className="chord-context-menu-section">
          <div className="chord-context-menu-label">Name</div>
          <input
            type="text"
            value={name || ''}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="e.g., Verse Progression A"
            className="w-full px-2 py-1 text-xs bg-black border border-gray-700 rounded text-white focus:outline-none focus:border-accent"
            autoFocus
          />
        </div>
      )}

      {/* Section Type */}
      {onSectionTypeChange && (
        <div className="chord-context-menu-section">
          <div className="chord-context-menu-label">Section Type</div>
          <select
            value={sectionType || 'verse'}
            onChange={(e) => {
              const value = e.target.value as 'verse' | 'chorus' | 'bridge' | 'pre-chorus' | 'intro' | 'outro';
              onSectionTypeChange(value);
            }}
            className="w-full px-2 py-1 text-xs bg-black border border-gray-700 rounded text-white focus:outline-none focus:border-accent"
          >
            {SECTION_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Key & Mode */}
      {onKeyChange && currentKey && (
        <div className="chord-context-menu-section">
          <div className="chord-context-menu-label">Key & Mode</div>
          <div className="flex gap-1.5">
            <select
              value={currentKey.root}
              onChange={(e) => onKeyChange({ ...currentKey, root: e.target.value })}
              className="flex-1 px-2 py-1 text-xs bg-black border border-gray-700 rounded text-white focus:outline-none focus:border-accent"
            >
              {KEYS.map((key) => (
                <option key={key} value={key}>
                  {key}
                </option>
              ))}
            </select>
            <select
              value={currentKey.mode}
              onChange={(e) => onKeyChange({ ...currentKey, mode: e.target.value as Key['mode'] })}
              className="flex-1 px-2 py-1 text-xs bg-black border border-gray-700 rounded text-white focus:outline-none focus:border-accent"
            >
              {MODES.map((mode) => (
                <option key={mode.value} value={mode.value}>
                  {mode.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Time & Length */}
      {(onTimeSignatureChange || onTotalBarsChange) && (
        <div className="chord-context-menu-section">
          <div className="chord-context-menu-label">Time & Length</div>
          <div className="flex gap-1.5">
            {onTimeSignatureChange && (
              <div className="flex-1">
                <label className="block text-[10px] text-gray-500 mb-0.5">Time Sig</label>
                <div className="flex items-center gap-0.5">
                  <select
                    value={timeSignature[0]}
                    onChange={(e) => onTimeSignatureChange([parseInt(e.target.value), timeSignature[1]])}
                    className="flex-1 px-1 py-1 text-xs bg-black border border-gray-700 rounded text-white focus:outline-none focus:border-accent"
                  >
                    {[2, 3, 4, 5, 6, 7, 8].map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                  <span className="text-gray-500">/</span>
                  <select
                    value={timeSignature[1]}
                    onChange={(e) => onTimeSignatureChange([timeSignature[0], parseInt(e.target.value)])}
                    className="flex-1 px-1 py-1 text-xs bg-black border border-gray-700 rounded text-white focus:outline-none focus:border-accent"
                  >
                    {[2, 4, 8].map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
            {onTotalBarsChange && (
              <div className="flex-1">
                <label className="block text-[10px] text-gray-500 mb-0.5">Bars</label>
                <input
                  type="number"
                  min="1"
                  max="32"
                  value={totalBars || 4}
                  onChange={(e) => onTotalBarsChange(Math.max(1, Math.min(32, parseInt(e.target.value) || 4)))}
                  className="w-full px-2 py-1 text-xs bg-black border border-gray-700 rounded text-white focus:outline-none focus:border-accent"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* BPM */}
      {onBpmChange && (
        <div className="chord-context-menu-section">
          <div className="chord-context-menu-label">BPM (Preview)</div>
          <input
            type="number"
            min="40"
            max="240"
            value={bpm || 120}
            onChange={(e) => onBpmChange(Math.max(40, Math.min(240, parseInt(e.target.value) || 120)))}
            className="w-full px-2 py-1 text-xs bg-black border border-gray-700 rounded text-white focus:outline-none focus:border-accent"
          />
        </div>
      )}

      {/* Action Buttons */}
      {(onLoadSchema || onSaveAsSchema || onClearAll) && (
        <>
          <div className="border-t border-gray-800 my-1"></div>
          <div className="chord-context-menu-section">
            <div className="chord-context-menu-buttons flex-col">
              {onLoadSchema && (
                <button
                  onClick={() => { onLoadSchema(); onClose(); }}
                  className="w-full text-left px-2 py-1 text-xs hover:bg-gray-800 rounded transition-colors"
                >
                  Load Schema...
                </button>
              )}
              {onSaveAsSchema && (
                <button
                  onClick={() => { onSaveAsSchema(); onClose(); }}
                  className="w-full text-left px-2 py-1 text-xs hover:bg-gray-800 rounded transition-colors"
                >
                  Save as Schema
                </button>
              )}
              {onClearAll && (
                <button
                  onClick={() => { onClearAll(); onClose(); }}
                  className="w-full text-left px-2 py-1 text-xs text-red-400 hover:bg-gray-800 rounded transition-colors"
                >
                  Clear All Chords
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default CenterContextMenu;
