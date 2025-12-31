import { HexNode } from './HexNode';
import { HexLayer, HexPosition } from '../../../lib/harmony/hexagonal-layers-corrected';

interface HexRingProps {
  layer: HexLayer;
  centerX: number;
  centerY: number;
  isActive: boolean;
  opacity: number;
  showLabels: boolean;
  showDissonance: boolean;
  hoveredNode: HexPosition | null;
  selectedNode: HexPosition | null;
  onNodeHover: (node: HexPosition | null) => void;
  onNodeClick: (node: HexPosition) => void;
}

export function HexRing({
  layer,
  centerX,
  centerY,
  isActive,
  opacity,
  showLabels,
  showDissonance,
  hoveredNode,
  selectedNode,
  onNodeHover,
  onNodeClick
}: HexRingProps) {
  
  return (
    <g 
      className={`hex-ring hex-ring-${layer.layer}`}
      opacity={opacity}
    >
      {layer.chords.map((node) => {
        const angle = node.angle - 90;  // Rotate so 0° is top
        const x = centerX + layer.radius * Math.cos(angle * Math.PI / 180);
        const y = centerY + layer.radius * Math.sin(angle * Math.PI / 180);
        
        const isHovered = hoveredNode?.position === node.position && 
                          hoveredNode?.layer === node.layer;
        const isSelected = selectedNode?.position === node.position && 
                           selectedNode?.layer === node.layer;
        
        return (
          <HexNode
            key={node.position}
            x={x}
            y={y}
            node={node}
            isActive={isActive}
            isHovered={isHovered}
            isSelected={isSelected}
            showLabel={showLabels}
            showDissonance={showDissonance}
            onHover={() => onNodeHover(isHovered ? null : node)}
            onClick={() => onNodeClick(node)}
          />
        );
      })}
    </g>
  );
}

