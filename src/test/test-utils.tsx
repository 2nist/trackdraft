import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'

// Custom render function that includes common providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <BrowserRouter>
      {children}
    </BrowserRouter>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }

// Custom test utilities
export const createMockSong = () => ({
  id: 'test-song-1',
  title: 'Test Song',
  artist: 'Test Artist',
  key: 'C',
  tempo: 120,
  sections: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
})

export const createMockChordProgression = () => ({
  id: 'test-progression-1',
  name: 'Test Progression',
  chords: ['Cmaj7', 'Dm7', 'G7', 'Cmaj7'],
  key: 'C',
  createdAt: new Date().toISOString(),
})

export const createMockLyrics = () => ({
  id: 'test-lyrics-1',
  title: 'Test Lyrics',
  content: 'Verse 1\nLine 1\nLine 2\nLine 3',
  sections: [
    {
      type: 'verse',
      lines: ['Line 1', 'Line 2', 'Line 3'],
    },
  ],
  createdAt: new Date().toISOString(),
})

export const waitForNextTick = () => new Promise(resolve => setTimeout(resolve, 0))

export const mockConsoleError = () => {
  const originalError = console.error
  beforeAll(() => {
    console.error = vi.fn()
  })
  afterAll(() => {
    console.error = originalError
  })
}