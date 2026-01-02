/**
 * Rhyme detection and analysis utilities
 */

export type RhymeType = 'perfect' | 'slant' | 'assonance' | 'consonance' | 'none';

export interface RhymeMatch {
  word1: string;
  word2: string;
  type: RhymeType;
  score: number; // 0-1, how strong the rhyme is
}

export interface RhymeGroup {
  id: string;
  words: Array<{ word: string; lineIndex: number; wordIndex: number }>;
  rhymeType: RhymeType;
  color: string;
}

/**
 * Extract the last syllable(s) of a word for rhyming
 */
function getRhymingPart(word: string): string {
  const clean = word.toLowerCase().replace(/[^a-z]/g, '');
  
  // Get last 2-3 characters (approximate)
  if (clean.length <= 3) return clean;
  return clean.slice(-3);
}

/**
 * Get vowel sounds from a word
 */
function getVowelSounds(word: string): string {
  const clean = word.toLowerCase().replace(/[^a-z]/g, '');
  return clean.replace(/[bcdfghjklmnpqrstvwxyz]/g, '');
}

/**
 * Get consonant sounds from a word
 */
function getConsonantSounds(word: string): string {
  const clean = word.toLowerCase().replace(/[^a-z]/g, '');
  return clean.replace(/[aeiou]/g, '');
}

/**
 * Detect rhyme type between two words
 */
export function detectRhymeType(word1: string, word2: string): RhymeMatch {
  const w1 = word1.toLowerCase().replace(/[^a-z]/g, '');
  const w2 = word2.toLowerCase().replace(/[^a-z]/g, '');
  
  if (w1 === w2) {
    return { word1, word2, type: 'none', score: 0 };
  }
  
  const rhyme1 = getRhymingPart(w1);
  const rhyme2 = getRhymingPart(w2);
  
  // Perfect rhyme: same ending sounds
  if (rhyme1 === rhyme2) {
    return { word1, word2, type: 'perfect', score: 1.0 };
  }
  
  // Check for similar endings (slant rhyme)
  const similarity = calculateSimilarity(rhyme1, rhyme2);
  if (similarity > 0.6) {
    return { word1, word2, type: 'slant', score: similarity };
  }
  
  // Assonance: same vowel sounds
  const vowels1 = getVowelSounds(w1);
  const vowels2 = getVowelSounds(w2);
  if (vowels1.length > 0 && vowels2.length > 0 && vowels1 === vowels2) {
    return { word1, word2, type: 'assonance', score: 0.5 };
  }
  
  // Consonance: same consonant sounds
  const cons1 = getConsonantSounds(w1);
  const cons2 = getConsonantSounds(w2);
  if (cons1.length > 0 && cons2.length > 0 && cons1 === cons2) {
    return { word1, word2, type: 'consonance', score: 0.4 };
  }
  
  return { word1, word2, type: 'none', score: 0 };
}

/**
 * Calculate similarity between two strings
 */
function calculateSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  // Check how many characters match from the end
  let matches = 0;
  const minLength = Math.min(longer.length, shorter.length);
  for (let i = 1; i <= minLength; i++) {
    if (longer[longer.length - i] === shorter[shorter.length - i]) {
      matches++;
    } else {
      break;
    }
  }
  
  return matches / longer.length;
}

/**
 * Analyze rhyme scheme for entire lyrics
 */
export function analyzeRhymeScheme(lyrics: string): {
  groups: RhymeGroup[];
  scheme: string; // e.g., "AABB" or "ABAB"
  rhymeDistribution: Record<string, number>;
} {
  const lines = lyrics.split('\n').filter((line) => line.trim().length > 0);
  const words: Array<{ word: string; lineIndex: number; wordIndex: number }> = [];
  
  // Extract all words with their positions
  lines.forEach((line, lineIndex) => {
    const lineWords = line.trim().split(/\s+/).filter((w) => w.length > 0);
    lineWords.forEach((word, wordIndex) => {
      // Remove punctuation
      const cleanWord = word.replace(/[.,!?;:'"()]/g, '');
      if (cleanWord.length > 0) {
        words.push({ word: cleanWord, lineIndex, wordIndex });
      }
    });
  });
  
  // Group rhyming words
  const groups: RhymeGroup[] = [];
  const usedWords = new Set<string>();
  const colors = [
    '#3B82F6', // blue
    '#10B981', // green
    '#F59E0B', // yellow
    '#EF4444', // red
    '#8B5CF6', // purple
    '#EC4899', // pink
    '#06B6D4', // cyan
    '#84CC16', // lime
    '#F97316', // orange
    '#6366F1', // indigo
  ];
  
  let colorIndex = 0;
  
  // Find rhymes by comparing last words of lines
  const lastWords: Array<{ word: string; lineIndex: number; wordIndex: number }> = [];
  lines.forEach((line, lineIndex) => {
    const lineWords = line.trim().split(/\s+/).filter((w) => w.length > 0);
    if (lineWords.length > 0) {
      const lastWord = lineWords[lineWords.length - 1].replace(/[.,!?;:'"()]/g, '');
      if (lastWord.length > 0) {
        lastWords.push({ word: lastWord, lineIndex, wordIndex: lineWords.length - 1 });
      }
    }
  });
  
  // Group rhyming last words
  for (let i = 0; i < lastWords.length; i++) {
    if (usedWords.has(`${lastWords[i].lineIndex}-${lastWords[i].wordIndex}`)) continue;
    
    const group: RhymeGroup = {
      id: `group-${groups.length}`,
      words: [lastWords[i]],
      rhymeType: 'none',
      color: colors[groups.length % colors.length],
    };
    
    usedWords.add(`${lastWords[i].lineIndex}-${lastWords[i].wordIndex}`);
    
    // Find other words that rhyme with this one
    for (let j = i + 1; j < lastWords.length; j++) {
      if (usedWords.has(`${lastWords[j].lineIndex}-${lastWords[j].wordIndex}`)) continue;
      
      const match = detectRhymeType(lastWords[i].word, lastWords[j].word);
      if (match.type !== 'none' && match.score > 0.5) {
        group.words.push(lastWords[j]);
        group.rhymeType = match.type;
        usedWords.add(`${lastWords[j].lineIndex}-${lastWords[j].wordIndex}`);
      }
    }
    
    if (group.words.length > 1) {
      groups.push(group);
    }
  }
  
  // Generate rhyme scheme notation (AABB, ABAB, etc.)
  const schemeLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const schemeMap = new Map<string, string>();
  let schemeIndex = 0;
  const scheme: string[] = [];
  
  lastWords.forEach((word) => {
    // Find which group this word belongs to
    let letter = '';
    for (const group of groups) {
      if (group.words.some((w) => w.lineIndex === word.lineIndex && w.wordIndex === word.wordIndex)) {
        if (!schemeMap.has(group.id)) {
          schemeMap.set(group.id, schemeLetters[schemeIndex]);
          schemeIndex++;
        }
        letter = schemeMap.get(group.id)!;
        break;
      }
    }
    
    if (!letter) {
      // No rhyme found, use next available letter
      letter = schemeLetters[schemeIndex];
      schemeIndex++;
    }
    
    scheme.push(letter);
  });
  
  // Calculate rhyme distribution
  const rhymeDistribution: Record<string, number> = {};
  groups.forEach((group) => {
    const letter = schemeMap.get(group.id) || '?';
    rhymeDistribution[letter] = (rhymeDistribution[letter] || 0) + group.words.length;
  });
  
  return {
    groups,
    scheme: scheme.join(''),
    rhymeDistribution,
  };
}

/**
 * Get rhyme suggestions for a word using simple heuristics
 * (In production, this would use Datamuse API)
 */
export function getRhymeSuggestions(word: string, limit: number = 10): string[] {
  // This is a placeholder - in production, use Datamuse API
  // For now, return empty array (will be implemented with API)
  return [];
}

