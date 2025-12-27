import { useState } from 'react';
import { useSongStore } from '../../store/songStore';
import {
  getBridgeChordSuggestions,
  getBorrowedChords,
  getRhythmSuggestions,
  getMeterSuggestions,
  getPerspectivePrompts,
  calculateHarmonicTension,
} from '../../lib/harmony/bridgeStrategies';
import { Music, Lightbulb, Zap, TrendingUp, Play } from 'lucide-react';

export default function BridgeBuilder() {
  const { currentSong } = useSongStore();
  const [activeTab, setActiveTab] = useState<'musical' | 'perspective' | 'harmonic'>('musical');
  const [selectedChord, setSelectedChord] = useState<any>(null);

  if (!currentSong) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-400">Create a song first to build a bridge</p>
      </div>
    );
  }

  // Get current progression from sections (if any)
  const currentProgression = currentSong.sections
    .flatMap((s) => s.chords || [])
    .filter((c, i, arr) => arr.findIndex((c2) => c2.romanNumeral === c.romanNumeral) === i);

  const chordSuggestions = getBridgeChordSuggestions(currentSong.key, currentProgression);
  const borrowedChords = getBorrowedChords(currentSong.key);
  const rhythmSuggestions = getRhythmSuggestions();
  const meterSuggestions = getMeterSuggestions('4/4');
  const perspectivePrompts = getPerspectivePrompts();

  const tabs = [
    { id: 'musical' as const, label: 'Musical Contrast', icon: Music },
    { id: 'perspective' as const, label: 'Perspective Shift', icon: Lightbulb },
    { id: 'harmonic' as const, label: 'Harmonic Departure', icon: Zap },
  ];

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="text-yellow-400" size={24} />
          <h2 className="text-2xl font-bold text-white">Bridge Builder</h2>
        </div>
        <p className="text-gray-400">
          Create contrast and interest in your bridge using these three strategies
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-gray-800">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors border-b-2 ${
                activeTab === tab.id
                  ? 'border-accent text-white'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <Icon size={18} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Musical Contrast Tab */}
      {activeTab === 'musical' && (
        <div className="space-y-6">
          {/* Chord Suggestions */}
          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Music size={20} />
              Chord Change Suggestions
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              Avoid the Tonic chord - use IV or V for contrast
            </p>

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-white mb-2">Safe Options (In Key)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {chordSuggestions
                    .filter((s) => s.strength === 'safe')
                    .map((suggestion, index) => (
                      <div
                        key={index}
                        className="p-3 bg-dark-elevated rounded border border-gray-800 hover:border-green-500/50 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xl font-bold text-green-400">
                            {suggestion.chord.romanNumeral}
                          </span>
                          <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded">
                            Safe
                          </span>
                        </div>
                        <div className="text-sm text-white font-medium mb-1">
                          {suggestion.chord.name}
                        </div>
                        <div className="text-xs text-gray-400">{suggestion.reason}</div>
                      </div>
                    ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-white mb-2">Moderate Options</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {chordSuggestions
                    .filter((s) => s.strength === 'moderate')
                    .map((suggestion, index) => (
                      <div
                        key={index}
                        className="p-3 bg-dark-elevated rounded border border-gray-800 hover:border-yellow-500/50 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xl font-bold text-yellow-400">
                            {suggestion.chord.romanNumeral}
                          </span>
                          <span className="text-xs px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded">
                            Moderate
                          </span>
                        </div>
                        <div className="text-sm text-white font-medium mb-1">
                          {suggestion.chord.name}
                        </div>
                        <div className="text-xs text-gray-400">{suggestion.reason}</div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>

          {/* Non-Diatonic Chords */}
          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4">Borrowed Chords (Modal Interchange)</h3>
            <p className="text-sm text-gray-400 mb-4">
              Borrow chords from parallel major/minor for dramatic color
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {borrowedChords.map((suggestion, index) => (
                <div
                  key={index}
                  className={`p-3 bg-dark-elevated rounded border transition-colors ${
                    suggestion.strength === 'spicy'
                      ? 'border-red-500/50 hover:border-red-500'
                      : 'border-gray-800 hover:border-yellow-500/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-xl font-bold ${
                        suggestion.strength === 'spicy' ? 'text-red-400' : 'text-yellow-400'
                      }`}
                    >
                      {suggestion.chord.romanNumeral}
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        suggestion.strength === 'spicy'
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}
                    >
                      {suggestion.strength === 'spicy' ? 'Spicy' : 'Moderate'}
                    </span>
                  </div>
                  <div className="text-sm text-white font-medium mb-1">
                    {suggestion.chord.name}
                  </div>
                  <div className="text-xs text-gray-400">{suggestion.reason}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Rhythm Suggestions */}
          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4">Rhythm Change Ideas</h3>
            <div className="space-y-3">
              {rhythmSuggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="p-3 bg-dark-elevated rounded border border-gray-800"
                >
                  <div className="font-semibold text-white mb-1">{suggestion.type}</div>
                  <div className="text-sm text-gray-400 mb-2">{suggestion.description}</div>
                  <div className="text-xs text-gray-500 italic">Example: {suggestion.example}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Meter Suggestions */}
          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4">Meter Change Options</h3>
            <p className="text-sm text-gray-400 mb-4">
              Temporarily change time signature for 2 bars
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {meterSuggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="p-3 bg-dark-elevated rounded border border-gray-800 hover:border-accent transition-colors"
                >
                  <div className="text-2xl font-bold text-accent mb-2">{suggestion.meter}</div>
                  <div className="text-sm text-white mb-1">{suggestion.description}</div>
                  <div className="text-xs text-gray-400">{suggestion.bars} bars</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Perspective Shift Tab */}
      {activeTab === 'perspective' && (
        <div className="space-y-6">
          {perspectivePrompts.map((category, index) => (
            <div key={index} className="card">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Lightbulb className="text-yellow-400" size={20} />
                {category.category}
              </h3>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-gray-300 mb-2">Writing Prompts</h4>
                  <div className="space-y-2">
                    {category.prompts.map((prompt, pIndex) => (
                      <div
                        key={pIndex}
                        className="p-2 bg-dark-elevated rounded border border-gray-800 text-sm text-gray-300"
                      >
                        {prompt}
                      </div>
                    ))}
                  </div>
                </div>

                {category.examples.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-300 mb-2">Examples</h4>
                    <div className="space-y-1">
                      {category.examples.map((example, eIndex) => (
                        <div
                          key={eIndex}
                          className="text-sm text-gray-400 italic pl-4 border-l-2 border-accent/50"
                        >
                          {example}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Famous Bridge Examples */}
          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Play className="text-blue-400" size={20} />
              Famous Bridge Examples
            </h3>
            <div className="space-y-4">
              <div className="p-3 bg-dark-elevated rounded border border-gray-800">
                <div className="font-semibold text-white mb-1">"Bohemian Rhapsody" - Queen</div>
                <div className="text-sm text-gray-400 mb-2">
                  <strong>Technique:</strong> Complete style change (opera section)
                </div>
                <div className="text-xs text-gray-500">
                  The bridge completely shifts genre, creating maximum contrast before returning to the rock section.
                </div>
              </div>
              <div className="p-3 bg-dark-elevated rounded border border-gray-800">
                <div className="font-semibold text-white mb-1">"Let It Be" - The Beatles</div>
                <div className="text-sm text-gray-400 mb-2">
                  <strong>Technique:</strong> Perspective shift + key change
                </div>
                <div className="text-xs text-gray-500">
                  "And when the broken-hearted people..." - shifts to a new perspective with emotional intensity.
                </div>
              </div>
              <div className="p-3 bg-dark-elevated rounded border border-gray-800">
                <div className="font-semibold text-white mb-1">"Someone Like You" - Adele</div>
                <div className="text-sm text-gray-400 mb-2">
                  <strong>Technique:</strong> Harmonic departure + emotional peak
                </div>
                <div className="text-xs text-gray-500">
                  Uses borrowed chords (bIII, bVI) to create emotional intensity at the bridge.
                </div>
              </div>
              <div className="p-3 bg-dark-elevated rounded border border-gray-800">
                <div className="font-semibold text-white mb-1">"Stairway to Heaven" - Led Zeppelin</div>
                <div className="text-sm text-gray-400 mb-2">
                  <strong>Technique:</strong> Meter change + dynamic build
                </div>
                <div className="text-xs text-gray-500">
                  Shifts to 3/4 time and builds dynamically to the guitar solo climax.
                </div>
              </div>
            </div>
          </div>

          {/* OMG Moment Ideas */}
          <div className="card border-2 border-purple-500/50">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Zap className="text-purple-400" size={20} />
              "OMG Moment" Ideas
            </h3>
            <div className="space-y-3">
              <div className="p-3 bg-purple-500/10 rounded border border-purple-500/30">
                <div className="font-semibold text-white mb-1">Revelation</div>
                <div className="text-sm text-gray-300">
                  "I finally understand..." or "It all makes sense now..."
                </div>
              </div>
              <div className="p-3 bg-purple-500/10 rounded border border-purple-500/30">
                <div className="font-semibold text-white mb-1">Confession</div>
                <div className="text-sm text-gray-300">
                  "I've been hiding..." or "The truth is..."
                </div>
              </div>
              <div className="p-3 bg-purple-500/10 rounded border border-purple-500/30">
                <div className="font-semibold text-white mb-1">Question Everything</div>
                <div className="text-sm text-gray-300">
                  "What if I was wrong?" or "Maybe I've been looking at this all wrong..."
                </div>
              </div>
              <div className="p-3 bg-purple-500/10 rounded border border-purple-500/30">
                <div className="font-semibold text-white mb-1">Ultimatum</div>
                <div className="text-sm text-gray-300">
                  "This is it..." or "No more waiting..."
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Harmonic Departure Tab */}
      {activeTab === 'harmonic' && (
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="text-red-400" size={20} />
              Harmonic Tension Zone
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              Avoid the Tonic zone - stay in the tension zone for maximum impact
            </p>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Tonic Zone (Avoid)</span>
                  <span className="text-xs text-gray-500">Low Tension</span>
                </div>
                <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500" style={{ width: '20%' }} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Tension Zone (Use)</span>
                  <span className="text-xs text-gray-500">High Tension</span>
                </div>
                <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-yellow-500 to-red-500" style={{ width: '80%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Borrowed Chord Palette */}
          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4">Borrowed Chord Palette</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {borrowedChords.map((suggestion, index) => {
                const tension = calculateHarmonicTension(suggestion.chord, currentSong.key);
                return (
                  <div
                    key={index}
                    className="p-3 bg-dark-elevated rounded border border-gray-800 text-center"
                  >
                    <div className="text-2xl font-bold text-accent mb-2">
                      {suggestion.chord.romanNumeral}
                    </div>
                    <div className="text-xs text-white mb-2">{suggestion.chord.name}</div>
                    <div className="flex items-center justify-center gap-1 mb-2">
                      <div className="w-16 h-1 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-red-500"
                          style={{ width: `${tension}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-400">{tension}%</span>
                    </div>
                    <div
                      className={`text-xs px-2 py-1 rounded ${
                        suggestion.strength === 'spicy'
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}
                    >
                      {suggestion.strength}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Modulation Options */}
          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4">Temporary Modulation</h3>
            <p className="text-sm text-gray-400 mb-4">
              Shift to a related key temporarily, then return
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 bg-dark-elevated rounded border border-gray-800">
                <div className="font-semibold text-white mb-1">Relative Major/Minor</div>
                <div className="text-sm text-gray-400">
                  Move to the relative key (e.g., C major → A minor)
                </div>
              </div>
              <div className="p-3 bg-dark-elevated rounded border border-gray-800">
                <div className="font-semibold text-white mb-1">Dominant Key</div>
                <div className="text-sm text-gray-400">
                  Move up a fifth (e.g., C major → G major)
                </div>
              </div>
              <div className="p-3 bg-dark-elevated rounded border border-gray-800">
                <div className="font-semibold text-white mb-1">Subdominant Key</div>
                <div className="text-sm text-gray-400">
                  Move down a fifth (e.g., C major → F major)
                </div>
              </div>
              <div className="p-3 bg-dark-elevated rounded border border-gray-800">
                <div className="font-semibold text-white mb-1">Parallel Key</div>
                <div className="text-sm text-gray-400">
                  Same root, different mode (e.g., C major → C minor)
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

