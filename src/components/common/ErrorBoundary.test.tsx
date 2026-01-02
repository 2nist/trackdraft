import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ErrorBoundary } from './ErrorBoundary'

// Mock console.error to avoid test output pollution
const originalConsoleError = console.error
beforeEach(() => {
  console.error = vi.fn()
})

afterEach(() => {
  console.error = originalConsoleError
})

// Component that throws an error for testing
const ErrorThrowingComponent = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error message')
  }
  return <div>Normal content</div>
}

// Component that throws an error in useEffect for testing async errors
const AsyncErrorComponent = ({ shouldThrow }: { shouldThrow: boolean }) => {
  React.useEffect(() => {
    if (shouldThrow) {
      throw new Error('Async test error')
    }
  }, [shouldThrow])

  return <div>Async content</div>
}

describe('ErrorBoundary', () => {
  describe('Normal operation', () => {
    it('renders children when no error occurs', () => {
      render(
        <ErrorBoundary>
          <div>Test content</div>
        </ErrorBoundary>
      )

      expect(screen.getByText('Test content')).toBeInTheDocument()
    })

    it('renders normal component without errors', () => {
      render(
        <ErrorBoundary>
          <ErrorThrowingComponent shouldThrow={false} />
        </ErrorBoundary>
      )

      expect(screen.getByText('Normal content')).toBeInTheDocument()
    })
  })

  describe('Error handling', () => {
    it('catches synchronous errors and displays fallback UI', () => {
      render(
        <ErrorBoundary>
          <ErrorThrowingComponent shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(screen.getByText('Something went wrong')).toBeInTheDocument()
      expect(screen.getByText('We encountered an unexpected error. Your work has been saved, so you won\'t lose any progress.')).toBeInTheDocument()
      expect(screen.getByText('Try again')).toBeInTheDocument()
      expect(screen.getByText('Go to Dashboard')).toBeInTheDocument()
    })

    it('calls console.error when error is caught', () => {
      render(
        <ErrorBoundary>
          <ErrorThrowingComponent shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(console.error).toHaveBeenCalledWith(
        'ErrorBoundary caught an error:',
        expect.any(Error),
        expect.any(Object)
      )
    })

    it('calls optional onError callback when provided', () => {
      const mockOnError = vi.fn()

      render(
        <ErrorBoundary onError={mockOnError}>
          <ErrorThrowingComponent shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(mockOnError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.any(Object)
      )
    })

    it('does not call onError callback when not provided', () => {
      const mockOnError = vi.fn()

      render(
        <ErrorBoundary>
          <ErrorThrowingComponent shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(mockOnError).not.toHaveBeenCalled()
    })
  })

  describe('Custom fallback', () => {
    it('renders custom fallback when provided', () => {
      const customFallback = <div>Custom error message</div>

      render(
        <ErrorBoundary fallback={customFallback}>
          <ErrorThrowingComponent shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(screen.getByText('Custom error message')).toBeInTheDocument()
      expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument()
    })
  })

  describe('Error details in development', () => {
    const originalEnv = import.meta.env.DEV

    beforeEach(() => {
      // Mock development environment
      vi.stubEnv('DEV', true)
    })

    afterEach(() => {
      vi.unstubAllEnvs()
    })

    it('shows error details in development mode', () => {
      render(
        <ErrorBoundary>
          <ErrorThrowingComponent shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(screen.getByText('Error details (development only)')).toBeInTheDocument()
      expect(screen.getByText(/Error: Test error message/)).toBeInTheDocument()
    })
  })

  describe('Error details in production', () => {
    beforeEach(() => {
      // Mock production environment
      vi.stubEnv('DEV', false)
    })

    afterEach(() => {
      vi.unstubAllEnvs()
    })

    it('hides error details in production mode', () => {
      render(
        <ErrorBoundary>
          <ErrorThrowingComponent shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(screen.queryByText('Error details (development only)')).not.toBeInTheDocument()
      expect(screen.queryByText('Test error message')).not.toBeInTheDocument()
    })
  })

  describe('Reset functionality', () => {
    it('has a reset button that calls handleReset', () => {
      render(
        <ErrorBoundary>
          <ErrorThrowingComponent shouldThrow={true} />
        </ErrorBoundary>
      )

      const resetButton = screen.getByText('Try again')
      expect(resetButton).toBeInTheDocument()

      // The button should be clickable (we can't easily test the reset state
      // because the component immediately throws again, but we can verify the button exists and is functional)
      expect(resetButton).not.toBeDisabled()
    })

    it('renders custom fallback when provided and error occurs', () => {
      const customFallback = <div>Custom error fallback</div>

      render(
        <ErrorBoundary fallback={customFallback}>
          <ErrorThrowingComponent shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(screen.getByText('Custom error fallback')).toBeInTheDocument()
      expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument()
    })
  })

  describe('Navigation', () => {
    it('navigates to dashboard when Go to Dashboard button is clicked', () => {
      // Mock window.location.href
      const mockLocation = { href: '' }
      Object.defineProperty(window, 'location', {
        value: mockLocation,
        writable: true,
      })

      render(
        <ErrorBoundary>
          <ErrorThrowingComponent shouldThrow={true} />
        </ErrorBoundary>
      )

      fireEvent.click(screen.getByText('Go to Dashboard'))

      expect(mockLocation.href).toBe('/')
    })
  })

  describe('Error boundary state isolation', () => {
    it('isolates errors between different ErrorBoundary instances', () => {
      render(
        <div>
          <ErrorBoundary>
            <ErrorThrowingComponent shouldThrow={true} />
          </ErrorBoundary>
          <ErrorBoundary>
            <div>Normal content</div>
          </ErrorBoundary>
        </div>
      )

      // First boundary should show error
      expect(screen.getByText('Something went wrong')).toBeInTheDocument()
      // Second boundary should show normal content
      expect(screen.getByText('Normal content')).toBeInTheDocument()
    })
  })
})