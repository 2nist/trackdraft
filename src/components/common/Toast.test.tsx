import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ToastContainer, Toast } from './Toast'
import { act } from 'react'

describe('Toast', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  describe('ToastItem', () => {
    it('renders with success type', () => {
      const mockToast: Toast = {
        id: '1',
        message: 'Success message',
        type: 'success',
      }
      const mockOnRemove = vi.fn()

      render(<ToastContainer toasts={[mockToast]} onRemove={mockOnRemove} />)

      expect(screen.getByText('Success message')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /close notification/i })).toBeInTheDocument()
    })

    it('renders with error type', () => {
      const mockToast: Toast = {
        id: '2',
        message: 'Error message',
        type: 'error',
      }
      const mockOnRemove = vi.fn()

      render(<ToastContainer toasts={[mockToast]} onRemove={mockOnRemove} />)

      expect(screen.getByText('Error message')).toBeInTheDocument()
    })

    it('renders with info type', () => {
      const mockToast: Toast = {
        id: '3',
        message: 'Info message',
        type: 'info',
      }
      const mockOnRemove = vi.fn()

      render(<ToastContainer toasts={[mockToast]} onRemove={mockOnRemove} />)

      expect(screen.getByText('Info message')).toBeInTheDocument()
    })

    it('renders with warning type', () => {
      const mockToast: Toast = {
        id: '4',
        message: 'Warning message',
        type: 'warning',
      }
      const mockOnRemove = vi.fn()

      render(<ToastContainer toasts={[mockToast]} onRemove={mockOnRemove} />)

      expect(screen.getByText('Warning message')).toBeInTheDocument()
    })

    it('calls onRemove when close button is clicked', async () => {
      const mockToast: Toast = {
        id: '5',
        message: 'Test message',
        type: 'success',
      }
      const mockOnRemove = vi.fn()

      render(<ToastContainer toasts={[mockToast]} onRemove={mockOnRemove} />)

      const closeButton = screen.getByRole('button', { name: /close notification/i })
      fireEvent.click(closeButton)

      // Wait for the fade-out animation and removal
      await act(async () => {
        vi.advanceTimersByTime(300) // Wait for fade-out animation
      })

      expect(mockOnRemove).toHaveBeenCalledWith('5')
    })

    it('auto-removes after default duration for success toast', async () => {
      const mockToast: Toast = {
        id: '6',
        message: 'Success message',
        type: 'success',
      }
      const mockOnRemove = vi.fn()

      render(<ToastContainer toasts={[mockToast]} onRemove={mockOnRemove} />)

      // Fast-forward time by 3 seconds (default duration for non-error toasts)
      await act(async () => {
        vi.advanceTimersByTime(3000)
      })

      await act(async () => {
        vi.advanceTimersByTime(300) // Wait for fade-out animation
      })

      expect(mockOnRemove).toHaveBeenCalledWith('6')
    })

    it('auto-removes after extended duration for error toast', async () => {
      const mockToast: Toast = {
        id: '7',
        message: 'Error message',
        type: 'error',
      }
      const mockOnRemove = vi.fn()

      render(<ToastContainer toasts={[mockToast]} onRemove={mockOnRemove} />)

      // Fast-forward time by 5 seconds (extended duration for error toasts)
      await act(async () => {
        vi.advanceTimersByTime(5000)
      })

      await act(async () => {
        vi.advanceTimersByTime(300) // Wait for fade-out animation
      })

      expect(mockOnRemove).toHaveBeenCalledWith('7')
    })

    it('respects custom duration', async () => {
      const mockToast: Toast = {
        id: '8',
        message: 'Custom duration message',
        type: 'info',
        duration: 1000, // 1 second
      }
      const mockOnRemove = vi.fn()

      render(<ToastContainer toasts={[mockToast]} onRemove={mockOnRemove} />)

      // Fast-forward time by 1 second
      await act(async () => {
        vi.advanceTimersByTime(1000)
      })

      await act(async () => {
        vi.advanceTimersByTime(300) // Wait for fade-out animation
      })

      expect(mockOnRemove).toHaveBeenCalledWith('8')
    })
  })

  describe('ToastContainer', () => {
    it('renders multiple toasts', () => {
      const mockToasts: Toast[] = [
        {
          id: '1',
          message: 'First message',
          type: 'success',
        },
        {
          id: '2',
          message: 'Second message',
          type: 'error',
        },
      ]
      const mockOnRemove = vi.fn()

      render(<ToastContainer toasts={mockToasts} onRemove={mockOnRemove} />)

      expect(screen.getByText('First message')).toBeInTheDocument()
      expect(screen.getByText('Second message')).toBeInTheDocument()
    })

    it('renders empty container when no toasts', () => {
      const mockOnRemove = vi.fn()

      const { container } = render(<ToastContainer toasts={[]} onRemove={mockOnRemove} />)

      expect(container.firstChild).toBeEmptyDOMElement()
    })
  })
})