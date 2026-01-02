import { useState } from 'react';
import { analyzeRhymeScheme, RhymeGroup } from '../../lib/lyrics/rhymeDetector';
import RhymeSuggestionPanel from './RhymeSuggestionPanel';
import { Palette, Info, AlertCircle } from 'lucide-react';

interface RhymeVisualizerProps {
  lyrics: string;
  onWordClick?: (word: string, lineIndex: number, wordIndex: number) => void;
  onWordReplace?: (oldWord: string, newWord: string, lineIndex: number, wordIndex: number) => void;
}

export default function RhymeVisualizer({ lyrics, onWordClick, onWordReplace }: RhymeVisualizerProps) {
  const [showDetails, setShowDetails] = useState(true);
  const [selectedWord, setSelectedWord] = useState<{
    word: string;
    lineIndex: number;
    wordIndex: number;
  } | null>(null);
  
  if (!lyrics || lyrics.trim().length === 0) {
    return (
      <div className="card text-center py-8">
        <Palette className="mx-auto text-gray-600 mb-2" size={32} />
        <p className="text-gray-400 text-sm">Start writing lyrics to see rhyme analysis</p>
      </div>
    );
  }

  const analysis = analyzeRhymeScheme(lyrics);
  const lines = lyrics.split('\n').filter((line) => line.trim().length > 0);

  // Create a map of word positions to rhyme groups
  const wordToGroup = new Map<string, RhymeGroup>();
  analysis.groups.forEach((group) => {
    group.words.forEach((w) => {
      wordToGroup.set(`${w.lineIndex}-${w.wordIndex}`, group);
    });
  });

  // Check if rhyme distribution is balanced
  const rhymeCounts = Object.values(analysis.rhymeDistribution);
  const maxCount = Math.max(...rhymeCounts, 0);
  const isBalanced = maxCount <= 4; // More than 4 uses of same rhyme is too much

  return (
    <div className="space-y-4">
      {/* Rhyme Scheme Notation */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Palette className="text-purple-400" size={20} />
            <h3 className="text-lg font-semibold text-white">Rhyme Scheme</h3>
          </div>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-sm text-gray-400 hover:text-white"
          >
            {showDetails ? 'Hide Details' : 'Show Details'}
          </button>
        </div>

        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm text-gray-400">Pattern:</span>
            <span className="text-2xl font-bold text-white font-mono">
              {analysis.scheme || 'No rhymes detected'}
            </span>
          </div>
          
          {analysis.scheme && (
            <div className="text-xs text-gray-500 mt-2">
              {analysis.scheme.length} line{analysis.scheme.length !== 1 ? 's' : ''} analyzed
            </div>
          )}
        </div>

        {/* Rhyme Distribution */}
        {showDetails && Object.keys(analysis.rhymeDistribution).length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-800">
            <h4 className="text-sm font-semibold text-white mb-2">Rhyme Distribution</h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(analysis.rhymeDistribution).map(([letter, count]) => {
                const group = analysis.groups.find((g) => 
                  g.words.some((w) => {
                    const lineWords = lines[w.lineIndex]?.split(/\s+/) || [];
                    return lineWords[lineWords.length - 1]?.replace(/[.,!?;:'"()]/g, '') === w.word;
                  })
                );
                
                return (
                  <div
                    key={letter}
                    className="flex items-center gap-2 px-3 py-1 rounded border"
                    style={{
                      backgroundColor: group?.color + '20' || '#gray',
                      borderColor: group?.color || '#gray',
                    }}
                  >
                    <span className="font-bold text-white">{letter}</span>
                    <span className="text-xs text-gray-400">{count}x</span>
                  </div>
                );
              })}
            </div>
            
            {!isBalanced && (
              <div className="mt-3 flex items-center gap-2 text-yellow-400 text-sm">
                <AlertCircle size={16} />
                <span>One rhyme is used too frequently. Consider more variety.</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Color-Coded Lyrics */}
      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Info size={18} />
          Rhyming Words
        </h3>
        
        <div className="space-y-2">
          {lines.map((line, lineIndex) => {
            const words = line.trim().split(/\s+/);
            const lastWordIndex = words.length - 1;
            
            return (
              <div key={lineIndex} className="flex items-start gap-2">
                <span className="text-xs text-gray-500 font-mono w-8 flex-shrink-0 mt-1">
                  {analysis.scheme[lineIndex] || '-'}
                </span>
                <div className="flex-1 flex flex-wrap gap-1">
                  {words.map((word, wordIndex) => {
                    const cleanWord = word.replace(/[.,!?;:'"()]/g, '');
                    const group = wordToGroup.get(`${lineIndex}-${wordIndex}`);
                    const isLastWord = wordIndex === lastWordIndex;
                    
                    return (
                      <span
                        key={wordIndex}
                        onClick={() => {
                          if (isLastWord || group) {
                            setSelectedWord({ word: cleanWord, lineIndex, wordIndex });
                            onWordClick?.(cleanWord, lineIndex, wordIndex);
                          }
                        }}
                        className={`${
                          group || isLastWord
                            ? 'font-semibold cursor-pointer hover:underline'
                            : ''
                        }`}
                        style={{
                          color: group ? group.color : undefined,
                          backgroundColor: group ? group.color + '20' : undefined,
                          padding: group || isLastWord ? '2px 4px' : undefined,
                          borderRadius: group || isLastWord ? '4px' : undefined,
                        }}
                        title={
                          group
                            ? `Rhymes with: ${group.words
                                .filter((w) => !(w.lineIndex === lineIndex && w.wordIndex === wordIndex))
                                .map((w) => w.word)
                                .join(', ')} (${group.rhymeType}) - Click for suggestions`
                            : isLastWord
                            ? 'Click for rhyme suggestions'
                            : undefined
                        }
                      >
                        {word}
                      </span>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        {analysis.groups.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-800">
            <h4 className="text-sm font-semibold text-white mb-2">Rhyme Types</h4>
            <div className="flex flex-wrap gap-2 text-xs">
              {Array.from(new Set(analysis.groups.map((g) => g.rhymeType))).map((type) => {
                const group = analysis.groups.find((g) => g.rhymeType === type);
                return (
                  <div
                    key={type}
                    className="flex items-center gap-2 px-2 py-1 rounded"
                    style={{
                      backgroundColor: group?.color + '20' || '#gray',
                    }}
                  >
                    <div
                      className="w-3 h-3 rounded"
                      style={{ backgroundColor: group?.color || '#gray' }}
                    />
                    <span className="text-gray-300 capitalize">{type} rhyme</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Rhyme Suggestion Panel */}
      {selectedWord && (
        <RhymeSuggestionPanel
          word={selectedWord.word}
          onSelect={(newWord) => {
            onWordReplace?.(selectedWord.word, newWord, selectedWord.lineIndex, selectedWord.wordIndex);
            setSelectedWord(null);
          }}
          onClose={() => setSelectedWord(null)}
        />
      )}
    </div>
  );
}

