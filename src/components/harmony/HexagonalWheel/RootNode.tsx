import { PITCH_NAMES } from '../../../lib/harmony/constants';

interface RootNodeProps {
  x: number;
  y: number;
  rootPitch: number;
  isSelected: boolean;
  onClick: () => void;
}

export function RootNode({ x, y, rootPitch, isSelected, onClick }: RootNodeProps) {
  return (
    <g 
      className="root-node"
      onClick={onClick}
      style={{ cursor: 'pointer' }}
    >
      {/* Gradient background */}
      <defs>
        <radialGradient id="root-gradient">
          <stop offset="0%" stopColor="#667eea" />
          <stop offset="100%" stopColor="#764ba2" />
        </radialGradient>
      </defs>
      
      {/* Circle */}
      <circle
        cx={x}
        cy={y}
        r={isSelected ? 55 : 50}
        fill="url(#root-gradient)"
        stroke="#fff"
        strokeWidth={isSelected ? 4 : 3}
        filter="drop-shadow(0 4px 12px rgba(0,0,0,0.4))"
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

