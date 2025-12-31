import { useState } from "react";
import EnhancedProgressionBuilder from "./EnhancedProgressionBuilder";
import { HexagonalWheel } from "./HexagonalWheel";
import { useSongStore } from "../../store/songStore";
import { getNoteIndex, romanNumeralToChord } from "../../lib/harmony/keyUtils";
import { PITCH_NAMES } from "../../lib/harmony/constants";
import { HexPosition } from "../../lib/harmony/hexagonal-layers-corrected";
import { useToastStore } from "../../store/toastStore";

export default function HarmonyView() {
  const { currentSong, updateProgression, updateKey } = useSongStore();
  const { showSuccess } = useToastStore();
  const [viewMode, setViewMode] = useState<"classic" | "hexagonal">("hexagonal");

  if (!currentSong) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-400">Create a song first to explore harmony</p>
      </div>
    );
  }

  const rootPitch = getNoteIndex(currentSong.key.root);
  const mode = currentSong.key.mode;

  const handleChordSelect = (position: HexPosition) => {
    // Convert HexPosition to Chord and add to progression
    try {
      if (position.romanNumeral) {
        const chord = romanNumeralToChord(position.romanNumeral, currentSong.key);
        const currentProgression = currentSong.progression || [];
        updateProgression([...currentProgression, chord]);
        showSuccess(`Added ${position.chord} to progression`);
      }
    } catch (error) {
      console.error("Error adding chord:", error);
    }
  };

  const handleKeyChange = (newRoot: number) => {
    const newRootName = PITCH_NAMES[newRoot];
    updateKey({
      root: newRootName,
      mode: currentSong.key.mode,
    });
    showSuccess(`Changed key to ${newRootName} ${mode}`);
  };

  return (
    <div className="space-y-6">
      {/* View Mode Toggle */}
      <div className="flex justify-end gap-2 mb-4">
        <button
          onClick={() => setViewMode("classic")}
          className={`px-4 py-2 rounded-lg font-medium transition-all border-2 ${
            viewMode === "classic"
              ? "border-accent bg-accent/10 text-white"
              : "border-transparent bg-transparent text-gray-400 hover:text-white hover:bg-gray-800/20"
          }`}
        >
          Classic View
        </button>
        <button
          onClick={() => setViewMode("hexagonal")}
          className={`px-4 py-2 rounded-lg font-medium transition-all border-2 ${
            viewMode === "hexagonal"
              ? "border-accent bg-accent/10 text-white"
              : "border-transparent bg-transparent text-gray-400 hover:text-white hover:bg-gray-800/20"
          }`}
        >
          Hexagonal Wheel
        </button>
      </div>

      {/* Render selected view */}
      {viewMode === "hexagonal" ? (
        <HexagonalWheel
          rootPitch={rootPitch}
          mode={mode}
          onChordSelect={handleChordSelect}
          onKeyChange={handleKeyChange}
        />
      ) : (
        <EnhancedProgressionBuilder />
      )}
    </div>
  );
}
