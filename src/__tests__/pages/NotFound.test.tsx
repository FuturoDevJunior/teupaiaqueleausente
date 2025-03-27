import { BrowserRouter } from 'react-router-dom';

import NotFound from '@/pages/NotFound';
import {
  render,
  screen,
} from '@testing-library/react';

describe('NotFound page', () => {
  beforeEach(() => {
    render(
      <BrowserRouter>
        <NotFound />
      </BrowserRouter>
    );
  });

  it('renders the 404 message', () => {
    expect(screen.getByText(/404/)).toBeInTheDocument();
  });

  it('renders a page not found message', () => {
    expect(screen.getByText(/page not found/i)).toBeInTheDocument();
  });

  it('renders a link to go back to home', () => {
    const homeLink = screen.getByRole('link', { name: /return to home/i });
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute('href', '/');
  });
}); 