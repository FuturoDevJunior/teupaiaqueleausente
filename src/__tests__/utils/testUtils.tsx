import * as React from 'react';
import { ReactElement } from 'react';

import { BrowserRouter } from 'react-router-dom';

import { ThemeProvider } from '@/components/theme/theme-provider';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import {
  render as tlRender,
  RenderOptions,
} from '@testing-library/react';

// Create a testing query client
const testQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      gcTime: 0,
      staleTime: 0,
      refetchOnWindowFocus: false,
    },
  },
});

// Setup mocks for react-router-dom to prevent nesting issues
jest.mock('react-router-dom', () => {
  const originalModule = jest.requireActual('react-router-dom');
  return {
    __esModule: true,
    ...originalModule,
    BrowserRouter: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    Route: ({ element }: { path?: string; element: React.ReactElement }) => element || null,
    Routes: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

// Define provider wrapper component
function AllTheProviders({ children }: { children: React.ReactNode }) {
  return (
    <BrowserRouter>
      <QueryClientProvider client={testQueryClient}>
        <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
          {children}
        </ThemeProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

/**
 * Custom render that includes all providers
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return tlRender(ui, { 
    wrapper: (props) => <AllTheProviders {...props} />,
    ...options 
  });
}

/**
 * Render with router only (alias for renderWithProviders for backwards compatibility)
 */
export function renderWithRouter(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return renderWithProviders(ui, options);
}

/**
 * Basic render with just theme provider
 */
export function render(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return tlRender(ui, { 
    wrapper: (props) => (
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        {props.children}
      </ThemeProvider>
    ),
    ...options 
  });
}

// Export everything from testing-library for convenience
export * from '@testing-library/react'; 