import { Chord, Key } from "../../types/music";
import { EmotionalProfile, EmotionalTag, ProgressionVibe } from "../../types/emotional";

/**
 * Emotion detection algorithm for chord progressions
 */
export function detectEmotionalProfile(
  progression: Chord[],
  key: Key
): EmotionalProfile {
  if (progression.length === 0) {
    return { primary: "neutral", intensity: 5 };
  }

  const rules = {
    majorChords: 0,
    minorChords: 0,
    diminishedChords: 0,
    augmentedChords: 0,
    hasFourthResolution: false,
    hasDominantPullback: false,
    hasNeapolitanSixth: false,
  };

  // Analyze progression
  progression.forEach((chord, index) => {
    const nextChord = progression[index + 1];
    
    if (chord.quality.toLowerCase().includes("minor") || chord.quality.toLowerCase() === "m") {
      rules.minorChords++;
    } else if (chord.quality.toLowerCase().includes("major") || chord.quality === "") {
      rules.majorChords++;
    } else if (chord.quality.toLowerCase().includes("diminished") || chord.quality.toLowerCase().includes("dim")) {
      rules.diminishedChords++;
    } else if (chord.quality.toLowerCase().includes("augmented") || chord.quality.toLowerCase().includes("aug")) {
      rules.augmentedChords++;
    }

    // Check for IV -> I resolution (uplifting)
    if (chord.romanNumeral.includes("IV") && nextChord?.romanNumeral.includes("I")) {
      rules.hasFourthResolution = true;
    }

    // Check for V -> I resolution (dominant pullback)
    if (chord.romanNumeral.includes("V") && !chord.romanNumeral.includes("vi") && nextChord?.romanNumeral.includes("I")) {
      rules.hasDominantPullback = true;
    }
  });

  // Key mode consideration
  const isMinorKey = key.mode === "minor" || key.mode === "dorian" || key.mode === "phrygian" || key.mode === "locrian";

  // Emotion mapping logic
  if (rules.majorChords > rules.minorChords && rules.hasFourthResolution && !isMinorKey) {
    return { primary: "uplifting", intensity: 8 };
  }

  if (rules.minorChords > rules.majorChords && (isMinorKey || rules.minorChords >= 2)) {
    return { primary: "melancholic", intensity: 7 };
  }

  if (rules.diminishedChords > 0 || rules.augmentedChords > 0) {
    return { primary: "tense", intensity: 8 };
  }

  if (rules.hasDominantPullback && rules.majorChords > rules.minorChords) {
    return { primary: "romantic", intensity: 6 };
  }

  if (rules.majorChords === rules.minorChords && rules.majorChords > 0) {
    return { primary: "hopeful", intensity: 6 };
  }

  if (isMinorKey && rules.minorChords >= 3) {
    return { primary: "dark", intensity: 7 };
  }

  // Default based on key
  if (isMinorKey) {
    return { primary: "melancholic", intensity: 5 };
  }

  return { primary: "uplifting", intensity: 5 };
}

/**
 * Get vibe information for a progression
 */
export function getProgressionVibe(
  progression: Chord[],
  key: Key,
  emotionalProfile: EmotionalProfile
): ProgressionVibe {
  const romanNumerals = progression.map((c) => c.romanNumeral).join(" - ");
  const progressionPattern = romanNumerals;

  // Map progression patterns to vibes
  const vibeMap: Record<string, ProgressionVibe> = {
    "I - V - vi - IV": {
      label: "Uplifting & Anthemic",
      description: "The 'Don't Stop Believin'' Progression",
      famousExamples: [
        { artist: "Journey", song: "Don't Stop Believin'" },
        { artist: "The Beatles", song: "Let It Be" },
        { artist: "Ed Sheeran", song: "Perfect" },
      ],
      whenToUse: "Choruses that need to soar, triumphant moments",
    },
    "vi - IV - I - V": {
      label: "Melancholic & Modern",
      description: "The 'Someone Like You' Progression",
      famousExamples: [
        { artist: "Adele", song: "Someone Like You" },
        { artist: "The Beatles", song: "Let It Be" },
        { artist: "Leonard Cohen", song: "Hallelujah" },
      ],
      whenToUse: "Emotional verses, introspective moments",
    },
    "I - vi - IV - V": {
      label: "Nostalgic & Classic",
      description: "The 'Doo-wop' Progression",
      famousExamples: [
        { artist: "Ben E. King", song: "Stand By Me" },
        { artist: "The Penguins", song: "Earth Angel" },
        { artist: "The Everly Brothers", song: "All I Have to Do Is Dream" },
      ],
      whenToUse: "Classic pop sound, timeless feel",
    },
    "IV - V - vi - I": {
      label: "Uplifting & Recent Pop",
      description: "The 'Hopscotch' Progression",
      famousExamples: [
        { artist: "Jason Mraz", song: "I'm Yours" },
        { artist: "Lady Gaga", song: "Poker Face" },
      ],
      whenToUse: "Modern pop choruses, energetic sections",
    },
    "i - VI - III - VII": {
      label: "Dark & Intense",
      description: "The Harmonic Minor Progression",
      famousExamples: [
        { artist: "Led Zeppelin", song: "Stairway to Heaven" },
        { artist: "The Eagles", song: "Hotel California" },
      ],
      whenToUse: "Dramatic sections, intense emotional moments",
    },
  };

  // Check for exact match first
  if (vibeMap[progressionPattern]) {
    return vibeMap[progressionPattern];
  }

  // Fallback based on emotional profile
  const emotionVibes: Record<EmotionalTag, ProgressionVibe> = {
    uplifting: {
      label: "Uplifting & Anthemic",
      description: "A progression that lifts the spirit",
      famousExamples: [],
      whenToUse: "Choruses that need energy, triumphant moments",
    },
    melancholic: {
      label: "Melancholic & Wistful",
      description: "A progression with emotional depth",
      famousExamples: [],
      whenToUse: "Introspective verses, emotional moments",
    },
    tense: {
      label: "Tense & Dramatic",
      description: "A progression that creates tension",
      famousExamples: [],
      whenToUse: "Building sections, dramatic moments",
    },
    romantic: {
      label: "Romantic & Warm",
      description: "A progression that feels loving",
      famousExamples: [],
      whenToUse: "Love songs, tender moments",
    },
    hopeful: {
      label: "Hopeful & Optimistic",
      description: "A progression with a positive outlook",
      famousExamples: [],
      whenToUse: "Bridges, uplifting transitions",
    },
    dark: {
      label: "Dark & Intense",
      description: "A progression with darker tones",
      famousExamples: [],
      whenToUse: "Dramatic sections, intense moments",
    },
    neutral: {
      label: "Balanced & Versatile",
      description: "A versatile progression",
      famousExamples: [],
      whenToUse: "Versatile sections",
    },
  };

  return emotionVibes[emotionalProfile.primary];
}

/**
 * Analyze a chord progression and return full analysis
 */
export function analyzeProgression(
  progression: Chord[],
  key: Key
): {
  emotionalProfile: EmotionalProfile;
  vibe: ProgressionVibe;
  romanNumerals: string;
  degrees: string[];
} {
  const emotionalProfile = detectEmotionalProfile(progression, key);
  const vibe = getProgressionVibe(progression, key, emotionalProfile);
  const romanNumerals = progression.map((c) => c.romanNumeral).join(" - ");
  const degrees = progression.map((c) => c.romanNumeral);

  return {
    emotionalProfile,
    vibe,
    romanNumerals,
    degrees,
  };
}

