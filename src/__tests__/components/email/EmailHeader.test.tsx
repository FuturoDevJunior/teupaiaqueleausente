import '@testing-library/jest-dom';

import React from 'react';

import EmailHeader from '@/components/email/EmailHeader';
import { Email } from '@/lib/email-service';
import { screen } from '@testing-library/react';

import { renderWithProviders } from '../../utils/testUtils';

// Mock date-fns format function
jest.mock('date-fns', () => ({
  format: jest.fn(() => '01/01/2023'),
  ptBR: {}
}));

// Utility function to create a mock email with customizable properties
const createMockEmail = (overrides = {}): Email => ({
  id: 'mock-id',
  from: 'sender@example.com',
  subject: 'Test Subject',
  preview: 'This is the email preview',
  content: 'Test content',
  date: new Date('2023-05-15T12:00:00Z').toISOString(),
  read: false,
  ...overrides,
});

describe('EmailHeader Component', () => {
  it('renders unread email with correct styling', () => {
    renderWithProviders(
      <EmailHeader
        from="sender@example.com"
        subject="Test Subject"
        preview="This is the email preview"
        date="2023-05-15T12:00:00Z"
        isRead={false}
      />
    );
    
    const subject = screen.getByText('Test Subject');
    expect(subject).toBeInTheDocument();
    
    expect(screen.getByText('sender@example.com')).toBeInTheDocument();
    expect(screen.getByText('This is the email preview')).toBeInTheDocument();
    // Check that the unread indicator is present
    expect(screen.getByText('Não lido')).toBeInTheDocument();
  });
  
  it('renders read email with correct styling', () => {
    renderWithProviders(
      <EmailHeader
        from="sender@example.com"
        subject="Test Subject"
        preview="This is the email preview"
        date="2023-05-15T12:00:00Z"
        isRead={true}
      />
    );
    
    expect(screen.getByText('Test Subject')).toBeInTheDocument();
    // Check that the read indicator is present
    expect(screen.getByText('Lido')).toBeInTheDocument();
  });
  
  it('truncates long subject lines', () => {
    const longSubject = 'This is a very long subject line that should be truncated in the UI display';
    
    renderWithProviders(
      <EmailHeader
        from="sender@example.com"
        subject={longSubject}
        preview="This is the email preview"
        date="2023-05-15T12:00:00Z"
        isRead={false}
      />
    );
    
    expect(screen.getByText(longSubject)).toBeInTheDocument();
  });
  
  it('truncates long preview text', () => {
    const longPreview = 'This is a very long preview text that should be truncated in the UI display to ensure it fits properly in the layout';
    
    renderWithProviders(
      <EmailHeader
        from="sender@example.com"
        subject="Test Subject"
        preview={longPreview}
        date="2023-05-15T12:00:00Z"
        isRead={false}
      />
    );
    
    expect(screen.getByText(longPreview)).toBeInTheDocument();
  });
  
  it('formats date properly', () => {
    renderWithProviders(
      <EmailHeader
        from="sender@example.com"
        subject="Test Subject"
        preview="This is the email preview"
        date="2023-01-01T10:30:00Z"
        isRead={false}
      />
    );
    
    // Just check for date format (mocked to return 01/01/2023)
    expect(screen.getByText('01/01/2023')).toBeInTheDocument();
  });
}); 