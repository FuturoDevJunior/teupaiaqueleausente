import {
  render,
  screen,
} from '@testing-library/react';

import LoadingAnimation from '../../components/LoadingAnimation';

// Mock the Lucide icons
jest.mock('lucide-react', () => ({
  RotateCw: () => <div data-testid="mock-rotate-icon">Icon</div>
}));

describe('LoadingAnimation', () => {
  it('renders the loading animation', () => {
    render(<LoadingAnimation />);
    const loadingElement = screen.getByTestId('loading-animation');
    expect(loadingElement).toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
}); 