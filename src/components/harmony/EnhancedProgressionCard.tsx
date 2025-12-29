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

const EMOTION_EMOJIS: Record<string, string> = {
  uplifting: "🎵",
  melancholic: "💙",
  tense: "⚡",
  romantic: "💕",
  hopeful: "✨",
  dark: "🌑",
  neutral: "🎶",
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
  const emotionEmoji = EMOTION_EMOJIS[analysis.emotionalProfile.primary] || "🎶";

  return (
    <div className={`rounded-lg border ${className}`}>
      {/* Emotional header - always visible */}
      <div className={`p-4 rounded-t-lg border-b ${emotionColor}`}>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">{emotionEmoji}</span>
          <h3 className="text-lg font-bold text-white">
            {analysis.vibe.label}
          </h3>
        </div>
        <p className="text-sm text-white/90 mb-3">
          {analysis.vibe.description}
        </p>

        {/* Toggle theory section */}
        <button
          onClick={() => setShowTheory(!showTheory)}
          className="flex items-center gap-1 text-xs text-white/80 hover:text-white transition-colors"
        >
          {showTheory ? (
            <>
              <ChevronUp size={14} />
              Hide Music Theory
            </>
          ) : (
            <>
              <ChevronDown size={14} />
              Show Music Theory
            </>
          )}
        </button>
      </div>

      {/* Collapsible theory section */}
      {showTheory && (
        <div className="p-4 bg-black space-y-3">
          <div className="space-y-2">
            <div>
              <span className="text-xs text-gray-400">Notation:</span>
              <span className="ml-2 text-sm text-white font-mono">
                {analysis.romanNumerals}
              </span>
            </div>
            <div>
              <span className="text-xs text-gray-400">Key:</span>
              <span className="ml-2 text-sm text-white">
                {songKey.root} {songKey.mode}
              </span>
            </div>
            <div>
              <span className="text-xs text-gray-400">Degrees:</span>
              <span className="ml-2 text-sm text-white">
                {analysis.degrees.join(" - ")}
              </span>
            </div>
          </div>

          {analysis.vibe.famousExamples.length > 0 && (
            <div className="pt-2 border-t border-gray-700">
              <h4 className="text-xs font-semibold text-gray-400 mb-2">
                Heard in:
              </h4>
              <div className="space-y-1">
                {analysis.vibe.famousExamples.map((example, index) => (
                  <div key={index} className="text-sm text-white">
                    <span className="font-medium">"{example.song}"</span>
                    <span className="text-gray-400"> — {example.artist}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-2 border-t border-gray-700">
            <p className="text-xs text-gray-400 mb-1">When to use:</p>
            <p className="text-sm text-white">{analysis.vibe.whenToUse}</p>
          </div>
        </div>
      )}
    </div>
  );
}

