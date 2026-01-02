import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import HarmonyView from './HarmonyView'

// Mock the songStore
const mockUseSongStore = vi.fn()

vi.mock('../../store/songStore', () => ({
  useSongStore: () => mockUseSongStore(),
}))

// Mock the EnhancedProgressionBuilder since we're not testing it yet
vi.mock('./EnhancedProgressionBuilder', () => ({
  default: () => <div data-testid="enhanced-progression-builder">Progression Builder</div>
}))

describe('HarmonyView', () => {
  describe('When no current song exists', () => {
    it('shows empty state message when currentSong is null', () => {
      mockUseSongStore.mockReturnValue({
        currentSong: null,
      })

      render(<HarmonyView />)

      expect(screen.getByText('Create a song first to explore harmony')).toBeInTheDocument()
      expect(screen.queryByTestId('enhanced-progression-builder')).not.toBeInTheDocument()
    })

    it('shows empty state message when currentSong is undefined', () => {
      mockUseSongStore.mockReturnValue({
        currentSong: undefined,
      })

      render(<HarmonyView />)

      expect(screen.getByText('Create a song first to explore harmony')).toBeInTheDocument()
      expect(screen.queryByTestId('enhanced-progression-builder')).not.toBeInTheDocument()
    })

    it('renders with correct styling for empty state', () => {
      mockUseSongStore.mockReturnValue({
        currentSong: null,
      })

      const { container } = render(<HarmonyView />)

      const emptyStateDiv = container.querySelector('.card')
      expect(emptyStateDiv).toBeInTheDocument()
      expect(emptyStateDiv).toHaveClass('text-center', 'py-12')
    })

    it('empty state message has correct styling', () => {
      mockUseSongStore.mockReturnValue({
        currentSong: null,
      })

      render(<HarmonyView />)

      const message = screen.getByText('Create a song first to explore harmony')
      expect(message).toHaveClass('text-gray-400')
    })
  })

  describe('When current song exists', () => {
    it('renders EnhancedProgressionBuilder when currentSong exists', () => {
      const mockSong = {
        id: 'test-song',
        title: 'Test Song',
        key: { root: 'C', mode: 'major' },
        tempo: 120,
        sections: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockUseSongStore.mockReturnValue({
        currentSong: mockSong,
      })

      render(<HarmonyView />)

      expect(screen.getByTestId('enhanced-progression-builder')).toBeInTheDocument()
      expect(screen.queryByText('Create a song first to explore harmony')).not.toBeInTheDocument()
    })

    it('passes through to EnhancedProgressionBuilder without props', () => {
      const mockSong = {
        id: 'test-song',
        title: 'Test Song',
        key: { root: 'C', mode: 'major' },
        tempo: 120,
        sections: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockUseSongStore.mockReturnValue({
        currentSong: mockSong,
      })

      render(<HarmonyView />)

      // The mocked component should render its content
      expect(screen.getByText('Progression Builder')).toBeInTheDocument()
    })
  })

  describe('Component behavior', () => {
    it('calls useSongStore hook', () => {
      mockUseSongStore.mockReturnValue({
        currentSong: null,
      })

      render(<HarmonyView />)

      expect(mockUseSongStore).toHaveBeenCalled()
    })

    it('re-renders when song store changes', () => {
      const { rerender } = render(<HarmonyView />)

      // Initially no song
      expect(screen.getByText('Create a song first to explore harmony')).toBeInTheDocument()

      // Change to having a song
      const mockSong = {
        id: 'test-song',
        title: 'Test Song',
        key: { root: 'C', mode: 'major' },
        tempo: 120,
        sections: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockUseSongStore.mockReturnValue({
        currentSong: mockSong,
      })

      rerender(<HarmonyView />)

      expect(screen.getByTestId('enhanced-progression-builder')).toBeInTheDocument()
      expect(screen.queryByText('Create a song first to explore harmony')).not.toBeInTheDocument()
    })

    it('renders without crashing', () => {
      mockUseSongStore.mockReturnValue({
        currentSong: null,
      })

      expect(() => render(<HarmonyView />)).not.toThrow()
    })
  })
})