import { useSongStore } from '../../store/songStore';
import { getCircleOfFifths, getAllNotes, notesEqual } from '../../lib/harmony/keyUtils';
import { Key } from '../../types/music';
import { useState } from 'react';

export default function KeySelector() {
  const { currentSong, updateKey } = useSongStore();
  const [preferFlats, setPreferFlats] = useState(false);
  
  const currentKey = currentSong?.key || { root: 'C', mode: 'major' };
  const circleOfFifths = getCircleOfFifths();
  const allNotes = getAllNotes();

  const handleKeySelect = (root: string) => {
    updateKey({ root, mode: currentKey.mode });
  };

  const handleModeToggle = () => {
    const newMode = currentKey.mode === 'major' ? 'minor' : 'major';
    updateKey({ root: currentKey.root, mode: newMode });
  };

  // Determine if a note is a "white key" (natural) or "black key" (sharp/flat)
  const isNaturalNote = (note: string): boolean => {
    return !note.includes('#') && !note.includes('b');
  };

  // Get display name for note
  const getDisplayNote = (note: string): string => {
    if (preferFlats) {
      const flatMap: Record<string, string> = {
        'C#': 'Db',
        'D#': 'Eb',
        'F#': 'Gb',
        'G#': 'Ab',
        'A#': 'Bb',
      };
      return flatMap[note] || note;
    }
    return note;
  };

  return (
    <div className="space-y-6">
      {/* Mode Toggle */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={handleModeToggle}
          className={`px-6 py-3 rounded-lg font-semibold transition-all border-2 ${
            currentKey.mode === 'major'
              ? 'border-accent bg-accent/10 text-white'
              : 'border-gray-700 bg-transparent text-gray-400 hover:border-gray-600 hover:text-white hover:bg-gray-800/20'
          }`}
        >
          Major
        </button>
        <button
          onClick={handleModeToggle}
          className={`px-6 py-3 rounded-lg font-semibold transition-all border-2 ${
            currentKey.mode === 'minor'
              ? 'border-accent bg-accent/10 text-white'
              : 'border-gray-700 bg-transparent text-gray-400 hover:border-gray-600 hover:text-white hover:bg-gray-800/20'
          }`}
        >
          Minor
        </button>
      </div>

      {/* Circle of Fifths Layout */}
      <div className="flex flex-col items-center">
        <div className="relative w-96 h-96">
          {circleOfFifths.map((note, index) => {
            const angle = (index * 30 - 90) * (Math.PI / 180); // 30 degrees per note
            const radius = 140;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            const isSelected = notesEqual(note, currentKey.root);
            const isNatural = isNaturalNote(note);

            return (
              <button
                key={note}
                onClick={() => handleKeySelect(note)}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 rounded-full font-semibold transition-all border-2 bg-transparent ${
                  isSelected
                    ? 'border-accent bg-accent/10 text-white scale-110 shadow-lg shadow-accent/50'
                    : isNatural
                    ? 'border-gray-400 text-white hover:border-gray-300 hover:bg-gray-400/10'
                    : 'border-gray-600 text-gray-300 hover:border-gray-500 hover:bg-gray-600/10'
                }`}
                style={{
                  left: `calc(50% + ${x}px)`,
                  top: `calc(50% + ${y}px)`,
                  width: isSelected ? '56px' : '48px',
                  height: isSelected ? '56px' : '48px',
                }}
              >
                {getDisplayNote(note)}
              </button>
            );
          })}
        </div>

        {/* Scale Degrees Display */}
        <div className="mt-8 flex items-center gap-2">
          <span className="text-sm text-gray-400">Scale Degrees:</span>
          <div className="flex gap-1">
            {['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'].map((degree, index) => (
              <span
                key={degree}
                className={`px-2 py-1 rounded text-xs font-medium border ${
                  index === 0
                    ? 'border-accent bg-accent/10 text-white'
                    : 'border-gray-700 bg-transparent text-gray-400'
                }`}
              >
                {currentKey.mode === 'minor' && index === 0
                  ? 'i'
                  : currentKey.mode === 'minor' && index === 2
                  ? 'III'
                  : currentKey.mode === 'minor' && index === 4
                  ? 'v'
                  : degree}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Selected Key Display */}
      <div className="text-center">
        <div className="inline-block px-6 py-3 border-2 border-accent bg-accent/10 rounded-lg">
          <p className="text-sm text-gray-300 mb-1">Selected Key</p>
          <p className="text-3xl font-bold text-white">
            {getDisplayNote(currentKey.root)} {currentKey.mode === 'major' ? 'Major' : 'Minor'}
          </p>
        </div>
      </div>
    </div>
  );
}

