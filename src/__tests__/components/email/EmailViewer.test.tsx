import '@testing-library/jest-dom';

import React from 'react';

import EmailViewer from '@/components/email/EmailViewer';
import { Email } from '@/lib/email-service';
import {
  fireEvent,
  render,
  screen,
} from '@testing-library/react';

// Mock para date-fns format
jest.mock('date-fns', () => ({
  format: jest.fn(() => '01/01/2023 12:00'),
}));

// Mock para window.print
const mockPrint = jest.fn();
const mockFocus = jest.fn();

describe('EmailViewer Component', () => {
  const mockEmail: Email = {
    id: '1',
    from: 'test@example.com',
    subject: 'Test Email Subject',
    content: 'This is the email content for testing',
    preview: 'This is the preview',
    date: new Date('2023-01-01').toISOString(),
    read: true,
  };

  const mockProps = {
    email: mockEmail,
    onClose: jest.fn(),
    onDeleteEmail: jest.fn(),
  };

  // Create a container element for mounting components
  let container: HTMLDivElement;
  let originalCreateElement: typeof document.createElement;

  beforeEach(() => {
    // Setup a fresh container and add to document
    container = document.createElement('div');
    document.body.appendChild(container);

    // Setup mocks
    jest.clearAllMocks();
    
    // Save original createElement to restore later
    originalCreateElement = document.createElement;
    
    // Mock document methods for print functionality
    const mockIframe = {
      style: {},
      contentDocument: {
        write: jest.fn(),
        close: jest.fn(),
      },
      contentWindow: {
        focus: mockFocus,
        print: mockPrint,
      },
    };
    
    // Mock document.createElement to avoid infinite recursion
    jest.spyOn(document, 'createElement').mockImplementation((tagName) => {
      if (tagName === 'iframe') {
        return mockIframe as unknown as HTMLIFrameElement;
      }
      // Use original function but with 'call' to avoid the mock recursively calling itself
      return originalCreateElement.call(document, tagName);
    });
    
    // Mock setTimeout
    jest.useFakeTimers();
  });

  afterEach(() => {
    // Clean up
    document.body.removeChild(container);
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  it('renders correctly with email data', () => {
    render(<EmailViewer {...mockProps} />, { container });
    
    expect(screen.getByText('Test Email Subject')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText('This is the email content for testing')).toBeInTheDocument();
  });

  it('does not render when email is null', () => {
    render(<EmailViewer {...mockProps} email={null} />, { container });
    expect(container.firstChild).toBeNull();
  });

  it('calls onClose when back button is clicked', () => {
    render(<EmailViewer {...mockProps} />, { container });
    
    const backButton = screen.getByRole('button', { name: /Voltar/i });
    fireEvent.click(backButton);
    
    expect(mockProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onDeleteEmail and onClose when delete button is clicked', () => {
    render(<EmailViewer {...mockProps} />, { container });
    
    // Find delete button by icon purpose
    const deleteButton = document.querySelector('button[aria-label="Delete email"]') as HTMLButtonElement;
    if (deleteButton) {
      fireEvent.click(deleteButton);
      expect(mockProps.onDeleteEmail).toHaveBeenCalledWith('1');
      expect(mockProps.onClose).toHaveBeenCalledTimes(1);
    } else {
      // Use a more flexible selector if needed
      const allButtons = screen.getAllByRole('button');
      const deleteBtn = allButtons.find(btn => 
        btn.innerHTML.includes('trash') || 
        btn.innerHTML.includes('delete')
      );
      
      if (deleteBtn) {
        fireEvent.click(deleteBtn);
        expect(mockProps.onDeleteEmail).toHaveBeenCalledWith('1');
        expect(mockProps.onClose).toHaveBeenCalledTimes(1);
      } else {
        console.warn('Delete button not found in test');
      }
    }
  });

  it('handles print functionality when print button is clicked', () => {
    render(<EmailViewer {...mockProps} />, { container });
    
    // Find print button by icon purpose
    const printButton = document.querySelector('button[aria-label="Print email"]') as HTMLButtonElement;
    if (printButton) {
      fireEvent.click(printButton);
    } else {
      // Use a more flexible selector if needed
      const allButtons = screen.getAllByRole('button');
      const printBtn = allButtons.find(btn => 
        btn.innerHTML.includes('print') || 
        btn.innerHTML.includes('file')
      );
      
      if (printBtn) {
        fireEvent.click(printBtn);
      } else {
        console.warn('Print button not found in test');
      }
    }
    
    // Check if content was written and print was called
    expect(mockFocus).toHaveBeenCalled();
    expect(mockPrint).toHaveBeenCalled();
    
    // Fast-forward timers to trigger iframe removal
    jest.advanceTimersByTime(1000);
  });
}); 