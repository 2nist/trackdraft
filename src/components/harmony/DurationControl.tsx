import React from 'react';

interface DurationControlProps {
  /** Current duration in beats */
  value: number;
  /** Callback when duration changes */
  onChange: (beats: number) => void;
  /** Maximum allowed duration (based on progression length) */
  max?: number;
  /** Minimum duration (default 0.5) */
  min?: number;
  /** Step increment for stepper buttons (default 0.5) */
  step?: number;
  /** Whether to show note symbols */
  showNoteSymbols?: boolean;
  /** Size variant */
  size?: 'small' | 'medium' | 'large';
  /** Additional class names */
  className?: string;
}

/**
 * Render a musical note symbol based on beat duration
 */
function getNoteSymbol(beats: number): string {
  if (beats <= 0.5) return '𝅘𝅥𝅮'; // Eighth note
  if (beats <= 1) return '♩';     // Quarter note
  if (beats <= 2) return '𝅗𝅥';    // Half note
  if (beats <= 4) return '𝅝';     // Whole note
  return '𝅝·';                    // Dotted whole note
}

/**
 * Get beat label for display
 */
function getBeatLabel(beats: number): string {
  if (beats === 0.5) return '½';
  if (beats === 1) return '1';
  if (beats === 1.5) return '1½';
  if (beats === 2) return '2';
  if (beats === 2.5) return '2½';
  if (beats === 3) return '3';
  if (beats === 3.5) return '3½';
  if (beats === 4) return '4';
  // For other values, show as decimal
  return beats.toString();
}

export const DurationControl: React.FC<DurationControlProps> = ({
  value,
  onChange,
  max = 16,
  min = 0.5,
  step = 0.5,
  showNoteSymbols = true,
  size = 'medium',
  className = '',
}) => {
  const increment = () => onChange(Math.min(value + step, max));
  const decrement = () => onChange(Math.max(value - step, min));

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    if (!isNaN(newValue)) {
      // Clamp value between min and max
      const clampedValue = Math.max(min, Math.min(max, newValue));
      // Round to nearest step
      const steppedValue = Math.round(clampedValue / step) * step;
      onChange(steppedValue);
    }
  };

  const sizeClasses = {
    small: {
      container: 'gap-1',
      button: 'w-5 h-5 text-xs',
      input: 'w-10 h-5 text-xs',
      preset: 'px-1.5 py-0.5 text-[10px]',
      label: 'text-[10px]',
    },
    medium: {
      container: 'gap-1.5',
      button: 'w-6 h-6 text-sm',
      input: 'w-12 h-6 text-sm',
      preset: 'px-2 py-1 text-xs',
      label: 'text-xs',
    },
    large: {
      container: 'gap-2',
      button: 'w-8 h-8 text-base',
      input: 'w-14 h-8 text-base',
      preset: 'px-2.5 py-1.5 text-sm',
      label: 'text-sm',
    },
  };

  const classes = sizeClasses[size];

  // Common preset values
  const presets = [0.5, 1, 2, 4];

  return (
    <div className={`duration-control ${className}`}>
      <div className={`flex items-center ${classes.container}`}>
        <label className={`font-medium text-gray-400 ${classes.label}`}>
          Duration
        </label>
        
        {/* Stepper */}
        <div className="flex items-center bg-black border border-gray-700 rounded overflow-hidden">
          <button
            onClick={decrement}
            disabled={value <= min}
            className={`${classes.button} flex items-center justify-center text-gray-300 hover:bg-gray-700 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors border-r border-gray-700`}
            title="Decrease duration"
          >
            −
          </button>
          <input
            type="number"
            value={value}
            onChange={handleInputChange}
            step={step}
            min={min}
            max={max}
            className={`${classes.input} text-center bg-transparent text-white focus:outline-none focus:bg-gray-800 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
            title={`Duration: ${value} beat${value !== 1 ? 's' : ''}`}
          />
          <button
            onClick={increment}
            disabled={value >= max}
            className={`${classes.button} flex items-center justify-center text-gray-300 hover:bg-gray-700 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors border-l border-gray-700`}
            title="Increase duration"
          >
            +
          </button>
        </div>

        {/* Beat label */}
        <span className={`text-gray-500 ${classes.label}`}>
          beat{value !== 1 ? 's' : ''}
        </span>

        {/* Note symbol */}
        {showNoteSymbols && (
          <span className={`text-gray-400 ${size === 'small' ? 'text-sm' : 'text-lg'}`} title={`${value} beat${value !== 1 ? 's' : ''}`}>
            {getNoteSymbol(value)}
          </span>
        )}
      </div>

      {/* Quick presets */}
      <div className={`flex items-center ${classes.container} mt-1.5`}>
        {presets.map((preset) => (
          <button
            key={preset}
            onClick={() => onChange(preset)}
            disabled={preset > max}
            className={`${classes.preset} rounded border transition-all ${
              value === preset
                ? 'bg-accent/20 border-accent text-accent'
                : 'bg-black border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white disabled:opacity-30'
            }`}
            title={`${preset} beat${preset !== 1 ? 's' : ''}`}
          >
            {getBeatLabel(preset)}
            {showNoteSymbols && (
              <span className="ml-0.5 opacity-60">{getNoteSymbol(preset)}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default DurationControl;
