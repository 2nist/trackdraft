import { HexLayer } from '../../../lib/harmony/hexagonal-layers-corrected';
import { calculateDissonance } from '../../../lib/harmony/dissonance';

interface DissonanceOverlayProps {
  layers: Record<string, HexLayer>;
  centerX: number;
  centerY: number;
}

export function DissonanceOverlay({ layers, centerX, centerY }: DissonanceOverlayProps) {
  return (
    <g className="dissonance-overlay" opacity="0.6">
      {Object.entries(layers).map(([layerName, layer]) => {
        if (layerName === 'root') return null;
        
        return layer.chords.map((node) => {
          const angle = node.angle - 90;
          const x = centerX + layer.radius * Math.cos(angle * Math.PI / 180);
          const y = centerY + layer.radius * Math.sin(angle * Math.PI / 180);
          
          const dissonance = calculateDissonance(node);
          const intensity = dissonance * 20;
          const color = dissonance > 0.6 ? '#DC143C' : 
                        dissonance > 0.3 ? '#FFA500' : 
                        '#4A90E2';
          
          if (dissonance < 0.2) return null;  // Don't show low dissonance
          
          return (
            <circle
              key={`${layerName}-${node.position}`}
              cx={x}
              cy={y}
              r={35 + (dissonance * 10)}
              fill="none"
              stroke={color}
              strokeWidth="2"
              opacity={dissonance}
              filter={`blur(${intensity}px)`}
              className="dissonance-halo"
            />
          );
        });
      })}
    </g>
  );
}

