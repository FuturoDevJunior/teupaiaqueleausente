import { renderHook } from '@testing-library/react';

import { useIsMobile } from '../../hooks/use-mobile';

describe('useIsMobile', () => {
  const originalInnerWidth = window.innerWidth
  const originalMatchMedia = window.matchMedia

  // Mock matchMedia
  beforeEach(() => {
    let listeners: Array<EventListener> = []
    window.matchMedia = jest.fn().mockImplementation((query) => ({
      matches: window.innerWidth < 768,
      media: query,
      onchange: null,
      addEventListener: jest.fn().mockImplementation((event, cb) => {
        listeners.push(cb)
      }),
      removeEventListener: jest.fn().mockImplementation((event, cb) => {
        listeners = listeners.filter(listener => listener !== cb)
      }),
      dispatchEvent: jest.fn(),
    }))
  })

  // Restore original values
  afterEach(() => {
    window.innerWidth = originalInnerWidth
    window.matchMedia = originalMatchMedia
  })

  it('should return true when screen width is less than mobile breakpoint', () => {
    // Set window inner width to mobile size
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 767,
    })

    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(true)
  })

  it('should return false when screen width is greater than or equal to mobile breakpoint', () => {
    // Set window inner width to desktop size
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    })

    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(false)
  })

  // Simplified test that doesn't rely on window resize events
  it('should initialize with the correct value based on window width', () => {
    // Set window inner width to mobile size
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 600,
    })

    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(true)

    // Clean up
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    })
  })
}) 