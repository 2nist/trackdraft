import { useState, useRef, useEffect } from 'react';
import { useSongStore } from '../../store/songStore';
import LyricEditor from './LyricEditor';
import SyllableDisplay from './SyllableDisplay';
import RhymeVisualizer from './RhymeVisualizer';
import { Plus, Trash2, ChevronDown, ChevronUp, Palette } from 'lucide-react';

export default function LyricsView() {
  const { currentSong, addSection, updateSection, deleteSection } = useSongStore();
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [showSyllableAnalysis, setShowSyllableAnalysis] = useState(true);
  const [showRhymeAnalysis, setShowRhymeAnalysis] = useState(true);
  const [targetRhythm, setTargetRhythm] = useState<string>('');
  const [showAddMenu, setShowAddMenu] = useState(false);
  const addMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (addMenuRef.current && !addMenuRef.current.contains(event.target as Node)) {
        setShowAddMenu(false);
      }
    };

    if (showAddMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showAddMenu]);

  const sections = currentSong?.sections || [];
  const selectedSection = sections.find((s) => s.id === selectedSectionId);

  // Auto-select first section if none selected
  useEffect(() => {
    if (sections.length > 0 && !selectedSectionId) {
      setSelectedSectionId(sections[0].id);
    }
  }, [sections.length, selectedSectionId]);

  const handleAddSection = (type: 'verse' | 'chorus' | 'bridge' | 'intro' | 'outro') => {
    const newSection = {
      id: crypto.randomUUID(),
      type,
      lyrics: '',
      duration: 8, // Default 8 bars
    };
    addSection(newSection);
    setSelectedSectionId(newSection.id);
  };

  const handleLyricsChange = (lyrics: string) => {
    if (selectedSectionId) {
      updateSection(selectedSectionId, { lyrics });
    }
  };

  const handleSetTargetRhythm = () => {
    if (selectedSection?.lyrics) {
      const lines = selectedSection.lyrics.split('\n').filter((l) => l.trim());
      if (lines.length > 0) {
        setTargetRhythm(lines[0]);
      }
    }
  };

  const getSectionColor = (type: string) => {
    switch (type) {
      case 'verse': return 'bg-blue-500/20 border-blue-500/50 text-blue-300';
      case 'chorus': return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-300';
      case 'bridge': return 'bg-purple-500/20 border-purple-500/50 text-purple-300';
      case 'intro': return 'bg-gray-500/20 border-gray-500/50 text-gray-300';
      case 'outro': return 'bg-gray-500/20 border-gray-500/50 text-gray-300';
      default: return 'bg-gray-500/20 border-gray-500/50 text-gray-300';
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Lyrics</h1>
        <p className="text-gray-400">Step 5: Write your lyrics with distraction-free editing</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar - Section Management */}
        <div className="lg:col-span-1 space-y-4">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Sections</h2>
              <div className="relative" ref={addMenuRef}>
                <button
                  onClick={() => setShowAddMenu(!showAddMenu)}
                  className="btn-primary flex items-center gap-2 text-sm"
                >
                  <Plus size={16} />
                  Add
                  {showAddMenu ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
                {showAddMenu && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-dark-elevated border border-gray-800 rounded-lg shadow-xl z-10">
                    <div className="p-2 space-y-1">
                      {(['intro', 'verse', 'chorus', 'bridge', 'outro'] as const).map((type) => (
                        <button
                          key={type}
                          onClick={() => {
                            handleAddSection(type);
                            setShowAddMenu(false);
                          }}
                          className="w-full text-left px-3 py-2 rounded hover:bg-dark-surface text-gray-300 hover:text-white transition-colors capitalize text-sm"
                        >
                          + {type}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              {sections.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm">
                  <p>No sections yet</p>
                  <p className="text-xs mt-2">Add a section to start writing</p>
                </div>
              ) : (
                sections.map((section) => {
                  const isSelected = section.id === selectedSectionId;
                  return (
                    <div
                      key={section.id}
                      onClick={() => setSelectedSectionId(section.id)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-accent bg-accent/10'
                          : 'border-gray-800 bg-dark-elevated hover:border-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded ${getSectionColor(section.type)}`}>
                          {section.type.toUpperCase()}
                        </span>
                        {section.id === selectedSectionId && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm('Delete this section?')) {
                                deleteSection(section.id);
                                if (sections.length > 1) {
                                  const nextSection = sections.find((s) => s.id !== section.id);
                                  setSelectedSectionId(nextSection?.id || null);
                                } else {
                                  setSelectedSectionId(null);
                                }
                              }
                            }}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                      <div className="text-sm text-white font-medium">
                        {section.type.charAt(0).toUpperCase() + section.type.slice(1)} {sections.filter((s) => s.type === section.type).indexOf(section) + 1}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {section.lyrics ? `${section.lyrics.split('\n').length} lines` : 'Empty'}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Quick Add Buttons */}
            <div className="mt-4 pt-4 border-t border-gray-800">
              <p className="text-xs text-gray-400 mb-2">Quick Add:</p>
              <div className="grid grid-cols-2 gap-2">
                {(['verse', 'chorus', 'bridge'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => handleAddSection(type)}
                    className="text-xs px-2 py-1 bg-dark-elevated hover:bg-dark-surface rounded border border-gray-800 text-gray-300 hover:text-white transition-colors"
                  >
                    + {type}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Editor Area */}
        <div className="lg:col-span-2 space-y-4">
          {selectedSection ? (
            <>
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-white">
                      {selectedSection.type.charAt(0).toUpperCase() + selectedSection.type.slice(1)}
                    </h2>
                    <p className="text-sm text-gray-400">
                      {selectedSection.narrativePurpose || 'Write your lyrics here'}
                    </p>
                  </div>
                </div>

                <LyricEditor
                  value={selectedSection.lyrics || ''}
                  onChange={handleLyricsChange}
                  placeholder={`Write your ${selectedSection.type} lyrics here...`}
                  targetWordCount={selectedSection.type === 'chorus' ? 50 : 80}
                />
              </div>

              {/* Syllable Analysis */}
              {showSyllableAnalysis && selectedSection.lyrics && (
                <div className="card">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Syllable Analysis</h3>
                    <div className="flex items-center gap-2">
                      {selectedSection.lyrics && (
                        <button
                          onClick={handleSetTargetRhythm}
                          className="text-xs px-3 py-1 bg-dark-elevated hover:bg-dark-surface rounded border border-gray-800 text-gray-300 hover:text-white transition-colors"
                        >
                          Set First Line as Target
                        </button>
                      )}
                      <button
                        onClick={() => setShowSyllableAnalysis(false)}
                        className="text-gray-400 hover:text-white"
                      >
                        <ChevronDown size={18} />
                      </button>
                    </div>
                  </div>
                  <SyllableDisplay
                    lyrics={selectedSection.lyrics}
                    targetRhythm={targetRhythm}
                    showBreakdown={false}
                  />
                </div>
              )}

              {/* Rhyme Analysis */}
              {showRhymeAnalysis && selectedSection.lyrics && (
                <div className="card">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <Palette size={18} />
                      Rhyme Analysis
                    </h3>
                    <button
                      onClick={() => setShowRhymeAnalysis(false)}
                      className="text-gray-400 hover:text-white"
                    >
                      <ChevronDown size={18} />
                    </button>
                  </div>
                  <RhymeVisualizer
                    lyrics={selectedSection.lyrics}
                    onWordClick={(word, lineIndex, wordIndex) => {
                      // Word clicked - suggestions panel will show automatically
                    }}
                    onWordReplace={(oldWord, newWord, lineIndex, wordIndex) => {
                      // Replace word in lyrics
                      if (!selectedSection.lyrics) return;
                      
                      const lines = selectedSection.lyrics.split('\n');
                      const words = lines[lineIndex].split(/\s+/);
                      
                      // Find and replace the word
                      let wordCount = 0;
                      const newWords = words.map((w, i) => {
                        const cleanW = w.replace(/[.,!?;:'"()]/g, '');
                        if (cleanW === oldWord && wordCount === wordIndex) {
                          wordCount++;
                          // Preserve punctuation
                          const punctuation = w.replace(/[^.,!?;:'"()]/g, '');
                          return newWord + punctuation;
                        }
                        if (cleanW === oldWord) wordCount++;
                        return w;
                      });
                      
                      lines[lineIndex] = newWords.join(' ');
                      const newLyrics = lines.join('\n');
                      handleLyricsChange(newLyrics);
                    }}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="card text-center py-12">
              <p className="text-gray-400 mb-4">No section selected</p>
              <p className="text-sm text-gray-500 mb-6">
                Add a section from the sidebar to start writing lyrics
              </p>
              <div className="flex gap-2 justify-center">
                {(['verse', 'chorus', 'bridge'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => handleAddSection(type)}
                    className="btn-primary capitalize"
                  >
                    Add {type}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar - Tips & Info */}
        <div className="lg:col-span-1">
          <div className="card sticky top-6">
            <h3 className="text-lg font-semibold text-white mb-4">Writing Tips</h3>
            <div className="space-y-4 text-sm text-gray-400">
              <div>
                <p className="text-white font-medium mb-1">Typewriter Mode</p>
                <p>Disables editing to keep you writing forward. Perfect for first drafts.</p>
              </div>
              <div>
                <p className="text-white font-medium mb-1">Hemingway Mode</p>
                <p>Write your draft first, then unlock editing. Prevents over-editing too early.</p>
              </div>
              <div>
                <p className="text-white font-medium mb-1">Focus Mode</p>
                <p>Shows only the current line. Helps maintain flow and rhythm.</p>
              </div>
              <div>
                <p className="text-white font-medium mb-1">Syllable Matching</p>
                <p>Use the target rhythm feature to match verse lines to your chorus rhythm.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
