import { useState, useEffect } from 'react';
import { LayerType, HexPosition, Mode } from '../../../lib/harmony/hexagonal-layers-corrected';
import { generateAllLayers } from '../../../lib/harmony/hexagonal-layers-corrected';

export function useHexagonalWheel(rootPitch: number, mode: Mode) {
  const [activeLayer, setActiveLayer] = useState<LayerType>('diatonic');
  const [showDissonance, setShowDissonance] = useState(false);
  const [hoveredNode, setHoveredNode] = useState<HexPosition | null>(null);
  const [selectedNode, setSelectedNode] = useState<HexPosition | null>(null);
  const [layers, setLayers] = useState(() => generateAllLayers(rootPitch, mode));
  
  // Regenerate layers when root or mode changes
  useEffect(() => {
    setLayers(generateAllLayers(rootPitch, mode));
  }, [rootPitch, mode]);
  
  return {
    activeLayer,
    setActiveLayer,
    showDissonance,
    setShowDissonance,
    hoveredNode,
    setHoveredNode,
    selectedNode,
    setSelectedNode,
    layers
  };
}

