import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "react-beautiful-dnd";
import { useSongStore } from "../../store/songStore";
import { Chord } from "../../types/music";
import {
  GripVertical,
  Edit2,
  Trash2,
  Music,
  Copy,
  X,
  Check,
} from "lucide-react";

interface StructureVisualizerProps {
  onSectionClick?: (sectionId: string) => void;
}

export default function StructureVisualizer({
  onSectionClick,
}: StructureVisualizerProps) {
  const { currentSong, reorderSections, deleteSection, updateSection } =
    useSongStore();
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

  const handleAssignProgressionToSection = (sectionId: string) => {
    if (!currentSong?.progression || currentSong.progression.length === 0)
      return;
    updateSection(sectionId, { chords: [...currentSong.progression] });
  };

  const handleClearSectionProgression = (
    sectionId: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    updateSection(sectionId, { chords: undefined });
  };

  const handleAssignProgressionToAll = () => {
    if (!currentSong?.progression || currentSong.progression.length === 0)
      return;
    sections.forEach((section) => {
      updateSection(section.id, { chords: [...currentSong.progression!] });
    });
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

  return (
    <div className="space-y-4">
      {/* Main Progression Display */}
      {currentSong?.progression && currentSong.progression.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">
                Main Chord Progression
              </h3>
              <p className="text-sm text-gray-400">
                Created in Harmony view - Assign to sections below
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
          <div className="text-sm text-gray-400">
            Total:{" "}
            <span className="text-white font-semibold">
              {calculateTotalBars()} bars
            </span>
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
                            ) : currentSong?.progression &&
                              currentSong.progression.length > 0 ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAssignProgressionToSection(section.id);
                                }}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-black hover:bg-black border border-gray-700 hover:border-white rounded text-white text-xs font-semibold transition-colors"
                              >
                                <Copy size={14} />
                                Assign Main Progression
                              </button>
                            ) : (
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
                                {!currentSong?.progression && (
                                  <span className="ml-2">
                                    • No progression available
                                  </span>
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
    </div>
  );
}
