import {
  render,
  screen,
} from '@testing-library/react';

import ErrorBoundary from '../../components/ErrorBoundary';

// Create a component that will throw an error
const ErrorComponent = () => {
  throw new Error('Test error');
};

describe('ErrorBoundary', () => {
  // Suppress error messages from the intentional test error
  const originalConsoleError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });

  afterAll(() => {
    console.error = originalConsoleError;
  });

  it('renders fallback UI when an error occurs', () => {
    render(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>
    );
    
    expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
    expect(screen.getByText(/Test error/i)).toBeInTheDocument();
    expect(screen.getByText(/Refresh Page/i)).toBeInTheDocument();
  });

  it('renders children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <div data-testid="child-component">Child Component</div>
      </ErrorBoundary>
    );
    
    expect(screen.getByTestId('child-component')).toBeInTheDocument();
    expect(screen.queryByText(/Something went wrong/i)).not.toBeInTheDocument();
  });
}); 