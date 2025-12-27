import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { FileText, Type, Eye, Edit3, Check } from 'lucide-react';

type EditorMode = 'typewriter' | 'hemingway' | 'focus' | 'normal';

interface LyricEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  targetWordCount?: number;
}

export default function LyricEditor({ 
  value, 
  onChange, 
  placeholder = 'Start writing...',
  targetWordCount 
}: LyricEditorProps) {
  const [mode, setMode] = useState<EditorMode>('normal');
  const [hemingwayComplete, setHemingwayComplete] = useState(false);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const lines = value.split('\n');
  const wordCount = value.trim().split(/\s+/).filter((w) => w.length > 0).length;
  const progress = targetWordCount ? Math.min(100, (wordCount / targetWordCount) * 100) : 0;

  // Focus mode: show only current line
  const visibleLines = mode === 'focus' 
    ? lines.slice(Math.max(0, currentLineIndex - 1), currentLineIndex + 2)
    : lines;

  useEffect(() => {
    if (mode === 'focus' && textareaRef.current) {
      const lineStart = value.substring(0, value.split('\n').slice(0, currentLineIndex).join('\n').length).length;
      textareaRef.current.setSelectionRange(lineStart, lineStart);
    }
  }, [mode, currentLineIndex, value]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Typewriter mode: disable backspace, delete, arrow keys
    if (mode === 'typewriter') {
      if (
        e.key === 'Backspace' ||
        e.key === 'Delete' ||
        e.key === 'ArrowLeft' ||
        e.key === 'ArrowRight' ||
        e.key === 'ArrowUp' ||
        e.key === 'ArrowDown' ||
        (e.ctrlKey && (e.key === 'z' || e.key === 'Z'))
      ) {
        e.preventDefault();
        return;
      }
    }

    // Hemingway mode: disable editing until marked complete
    if (mode === 'hemingway' && !hemingwayComplete) {
      if (
        e.key === 'Backspace' ||
        e.key === 'Delete' ||
        (e.ctrlKey && (e.key === 'z' || e.key === 'Z'))
      ) {
        e.preventDefault();
        return;
      }
    }

    // Focus mode: prevent scrolling
    if (mode === 'focus') {
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
        // Update current line index
        const cursorPos = textareaRef.current?.selectionStart || 0;
        const textBeforeCursor = value.substring(0, cursorPos);
        const newIndex = textBeforeCursor.split('\n').length - 1;
        setCurrentLineIndex(newIndex);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    
    // Update current line index for focus mode
    if (mode === 'focus') {
      const cursorPos = e.target.selectionStart;
      const textBeforeCursor = newValue.substring(0, cursorPos);
      const newIndex = textBeforeCursor.split('\n').length - 1;
      setCurrentLineIndex(newIndex);
    }
    
    onChange(newValue);
  };

  const handleModeChange = (newMode: EditorMode) => {
    setMode(newMode);
    if (newMode === 'hemingway') {
      setHemingwayComplete(false);
    }
  };

  const getModeIcon = (m: EditorMode) => {
    switch (m) {
      case 'typewriter': return Type;
      case 'hemingway': return FileText;
      case 'focus': return Eye;
      case 'normal': return Edit3;
    }
  };

  const getModeDescription = (m: EditorMode) => {
    switch (m) {
      case 'typewriter':
        return 'No editing - keep writing forward only';
      case 'hemingway':
        return 'Write first, edit later';
      case 'focus':
        return 'Focus on one line at a time';
      case 'normal':
        return 'Full editing capabilities';
    }
  };

  return (
    <div className="space-y-4">
      {/* Mode Selector */}
      <div className="flex items-center gap-2 border-b border-gray-800 pb-4">
        {(['typewriter', 'hemingway', 'focus', 'normal'] as EditorMode[]).map((m) => {
          const Icon = getModeIcon(m);
          const isActive = mode === m;
          
          return (
            <button
              key={m}
              onClick={() => handleModeChange(m)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                isActive
                  ? 'bg-accent text-white'
                  : 'bg-dark-elevated text-gray-400 hover:text-white hover:bg-dark-surface'
              }`}
              title={getModeDescription(m)}
            >
              <Icon size={18} />
              <span className="capitalize text-sm font-medium">{m}</span>
            </button>
          );
        })}
      </div>

      {/* Typewriter Mode Reminder */}
      {mode === 'typewriter' && (
        <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-3">
          <p className="text-sm text-blue-300">
            💡 <strong>Typewriter Mode:</strong> Keep writing, edit later. Backspace and arrow keys are disabled.
          </p>
        </div>
      )}

      {/* Hemingway Mode Status */}
      {mode === 'hemingway' && !hemingwayComplete && (
        <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-3">
          <p className="text-sm text-yellow-300 mb-2">
            ✍️ <strong>Hemingway Mode:</strong> Write your draft first. Editing is disabled until you mark it complete.
          </p>
          <button
            onClick={() => setHemingwayComplete(true)}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <Check size={16} />
            Mark Draft Complete
          </button>
        </div>
      )}

      {/* Progress Bar (if target word count set) */}
      {targetWordCount && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Progress</span>
            <span className="text-white font-semibold">
              {wordCount} / {targetWordCount} words
            </span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-accent to-purple-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Editor */}
      <div className="relative">
        {mode === 'focus' && (
          <div className="absolute inset-0 pointer-events-none z-10">
            <div className="h-full flex flex-col">
              {/* Dimmed top section */}
              {currentLineIndex > 0 && (
                <div className="flex-1 bg-dark-bg/80 backdrop-blur-sm" />
              )}
              {/* Visible section (previous line, current line, next line) */}
              <div className="flex-shrink-0" />
              {/* Dimmed bottom section */}
              {currentLineIndex < lines.length - 1 && (
                <div className="flex-1 bg-dark-bg/80 backdrop-blur-sm" />
              )}
            </div>
          </div>
        )}

        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={mode === 'hemingway' && !hemingwayComplete}
          className={`w-full min-h-[400px] bg-dark-elevated border border-gray-800 rounded-lg text-white placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent font-mono text-lg ${
            mode === 'normal' ? 'pl-14 pr-4 py-4' : 'p-4'
          } ${
            mode === 'focus' ? 'overflow-hidden' : ''
          } ${mode === 'hemingway' && !hemingwayComplete ? 'opacity-90' : ''}`}
          style={{
            fontFamily: mode === 'typewriter' ? 'Courier New, monospace' : 'inherit',
            lineHeight: mode === 'normal' ? '1.75rem' : '1.625',
          }}
        />

        {/* Line numbers (normal mode only) */}
        {mode === 'normal' && (
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-dark-surface border-r border-gray-800 rounded-l-lg text-right text-xs text-gray-500 font-mono pointer-events-none overflow-hidden">
            <div className="py-4">
              {lines.map((_, i) => (
                <div 
                  key={i} 
                  className="h-7 leading-7 pr-2"
                  style={{ lineHeight: '1.75rem' }}
                >
                  {i + 1}
                </div>
              ))}
              {/* Add an extra line number for the current line if typing */}
              {value.endsWith('\n') && (
                <div 
                  className="h-7 leading-7 pr-2"
                  style={{ lineHeight: '1.75rem' }}
                >
                  {lines.length + 1}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Word Count */}
      <div className="flex items-center justify-between text-sm text-gray-400">
        <span>{wordCount} words</span>
        <span>{lines.length} lines</span>
      </div>
    </div>
  );
}

