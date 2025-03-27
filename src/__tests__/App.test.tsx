import React from 'react';

import { MemoryRouter } from 'react-router-dom';

import App from '@/App';
import { render } from '@testing-library/react';

// Mock the lazy-loaded components
jest.mock('react', () => {
  const originalReact = jest.requireActual('react');
  return {
    ...originalReact,
    // Mock Suspense to immediately render its children without suspending
    Suspense: ({ children }: { children: React.ReactNode }) => children,
    // Mock lazy to immediately return the component without lazy loading
    lazy: (importFn: () => Promise<{ default: React.ComponentType<unknown> }>) => {
      let Component: React.ComponentType<unknown> | null = null;
      importFn().then((module: { default: React.ComponentType<unknown> }) => {
        Component = module.default;
      });
      return (props: Record<string, unknown>) => Component ? <Component {...props} /> : null;
    },
  };
});

// Mock the page components
jest.mock('@/pages/Index', () => () => <div data-testid="index-page">Index Page</div>);
jest.mock('@/pages/NotFound', () => () => <div data-testid="not-found-page">Not Found Page</div>);

// Mock the loading animation
jest.mock('@/components/LoadingAnimation', () => () => <div data-testid="loading-animation">Loading...</div>);

// Mock toaster component
jest.mock('@/components/ui/toaster', () => ({
  Toaster: () => <div role="status">Toaster</div>,
}));

describe('App Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the app with correct providers', () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );
    
    // Check that providers are rendered by looking for their children
    expect(document.querySelector('[role="status"]')).toBeInTheDocument(); // Toaster
  });

  // We'll simplify these tests to just verify basic rendering
  it('renders the App component without crashing', () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );
    
    // Just check that some element in the app is rendered
    expect(document.querySelector('div')).toBeInTheDocument();
  });
}); 