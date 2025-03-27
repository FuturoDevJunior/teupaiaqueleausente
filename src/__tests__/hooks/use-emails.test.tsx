import {
  act,
  renderHook,
} from '@testing-library/react';

import { useEmails } from '../../hooks/use-emails';
import * as emailService from '../../lib/email-service';

// Mock the required dependencies
jest.mock('../../lib/email-service');
jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    info: jest.fn(),
  },
}));
jest.mock('@/integrations/supabase/client', () => ({
  supabase: {
    channel: () => ({
      on: () => ({
        subscribe: jest.fn(() => ({
          unsubscribe: jest.fn(),
        })),
      }),
    }),
  },
}));

describe('useEmails', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should generate a temporary email', async () => {
    // Mock implementation
    const mockEmail = 'test@example.com';
    (emailService.generateTemporaryEmail as jest.Mock).mockResolvedValue(mockEmail);

    const { result } = renderHook(() => useEmails());
    
    expect(result.current.loading).toBe(true);
    
    await act(async () => {
      await result.current.generateEmail();
    });
    
    expect(emailService.generateTemporaryEmail).toHaveBeenCalledWith(false);
    expect(result.current.currentEmail).toBe(mockEmail);
    expect(result.current.loading).toBe(false);
  });

  it('should load emails for a given address', async () => {
    const mockEmails = [
      { id: '1', subject: 'Test Email 1', read: false },
      { id: '2', subject: 'Test Email 2', read: true },
    ];
    (emailService.fetchEmails as jest.Mock).mockResolvedValue(mockEmails);

    const { result } = renderHook(() => useEmails());
    
    await act(async () => {
      await result.current.loadEmails('test@example.com');
    });
    
    expect(emailService.fetchEmails).toHaveBeenCalledWith('test@example.com');
    expect(result.current.emails).toEqual(mockEmails);
    expect(result.current.refreshing).toBe(false);
  });

  it('should mark an email as read', async () => {
    const initialEmails = [
      { id: '1', subject: 'Test Email 1', read: false },
      { id: '2', subject: 'Test Email 2', read: true },
    ];
    
    // Setup initial state with emails
    (emailService.fetchEmails as jest.Mock).mockResolvedValue(initialEmails);
    
    const { result } = renderHook(() => useEmails());
    
    // Load emails first
    await act(async () => {
      await result.current.loadEmails('test@example.com');
    });
    
    // Mark email as read
    await act(async () => {
      await result.current.markAsRead('1');
    });
    
    expect(emailService.markEmailAsRead).toHaveBeenCalledWith('1');
    
    // First email should now be marked as read
    expect(result.current.emails[0].read).toBe(true);
  });

  it('should remove an email', async () => {
    const initialEmails = [
      { id: '1', subject: 'Test Email 1', read: false },
      { id: '2', subject: 'Test Email 2', read: true },
    ];
    
    // Setup initial state with emails
    (emailService.fetchEmails as jest.Mock).mockResolvedValue(initialEmails);
    
    const { result } = renderHook(() => useEmails());
    
    // Load emails first
    await act(async () => {
      await result.current.loadEmails('test@example.com');
    });
    
    // Remove email
    await act(async () => {
      await result.current.removeEmail('1');
    });
    
    expect(emailService.deleteEmail).toHaveBeenCalledWith('1');
    
    // Email should be removed from the list
    expect(result.current.emails.length).toBe(1);
    expect(result.current.emails[0].id).toBe('2');
  });
}); 