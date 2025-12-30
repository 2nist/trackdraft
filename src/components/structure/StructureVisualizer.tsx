import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "react-beautiful-dnd";
import { useSongStore } from "../../store/songStore";
import { useProgressionStore } from "../../store/progressionStore";
import { Chord } from "../../types/music";
import {
  GripVertical,
  Edit2,
  Trash2,
  Music,
  Copy,
  X,
  Check,
  Play,
} from "lucide-react";
import { reaperBridge } from "../../lib/reaper-bridge";
import { useReaperConnection } from "../../hooks/useReaperConnection";
import { useToastStore } from "../../store/toastStore";
import { useState, useEffect } from "react";
import { TimelineState } from "../../types/bridge-protocol";
import ConflictDialog from "../ConflictDialog/ConflictDialog";
import { Download } from "lucide-react";

interface StructureVisualizerProps {
  onSectionClick?: (sectionId: string) => void;
}

export default function StructureVisualizer({
  onSectionClick,
}: StructureVisualizerProps) {
  const { currentSong, reorderSections, deleteSection, updateSection, updateSong } =
    useSongStore();
  const { connected } = useReaperConnection();
  const { showSuccess, showError, showInfo } = useToastStore();
  const [building, setBuilding] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [reaperState, setReaperState] = useState<TimelineState | null>(null);
  const [showConflict, setShowConflict] = useState(false);
  const sections = currentSong?.sections || [];

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(sections);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    reorderSections(items);
  };

  const handleDelete = (sectionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Delete this section?")) {
      deleteSection(sectionId);
    }
  };

  const getSectionColor = (type: string) => {
    switch (type) {
      case "verse":
        return "bg-black/20 border-black/50 text-white";
      case "chorus":
        return "bg-yellow-500/20 border-yellow-500/50 text-yellow-300";
      case "bridge":
        return "bg-purple-500/20 border-purple-500/50 text-purple-300";
      case "intro":
        return "bg-gray-500/20 border-gray-500/50 text-gray-300";
      case "outro":
        return "bg-gray-500/20 border-gray-500/50 text-gray-300";
      default:
        return "bg-gray-500/20 border-gray-500/50 text-gray-300";
    }
  };

  const calculateTotalBars = () => {
    return sections.reduce((sum, section) => sum + (section.duration || 8), 0);
  };

  if (sections.length === 0) {
    return (
      <div className="text-center py-12">
        <Music className="mx-auto text-gray-600 mb-4" size={48} />
        <p className="text-gray-400 mb-4">No sections yet</p>
        <p className="text-sm text-gray-500">
          Apply a MAP template or add sections manually to get started
        </p>
      </div>
    );
  }

  const handleAssignProgressionToSection = (
    sectionId: string,
    progression?: Chord[]
  ) => {
    const progressionToAssign =
      progression || currentSong?.progression || [];
    if (progressionToAssign.length === 0) return;
    updateSection(sectionId, { chords: [...progressionToAssign] });
  };

  const handleClearSectionProgression = (
    sectionId: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    updateSection(sectionId, { chords: undefined });
  };

  const handleAssignProgressionToAll = (progression?: Chord[]) => {
    const progressionToAssign = progression || currentSong?.progression || [];
    if (progressionToAssign.length === 0) return;
    sections.forEach((section) => {
      updateSection(section.id, { chords: [...progressionToAssign] });
    });
    showSuccess(`Progression assigned to all sections`);
  };

  const formatChordName = (chord: Chord): string => {
    return (
      chord.name
        ?.replace(" Major", "")
        .replace(" minor", "m")
        .replace(" diminished", "°")
        .replace(" augmented", "+") || chord.romanNumeral
    );
  };

  // Poll Reaper for changes
  useEffect(() => {
    if (!connected) return;

    reaperBridge.startTimelinePolling(2000, (state) => {
      setReaperState(state);

      // Check if there are meaningful changes
      const hasChanges = state.sections.some((s) => s.modifiedInReaper);

      if (hasChanges) {
        // Show notification
        showInfo("Timeline changed in Reaper. Click 'Pull from Reaper' to sync.");
      }
    });

    return () => {
      reaperBridge.stopTimelinePolling();
    };
  }, [connected, showInfo]);

  const handlePullFromReaper = async (state?: TimelineState) => {
    if (!connected || !currentSong) return;

    setSyncing(true);

    try {
      let reaperStateToUse: TimelineState | undefined = state;
      if (!reaperStateToUse) {
        const result = await reaperBridge.getTimelineState();
        reaperStateToUse = result?.state;
      }

      if (reaperStateToUse) {
        // Convert Reaper state to TrackDraft sections
        // Note: This is a simplified conversion - you may need to adjust based on your needs
        const newSections = reaperStateToUse.sections.map((s, index) => {
          // Try to find existing section by ID, or create new structure
          const existingSection = sections.find((sec) => sec.id === s.id);
          
          return {
            id: s.id,
            type: s.name.toLowerCase().replace(/\s+/g, '-') as "intro" | "verse" | "chorus" | "bridge" | "outro",
            duration: s.bars,
            // Preserve existing chords and lyrics if section exists
            ...(existingSection ? {
              chords: existingSection.chords,
              lyrics: existingSection.lyrics,
              narrativePurpose: existingSection.narrativePurpose,
            } : {}),
          };
        });

        // Update song with new sections
        updateSong({ sections: newSections });
        
        // Update tempo if needed (from first section)
        if (reaperStateToUse.sections.length > 0) {
          updateSong({ tempo: reaperStateToUse.sections[0].tempo });
        }

        showSuccess("✅ Pulled from Reaper");
        setReaperState(null); // Clear state after pulling
      }
    } catch (error) {
      console.error("Failed to pull from Reaper:", error);
      showError(`❌ Failed to pull: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setSyncing(false);
    }
  };

  const syncToReaper = async (resolution: 'reaper-wins' | 'trackdraft-wins') => {
    if (!currentSong) return;

    setSyncing(true);

    try {
      const result = await reaperBridge.syncToReaper(
        sections,
        currentSong.tempo,
        currentSong.key,
        resolution
      );

      if (result.success) {
        showSuccess("✅ Synced to Reaper");
        setShowConflict(false);
      } else {
        showError(`❌ Sync failed: ${result.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Failed to sync to Reaper:", error);
      showError(`❌ Sync failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setSyncing(false);
    }
  };

  const handleConflictResolve = (resolution: 'reaper' | 'trackdraft' | 'merge') => {
    if (resolution === 'reaper') {
      handlePullFromReaper(reaperState || undefined);
    } else if (resolution === 'trackdraft') {
      syncToReaper('trackdraft-wins');
    } else {
      // Merge is not implemented yet
      showInfo("Merge functionality coming soon!");
    }
    setShowConflict(false);
  };

  const handleBuildInReaper = async () => {
    if (!connected) {
      showError("Please connect to Reaper first. Make sure Reaper is running and the bridge script is loaded.");
      return;
    }

    if (!currentSong) {
      showError("No song loaded");
      return;
    }

    if (sections.length === 0) {
      showError("No sections to build. Add sections first.");
      return;
    }

    // Check for conflicts first
    const hasConflicts = await reaperBridge.hasConflicts();

    if (hasConflicts && reaperState) {
      // Show conflict dialog
      setShowConflict(true);
      return;
    }

    // No conflicts, proceed with sync
    await syncToReaper('trackdraft-wins');
  };

  return (
    <div className="space-y-4">
      {/* Named Progressions Display */}
      {namedProgressions.length > 0 && (
        <div className="card">
          <div className="mb-3">
            <h3 className="text-lg font-semibold text-white mb-1">
              Saved Progressions
            </h3>
            <p className="text-sm text-gray-400">
              Labeled progressions from Harmony view - Assign to sections below
            </p>
          </div>
          <div className="space-y-3">
            {namedProgressions.map((namedProg) => (
              <div
                key={namedProg.id}
                className="p-3 bg-gray-900 rounded border border-gray-800"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="text-white font-semibold text-sm mb-1">
                      {namedProg.name}
                    </h4>
                    <div className="flex items-center gap-2 flex-wrap">
                      {namedProg.progression.map((chord, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="px-2 py-1 bg-black rounded border-none text-white text-xs font-medium">
                            {formatChordName(chord)}
                          </div>
                          {index < namedProg.progression.length - 1 && (
                            <span className="text-white text-xs">→</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={handleAssignProgressionToAll}
                    className="ml-3 flex items-center gap-1.5 px-2 py-1 bg-blue-600 hover:bg-blue-700 border-none rounded text-white text-xs font-medium transition-colors"
                    title={`Assign "${namedProg.name}" to all sections`}
                  >
                    <Copy size={12} />
                    All
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Progression Display */}
      {currentSong?.progression && currentSong.progression.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">
                Main Chord Progression
              </h3>
              <p className="text-sm text-gray-400">
                Current progression in Harmony view - Assign to sections below
              </p>
            </div>
            <button
              onClick={handleAssignProgressionToAll}
              className="flex items-center gap-2 px-3 py-1.5 bg-black hover:bg-black border-none rounded text-white text-sm font-medium transition-colors"
              title="Assign to all sections"
            >
              <Copy size={16} />
              Assign to All
            </button>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {currentSong.progression.map((chord, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="px-3 py-1.5 bg-black rounded border-none text-white text-sm font-medium">
                  {formatChordName(chord)}
                </div>
                {index < currentSong.progression!.length - 1 && (
                  <span className="text-white">→</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Timeline Overview */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Timeline</h3>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-400">
              Total:{" "}
              <span className="text-white font-semibold">
                {calculateTotalBars()} bars
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleBuildInReaper}
                disabled={!connected || syncing || sections.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-black hover:bg-gray-900 border border-gray-700 hover:border-white rounded text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title={!connected ? "Connect to Reaper first" : "Sync to Reaper"}
              >
                {syncing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <Play size={16} />
                    Sync to Reaper
                  </>
                )}
              </button>
              
              <button
                onClick={() => handlePullFromReaper()}
                disabled={!connected || syncing}
                className="flex items-center gap-2 px-4 py-2 bg-black hover:bg-gray-900 border border-gray-700 hover:border-white rounded text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Pull timeline from Reaper"
              >
                <Download size={16} />
                Pull from Reaper
              </button>

              {reaperState && reaperState.sections.some((s) => s.modifiedInReaper) && (
                <span className="text-xs text-yellow-400 px-2 py-1 bg-yellow-500/10 border border-yellow-500/30 rounded">
                  ⚠️ Changes in Reaper
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-1 h-8">
          {sections.map((section, index) => {
            const width =
              ((section.duration || 8) / calculateTotalBars()) * 100;
            return (
              <div
                key={section.id}
                className={`${getSectionColor(
                  section.type
                )} rounded flex items-center justify-center text-xs font-semibold`}
                style={{ width: `${width}%` }}
                title={`${section.type} - ${section.duration || 8} bars`}
              >
                {section.type.charAt(0).toUpperCase()}
              </div>
            );
          })}
        </div>
      </div>

      {/* Draggable Sections */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="sections">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-3"
            >
              {sections.map((section, index) => (
                <Draggable
                  key={section.id}
                  draggableId={section.id}
                  index={index}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`card transition-all ${
                        snapshot.isDragging
                          ? "shadow-2xl scale-105 border-accent"
                          : "hover:border-gray-700"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        {/* Drag Handle */}
                        <div
                          {...provided.dragHandleProps}
                          className="text-gray-500 hover:text-gray-300 cursor-grab active:cursor-grabbing"
                        >
                          <GripVertical size={20} />
                        </div>

                        {/* Section Info */}
                        <div
                          className="flex-1 cursor-pointer"
                          onClick={() => onSectionClick?.(section.id)}
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <span
                              className={`text-xs font-semibold px-2 py-1 rounded ${getSectionColor(
                                section.type
                              )}`}
                            >
                              {section.type.toUpperCase()}
                            </span>
                            <span className="text-white font-semibold">
                              {section.type.charAt(0).toUpperCase() +
                                section.type.slice(1)}{" "}
                              {sections
                                .filter((s) => s.type === section.type)
                                .indexOf(section) + 1}
                            </span>
                            {section.duration && (
                              <span className="text-sm text-gray-400">
                                {section.duration} bars
                              </span>
                            )}
                          </div>

                          {section.narrativePurpose && (
                            <p className="text-sm text-gray-400 mb-2">
                              {section.narrativePurpose}
                            </p>
                          )}

                          {/* Section Progression Display */}
                          <div className="mt-2 mb-2">
                            {section.chords && section.chords.length > 0 ? (
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 flex-wrap">
                                  {section.chords.map((chord, index) => (
                                    <div
                                      key={index}
                                      className="flex items-center gap-2"
                                    >
                                      <div className="px-2 py-1 bg-black rounded border-none text-white text-xs font-medium">
                                        {formatChordName(chord)}
                                      </div>
                                      {index < section.chords!.length - 1 && (
                                        <span className="text-white text-xs">
                                          →
                                        </span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                                <div className="flex items-center gap-2">
                                  {currentSong?.progression &&
                                    currentSong.progression.length > 0 && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleAssignProgressionToSection(
                                            section.id
                                          );
                                        }}
                                        className="flex items-center gap-1.5 px-2 py-1 bg-black hover:bg-black border-none rounded text-white text-xs font-medium transition-colors"
                                        title="Replace with main progression"
                                      >
                                        <Copy size={12} />
                                        Replace
                                      </button>
                                    )}
                                  <button
                                    onClick={(e) =>
                                      handleClearSectionProgression(
                                        section.id,
                                        e
                                      )
                                    }
                                    className="flex items-center gap-1.5 px-2 py-1 bg-black hover:bg-black border-none rounded text-white text-xs font-medium transition-colors"
                                    title="Clear progression"
                                  >
                                    <X size={12} />
                                    Clear
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 flex-wrap">
                                {/* Named Progressions Dropdown */}
                                {namedProgressions.length > 0 && (
                                  <select
                                    onChange={(e) => {
                                      e.stopPropagation();
                                      const selectedId = e.target.value;
                                      if (selectedId) {
                                        const selectedProg = namedProgressions.find(
                                          (p) => p.id === selectedId
                                        );
                                        if (selectedProg) {
                                          handleAssignProgressionToSection(
                                            section.id,
                                            selectedProg.progression
                                          );
                                          showSuccess(
                                            `"${selectedProg.name}" assigned to section`
                                          );
                                        }
                                      }
                                      e.target.value = ""; // Reset selection
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                    className="px-3 py-1.5 bg-black hover:bg-black border border-gray-700 hover:border-white rounded text-white text-xs font-semibold transition-colors cursor-pointer"
                                    title="Assign a saved progression"
                                  >
                                    <option value="">Assign Progression...</option>
                                    {namedProgressions.map((prog) => (
                                      <option key={prog.id} value={prog.id}>
                                        {prog.name}
                                      </option>
                                    ))}
                                  </select>
                                )}
                                {currentSong?.progression &&
                                  currentSong.progression.length > 0 && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleAssignProgressionToSection(section.id);
                                      }}
                                      className="flex items-center gap-1.5 px-3 py-1.5 bg-black hover:bg-black border border-gray-700 hover:border-white rounded text-white text-xs font-semibold transition-colors"
                                    >
                                      <Copy size={14} />
                                      Assign Main
                                    </button>
                                  )}
                                {namedProgressions.length === 0 &&
                                  (!currentSong?.progression ||
                                    currentSong.progression.length === 0) && (
                                  <div className="text-xs text-gray-500">
                                    <span>
                                      {section.lyrics
                                        ? `${
                                            section.lyrics
                                              .split("\n")
                                              .filter((l) => l.trim()).length
                                          } lines`
                                        : "No lyrics"}
                                    </span>
                                    <span className="ml-2">
                                      • No progression available
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          {section.chords && section.chords.length > 0 && (
                            <div className="px-2 py-1 bg-green-500/20 border border-green-500/50 rounded">
                              <Check size={14} className="text-green-400" />
                            </div>
                          )}
                          <button
                            onClick={() => onSectionClick?.(section.id)}
                            className="p-2 text-gray-400 hover:text-white hover:bg-dark-elevated rounded transition-colors"
                            title="Edit section"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={(e) => handleDelete(section.id, e)}
                            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
                            title="Delete section"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Conflict Dialog */}
      {showConflict && reaperState && (
        <ConflictDialog
          reaperState={reaperState}
          trackdraftSections={sections}
          onResolve={handleConflictResolve}
          onCancel={() => setShowConflict(false)}
        />
      )}
    </div>
  );
}
