import '@testing-library/jest-dom';

import React from 'react';

import EmailGenerator from '@/components/email/EmailGenerator';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithProviders } from '../../utils/testUtils';

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn().mockImplementation(() => Promise.resolve()),
  },
});

// Mock toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('EmailGenerator Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the component with initial state', () => {
    renderWithProviders(
      <EmailGenerator 
        email="test@example.com" 
        generatingEmail={false}
        onGenerateNew={jest.fn()}
      />
    );

    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /novo email/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /copiar/i })).toBeInTheDocument();
  });

  it('shows loading state when generating email', () => {
    renderWithProviders(
      <EmailGenerator 
        email="" 
        generatingEmail={true}
        onGenerateNew={jest.fn()}
      />
    );

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(screen.getByText(/gerando email/i)).toBeInTheDocument();
  });

  it('calls onGenerateNew when new button is clicked', () => {
    const handleGenerateNew = jest.fn();
    
    renderWithProviders(
      <EmailGenerator 
        email="test@example.com" 
        generatingEmail={false}
        onGenerateNew={handleGenerateNew}
      />
    );

    const newButton = screen.getByRole('button', { name: /novo email/i });
    userEvent.click(newButton);

    expect(handleGenerateNew).toHaveBeenCalledTimes(1);
  });

  it('copies email to clipboard when copy button is clicked', async () => {
    renderWithProviders(
      <EmailGenerator 
        email="test@example.com" 
        generatingEmail={false}
        onGenerateNew={jest.fn()}
      />
    );

    const copyButton = screen.getByRole('button', { name: /copiar/i });
    userEvent.click(copyButton);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('test@example.com');
  });
}); 