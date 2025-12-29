import React, { useState, useRef, useCallback, useEffect } from "react";
import { Chord } from "../../types/music";
import {
  getCircleOfFifths,
  notesEqual,
  getNoteName,
  getNoteIndex,
} from "../../lib/harmony/keyUtils";
import { useSongStore } from "../../store/songStore";
import { NOTE_COLORS } from "./ChordShape";

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
}) => {
  const { currentSong, updateKey } = useSongStore();
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState<number | null>(null);
  const [isResizing, setIsResizing] = useState<{
    index: number;
    edge: "start" | "end";
  } | null>(null);
  const [dragStartAngle, setDragStartAngle] = useState(0);
  const [dragStartBeat, setDragStartBeat] = useState(0);
  const [localSegments, setLocalSegments] = useState<ChordSegment[]>([]);
  const [hoveredSegment, setHoveredSegment] = useState<number | null>(null);

  const currentKey = currentSong?.key || { root: "C", mode: "major" };
  const circleOfFifths = getCircleOfFifths();

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
  useEffect(() => {
    const segments: ChordSegment[] = [];
    let currentBeat = 0;

    progression.forEach((chord, index) => {
      const duration = Math.min(chord.beats || 2, totalBeats - currentBeat); // Ensure we don't exceed totalBeats
      if (duration > 0 && currentBeat < totalBeats) {
        segments.push({
          chord,
          index,
          startBeat: currentBeat,
          duration: duration,
        });
        currentBeat += duration;
      }
    });

    setLocalSegments(segments);
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

      // Snap to 0.5 beat increments for smoother editing
      const snappedBeat = Math.round(beatDelta * 2) / 2;
      if (Math.abs(snappedBeat) < 0.25) return; // Only update if moved at least 0.25 beats

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

          // Check for overlaps with other segments
          const hasOverlap = localSegments.some((otherSeg, idx) => {
            if (idx === isDragging) return false;
            const otherStart = otherSeg.startBeat;
            const otherEnd = otherSeg.startBeat + otherSeg.duration;
            const newEnd = newStartBeat + segment.duration;
            return newStartBeat < otherEnd && newEnd > otherStart;
          });

          if (!hasOverlap && newStartBeat !== segment.startBeat) {
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
          const minDuration = 0.5; // Minimum 0.5 beats

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

            // Check for overlaps
            const hasOverlap = localSegments.some((otherSeg, idx) => {
              if (idx === isResizing.index) return false;
              const otherStart = otherSeg.startBeat;
              const otherEnd = otherSeg.startBeat + otherSeg.duration;
              return segment.startBeat < otherEnd && newEnd > otherStart;
            });

            if (newDur >= minDuration && newEnd <= totalBeats && !hasOverlap) {
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
    ]
  );

  const handleMouseUp = useCallback(() => {
    if ((isDragging !== null || isResizing !== null) && onProgressionReorder) {
      // Update the actual progression when drag/resize ends
      // Sort segments by startBeat and update progression
      const sortedSegments = [...localSegments].sort(
        (a, b) => a.startBeat - b.startBeat
      );

      const updatedProgression: Chord[] = sortedSegments.map((segment) => ({
        ...segment.chord,
        beats: Math.round(segment.duration * 2) / 2, // Round to 0.5 beats
      }));

      // Call the reorder callback with the new progression
      onProgressionReorder(updatedProgression);
    } else if (isResizing !== null) {
      // If only resizing (no reorder callback), just update beats
      const segment = localSegments[isResizing.index];
      if (segment) {
        const newBeats = Math.round(segment.duration * 2) / 2;
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
  const keyCircleRadius = 160; // Outer radius for key selection circle

  return (
    <div className="relative w-full flex flex-col items-center pt-1 pb-2">
      {/* Combined Circle with Keys and Progression */}
      <div className="w-full flex flex-col items-center">
        <div
          ref={containerRef}
          className="relative w-[500px] h-[500px] flex items-center justify-center"
        >
          {/* Key Selection Circle (outer) */}
          <div className="absolute inset-0">
            {circleOfFifths.map((note, index) => {
              const angle = (index * 30 - 90) * (Math.PI / 180); // 30 degrees per note
              const radius = keyCircleRadius;
              const x = Math.cos(angle) * radius;
              const y = Math.sin(angle) * radius;
              const isSelected = notesEqual(note, currentKey.root);
              const isNatural = isNaturalNote(note);
              const noteColor = NOTE_COLORS[note] || NOTE_COLORS["C"];

              return (
                <button
                  key={note}
                  onClick={() => handleKeySelect(note)}
                  className={`absolute transform -translate-x-1/2 -translate-y-1/2 rounded-full font-semibold transition-all ${
                    isSelected
                      ? "scale-110 shadow-lg z-10"
                      : "z-0 hover:scale-105"
                  }`}
                  style={{
                    left: `calc(50% + ${x}px)`,
                    top: `calc(50% + ${y}px)`,
                    width: isSelected ? "48px" : "40px",
                    height: isSelected ? "48px" : "40px",
                    fontSize: isSelected ? "16px" : "14px",
                    background: noteColor,
                    border: isSelected
                      ? "3px solid #FF6B35"
                      : isNatural
                      ? "2px solid rgba(255,255,255,0.3)"
                      : "2px solid rgba(255,255,255,0.1)",
                    boxShadow: isSelected
                      ? "0 0 20px rgba(255, 107, 53, 0.5)"
                      : "none",
                    color: "#FFFFFF",
                    textShadow: "0 1px 3px rgba(0,0,0,0.8)",
                  }}
                  title={`${note} ${
                    currentKey.mode === "major" ? "Major" : "Minor"
                  }`}
                >
                  {note}
                </button>
              );
            })}
          </div>

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
