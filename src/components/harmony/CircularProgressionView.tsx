import React, { useState, useRef, useCallback, useEffect } from "react";
import { Chord } from "../../types/music";
import {
  getKeyArrangement,
  notesEqual,
  getNoteName,
  getNoteIndex,
  type KeyArrangement,
} from "../../lib/harmony/keyUtils";
import { useSongStore } from "../../store/songStore";
import { NOTE_COLORS } from "./ChordShape";
import { DiatonicHexagon } from "./DiatonicHexagon";
import { ChordContextMenu } from "./ChordContextMenu";
import { extendChord, modifyChordQuality, addSuspension, transposeChord } from "../../lib/harmony/chordModifiers";

interface CircularProgressionViewProps {
  progression: Chord[];
  selectedIndex: number | null;
  onChordClick: (index: number) => void;
  onChordRemove: (index: number) => void;
  onBeatsChange: (index: number, beats: number) => void;
  onProgressionReorder?: (newProgression: Chord[]) => void;
  totalBeats: number; // Total beats for the progression (bars * beatsPerBar)
  radius?: number;
  onAddChord?: (chord: Chord) => void;
  isAddChordMode?: boolean;
  onChordModify?: (index: number, modifiedChord: Chord) => void;
}

interface ChordSegment {
  chord: Chord;
  index: number;
  startBeat: number;
  duration: number;
}

const CircularProgressionView: React.FC<CircularProgressionViewProps> = ({
  progression,
  selectedIndex,
  onChordClick,
  onChordRemove,
  onBeatsChange,
  onProgressionReorder,
  totalBeats,
  onAddChord,
  isAddChordMode = false,
  onChordModify,
}) => {
  const { currentSong, updateKey } = useSongStore();
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isUserEditingRef = useRef(false); // Track if user is actively editing
  const [isDragging, setIsDragging] = useState<number | null>(null);
  const [isResizing, setIsResizing] = useState<{
    index: number;
    edge: "start" | "end";
  } | null>(null);
  const [dragStartAngle, setDragStartAngle] = useState(0);
  const [dragStartBeat, setDragStartBeat] = useState(0);
  const [localSegments, setLocalSegments] = useState<ChordSegment[]>([]);
  const [hoveredSegment, setHoveredSegment] = useState<number | null>(null);
  const [keyArrangement, setKeyArrangement] = useState<KeyArrangement>('fifths');
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [chordContextMenu, setChordContextMenu] = useState<{ x: number; y: number; chordIndex: number } | null>(null);
  const [keyRotation, setKeyRotation] = useState(0);
  const [snapToGrid, setSnapToGrid] = useState(true); // Enable snap to grid by default
  const [snapIncrement, setSnapIncrement] = useState(1); // Snap to 1 beat increments

  const currentKey = currentSong?.key || { root: "C", mode: "major" };
  const keyOrder = getKeyArrangement(keyArrangement);
  
  // Calculate rotation to bring selected key to 12 o'clock
  useEffect(() => {
    const selectedIndex = keyOrder.findIndex(note => notesEqual(note, currentKey.root));
    if (selectedIndex !== -1) {
      // Current angle of selected key: (index * 30 - 90) degrees
      // To bring it to 12 o'clock (-90 degrees), rotate by: -90 - (index * 30 - 90) = -index * 30
      const targetRotation = -selectedIndex * 30;
      setKeyRotation(targetRotation);
    }
  }, [currentKey.root, keyOrder]);

  // Mode definitions with interval patterns and chord qualities
  // W = Whole step (tone), H = Half step (semitone)
  const modes: Array<{
    value:
      | "major"
      | "minor"
      | "dorian"
      | "phrygian"
      | "lydian"
      | "mixolydian"
      | "locrian";
    label: string;
    pattern: string[]; // W or H for each interval
    chordQualities: ("M" | "m" | "°" | "+")[]; // Major, minor, diminished, augmented
  }> = [
    {
      value: "major",
      label: "Major (Ionian)",
      pattern: ["W", "W", "H", "W", "W", "W", "H"],
      chordQualities: ["M", "m", "m", "M", "M", "m", "°"],
    },
    {
      value: "dorian",
      label: "Dorian",
      pattern: ["W", "H", "W", "W", "W", "H", "W"],
      chordQualities: ["m", "m", "M", "M", "m", "°", "M"],
    },
    {
      value: "phrygian",
      label: "Phrygian",
      pattern: ["H", "W", "W", "W", "H", "W", "W"],
      chordQualities: ["m", "M", "M", "m", "°", "M", "m"],
    },
    {
      value: "lydian",
      label: "Lydian",
      pattern: ["W", "W", "W", "H", "W", "W", "H"],
      chordQualities: ["M", "M", "m", "°", "M", "m", "m"],
    },
    {
      value: "mixolydian",
      label: "Mixolydian",
      pattern: ["W", "W", "H", "W", "W", "H", "W"],
      chordQualities: ["M", "m", "°", "M", "m", "m", "M"],
    },
    {
      value: "minor",
      label: "Minor (Aeolian)",
      pattern: ["W", "H", "W", "W", "H", "W", "W"],
      chordQualities: ["m", "°", "M", "m", "m", "M", "M"],
    },
    {
      value: "locrian",
      label: "Locrian",
      pattern: ["H", "W", "W", "H", "W", "W", "W"],
      chordQualities: ["°", "m", "m", "M", "m", "M", "M"],
    },
  ];

  // Helper to format chord name for display (e.g., "C Major" -> "C", "Am" -> "Am")
  const formatChordName = (chordName?: string): string => {
    if (!chordName) return "";
    // Extract just the root note and quality indicator
    // "C Major" -> "C", "A minor" -> "Am"
    if (chordName.includes("minor")) {
      const root = chordName.split(" ")[0];
      return root.includes("#") || root.includes("b")
        ? root + "m"
        : root.toLowerCase() + "m";
    }
    if (chordName.includes("diminished")) {
      const root = chordName.split(" ")[0];
      return root + "°";
    }
    // Major chords - just show root note (uppercase)
    return chordName.split(" ")[0];
  };

  const handleKeySelect = (root: string) => {
    updateKey({ root, mode: currentKey.mode });
  };

  const isNaturalNote = (note: string): boolean => {
    return !note.includes("#") && !note.includes("b");
  };

  // Initialize segments based on progression
  // Preserve existing startBeat positions when possible to allow gaps
  useEffect(() => {
    // Skip if user is actively editing (dragging/resizing)
    if (isUserEditingRef.current) {
      return;
    }

    // If we have existing segments and the progression length matches, try to preserve positions
    setLocalSegments((prevSegments) => {
      if (prevSegments.length > 0 && prevSegments.length === progression.length) {
        // Check if chords match by index (same roman numeral)
        const chordsMatch = progression.every((chord, index) => {
          const existingSegment = prevSegments[index];
          return existingSegment && existingSegment.chord.romanNumeral === chord.romanNumeral;
        });

        if (chordsMatch) {
          // Update segments with new chord data but preserve startBeat positions
          const updatedSegments = progression.map((chord, index) => {
            const existingSegment = prevSegments[index];
            const duration = Math.min(chord.beats || 2, totalBeats - existingSegment.startBeat);
            return {
              chord,
              index,
              startBeat: existingSegment.startBeat, // Preserve position
              duration: duration > 0 ? duration : existingSegment.duration,
            };
          });
          return updatedSegments;
        }
      }

      // Otherwise, initialize sequentially (first time or structure changed)
      const segments: ChordSegment[] = [];
      let currentBeat = 0;

      progression.forEach((chord, index) => {
        const duration = Math.min(chord.beats || 2, totalBeats - currentBeat);
        if (duration > 0 && currentBeat < totalBeats) {
          segments.push({
            chord,
            index,
            startBeat: currentBeat,
            duration: duration,
          });
          currentBeat += duration; // Sequential positioning only on initial load
        }
      });

      return segments;
    });
  }, [progression, totalBeats]);

  // Convert beat to angle (0 = top, clockwise)
  const beatToAngle = useCallback(
    (beat: number) => {
      return (beat / totalBeats) * 360 - 90; // -90 to start at top
    },
    [totalBeats]
  );

  // Convert angle to beat
  const angleToBeat = useCallback(
    (angle: number) => {
      const normalizedAngle = (((angle + 90) % 360) + 360) % 360;
      return (normalizedAngle / 360) * totalBeats;
    },
    [totalBeats]
  );

  // Convert angle to radians
  const degToRad = (deg: number) => (deg * Math.PI) / 180;

  // Calculate SVG path for chord segment (arc)
  const getChordArcPath = useCallback(
    (startBeat: number, duration: number, radius: number) => {
      const startAngle = beatToAngle(startBeat);
      const endAngle = beatToAngle(startBeat + duration);
      const startRad = degToRad(startAngle);
      const endRad = degToRad(endAngle);

      const centerX = 130;
      const centerY = 130;

      const x1 = centerX + radius * Math.cos(startRad);
      const y1 = centerY + radius * Math.sin(startRad);
      const x2 = centerX + radius * Math.cos(endRad);
      const y2 = centerY + radius * Math.sin(endRad);

      const largeArcFlag = duration > totalBeats / 2 ? 1 : 0;

      return `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
    },
    [beatToAngle, totalBeats]
  );

  // Handle mouse/touch events for dragging
  const getAngleFromEvent = useCallback((clientX: number, clientY: number) => {
    if (!svgRef.current) return 0;
    const rect = svgRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const x = clientX - centerX;
    const y = clientY - centerY;

    return (Math.atan2(y, x) * 180) / Math.PI;
  }, []);

  const handleSegmentMouseDown = (
    segmentIndex: number,
    e: React.MouseEvent<SVGPathElement>
  ) => {
    e.preventDefault();
    isUserEditingRef.current = true; // User started editing
    setIsDragging(segmentIndex);
    const segment = localSegments[segmentIndex];
    setDragStartBeat(segment.startBeat);
    setDragStartAngle(getAngleFromEvent(e.clientX, e.clientY));
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if ((isDragging === null && isResizing === null) || !svgRef.current)
        return;

      const clientX =
        "touches" in e
          ? (e as TouchEvent).touches[0]?.clientX
          : (e as MouseEvent).clientX;
      const clientY =
        "touches" in e
          ? (e as TouchEvent).touches[0]?.clientY
          : (e as MouseEvent).clientY;

      if (clientX === undefined || clientY === undefined) return;

      const currentAngle = getAngleFromEvent(clientX, clientY);
      const currentBeat = angleToBeat(currentAngle);
      const beatDelta = currentBeat - dragStartBeat;

      // Snap to beat grid if enabled
      let snappedBeat = beatDelta;
      if (snapToGrid) {
        // Snap to the nearest grid increment
        snappedBeat = Math.round(beatDelta / snapIncrement) * snapIncrement;
      } else {
        // Fine positioning: snap to 0.25 beat increments when grid is off
        snappedBeat = Math.round(beatDelta * 4) / 4;
      }
      
      // Only update if moved at least half the snap increment
      const minMove = snapToGrid ? snapIncrement * 0.5 : 0.125;
      if (Math.abs(snappedBeat) < minMove) return;

      // Handle dragging (moving) a chord segment
      if (isDragging !== null) {
        const segment = localSegments[isDragging];
        if (segment) {
          // Calculate new start beat, ensuring it doesn't go negative and leaves room for duration
          let newStartBeat = segment.startBeat + snappedBeat;
          newStartBeat = Math.max(
            0,
            Math.min(totalBeats - segment.duration, newStartBeat)
          );

          // Allow free positioning - only check if new position is valid
          // (Allow gaps and overlaps - user has full control)
          if (newStartBeat !== segment.startBeat) {
            const updatedSegments = [...localSegments];
            updatedSegments[isDragging] = {
              ...segment,
              startBeat: newStartBeat,
            };
            setLocalSegments(updatedSegments);
            setDragStartBeat(newStartBeat);
            setDragStartAngle(currentAngle);
          }
        }
      }

      // Handle resizing (lengthening/shortening) a chord segment
      if (isResizing !== null) {
        const segment = localSegments[isResizing.index];
        if (segment) {
          const minDuration = snapToGrid ? snapIncrement : 0.25; // Minimum duration based on snap

          let newStartBeat = segment.startBeat;
          let newDuration = segment.duration;

          if (isResizing.edge === "start") {
            // Resizing from the start edge
            const newStart = Math.max(0, dragStartBeat + snappedBeat);
            const newDur = segment.duration - (newStart - segment.startBeat);

            // Check for overlaps
            const hasOverlap = localSegments.some((otherSeg, idx) => {
              if (idx === isResizing.index) return false;
              const otherStart = otherSeg.startBeat;
              const otherEnd = otherSeg.startBeat + otherSeg.duration;
              const newEnd = newStart + newDur;
              return newStart < otherEnd && newEnd > otherStart;
            });

            if (newDur >= minDuration && newStart >= 0 && !hasOverlap) {
              newStartBeat = newStart;
              newDuration = newDur;
            }
          } else {
            // Resizing from the end edge
            const newEnd = Math.min(totalBeats, dragStartBeat + snappedBeat);
            const newDur = newEnd - segment.startBeat;

            // Allow free positioning - no overlap check
            if (newDur >= minDuration && newEnd <= totalBeats) {
              newDuration = newDur;
            }
          }

          if (
            newDuration !== segment.duration ||
            newStartBeat !== segment.startBeat
          ) {
            const updatedSegments = [...localSegments];
            updatedSegments[isResizing.index] = {
              ...segment,
              startBeat: newStartBeat,
              duration: newDuration,
            };
            setLocalSegments(updatedSegments);

            const edgeBeat =
              isResizing.edge === "start"
                ? newStartBeat
                : newStartBeat + newDuration;
            setDragStartBeat(edgeBeat);
            setDragStartAngle(currentAngle);
          }
        }
      }
    },
    [
      isDragging,
      isResizing,
      dragStartBeat,
      dragStartAngle,
      localSegments,
      getAngleFromEvent,
      angleToBeat,
      totalBeats,
      snapToGrid,
      snapIncrement,
    ]
  );

  const handleMouseUp = useCallback(() => {
    isUserEditingRef.current = false; // User finished editing
    
    if ((isDragging !== null || isResizing !== null) && onProgressionReorder) {
      // Update the actual progression when drag/resize ends
      // Keep segments in their current order (don't sort) to preserve user's arrangement
      // This allows gaps and custom positioning
      const updatedProgression: Chord[] = localSegments.map((segment) => ({
        ...segment.chord,
        beats: snapToGrid
          ? Math.round(segment.duration / snapIncrement) * snapIncrement
          : Math.round(segment.duration * 4) / 4,
      }));

      // Call the reorder callback with the new progression
      // Note: We're not sorting by startBeat - preserving user's arrangement
      onProgressionReorder(updatedProgression);
    } else if (isResizing !== null) {
      // If only resizing (no reorder callback), just update beats
      const segment = localSegments[isResizing.index];
      if (segment) {
        const newBeats = snapToGrid
          ? Math.round(segment.duration / snapIncrement) * snapIncrement
          : Math.round(segment.duration * 4) / 4;
        onBeatsChange(isResizing.index, newBeats);
      }
    }

    setIsDragging(null);
    setIsResizing(null);
  }, [
    isDragging,
    isResizing,
    localSegments,
    onProgressionReorder,
    onBeatsChange,
    snapToGrid,
    snapIncrement,
  ]);

  useEffect(() => {
    if (isDragging !== null || isResizing !== null) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchmove", handleMouseMove);
      window.addEventListener("touchend", handleMouseUp);

      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
        window.removeEventListener("touchmove", handleMouseMove);
        window.removeEventListener("touchend", handleMouseUp);
      };
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

  // Color based on function
  const functionColors: Record<string, { fill: string; stroke: string }> = {
    tonic: { fill: "#000000", stroke: "#000000" }, // black
    subdominant: { fill: "#10b981", stroke: "#059669" }, // green
    dominant: { fill: "#ef4444", stroke: "#dc2626" }, // red
  };

  if (progression.length === 0) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="w-80 h-80 mx-auto border-2 border-dashed border-gray-700 rounded-full flex items-center justify-center">
            <p className="text-gray-500">
              Add chords to see circular progression
            </p>
          </div>
        </div>
      </div>
    );
  }

  const innerRadius = 70;
  const outerRadius = 105;
  const midRadius = (innerRadius + outerRadius) / 2;
  const beatMarkerRadius = 110;
  const keyCircleRadius = 200; // Outer radius for key selection circle (increased for better spacing)

  return (
    <div className="relative w-full flex flex-col items-center pt-1 pb-2">
      {/* Combined Circle with Keys and Progression */}
      <div className="w-full flex flex-col items-center">
        <div
          ref={containerRef}
          className="relative w-[500px] h-[500px] flex items-center justify-center"
          onContextMenu={(e) => {
            // Only show context menu if clicking on the background, not on a key button
            if ((e.target as HTMLElement).tagName !== 'BUTTON') {
              e.preventDefault();
              setContextMenu({ x: e.clientX, y: e.clientY });
            }
          }}
        >
          {/* Key Selection Circle (outer) */}
          <div 
            className="absolute inset-0"
            style={{
              transform: `rotate(${keyRotation}deg)`,
              transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
              transformOrigin: 'center center',
            }}
            onContextMenu={(e) => {
              // Show context menu when right-clicking on empty space in the key circle area
              if ((e.target as HTMLElement).tagName !== 'BUTTON') {
                e.preventDefault();
                e.stopPropagation();
                setContextMenu({ x: e.clientX, y: e.clientY });
              }
            }}
          >
            {keyOrder.map((note, index) => {
              const angle = (index * 30 - 90) * (Math.PI / 180); // 30 degrees per note
              const radius = keyCircleRadius;
              const x = Math.cos(angle) * radius;
              const y = Math.sin(angle) * radius;
              const isSelected = notesEqual(note, currentKey.root);
              const isNatural = isNaturalNote(note);
              const noteColor = NOTE_COLORS[note] || NOTE_COLORS["C"];

              // When selected, the hexagon shows at 12 o'clock, so make the button more subtle
              // The selected key rotates to 12 o'clock, so make it smaller and more transparent
              return (
                <button
                  key={note}
                  onClick={() => handleKeySelect(note)}
                  onContextMenu={(e) => {
                    // Allow right-click on buttons to show context menu
                    e.preventDefault();
                    e.stopPropagation();
                    setContextMenu({ x: e.clientX, y: e.clientY });
                  }}
                  className={`absolute rounded font-semibold transition-all ${
                    isSelected
                      ? "z-30" // Higher than hexagon to ensure it's clickable
                      : "z-30 hover:scale-105" // All keys need high z-index to be clickable above hexagon
                  }`}
                  style={{
                    left: `calc(50% + ${x}px)`,
                    top: `calc(50% + ${y}px)`,
                    width: isSelected ? "36px" : "40px", // Smaller when selected (hexagon shows info)
                    height: isSelected ? "36px" : "40px",
                    fontSize: "14px", // Same size text for all
                    background: isSelected ? "rgba(0, 0, 0, 0.4)" : "transparent",
                    border: isSelected
                      ? `2px solid ${noteColor}70` // More transparent border
                      : `2px solid ${noteColor}`,
                    boxShadow: "none", // No glow - hexagon is prominent when selected
                    color: "#FFFFFF",
                    opacity: isSelected ? 0.7 : 1, // More transparent when selected
                    textShadow: "0 1px 3px rgba(0,0,0,0.8)",
                    transform: `translate(-50%, -50%) rotate(${-keyRotation}deg)`,
                    transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                  title={`${note} ${
                    currentKey.mode === "major" ? "Major" : "Minor"
                  }`}
                >
                  {!isSelected && note}
                </button>
              );
            })}
          </div>
          
          {/* Diatonic Chord Hexagon - Positioned under selected key */}
          <DiatonicHexagon
            currentKey={currentKey}
            onChordSelect={onAddChord || (() => {})}
            keyCircleRadius={keyCircleRadius}
            keyRotation={keyRotation}
            keyOrder={keyOrder}
          />
          
          {/* Chord Context Menu */}
          {chordContextMenu && onChordModify && (
            <ChordContextMenu
              x={chordContextMenu.x}
              y={chordContextMenu.y}
              chord={localSegments[chordContextMenu.chordIndex]?.chord || progression[chordContextMenu.chordIndex]}
              onClose={() => setChordContextMenu(null)}
              onExtend={(extension) => {
                const chord = localSegments[chordContextMenu.chordIndex]?.chord || progression[chordContextMenu.chordIndex];
                const modified = extendChord(chord, extension);
                onChordModify(chordContextMenu.chordIndex, modified);
              }}
              onModifyQuality={(quality) => {
                const chord = localSegments[chordContextMenu.chordIndex]?.chord || progression[chordContextMenu.chordIndex];
                const modified = modifyChordQuality(chord, quality);
                onChordModify(chordContextMenu.chordIndex, modified);
              }}
              onAddSuspension={(suspension) => {
                const chord = localSegments[chordContextMenu.chordIndex]?.chord || progression[chordContextMenu.chordIndex];
                const modified = addSuspension(chord, suspension);
                onChordModify(chordContextMenu.chordIndex, modified);
              }}
              onTranspose={(direction) => {
                const chord = localSegments[chordContextMenu.chordIndex]?.chord || progression[chordContextMenu.chordIndex];
                const modified = transposeChord(chord, direction);
                onChordModify(chordContextMenu.chordIndex, modified);
              }}
            />
          )}

          {/* Key Arrangement Context Menu */}
          {contextMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setContextMenu(null)}
              />
              <div
                className="fixed z-50 bg-black border border-gray-700 rounded-lg shadow-xl py-1 min-w-[160px]"
                style={{
                  left: `${contextMenu.x}px`,
                  top: `${contextMenu.y}px`,
                }}
              >
                <button
                  onClick={() => {
                    setKeyArrangement('fifths');
                    setContextMenu(null);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-800 transition-colors ${
                    keyArrangement === 'fifths' ? 'text-accent' : 'text-white'
                  }`}
                >
                  Circle of Fifths
                </button>
                <button
                  onClick={() => {
                    setKeyArrangement('fourths');
                    setContextMenu(null);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-800 transition-colors ${
                    keyArrangement === 'fourths' ? 'text-accent' : 'text-white'
                  }`}
                >
                  Circle of Fourths
                </button>
                <button
                  onClick={() => {
                    setKeyArrangement('sixths');
                    setContextMenu(null);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-800 transition-colors ${
                    keyArrangement === 'sixths' ? 'text-accent' : 'text-white'
                  }`}
                >
                  Circle of Sixths
                </button>
                <button
                  onClick={() => {
                    setKeyArrangement('chromatic');
                    setContextMenu(null);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-800 transition-colors ${
                    keyArrangement === 'chromatic' ? 'text-accent' : 'text-white'
                  }`}
                >
                  Chromatic
                </button>
              </div>
            </>
          )}

          {/* Circular Timeline (inner) */}
          <svg
            ref={svgRef}
            width="260"
            height="260"
            viewBox="0 0 260 260"
            className="cursor-pointer relative z-20"
          >
            {/* Background circle */}
            <circle
              cx="130"
              cy="130"
              r={outerRadius}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-gray-700"
            />

            {/* Beat markers */}
            {Array.from({ length: Math.ceil(totalBeats) }).map((_, beat) => {
              const angle = beatToAngle(beat);
              const rad = degToRad(angle);
              const x1 = 130 + innerRadius * Math.cos(rad);
              const y1 = 130 + innerRadius * Math.sin(rad);
              const x2 = 130 + beatMarkerRadius * Math.cos(rad);
              const y2 = 130 + beatMarkerRadius * Math.sin(rad);

              // Mark every 2 beats more prominently
              const isBeatMarker = beat % 2 === 0;

              return (
                <line
                  key={beat}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="currentColor"
                  strokeWidth={isBeatMarker ? 2 : 1}
                  className={
                    isBeatMarker ? "text-gray-600" : "text-gray-700 opacity-50"
                  }
                />
              );
            })}

            {/* Chord segments */}
            {localSegments.map((segment, idx) => {
              const color = functionColors[segment.chord.function] || {
                fill: "#6366f1",
                stroke: "#4f46e5",
              };
              const isDraggingActive = isDragging === idx;
              const isResizingActive = isResizing?.index === idx;
              const isHovered = hoveredSegment === idx;
              const isSelected = selectedIndex === idx;

              // Calculate positions for resize handles
              const startAngle = beatToAngle(segment.startBeat);
              const endAngle = beatToAngle(
                segment.startBeat + segment.duration
              );
              const startRad = degToRad(startAngle);
              const endRad = degToRad(endAngle);

              const startHandleX = 130 + midRadius * Math.cos(startRad);
              const startHandleY = 130 + midRadius * Math.sin(startRad);
              const endHandleX = 130 + midRadius * Math.cos(endRad);
              const endHandleY = 130 + midRadius * Math.sin(endRad);

              return (
                <g key={idx}>
                  {/* Chord arc path - using note color */}
                  <path
                    d={getChordArcPath(
                      segment.startBeat,
                      segment.duration,
                      midRadius
                    )}
                    fill={
                      NOTE_COLORS[segment.chord.name?.split(" ")[0] || "C"] ||
                      color.fill
                    }
                    fillOpacity={
                      isDraggingActive ||
                      isResizingActive ||
                      isHovered ||
                      isSelected
                        ? 0.8
                        : 0.6
                    }
                    stroke={isSelected ? "#f97316" : color.stroke}
                    strokeWidth={
                      isDraggingActive || isResizingActive || isSelected
                        ? 3
                        : isHovered
                        ? 2.5
                        : 2
                    }
                    className={
                      isDraggingActive ? "cursor-grabbing" : "cursor-grab"
                    }
                    onMouseDown={(e) => handleSegmentMouseDown(idx, e)}
                    onMouseEnter={() => setHoveredSegment(idx)}
                    onMouseLeave={() => setHoveredSegment(null)}
                    onClick={(e) => {
                      e.stopPropagation();
                      onChordClick(idx);
                    }}
                    onContextMenu={(e) => {
                      if (onChordModify) {
                        e.preventDefault();
                        e.stopPropagation();
                        setChordContextMenu({
                          x: e.clientX,
                          y: e.clientY,
                          chordIndex: idx,
                        });
                      }
                    }}
                  />

                  {/* Resize handle - Start edge */}
                  <circle
                    cx={startHandleX}
                    cy={startHandleY}
                    r={
                      isResizing?.index === idx && isResizing.edge === "start"
                        ? 6
                        : 4
                    }
                    fill={isSelected ? "#f97316" : color.stroke}
                    stroke="white"
                    strokeWidth="1.5"
                    className="cursor-ew-resize"
                    style={{
                      opacity:
                        isHovered || isResizing?.index === idx || isSelected
                          ? 1
                          : 0.7,
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsResizing({ index: idx, edge: "start" });
                      const edgeBeat = segment.startBeat;
                      setDragStartBeat(edgeBeat);
                      setDragStartAngle(
                        getAngleFromEvent(e.clientX, e.clientY)
                      );
                    }}
                  />

                  {/* Resize handle - End edge */}
                  <circle
                    cx={endHandleX}
                    cy={endHandleY}
                    r={
                      isResizing?.index === idx && isResizing.edge === "end"
                        ? 6
                        : 4
                    }
                    fill={isSelected ? "#f97316" : color.stroke}
                    stroke="white"
                    strokeWidth="1.5"
                    className="cursor-ew-resize"
                    style={{
                      opacity:
                        isHovered || isResizing?.index === idx || isSelected
                          ? 1
                          : 0.7,
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      isUserEditingRef.current = true; // User started editing
                      setIsResizing({ index: idx, edge: "end" });
                      const edgeBeat = segment.startBeat + segment.duration;
                      setDragStartBeat(edgeBeat);
                      setDragStartAngle(
                        getAngleFromEvent(e.clientX, e.clientY)
                      );
                    }}
                  />

                  {/* Chord label - show both roman numeral and chord name more clearly */}
                  {segment.duration >= 0.5 && (
                    <g>
                      {/* Background circle for better readability */}
                      <circle
                        cx={
                          130 +
                          (midRadius + 18) *
                            Math.cos(
                              degToRad(
                                beatToAngle(
                                  segment.startBeat + segment.duration / 2
                                )
                              )
                            )
                        }
                        cy={
                          130 +
                          (midRadius + 18) *
                            Math.sin(
                              degToRad(
                                beatToAngle(
                                  segment.startBeat + segment.duration / 2
                                )
                              )
                            )
                        }
                        r="20"
                        fill="rgba(0, 0, 0, 0.7)"
                        stroke={
                          isSelected ? "#f97316" : "rgba(255, 255, 255, 0.3)"
                        }
                        strokeWidth={isSelected ? 2 : 1}
                      />
                      {/* Chord letter name - larger and more prominent */}
                      <text
                        x={
                          130 +
                          (midRadius + 18) *
                            Math.cos(
                              degToRad(
                                beatToAngle(
                                  segment.startBeat + segment.duration / 2
                                )
                              )
                            )
                        }
                        y={
                          130 +
                          (midRadius + 18) *
                            Math.sin(
                              degToRad(
                                beatToAngle(
                                  segment.startBeat + segment.duration / 2
                                )
                              )
                            ) -
                          4
                        }
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="font-bold fill-white pointer-events-none select-none"
                        style={{ fontSize: "14px", fontWeight: "700" }}
                      >
                        {formatChordName(segment.chord.name)}
                      </text>
                      {/* Roman numeral - smaller below */}
                      <text
                        x={
                          130 +
                          (midRadius + 18) *
                            Math.cos(
                              degToRad(
                                beatToAngle(
                                  segment.startBeat + segment.duration / 2
                                )
                              )
                            )
                        }
                        y={
                          130 +
                          (midRadius + 18) *
                            Math.sin(
                              degToRad(
                                beatToAngle(
                                  segment.startBeat + segment.duration / 2
                                )
                              )
                            ) +
                          10
                        }
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="font-semibold fill-gray-300 pointer-events-none select-none"
                        style={{ fontSize: "10px" }}
                      >
                        {segment.chord.romanNumeral}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}

            {/* Center circle */}
            <circle
              cx="130"
              cy="130"
              r={innerRadius - 5}
              fill="currentColor"
              className="text-gray-900"
            />

            {/* Center text */}
            <text
              x="130"
              y="110"
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-base font-bold fill-white"
            >
              {getNoteName(getNoteIndex(currentKey.root), false)}
            </text>
            <text
              x="130"
              y="125"
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-xs fill-gray-300"
            >
              {modes.find((m) => m.value === currentKey.mode)?.label ||
                currentKey.mode}
            </text>
            <text
              x="130"
              y="140"
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-xs fill-gray-500"
            >
              {totalBeats} beats
            </text>
            <text
              x="130"
              y="155"
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-xs fill-gray-500"
            >
              {progression.length} chords
            </text>
          </svg>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-1 text-xs text-gray-500 text-center">
        <p className="text-[10px]">
          <strong>Move:</strong> Drag chord • <strong>Resize:</strong> Drag
          edges
        </p>
      </div>
    </div>
  );
};

export default CircularProgressionView;
