import { analyzeLine, compareRhythm, getRhythmMatchQuality } from '../../lib/lyrics/syllableCounter';

interface SyllableDisplayProps {
  lyrics: string;
  targetRhythm?: string; // Optional target line for comparison
  showBreakdown?: boolean;
}

export default function SyllableDisplay({ lyrics, targetRhythm, showBreakdown = false }: SyllableDisplayProps) {
  const lines = lyrics.split('\n').filter((line) => line.trim().length > 0);
  
  if (lines.length === 0) {
    return (
      <div className="text-sm text-gray-500 italic">
        Start typing to see syllable counts...
      </div>
    );
  }

  const analyses = lines.map((line) => analyzeLine(line));
  const avgSyllables = analyses.length > 0
    ? Math.round(analyses.reduce((sum, a) => sum + a.syllableCount, 0) / analyses.length)
    : 0;

  return (
    <div className="space-y-4">
      {/* Average syllables per line */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-gray-400">Average syllables per line:</span>
        <span className="font-semibold text-white">{avgSyllables}</span>
      </div>

      {/* Line-by-line analysis */}
      <div className="space-y-2">
        {lines.map((line, index) => {
          const analysis = analyses[index];
          let matchQuality: 'good' | 'close' | 'different' | null = null;
          let rhythmScore: number | null = null;

          if (targetRhythm && line.trim()) {
            rhythmScore = compareRhythm(line, targetRhythm);
            matchQuality = getRhythmMatchQuality(rhythmScore);
          }

          const colorClass = matchQuality === 'good'
            ? 'border-green-500/50 bg-green-500/10'
            : matchQuality === 'close'
            ? 'border-yellow-500/50 bg-yellow-500/10'
            : matchQuality === 'different'
            ? 'border-red-500/50 bg-red-500/10'
            : 'border-gray-800';

          return (
            <div
              key={index}
              className={`p-3 rounded border ${colorClass} transition-colors`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="text-white mb-1">{line || <span className="text-gray-500 italic">(empty line)</span>}</div>
                  {showBreakdown && analysis.words.length > 0 && (
                    <div className="text-xs text-gray-400 mt-2">
                      {analysis.words.map((w, i) => (
                        <span key={i} className="mr-2">
                          {w.word} ({w.syllables})
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {rhythmScore !== null && (
                    <div className="text-xs">
                      <span className={`font-semibold ${
                        matchQuality === 'good' ? 'text-green-400' :
                        matchQuality === 'close' ? 'text-yellow-400' :
                        'text-red-400'
                      }`}>
                        {rhythmScore}% match
                      </span>
                    </div>
                  )}
                  <div className="px-2 py-1 bg-dark-elevated rounded text-xs font-semibold text-gray-300">
                    {analysis.syllableCount} {analysis.syllableCount === 1 ? 'syllable' : 'syllables'}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

