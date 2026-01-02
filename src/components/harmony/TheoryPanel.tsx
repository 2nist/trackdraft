import { Chord, Key } from '../../types/music';
import { romanNumeralToChord } from '../../lib/harmony/keyUtils';
import { getAllSubstitutions } from '../../lib/harmony/substitutions';
import { ArrowRight, Sparkles, RefreshCw, Music2, ArrowRightCircle } from 'lucide-react';
import './TheoryPanel.css';

interface TheoryPanelProps {
  readonly selectedChord: Chord | null;
  readonly selectedIndex: number | null;
  readonly currentProgression: readonly Chord[];
  readonly currentKey: Key;
  readonly onExtend: (chord: Chord) => void;
  readonly onBorrow: (chord: Chord) => void;
  readonly onModulate: (newRoot: string) => void;
  readonly onSubstitute: (chord: Chord) => void;
  readonly onInsertProgression: (progression: string[]) => void;
  readonly onAddNextChord: (roman: string) => void;
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

export function TheoryPanel({
  selectedChord,
  selectedIndex,
  currentProgression,
  currentKey,
  onExtend,
  onBorrow,
  onModulate,
  onSubstitute,
  onInsertProgression,
  onAddNextChord,
}: TheoryPanelProps) {
  const lastChord = currentProgression[currentProgression.length - 1];
  const suggestions = lastChord 
    ? CHORD_FUNCTIONS[lastChord.romanNumeral]?.commonNext || []
    : ['I', 'IV', 'V', 'vi'];

  const handleExtend = () => {
    if (!selectedChord) return;
    const extended = { ...selectedChord };
    
    // Determine 7th quality based on chord function
    if (selectedChord.romanNumeral === 'I' || selectedChord.romanNumeral === 'IV') {
      extended.name = extended.name?.replace(' Major', '') + 'maj7';
    } else if (selectedChord.romanNumeral === 'V') {
      extended.name = extended.name?.replace(' Major', '') + '7';
    } else if (selectedChord.romanNumeral === 'vii°') {
      extended.name = extended.name?.replace(' diminished', '') + 'm7♭5';
    } else {
      extended.name = extended.name?.replace(' minor', '') + 'm7';
    }
    
    onExtend(extended);
  };

  const handleBorrow = () => {
    if (!selectedChord || !selectedChord.romanNumeral) return;
    
    const parallelMode = currentKey.mode === 'major' ? 'minor' : 'major';
    const borrowedMap: Record<string, { major: string; minor: string }> = {
      'I': { major: 'i', minor: 'I' },
      'ii': { major: 'ii°', minor: 'ii' },
      'iii': { major: 'III', minor: 'iii' },
      'IV': { major: 'iv', minor: 'IV' },
      'V': { major: 'v', minor: 'V' },
      'vi': { major: 'VI', minor: 'vi' },
      'vii°': { major: 'VII', minor: 'vii°' },
    };
    
    const mapping = borrowedMap[selectedChord.romanNumeral];
    if (!mapping) return;
    
    const parallelRoman = currentKey.mode === 'major' ? mapping.major : mapping.minor;
    
    try {
      const borrowedChord = romanNumeralToChord(parallelRoman, {
        root: currentKey.root,
        mode: parallelMode,
      });
      onBorrow(borrowedChord);
    } catch (error) {
      console.error('Cannot borrow chord:', error);
    }
  };

  const handleModulate = () => {
    if (!selectedChord) return;
    const rootNote = selectedChord.name?.split(' ')?.[0] ?? currentKey.root;
    onModulate(rootNote);
  };

  const handleSubstitute = () => {
    if (!selectedChord) return;
    const subs = getAllSubstitutions(selectedChord, currentKey);
    const sub = subs.functional[0] || subs.commonTone[0] || subs.modalInterchange[0];
    if (sub) {
      onSubstitute(sub.chord);
    }
  };

  return (
    <div className="theory-panel">
      {/* Chord Actions - Show hint when no chord selected */}
      {!selectedChord || selectedIndex === null ? (
        <div className="theory-section">
          <h3 className="theory-section-title">Chord Actions</h3>
          <div className="action-hint">
            <p className="hint-text">Click a chord in the progression to see actions:</p>
            <div className="action-buttons-hint">
              <span className="hint-action">Extend</span>
              <span className="hint-action">Borrow</span>
              <span className="hint-action">Modulate</span>
              <span className="hint-action">Substitute</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="theory-section">
          <h3 className="theory-section-title">Chord Actions</h3>
          <div className="action-buttons">
            <button
              type="button"
              className="action-button action-extend"
              onClick={handleExtend}
              title="Add 7th extension"
            >
              <ArrowRight size={11} />
              <span>Extend</span>
            </button>
            <button
              type="button"
              className="action-button action-borrow"
              onClick={handleBorrow}
              title="Borrow from parallel mode"
            >
              <RefreshCw size={11} />
              <span>Borrow</span>
            </button>
            <button
              type="button"
              className="action-button action-modulate"
              onClick={handleModulate}
              title="Modulate to this chord's key"
            >
              <Music2 size={11} />
              <span>Modulate</span>
            </button>
            <button
              type="button"
              className="action-button action-substitute"
              onClick={handleSubstitute}
              title="Substitute with related chord"
            >
              <Sparkles size={11} />
              <span>Substitute</span>
            </button>
          </div>
          <div className="chord-info">
            <span className="chord-info-label">{selectedChord.romanNumeral}</span>
            <span className="chord-info-value">{selectedChord.name}</span>
          </div>
        </div>
      )}

      {/* Next Chord Suggestions */}
      {lastChord && (
        <div className="theory-section">
          <h3 className="theory-section-title">Next Chord</h3>
          <div className="suggestions-grid">
            {suggestions.map((roman) => {
              const suggestedChord = romanNumeralToChord(roman, currentKey);
              const chordLabel = suggestedChord.name
                ?.replace(" Major", "")
                .replace(" minor", "m")
                .replace(" diminished", "°")
                .replace(" augmented", "+") || "";
              return (
                <button
                  key={roman}
                  type="button"
                  className="suggestion-chip"
                  onClick={() => onAddNextChord(roman)}
                  title={`${suggestedChord.name || roman}`}
                >
                  <span className="suggestion-roman">{roman}</span>
                  <span className="suggestion-name">{chordLabel}</span>
                  <ArrowRightCircle size={12} className="suggestion-arrow" />
                </button>
              );
            })}
          </div>
          {CHORD_FUNCTIONS[lastChord.romanNumeral] && (
            <div className="function-hint">
              <span className="function-label">Function:</span>
              <span className="function-value">{CHORD_FUNCTIONS[lastChord.romanNumeral].function}</span>
            </div>
          )}
        </div>
      )}

      {/* Quick Progressions */}
      <div className="theory-section">
        <h3 className="theory-section-title">Quick Progressions</h3>
        <div className="progression-list">
          {COMMON_PROGRESSIONS.map((prog) => (
            <button
              key={prog.name}
              type="button"
              className="progression-item"
              onClick={() => onInsertProgression(prog.progression)}
              title={prog.description}
            >
              <span className="progression-name">{prog.name}</span>
              <span className="progression-romans">{prog.progression.join(' - ')}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Theory Info */}
      <div className="theory-section">
        <div className="theory-info">
          <div className="info-row">
            <span className="info-label">Key:</span>
            <span className="info-value">{currentKey.root} {currentKey.mode}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Chords:</span>
            <span className="info-value">{currentProgression.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
