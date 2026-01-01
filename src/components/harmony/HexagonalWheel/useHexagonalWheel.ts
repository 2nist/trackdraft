import { useState, useEffect } from 'react';
import { generateAllLayers, HexPosition, LayerType, Mode } from '../../../lib/harmony/hexagonal-layers-corrected';

export function useHexagonalWheel(rootPitch: number, mode: Mode) {
  // All layers visible, one can be "focused" for interaction
  const [focusedLayer, setFocusedLayer] = useState<LayerType>('diatonic');
  const [showDissonance, setShowDissonance] = useState(false);
  const [hoveredNode, setHoveredNode] = useState<HexPosition | null>(null);
  const [selectedNode, setSelectedNode] = useState<HexPosition | null>(null);
  const [layers, setLayers] = useState(() => generateAllLayers(rootPitch, mode));
  
  // Regenerate layers when root or mode changes
  useEffect(() => {
    setLayers(generateAllLayers(rootPitch, mode));
  }, [rootPitch, mode]);
  
  return {
    focusedLayer,
    setFocusedLayer,
    showDissonance,
    setShowDissonance,
    hoveredNode,
    setHoveredNode,
    selectedNode,
    setSelectedNode,
    layers
  };
}
