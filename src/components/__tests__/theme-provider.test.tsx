import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ThemeProvider, useTheme } from '../theme-provider'

// Test component that uses the theme hook
const ThemeTestComponent = () => {
  const { theme, setTheme } = useTheme()
  
  return (
    <div>
      <span data-testid="current-theme">{theme}</span>
      <button data-testid="set-light" onClick={() => setTheme('light')}>
        Light
      </button>
      <button data-testid="set-dark" onClick={() => setTheme('dark')}>
        Dark
      </button>
      <button data-testid="set-system" onClick={() => setTheme('system')}>
        System
      </button>
    </div>
  )
}

const renderWithThemeProvider = (defaultTheme: 'dark' | 'light' | 'system' = 'system') => {
  return render(
    <ThemeProvider defaultTheme={defaultTheme} storageKey="test-theme">
      <ThemeTestComponent />
    </ThemeProvider>
  )
}

describe('ThemeProvider', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
    // Remove any theme classes from document
    document.documentElement.classList.remove('light', 'dark')
    
    // Mock window.matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })
  })

  it('should provide theme context with default system theme', () => {
    renderWithThemeProvider()
    
    expect(screen.getByTestId('current-theme')).toHaveTextContent('system')
  })

  it('should allow changing theme to light', () => {
    renderWithThemeProvider()
    
    fireEvent.click(screen.getByTestId('set-light'))
    
    expect(screen.getByTestId('current-theme')).toHaveTextContent('light')
    expect(document.documentElement.classList.contains('light')).toBe(true)
  })

  it('should allow changing theme to dark', () => {
    renderWithThemeProvider()
    
    fireEvent.click(screen.getByTestId('set-dark'))
    
    expect(screen.getByTestId('current-theme')).toHaveTextContent('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('should persist theme in localStorage', () => {
    renderWithThemeProvider()
    
    fireEvent.click(screen.getByTestId('set-dark'))
    
    expect(localStorage.getItem('test-theme')).toBe('dark')
  })

  it('should use default theme when provided', () => {
    renderWithThemeProvider('light')
    
    expect(screen.getByTestId('current-theme')).toHaveTextContent('light')
  })
})