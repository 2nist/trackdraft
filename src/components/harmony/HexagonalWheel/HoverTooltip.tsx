import { HexPosition } from '../../../lib/harmony/hexagonal-layers-corrected';
import { calculateDissonance } from '../../../lib/harmony/dissonance';
import './HoverTooltip.css';

interface HoverTooltipProps {
  node: HexPosition;
  position?: { x: number; y: number };
}

export function HoverTooltip({ node, position }: HoverTooltipProps) {
  
  const dissonance = calculateDissonance(node);
  
  const style: React.CSSProperties = position
    ? {
        position: 'fixed',
        left: `${position.x + 15}px`,
        top: `${position.y - 10}px`,
        transform: 'translateY(-100%)',
        pointerEvents: 'none',
        zIndex: 1000,
      }
    : {
        position: 'absolute',
        top: '20px',
        right: '20px',
      };
  
  return (
    <div className="hover-tooltip" style={style}>
      
      {/* Chromatic layer - neutral explanation */}
      {node.layer === 'chromatic' && (
        <>
          <h4>{node.chord}</h4>
          <p className="tooltip-description">
            Chromatic pitch
          </p>
          <p className="tooltip-detail">
            No harmonic role assigned
          </p>
        </>
      )}
      
      {/* Diatonic - simple */}
      {node.layer === 'diatonic' && (
        <>
          <h4>{node.chord}</h4>
          <p className="tooltip-description">
            Scale tone ({node.romanNumeral})
          </p>
        </>
      )}
      
      {/* Borrowed - show source */}
      {node.layer === 'borrowed' && (
        <>
          <h4>{node.romanNumeral}</h4>
          <p className="tooltip-chord">{node.chord}</p>
          <p className="tooltip-description">
            Borrowed from {node.source || 'parallel mode'}
          </p>
        </>
      )}
      
      {/* Extensions - show intervals */}
      {node.layer === 'extensions' && (
        <>
          <h4>{node.chord}</h4>
          <p className="tooltip-description">
            Extended harmony
          </p>
        </>
      )}
      
      {/* Substitutions - show what it replaces */}
      {node.layer === 'substitutions' && (
        <>
          <h4>{node.chord}</h4>
          <p className="tooltip-description">
            Substitutes for {node.substitutesFor || 'diatonic chord'}
          </p>
        </>
      )}
      
      {/* Circle of 5ths - modulation target */}
      {node.layer === 'circle-fifths' && (
        <>
          <h4>{node.chord}</h4>
          <p className="tooltip-description">
            Modulation to {node.chord} {node.romanNumeral}
          </p>
          <p className="tooltip-detail">
            Click to shift harmonic center
          </p>
        </>
      )}
      
      {/* Dissonance meter (if moderate/high) */}
      {dissonance > 0.3 && (
        <div className="dissonance-meter">
          <div className="meter-label">Tension:</div>
          <div className="meter-bar">
            <div 
              className="meter-fill"
              style={{ 
                width: `${dissonance * 100}%`,
                backgroundColor: dissonance > 0.6 ? '#DC143C' : '#FFA500'
              }}
            />
          </div>
        </div>
      )}
      
    </div>
  );
}

