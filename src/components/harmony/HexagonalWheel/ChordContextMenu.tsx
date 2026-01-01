import { HexPosition } from '../../../lib/harmony/hexagonal-layers-corrected';
import './ChordContextMenu.css';

interface ChordContextMenuProps {
  node: HexPosition;
  position: { x: number; y: number };
  onClose: () => void;
  onExtend: (node: HexPosition) => void;
  onBorrow: (node: HexPosition) => void;
  onModulate: (node: HexPosition) => void;
  onSubstitute: (node: HexPosition) => void;
}

export function ChordContextMenu({
  node,
  position,
  onClose,
  onExtend,
  onBorrow,
  onModulate,
  onSubstitute,
}: ChordContextMenuProps) {
  
  return (
    <>
      {/* Backdrop to close menu */}
      <div 
        className="context-menu-backdrop"
        onClick={onClose}
        onContextMenu={(e) => e.preventDefault()}
      />
      
      {/* Context menu */}
      <div 
        className="context-menu"
        style={{
          position: 'fixed',
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
        onContextMenu={(e) => e.preventDefault()}
      >
        <div className="context-menu-header">
          <span className="context-menu-chord">{node.chord}</span>
          {node.romanNumeral && (
            <span className="context-menu-numeral">{node.romanNumeral}</span>
          )}
        </div>
        
        <div className="context-menu-divider" />
        
        <button
          type="button"
          className="context-menu-item"
          onClick={() => {
            onExtend(node);
            onClose();
          }}
        >
          <span className="menu-item-label">Extend</span>
          <span className="menu-item-hint">Add 7th, 9th, etc.</span>
        </button>
        
        <button
          type="button"
          className="context-menu-item"
          onClick={() => {
            onBorrow(node);
            onClose();
          }}
        >
          <span className="menu-item-label">Borrow</span>
          <span className="menu-item-hint">From parallel mode</span>
        </button>
        
        <button
          type="button"
          className="context-menu-item"
          onClick={() => {
            onModulate(node);
            onClose();
          }}
        >
          <span className="menu-item-label">Modulate</span>
          <span className="menu-item-hint">Shift to new key</span>
        </button>
        
        <button
          type="button"
          className="context-menu-item"
          onClick={() => {
            onSubstitute(node);
            onClose();
          }}
        >
          <span className="menu-item-label">Substitute</span>
          <span className="menu-item-hint">Functional replacement</span>
        </button>
      </div>
    </>
  );
}
