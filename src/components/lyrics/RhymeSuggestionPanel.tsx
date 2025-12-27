import { useState, useEffect } from 'react';
import { getAllRhymeSuggestions, DatamuseWord } from '../../lib/lyrics/datamuseApi';
import { Loader2, X, Sparkles } from 'lucide-react';

interface RhymeSuggestionPanelProps {
  word: string;
  onSelect: (word: string) => void;
  onClose: () => void;
}

export default function RhymeSuggestionPanel({ word, onSelect, onClose }: RhymeSuggestionPanelProps) {
  const [suggestions, setSuggestions] = useState<{
    perfect: DatamuseWord[];
    near: DatamuseWord[];
    assonance: DatamuseWord[];
    consonance: DatamuseWord[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'perfect' | 'near' | 'assonance' | 'consonance'>('perfect');

  useEffect(() => {
    if (!word) return;

    setLoading(true);
    getAllRhymeSuggestions(word, 15)
      .then((data) => {
        setSuggestions(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error loading rhyme suggestions:', error);
        setLoading(false);
      });
  }, [word]);

  const getActiveSuggestions = () => {
    if (!suggestions) return [];
    return suggestions[activeTab] || [];
  };

  const tabs = [
    { id: 'perfect' as const, label: 'Perfect', count: suggestions?.perfect.length || 0 },
    { id: 'near' as const, label: 'Near', count: suggestions?.near.length || 0 },
    { id: 'assonance' as const, label: 'Assonance', count: suggestions?.assonance.length || 0 },
    { id: 'consonance' as const, label: 'Consonance', count: suggestions?.consonance.length || 0 },
  ];

  return (
    <div className="card border-2 border-accent">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="text-accent" size={20} />
          <h3 className="text-lg font-semibold text-white">
            Rhymes for "<span className="text-accent">{word}</span>"
          </h3>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 border-b border-gray-800">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
              activeTab === tab.id
                ? 'border-accent text-white'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className="ml-2 text-xs text-gray-500">({tab.count})</span>
            )}
          </button>
        ))}
      </div>

      {/* Suggestions */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-accent" size={32} />
          <span className="ml-3 text-gray-400">Loading rhymes...</span>
        </div>
      ) : getActiveSuggestions().length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <p>No {activeTab} rhymes found for "{word}"</p>
          <p className="text-sm text-gray-500 mt-2">Try a different word or check spelling</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-64 overflow-y-auto">
          {getActiveSuggestions().map((suggestion, index) => (
            <button
              key={index}
              onClick={() => onSelect(suggestion.word)}
              className="p-2 bg-dark-elevated hover:bg-dark-surface rounded border border-gray-800 hover:border-accent transition-all text-left group"
            >
              <div className="font-semibold text-white group-hover:text-accent transition-colors">
                {suggestion.word}
              </div>
              {suggestion.score && (
                <div className="text-xs text-gray-500 mt-1">
                  Score: {Math.round(suggestion.score)}
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Info */}
      <div className="mt-4 pt-4 border-t border-gray-800 text-xs text-gray-500">
        <p>💡 Click a word to replace "{word}" in your lyrics</p>
        <p className="mt-1">Powered by Datamuse API</p>
      </div>
    </div>
  );
}

