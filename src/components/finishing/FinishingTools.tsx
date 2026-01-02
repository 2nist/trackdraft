import { useState } from 'react';
import { useSongStore } from '../../store/songStore';
import { Layers, Volume2, Clock, Music2, Sparkles, Download } from 'lucide-react';

type EndingType = 'fade-out' | 'hard-stop' | 'a-cappella' | 'instrumental-outro' | 'callback-intro';

export default function FinishingTools() {
  const { currentSong, updateSong } = useSongStore();
  const [selectedEnding, setSelectedEnding] = useState<EndingType | null>(null);
  const [tempoVariation, setTempoVariation] = useState<{
    type: 'ritardando' | 'accelerando' | 'none';
    amount: number; // percentage
  }>({ type: 'none', amount: 0 });

  if (!currentSong) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-400">Create a song first to use finishing tools</p>
      </div>
    );
  }

  const endingTemplates = [
    {
      id: 'fade-out' as EndingType,
      name: 'Fade Out',
      description: 'Gradually decrease volume to silence',
      icon: Volume2,
    },
    {
      id: 'hard-stop' as EndingType,
      name: 'Hard Stop',
      description: 'End abruptly on the final chord',
      icon: Music2,
    },
    {
      id: 'a-cappella' as EndingType,
      name: 'A Cappella',
      description: 'End with vocals only, instruments drop out',
      icon: Sparkles,
    },
    {
      id: 'instrumental-outro' as EndingType,
      name: 'Instrumental Outro',
      description: 'End with instruments only, vocals drop out',
      icon: Music2,
    },
    {
      id: 'callback-intro' as EndingType,
      name: 'Callback to Intro',
      description: 'Echo or repeat the intro material',
      icon: Layers,
    },
  ];

  const layerSuggestions = [
    { name: 'Strings', description: 'Add string section for emotional depth' },
    { name: 'Choir/Vocals', description: 'Add background vocals or choir' },
    { name: 'Synth Pad', description: 'Add atmospheric synth pad' },
    { name: 'Brass', description: 'Add brass section for power' },
    { name: 'Percussion', description: 'Add additional percussion layers' },
  ];

  const finalChordSuggestions = [
    { chord: 'Add 9th', description: 'Add 9th for open, airy sound' },
    { chord: 'Add 11th', description: 'Add 11th for modern, suspended feel' },
    { chord: 'Sus4', description: 'Suspend 4th for unresolved tension' },
    { chord: 'Major 7th', description: 'Add major 7th for jazz sophistication' },
    { chord: 'Power Chord', description: 'Use power chord for rock ending' },
  ];

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="text-yellow-400" size={24} />
          <h2 className="text-2xl font-bold text-white">Finishing Tools</h2>
        </div>
        <p className="text-gray-400">
          Add the final polish to make your song memorable and impactful
        </p>
      </div>

      {/* Maximum Impact */}
      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Volume2 size={20} />
          Maximum Impact
        </h3>
        <p className="text-sm text-gray-400 mb-4">
          Add layers and build intensity for the final chorus
        </p>

        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Layer Suggestions</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {layerSuggestions.map((layer, index) => (
                <div
                  key={index}
                  className="p-3 bg-dark-elevated rounded border border-gray-800 hover:border-accent transition-colors"
                >
                  <div className="font-semibold text-white mb-1">{layer.name}</div>
                  <div className="text-xs text-gray-400">{layer.description}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Volume Automation</h4>
            <div className="p-4 bg-dark-elevated rounded border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Final Chorus Volume</span>
                <span className="text-sm font-semibold text-white">120%</span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden mb-2">
                <div
                  className="h-full bg-gradient-to-r from-accent to-yellow-500"
                  style={{ width: '100%' }}
                />
              </div>
              <p className="text-xs text-gray-500">
                Final chorus should be 10-20% louder than verses for maximum impact
              </p>
            </div>
          </div>

          <button className="btn-primary w-full flex items-center justify-center gap-2">
            <Sparkles size={18} />
            Apply "Everything at Once" - Add All Layers
          </button>
        </div>
      </div>

      {/* Tempo Variation */}
      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Clock size={20} />
          Tempo Variation
        </h3>
        <p className="text-sm text-gray-400 mb-4">
          Add tempo changes for dramatic effect
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Tempo Change Type
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setTempoVariation({ type: 'ritardando', amount: tempoVariation.amount })}
                className={`flex-1 px-4 py-2 rounded border transition-colors ${
                  tempoVariation.type === 'ritardando'
                    ? 'border-accent bg-accent/10 text-white'
                    : 'border-gray-800 bg-dark-elevated text-gray-400 hover:border-gray-700'
                }`}
              >
                Ritardando (Slow Down)
              </button>
              <button
                onClick={() => setTempoVariation({ type: 'accelerando', amount: tempoVariation.amount })}
                className={`flex-1 px-4 py-2 rounded border transition-colors ${
                  tempoVariation.type === 'accelerando'
                    ? 'border-accent bg-accent/10 text-white'
                    : 'border-gray-800 bg-dark-elevated text-gray-400 hover:border-gray-700'
                }`}
              >
                Accelerando (Speed Up)
              </button>
              <button
                onClick={() => setTempoVariation({ type: 'none', amount: 0 })}
                className={`px-4 py-2 rounded border transition-colors ${
                  tempoVariation.type === 'none'
                    ? 'border-accent bg-accent/10 text-white'
                    : 'border-gray-800 bg-dark-elevated text-gray-400 hover:border-gray-700'
                }`}
              >
                None
              </button>
            </div>
          </div>

          {tempoVariation.type !== 'none' && (
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Amount: {tempoVariation.amount}%
              </label>
              <input
                type="range"
                min="0"
                max="30"
                value={tempoVariation.amount}
                onChange={(e) =>
                  setTempoVariation({ ...tempoVariation, amount: Number(e.target.value) })
                }
                className="w-full h-2 bg-gray-800 rounded-full appearance-none accent-accent"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Subtle</span>
                <span>Moderate</span>
                <span>Dramatic</span>
              </div>
            </div>
          )}

          {/* Timeline Visualization */}
          {tempoVariation.type !== 'none' && (
            <div className="p-4 bg-dark-elevated rounded border border-gray-800">
              <h4 className="text-sm font-semibold text-white mb-3">Tempo Timeline</h4>
              <div className="h-16 bg-gray-900 rounded relative overflow-hidden">
                <div className="absolute inset-0 flex items-center">
                  <div
                    className={`h-full transition-all ${
                      tempoVariation.type === 'ritardando'
                        ? 'bg-gradient-to-r from-green-500 to-red-500'
                        : 'bg-gradient-to-r from-red-500 to-green-500'
                    }`}
                    style={{
                      width: '100%',
                      clipPath:
                        tempoVariation.type === 'ritardando'
                          ? 'polygon(0 100%, 100% 0, 100% 100%)'
                          : 'polygon(0 0, 100% 100%, 0 100%)',
                    }}
                  />
                </div>
                <div className="absolute inset-0 flex items-center justify-between px-2 text-xs text-gray-400">
                  <span>Start: {currentSong.tempo} BPM</span>
                  <span>
                    End:{' '}
                    {tempoVariation.type === 'ritardando'
                      ? Math.round(currentSong.tempo * (1 - tempoVariation.amount / 100))
                      : Math.round(currentSong.tempo * (1 + tempoVariation.amount / 100))}{' '}
                    BPM
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Strong Termination */}
      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Music2 size={20} />
          Strong Termination
        </h3>
        <p className="text-sm text-gray-400 mb-4">
          Make the final chord and ending memorable
        </p>

        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Final Chord Enhancements</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {finalChordSuggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="p-3 bg-dark-elevated rounded border border-gray-800 hover:border-accent transition-colors"
                >
                  <div className="font-semibold text-white mb-1">{suggestion.chord}</div>
                  <div className="text-xs text-gray-400">{suggestion.description}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Fermata Options</h4>
            <div className="flex gap-2">
              {['None', 'Short Hold', 'Medium Hold', 'Long Hold'].map((option) => (
                <button
                  key={option}
                  className="flex-1 px-4 py-2 bg-dark-elevated rounded border border-gray-800 hover:border-accent text-gray-300 hover:text-white transition-colors"
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Decay/Reverb</h4>
            <div className="p-3 bg-dark-elevated rounded border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Reverb Tail</span>
                <span className="text-sm font-semibold text-white">3.5s</span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                step="0.5"
                defaultValue="3.5"
                className="w-full h-2 bg-gray-800 rounded-full appearance-none accent-accent"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Dry</span>
                <span>Wet</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ending Templates */}
      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Layers size={20} />
          Ending Templates
        </h3>
        <p className="text-sm text-gray-400 mb-4">
          Choose a pre-configured ending style
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {endingTemplates.map((template) => {
            const Icon = template.icon;
            return (
              <button
                key={template.id}
                onClick={() => setSelectedEnding(template.id)}
                className={`p-4 rounded-lg border text-left transition-all ${
                  selectedEnding === template.id
                    ? 'border-accent bg-accent/10'
                    : 'border-gray-800 bg-dark-elevated hover:border-gray-700'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <Icon className={selectedEnding === template.id ? 'text-accent' : 'text-gray-400'} size={20} />
                  <div className="font-semibold text-white">{template.name}</div>
                </div>
                <div className="text-xs text-gray-400">{template.description}</div>
              </button>
            );
          })}
        </div>

        {selectedEnding && (
          <div className="mt-4 p-4 bg-accent/10 rounded border border-accent">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-white mb-1">
                  Selected: {endingTemplates.find((t) => t.id === selectedEnding)?.name}
                </div>
                <div className="text-sm text-gray-400">
                  {endingTemplates.find((t) => t.id === selectedEnding)?.description}
                </div>
              </div>
              <button className="btn-primary">Preview</button>
            </div>
          </div>
        )}
      </div>

      {/* Final Riff */}
      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-4">Final Riff / Signature Lick</h3>
        <p className="text-sm text-gray-400 mb-4">
          Add a memorable instrumental phrase at the end
        </p>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-semibold text-white mb-2">Lead Instrument</label>
            <select className="w-full px-4 py-2 bg-dark-elevated border border-gray-800 rounded text-white">
              <option>Guitar</option>
              <option>Piano</option>
              <option>Synth</option>
              <option>Saxophone</option>
              <option>Violin</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-white mb-2">Riff Pattern</label>
            <div className="p-4 bg-dark-elevated rounded border border-gray-800">
              <p className="text-sm text-gray-400 mb-2">8-step sequencer would go here</p>
              <div className="grid grid-cols-8 gap-2">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-12 bg-gray-800 rounded border border-gray-700 hover:border-accent transition-colors cursor-pointer"
                  />
                ))}
              </div>
            </div>
          </div>

          <button className="btn-secondary w-full">Generate Signature Lick</button>
        </div>
      </div>
    </div>
  );
}

