import { useState, useEffect } from 'react';
import { useSongStore } from '../../store/songStore';
import { chordSchemas } from '../../data/chordSchemas';
import { romanNumeralToChord } from '../../lib/harmony/keyUtils';
import { getAllSubstitutions, analyzeProgressionStrength, SubstitutionOption } from '../../lib/harmony/substitutions';
import { playProgression } from '../../lib/harmony/audioUtils';
import { Chord } from '../../types/music';
import { Play, RotateCw, Sparkles, ArrowLeftRight, X, TrendingUp } from 'lucide-react';
import * as Tone from 'tone';

export default function ProgressionBuilder() {
  const { currentSong, updateProgression } = useSongStore();
  const [selectedSchema, setSelectedSchema] = useState<string | null>(null);
  const [progression, setProgression] = useState<Chord[]>([]);
  const [selectedChordIndex, setSelectedChordIndex] = useState<number | null>(null);
  const [substitutions, setSubstitutions] = useState<{
    commonTone: SubstitutionOption[];
    functional: SubstitutionOption[];
    modalInterchange: SubstitutionOption[];
  } | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [synth, setSynth] = useState<Tone.PolySynth | null>(null);

  // Initialize Tone.js synth
  useEffect(() => {
    if (typeof window !== 'undefined' && !synth) {
      const newSynth = new Tone.PolySynth(Tone.Synth).toDestination();
      setSynth(newSynth);
      
      return () => {
        newSynth.dispose();
      };
    }
  }, []);

  // Load progression from song store when song changes
  useEffect(() => {
    if (currentSong?.progression && currentSong.progression.length > 0) {
      setProgression(currentSong.progression);
      // Try to detect which schema was used (optional enhancement)
    } else {
      setProgression([]);
      setSelectedSchema(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSong?.id]); // Only depend on song ID to avoid loops

  // Save progression to store (called explicitly from handlers)
  const saveProgression = (newProgression: Chord[]) => {
    if (newProgression.length > 0 && currentSong) {
      updateProgression(newProgression);
    }
  };

  const handleSchemaSelect = (schemaName: string) => {
    const schema = chordSchemas.find((s) => s.name === schemaName);
    if (!schema || !currentSong) return;

    const chords = schema.progression.map((romanNumeral) =>
      romanNumeralToChord(romanNumeral, currentSong.key)
    );
    
    setProgression(chords);
    setSelectedSchema(schemaName);
    setSelectedChordIndex(null);
    setSubstitutions(null);
    saveProgression(chords);
  };

  const handleRotate = () => {
    if (progression.length === 0 || !currentSong) return;
    
    const rotated = [...progression.slice(1), progression[0]];
    setProgression(rotated);
    setSelectedChordIndex(null);
    setSubstitutions(null);
    saveProgression(rotated);
  };

  const handleChordClick = (index: number) => {
    if (!currentSong) return;
    
    const chord = progression[index];
    const subs = getAllSubstitutions(chord, currentSong.key);
    
    setSelectedChordIndex(index);
    setSubstitutions(subs);
  };

  const handleSubstitute = (substitution: SubstitutionOption) => {
    if (selectedChordIndex === null) return;
    
    const newProgression = [...progression];
    newProgression[selectedChordIndex] = substitution.chord;
    setProgression(newProgression);
    setSelectedChordIndex(null);
    setSubstitutions(null);
    saveProgression(newProgression);
  };

  const handlePlay = async () => {
    if (!synth || progression.length === 0) return;

    if (isPlaying) {
      synth.releaseAll();
      setIsPlaying(false);
      return;
    }

    setIsPlaying(true);

    try {
      // Use the audio utility to play the progression
      await playProgression(
        synth,
        progression.map((chord) => ({ notes: chord.notes })),
        '2n',
        currentSong?.tempo || 120
      );

      // Stop after progression finishes (2 beats per chord)
      setTimeout(() => {
        synth.releaseAll();
        setIsPlaying(false);
      }, progression.length * 2000);
    } catch (error) {
      console.error('Error playing progression:', error);
      synth.releaseAll();
      setIsPlaying(false);
    }
  };

  const progressionStrength = progression.length > 0 
    ? analyzeProgressionStrength(progression)
    : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Progression Timeline */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Chord Progression</h3>
          <div className="flex gap-2">
            <button
              onClick={handleRotate}
              disabled={progression.length === 0}
              className="btn-secondary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RotateCw size={16} />
              Rotate
            </button>
            <button
              onClick={handlePlay}
              disabled={progression.length === 0 || !synth}
              className={`flex items-center gap-2 ${
                isPlaying ? 'btn-secondary' : 'btn-primary'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <Play size={16} />
              {isPlaying ? 'Stop' : 'Play'}
            </button>
          </div>
        </div>

        {/* Progression Strength */}
        {progression.length > 0 && (
          <div className="card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="text-accent" size={16} />
                <span className="text-sm font-semibold text-white">Progression Strength</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      progressionStrength >= 70
                        ? 'bg-green-500'
                        : progressionStrength >= 50
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${progressionStrength}%` }}
                  />
                </div>
                <span className="text-sm font-semibold text-white w-12 text-right">
                  {progressionStrength}%
                </span>
              </div>
            </div>
          </div>
        )}

        {progression.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-400 mb-4">Select a schema to get started</p>
            <p className="text-sm text-gray-500">Or build your own progression</p>
          </div>
        ) : (
          <div className="flex gap-4">
            {progression.map((chord, index) => (
              <div
                key={index}
                onClick={() => handleChordClick(index)}
                className={`flex-1 card transition-all cursor-pointer ${
                  selectedChordIndex === index
                    ? 'border-accent bg-accent/10 scale-105'
                    : 'hover:border-accent'
                }`}
              >
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent mb-2">
                    {chord.romanNumeral}
                  </div>
                  <div className="text-sm font-semibold text-white mb-1">
                    {chord.name}
                  </div>
                  <div className="text-xs text-gray-400 mb-3">
                    {chord.function}
                  </div>
                  <div className="text-xs text-gray-500">
                    {chord.notes.join(' ')}
                  </div>
                  {selectedChordIndex === index && (
                    <div className="mt-2 text-xs text-accent flex items-center justify-center gap-1">
                      <ArrowLeftRight size={12} />
                      Click to see substitutions
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Substitution Panel */}
        {selectedChordIndex !== null && substitutions && (
          <div className="card border-2 border-accent">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-white">
                Substitutions for {progression[selectedChordIndex].romanNumeral}
              </h4>
              <button
                onClick={() => {
                  setSelectedChordIndex(null);
                  setSubstitutions(null);
                }}
                className="text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Common Tone Substitutions */}
              {substitutions.commonTone.length > 0 && (
                <div>
                  <h5 className="text-sm font-semibold text-white mb-2">Common Tone</h5>
                  <div className="grid grid-cols-2 gap-2">
                    {substitutions.commonTone.slice(0, 4).map((sub, i) => (
                      <button
                        key={i}
                        onClick={() => handleSubstitute(sub)}
                        className="p-2 bg-dark-elevated hover:bg-dark-surface rounded border border-gray-800 hover:border-accent transition-all text-left"
                      >
                        <div className="font-semibold text-white text-sm">{sub.chord.romanNumeral}</div>
                        <div className="text-xs text-gray-400">{sub.chord.name}</div>
                        <div className="text-xs text-gray-500 mt-1">{sub.reason}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Functional Substitutions */}
              {substitutions.functional.length > 0 && (
                <div>
                  <h5 className="text-sm font-semibold text-white mb-2">Functional</h5>
                  <div className="grid grid-cols-2 gap-2">
                    {substitutions.functional.slice(0, 4).map((sub, i) => (
                      <button
                        key={i}
                        onClick={() => handleSubstitute(sub)}
                        className="p-2 bg-dark-elevated hover:bg-dark-surface rounded border border-gray-800 hover:border-accent transition-all text-left"
                      >
                        <div className="font-semibold text-white text-sm">{sub.chord.romanNumeral}</div>
                        <div className="text-xs text-gray-400">{sub.chord.name}</div>
                        <div className="text-xs text-gray-500 mt-1">{sub.reason}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Modal Interchange */}
              {substitutions.modalInterchange.length > 0 && (
                <div>
                  <h5 className="text-sm font-semibold text-white mb-2">Modal Interchange</h5>
                  <div className="grid grid-cols-2 gap-2">
                    {substitutions.modalInterchange.slice(0, 4).map((sub, i) => (
                      <button
                        key={i}
                        onClick={() => handleSubstitute(sub)}
                        className="p-2 bg-dark-elevated hover:bg-dark-surface rounded border border-gray-800 hover:border-accent transition-all text-left"
                      >
                        <div className="font-semibold text-white text-sm">{sub.chord.romanNumeral}</div>
                        <div className="text-xs text-gray-400">{sub.chord.name}</div>
                        <div className="text-xs text-gray-500 mt-1">{sub.reason}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Vibe Meter */}
        {progression.length > 0 && (
          <div className="card">
            <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <Sparkles size={16} />
              Emotional Vibe
            </h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">Dark</span>
                <span className="text-gray-400">Bright</span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-600 to-yellow-500"
                  style={{ width: '60%' }}
                />
              </div>
              <div className="flex items-center justify-between text-xs mt-2">
                <span className="text-gray-400">Tense</span>
                <span className="text-gray-400">Relaxed</span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-red-600 to-green-500"
                  style={{ width: '40%' }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sidebar with Schemas */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Quick Start Schemas</h3>
          <div className="space-y-2">
            {chordSchemas.map((schema) => (
              <button
                key={schema.name}
                onClick={() => handleSchemaSelect(schema.name)}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  selectedSchema === schema.name
                    ? 'border-accent bg-accent/10'
                    : 'border-gray-800 bg-dark-elevated hover:border-gray-700'
                }`}
              >
                <div className="font-semibold text-white mb-1">{schema.name}</div>
                <div className="text-xs text-gray-400 mb-2">
                  {schema.progression.join(' - ')}
                </div>
                <div className="text-xs text-gray-500">{schema.emotionalContext}</div>
                <div className="flex items-center gap-2 mt-2">
                  <span
                    className={`text-xs px-2 py-0.5 rounded ${
                      schema.difficulty === 'beginner'
                        ? 'bg-green-500/20 text-green-400'
                        : schema.difficulty === 'intermediate'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {schema.difficulty}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
