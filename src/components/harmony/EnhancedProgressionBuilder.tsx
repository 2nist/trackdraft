import { useState, useEffect, Fragment } from "react";
import { useSongStore } from "../../store/songStore";
import { useSchemaStore } from "../../store/schemaStore";
import { chordSchemas } from "../../data/chordSchemas";
import { romanNumeralToChord } from "../../lib/harmony/keyUtils";
import {
  getAllSubstitutions,
  analyzeProgressionStrength,
  SubstitutionOption,
} from "../../lib/harmony/substitutions";
import { Chord } from "../../types/music";
import { Plus, ChevronDown, Save, X, Trash2, Play } from "lucide-react";
import CircularProgressionView from "./CircularProgressionView";
import ChordEditorToolbar from "./ChordEditorToolbar";
import { EnhancedProgressionCard } from "./EnhancedProgressionCard";
import { useToastStore } from "../../store/toastStore";
import { reaperBridge } from "../../lib/reaper-bridge";
import { useReaperConnection } from "../../hooks/useReaperConnection";
import { useProgressionStore } from "../../store/progressionStore";

export default function EnhancedProgressionBuilder() {
  const { currentSong, updateProgression, updateTempo, updateKey } =
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
  const [substitutions, setSubstitutions] = useState<{
    commonTone: SubstitutionOption[];
    functional: SubstitutionOption[];
    modalInterchange: SubstitutionOption[];
  } | null>(null);
  const [showAddChordMenu, setShowAddChordMenu] = useState(false);
  const [bars, setBars] = useState<number>(4);
  const [beatsPerBar, setBeatsPerBar] = useState<number>(4);
  const [showSchemasDropdown, setShowSchemasDropdown] = useState(false);
  const [showSaveSchemaModal, setShowSaveSchemaModal] = useState(false);
  const [schemaName, setSchemaName] = useState("");
  const [showLabelProgressionModal, setShowLabelProgressionModal] =
    useState(false);
  const [progressionName, setProgressionName] = useState("");

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
    setSubstitutions(null);
    saveProgression(chords);
  };

  const handleAddChord = (chord: Chord) => {
    const newChord: Chord = { ...chord, beats: 2 }; // Default 2 beats
    const newProgression = [...progression, newChord];

    setProgression(newProgression);
    setShowAddChordMenu(false);
    saveProgression(newProgression);
  };

  const handleRemoveChord = (index: number) => {
    const newProgression = progression.filter((_, i) => i !== index);
    setProgression(newProgression);
    setSelectedChordIndex(null);
    setSubstitutions(null);
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
    setSubstitutions(null);
    saveProgression(rotated);
  };

  const handleChordClick = (index: number) => {
    if (!currentSong) return;

    const chord = progression[index];
    const subs = getAllSubstitutions(chord, currentSong.key);

    setSelectedChordIndex(index);
    setSubstitutions(subs);
  };

  const handleSubstitute = (substitution: SubstitutionOption) => {
    if (selectedChordIndex === null) return;

    const newProgression = [...progression];
    const beats = newProgression[selectedChordIndex].beats || 2;
    newProgression[selectedChordIndex] = { ...substitution.chord, beats };
    setProgression(newProgression);
    setSubstitutions(getAllSubstitutions(substitution.chord, currentSong!.key));
    saveProgression(newProgression);
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
        showSuccess("✅ Chord track created in Reaper!");
      } else {
        showError(`❌ Error: ${result.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Failed to send to Reaper:", error);
      showError(
        `❌ Failed to send: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setSending(false);
    }
  };

  const progressionStrength =
    progression.length > 0 ? analyzeProgressionStrength(progression) : 0;

  if (!currentSong) {
    return (
      <div className="text-center py-12">
        <p className="text-white">No song selected</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Progression Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 h-[calc(100vh-12rem)]">
        {/* Left Sidebar - Progression Settings */}
        <div className="lg:col-span-2 flex flex-col">
          <div className="card space-y-2 flex-1 overflow-y-auto">
            <h3 className="text-sm font-semibold text-white mb-1.5">
              Progression Settings
            </h3>

            {/* Bars Input */}
            <div>
              <label className="block text-xs font-medium text-white mb-1.5">
                Bars
              </label>
              <input
                type="number"
                min="1"
                max="16"
                value={bars}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 1;
                  setBars(Math.max(1, Math.min(16, value)));
                }}
                className="w-full px-2 py-1.5 text-sm bg-black border-none rounded text-white focus:outline-none"
              />
            </div>

            {/* Beats Per Bar Input */}
            <div>
              <label className="block text-xs font-medium text-white mb-1.5">
                Beats Per Bar
              </label>
              <input
                type="number"
                min="1"
                max="8"
                value={beatsPerBar}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 1;
                  setBeatsPerBar(Math.max(1, Math.min(8, value)));
                }}
                className="w-full px-2 py-1.5 text-sm bg-black border-none rounded text-white focus:outline-none"
              />
            </div>

            {/* Tempo Input */}
            <div>
              <label className="block text-xs font-medium text-white mb-1.5">
                Tempo (BPM)
              </label>
              <input
                type="number"
                min="60"
                max="200"
                value={currentSong?.tempo || 120}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 120;
                  updateTempo(Math.max(60, Math.min(200, value)));
                }}
                className="w-full px-2 py-1.5 text-sm bg-black border-none rounded text-white focus:outline-none"
              />
            </div>

            {/* Total Beats Display */}
            <div className="pt-3">
              <div className="text-sm text-white">Total Beats</div>
              <div className="text-2xl font-bold text-white">{totalBeats}</div>
              <div className="text-xs text-white mt-1">
                {bars} bar{bars !== 1 ? "s" : ""} × {beatsPerBar}/4
              </div>
            </div>

            {/* Mode Selection */}
            <div className="pt-2">
              <label className="block text-xs font-medium text-white mb-1.5">
                Mode
              </label>
              <select
                value={currentSong?.key.mode || "major"}
                onChange={(e) => {
                  if (currentSong) {
                    updateKey({
                      root: currentSong.key.root,
                      mode: e.target.value as
                        | "major"
                        | "minor"
                        | "dorian"
                        | "phrygian"
                        | "lydian"
                        | "mixolydian"
                        | "locrian",
                    });
                  }
                }}
                className="w-full px-2 py-1.5 text-sm bg-black border-none rounded text-white focus:outline-none"
              >
                <option value="major">Major (Ionian)</option>
                <option value="dorian">Dorian</option>
                <option value="phrygian">Phrygian</option>
                <option value="lydian">Lydian</option>
                <option value="mixolydian">Mixolydian</option>
                <option value="minor">Minor (Aeolian)</option>
                <option value="locrian">Locrian</option>
              </select>
            </div>

            {/* Emotional Progression Analysis */}
            {progression.length > 0 && currentSong && (
              <div className="pt-2">
                <EnhancedProgressionCard
                  progression={progression}
                  songKey={currentSong.key}
                />
              </div>
            )}

            {/* Progression Strength */}
            {progression.length > 0 && (
              <div className="pt-2">
                <div className="text-xs text-white mb-1.5">
                  Progression Strength
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-black rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        progressionStrength >= 70
                          ? "bg-green-500"
                          : progressionStrength >= 50
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                      style={{ width: `${progressionStrength}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-white min-w-[2.5rem] text-right">
                    {progressionStrength}%
                  </span>
                </div>
              </div>
            )}

            {/* Label Progression Button */}
            {progression.length > 0 && (
              <div className="pt-2">
                <button
                  onClick={() => setShowLabelProgressionModal(true)}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 border-none rounded text-white text-xs font-medium transition-colors"
                >
                  <Save size={14} />
                  Label & Save Progression
                </button>
              </div>
            )}

            {/* Save as Schema Button */}
            {progression.length > 0 && (
              <div className="pt-2">
                <button
                  onClick={() => setShowSaveSchemaModal(true)}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-black hover:bg-black border-none rounded text-white text-xs font-medium transition-colors"
                >
                  <Save size={14} />
                  Save as Schema
                </button>
              </div>
            )}

            {/* Send to Reaper Button */}
            {progression.length > 0 && (
              <div className="pt-2">
                <button
                  onClick={handleSendToReaper}
                  disabled={!connected || sending}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-black hover:bg-gray-900 border border-gray-700 hover:border-white rounded text-white text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title={
                    !connected
                      ? "Connect to Reaper first"
                      : "Send chord track to Reaper"
                  }
                >
                  {sending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Play size={14} />
                      Send to Reaper
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Quick Start Schemas Dropdown */}
            <div className="pt-2">
              <button
                onClick={() => setShowSchemasDropdown(!showSchemasDropdown)}
                className="w-full flex items-center justify-between text-xs font-medium text-white hover:text-white transition-colors"
              >
                <span>Quick Start Schemas</span>
                <ChevronDown
                  size={14}
                  className={`transition-transform ${
                    showSchemasDropdown ? "rotate-180" : ""
                  }`}
                />
              </button>
              {showSchemasDropdown && (
                <div className="mt-2 space-y-1 max-h-64 overflow-y-auto">
                  {/* Built-in Schemas */}
                  {chordSchemas.slice(0, 12).map((schema) => {
                    return (
                      <button
                        key={schema.name}
                        onClick={() => {
                          handleSchemaSelect(schema.name);
                          setShowSchemasDropdown(false);
                        }}
                        className={`w-full text-left p-2 rounded border-none transition-all ${
                          selectedSchema === schema.name
                            ? "bg-accent/10"
                            : "bg-black hover:bg-black"
                        }`}
                      >
                        {/* Schema Name */}
                        <div className="font-semibold text-white text-xs mb-1">
                          {schema.name}
                        </div>

                        {/* Roman Numeral Progression */}
                        <div className="text-xs text-white">
                          {schema.progression.join(" - ")}
                        </div>
                      </button>
                    );
                  })}

                  {/* Custom Schemas */}
                  {customSchemas.length > 0 && (
                    <>
                      <div className="border-t border-gray-700 my-2"></div>
                      <div className="text-xs text-gray-400 px-2 py-1 font-semibold">
                        Custom Schemas
                      </div>
                      {customSchemas.map((schema) => {
                        return (
                          <div
                            key={schema.name}
                            className="flex items-center group"
                          >
                            <button
                              onClick={() => {
                                handleSchemaSelect(schema.name);
                                setShowSchemasDropdown(false);
                              }}
                              className={`flex-1 text-left p-2 rounded border-none transition-all ${
                                selectedSchema === schema.name
                                  ? "bg-accent/10"
                                  : "bg-black hover:bg-black"
                              }`}
                            >
                              {/* Schema Name */}
                              <div className="font-semibold text-white text-xs mb-1">
                                {schema.name}
                              </div>

                              {/* Roman Numeral Progression */}
                              <div className="text-xs text-white">
                                {schema.progression.join(" - ")}
                              </div>
                            </button>
                            <button
                              onClick={(e) =>
                                handleDeleteSchema(schema.name, e)
                              }
                              className="opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:text-red-300 transition-opacity"
                              title="Delete schema"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        );
                      })}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Visualization */}
        <div className="lg:col-span-7 flex flex-col h-[calc(100vh-12rem)]">
          <div
            className="card p-2 flex items-center justify-center"
            style={{ height: "100%" }}
          >
            <CircularProgressionView
              progression={progression}
              selectedIndex={selectedChordIndex}
              onChordClick={handleChordClick}
              onChordRemove={handleRemoveChord}
              onBeatsChange={handleBeatsChange}
              totalBeats={totalBeats}
              onProgressionReorder={(newProgression) => {
                setProgression(newProgression);
                saveProgression(newProgression);
              }}
              onAddChord={showAddChordMenu ? handleAddChord : undefined}
              isAddChordMode={showAddChordMenu}
            />
          </div>
        </div>

        {/* Right Sidebar - Chord Controls */}
        <div className="lg:col-span-3 flex flex-col h-[calc(100vh-12rem)]">
          <div className="rounded-xl bg-black h-full flex flex-col overflow-hidden p-0">
            {/* Key Selection and Add Chord - At the top */}
            <div className="flex-shrink-0 pb-1 px-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="text-xs font-semibold text-white mb-0.5">
                    Key Selection
                  </div>
                  <div className="text-sm font-bold text-white">
                    {currentSong?.key.root || "C"}{" "}
                    {currentSong?.key.mode || "major"}
                  </div>
                  <div className="text-xs text-white mt-0.5">
                    Change key in the circle
                  </div>
                </div>
                {progression.length > 0 && (
                  <button
                    onClick={() => setShowAddChordMenu(!showAddChordMenu)}
                    className={`flex items-center gap-1.5 px-2 py-1 rounded border-none transition-all text-xs font-semibold ${
                      showAddChordMenu
                        ? "bg-accent/10 text-white"
                        : "bg-[#1E293B] text-white hover:bg-[#1E293B]"
                    }`}
                  >
                    <Plus size={14} />
                    Add Chord
                  </button>
                )}
              </div>
            </div>

            {/* Compact Progression Display */}
            {progression.length > 0 && (
              <div className="flex-shrink-0 pt-1 pb-1 px-2">
                <div className="text-xs font-semibold text-white mb-0.5">
                  Progression
                </div>
                <div className="flex items-center justify-center gap-1.5 flex-nowrap overflow-x-auto text-xs">
                  {progression.map((chord, index) => (
                    <Fragment key={index}>
                      <div
                        onClick={() => handleChordClick(index)}
                        className={`px-2 py-1 rounded border-none transition-all cursor-pointer flex-shrink-0 ${
                          selectedChordIndex === index
                            ? "bg-accent/10 text-white font-semibold"
                            : "bg-black text-white hover:bg-black"
                        }`}
                      >
                        {chord.name
                          ?.replace(" Major", "")
                          .replace(" minor", "m")
                          .replace(" diminished", "°")
                          .replace(" augmented", "+") || chord.romanNumeral}
                      </div>
                      {index < progression.length - 1 && (
                        <div className="text-white flex-shrink-0">→</div>
                      )}
                    </Fragment>
                  ))}
                </div>
              </div>
            )}

            {/* Chord Editor Toolbar - Scrollable */}
            <div className="flex-1 overflow-y-auto px-2 pt-0.5">
              <ChordEditorToolbar
                chord={
                  selectedChordIndex !== null
                    ? progression[selectedChordIndex] || null
                    : null
                }
                substitutions={substitutions}
                onSubstitute={handleSubstitute}
                onRotate={handleRotate}
                canRotate={progression.length > 0}
                onBeatsChange={
                  selectedChordIndex !== null
                    ? (beats: number) =>
                        handleBeatsChange(selectedChordIndex, beats)
                    : undefined
                }
                onRemove={
                  selectedChordIndex !== null
                    ? () => handleRemoveChord(selectedChordIndex)
                    : undefined
                }
                onClose={() => {
                  setSelectedChordIndex(null);
                  setSubstitutions(null);
                }}
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
                className="px-4 py-2 text-sm font-medium bg-accent hover:bg-accent/80 text-white rounded transition-colors"
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
