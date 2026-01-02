import { useState } from 'react';
import { useSongStore } from '../../store/songStore';
import { songMaps, getSongMapById } from '../../data/songMaps';
import { SongMap } from '../../types/structure';
import { Check, Sparkles } from 'lucide-react';

export default function MapTemplateSelector() {
  const { currentSong, addSection, updateSong } = useSongStore();
  const [selectedMap, setSelectedMap] = useState<SongMap | null>(null);
  const [showDetails, setShowDetails] = useState<string | null>(null);

  const handleApplyTemplate = (map: SongMap) => {
    if (!currentSong) return;

    // Create sections from template
    const newSections = map.sections.map((sectionDef) => {
      return {
        id: crypto.randomUUID(),
        type: sectionDef.type,
        lyrics: '',
        duration: 8, // Default 8 bars
        narrativePurpose: sectionDef.purpose.primaryGoal,
      };
    });

    // Update song with new sections (this replaces existing sections)
    updateSong({ sections: newSections });

    setSelectedMap(map);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'intermediate':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'advanced':
        return 'bg-red-500/20 text-red-400 border-red-500/50';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="text-accent" size={20} />
        <h3 className="text-lg font-semibold text-white">MAP Method Templates</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {songMaps.map((map) => {
          const isSelected = selectedMap?.id === map.id;
          const isExpanded = showDetails === map.id;

          return (
            <div
              key={map.id}
              className={`card border-2 transition-all ${
                isSelected
                  ? 'border-accent bg-accent/5'
                  : 'border-gray-800 hover:border-gray-700'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-white mb-1">{map.name}</h4>
                  <p className="text-xs text-gray-400 mb-2">{map.structure}</p>
                  {map.description && (
                    <p className="text-sm text-gray-300 mb-2">{map.description}</p>
                  )}
                </div>
                {isSelected && (
                  <Check className="text-accent flex-shrink-0" size={20} />
                )}
              </div>

              <div className="flex items-center gap-2 mb-3">
                <span
                  className={`text-xs px-2 py-1 rounded border ${getDifficultyColor(map.difficulty)}`}
                >
                  {map.difficulty}
                </span>
                <div className="flex flex-wrap gap-1">
                  {map.genres.slice(0, 3).map((genre) => (
                    <span
                      key={genre}
                      className="text-xs px-2 py-1 bg-dark-elevated rounded text-gray-400"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mb-3">
                <p className="text-xs text-gray-400 mb-2">Narrative Logic:</p>
                <p className="text-sm text-gray-300">{map.narrativeLogic}</p>
              </div>

              {isExpanded && (
                <div className="mt-3 pt-3 border-t border-gray-800 space-y-2">
                  <p className="text-xs font-semibold text-gray-400 uppercase">Sections:</p>
                  <div className="space-y-1">
                    {map.sections.map((section, index) => (
                      <div
                        key={index}
                        className="text-xs text-gray-400 flex items-center gap-2"
                      >
                        <span className="font-semibold text-gray-300">{section.label}:</span>
                        <span>{section.purpose.primaryGoal}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => handleApplyTemplate(map)}
                  className="btn-primary flex-1 text-sm"
                >
                  Apply Template
                </button>
                <button
                  onClick={() => setShowDetails(isExpanded ? null : map.id)}
                  className="btn-secondary text-sm px-3"
                >
                  {isExpanded ? 'Less' : 'Details'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

