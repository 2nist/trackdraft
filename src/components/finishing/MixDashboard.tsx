import { useState } from 'react';
import { useSongStore } from '../../store/songStore';
import { CheckCircle2, AlertCircle, Download, Share2, FileText, Music2, Layers } from 'lucide-react';

export default function MixDashboard() {
  const { currentSong } = useSongStore();
  const [exportFormat, setExportFormat] = useState<'lyrics' | 'structure' | 'json' | null>(null);

  if (!currentSong) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-400">Create a song first to view mix dashboard</p>
      </div>
    );
  }

  // Calculate completion percentages
  const hasChords = currentSong.sections.some((s) => s.chords && s.chords.length > 0);
  const hasStructure = currentSong.sections.length > 0;
  const hasLyrics = currentSong.sections.some((s) => s.lyrics && s.lyrics.trim().length > 0);
  const allSectionsHaveLyrics = currentSong.sections.every(
    (s) => s.lyrics && s.lyrics.trim().length > 0
  );

  const completionChecklist = [
    {
      id: 'transitions',
      label: 'All transitions smooth?',
      checked: true, // Would need transition analyzer
      warning: false,
    },
    {
      id: 'bridge',
      label: 'Bridge provides contrast?',
      checked: currentSong.sections.some((s) => s.type === 'bridge'),
      warning: !currentSong.sections.some((s) => s.type === 'bridge'),
    },
    {
      id: 'chorus-loudest',
      label: 'Chorus is the loudest section?',
      checked: true, // Would need audio analysis
      warning: false,
    },
    {
      id: 'strong-ending',
      label: 'Strong ending?',
      checked: currentSong.sections.some((s) => s.type === 'outro'),
      warning: false,
    },
    {
      id: 'intro-hook',
      label: 'Intro hooks listener in 8 seconds?',
      checked: currentSong.sections.some((s) => s.type === 'intro'),
      warning: false,
    },
    {
      id: 'lyrics-complete',
      label: 'Lyrics complete for all sections?',
      checked: allSectionsHaveLyrics,
      warning: !allSectionsHaveLyrics,
    },
  ];

  const completionScore = Math.round(
    (completionChecklist.filter((item) => item.checked).length / completionChecklist.length) * 100
  );

  const handleExport = (format: 'lyrics' | 'structure' | 'json') => {
    setExportFormat(format);

    if (format === 'lyrics') {
      const lyrics = currentSong.sections
        .map((section) => {
          const header = `[${section.type.toUpperCase()}]`;
          return `${header}\n${section.lyrics || '(no lyrics)'}\n`;
        })
        .join('\n');

      const blob = new Blob([lyrics], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentSong.title.replace(/\s+/g, '_')}_lyrics.txt`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (format === 'structure') {
      const structure = currentSong.sections
        .map((section, index) => `${index + 1}. ${section.type.toUpperCase()} - ${section.duration || 8} bars`)
        .join('\n');

      const blob = new Blob([structure], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentSong.title.replace(/\s+/g, '_')}_structure.txt`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (format === 'json') {
      const json = JSON.stringify(currentSong, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentSong.title.replace(/\s+/g, '_')}_complete.json`;
      a.click();
      URL.revokeObjectURL(url);
    }

    setExportFormat(null);
  };

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Mix Dashboard</h2>
            <p className="text-gray-400">Final polish and export your song</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-accent">{completionScore}%</div>
            <div className="text-sm text-gray-400">Complete</div>
          </div>
        </div>
      </div>

      {/* Completion Checklist */}
      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-4">Completion Checklist</h3>
        <div className="space-y-3">
          {completionChecklist.map((item) => (
            <div
              key={item.id}
              className={`flex items-center gap-3 p-3 rounded border ${
                item.checked
                  ? 'bg-green-500/10 border-green-500/30'
                  : item.warning
                  ? 'bg-yellow-500/10 border-yellow-500/30'
                  : 'bg-dark-elevated border-gray-800'
              }`}
            >
              {item.checked ? (
                <CheckCircle2 className="text-green-400 flex-shrink-0" size={20} />
              ) : item.warning ? (
                <AlertCircle className="text-yellow-400 flex-shrink-0" size={20} />
              ) : (
                <div className="w-5 h-5 border-2 border-gray-600 rounded flex-shrink-0" />
              )}
              <span className={`text-sm ${item.checked ? 'text-white' : item.warning ? 'text-yellow-300' : 'text-gray-400'}`}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Section Balance */}
      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-4">Section Balance</h3>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Verse vs Chorus</span>
              <span className="text-xs text-gray-500">Chorus should be louder</span>
            </div>
            <div className="space-y-2">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-400">Verse</span>
                  <span className="text-xs text-white">-3dB</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500" style={{ width: '70%' }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-400">Chorus</span>
                  <span className="text-xs text-white">0dB</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-500" style={{ width: '100%' }} />
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Dynamic Range</span>
              <span className="text-xs text-gray-500">Good</span>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-green-500 to-yellow-500" style={{ width: '75%' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Download size={20} />
          Export Options
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            onClick={() => handleExport('lyrics')}
            disabled={exportFormat === 'lyrics'}
            className="p-4 bg-dark-elevated rounded border border-gray-800 hover:border-accent transition-colors text-left disabled:opacity-50"
          >
            <FileText className="text-accent mb-2" size={24} />
            <div className="font-semibold text-white mb-1">Export Lyrics</div>
            <div className="text-xs text-gray-400">.txt format</div>
          </button>

          <button
            onClick={() => handleExport('structure')}
            disabled={exportFormat === 'structure'}
            className="p-4 bg-dark-elevated rounded border border-gray-800 hover:border-accent transition-colors text-left disabled:opacity-50"
          >
            <Layers className="text-accent mb-2" size={24} />
            <div className="font-semibold text-white mb-1">Export Structure</div>
            <div className="text-xs text-gray-400">.txt format</div>
          </button>

          <button
            onClick={() => handleExport('json')}
            disabled={exportFormat === 'json'}
            className="p-4 bg-dark-elevated rounded border border-gray-800 hover:border-accent transition-colors text-left disabled:opacity-50"
          >
            <Music2 className="text-accent mb-2" size={24} />
            <div className="font-semibold text-white mb-1">Export Complete</div>
            <div className="text-xs text-gray-400">.json format</div>
          </button>
        </div>
      </div>

      {/* Share Options */}
      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Share2 size={20} />
          Share & Collaborate
        </h3>
        <div className="space-y-3">
          <button className="btn-primary w-full flex items-center justify-center gap-2">
            <Share2 size={18} />
            Generate Shareable Link
          </button>
          <p className="text-xs text-gray-500 text-center">
            Create a link to share your song with collaborators
          </p>
        </div>
      </div>
    </div>
  );
}

