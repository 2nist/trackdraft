import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react';
import { useState } from 'react';

export default function PlayerBar() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(75);

  return (
    <footer className="h-16 bg-surface-1 border-t border-surface-2 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="p-2 text-text-primary hover:bg-surface-2 rounded transition-colors"
        >
          {isPlaying ? <Pause size={20} /> : <Play size={20} />}
        </button>
        
        <button className="p-2 text-text-secondary hover:text-text-primary hover:bg-surface-2 rounded transition-colors">
          <SkipBack size={18} />
        </button>
        
        <button className="p-2 text-text-secondary hover:text-text-primary hover:bg-surface-2 rounded transition-colors">
          <SkipForward size={18} />
        </button>

        <div className="text-xs text-text-tertiary ml-4">
          <span>0:00</span>
          <span className="mx-2">/</span>
          <span>0:00</span>
        </div>
      </div>

      <div className="flex-1 mx-8">
        <div className="h-1 bg-surface-2 rounded-full cursor-pointer">
          <div className="h-full bg-track-orange-700 rounded-full" style={{ width: '0%' }} />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Volume2 size={18} className="text-text-tertiary" />
        <input
          type="range"
          min="0"
          max="100"
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          className="w-24 h-1 bg-surface-2 rounded-full appearance-none cursor-pointer accent-track-orange-700"
        />
        <span className="text-xs text-text-tertiary w-8">{volume}%</span>
      </div>
    </footer>
  );
}

