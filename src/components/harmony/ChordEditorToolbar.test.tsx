import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import ChordEditorToolbar from './ChordEditorToolbar'
import { Chord } from '../../types/music'
import { SubstitutionOption } from '../../lib/harmony/substitutions'

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  X: ({ size, ...props }: any) => <svg data-testid="x-icon" width={size} {...props} />,
  RotateCw: ({ size, ...props }: any) => <svg data-testid="rotate-icon" width={size} {...props} />,
  Minus: ({ size, ...props }: any) => <svg data-testid="minus-icon" width={size} {...props} />,
  Plus: ({ size, ...props }: any) => <svg data-testid="plus-icon" width={size} {...props} />,
  Trash2: ({ size, ...props }: any) => <svg data-testid="trash-icon" width={size} {...props} />,
}))

describe('ChordEditorToolbar', () => {
  const mockChord: Chord = {
    romanNumeral: 'I',
    quality: 'major',
    notes: ['C', 'E', 'G'],
    function: 'tonic',
    name: 'C Major',
    beats: 2,
  }

  const mockSubstitutions = {
    commonTone: [
      {
        chord: {
          romanNumeral: 'vi',
          quality: 'minor',
          notes: ['A', 'C', 'E'],
          function: 'tonic',
          name: 'Am',
        },
        reason: 'Common tone on C',
      },
    ],
    functional: [
      {
        chord: {
          romanNumeral: 'III',
          quality: 'minor',
          notes: ['E', 'G', 'B'],
          function: 'tonic',
          name: 'Em',
        },
        reason: 'Parallel minor',
      },
    ],
    modalInterchange: [
      {
        chord: {
          romanNumeral: 'bVII',
          quality: 'major',
          notes: ['B', 'D#', 'F#'],
          function: 'dominant',
          name: 'B Major',
        },
        reason: 'Mixolydian interchange',
      },
    ],
  }

  const mockProps = {
    chord: mockChord,
    onSubstitute: vi.fn(),
    onClose: vi.fn(),
    onRotate: undefined,
    canRotate: false,
    onBeatsChange: undefined,
    onRemove: undefined,
    substitutions: mockSubstitutions,
  }

  describe('No chord selected', () => {
    it('shows message when chord is null', () => {
      render(<ChordEditorToolbar {...mockProps} chord={null} />)

      expect(screen.getByText('Select a chord to edit')).toBeInTheDocument()
    })

    it('shows message when chord is undefined', () => {
      render(<ChordEditorToolbar {...mockProps} chord={undefined} />)

      expect(screen.getByText('Select a chord to edit')).toBeInTheDocument()
    })

    it('has correct styling for empty state', () => {
      render(<ChordEditorToolbar {...mockProps} chord={null} />)

      const message = screen.getByText('Select a chord to edit')
      expect(message).toHaveClass('text-sm', 'text-white', 'text-center', 'py-8')
    })
  })

  describe('Header section', () => {
    it('shows "Chord Editor" title', () => {
      render(<ChordEditorToolbar {...mockProps} />)

      expect(screen.getByText('Chord Editor')).toBeInTheDocument()
    })

    it('shows close button', () => {
      render(<ChordEditorToolbar {...mockProps} />)

      expect(screen.getByTestId('x-icon')).toBeInTheDocument()
    })

    it('calls onClose when close button is clicked', () => {
      render(<ChordEditorToolbar {...mockProps} />)

      const closeButton = screen.getByTestId('x-icon').parentElement as HTMLButtonElement
      fireEvent.click(closeButton)

      expect(mockProps.onClose).toHaveBeenCalled()
    })

    it('does not show rotate button by default', () => {
      render(<ChordEditorToolbar {...mockProps} />)

      expect(screen.queryByTestId('rotate-icon')).not.toBeInTheDocument()
    })

    it('shows rotate button when onRotate is provided', () => {
      render(<ChordEditorToolbar {...mockProps} onRotate={vi.fn()} />)

      expect(screen.getByTestId('rotate-icon')).toBeInTheDocument()
    })

    it('calls onRotate when rotate button is clicked', () => {
      const mockOnRotate = vi.fn()
      render(
        <ChordEditorToolbar
          chord={mockChord}
          onSubstitute={vi.fn()}
          onClose={vi.fn()}
          onRotate={mockOnRotate}
          canRotate={true}
          substitutions={null}
        />
      )

      const rotateButton = screen.getByTestId('rotate-icon').parentElement as HTMLButtonElement
      fireEvent.click(rotateButton)

      expect(mockOnRotate).toHaveBeenCalled()
    })

    it('disables rotate button when canRotate is false', () => {
      render(<ChordEditorToolbar {...mockProps} onRotate={vi.fn()} canRotate={false} />)

      const rotateButton = screen.getByTestId('rotate-icon').parentElement as HTMLButtonElement
      expect(rotateButton).toBeDisabled()
      expect(rotateButton).toHaveClass('disabled:opacity-50')
    })

    it('enables rotate button when canRotate is true', () => {
      render(<ChordEditorToolbar {...mockProps} onRotate={vi.fn()} canRotate={true} />)

      const rotateButton = screen.getByTestId('rotate-icon').parentElement as HTMLButtonElement
      expect(rotateButton).not.toBeDisabled()
    })
  })

  describe('Current chord info', () => {
    it('displays chord name', () => {
      render(<ChordEditorToolbar {...mockProps} />)

      expect(screen.getByText('C Major')).toBeInTheDocument()
    })

    it('displays roman numeral', () => {
      render(<ChordEditorToolbar {...mockProps} />)

      expect(screen.getByText('I')).toBeInTheDocument()
    })

    it('displays chord function', () => {
      render(<ChordEditorToolbar {...mockProps} />)

      expect(screen.getByText('tonic')).toBeInTheDocument()
    })

    it('has correct styling for chord info', () => {
      render(<ChordEditorToolbar {...mockProps} />)

      const chordName = screen.getByText('C Major')
      expect(chordName).toHaveClass('text-base', 'font-bold', 'text-white')

      const romanNumeral = screen.getByText('I')
      expect(romanNumeral).toHaveClass('text-xs', 'text-white', 'mt-0.5')

      const chordFunction = screen.getByText('tonic')
      expect(chordFunction).toHaveClass('text-xs', 'text-white', 'mt-0.5')
    })
  })

  describe('Beats control', () => {
    it('does not show beats control when onBeatsChange is not provided', () => {
      render(<ChordEditorToolbar {...mockProps} />)

      expect(screen.queryByText('Beats')).not.toBeInTheDocument()
      expect(screen.queryByTestId('minus-icon')).not.toBeInTheDocument()
      expect(screen.queryByTestId('plus-icon')).not.toBeInTheDocument()
    })

    it('shows beats control when onBeatsChange is provided', () => {
      render(<ChordEditorToolbar {...mockProps} onBeatsChange={vi.fn()} />)

      expect(screen.getByText('Beats')).toBeInTheDocument()
      expect(screen.getByTestId('minus-icon')).toBeInTheDocument()
      expect(screen.getByTestId('plus-icon')).toBeInTheDocument()
    })

    it('displays current beats value', () => {
      render(<ChordEditorToolbar {...mockProps} onBeatsChange={vi.fn()} />)

      expect(screen.getByText('2')).toBeInTheDocument()
    })

    it('displays default beats value of 2 when chord.beats is undefined', () => {
      const chordWithoutBeats = { ...mockChord, beats: undefined }
      render(<ChordEditorToolbar {...mockProps} chord={chordWithoutBeats} onBeatsChange={vi.fn()} />)

      expect(screen.getByText('2')).toBeInTheDocument()
    })

    it('calls onBeatsChange with decreased value when minus button is clicked', () => {
      const mockOnBeatsChange = vi.fn()
      render(<ChordEditorToolbar {...mockProps} onBeatsChange={mockOnBeatsChange} />)

      const minusButton = screen.getByTestId('minus-icon').parentElement as HTMLButtonElement
      fireEvent.click(minusButton)

      expect(mockOnBeatsChange).toHaveBeenCalledWith(1.5)
    })

    it('calls onBeatsChange with increased value when plus button is clicked', () => {
      const mockOnBeatsChange = vi.fn()
      render(<ChordEditorToolbar {...mockProps} onBeatsChange={mockOnBeatsChange} />)

      const plusButton = screen.getByTestId('plus-icon').parentElement as HTMLButtonElement
      fireEvent.click(plusButton)

      expect(mockOnBeatsChange).toHaveBeenCalledWith(2.5)
    })

    it('does not decrease below 0.5 beats', () => {
      const mockOnBeatsChange = vi.fn()
      const chordWithMinBeats = { ...mockChord, beats: 0.5 }
      render(<ChordEditorToolbar {...mockProps} chord={chordWithMinBeats} onBeatsChange={mockOnBeatsChange} />)

      const minusButton = screen.getByTestId('minus-icon').parentElement as HTMLButtonElement
      fireEvent.click(minusButton)

      expect(mockOnBeatsChange).not.toHaveBeenCalled()
    })

    it('does not increase above 8 beats', () => {
      const mockOnBeatsChange = vi.fn()
      const chordWithMaxBeats = { ...mockChord, beats: 8 }
      render(<ChordEditorToolbar {...mockProps} chord={chordWithMaxBeats} onBeatsChange={mockOnBeatsChange} />)

      const plusButton = screen.getByTestId('plus-icon').parentElement as HTMLButtonElement
      fireEvent.click(plusButton)

      expect(mockOnBeatsChange).not.toHaveBeenCalled()
    })
  })

  describe('Remove chord functionality', () => {
    it('does not show remove button when onRemove is not provided', () => {
      render(<ChordEditorToolbar {...mockProps} />)

      expect(screen.queryByText('Remove Chord')).not.toBeInTheDocument()
      expect(screen.queryByTestId('trash-icon')).not.toBeInTheDocument()
    })

    it('shows remove button when onRemove is provided', () => {
      render(<ChordEditorToolbar {...mockProps} onRemove={vi.fn()} />)

      expect(screen.getByText('Remove Chord')).toBeInTheDocument()
      expect(screen.getByTestId('trash-icon')).toBeInTheDocument()
    })

    it('calls onRemove when remove button is clicked', () => {
      const mockOnRemove = vi.fn()
      render(<ChordEditorToolbar {...mockProps} onRemove={mockOnRemove} />)

      const removeButton = screen.getByText('Remove Chord')
      fireEvent.click(removeButton)

      expect(mockOnRemove).toHaveBeenCalled()
    })

    it('has correct styling for remove button', () => {
      render(<ChordEditorToolbar {...mockProps} onRemove={vi.fn()} />)

      const removeButton = screen.getByText('Remove Chord')
      expect(removeButton).toHaveClass(
        'w-full', 'px-2', 'py-1.5', 'text-xs',
        'bg-red-900/30', 'hover:bg-red-900/50',
        'rounded', 'border-none', 'text-red-300'
      )
    })
  })

  describe('Substitution sections', () => {
    it('shows common tone substitutions when available', () => {
      render(<ChordEditorToolbar {...mockProps} />)

      expect(screen.getByText('Common Tone')).toBeInTheDocument()
      expect(screen.getByText('Am')).toBeInTheDocument()
      expect(screen.getByText('Common tone on C')).toBeInTheDocument()
    })

    it('shows functional substitutions when available', () => {
      render(<ChordEditorToolbar {...mockProps} />)

      expect(screen.getByText('Functional')).toBeInTheDocument()
      expect(screen.getByText('Em')).toBeInTheDocument()
      expect(screen.getByText('Parallel minor')).toBeInTheDocument()
    })

    it('shows modal interchange substitutions when available', () => {
      render(<ChordEditorToolbar {...mockProps} />)

      expect(screen.getByText('Modal Interchange')).toBeInTheDocument()
      expect(screen.getByText('B Major')).toBeInTheDocument()
      expect(screen.getByText('Mixolydian interchange')).toBeInTheDocument()
    })

    it('does not show substitution sections when substitutions is null', () => {
      render(<ChordEditorToolbar {...mockProps} substitutions={null} />)

      expect(screen.queryByText('Common Tone')).not.toBeInTheDocument()
      expect(screen.queryByText('Functional')).not.toBeInTheDocument()
      expect(screen.queryByText('Modal Interchange')).not.toBeInTheDocument()
    })

    it('does not show empty substitution sections', () => {
      const emptySubstitutions = {
        commonTone: [],
        functional: [],
        modalInterchange: [],
      }
      render(<ChordEditorToolbar {...mockProps} substitutions={emptySubstitutions} />)

      expect(screen.queryByText('Common Tone')).not.toBeInTheDocument()
      expect(screen.queryByText('Functional')).not.toBeInTheDocument()
      expect(screen.queryByText('Modal Interchange')).not.toBeInTheDocument()
    })

    it('calls onSubstitute when substitution button is clicked', () => {
      render(<ChordEditorToolbar {...mockProps} />)

      const amButton = screen.getByText('Am').closest('button')
      fireEvent.click(amButton!)

      expect(mockProps.onSubstitute).toHaveBeenCalledWith(mockSubstitutions.commonTone[0])
    })

    it('calls onSubstitute with correct substitution for each type', () => {
      render(<ChordEditorToolbar {...mockProps} />)

      // Test common tone
      const amButton = screen.getByText('Am').closest('button')
      fireEvent.click(amButton!)
      expect(mockProps.onSubstitute).toHaveBeenCalledWith(mockSubstitutions.commonTone[0])

      // Reset mock
      mockProps.onSubstitute.mockClear()

      // Test functional
      const emButton = screen.getByText('Em').closest('button')
      fireEvent.click(emButton!)
      expect(mockProps.onSubstitute).toHaveBeenCalledWith(mockSubstitutions.functional[0])

      // Reset mock
      mockProps.onSubstitute.mockClear()

      // Test modal interchange
      const bMajorButton = screen.getByText('B Major').closest('button')
      fireEvent.click(bMajorButton!)
      expect(mockProps.onSubstitute).toHaveBeenCalledWith(mockSubstitutions.modalInterchange[0])
    })

    it('has correct styling for substitution buttons', () => {
      render(<ChordEditorToolbar {...mockProps} />)

      const substitutionButtons = screen.getAllByText(/^(Am|Em|B Major)$/).map(el => el.closest('button'))
      substitutionButtons.forEach(button => {
        expect(button).toHaveClass(
          'w-full', 'text-left', 'px-2', 'py-1.5', 'text-xs',
          'bg-black', 'hover:bg-black', 'rounded', 'border-none'
        )
      })
    })
  })

  describe('Layout and structure', () => {
    it('has correct container structure', () => {
      render(<ChordEditorToolbar {...mockProps} />)

      // Should have main flex container
      const container = document.querySelector('.flex.flex-col')
      expect(container).toBeInTheDocument()
    })

    it('has proper spacing between sections', () => {
      render(<ChordEditorToolbar {...mockProps} />)

      // Check space-y-3 class on the sections container
      const sectionsContainer = document.querySelector('.space-y-3')
      expect(sectionsContainer).toBeInTheDocument()
    })
  })
})