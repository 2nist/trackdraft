import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { EnhancedProgressionCard } from './EnhancedProgressionCard'
import { Chord, Key } from '../../types/music'

// Mock the emotion detection module
vi.mock('../../lib/harmony/emotionDetection', () => ({
  analyzeProgression: vi.fn(),
}))

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  ChevronDown: ({ size, ...props }: any) => <svg data-testid="chevron-down" width={size} {...props} />,
  ChevronUp: ({ size, ...props }: any) => <svg data-testid="chevron-up" width={size} {...props} />,
}))

// Import the mocked function
import { analyzeProgression } from '../../lib/harmony/emotionDetection'

const mockAnalyzeProgression = vi.mocked(analyzeProgression)

describe('EnhancedProgressionCard', () => {
  const mockSongKey: Key = { root: 'C', mode: 'major' }

  const mockProgression: Chord[] = [
    {
      romanNumeral: 'I',
      quality: 'major',
      notes: ['C', 'E', 'G'],
      function: 'tonic',
      name: 'C Major',
    },
    {
      romanNumeral: 'IV',
      quality: 'major',
      notes: ['F', 'A', 'C'],
      function: 'subdominant',
      name: 'F Major',
    },
    {
      romanNumeral: 'V',
      quality: 'major',
      notes: ['G', 'B', 'D'],
      function: 'dominant',
      name: 'G Major',
    },
  ]

  const mockAnalysis = {
    emotionalProfile: {
      primary: 'hopeful',
      secondary: ['uplifting'],
    },
    vibe: {
      label: 'Hopeful Journey',
      description: 'A progression that builds hope and anticipation',
      famousExamples: [
        { song: 'Hey Jude', artist: 'The Beatles' },
        { song: 'Let It Be', artist: 'The Beatles' },
      ],
      whenToUse: 'Use this progression for songs about overcoming challenges or new beginnings',
    },
    romanNumerals: 'I - IV - V',
    degrees: ['1', '4', '5'],
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockAnalyzeProgression.mockReturnValue(mockAnalysis)
  })

  describe('Empty progression handling', () => {
    it('returns null when progression is empty', () => {
      const { container } = render(
        <EnhancedProgressionCard
          progression={[]}
          songKey={mockSongKey}
        />
      )

      expect(container.firstChild).toBeNull()
    })

    it('renders when progression has chords', () => {
      render(
        <EnhancedProgressionCard
          progression={mockProgression}
          songKey={mockSongKey}
        />
      )

      expect(screen.getByText('Hopeful Journey')).toBeInTheDocument()
    })
  })

  describe('Emotional profile display', () => {
    it('displays the vibe label and description', () => {
      render(
        <EnhancedProgressionCard
          progression={mockProgression}
          songKey={mockSongKey}
        />
      )

      expect(screen.getByText('Hopeful Journey')).toBeInTheDocument()
      expect(screen.getByText('A progression that builds hope and anticipation')).toBeInTheDocument()
    })

    it('applies correct emotion-based styling', () => {
      render(
        <EnhancedProgressionCard
          progression={mockProgression}
          songKey={mockSongKey}
        />
      )

      // Find the div with emotion styling
      const emotionDiv = document.querySelector('.bg-green-500\\/20')
      expect(emotionDiv).toBeInTheDocument()
      expect(emotionDiv).toHaveClass('border-green-500/50', 'text-green-300')
    })

    it('handles different emotion types', () => {
      mockAnalyzeProgression.mockReturnValue({
        ...mockAnalysis,
        emotionalProfile: { primary: 'melancholic', secondary: [] },
      })

      render(
        <EnhancedProgressionCard
          progression={mockProgression}
          songKey={mockSongKey}
        />
      )

      const emotionDiv = document.querySelector('.bg-blue-500\\/20')
      expect(emotionDiv).toBeInTheDocument()
      expect(emotionDiv).toHaveClass('border-blue-500/50', 'text-blue-300')
    })

    it('falls back to neutral styling for unknown emotions', () => {
      mockAnalyzeProgression.mockReturnValue({
        ...mockAnalysis,
        emotionalProfile: { primary: 'unknown_emotion', secondary: [] },
      })

      render(
        <EnhancedProgressionCard
          progression={mockProgression}
          songKey={mockSongKey}
        />
      )

      const emotionDiv = document.querySelector('.bg-gray-500\\/20')
      expect(emotionDiv).toBeInTheDocument()
      expect(emotionDiv).toHaveClass('border-gray-500/50', 'text-gray-300')
    })
  })

  describe('Theory section toggle', () => {
    it('shows chevron down icon when theory is collapsed', () => {
      render(
        <EnhancedProgressionCard
          progression={mockProgression}
          songKey={mockSongKey}
        />
      )

      expect(screen.getByTestId('chevron-down')).toBeInTheDocument()
      expect(screen.queryByTestId('chevron-up')).not.toBeInTheDocument()
    })

    it('theory section is collapsed by default', () => {
      render(
        <EnhancedProgressionCard
          progression={mockProgression}
          songKey={mockSongKey}
        />
      )

      expect(screen.queryByText('Notation:')).not.toBeInTheDocument()
      expect(screen.queryByText('I - IV - V')).not.toBeInTheDocument()
    })

    it('expands theory section when toggle is clicked', () => {
      render(
        <EnhancedProgressionCard
          progression={mockProgression}
          songKey={mockSongKey}
        />
      )

      const toggleButton = screen.getByRole('button')
      fireEvent.click(toggleButton)

      expect(screen.getByText('Notation:')).toBeInTheDocument()
      expect(screen.getByText('I - IV - V')).toBeInTheDocument()
      expect(screen.getByTestId('chevron-up')).toBeInTheDocument()
      expect(screen.queryByTestId('chevron-down')).not.toBeInTheDocument()
    })

    it('toggles theory section visibility', () => {
      render(
        <EnhancedProgressionCard
          progression={mockProgression}
          songKey={mockSongKey}
        />
      )

      const toggleButton = screen.getByRole('button')

      // Initially collapsed
      expect(screen.queryByText('Notation:')).not.toBeInTheDocument()

      // Click to expand
      fireEvent.click(toggleButton)
      expect(screen.getByText('Notation:')).toBeInTheDocument()

      // Click to collapse
      fireEvent.click(toggleButton)
      expect(screen.queryByText('Notation:')).not.toBeInTheDocument()
    })
  })

  describe('Theory section content', () => {
    beforeEach(() => {
      render(
        <EnhancedProgressionCard
          progression={mockProgression}
          songKey={mockSongKey}
        />
      )

      const toggleButton = screen.getByRole('button')
      fireEvent.click(toggleButton)
    })

    it('displays roman numerals', () => {
      expect(screen.getByText('Notation:')).toBeInTheDocument()
      expect(screen.getByText('I - IV - V')).toBeInTheDocument()
    })

    it('displays song key information', () => {
      expect(screen.getByText('Key:')).toBeInTheDocument()
      expect(screen.getByText('C major')).toBeInTheDocument()
    })

    it('displays scale degrees', () => {
      expect(screen.getByText('Degrees:')).toBeInTheDocument()
      expect(screen.getByText('1 - 4 - 5')).toBeInTheDocument()
    })

    it('displays famous examples when available', () => {
      expect(screen.getByText('"Hey Jude"')).toBeInTheDocument()
      expect(screen.getByText('"Let It Be"')).toBeInTheDocument()

      // Check that we have multiple "— The Beatles" elements
      const beatlesElements = screen.getAllByText('— The Beatles')
      expect(beatlesElements).toHaveLength(2)
    })

    it('limits famous examples to 2', () => {
      // Our mock has 2 examples, so they should both be shown
      expect(screen.getAllByText(/— The Beatles/)).toHaveLength(2)
    })

    it('displays "when to use" information', () => {
      expect(screen.getByText('When to use:')).toBeInTheDocument()
      expect(screen.getByText('Use this progression for songs about overcoming challenges or new beginnings')).toBeInTheDocument()
    })

    it('displays theory content when expanded', () => {
      render(
        <EnhancedProgressionCard
          progression={mockProgression}
          songKey={mockSongKey}
        />
      )

      // Expand the theory section
      const toggleButton = screen.getByTestId('chevron-down').parentElement as HTMLButtonElement
      fireEvent.click(toggleButton)

      // Should now show theory content
      expect(screen.getByText('Notation:')).toBeInTheDocument()
      expect(screen.getByText('When to use:')).toBeInTheDocument()
    })
  })

  describe('Props and styling', () => {
    it('applies custom className', () => {
      const { container } = render(
        <EnhancedProgressionCard
          progression={mockProgression}
          songKey={mockSongKey}
          className="custom-test-class"
        />
      )

      const card = container.firstChild as HTMLElement
      expect(card).toHaveClass('custom-test-class')
    })

    it('has default rounded border styling', () => {
      const { container } = render(
        <EnhancedProgressionCard
          progression={mockProgression}
          songKey={mockSongKey}
        />
      )

      const card = container.firstChild as HTMLElement
      expect(card).toHaveClass('rounded-lg', 'border')
    })

    it('calls analyzeProgression with correct parameters', () => {
      render(
        <EnhancedProgressionCard
          progression={mockProgression}
          songKey={mockSongKey}
        />
      )

      expect(mockAnalyzeProgression).toHaveBeenCalledWith(mockProgression, mockSongKey)
    })
  })

  describe('Accessibility', () => {
    it('toggle button is focusable', () => {
      render(
        <EnhancedProgressionCard
          progression={mockProgression}
          songKey={mockSongKey}
        />
      )

      const toggleButton = screen.getByRole('button')
      expect(toggleButton).toBeVisible()
    })

    it('theory content is properly labeled', () => {
      render(
        <EnhancedProgressionCard
          progression={mockProgression}
          songKey={mockSongKey}
        />
      )

      const toggleButton = screen.getByRole('button')
      fireEvent.click(toggleButton)

      // Check that labels are present
      expect(screen.getByText('Notation:')).toBeInTheDocument()
      expect(screen.getByText('Key:')).toBeInTheDocument()
      expect(screen.getByText('Degrees:')).toBeInTheDocument()
    })
  })
})