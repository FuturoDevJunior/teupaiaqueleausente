import '@testing-library/jest-dom';

import React from 'react';

import CookieConsent from '@/components/CookieConsent';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithProviders } from '../utils/testUtils';

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
    AnimatePresence: ({ children }: React.PropsWithChildren<unknown>) => <>{children}</>,
  };
});

// Mock localStorage
const localStorageMock = (function() {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => {
      return store[key] || null;
    }),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('CookieConsent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.localStorage.clear();
  });

  it('renders correctly when open is true', () => {
    renderWithProviders(<CookieConsent open={true} onAccept={() => {}} />);
    
    expect(screen.getByText(/Usamos cookies/i)).toBeInTheDocument();
    expect(screen.getByText(/Sim, concordo/i)).toBeInTheDocument();
    expect(screen.getByText(/Mais detalhes/i)).toBeInTheDocument();
  });

  it('does not render when open is false', () => {
    const handleAccept = jest.fn();
    renderWithProviders(<CookieConsent open={false} onAccept={handleAccept} />);
    
    expect(screen.queryByText(/Este site usa cookies... ou não!/i)).not.toBeInTheDocument();
  });

  it('calls onAccept and stores in localStorage when "Sim, concordo" is clicked', () => {
    const handleAccept = jest.fn();
    
    renderWithProviders(<CookieConsent open={true} onAccept={handleAccept} />);
    
    const acceptButton = screen.getByText(/Sim, concordo/i);
    userEvent.click(acceptButton);
    
    expect(handleAccept).toHaveBeenCalledTimes(1);
    expect(window.localStorage.setItem).toHaveBeenCalledWith('cookie-consent-accepted', 'true');
  });

  it('toggles details section when "Mais detalhes" is clicked', () => {
    renderWithProviders(<CookieConsent open={true} onAccept={() => {}} />);
    
    // Initially the details section should not be visible
    expect(screen.queryByText(/Cookies essenciais/i)).not.toBeInTheDocument();
    
    // Click the details button
    const detailsButton = screen.getByText(/Mais detalhes/i);
    userEvent.click(detailsButton);
    
    // Now the details section should be visible
    expect(screen.getByText(/Cookies essenciais/i)).toBeInTheDocument();
    
    // Click again to hide details
    userEvent.click(detailsButton);
    
    // Details should be hidden again
    expect(screen.queryByText(/Cookies essenciais/i)).not.toBeInTheDocument();
  });

  it('accepts cookies when X button is clicked', () => {
    const handleAccept = jest.fn();
    
    renderWithProviders(<CookieConsent open={true} onAccept={handleAccept} />);
    
    // Find and click the close button
    const closeButton = screen.getByLabelText(/Fechar/i);
    userEvent.click(closeButton);
    
    expect(handleAccept).toHaveBeenCalledTimes(1);
    expect(window.localStorage.setItem).toHaveBeenCalledWith('cookie-consent-accepted', 'true');
  });
}); 