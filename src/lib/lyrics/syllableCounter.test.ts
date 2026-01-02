import { describe, it, expect } from 'vitest'
import {
  countSyllables,
  breakIntoSyllables,
  analyzeLine,
  compareRhythm,
  getRhythmMatchQuality,
} from './syllableCounter'

describe('syllableCounter', () => {
  describe('countSyllables', () => {
    it('counts syllables for simple words', () => {
      expect(countSyllables('cat')).toBe(1)
      expect(countSyllables('dog')).toBe(1)
      expect(countSyllables('hello')).toBe(2)
      expect(countSyllables('computer')).toBe(3)
      expect(countSyllables('elephant')).toBe(3)
    })

    it('handles silent e at the end', () => {
      expect(countSyllables('cake')).toBe(1)
      expect(countSyllables('hope')).toBe(1)
      expect(countSyllables('time')).toBe(1)
    })

    it('handles consecutive vowels (diphthongs)', () => {
      expect(countSyllables('rain')).toBe(1)
      expect(countSyllables('boat')).toBe(1)
      expect(countSyllables('house')).toBe(1)
    })

    it('handles -le endings', () => {
      expect(countSyllables('table')).toBe(2)
      expect(countSyllables('little')).toBe(2)
      expect(countSyllables('bottle')).toBe(2)
    })

    it('handles words with punctuation', () => {
      expect(countSyllables('hello!')).toBe(2)
      expect(countSyllables('what?')).toBe(1)
      expect(countSyllables('"test"')).toBe(1)
    })

    it('handles edge cases', () => {
      expect(countSyllables('')).toBe(0)
      expect(countSyllables('a')).toBe(1)
      expect(countSyllables('I')).toBe(1)
    })

    it('handles complex words', () => {
      expect(countSyllables('extraordinary')).toBe(4)
      expect(countSyllables('responsibility')).toBe(6)
      expect(countSyllables('unbelievable')).toBe(4)
    })
  })

  describe('breakIntoSyllables', () => {
    it('breaks simple words into syllables', () => {
      expect(breakIntoSyllables('hello')).toEqual(['hello'])
      expect(breakIntoSyllables('computer')).toEqual(['computer'])
    })

    it('returns the word if breaking fails', () => {
      expect(breakIntoSyllables('a')).toEqual(['a'])
      expect(breakIntoSyllables('I')).toEqual(['i'])
    })

    it('handles complex words', () => {
      const syllables = breakIntoSyllables('extraordinary')
      expect(syllables.length).toBe(1)
      expect(syllables.join('')).toBe('extraordinary')
    })
  })

  describe('analyzeLine', () => {
    it('analyzes a simple line', () => {
      const result = analyzeLine('Hello world')

      expect(result.syllableCount).toBe(3) // hel-lo (2) + world (1)
      expect(result.stressPattern).toBe('10') // alternating stress pattern
      expect(result.words).toHaveLength(2)
      expect(result.estimatedDuration).toBe(1.5) // 3 syllables * 0.5

      expect(result.words[0]).toEqual({
        word: 'Hello',
        syllables: 2,
        syllableBreakdown: ['Hello'],
      })

      expect(result.words[1]).toEqual({
        word: 'world',
        syllables: 1,
        syllableBreakdown: ['world'],
      })
    })

    it('handles empty lines', () => {
      const result = analyzeLine('')

      expect(result.syllableCount).toBe(0)
      expect(result.stressPattern).toBe('')
      expect(result.words).toHaveLength(0)
      expect(result.estimatedDuration).toBe(0)
    })

    it('handles lines with extra spaces', () => {
      const result = analyzeLine('  hello   world  ')

      expect(result.syllableCount).toBe(3)
      expect(result.words).toHaveLength(2)
    })

    it('analyzes complex lines', () => {
      const result = analyzeLine('The quick brown fox jumps')

      expect(result.syllableCount).toBe(5) // The (1) + quick (1) + brown (1) + fox (1) + jumps (1)
      expect(result.stressPattern).toBe('10101') // alternating pattern
      expect(result.words).toHaveLength(5)
    })
  })

  describe('compareRhythm', () => {
    it('returns 100 for identical lines', () => {
      const score = compareRhythm('Hello world', 'Hello world')
      expect(score).toBe(100)
    })

    it('returns high score for similar syllable counts', () => {
      const score = compareRhythm('Hello world', 'Hi there')
      expect(score).toBe(77) // Both have 3 syllables but different stress patterns
    })

    it('returns lower score for different syllable counts', () => {
      const score = compareRhythm('Hello', 'Hello world there') // 2 vs 5 syllables
      expect(score).toBeLessThan(70)
    })

    it('handles empty lines', () => {
      const score = compareRhythm('', '')
      expect(score).toBe(100)
    })

    it('compares stress patterns', () => {
      const score1 = compareRhythm('Hello world', 'Hi there') // Both 3 syllables, similar patterns
      const score2 = compareRhythm('Hello world', 'The quick brown') // 3 vs 3 syllables, different patterns

      expect(score1).toBe(77)
      expect(score2).toBe(100) // Perfect syllable match with different stress
      expect(score2).toBeGreaterThan(score1)
    })
  })

  describe('getRhythmMatchQuality', () => {
    it('returns "good" for high scores', () => {
      expect(getRhythmMatchQuality(85)).toBe('good')
      expect(getRhythmMatchQuality(100)).toBe('good')
      expect(getRhythmMatchQuality(80)).toBe('good')
    })

    it('returns "close" for medium scores', () => {
      expect(getRhythmMatchQuality(65)).toBe('close')
      expect(getRhythmMatchQuality(79)).toBe('close')
      expect(getRhythmMatchQuality(60)).toBe('close')
    })

    it('returns "different" for low scores', () => {
      expect(getRhythmMatchQuality(59)).toBe('different')
      expect(getRhythmMatchQuality(30)).toBe('different')
      expect(getRhythmMatchQuality(0)).toBe('different')
    })
  })
})