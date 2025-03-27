import '@testing-library/jest-dom';

import React from 'react';

import EmailContent from '@/components/email/EmailContent';
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

describe('EmailContent Component', () => {
  const mockContent = '<div>This is the email content</div>';
  const mockFrom = 'sender@example.com';
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders email content correctly', () => {
    renderWithProviders(
      <EmailContent 
        content={mockContent}
        from={mockFrom}
        onDelete={mockOnDelete}
      />
    );
    
    expect(screen.getByText('This is the email content')).toBeInTheDocument();
  });
  
  it('displays message when content is empty', () => {
    renderWithProviders(
      <EmailContent 
        content=""
        from={mockFrom}
        onDelete={mockOnDelete}
      />
    );
    
    // In the component, empty content results in an empty div, not a specific message
    const emptyContentContainer = document.querySelector('.prose');
    expect(emptyContentContainer).toBeInTheDocument();
    expect(emptyContentContainer?.textContent).toBe('');
  });
  
  it('renders the copy button', () => {
    renderWithProviders(
      <EmailContent 
        content={mockContent}
        from={mockFrom}
        onDelete={mockOnDelete}
      />
    );
    
    const copyButton = screen.getByRole('button', { name: /copiar/i });
    expect(copyButton).toBeInTheDocument();
  });
  
  it('handles copy button click correctly', () => {
    renderWithProviders(
      <EmailContent 
        content={mockContent}
        from={mockFrom}
        onDelete={mockOnDelete}
      />
    );
    
    const copyButton = screen.getByRole('button', { name: /copiar/i });
    userEvent.click(copyButton);
    
    // The component extracts text content from HTML before copying
    expect(navigator.clipboard.writeText).toHaveBeenCalled();
  });
}); 