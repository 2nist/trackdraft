import React from "react";
import { Key, Chord } from "../../types/music";
import { romanNumeralToChord } from "../../lib/harmony/keyUtils";
import { ChordShape } from "./ChordShape";

interface KeyChordPaletteProps {
  currentKey: Key;
  onChordSelect?: (chord: Chord) => void;
  size?: "small" | "medium" | "large";
}

const ROMAN_NUMERALS_MAJOR = ["I", "ii", "iii", "IV", "V", "vi", "vii°"];
const ROMAN_NUMERALS_MINOR = ["i", "ii°", "III", "iv", "v", "VI", "VII"];

export const KeyChordPalette: React.FC<KeyChordPaletteProps> = ({
  currentKey,
  onChordSelect,
  size = "small",
}) => {
  // Get available roman numerals for the current key mode
  const romanNumerals =
    currentKey.mode === "major"
      ? ROMAN_NUMERALS_MAJOR
      : ROMAN_NUMERALS_MINOR;

  // Build diatonic chords for the key
  const diatonicChords = romanNumerals.map((romanNumeral) =>
    romanNumeralToChord(romanNumeral, currentKey)
  );

  return (
    <div className="key-chord-palette">
      <div className="flex items-center justify-center gap-2 flex-wrap p-2">
        {diatonicChords.map((chord, index) => (
          <div
            key={index}
            onClick={() => onChordSelect?.(chord)}
            className={`transition-all ${
              onChordSelect ? "cursor-pointer hover:scale-110" : ""
            }`}
          >
            <ChordShape
              chordQuality={chord.quality}
              rootNote={chord.name?.split(" ")[0]}
              label={
                chord.name
                  ?.replace(" Major", "")
                  .replace(" minor", "m")
                  .replace(" diminished", "°")
                  .replace(" augmented", "+") || ""
              }
              romanNumeral={chord.romanNumeral}
              size={size}
              showLabel={true}
              showDegree={true}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

