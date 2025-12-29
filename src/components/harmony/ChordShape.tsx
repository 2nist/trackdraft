import React from "react";

// Note colors - ColorMusic Inspired palette
// One-to-one mapping: single color per pitch class to avoid ambiguity
const NOTE_COLORS: Record<string, string> = {
  C: "#E53935",
  "C#": "#FF7043",
  Db: "#FF7043",
  D: "#FFEB3B",
  "D#": "#C0CA33",
  Eb: "#C0CA33",
  E: "#8BC34A",
  F: "#009688",
  "F#": "#00BCD4",
  Gb: "#00BCD4",
  G: "#2196F3",
  "G#": "#3F51B5",
  Ab: "#3F51B5",
  A: "#9C27B0",
  "A#": "#E91E63",
  Bb: "#E91E63",
  B: "#FF9800",
};

// Chord quality shapes
const CHORD_SHAPES: Record<
  string,
  { shape: string; svgPath: string; reason: string }
> = {
  major: {
    shape: "circle",
    svgPath: "M 50 5 A 45 45 0 1 1 50 95 A 45 45 0 1 1 50 5",
    reason: "Stable, complete, universally positive",
  },
  minor: {
    shape: "square",
    svgPath: "M 5 5 L 95 5 L 95 95 L 5 95 Z",
    reason: "Grounded, stable but darker emotion",
  },
  diminished: {
    shape: "triangle-down",
    svgPath: "M 50 85 L 10 15 L 90 15 Z",
    reason: "Unstable, pulls downward (tension needs resolution)",
  },
  augmented: {
    shape: "triangle-up",
    svgPath: "M 50 15 L 10 85 L 90 85 Z",
    reason: "Tense, reaching upward (unresolved energy)",
  },
  dominant7: {
    shape: "hexagon",
    svgPath:
      "M 50 5 L 85 25 L 85 75 L 50 95 L 15 75 L 15 25 Z",
    reason: "6 sides = more complex than triad, creates tension/movement",
  },
  major7: {
    shape: "star",
    svgPath:
      "M 50 5 L 59 38 L 95 38 L 66 59 L 76 92 L 50 71 L 24 92 L 34 59 L 5 38 L 41 38 Z",
    reason: "Bright, jazzy, sophisticated - star = special/elevated quality",
  },
  minor7: {
    shape: "octagon",
    svgPath:
      "M 30 5 L 70 5 L 95 30 L 95 70 L 70 95 L 30 95 L 5 70 L 5 30 Z",
    reason: "8 sides = richer than square, sophisticated minor sound",
  },
  sus2: {
    shape: "oval-horizontal",
    svgPath: "M 5 50 A 45 30 0 1 1 95 50 A 45 30 0 1 1 5 50",
    reason: "Elongated = open, floating (no 3rd = ambiguous)",
  },
  sus4: {
    shape: "oval-vertical",
    svgPath: "M 50 5 A 30 45 0 1 1 50 95 A 30 45 0 1 1 50 5",
    reason: "Vertical stretch = anticipation, wants to resolve upward",
  },
  // ADDITIONAL EXTENSIONS
  maj9: {
    shape: "pentagon",
    svgPath: "M 50 5 L 95 40 L 75 95 L 25 95 L 5 40 Z",
    reason: "5 notes = 5 sides, lush jazz chord",
  },
  min9: {
    shape: "rounded-square",
    svgPath: "M 20 5 L 80 5 Q 95 5 95 20 L 95 80 Q 95 95 80 95 L 20 95 Q 5 95 5 80 L 5 20 Q 5 5 20 5 Z",
    reason: "Square (minor) with soft edges (9th extension)",
  },
  add9: {
    shape: "diamond",
    svgPath: "M 50 5 L 95 50 L 50 95 L 5 50 Z",
    reason: "Circle (major) rotated 45° = added color without 7th",
  },
  "power-chord": {
    shape: "rectangle-horizontal",
    svgPath: "M 10 25 L 90 25 L 90 75 L 10 75 Z",
    reason: "Wide/strong = no 3rd, just root-fifth power",
  },
};

interface ChordShapeProps {
  chordQuality: string;
  rootNote?: string;
  label: string;
  romanNumeral?: string;
  size?: "small" | "medium" | "large";
  showLabel?: boolean;
  showDegree?: boolean;
}

export const ChordShape: React.FC<ChordShapeProps> = ({
  chordQuality,
  rootNote,
  label,
  romanNumeral,
  size = "medium",
  showLabel = true,
  showDegree = true,
}) => {
  // Normalize chord quality for lookup
  const normalizedQuality = chordQuality.toLowerCase();
  
  // Map common chord quality strings to our shape keys
  let shapeKey = normalizedQuality;
  if (normalizedQuality.includes("power") || normalizedQuality.includes("5")) {
    shapeKey = "power-chord";
  } else if (normalizedQuality.includes("maj9") || normalizedQuality.includes("major9")) {
    shapeKey = "maj9";
  } else if (normalizedQuality.includes("min9") || normalizedQuality.includes("minor9") || normalizedQuality.includes("m9")) {
    shapeKey = "min9";
  } else if (normalizedQuality.includes("add9") || normalizedQuality.includes("add 9")) {
    shapeKey = "add9";
  } else if (normalizedQuality.includes("diminished") || normalizedQuality.includes("dim")) {
    shapeKey = "diminished";
  } else if (normalizedQuality.includes("augmented") || normalizedQuality.includes("aug")) {
    shapeKey = "augmented";
  } else if (normalizedQuality.includes("maj7") || normalizedQuality.includes("major7")) {
    shapeKey = "major7";
  } else if (normalizedQuality.includes("min7") || normalizedQuality.includes("minor7") || normalizedQuality.includes("m7")) {
    shapeKey = "minor7";
  } else if (normalizedQuality.includes("7") && !normalizedQuality.includes("maj")) {
    shapeKey = "dominant7";
  } else if (normalizedQuality.includes("sus2")) {
    shapeKey = "sus2";
  } else if (normalizedQuality.includes("sus4") || normalizedQuality.includes("sus")) {
    shapeKey = "sus4";
  } else if (normalizedQuality === "major" || normalizedQuality === "") {
    shapeKey = "major";
  } else if (normalizedQuality === "minor" || normalizedQuality === "m") {
    shapeKey = "minor";
  }

  const shapeConfig = CHORD_SHAPES[shapeKey] || CHORD_SHAPES.major;
  
  // Get color from root note (extract root from label if not provided)
  const root = rootNote || label.replace(/[^A-G#b]/g, "").split("")[0] || "C";
  const noteColor = NOTE_COLORS[root] || NOTE_COLORS["C"];
  
  // Size presets
  const dimensions = {
    small: { width: 28, height: 28, fontSize: 9, strokeWidth: 1.5 },
    medium: { width: 100, height: 100, fontSize: 16, strokeWidth: 3 },
    large: { width: 140, height: 140, fontSize: 24, strokeWidth: 4 },
  }[size];

  return (
    <div
      className="chord-shape-container"
      style={{
        width: dimensions.width,
        height: dimensions.height,
        position: "relative",
        display: "inline-block",
      }}
    >
      {/* SVG Shape */}
      <svg
        viewBox="0 0 100 100"
        width={dimensions.width}
        height={dimensions.height}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
        }}
      >
        <path
          d={shapeConfig.svgPath}
          fill={noteColor}
          fillOpacity={0.8}
          stroke="#ffffff"
          strokeWidth={dimensions.strokeWidth}
          style={{
            filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
          }}
        />
      </svg>

      {/* Chord label centered inside shape */}
      {showLabel && (
        <div
          className="chord-label"
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            fontSize: dimensions.fontSize,
            fontWeight: 700,
            color: "#FFFFFF",
            textShadow: "0 1px 3px rgba(0,0,0,0.8)",
            pointerEvents: "none",
            textAlign: "center",
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </div>
      )}

      {/* Roman numeral badge */}
      {showDegree && romanNumeral && (
        <div
          className="degree-badge"
          style={{
            position: "absolute",
            bottom: -6,
            right: -6,
            background: "#1a1a1a",
            color: noteColor,
            border: `2px solid ${noteColor}`,
            borderRadius: "50%",
            width: 22,
            height: 22,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 10,
            fontWeight: 600,
            zIndex: 10,
          }}
        >
          {romanNumeral}
        </div>
      )}
    </div>
  );
};

export { NOTE_COLORS, CHORD_SHAPES };

