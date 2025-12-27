import { useState } from 'react';
import { useSongStore } from '../../store/songStore';
import { Mic, Music, TrendingUp } from 'lucide-react';

export default function MelodyView() {
  const { currentSong } = useSongStore();
  const [isRecording, setIsRecording] = useState(false);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Melody</h1>
        <p className="text-gray-400">Step 3-4: Record and analyze your melody</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Topline Recorder */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Mic className="text-accent" size={24} />
            <h2 className="text-xl font-bold text-white">Topline Recorder</h2>
          </div>
          <p className="text-gray-400 mb-6">
            Record your melody by humming or singing. Don't worry about words - use gibberish!
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
              <h3 className="text-sm font-semibold text-white mb-2">Gibberish Mode</h3>
              <p className="text-xs text-gray-400">
                Don't worry about words! Use "la la la", "na na na", or any sounds that feel right.
                Focus on the melody, not the lyrics.
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
            Analyze your melody for contrast, pitch range, and rhythmic complexity
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
                    <div className="h-full bg-purple-500" style={{ width: '0%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-400">Average Pitch</span>
                    <span className="text-xs text-white">-</span>
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full">
                    <div className="h-full bg-blue-500" style={{ width: '0%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-400">Rhythmic Complexity</span>
                    <span className="text-xs text-white">-</span>
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full">
                    <div className="h-full bg-green-500" style={{ width: '0%' }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-dark-elevated rounded border border-gray-800">
              <h3 className="text-sm font-semibold text-white mb-2">Contrast Analysis</h3>
              <p className="text-xs text-gray-400">
                Compare verse and chorus melodies to ensure sufficient contrast
              </p>
            </div>
          </div>
        </div>

        {/* Virtual Keyboard */}
        <div className="card lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <Music className="text-yellow-400" size={24} />
            <h2 className="text-xl font-bold text-white">Virtual Keyboard</h2>
          </div>
          <p className="text-gray-400 mb-6">
            Click notes to build your melody manually
          </p>

          <div className="p-4 bg-dark-elevated rounded border border-gray-800">
            <div className="flex gap-1 justify-center">
              {['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'].map((note) => {
                const isSharp = note.includes('#');
                return (
                  <button
                    key={note}
                    className={`${
                      isSharp
                        ? 'bg-gray-900 text-white h-24 w-8 -mx-2 z-10'
                        : 'bg-white text-gray-900 h-32 w-12 border border-gray-300'
                    } rounded hover:bg-accent hover:text-white transition-colors`}
                  >
                    {note}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-gray-500 text-center mt-4">
              Virtual keyboard coming soon - will integrate with Tone.js for playback
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

