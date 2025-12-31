import { HexRing } from './HexRing';
import { RootNode } from './RootNode';
import { DissonanceOverlay } from './DissonanceOverlay';
import { LayerControls } from './LayerControls';
import { HoverTooltip } from './HoverTooltip';
import { useHexagonalWheel } from './useHexagonalWheel';
import { HexPosition, Mode } from '../../../lib/harmony/hexagonal-layers-corrected';
import './HexagonalWheel.css';

interface HexagonalWheelProps {
  rootPitch: number;     // 0-11
  mode: Mode;
  onChordSelect: (position: HexPosition) => void;
  onKeyChange?: (newRoot: number) => void;
}

export function HexagonalWheel({
  rootPitch,
  mode,
  onChordSelect,
  onKeyChange
}: HexagonalWheelProps) {
  
  const {
    activeLayer,
    setActiveLayer,
    showDissonance,
    setShowDissonance,
    hoveredNode,
    setHoveredNode,
    selectedNode,
    setSelectedNode,
    layers
  } = useHexagonalWheel(rootPitch, mode);
  
  return (
    <div className="hexagonal-wheel-container">
      
      {/* Layer Controls */}
      <LayerControls
        activeLayer={activeLayer}
        onLayerChange={setActiveLayer}
        showDissonance={showDissonance}
        onDissonanceToggle={setShowDissonance}
      />
      
      {/* SVG Canvas */}
      <svg 
        viewBox="0 0 1000 1000" 
        className="hexagonal-wheel-svg"
      >
        {/* Background reference circles (always visible, faint) */}
        {[60, 120, 180, 240, 300, 360].map(radius => (
          <circle
            key={radius}
            cx="500"
            cy="500"
            r={radius}
            fill="none"
            stroke="#333"
            strokeWidth="1"
            opacity="0.15"
            className="reference-circle"
          />
        ))}
        
        {/* All 6 rings (dimmed if not active) */}
        {Object.entries(layers).map(([layerName, layer]) => {
          if (layerName === 'root') return null;
          
          const isActive = layerName === activeLayer;
          const opacity = isActive ? 1.0 : 0.2;
          
          return (
            <HexRing
              key={layerName}
              layer={layer}
              centerX={500}
              centerY={500}
              isActive={isActive}
              opacity={opacity}
              showLabels={isActive}
              showDissonance={showDissonance}
              hoveredNode={hoveredNode}
              selectedNode={selectedNode}
              onNodeHover={setHoveredNode}
              onNodeClick={(node) => {
                setSelectedNode(node);
                
                // Circle of Fifths = key change
                if (layerName === 'circle-fifths' && onKeyChange) {
                  onKeyChange(node.pitchClass);
                } else {
                  onChordSelect(node);
                }
              }}
            />
          );
        })}
        
        {/* Root (always visible, always emphasized) */}
        <RootNode
          x={500}
          y={500}
          rootPitch={rootPitch}
          isSelected={selectedNode?.layer === 'root'}
          onClick={() => {
            setSelectedNode(layers.root.chords[0]);
            onChordSelect(layers.root.chords[0]);
          }}
        />
        
        {/* Dissonance overlay (if enabled) */}
        {showDissonance && (
          <DissonanceOverlay
            layers={layers}
            centerX={500}
            centerY={500}
          />
        )}
        
      </svg>
      
      {/* Hover tooltip */}
      {hoveredNode && (
        <HoverTooltip
          node={hoveredNode}
          activeLayer={activeLayer}
        />
      )}
      
    </div>
  );
}

