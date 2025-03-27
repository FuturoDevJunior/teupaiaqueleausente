import Index from '@/pages/Index';
import { QueryClient } from '@tanstack/react-query';
import { screen } from '@testing-library/react';

import { renderWithProviders } from '../utils/testUtils';

// Mock components that are used in the Index page
jest.mock('@/components/email/EmailBox', () => ({
  __esModule: true,
  default: () => <div data-testid="mock-email-box">EmailBox Mock</div>,
}));

jest.mock('@/components/CookieConsent', () => ({
  __esModule: true,
  default: () => <div data-testid="mock-cookie-consent">CookieConsent Mock</div>,
}));

// Create a test QueryClient
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 0,
      gcTime: 0,
    },
  },
});

describe('Index page', () => {
  beforeEach(() => {
    renderWithProviders(<Index />);
  });

  it('renders the main container', () => {
    const mainContainer = screen.getByRole('main');
    expect(mainContainer).toBeInTheDocument();
  });

  it('renders the EmailBox component', () => {
    const emailBox = screen.getByTestId('mock-email-box');
    expect(emailBox).toBeInTheDocument();
  });

  it('renders the CookieConsent component', () => {
    const cookieConsent = screen.getByTestId('mock-cookie-consent');
    expect(cookieConsent).toBeInTheDocument();
  });
}); 