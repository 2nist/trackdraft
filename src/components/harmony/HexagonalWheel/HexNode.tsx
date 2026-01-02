import { HexPosition } from '../../../lib/harmony/hexagonal-layers-corrected';
import { calculateDissonance } from '../../../lib/harmony/dissonance';

interface HexNodeProps {
  x: number;
  y: number;
  node: HexPosition;
  isActive: boolean;
  isHovered: boolean;
  isSelected: boolean;
  showLabel: boolean;
  showDissonance: boolean;
  onHover: (hovering: boolean, event?: React.MouseEvent) => void;
  onClick: () => void;
  onRightClick?: (event: React.MouseEvent) => void;
}

export function HexNode({
  x,
  y,
  node,
  isActive,
  isHovered,
  isSelected,
  showLabel,
  showDissonance,
  onHover,
  onClick,
  onRightClick
}: HexNodeProps) {
  
  // Size based on state
  const baseSize = 32;
  const size = isHovered ? baseSize * 1.2 : isSelected ? baseSize * 1.1 : baseSize;
  
  // Calculate dissonance if needed
  const dissonance = showDissonance ? calculateDissonance(node) : 0;
  
  // Color based on layer
  const baseColor = node.color || getLayerColor(node.layer);
  
  // Glow based on dissonance
  const glowColor = dissonance > 0.6 ? '#DC143C' : 
                    dissonance > 0.3 ? '#FFA500' : 
                    baseColor;
  const glowIntensity = showDissonance ? dissonance * 15 : 
                        isHovered ? 10 : 
                        isSelected ? 8 : 0;
  
  // Opacity based on dissonance
  const opacity = showDissonance ? 0.4 + (dissonance * 0.6) : 1.0;
  
  return (
    <g
      className={`hex-node ${isActive ? 'active' : 'inactive'}`}
      onMouseEnter={isActive ? (e) => onHover(true, e.nativeEvent as unknown as React.MouseEvent) : undefined}
      onMouseLeave={isActive ? () => onHover(false) : undefined}
      onClick={isActive ? onClick : undefined}
      onContextMenu={isActive && onRightClick ? (e) => {
        e.preventDefault();
        e.stopPropagation();
        onRightClick(e as unknown as React.MouseEvent);
      } : undefined}
      style={{ cursor: isActive ? 'pointer' : 'default' }}
    >
      {/* Hexagon shape */}
      <polygon
        points={getHexagonPoints(x, y, size)}
        fill={baseColor}
        stroke={isSelected ? '#fff' : '#888'}
        strokeWidth={isSelected ? 3 : isHovered ? 2 : 1}
        opacity={opacity}
        filter={glowIntensity > 0 ? `drop-shadow(0 0 ${glowIntensity}px ${glowColor})` : 'none'}
        className="hex-shape"
      />
      
      {/* Labels (only if active) */}
      {showLabel && renderLabel(x, y, node)}
      
      {/* Selection indicator */}
      {isSelected && (
        <circle
          cx={x}
          cy={y}
          r={size + 5}
          fill="none"
          stroke="#fff"
          strokeWidth="2"
          opacity="0.8"
        />
      )}
      
    </g>
  );
}

// ----------------------------------------
// Helpers
// ----------------------------------------

function getHexagonPoints(x: number, y: number, size: number): string {
  const points = [];
  for (let i = 0; i < 6; i++) {
    // Flat-top hexagons (better concentric packing than pointy-top)
    const angle = (60 * i) * Math.PI / 180;
    const px = x + size * Math.cos(angle);
    const py = y + size * Math.sin(angle);
    points.push(`${px},${py}`);
  }
  return points.join(' ');
}

function renderLabel(x: number, y: number, node: HexPosition) {
  // Chromatic layer = split display
  if (node.layer === 'chromatic' && node.chord.includes('/')) {
    const [top, bottom] = node.chord.split(' / ');
    return (
      <>
        <text x={x} y={y - 8} textAnchor="middle" fill="#fff" fontSize="11" fontWeight="bold">
          {top}
        </text>
        <line x1={x - 15} y1={y} x2={x + 15} y2={y} stroke="#fff" strokeWidth="1" />
        <text x={x} y={y + 15} textAnchor="middle" fill="#fff" fontSize="11" fontWeight="bold">
          {bottom}
        </text>
      </>
    );
  }
  
  // Diatonic = pitch name only
  if (node.layer === 'diatonic') {
    return (
      <text x={x} y={y + 5} textAnchor="middle" fill="#fff" fontSize="16" fontWeight="bold">
        {node.chord}
      </text>
    );
  }
  
  // Extensions = chord symbol with badge
  if (node.layer === 'extensions') {
    const badge = node.chord.match(/7|9|11|13/)?.[0] || '';
    return (
      <>
        <text x={x} y={y} textAnchor="middle" fill="#fff" fontSize="14" fontWeight="bold">
          {node.chord.split(badge)[0]}
        </text>
        {badge && (
          <text x={x + 20} y={y - 10} textAnchor="middle" fill="#FFD700" fontSize="10">
            {badge}
          </text>
        )}
      </>
    );
  }
  
  // Borrowed = Roman numeral
  if (node.layer === 'borrowed') {
    return (
      <>
        <text x={x} y={y - 5} textAnchor="middle" fill="#fff" fontSize="14" fontWeight="bold">
          {node.romanNumeral}
        </text>
        <text x={x} y={y + 10} textAnchor="middle" fill="#ccc" fontSize="10">
          {node.chord}
        </text>
      </>
    );
  }
  
  // Substitutions = chord with arrow icon
  if (node.layer === 'substitutions') {
    return (
      <>
        <text x={x - 3} y={y} textAnchor="end" fill="#fff" fontSize="11">
          ⤷
        </text>
        <text x={x + 3} y={y + 5} textAnchor="start" fill="#fff" fontSize="12" fontWeight="bold">
          {node.chord}
        </text>
      </>
    );
  }
  
  // Circle of 5ths = key name
  if (node.layer === 'circle-fifths') {
    return (
      <text x={x} y={y + 5} textAnchor="middle" fill="#fff" fontSize="18" fontWeight="bold">
        {node.chord}
      </text>
    );
  }
  
  // Default
  return (
    <text x={x} y={y + 5} textAnchor="middle" fill="#fff" fontSize="13" fontWeight="bold">
      {node.chord}
    </text>
  );
}

function getLayerColor(layer: string): string {
  const colors: Record<string, string> = {
    'diatonic': '#4A90E2',
    'extensions': '#7ED321',
    'borrowed': '#F5A623',
    'substitutions': '#BD10E0',
    'circle-fifths': '#00D4FF',
    'chromatic': '#808080',
  };
  return colors[layer] || '#999';
}

