/**
 * Datamuse API integration for rhyme and word suggestions
 * Free API: https://www.datamuse.com/api/
 */

export interface DatamuseWord {
  word: string;
  score: number;
  tags?: string[];
}

export interface RhymeSuggestions {
  perfect: DatamuseWord[];
  near: DatamuseWord[];
  assonance: DatamuseWord[];
  consonance: DatamuseWord[];
}

/**
 * Get perfect rhymes for a word
 */
export async function getPerfectRhymes(word: string, limit: number = 20): Promise<DatamuseWord[]> {
  try {
    const response = await fetch(
      `https://api.datamuse.com/words?rel_rhy=${encodeURIComponent(word)}&max=${limit}`
    );
    if (!response.ok) throw new Error('Failed to fetch rhymes');
    return await response.json();
  } catch (error) {
    console.error('Error fetching perfect rhymes:', error);
    return [];
  }
}

/**
 * Get near/slant rhymes for a word
 */
export async function getNearRhymes(word: string, limit: number = 20): Promise<DatamuseWord[]> {
  try {
    const response = await fetch(
      `https://api.datamuse.com/words?rel_nry=${encodeURIComponent(word)}&max=${limit}`
    );
    if (!response.ok) throw new Error('Failed to fetch near rhymes');
    return await response.json();
  } catch (error) {
    console.error('Error fetching near rhymes:', error);
    return [];
  }
}

/**
 * Get words with similar vowel sounds (assonance)
 */
export async function getAssonance(word: string, limit: number = 20): Promise<DatamuseWord[]> {
  try {
    const response = await fetch(
      `https://api.datamuse.com/words?rel_rhy=${encodeURIComponent(word)}&max=${limit}`
    );
    if (!response.ok) throw new Error('Failed to fetch assonance');
    const data = await response.json();
    // Filter for words that share vowel sounds but not exact rhymes
    // This is a simplified approach - Datamuse doesn't have a direct assonance endpoint
    return data.filter((item: DatamuseWord) => item.score < 1000); // Lower score = less perfect match
  } catch (error) {
    console.error('Error fetching assonance:', error);
    return [];
  }
}

/**
 * Get words with similar consonant sounds (consonance)
 */
export async function getConsonance(word: string, limit: number = 20): Promise<DatamuseWord[]> {
  try {
    // Datamuse doesn't have direct consonance, but we can use related words
    const response = await fetch(
      `https://api.datamuse.com/words?rel_nry=${encodeURIComponent(word)}&max=${limit}`
    );
    if (!response.ok) throw new Error('Failed to fetch consonance');
    return await response.json();
  } catch (error) {
    console.error('Error fetching consonance:', error);
    return [];
  }
}

/**
 * Get all rhyme suggestions for a word
 */
export async function getAllRhymeSuggestions(
  word: string,
  limit: number = 15
): Promise<RhymeSuggestions> {
  const [perfect, near, assonance, consonance] = await Promise.all([
    getPerfectRhymes(word, limit),
    getNearRhymes(word, limit),
    getAssonance(word, limit),
    getConsonance(word, limit),
  ]);

  return {
    perfect: perfect.slice(0, limit),
    near: near.slice(0, limit),
    assonance: assonance.slice(0, limit),
    consonance: consonance.slice(0, limit),
  };
}

/**
 * Get synonyms for a word (useful for lyric writing)
 */
export async function getSynonyms(word: string, limit: number = 20): Promise<DatamuseWord[]> {
  try {
    const response = await fetch(
      `https://api.datamuse.com/words?rel_syn=${encodeURIComponent(word)}&max=${limit}`
    );
    if (!response.ok) throw new Error('Failed to fetch synonyms');
    return await response.json();
  } catch (error) {
    console.error('Error fetching synonyms:', error);
    return [];
  }
}

/**
 * Get words that sound similar (for alliteration, etc.)
 */
export async function getSimilarSounds(word: string, limit: number = 20): Promise<DatamuseWord[]> {
  try {
    const response = await fetch(
      `https://api.datamuse.com/words?sl=${encodeURIComponent(word)}&max=${limit}`
    );
    if (!response.ok) throw new Error('Failed to fetch similar sounds');
    return await response.json();
  } catch (error) {
    console.error('Error fetching similar sounds:', error);
    return [];
  }
}

/**
 * Get words that are spelled similarly
 */
export async function getSimilarSpelling(word: string, limit: number = 20): Promise<DatamuseWord[]> {
  try {
    const response = await fetch(
      `https://api.datamuse.com/words?sp=${encodeURIComponent(word)}&max=${limit}`
    );
    if (!response.ok) throw new Error('Failed to fetch similar spelling');
    return await response.json();
  } catch (error) {
    console.error('Error fetching similar spelling:', error);
    return [];
  }
}

/**
 * Search for words with specific constraints
 * Useful for finding words that rhyme AND match certain criteria
 */
export async function searchWords(params: {
  rhymesWith?: string;
  soundsLike?: string;
  meansLike?: string;
  spelledLike?: string;
  topics?: string[];
  max?: number;
}): Promise<DatamuseWord[]> {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.rhymesWith) queryParams.append('rel_rhy', params.rhymesWith);
    if (params.soundsLike) queryParams.append('sl', params.soundsLike);
    if (params.meansLike) queryParams.append('ml', params.meansLike);
    if (params.spelledLike) queryParams.append('sp', params.spelledLike);
    if (params.topics && params.topics.length > 0) {
      params.topics.forEach((topic) => queryParams.append('topics', topic));
    }
    if (params.max) queryParams.append('max', params.max.toString());

    const response = await fetch(
      `https://api.datamuse.com/words?${queryParams.toString()}`
    );
    if (!response.ok) throw new Error('Failed to search words');
    return await response.json();
  } catch (error) {
    console.error('Error searching words:', error);
    return [];
  }
}

