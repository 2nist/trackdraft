import { LayerType } from '../../../lib/harmony/hexagonal-layers-corrected';
import './LayerControls.css';

interface LayerControlsProps {
  activeLayer: LayerType;
  onLayerChange: (layer: LayerType) => void;
  showDissonance: boolean;
  onDissonanceToggle: (show: boolean) => void;
}

export function LayerControls({
  activeLayer,
  onLayerChange,
  showDissonance,
  onDissonanceToggle
}: LayerControlsProps) {
  
  const layers: Array<{
    id: LayerType;
    label: string;
    icon: string;
    color: string;
    description: string;
  }> = [
    { 
      id: 'diatonic', 
      label: 'Diatonic', 
      icon: '🎵', 
      color: '#4A90E2',
      description: 'Scale tones'
    },
    { 
      id: 'extensions', 
      label: 'Extensions', 
      icon: '7️⃣', 
      color: '#7ED321',
      description: '7th chords'
    },
    { 
      id: 'borrowed', 
      label: 'Borrowed', 
      icon: '🎨', 
      color: '#F5A623',
      description: 'Modal interchange'
    },
    { 
      id: 'substitutions', 
      label: 'Subs', 
      icon: '🔀', 
      color: '#BD10E0',
      description: 'Functional subs'
    },
    { 
      id: 'circle-fifths', 
      label: 'Circle 5ths', 
      icon: '🔄', 
      color: '#00D4FF',
      description: 'Key relations'
    },
    { 
      id: 'chromatic', 
      label: 'Chromatic', 
      icon: '⚪', 
      color: '#808080',
      description: 'Raw pitches'
    },
  ];
  
  return (
    <div className="layer-controls">
      
      {/* Layer buttons */}
      <div className="layer-buttons">
        {layers.map(layer => (
          <button
            key={layer.id}
            className={`layer-button ${activeLayer === layer.id ? 'active' : ''}`}
            onClick={() => onLayerChange(layer.id)}
            style={{
              borderColor: activeLayer === layer.id ? layer.color : 'transparent',
              backgroundColor: activeLayer === layer.id ? `${layer.color}22` : '#2a2a3e'
            }}
            title={layer.description}
          >
            <span className="layer-label">{layer.label}</span>
          </button>
        ))}
      </div>
      
      {/* Dissonance toggle */}
      <label className="dissonance-toggle">
        <input
          type="checkbox"
          checked={showDissonance}
          onChange={e => onDissonanceToggle(e.target.checked)}
        />
        <span>Show Dissonance</span>
      </label>
      
    </div>
  );
}

