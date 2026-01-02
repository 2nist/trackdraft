import { useState } from "react";
import { useSongStore } from "../../store/songStore";
import { Mic, TrendingUp } from "lucide-react";

export default function MelodyView() {
  const { currentSong } = useSongStore();
  const [isRecording, setIsRecording] = useState(false);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Melody</h1>
        <p className="text-gray-400">
          Step 3-4: Record and analyze your melody
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Topline Recorder */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Mic className="text-accent" size={24} />
            <h2 className="text-xl font-bold text-white">Topline Recorder</h2>
          </div>
          <p className="text-gray-400 mb-6">
            Record your melody by humming or singing. Don't worry about words -
            use gibberish!
          </p>

          <div className="space-y-4">
            <div className="text-center py-12 bg-dark-elevated rounded border border-gray-800">
              {isRecording ? (
                <div className="space-y-4">
                  <div className="w-16 h-16 mx-auto bg-red-500 rounded-full animate-pulse flex items-center justify-center">
                    <Mic className="text-white" size={32} />
                  </div>
                  <p className="text-white font-semibold">Recording...</p>
                  <button
                    onClick={() => setIsRecording(false)}
                    className="btn-secondary"
                  >
                    Stop Recording
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Mic className="mx-auto text-gray-600" size={48} />
                  <p className="text-gray-400">Ready to record</p>
                  <button
                    onClick={() => setIsRecording(true)}
                    className="btn-primary flex items-center gap-2 mx-auto"
                  >
                    <Mic size={18} />
                    Start Recording
                  </button>
                </div>
              )}
            </div>

            <div className="p-4 bg-dark-elevated rounded border border-gray-800">
              <h3 className="text-sm font-semibold text-white mb-2">
                Gibberish Mode
              </h3>
              <p className="text-xs text-gray-400">
                Don't worry about words! Use "la la la", "na na na", or any
                sounds that feel right. Focus on the melody, not the lyrics.
              </p>
            </div>
          </div>
        </div>

        {/* Melody Analysis */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="text-purple-400" size={24} />
            <h2 className="text-xl font-bold text-white">Melody Analysis</h2>
          </div>
          <p className="text-gray-400 mb-6">
            Analyze your melody for contrast, pitch range, and rhythmic
            complexity
          </p>

          <div className="space-y-4">
            <div className="p-4 bg-dark-elevated rounded border border-gray-800">
              <p className="text-sm text-gray-400 mb-4">
                Record a melody to see analysis
              </p>

              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-400">Pitch Range</span>
                    <span className="text-xs text-white">-</span>
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full">
                    <div
                      className="h-full bg-purple-500"
                      style={{ width: "0%" }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-400">Average Pitch</span>
                    <span className="text-xs text-white">-</span>
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full">
                    <div className="h-full bg-black" style={{ width: "0%" }} />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-400">
                      Rhythmic Complexity
                    </span>
                    <span className="text-xs text-white">-</span>
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full">
                    <div
                      className="h-full bg-green-500"
                      style={{ width: "0%" }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-dark-elevated rounded border border-gray-800">
              <h3 className="text-sm font-semibold text-white mb-2">
                Contrast Analysis
              </h3>
              <p className="text-xs text-gray-400">
                Compare verse and chorus melodies to ensure sufficient contrast
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
