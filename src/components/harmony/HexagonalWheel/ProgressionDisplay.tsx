import { Chord } from '../../../types/music';
import './ProgressionDisplay.css';

interface ProgressionDisplayProps {
  progression: Chord[];
  onChordClick: (index: number) => void;
  onClear: () => void;
}

function formatChordName(chord: Chord): string {
  return (
    chord.name
      ?.replace(' Major', '')
      .replace(' minor', 'm')
      .replace(' diminished', '°')
      .replace(' augmented', '+') || chord.romanNumeral
  );
}

export function ProgressionDisplay({
  progression,
  onChordClick,
  onClear,
}: ProgressionDisplayProps) {
  if (progression.length === 0) {
    return (
      <div className="progression-empty">
        <p>Click chords on the wheel to build a progression</p>
      </div>
    );
  }

  return (
    <div className="progression-display">
      <div className="progression-header">
        <span className="progression-label">Progression</span>
        <button className="clear-button" onClick={onClear} type="button">
          Clear
        </button>
      </div>

      <ol className="progression-chords" aria-label="Chord progression">
        {progression.map((chord, i) => (
          <li key={`${chord.romanNumeral}-${i}`}>
            <button
              className="progression-chord"
              type="button"
              onClick={() => onChordClick(i)}
              title="Click to remove"
            >
              <span className="chord-numeral">{chord.romanNumeral}</span>
              <span className="chord-name">{formatChordName(chord)}</span>
            </button>
            {i < progression.length - 1 && (
              <span className="progression-arrow" aria-hidden="true">
                →
              </span>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}

