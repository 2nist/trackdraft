import { useSongStore } from '../../store/songStore';
import { Save, Undo2, Redo2, Play, Pause } from 'lucide-react';
import { useState } from 'react';

export default function TopBar() {
  const { currentSong, updateSong, saveSong } = useSongStore();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(currentSong?.title || '');

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitleValue(e.target.value);
  };

  const handleTitleBlur = () => {
    if (titleValue.trim() && currentSong) {
      updateSong({ title: titleValue.trim() });
    } else {
      setTitleValue(currentSong?.title || '');
    }
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleTitleBlur();
    }
  };

  return (
    <header className="h-16 bg-surface-1 border-b border-surface-2 flex items-center justify-between px-6">
      <div className="flex items-center gap-4 flex-1">
        {isEditingTitle ? (
          <input
            type="text"
            value={titleValue}
            onChange={handleTitleChange}
            onBlur={handleTitleBlur}
            onKeyDown={handleTitleKeyDown}
            className="bg-surface-0 border-2 border-track-orange-700 rounded-lg px-3 py-1 text-lg font-semibold text-text-primary focus:outline-none focus:ring-4 focus:ring-track-orange-700/10"
            autoFocus
          />
        ) : (
          <h2
            onClick={() => setIsEditingTitle(true)}
            className="text-lg font-semibold text-text-primary cursor-pointer hover:text-track-orange-700 transition-colors"
          >
            {currentSong?.title || 'Untitled Song'}
          </h2>
        )}
        
        <div className="flex items-center gap-2 text-xs text-text-tertiary">
          <span className="px-2 py-1 bg-surface-2 rounded border border-surface-3">
            {currentSong?.key.root} {currentSong?.key.mode}
          </span>
          <span className="px-2 py-1 bg-surface-2 rounded border border-surface-3">
            {currentSong?.tempo} BPM
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={saveSong}
          className="p-2 text-text-secondary hover:text-text-primary hover:bg-surface-2 rounded transition-colors"
          title="Save (Ctrl+S)"
        >
          <Save size={20} />
        </button>
        
        <button
          className="p-2 text-text-secondary hover:text-text-primary hover:bg-surface-2 rounded transition-colors"
          title="Undo (Ctrl+Z)"
        >
          <Undo2 size={20} />
        </button>
        
        <button
          className="p-2 text-text-secondary hover:text-text-primary hover:bg-surface-2 rounded transition-colors"
          title="Redo (Ctrl+Shift+Z)"
        >
          <Redo2 size={20} />
        </button>

        <div className="w-px h-6 bg-surface-2 mx-2" />

        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="p-2 text-text-secondary hover:text-text-primary hover:bg-surface-2 rounded transition-colors"
          title="Play/Pause (Space)"
        >
          {isPlaying ? <Pause size={20} /> : <Play size={20} />}
        </button>
      </div>
    </header>
  );
}

