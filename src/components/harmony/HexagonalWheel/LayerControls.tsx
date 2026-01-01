import './LayerControls.css';
import { getLayerLabel, LAYER_ORDER } from './layerVisibility';
import { LayerType } from '../../../lib/harmony/hexagonal-layers-corrected';

interface LayerControlsProps {
  focusedLayer: LayerType;
  onLayerChange: (layer: LayerType) => void;
  showDissonance: boolean;
  onDissonanceToggle: (show: boolean) => void;
}

export function LayerControls({
  focusedLayer,
  onLayerChange,
  showDissonance,
  onDissonanceToggle
}: LayerControlsProps) {
  
  return (
    <div className="layer-controls">
      {/* Layer buttons - all visible for context */}
      <div className="layer-buttons">
        {LAYER_ORDER.map((layer) => {
          const isFocused = layer === focusedLayer;
          return (
            <button
              key={layer}
              type="button"
              className={`layer-button ${isFocused ? 'focused' : ''}`}
              onClick={() => onLayerChange(layer)}
              title={`Focus ${getLayerLabel(layer)} layer`}
            >
              {getLayerLabel(layer)}
            </button>
          );
        })}
      </div>
      
      {/* Dissonance toggle */}
      <label className="dissonance-toggle">
        <input
          type="checkbox"
          checked={showDissonance}
          onChange={(e) => onDissonanceToggle(e.target.checked)}
        />
        <span>Show Dissonance</span>
      </label>
    </div>
  );
}
