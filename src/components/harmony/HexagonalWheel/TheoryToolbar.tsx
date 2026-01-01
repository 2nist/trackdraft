import { Chord } from '../../../types/music';
import { Key } from '../../../types/music';
import './TheoryToolbar.css';

interface TheoryToolbarProps {
  currentProgression: Chord[];
  currentKey: Key;
  onInsertProgression: (progression: string[]) => void;
}

const COMMON_PROGRESSIONS = [
  { name: 'I-V-vi-IV', progression: ['I', 'V', 'vi', 'IV'], description: 'Pop progression' },
  { name: 'I-vi-IV-V', progression: ['I', 'vi', 'IV', 'V'], description: '50s progression' },
  { name: 'vi-IV-I-V', progression: ['vi', 'IV', 'I', 'V'], description: 'Axis progression' },
  { name: 'I-IV-V', progression: ['I', 'IV', 'V'], description: 'Basic blues' },
  { name: 'ii-V-I', progression: ['ii', 'V', 'I'], description: 'Jazz cadence' },
  { name: 'I-vi-ii-V', progression: ['I', 'vi', 'ii', 'V'], description: 'Circle progression' },
];

const CHORD_FUNCTIONS: Record<string, { function: string; commonNext: string[] }> = {
  'I': { function: 'Tonic', commonNext: ['V', 'vi', 'IV', 'ii'] },
  'ii': { function: 'Subdominant', commonNext: ['V', 'I', 'vi'] },
  'iii': { function: 'Tonic substitute', commonNext: ['vi', 'IV', 'I'] },
  'IV': { function: 'Subdominant', commonNext: ['V', 'I', 'vi'] },
  'V': { function: 'Dominant', commonNext: ['I', 'vi'] },
  'vi': { function: 'Tonic substitute', commonNext: ['IV', 'V', 'ii'] },
  'vii°': { function: 'Dominant substitute', commonNext: ['I', 'V'] },
};

export function TheoryToolbar({
  currentProgression,
  currentKey,
  onInsertProgression,
}: TheoryToolbarProps) {
  
  const lastChord = currentProgression[currentProgression.length - 1];
  const suggestions = lastChord 
    ? CHORD_FUNCTIONS[lastChord.romanNumeral]?.commonNext || []
    : ['I', 'IV', 'V', 'vi'];
  
  return (
    <div className="theory-toolbar">
      <div className="toolbar-section">
        <h3 className="toolbar-title">Quick Progressions</h3>
        <div className="progression-grid">
          {COMMON_PROGRESSIONS.map((prog) => (
            <button
              key={prog.name}
              type="button"
              className="progression-button"
              onClick={() => onInsertProgression(prog.progression)}
              title={prog.description}
            >
              <div className="progression-name">{prog.name}</div>
              <div className="progression-romans">{prog.progression.join(' - ')}</div>
            </button>
          ))}
        </div>
      </div>
      
      {lastChord && (
        <div className="toolbar-section">
          <h3 className="toolbar-title">Next Chord Suggestions</h3>
          <div className="suggestions-list">
            {suggestions.map((roman) => (
              <button
                key={roman}
                type="button"
                className="suggestion-button"
                onClick={() => onInsertProgression([roman])}
              >
                {roman}
              </button>
            ))}
          </div>
          <div className="chord-function">
            <span className="function-label">Function:</span>
            <span className="function-value">
              {CHORD_FUNCTIONS[lastChord.romanNumeral]?.function || 'Unknown'}
            </span>
          </div>
        </div>
      )}
      
      <div className="toolbar-section">
        <h3 className="toolbar-title">Theory</h3>
        <div className="theory-info">
          <div className="info-item">
            <span className="info-label">Key:</span>
            <span className="info-value">
              {currentKey.root} {currentKey.mode}
            </span>
          </div>
          <div className="info-item">
            <span className="info-label">Chords:</span>
            <span className="info-value">{currentProgression.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
