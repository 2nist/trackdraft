/**
 * Syllable counting and rhythm analysis utilities
 */

export interface WordAnalysis {
  word: string;
  syllables: number;
  syllableBreakdown: string[];
}

export interface LineAnalysis {
  syllableCount: number;
  stressPattern: string; // e.g., "10101" for iambic
  words: WordAnalysis[];
  estimatedDuration: number; // in beats, based on syllables
}

/**
 * Count syllables in a word using a heuristic algorithm
 * Handles edge cases like silent e, consecutive vowels, etc.
 */
export function countSyllables(word: string): number {
  // Remove punctuation and convert to lowercase
  const cleanWord = word.toLowerCase().replace(/[^a-z]/g, '');
  
  if (cleanWord.length === 0) return 0;
  if (cleanWord.length <= 3) return 1;
  
  // Count vowel groups
  const vowelGroups = cleanWord.match(/[aeiouy]+/g);
  if (!vowelGroups) return 1;
  
  let syllableCount = vowelGroups.length;
  
  // Handle silent e at the end
  if (cleanWord.endsWith('e') && syllableCount > 1) {
    syllableCount--;
  }
  
  // Handle consecutive vowels (diphthongs/triphthongs)
  // Count consecutive vowels as one syllable
  const consecutiveVowels = cleanWord.match(/[aeiouy]{2,}/g);
  if (consecutiveVowels) {
    consecutiveVowels.forEach((group) => {
      if (group.length > 2) {
        syllableCount -= group.length - 2;
      } else if (group.length === 2 && !['ai', 'au', 'ei', 'eu', 'oi', 'ou'].includes(group)) {
        // Some diphthongs count as one syllable
        syllableCount--;
      }
    });
  }
  
  // Handle -le endings (e.g., "table", "little")
  if (cleanWord.endsWith('le') && cleanWord.length > 2) {
    const beforeLe = cleanWord.slice(0, -2);
    if (beforeLe.match(/[bcdfghjklmnpqrstvwxyz]$/)) {
      syllableCount++;
    }
  }
  
  // Minimum 1 syllable
  return Math.max(1, syllableCount);
}

/**
 * Break down a word into its syllables (approximate)
 */
export function breakIntoSyllables(word: string): string[] {
  const cleanWord = word.toLowerCase().replace(/[^a-z]/g, '');
  const syllableCount = countSyllables(cleanWord);
  
  // Simple heuristic: divide by vowel groups
  const parts: string[] = [];
  let currentPart = '';
  let vowelCount = 0;
  
  for (let i = 0; i < cleanWord.length; i++) {
    const char = cleanWord[i];
    const isVowel = /[aeiouy]/.test(char);
    
    currentPart += char;
    
    if (isVowel) {
      vowelCount++;
      // Try to break at reasonable points
      if (i < cleanWord.length - 1 && !/[aeiouy]/.test(cleanWord[i + 1])) {
        // Next char is consonant, might be a break point
        if (vowelCount >= syllableCount / (parts.length + 1)) {
          parts.push(currentPart);
          currentPart = '';
          vowelCount = 0;
        }
      }
    }
  }
  
  if (currentPart) {
    parts.push(currentPart);
  }
  
  // If we didn't break well, just return the word
  if (parts.length === 0 || parts.length > syllableCount + 2) {
    return [word];
  }
  
  return parts.length === syllableCount ? parts : [word];
}

/**
 * Analyze a line of lyrics for syllables, stress, and rhythm
 */
export function analyzeLine(line: string): LineAnalysis {
  const words = line.trim().split(/\s+/).filter((w) => w.length > 0);
  
  const wordAnalyses: WordAnalysis[] = words.map((word) => ({
    word,
    syllables: countSyllables(word),
    syllableBreakdown: breakIntoSyllables(word),
  }));
  
  const totalSyllables = wordAnalyses.reduce((sum, w) => sum + w.syllables, 0);
  
  // Simple stress pattern: alternate stress (iambic pattern)
  // This is a heuristic - real stress detection would need NLP
  const stressPattern = wordAnalyses
    .map((w, i) => (i % 2 === 0 ? '1' : '0'))
    .join('');
  
  // Estimate duration: roughly 1 beat per 2 syllables (adjustable)
  const estimatedDuration = totalSyllables * 0.5;
  
  return {
    syllableCount: totalSyllables,
    stressPattern,
    words: wordAnalyses,
    estimatedDuration,
  };
}

/**
 * Compare rhythm between two lines
 * Returns a similarity score 0-100
 */
export function compareRhythm(line1: string, line2: string): number {
  const analysis1 = analyzeLine(line1);
  const analysis2 = analyzeLine(line2);
  
  // Compare syllable counts
  const syllableDiff = Math.abs(analysis1.syllableCount - analysis2.syllableCount);
  const maxSyllables = Math.max(analysis1.syllableCount, analysis2.syllableCount);
  const syllableScore = maxSyllables > 0 
    ? Math.max(0, 100 - (syllableDiff / maxSyllables) * 100)
    : 100;
  
  // Compare stress patterns (simple comparison)
  const patternLength = Math.min(analysis1.stressPattern.length, analysis2.stressPattern.length);
  let matchingStresses = 0;
  
  for (let i = 0; i < patternLength; i++) {
    if (analysis1.stressPattern[i] === analysis2.stressPattern[i]) {
      matchingStresses++;
    }
  }
  
  const patternScore = patternLength > 0 
    ? (matchingStresses / patternLength) * 100 
    : 100;
  
  // Weighted average: 70% syllable count, 30% stress pattern
  return Math.round(syllableScore * 0.7 + patternScore * 0.3);
}

/**
 * Get rhythm match quality (for color coding)
 */
export function getRhythmMatchQuality(score: number): 'good' | 'close' | 'different' {
  if (score >= 80) return 'good';
  if (score >= 60) return 'close';
  return 'different';
}

