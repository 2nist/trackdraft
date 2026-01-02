import { useState } from "react";
import { Chord, Key } from "../../types/music";
import { analyzeProgression } from "../../lib/harmony/emotionDetection";
import { ChevronDown, ChevronUp } from "lucide-react";

interface EnhancedProgressionCardProps {
  progression: Chord[];
  songKey: Key;
  className?: string;
}

const EMOTION_COLORS: Record<string, string> = {
  uplifting: "bg-yellow-500/20 border-yellow-500/50 text-yellow-300",
  melancholic: "bg-blue-500/20 border-blue-500/50 text-blue-300",
  tense: "bg-red-500/20 border-red-500/50 text-red-300",
  romantic: "bg-pink-500/20 border-pink-500/50 text-pink-300",
  hopeful: "bg-green-500/20 border-green-500/50 text-green-300",
  dark: "bg-purple-500/20 border-purple-500/50 text-purple-300",
  neutral: "bg-gray-500/20 border-gray-500/50 text-gray-300",
};

export function EnhancedProgressionCard({
  progression,
  songKey,
  className = "",
}: EnhancedProgressionCardProps) {
  const [showTheory, setShowTheory] = useState(false);

  if (progression.length === 0) {
    return null;
  }

  const analysis = analyzeProgression(progression, songKey);
  const emotionColor = EMOTION_COLORS[analysis.emotionalProfile.primary] || EMOTION_COLORS.neutral;

  return (
    <div className={`rounded-lg border ${className}`}>
      {/* Emotional header - always visible, compact */}
      <div className={`p-1.5 rounded-t-lg border-b ${emotionColor}`}>
        <div className="flex items-center justify-between gap-1.5">
          <div className="flex-1 min-w-0">
            <h3 className="text-xs font-bold text-white truncate">
              {analysis.vibe.label}
            </h3>
            <p className="text-[10px] text-white/80 truncate">
              {analysis.vibe.description}
            </p>
          </div>
          {/* Toggle theory section */}
          <button
            onClick={() => setShowTheory(!showTheory)}
            className="flex items-center gap-0.5 text-[10px] text-white/80 hover:text-white transition-colors flex-shrink-0"
          >
            {showTheory ? (
              <ChevronUp size={10} />
            ) : (
              <ChevronDown size={10} />
            )}
          </button>
        </div>
      </div>

      {/* Collapsible theory section - compact */}
      {showTheory && (
        <div className="p-1.5 bg-black space-y-1 text-[10px]">
          <div className="flex flex-wrap gap-x-3 gap-y-0.5">
            <div>
              <span className="text-gray-500">Notation:</span>
              <span className="ml-1 text-white font-mono">
                {analysis.romanNumerals}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Key:</span>
              <span className="ml-1 text-white">
                {songKey.root} {songKey.mode}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Degrees:</span>
              <span className="ml-1 text-white">
                {analysis.degrees.join(" - ")}
              </span>
            </div>
          </div>

          {analysis.vibe.famousExamples.length > 0 && (
            <div className="pt-1 border-t border-gray-700">
              <div className="space-y-0.5">
                {analysis.vibe.famousExamples.slice(0, 2).map((example, index) => (
                  <div key={index} className="text-white">
                    <span className="font-medium text-[10px]">"{example.song}"</span>
                    <span className="text-gray-500 text-[10px]"> — {example.artist}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-1 border-t border-gray-700">
            <p className="text-gray-500 mb-0.5 text-[10px]">When to use:</p>
            <p className="text-white leading-tight text-[10px]">{analysis.vibe.whenToUse}</p>
          </div>
        </div>
      )}
    </div>
  );
}

