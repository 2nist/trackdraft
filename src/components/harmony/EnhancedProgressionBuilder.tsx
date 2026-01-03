import { useState, useEffect, Fragment } from "react";
import { useSongStore } from "../../store/songStore";
import { useSchemaStore } from "../../store/schemaStore";
import { chordSchemas } from "../../data/chordSchemas";
import { romanNumeralToChord } from "../../lib/harmony/keyUtils";
import {
  SubstitutionOption,
} from "../../lib/harmony/substitutions";
import { Chord } from "../../types/music";
import { Plus, ChevronDown, Save, X, Trash2, Play, Settings, Sparkles, BarChart3, Undo2, Redo2, Download, Trash } from "lucide-react";
import CircularProgressionView from "./CircularProgressionView";
import { EnhancedProgressionCard } from "./EnhancedProgressionCard";
import { TheoryPanel } from "./TheoryPanel";
import { KeyChordPalette } from "./KeyChordPalette";
import { ChordShape } from "./ChordShape";
import { useToastStore } from "../../store/toastStore";
import { reaperBridge } from "../../lib/reaper-bridge";
import { useReaperConnection } from "../../hooks/useReaperConnection";
import { useProgressionStore } from "../../store/progressionStore";

export default function EnhancedProgressionBuilder() {
  const { currentSong, updateProgression, updateTempo, updateKey, undo, redo, canUndo, canRedo } =
    useSongStore();
  const {
    customSchemas,
    loadCustomSchemas,
    saveCustomSchema,
    deleteCustomSchema,
    convertProgressionToSchema,
  } = useSchemaStore();
  const { showSuccess, showError } = useToastStore();
  const { connected } = useReaperConnection();
  const { saveProgression: saveNamedProgression, loadProgressions } =
    useProgressionStore();
  const [selectedSchema, setSelectedSchema] = useState<string | null>(null);
  const [progression, setProgression] = useState<Chord[]>([]);
  const [sending, setSending] = useState(false);
  const [selectedChordIndex, setSelectedChordIndex] = useState<number | null>(
    null
  );
  const [bars, setBars] = useState<number>(4);
  const [beatsPerBar, setBeatsPerBar] = useState<number>(4);
  const [showSaveSchemaModal, setShowSaveSchemaModal] = useState(false);
  const [schemaName, setSchemaName] = useState("");
  const [showLabelProgressionModal, setShowLabelProgressionModal] =
    useState(false);
  const [progressionName, setProgressionName] = useState("");
  const [selectedCadence, setSelectedCadence] = useState<string>("");

  // Load custom schemas on mount
  useEffect(() => {
    loadCustomSchemas();
  }, [loadCustomSchemas]);

  // Load progressions on mount
  useEffect(() => {
    loadProgressions();
  }, [loadProgressions]);

  // Merge built-in and custom schemas
  const allSchemas = [...chordSchemas, ...customSchemas];

  // Calculate total beats from bars and beatsPerBar
  const totalBeats = bars * beatsPerBar;

  // Load progression from song store when song changes
  useEffect(() => {
    if (currentSong?.progression && currentSong.progression.length > 0) {
      setProgression(currentSong.progression);
      // Calculate bars from existing progression if possible
      const currentTotal = currentSong.progression.reduce(
        (sum, chord) => sum + (chord.beats || 2),
        0
      );
      // Try to infer bars from total beats (assuming 4/4)
      if (currentTotal > 0) {
        const calculatedBars = Math.ceil(currentTotal / 4);
        if (calculatedBars > 0 && calculatedBars <= 16) {
          setBars(calculatedBars);
        }
      }
    } else {
      // Initialize with root chord (16 beats) if no progression exists
      if (currentSong?.key) {
        const rootChord = romanNumeralToChord("I", currentSong.key);
        rootChord.beats = 16;
        const initialProgression = [rootChord];
        setProgression(initialProgression);
        setBars(4); // 16 beats = 4 bars at 4/4 time
        updateProgression(initialProgression);
      } else {
        setProgression([]);
      }
      setSelectedSchema(null);
    }
  }, [currentSong?.id]);

  // Recalculate chord names when key changes (but keep the same roman numerals and beats)
  useEffect(() => {
    if (!currentSong || progression.length === 0) return;

    // Recalculate all chords with the new key
    const recalculatedProgression = progression.map((chord) => {
      const newChord = romanNumeralToChord(chord.romanNumeral, currentSong.key);
      return {
        ...newChord,
        beats: chord.beats, // Preserve the beats
      };
    });

    setProgression(recalculatedProgression);
    saveProgression(recalculatedProgression);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSong?.key?.root, currentSong?.key?.mode]); // Only react to key changes

  // Normalize progression beats to fit within totalBeats when totalBeats changes
  useEffect(() => {
    if (progression.length === 0 || totalBeats <= 0) return;

    const currentTotal = progression.reduce(
      (sum, chord) => sum + (chord.beats || 2),
      0
    );

    // Only normalize if there's a significant difference (more than 0.5 beats)
    if (Math.abs(currentTotal - totalBeats) > 0.5) {
      // Scale progression beats to fit new total
      const scaleFactor = totalBeats / currentTotal;
      const normalizedProgression = progression.map((chord) => ({
        ...chord,
        beats: Math.max(0.5, (chord.beats || 2) * scaleFactor),
      }));

      // Ensure the sum matches exactly totalBeats
      const normalizedTotal = normalizedProgression.reduce(
        (sum, chord) => sum + (chord.beats || 0),
        0
      );
      const finalAdjustment = totalBeats - normalizedTotal;
      if (
        Math.abs(finalAdjustment) > 0.01 &&
        normalizedProgression.length > 0
      ) {
        // Adjust the last chord to make exact total
        const lastIndex = normalizedProgression.length - 1;
        normalizedProgression[lastIndex] = {
          ...normalizedProgression[lastIndex],
          beats:
            (normalizedProgression[lastIndex].beats || 0) + finalAdjustment,
        };
      }

      setProgression(normalizedProgression);
      saveProgression(normalizedProgression);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalBeats]); // Only react to totalBeats changes, not progression changes

  // Save progression to store
  const saveProgression = (newProgression: Chord[]) => {
    if (newProgression.length > 0 && currentSong) {
      updateProgression(newProgression);
    }
  };

  const handleSchemaSelect = (schemaName: string) => {
    const schema = allSchemas.find((s) => s.name === schemaName);
    if (!schema || !currentSong) return;

    const chords = schema.progression.map((romanNumeral) => {
      const chord = romanNumeralToChord(romanNumeral, currentSong.key);
      return { ...chord, beats: 2 }; // Default 2 beats
    });

    setProgression(chords);
    setSelectedSchema(schemaName);
    setSelectedChordIndex(null);
    saveProgression(chords);
  };

  const handleAddChord = (chord: Chord) => {
    const newChordBeats = 2; // Default 2 beats for new chord
    const currentTotal = progression.reduce(
      (sum, c) => sum + (c.beats || 2),
      0
    );
    const newTotal = currentTotal + newChordBeats;

    let newProgression: Chord[];

    if (newTotal > totalBeats) {
      // Need to redistribute beats to fit within totalBeats
      // Scale all existing chords proportionally, then add new chord
      const availableBeats = totalBeats - newChordBeats;
      const scaleFactor = availableBeats / currentTotal;

      newProgression = progression.map((c) => ({
        ...c,
        beats: Math.max(0.5, (c.beats || 2) * scaleFactor),
      }));

      // Add the new chord
      newProgression.push({ ...chord, beats: newChordBeats });

      // Ensure exact total by adjusting the last chord
      const finalTotal = newProgression.reduce(
        (sum, c) => sum + (c.beats || 0),
        0
      );
      const adjustment = totalBeats - finalTotal;
      if (Math.abs(adjustment) > 0.01 && newProgression.length > 0) {
        const lastIndex = newProgression.length - 1;
        newProgression[lastIndex] = {
          ...newProgression[lastIndex],
          beats: Math.max(0.5, (newProgression[lastIndex].beats || 0) + adjustment),
        };
      }
    } else {
      // Simply add the new chord
      newProgression = [...progression, { ...chord, beats: newChordBeats }];
    }

    setProgression(newProgression);
    saveProgression(newProgression);
  };

  const handleRemoveChord = (index: number) => {
    const newProgression = progression.filter((_, i) => i !== index);
    setProgression(newProgression);
    setSelectedChordIndex(null);
    saveProgression(newProgression);
  };

  const handleBeatsChange = (index: number, beats: number) => {
    const newProgression = [...progression];
    newProgression[index] = { ...newProgression[index], beats };

    // Check if total exceeds available beats, and adjust if needed
    const newTotal = newProgression.reduce(
      (sum, chord) => sum + (chord.beats || 2),
      0
    );
    if (newTotal > totalBeats) {
      // Scale down all chords proportionally to fit
      const scaleFactor = totalBeats / newTotal;
      newProgression.forEach((chord, i) => {
        newProgression[i] = {
          ...chord,
          beats: Math.max(0.5, (chord.beats || 2) * scaleFactor),
        };
      });
      // Ensure exact total
      const adjustedTotal = newProgression.reduce(
        (sum, chord) => sum + (chord.beats || 0),
        0
      );
      const finalAdjustment = totalBeats - adjustedTotal;
      if (Math.abs(finalAdjustment) > 0.01 && newProgression.length > 0) {
        const lastIndex = newProgression.length - 1;
        newProgression[lastIndex] = {
          ...newProgression[lastIndex],
          beats: (newProgression[lastIndex].beats || 0) + finalAdjustment,
        };
      }
    }

    setProgression(newProgression);
    saveProgression(newProgression);
  };

  const handleRotate = () => {
    if (progression.length === 0 || !currentSong) return;

    const rotated = [...progression.slice(1), progression[0]];
    setProgression(rotated);
    setSelectedChordIndex(null);
    saveProgression(rotated);
  };

  const handleChordClick = (index: number) => {
    if (!currentSong) return;

    const chord = progression[index];
    setSelectedChordIndex(index);
  };

  const handleChordModify = (index: number, modifiedChord: Chord) => {
    if (!currentSong) return;

    const newProgression = [...progression];
    const beats = newProgression[index].beats || 2;
    newProgression[index] = { ...modifiedChord, beats };
    setProgression(newProgression);
    saveProgression(newProgression);
    
    // Keep the same chord selected
    setSelectedChordIndex(index);
  };

  const handleSubstitute = (substitution: SubstitutionOption) => {
    if (selectedChordIndex === null) return;

    const newProgression = [...progression];
    const beats = newProgression[selectedChordIndex].beats || 2;
    newProgression[selectedChordIndex] = { ...substitution.chord, beats };
    setProgression(newProgression);
    saveProgression(newProgression);
  };

  // Theory panel handlers
  const handleExtend = (extendedChord: Chord) => {
    if (selectedChordIndex === null || !currentSong) return;
    const newProgression = [...progression];
    const beats = newProgression[selectedChordIndex].beats || 2;
    newProgression[selectedChordIndex] = { ...extendedChord, beats };
    setProgression(newProgression);
    saveProgression(newProgression);
    showSuccess(`Extended to ${extendedChord.name}`);
  };

  const handleBorrow = (borrowedChord: Chord) => {
    if (selectedChordIndex === null || !currentSong) return;
    const newProgression = [...progression];
    const beats = newProgression[selectedChordIndex].beats || 2;
    newProgression[selectedChordIndex] = { ...borrowedChord, beats };
    setProgression(newProgression);
    saveProgression(newProgression);
    showSuccess(`Borrowed ${borrowedChord.name}`);
  };

  const handleModulate = (newRoot: string) => {
    if (!currentSong) return;
    updateKey({
      root: newRoot,
      mode: currentSong.key.mode,
    });
    showSuccess(`Modulated to ${newRoot} ${currentSong.key.mode}`);
  };

  const handleTheorySubstitute = (subChord: Chord) => {
    if (selectedChordIndex === null || !currentSong) return;
    const newProgression = [...progression];
    const beats = newProgression[selectedChordIndex].beats || 2;
    newProgression[selectedChordIndex] = { ...subChord, beats };
    setProgression(newProgression);
    saveProgression(newProgression);
    showSuccess(`Substituted with ${subChord.name}`);
  };

  const handleInsertProgression = (romanProgression: string[]) => {
    if (!currentSong) return;
    const newChords = romanProgression.map((rn) => {
      const chord = romanNumeralToChord(rn, currentSong.key);
      chord.beats = 2; // Default 2 beats per chord
      return chord;
    });
    const newProgression = [...progression, ...newChords];
    setProgression(newProgression);
    saveProgression(newProgression);
    showSuccess(`Inserted progression: ${romanProgression.join('-')}`);
  };

  const handleAddNextChord = (roman: string) => {
    if (!currentSong) return;
    const chord = romanNumeralToChord(roman, currentSong.key);
    chord.beats = 2;
    const newProgression = [...progression, chord];
    setProgression(newProgression);
    saveProgression(newProgression);
    showSuccess(`Added ${chord.name}`);
  };

  const handleInsertCadence = (cadenceType: string) => {
    if (!currentSong || !cadenceType) return;

    // Define cadences
    const cadences: Record<string, string[]> = {
      "authentic": ["V", "I"], // Perfect authentic cadence
      "plagal": ["IV", "I"], // Plagal cadence (Amen cadence)
      "half": ["V"], // Half cadence (ends on V, creates tension)
      "deceptive": ["V", "vi"], // Deceptive cadence
      "phrygian": ["iv", "I"], // Phrygian cadence (minor iv to I)
    };

    const cadenceProgression = cadences[cadenceType];
    if (!cadenceProgression) return;

    // Calculate current total beats
    const currentTotal = progression.reduce(
      (sum, c) => sum + (c.beats || 2),
      0
    );

    // Create cadence chords
    const cadenceChords = cadenceProgression.map((rn) => {
      const chord = romanNumeralToChord(rn, currentSong.key);
      chord.beats = 2; // Default 2 beats per chord
      return chord;
    });

    const cadenceTotal = cadenceChords.reduce(
      (sum, c) => sum + (c.beats || 2),
      0
    );
    const newTotal = currentTotal + cadenceTotal;

    let newProgression: Chord[];

    if (newTotal > totalBeats) {
      // Redistribute beats to fit
      const availableBeats = totalBeats - cadenceTotal;
      const scaleFactor = availableBeats / currentTotal;

      newProgression = progression.map((c) => ({
        ...c,
        beats: Math.max(0.5, (c.beats || 2) * scaleFactor),
      }));

      newProgression.push(...cadenceChords);

      // Ensure exact total
      const finalTotal = newProgression.reduce(
        (sum, c) => sum + (c.beats || 0),
        0
      );
      const adjustment = totalBeats - finalTotal;
      if (Math.abs(adjustment) > 0.01 && newProgression.length > 0) {
        const lastIndex = newProgression.length - 1;
        newProgression[lastIndex] = {
          ...newProgression[lastIndex],
          beats: Math.max(0.5, (newProgression[lastIndex].beats || 0) + adjustment),
        };
      }
    } else {
      newProgression = [...progression, ...cadenceChords];
    }

    setProgression(newProgression);
    saveProgression(newProgression);
    setSelectedCadence("");
    showSuccess(`Inserted ${cadenceType} cadence`);
  };

  const handleSaveLabeledProgression = () => {
    if (!progressionName.trim() || !currentSong || progression.length === 0) {
      return;
    }

    const namedProgression = {
      id: crypto.randomUUID(),
      name: progressionName.trim(),
      progression: [...progression],
      key: currentSong.key,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveNamedProgression(namedProgression);
    showSuccess(`Progression "${progressionName.trim()}" saved!`);
    setShowLabelProgressionModal(false);
    setProgressionName("");
  };

  const handleSaveSchema = () => {
    if (!schemaName.trim()) {
      showError("Please enter a name for the schema");
      return;
    }

    if (progression.length === 0) {
      showError("Cannot save an empty progression");
      return;
    }

    // Check if a schema with this name already exists (built-in or custom)
    const existingSchema = allSchemas.find((s) => s.name === schemaName.trim());
    if (
      existingSchema &&
      !customSchemas.find((s) => s.name === schemaName.trim())
    ) {
      showError(
        "A built-in schema with this name already exists. Please choose a different name."
      );
      return;
    }

    const schema = convertProgressionToSchema(progression, schemaName.trim());
    saveCustomSchema(schema);
    showSuccess(`Schema "${schemaName.trim()}" saved successfully!`);
    setShowSaveSchemaModal(false);
    setSchemaName("");
    setSelectedSchema(schemaName.trim());
  };

  const handleDeleteSchema = (schemaName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Delete schema "${schemaName}"?`)) {
      deleteCustomSchema(schemaName);
      if (selectedSchema === schemaName) {
        setSelectedSchema(null);
      }
      showSuccess(`Schema "${schemaName}" deleted`);
    }
  };

  const handleSendToReaper = async () => {
    if (!connected) {
      showError(
        "Please connect to Reaper first. Make sure Reaper is running and the bridge script is loaded."
      );
      return;
    }

    if (!currentSong) {
      showError("No song loaded");
      return;
    }

    if (progression.length === 0) {
      showError("No progression to send. Create a progression first.");
      return;
    }

    setSending(true);

    try {
      const result = await reaperBridge.createChordTrack(currentSong);

      if (result.success) {
        showSuccess("Chord track created in Reaper!");
      } else {
        showError(`Error: ${result.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Failed to send to Reaper:", error);
      showError(
        `Failed to send: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setSending(false);
    }
  };

  if (!currentSong) {
    return (
      <div className="text-center py-12">
        <p className="text-white">No song selected</p>
      </div>
    );
  }

  const handleClearProgression = () => {
    if (progression.length === 0) return;
    if (confirm("Clear the entire progression? This cannot be undone.")) {
      setProgression([]);
      setSelectedChordIndex(null);
      saveProgression([]);
      showSuccess("Progression cleared");
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Compact Toolbar - Only essentials */}
      <div className="flex items-center justify-between gap-2 px-2 py-1 border-b border-gray-800 flex-shrink-0">
        <div className="flex items-center gap-1.5">
          {/* Undo/Redo */}
          <button
            onClick={undo}
            disabled={!canUndo()}
            className="p-1 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors rounded hover:bg-gray-800"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 size={14} />
          </button>
          <button
            onClick={redo}
            disabled={!canRedo()}
            className="p-1 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors rounded hover:bg-gray-800"
            title="Redo (Ctrl+Shift+Z)"
          >
            <Redo2 size={14} />
          </button>

          <div className="w-px h-4 bg-gray-700"></div>

          {/* Cadence Insertion */}
          {progression.length > 0 && (
            <select
              value={selectedCadence}
              onChange={(e) => {
                if (e.target.value) {
                  handleInsertCadence(e.target.value);
                }
              }}
              className="px-2 py-1 text-xs bg-black border border-gray-700 rounded text-white focus:outline-none focus:border-accent"
            >
              <option value="">Cadence...</option>
              <option value="authentic">Authentic</option>
              <option value="plagal">Plagal</option>
              <option value="half">Half</option>
              <option value="deceptive">Deceptive</option>
              <option value="phrygian">Phrygian</option>
            </select>
          )}

          {/* Clear Button */}
          {progression.length > 0 && (
            <button
              onClick={handleClearProgression}
              className="flex items-center gap-1 px-2 py-1 text-xs bg-black border border-gray-700 rounded text-white hover:bg-gray-800 hover:border-gray-600 transition-colors"
              title="Clear progression"
            >
              <Trash size={12} />
            </button>
          )}
        </div>

        {/* Right side - Save buttons */}
        <div className="flex items-center gap-1.5">
          {progression.length > 0 && (
            <>
              <button
                onClick={() => setShowLabelProgressionModal(true)}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 border-none rounded text-white font-medium transition-colors"
                title="Save progression with a name"
              >
                <Save size={12} />
                Save
              </button>
              <button
                onClick={() => setShowSaveSchemaModal(true)}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-black border border-gray-700 hover:bg-gray-800 rounded text-white font-medium transition-colors"
                title="Save as reusable template"
              >
                <Save size={12} />
                Template
              </button>
            </>
          )}

          {connected && progression.length > 0 && (
            <button
              onClick={handleSendToReaper}
              disabled={sending}
              className="flex items-center gap-1 px-2 py-1 text-xs bg-black hover:bg-gray-800 border border-gray-700 hover:border-white rounded text-white font-medium transition-colors disabled:opacity-50"
              title="Send to Reaper"
            >
              {sending ? (
                <div className="w-2.5 h-2.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Play size={12} />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Main Content - Centered Wheel */}
      <div className="flex-1 flex gap-2 p-2 min-h-0">
        {/* Center: Chord Wheel - Full Focus */}
        <div className="flex-1 card flex items-center justify-center p-2">
          <CircularProgressionView
            progression={progression}
            selectedIndex={selectedChordIndex}
            onChordClick={handleChordClick}
            onChordRemove={handleRemoveChord}
            onBeatsChange={handleBeatsChange}
            totalBeats={totalBeats}
            beatsPerBar={beatsPerBar}
            onChordModify={handleChordModify}
            onProgressionReorder={(newProgression) => {
              setProgression(newProgression);
              saveProgression(newProgression);
            }}
            onAddChord={handleAddChord}
            isAddChordMode={false}
          />
        </div>

        {/* Right Sidebar - Theory & Chords (Compact) */}
        <div className="w-64 flex flex-col">
          <div className="card flex-1 overflow-hidden flex flex-col p-0">
            {/* Progression Chords */}
            <div className="flex-shrink-0 px-3 pt-2 pb-2 border-b border-gray-800">
              <div className="text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">
                {progression.length} Chord{progression.length !== 1 ? 's' : ''}
              </div>
              {progression.length > 0 ? (
                <div className="flex items-center gap-1 flex-wrap">
                  {progression.map((chord, index) => (
                    <div
                      key={`${chord.romanNumeral}-${index}`}
                      onClick={() => handleChordClick(index)}
                      className="cursor-pointer hover:opacity-80 transition-opacity"
                      title="Click to select"
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
                        size="small"
                        showLabel={true}
                        showDegree={false}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-[10px] text-gray-500 italic">
                  Add chords from hexagon
                </div>
              )}
            </div>

            {/* Theory Panel */}
            <div className="flex-1 overflow-y-auto px-3 pt-3 pb-3">
              <TheoryPanel
                selectedChord={
                  selectedChordIndex !== null
                    ? progression[selectedChordIndex] || null
                    : null
                }
                selectedIndex={selectedChordIndex}
                currentProgression={progression}
                currentKey={currentSong?.key || { root: 'C', mode: 'major' }}
                onExtend={handleExtend}
                onBorrow={handleBorrow}
                onModulate={handleModulate}
                onSubstitute={handleTheorySubstitute}
                onInsertProgression={handleInsertProgression}
                onAddNextChord={handleAddNextChord}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Label Progression Modal */}
      {showLabelProgressionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-black rounded-lg p-6 max-w-md w-full mx-4 border border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                Label Progression
              </h3>
              <button
                onClick={() => {
                  setShowLabelProgressionModal(false);
                  setProgressionName("");
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-white mb-2">
                Progression Name
              </label>
              <input
                type="text"
                value={progressionName}
                onChange={(e) => setProgressionName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && progressionName.trim()) {
                    handleSaveLabeledProgression();
                  } else if (e.key === "Escape") {
                    setShowLabelProgressionModal(false);
                    setProgressionName("");
                  }
                }}
                placeholder="e.g., Verse Progression, Chorus, Bridge"
                className="w-full px-3 py-2 bg-black border border-gray-700 rounded text-white focus:outline-none focus:border-accent"
                autoFocus
              />
            </div>

            <div className="mb-4">
              <div className="text-sm text-gray-400 mb-2">
                Current Progression:
              </div>
              <div className="text-sm text-white font-mono bg-black/50 p-2 rounded">
                {progression.map((chord) => chord.romanNumeral).join(" - ")}
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowLabelProgressionModal(false);
                  setProgressionName("");
                }}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveLabeledProgression}
                disabled={!progressionName.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save Schema Modal */}
      {showSaveSchemaModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-black rounded-lg p-6 max-w-md w-full mx-4 border border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                Save Progression as Schema
              </h3>
              <button
                onClick={() => {
                  setShowSaveSchemaModal(false);
                  setSchemaName("");
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-white mb-2">
                Schema Name
              </label>
              <input
                type="text"
                value={schemaName}
                onChange={(e) => setSchemaName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSaveSchema();
                  } else if (e.key === "Escape") {
                    setShowSaveSchemaModal(false);
                    setSchemaName("");
                  }
                }}
                placeholder="e.g., My Custom Progression"
                className="w-full px-3 py-2 bg-black border border-gray-700 rounded text-white focus:outline-none focus:border-accent"
                autoFocus
              />
            </div>

            <div className="mb-4">
              <div className="text-sm text-gray-400 mb-2">
                Current Progression:
              </div>
              <div className="text-sm text-white font-mono bg-black/50 p-2 rounded">
                {progression.map((chord) => chord.romanNumeral).join(" - ")}
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowSaveSchemaModal(false);
                  setSchemaName("");
                }}
                className="px-4 py-2 text-sm font-medium text-white hover:text-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSchema}
                className="px-4 py-2 text-sm font-medium border-2 border-accent bg-accent/10 hover:bg-accent/20 text-white rounded transition-all"
              >
                Save Schema
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
