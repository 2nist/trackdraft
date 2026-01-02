import { Key, Chord } from '../../types/music';
import { romanNumeralToChord, notesEqual } from '../../lib/harmony/keyUtils';
import { NOTE_COLORS } from './ChordShape';
import './DiatonicHexagon.css';

interface DiatonicHexagonProps {
  readonly currentKey: Key;
  readonly onChordSelect: (chord: Chord) => void;
  readonly keyCircleRadius: number;
  readonly keyRotation: number;
  readonly keyOrder: readonly string[];
  readonly isAddMode?: boolean;
}

// Helper to get hexagon points (flat-top hexagon)
function getHexagonPoints(size: number): string {
  const points = [];
  for (let i = 0; i < 6; i++) {
    const angle = (60 * i) * Math.PI / 180;
    const x = size * Math.cos(angle);
    const y = size * Math.sin(angle);
    points.push(`${x},${y}`);
  }
  return points.join(' ');
}

export function DiatonicHexagon({
  currentKey,
  onChordSelect,
  keyCircleRadius,
  keyRotation,
  keyOrder,
  isAddMode = false,
}: DiatonicHexagonProps) {
  const ROMAN_NUMERALS_MAJOR = ["I", "ii", "iii", "IV", "V", "vi", "vii°"];
  const ROMAN_NUMERALS_MINOR = ["i", "ii°", "III", "iv", "v", "VI", "VII"];
  
  const romanNumerals = currentKey.mode === "major" ? ROMAN_NUMERALS_MAJOR : ROMAN_NUMERALS_MINOR;
  const diatonicChords = romanNumerals.map((rn) => romanNumeralToChord(rn, currentKey));
  
  // Find the selected key's position in the key circle
  const selectedKeyIndex = keyOrder.findIndex(note => notesEqual(note, currentKey.root));
  
  // Don't render if key not found
  if (selectedKeyIndex === -1) {
    return null;
  }
  
  // Position hexagon to overlay the current key at 12 o'clock
  // The key circle rotates to bring the selected key to 12 o'clock, so position hex at top center
  const centerX = 0; // Center horizontally
  const centerY = -keyCircleRadius; // Position at the key's location (centered over 12 o'clock key button)
  
  // Hexagon size for each chord button (reduced further to prevent overlap)
  const hexSize = 20;
  
  // Position chords in hexagon: key in center, 6 diatonic chords around it
  // Skip the root chord (I/i) since the key represents it
  // Increased spacing to prevent hexagons from overlapping each other
  const positions = [
    { x: 0, y: 0, isKey: true }, // Center - the key itself
    { x: 0, y: -hexSize * 2.2, chordIndex: 4 }, // Top (V) - increased spacing
    { x: hexSize * 1.9, y: -hexSize * 1.1, chordIndex: 2 }, // Top-right (iii) - increased spacing
    { x: hexSize * 1.9, y: hexSize * 1.1, chordIndex: 6 }, // Bottom-right (vii°) - increased spacing
    { x: 0, y: hexSize * 2.2, chordIndex: 3 }, // Bottom (IV) - increased spacing
    { x: -hexSize * 1.9, y: hexSize * 1.1, chordIndex: 1 }, // Bottom-left (ii) - increased spacing
    { x: -hexSize * 1.9, y: -hexSize * 1.1, chordIndex: 5 }, // Top-left (vi) - increased spacing
  ];
  
  const chordLabel = (chord: Chord) => {
    return chord.name
      ?.replace(" Major", "")
      .replace(" minor", "m")
      .replace(" diminished", "°")
      .replace(" augmented", "+") || "";
  };
  
  return (
    <div
      className="diatonic-hexagon-container"
      style={{
        left: '50%',
        top: `calc(50% + ${centerY}px)`,
        transform: 'translate(-50%, -50%)',
        transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      <svg
        width="240"
        height="240"
        viewBox="-120 -120 240 240"
        className="diatonic-hexagon-svg"
        style={{ overflow: 'visible' }}
      >
        {positions.map((pos, i) => {
          if (pos.isKey) {
            // Center hexagon - the key itself
            const keyLabel = currentKey.root;
            const keyColor = NOTE_COLORS[keyLabel] || NOTE_COLORS['C'];
            return (
              <g key="key-hex" transform={`translate(${pos.x}, ${pos.y})`}>
                <polygon
                  points={getHexagonPoints(hexSize * 1.1)}
                  className="hex-key"
                  fill={`${keyColor}80`}
                  stroke={keyColor}
                  strokeWidth="2"
                  style={{ pointerEvents: 'none' }}
                />
                <text
                  x="0"
                  y="0"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="hex-key-text"
                >
                  <tspan x="0" dy="-5" className="hex-key-name">{keyLabel}</tspan>
                  <tspan x="0" dy="9" className="hex-key-mode">{currentKey.mode}</tspan>
                </text>
              </g>
            );
          }
          
          // Diatonic chord hexagons around the key
          const chord = diatonicChords[pos.chordIndex!];
          const label = chordLabel(chord);
          
          // Get color from root note
          const rootNote = chord.name?.split(' ')[0] || currentKey.root;
          const chordColor = NOTE_COLORS[rootNote] || NOTE_COLORS['C'];
          
          // Determine quality for opacity/styling
          const isMinor = chord.name?.includes('minor');
          const isDiminished = chord.name?.includes('diminished');
          const fillOpacity = isDiminished ? '40' : isMinor ? '50' : '60';
          
          return (
            <g key={`${chord.romanNumeral}-${i}`} transform={`translate(${pos.x}, ${pos.y})`}>
              <polygon
                points={getHexagonPoints(hexSize)}
                className="hex-chord"
                fill={`${chordColor}${fillOpacity}`}
                stroke={chordColor}
                strokeWidth="2"
                onClick={(e) => {
                  e.stopPropagation();
                  onChordSelect(chord);
                }}
                style={{ cursor: 'pointer', pointerEvents: 'all' }}
                data-chord-name={chord.name}
                data-roman-numeral={chord.romanNumeral}
              />
              <text
                x="0"
                y="0"
                textAnchor="middle"
                dominantBaseline="middle"
                className="hex-chord-text"
                style={{ cursor: 'pointer', pointerEvents: 'none' }}
              >
                <tspan x="0" dy="-3" className="hex-roman">{chord.romanNumeral}</tspan>
                <tspan x="0" dy="6.5" className="hex-label">{label}</tspan>
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
