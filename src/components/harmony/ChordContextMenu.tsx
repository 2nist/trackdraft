import React, { useEffect, useRef } from 'react';
import { Chord } from '../../types/music';
import './ChordContextMenu.css';

interface ChordContextMenuProps {
  readonly x: number;
  readonly y: number;
  readonly chord: Chord;
  readonly onClose: () => void;
  readonly onExtend: (extension: '7' | '9' | '11' | '13') => void;
  readonly onModifyQuality: (quality: 'augmented' | 'diminished' | 'dominant') => void;
  readonly onAddSuspension: (suspension: 'sus2' | 'sus4') => void;
  readonly onTranspose: (direction: 'up' | 'down') => void;
  readonly onRemove?: () => void;
}

export function ChordContextMenu({
  x,
  y,
  chord,
  onClose,
  onExtend,
  onModifyQuality,
  onAddSuspension,
  onTranspose,
  onRemove,
}: ChordContextMenuProps) {
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
    left: `${x}px`,
    top: `${y}px`,
    zIndex: 1000,
  };

  return (
    <div
      ref={menuRef}
      className="chord-context-menu"
      style={menuStyle}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="chord-context-menu-header">
        <span className="chord-context-menu-title">{chord.name || chord.romanNumeral}</span>
      </div>

      <div className="chord-context-menu-section">
        <div className="chord-context-menu-label">Extend</div>
        <div className="chord-context-menu-buttons">
          <button onClick={() => { onExtend('7'); onClose(); }}>7</button>
          <button onClick={() => { onExtend('9'); onClose(); }}>9</button>
          <button onClick={() => { onExtend('11'); onClose(); }}>11</button>
          <button onClick={() => { onExtend('13'); onClose(); }}>13</button>
        </div>
      </div>

      <div className="chord-context-menu-section">
        <div className="chord-context-menu-label">Quality</div>
        <div className="chord-context-menu-buttons">
          <button onClick={() => { onModifyQuality('augmented'); onClose(); }}>Aug</button>
          <button onClick={() => { onModifyQuality('diminished'); onClose(); }}>Dim</button>
          <button onClick={() => { onModifyQuality('dominant'); onClose(); }}>Dom</button>
        </div>
      </div>

      <div className="chord-context-menu-section">
        <div className="chord-context-menu-label">Ambiguous</div>
        <div className="chord-context-menu-buttons">
          <button onClick={() => { onAddSuspension('sus2'); onClose(); }}>Sus2</button>
          <button onClick={() => { onAddSuspension('sus4'); onClose(); }}>Sus4</button>
        </div>
      </div>

      <div className="chord-context-menu-section">
        <div className="chord-context-menu-label">Tone</div>
        <div className="chord-context-menu-buttons">
          <button onClick={() => { onTranspose('up'); onClose(); }}>↑ ½</button>
          <button onClick={() => { onTranspose('down'); onClose(); }}>↓ ½</button>
        </div>
      </div>

      {onRemove && (
        <div className="chord-context-menu-section">
          <div className="chord-context-menu-buttons">
            <button 
              className="chord-context-menu-remove"
              onClick={() => { onRemove(); onClose(); }}
            >
              Remove chord
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
