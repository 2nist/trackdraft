import { PITCH_NAMES } from '../../../lib/harmony/constants';

interface RootNodeProps {
  x: number;
  y: number;
  rootPitch: number;
  isSelected: boolean;
  onClick: () => void;
  onRightClick?: (event: React.MouseEvent) => void;
}

// Flat-top hexagon points generator (same as HexNode)
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

export function RootNode({ x, y, rootPitch, isSelected, onClick, onRightClick }: RootNodeProps) {
  // Center hexagon size (larger than regular nodes)
  const baseSize = 50;
  const size = isSelected ? baseSize * 1.1 : baseSize;
  
  return (
    <g 
      className="root-node"
      onClick={onClick}
      onContextMenu={onRightClick ? (e) => {
        e.preventDefault();
        onRightClick(e);
      } : undefined}
      style={{ cursor: 'pointer' }}
    >
      {/* Gradient background */}
      <defs>
        <linearGradient id="root-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#667eea" />
          <stop offset="100%" stopColor="#764ba2" />
        </linearGradient>
      </defs>
      
      {/* Hexagonal shape */}
      <polygon
        points={getHexagonPoints(x, y, size)}
        fill="url(#root-gradient)"
        stroke="#fff"
        strokeWidth={isSelected ? 4 : 3}
        filter="drop-shadow(0 4px 12px rgba(0,0,0,0.4))"
        className="root-hex-shape"
      />
      
      {/* Label */}
      <text
        x={x}
        y={y - 8}
        textAnchor="middle"
        fill="white"
        fontSize="28"
        fontWeight="bold"
      >
        I
      </text>
      
      <text
        x={x}
        y={y + 18}
        textAnchor="middle"
        fill="white"
        fontSize="20"
      >
        {PITCH_NAMES[rootPitch]}
      </text>
    </g>
  );
}

