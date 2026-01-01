import { useState } from 'react';
import { HexRing } from './HexRing';
import { RootNode } from './RootNode';
import { HoverTooltip } from './HoverTooltip';
import { ProgressionDisplay } from './ProgressionDisplay';
import { ChordContextMenu } from './ChordContextMenu';
import { TheoryToolbar } from './TheoryToolbar';
import { useHexagonalWheel } from './useHexagonalWheel';
import { HexPosition, Mode } from '../../../lib/harmony/hexagonal-layers-corrected';
import { useSongStore } from '../../../store/songStore';
import { useToastStore } from '../../../store/toastStore';
import { useReaperConnection } from '../../../hooks/useReaperConnection';
import { reaperBridge } from '../../../lib/reaper-bridge';
import { romanNumeralToChord } from '../../../lib/harmony/keyUtils';
import { getAllSubstitutions } from '../../../lib/harmony/substitutions';
import { PITCH_NAMES } from '../../../lib/harmony/constants';
import './HexagonalWheel.css';

interface HexagonalWheelProps {
  rootPitch: number;
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
  
  const { currentSong, updateProgression, updateKey } = useSongStore();
  const { showSuccess, showError } = useToastStore();
  const { connected } = useReaperConnection();
  const [sending, setSending] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null);
  const [contextMenu, setContextMenu] = useState<{ node: HexPosition; position: { x: number; y: number } } | null>(null);

  const {
    hoveredNode,
    setHoveredNode,
    selectedNode,
    setSelectedNode,
    layers
  } = useHexagonalWheel(rootPitch, mode);

  // Only show diatonic layer
  const diatonicLayer = layers.diatonic;

  const handleRemoveChord = (index: number) => {
    if (!currentSong?.progression) return;
    const next = currentSong.progression.filter((_, i) => i !== index);
    updateProgression(next);
  };

  const handleClearProgression = () => {
    updateProgression([]);
  };

  const handleSendToReaper = async () => {
    if (!connected) {
      showError('Please connect to Reaper first. Make sure Reaper is running and the bridge script is loaded.');
      return;
    }
    if (!currentSong) {
      showError('No song loaded');
      return;
    }
    if (!currentSong.progression || currentSong.progression.length === 0) {
      showError('No progression to send. Create a progression first.');
      return;
    }

    setSending(true);
    try {
      const result = await reaperBridge.createChordTrack(currentSong);
      if (result.success) {
        showSuccess('Chord track created in Reaper!');
      } else {
        showError(`Error: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      showError(`Failed to send: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSending(false);
    }
  };

  // Context menu actions
  const handleExtend = (node: HexPosition) => {
    if (!currentSong || !node.romanNumeral) return;
    
    // Add 7th extension - use the extensions layer logic
    const baseChord = romanNumeralToChord(node.romanNumeral, currentSong.key);
    const extended = { ...baseChord };
    
    // Determine 7th quality based on chord function
    if (node.romanNumeral === 'I' || node.romanNumeral === 'IV') {
      // Major chords get maj7
      extended.name = extended.name?.replace(' Major', '') + 'maj7';
    } else if (node.romanNumeral === 'V') {
      // Dominant gets 7
      extended.name = extended.name?.replace(' Major', '') + '7';
    } else if (node.romanNumeral === 'vii°') {
      // Diminished gets half-diminished
      extended.name = extended.name?.replace(' diminished', '') + 'm7♭5';
    } else {
      // Minor chords get m7
      extended.name = extended.name?.replace(' minor', '') + 'm7';
    }
    
    updateProgression([...currentSong.progression, extended]);
    showSuccess(`Extended ${node.chord} to ${extended.name}`);
  };

  const handleBorrow = (node: HexPosition) => {
    if (!currentSong || !node.romanNumeral) return;
    
    // Get borrowed chord from parallel mode
    const parallelMode = currentSong.key.mode === 'major' ? 'minor' : 'major';
    
    // Common borrowed chords: in major, borrow bIII, bVI, bVII, iv from minor
    // In minor, borrow III, VI, VII, IV from major
    const borrowedMap: Record<string, { major: string; minor: string }> = {
      'I': { major: 'i', minor: 'I' },
      'ii': { major: 'ii°', minor: 'ii' },
      'iii': { major: 'III', minor: 'iii' },
      'IV': { major: 'iv', minor: 'IV' },
      'V': { major: 'v', minor: 'V' },
      'vi': { major: 'VI', minor: 'vi' },
      'vii°': { major: 'VII', minor: 'vii°' },
    };
    
    const mapping = borrowedMap[node.romanNumeral];
    if (!mapping) {
      showError(`Cannot borrow ${node.romanNumeral}`);
      return;
    }
    
    const parallelRoman = currentSong.key.mode === 'major' ? mapping.major : mapping.minor;
    
    try {
      const borrowedChord = romanNumeralToChord(parallelRoman, {
        root: currentSong.key.root,
        mode: parallelMode,
      });
      
      updateProgression([...currentSong.progression, borrowedChord]);
      showSuccess(`Borrowed ${borrowedChord.name} from ${parallelMode} mode`);
    } catch (error) {
      showError(`Cannot borrow ${node.romanNumeral} from ${parallelMode} mode`);
    }
  };

  const handleModulate = (node: HexPosition) => {
    if (!currentSong || !onKeyChange) return;
    
    // Change key to the chord's root
    onKeyChange(node.pitchClass);
    showSuccess(`Modulated to ${PITCH_NAMES[node.pitchClass]} ${mode}`);
  };

  const handleSubstitute = (node: HexPosition) => {
    if (!currentSong || !node.romanNumeral) return;
    
    // Get substitutions for this chord
    const baseChord = romanNumeralToChord(node.romanNumeral, currentSong.key);
    const subs = getAllSubstitutions(baseChord, currentSong.key);
    
    // Use first functional substitution if available
    const sub = subs.functional[0] || subs.commonTone[0] || subs.modalInterchange[0];
    if (sub) {
      updateProgression([...currentSong.progression, sub.chord]);
      showSuccess(`Substituted with ${sub.chord.name}`);
    } else {
      showError('No substitution available for this chord');
    }
  };

  const handleInsertProgression = (romans: string[]) => {
    if (!currentSong) return;
    
    const currentProg = currentSong.progression || [];
    const chords = romans.map(roman => romanNumeralToChord(roman, currentSong.key));
    updateProgression([...currentProg, ...chords]);
    showSuccess(`Inserted progression: ${romans.join(' - ')}`);
  };

  // Update tooltip position when hovering
  const handleNodeHover = (node: HexPosition | null, event?: React.MouseEvent) => {
    setHoveredNode(node);
    if (node && event) {
      const rect = event.currentTarget.getBoundingClientRect();
      setTooltipPosition({ x: event.clientX - rect.left, y: event.clientY - rect.top });
    } else {
      setTooltipPosition(null);
    }
  };

  const handleRightClick = (node: HexPosition, event: React.MouseEvent | MouseEvent) => {
    if (event.preventDefault) event.preventDefault();
    const mouseEvent = event as MouseEvent;
    setContextMenu({
      node,
      position: { 
        x: mouseEvent.clientX || 0, 
        y: mouseEvent.clientY || 0 
      },
    });
  };
  
  return (
    <div className="hexagonal-wheel-container">
      
      {/* Left: Hex Wheel */}
      <div className="wheel-section">
        <svg 
          viewBox="400 400 200 200" 
          className="hexagonal-wheel-svg"
        onMouseMove={(e) => {
          if (hoveredNode) {
            const rect = e.currentTarget.getBoundingClientRect();
            setTooltipPosition({
              x: e.clientX - rect.left,
              y: e.clientY - rect.top
            });
          }
        }}
      >
        {/* Background reference circle for diatonic */}
        <circle
          cx="500"
          cy="500"
          r={diatonicLayer.radius}
          fill="none"
          stroke="#333"
          strokeWidth="1"
          opacity="0.15"
          className="reference-circle"
        />
        
        {/* Diatonic ring only */}
        {diatonicLayer && (
          <HexRing
            layer={diatonicLayer}
            centerX={500}
            centerY={500}
            isActive={true}
            opacity={1}
            showLabels={true}
            showDissonance={false}
            hoveredNode={hoveredNode}
            selectedNode={selectedNode}
            onNodeHover={handleNodeHover}
            onNodeClick={(node) => {
              setSelectedNode(node);
              onChordSelect(node);
            }}
            onNodeRightClick={handleRightClick}
          />
        )}
        
        {/* Root (always visible) */}
        <RootNode
          x={500}
          y={500}
          rootPitch={rootPitch}
          isSelected={selectedNode?.layer === 'root'}
          onClick={() => {
            setSelectedNode(layers.root.chords[0]);
            onChordSelect(layers.root.chords[0]);
          }}
          onRightClick={(e) => {
            if (e.preventDefault) e.preventDefault();
            handleRightClick(layers.root.chords[0], e);
          }}
        />
        
        </svg>
        
        {/* Hover tooltip */}
        {hoveredNode && tooltipPosition && (
          <HoverTooltip
            node={hoveredNode}
            position={tooltipPosition}
          />
        )}

        {/* Right-click context menu */}
        {contextMenu && (
          <ChordContextMenu
            node={contextMenu.node}
            position={contextMenu.position}
            onClose={() => setContextMenu(null)}
            onExtend={handleExtend}
            onBorrow={handleBorrow}
            onModulate={handleModulate}
            onSubstitute={handleSubstitute}
          />
        )}
      </div>

      {/* Right: Progression + Theory Toolbar */}
      <div className="controls-section">
        {/* Progression Display */}
        <ProgressionDisplay
          progression={currentSong?.progression || []}
          onChordClick={handleRemoveChord}
          onClear={handleClearProgression}
        />

        {/* Theory Toolbar */}
        {currentSong && (
          <TheoryToolbar
            currentProgression={currentSong.progression || []}
            currentKey={currentSong.key}
            onInsertProgression={handleInsertProgression}
          />
        )}

        {/* Send to Reaper */}
        <div className="wheel-actions">
          <button
            type="button"
            className="wheel-action-button"
            onClick={handleSendToReaper}
            disabled={!connected || sending || !currentSong?.progression?.length}
            title={!connected ? 'Connect to Reaper first' : 'Send chord track to Reaper'}
          >
            {sending ? 'Sending...' : 'Send to Reaper'}
          </button>
        </div>
      </div>
      
    </div>
  );
}
