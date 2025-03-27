import '@testing-library/jest-dom';

import React from 'react';

import EmailList from '@/components/email/EmailList';
import { Email } from '@/lib/email-service';
import {
  fireEvent,
  render,
  screen,
} from '@testing-library/react';

// Mock para date-fns format
jest.mock('date-fns', () => ({
  format: jest.fn(() => '01/01/2023'),
}));

describe('EmailList Component', () => {
  const mockEmails: Email[] = [
    {
      id: '1',
      from: 'test@example.com',
      subject: 'Test Email 1',
      content: 'This is a test email body',
      preview: 'This is a preview',
      date: new Date('2023-01-01').toISOString(),
      read: false,
    },
    {
      id: '2',
      from: 'another@example.com',
      subject: 'Test Email 2',
      content: 'This is another test email body',
      preview: 'This is another preview',
      date: new Date('2023-01-02').toISOString(),
      read: true,
    },
  ];

  const mockProps = {
    messages: mockEmails,
    checkingEmail: false,
    onCheckEmails: jest.fn(),
    onDeleteEmail: jest.fn(),
    onReadEmail: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders empty state when no emails are available', () => {
    render(
      <EmailList
        {...mockProps}
        messages={[]}
      />
    );

    expect(screen.getByText('Nenhum email recebido')).toBeInTheDocument();
  });

  it('renders loading state when checking for emails', () => {
    render(
      <EmailList
        {...mockProps}
        messages={[]} // No emails when checking
        checkingEmail={true}
      />
    );

    // Check for loading spinner
    const loadingElement = screen.getByText(/0 emails recebidos/i).parentElement?.previousSibling;
    expect(loadingElement).toBeInTheDocument();
    expect(screen.getByText('0 emails recebidos')).toBeInTheDocument();
  });

  it('renders emails correctly with proper formatting', () => {
    render(<EmailList {...mockProps} />);

    // Verificar se os emails são exibidos
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText('Test Email 1')).toBeInTheDocument();
    expect(screen.getByText('This is a preview')).toBeInTheDocument();
    
    expect(screen.getByText('another@example.com')).toBeInTheDocument();
    expect(screen.getByText('Test Email 2')).toBeInTheDocument();
    expect(screen.getByText('This is another preview')).toBeInTheDocument();
  });

  it('calls onReadEmail when clicking on an unread email', () => {
    render(<EmailList {...mockProps} />);

    // Find the email container by its subject text
    const emailElement = screen.getByText('Test Email 1');
    const emailContainer = emailElement.closest('button');
    
    // Make sure it's not null before clicking
    expect(emailContainer).not.toBeNull();
    
    if (emailContainer) {
      fireEvent.click(emailContainer);
      expect(mockProps.onReadEmail).toHaveBeenCalledWith('1');
    }
  });

  it('does not call onReadEmail when clicking on a read email', () => {
    render(<EmailList {...mockProps} />);

    // Find the second (read) email
    const emailElement = screen.getByText('Test Email 2');
    const emailContainer = emailElement.closest('button');
    
    // Make sure it's not null before clicking
    expect(emailContainer).not.toBeNull();
    
    if (emailContainer) {
      fireEvent.click(emailContainer);
      expect(mockProps.onReadEmail).not.toHaveBeenCalled();
    }
  });

  it('calls onDeleteEmail when clicking on the delete button', () => {
    render(<EmailList {...mockProps} />);

    // Find all buttons that might be delete buttons
    const buttons = screen.getAllByRole('button');
    
    // Find a button that has the trash icon
    const deleteButton = buttons.find(button => 
      button.innerHTML.includes('Excluir email') || 
      button.querySelector('.lucide-trash2')
    );
    
    expect(deleteButton).toBeDefined();
    
    if (deleteButton) {
      fireEvent.click(deleteButton);
      expect(mockProps.onDeleteEmail).toHaveBeenCalled();
    }
  });

  it('calls onCheckEmails when clicking on the refresh button', () => {
    render(<EmailList {...mockProps} />);

    // Find the refresh button by looking at all buttons
    const buttons = screen.getAllByRole('button');
    
    // Look for the refresh button
    const refreshButton = buttons.find(button => 
      button.innerHTML.includes('refresh-cw')
    );
    
    expect(refreshButton).toBeDefined();
    
    if (refreshButton) {
      fireEvent.click(refreshButton);
      expect(mockProps.onCheckEmails).toHaveBeenCalled();
    }
  });

  it('displays correct email count in footer', () => {
    render(<EmailList {...mockProps} />);
    
    // Verificar se o contador de emails está correto
    expect(screen.getByText('2 emails recebidos')).toBeInTheDocument();
    
    // Testar com apenas um email
    render(
      <EmailList
        {...mockProps}
        messages={[mockEmails[0]]}
      />
    );
    
    // Verificar se a mensagem singular está correta
    expect(screen.getByText('1 email recebido')).toBeInTheDocument();
  });
}); 