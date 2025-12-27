import { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { useSongStore } from '../../store/songStore';
import { SongSection } from '../../types/music';
import { Plus, GripVertical, Edit2, Trash2, Music } from 'lucide-react';

interface StructureVisualizerProps {
  onSectionClick?: (sectionId: string) => void;
}

export default function StructureVisualizer({ onSectionClick }: StructureVisualizerProps) {
  const { currentSong, reorderSections, deleteSection, updateSection } = useSongStore();
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
    if (confirm('Delete this section?')) {
      deleteSection(sectionId);
    }
  };

  const getSectionColor = (type: string) => {
    switch (type) {
      case 'verse':
        return 'bg-blue-500/20 border-blue-500/50 text-blue-300';
      case 'chorus':
        return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-300';
      case 'bridge':
        return 'bg-purple-500/20 border-purple-500/50 text-purple-300';
      case 'intro':
        return 'bg-gray-500/20 border-gray-500/50 text-gray-300';
      case 'outro':
        return 'bg-gray-500/20 border-gray-500/50 text-gray-300';
      default:
        return 'bg-gray-500/20 border-gray-500/50 text-gray-300';
    }
  };

  const getSectionIcon = (type: string) => {
    return <Music size={16} />;
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

  return (
    <div className="space-y-4">
      {/* Timeline Overview */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Timeline</h3>
          <div className="text-sm text-gray-400">
            Total: <span className="text-white font-semibold">{calculateTotalBars()} bars</span>
          </div>
        </div>
        <div className="flex gap-1 h-8">
          {sections.map((section, index) => {
            const width = ((section.duration || 8) / calculateTotalBars()) * 100;
            return (
              <div
                key={section.id}
                className={`${getSectionColor(section.type)} rounded flex items-center justify-center text-xs font-semibold`}
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
            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
              {sections.map((section, index) => (
                <Draggable key={section.id} draggableId={section.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`card transition-all ${
                        snapshot.isDragging
                          ? 'shadow-2xl scale-105 border-accent'
                          : 'hover:border-gray-700'
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
                              className={`text-xs font-semibold px-2 py-1 rounded ${getSectionColor(section.type)}`}
                            >
                              {section.type.toUpperCase()}
                            </span>
                            <span className="text-white font-semibold">
                              {section.type.charAt(0).toUpperCase() + section.type.slice(1)}{' '}
                              {sections.filter((s) => s.type === section.type).indexOf(section) + 1}
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

                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>
                              {section.lyrics
                                ? `${section.lyrics.split('\n').filter((l) => l.trim()).length} lines`
                                : 'No lyrics'}
                            </span>
                            <span>
                              {section.chords ? `${section.chords.length} chords` : 'No chords'}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
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

