import '@testing-library/jest-dom';

import React from 'react';

import { act } from 'react-dom/test-utils';

import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';

import EasterEgg from '../../components/EasterEgg';

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => {
  const actual = jest.requireActual('framer-motion');
  return {
    ...actual,
    motion: {
      div: ({ children, ...props }: React.PropsWithChildren<React.HTMLAttributes<HTMLDivElement>>) => (
        <div data-testid="motion-div" {...props}>
          {children}
        </div>
      ),
    },
  };
});

describe('EasterEgg', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should not show easter egg initially', () => {
    render(<EasterEgg />);
    expect(screen.queryByText('Easter Egg!')).not.toBeInTheDocument();
  });

  it('should show easter egg after 5 clicks', () => {
    render(<EasterEgg />);
    
    const clickableArea = screen.getByTitle('Clique várias vezes');
    
    // Click 4 times - Easter egg should not appear yet
    for (let i = 0; i < 4; i++) {
      fireEvent.click(clickableArea);
    }
    
    expect(screen.queryByText('Easter Egg!')).not.toBeInTheDocument();
    
    // Click the 5th time - Easter egg should appear
    fireEvent.click(clickableArea);
    
    expect(screen.getByText('Easter Egg!')).toBeInTheDocument();
    expect(screen.getByText('Você descobriu o Easter Egg do Family Guy!')).toBeInTheDocument();
    expect(screen.getByAltText('Family Guy Easter Egg')).toBeInTheDocument();
  });

  it('should hide easter egg after 3 seconds', async () => {
    render(<EasterEgg />);
    
    const clickableArea = screen.getByTitle('Clique várias vezes');
    
    // Click 5 times to show the easter egg
    for (let i = 0; i < 5; i++) {
      fireEvent.click(clickableArea);
    }
    
    // Easter egg should be visible
    expect(screen.getByText('Easter Egg!')).toBeInTheDocument();
    
    // Fast-forward time by 3 seconds
    act(() => {
      jest.advanceTimersByTime(3000);
    });
    
    // Easter egg should disappear
    await waitFor(() => {
      expect(screen.queryByText('Easter Egg!')).not.toBeInTheDocument();
    });
  });

  it('should hide easter egg when clicked', () => {
    render(<EasterEgg />);
    
    const clickableArea = screen.getByTitle('Clique várias vezes');
    
    // Click 5 times to show the easter egg
    for (let i = 0; i < 5; i++) {
      fireEvent.click(clickableArea);
    }
    
    // Easter egg should be visible
    const easterEggModal = screen.getByTestId('motion-div');
    
    // Click on the modal to close it
    fireEvent.click(easterEggModal);
    
    // Easter egg should disappear
    expect(screen.queryByText('Easter Egg!')).not.toBeInTheDocument();
  });
}); 