import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import PlayerBar from './PlayerBar'

// No mocking needed - we'll test with actual rendered elements

describe('PlayerBar', () => {
  describe('Initial rendering', () => {
    it('renders all main elements', () => {
      render(<PlayerBar />)

      // Check for main structural elements - footer element
      const footer = document.querySelector('footer')
      expect(footer).toBeInTheDocument()

      // Check for buttons (play + skip back + skip forward)
      const buttons = document.querySelectorAll('button')
      expect(buttons).toHaveLength(3)

      // Check for play button (first button)
      const playButton = buttons[0]
      expect(playButton).toBeInTheDocument()

      // Check for time display - there are 2 "0:00" elements (current and total)
      const timeElements = screen.getAllByText('0:00')
      expect(timeElements).toHaveLength(2)
      expect(screen.getByText('/')).toBeInTheDocument()

      // Check for volume control
      const volumeInput = document.querySelector('input[type="range"]')
      expect(volumeInput).toBeInTheDocument()
      expect(screen.getByText('75%')).toBeInTheDocument() // volume display

      // Check for volume icon by class
      expect(document.querySelector('svg[class*="lucide-volume2"]')).toBeInTheDocument()
    })

    it('displays play icon initially', () => {
      render(<PlayerBar />)

      // Since we mocked the icons, check for the actual SVG elements
      const playIcon = document.querySelector('svg[class*="lucide-play"]')
      const pauseIcon = document.querySelector('svg[class*="lucide-pause"]')

      expect(playIcon).toBeInTheDocument()
      expect(pauseIcon).not.toBeInTheDocument()
    })

    it('shows initial volume of 75%', () => {
      render(<PlayerBar />)

      const volumeSlider = document.querySelector('input[type="range"]')
      const volumeDisplay = screen.getByText('75%')

      expect(volumeSlider).toHaveValue('75')
      expect(volumeDisplay).toBeInTheDocument()
    })
  })

  describe('Play/Pause functionality', () => {
    it('toggles between play and pause icons when play button is clicked', () => {
      render(<PlayerBar />)

      const playButton = document.querySelector('button')

      // Initial state: play icon visible
      expect(document.querySelector('svg[class*="lucide-play"]')).toBeInTheDocument()
      expect(document.querySelector('svg[class*="lucide-pause"]')).not.toBeInTheDocument()

      // Click to play
      fireEvent.click(playButton!)

      // Should now show pause icon
      expect(document.querySelector('svg[class*="lucide-play"]')).not.toBeInTheDocument()
      expect(document.querySelector('svg[class*="lucide-pause"]')).toBeInTheDocument()

      // Click to pause
      fireEvent.click(playButton!)

      // Should show play icon again
      expect(document.querySelector('svg[class*="lucide-play"]')).toBeInTheDocument()
      expect(document.querySelector('svg[class*="lucide-pause"]')).not.toBeInTheDocument()
    })

    it('toggles play state correctly', () => {
      render(<PlayerBar />)

      const playButton = document.querySelector('button')

      // Initial state
      expect(document.querySelector('svg[class*="lucide-play"]')).toBeInTheDocument()

      // Click once - should show pause
      fireEvent.click(playButton!)
      expect(document.querySelector('svg[class*="lucide-pause"]')).toBeInTheDocument()

      // Click twice - should show play again
      fireEvent.click(playButton!)
      expect(document.querySelector('svg[class*="lucide-play"]')).toBeInTheDocument()

      // Click three times - should show pause
      fireEvent.click(playButton!)
      expect(document.querySelector('svg[class*="lucide-pause"]')).toBeInTheDocument()
    })
  })

  describe('Skip buttons', () => {
    it('renders skip back and forward buttons', () => {
      render(<PlayerBar />)

      const buttons = document.querySelectorAll('button')

      // Should have 3 buttons total: play/pause, skip back, skip forward
      expect(buttons).toHaveLength(3)

      // Check for skip icons by class
      expect(document.querySelector('svg[class*="lucide-skip-back"]')).toBeInTheDocument()
      expect(document.querySelector('svg[class*="lucide-skip-forward"]')).toBeInTheDocument()
    })

    it('skip buttons are present but currently non-functional', () => {
      render(<PlayerBar />)

      const buttons = document.querySelectorAll('button')
      const skipBackButton = buttons[1] // second button
      const skipForwardButton = buttons[2] // third button

      // Buttons should be rendered but clicking them doesn't do anything
      // (This test documents current behavior - buttons are placeholders)
      expect(skipBackButton).toBeInTheDocument()
      expect(skipForwardButton).toBeInTheDocument()

      // Clicking should not throw errors
      expect(() => fireEvent.click(skipBackButton!)).not.toThrow()
      expect(() => fireEvent.click(skipForwardButton!)).not.toThrow()
    })
  })

  describe('Volume control', () => {
    it('updates volume display when slider is changed', () => {
      render(<PlayerBar />)

      const volumeSlider = screen.getByRole('slider')

      // Initial volume should be 75%
      expect(screen.getByText('75%')).toBeInTheDocument()

      // Change volume to 50%
      fireEvent.change(volumeSlider, { target: { value: '50' } })

      expect(screen.getByText('50%')).toBeInTheDocument()
      expect(volumeSlider).toHaveValue('50')
    })

    it('updates volume to different values', () => {
      render(<PlayerBar />)

      const volumeSlider = screen.getByRole('slider')

      // Test various volume levels
      const testValues = ['0', '25', '50', '75', '100']

      testValues.forEach(value => {
        fireEvent.change(volumeSlider, { target: { value } })
        expect(screen.getByText(`${value}%`)).toBeInTheDocument()
        expect(volumeSlider).toHaveValue(value)
      })
    })

    it('volume slider has correct attributes', () => {
      render(<PlayerBar />)

      const volumeSlider = document.querySelector('input[type="range"]')

      expect(volumeSlider).toHaveAttribute('type', 'range')
      expect(volumeSlider).toHaveAttribute('min', '0')
      expect(volumeSlider).toHaveAttribute('max', '100')
      expect(volumeSlider).toHaveValue('75') // initial value
    })
  })

  describe('Time display', () => {
    it('shows current time as 0:00', () => {
      render(<PlayerBar />)

      const timeElements = screen.getAllByText('0:00')
      expect(timeElements).toHaveLength(2) // current and total time
    })

    it('displays time separator', () => {
      render(<PlayerBar />)

      expect(screen.getByText('/')).toBeInTheDocument()
    })
  })

  describe('Progress bar', () => {
    it('renders progress bar with initial 0% width', () => {
      render(<PlayerBar />)

      // The progress bar should be present (though currently static)
      const progressFill = document.querySelector('[style*="width: 0%"]')
      expect(progressFill).toBeInTheDocument()

      // Check that the progress bar container exists
      const progressContainer = progressFill?.parentElement
      expect(progressContainer).toHaveClass('h-1', 'bg-surface-2', 'rounded-full', 'cursor-pointer')
    })

    it('progress bar is currently non-functional', () => {
      render(<PlayerBar />)

      // Progress bar should be rendered but static at 0%
      const progressBar = document.querySelector('[style*="width: 0%"]')
      expect(progressBar).toBeInTheDocument()
      expect(progressBar).toHaveClass('h-full', 'bg-track-orange-700', 'rounded-full')

      // This documents that the progress bar is a placeholder for future functionality
    })
  })

  describe('Accessibility', () => {
    it('buttons are present for user interaction', () => {
      render(<PlayerBar />)

      const buttons = document.querySelectorAll('button')
      expect(buttons.length).toBeGreaterThan(0)

      // All buttons should be focusable
      buttons.forEach(button => {
        expect(button).toBeVisible()
      })
    })

    it('volume slider is properly configured', () => {
      render(<PlayerBar />)

      const volumeSlider = document.querySelector('input[type="range"]')
      expect(volumeSlider).toHaveAttribute('min', '0')
      expect(volumeSlider).toHaveAttribute('max', '100')
      expect(volumeSlider).toHaveValue('75')
    })
  })

  describe('Styling and layout', () => {
    it('has correct CSS classes for layout', () => {
      render(<PlayerBar />)

      const footer = screen.getByRole('contentinfo')

      // Check main layout classes
      expect(footer).toHaveClass('h-16', 'bg-surface-1', 'border-t', 'border-surface-2', 'flex', 'items-center', 'justify-between', 'px-6')
    })

    it('volume control has correct styling', () => {
      render(<PlayerBar />)

      const volumeSlider = screen.getByRole('slider')

      expect(volumeSlider).toHaveClass(
        'w-24', 'h-1', 'bg-surface-2', 'rounded-full',
        'appearance-none', 'cursor-pointer', 'accent-track-orange-700'
      )
    })
  })
})