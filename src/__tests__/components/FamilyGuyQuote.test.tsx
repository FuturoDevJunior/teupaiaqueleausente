import '@testing-library/jest-dom';

import React from 'react';

import {
  act,
  render,
  screen,
} from '@testing-library/react';

import FamilyGuyQuote from '../../components/FamilyGuyQuote';

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => {
  return {
    __esModule: true,
    motion: {
      div: 'div',
      span: 'span',
    },
    AnimatePresence: ({ children }) => children,
  };
});

// Mock the quotes to have predictable test results
jest.mock('../../data/familyGuyQuotes', () => ({
  quotes: [
    'Test quote 1',
    'Peter: Test quote 2',
    'Stewie: Test quote 3',
  ],
}));

describe('FamilyGuyQuote', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    // Mock Math.random to return predictable values
    jest.spyOn(global.Math, 'random').mockReturnValue(0);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('should display a random quote on initial render', () => {
    render(<FamilyGuyQuote />);
    
    // With Math.random mocked to return 0, it should display the first quote
    expect(screen.getByText(/Test quote 1/)).toBeInTheDocument();
  });

  it('should change the quote after the specified interval', () => {
    render(<FamilyGuyQuote />);
    
    // Initial quote
    expect(screen.getByText(/Test quote 1/)).toBeInTheDocument();
    
    // Mock Math.random to return a different value for the next quote
    jest.spyOn(global.Math, 'random').mockReturnValue(0.5);
    
    // Fast-forward time by 8 seconds (the interval specified in the component)
    act(() => {
      jest.advanceTimersByTime(8000);
    });
    
    // After the interval, it should display a different quote with character formatting
    expect(screen.getByText(/Peter:/)).toBeInTheDocument();
  });

  it('should clear the interval when unmounted', () => {
    const clearIntervalSpy = jest.spyOn(window, 'clearInterval');
    
    const { unmount } = render(<FamilyGuyQuote />);
    
    // Unmount the component
    unmount();
    
    // Should have called clearInterval
    expect(clearIntervalSpy).toHaveBeenCalled();
  });

  it('should format quotes with character names correctly', () => {
    // Set up Math.random to return the value for a quote with character name
    jest.spyOn(global.Math, 'random').mockReturnValue(0.5);
    
    render(<FamilyGuyQuote />);
    
    // Check that the character name and quote are displayed
    expect(screen.getByText(/Peter:/)).toBeInTheDocument();
    expect(screen.getByText(/Test quote 2/)).toBeInTheDocument();
  });
}); 