import { cleanupService } from '../../lib/cleanup-service';

// Mock the supabase/client module
jest.mock('@/integrations/supabase/client', () => {
  return {
    supabase: {
      rpc: jest.fn().mockResolvedValue({ data: null, error: null }),
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue({ data: [], error: null }),
      }),
    },
  };
});

describe('cleanupService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('markExpiredAsDeleted', () => {
    it('should successfully mark expired emails as deleted', async () => {
      // Setup mock
      const { supabase } = jest.requireMock('@/integrations/supabase/client');
      supabase.rpc.mockResolvedValueOnce({ data: null, error: null });

      // Call the function
      const result = await cleanupService.markExpiredAsDeleted();

      // Assert
      expect(supabase.rpc).toHaveBeenCalledWith('cleanup_expired_emails');
      expect(result).toEqual({ success: true });
    });

    it('should handle errors when marking expired emails fails', async () => {
      // Setup mock with error
      const mockError = new Error('Database error');
      const { supabase } = jest.requireMock('@/integrations/supabase/client');
      supabase.rpc.mockResolvedValueOnce({ data: null, error: mockError });

      // Mock console.error
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      // Call the function
      const result = await cleanupService.markExpiredAsDeleted();

      // Assert
      expect(supabase.rpc).toHaveBeenCalledWith('cleanup_expired_emails');
      expect(consoleSpy).toHaveBeenCalledWith('Error cleaning up expired emails:', mockError);
      expect(result).toEqual({ success: false, error: mockError });
    });
  });

  describe('getStats', () => {
    it('should return email statistics successfully', async () => {
      // Mock data
      const mockData = [
        { id: 1, deleted: false },
        { id: 2, deleted: false },
        { id: 3, deleted: true }
      ];

      // Setup mock
      const { supabase } = jest.requireMock('@/integrations/supabase/client');
      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockResolvedValueOnce({ data: mockData, error: null }),
      });

      // Call the function
      const result = await cleanupService.getStats();

      // Assert
      expect(supabase.from).toHaveBeenCalledWith('temp_emails');
      expect(result).toEqual({
        success: true,
        stats: { total: 3, active: 2, deleted: 1 }
      });
    });

    it('should handle errors when getting stats fails', async () => {
      // Setup mock with error
      const mockError = new Error('Database error');
      const { supabase } = jest.requireMock('@/integrations/supabase/client');
      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockResolvedValueOnce({ data: null, error: mockError }),
      });

      // Mock console.error
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      // Call the function
      const result = await cleanupService.getStats();

      // Assert
      expect(supabase.from).toHaveBeenCalledWith('temp_emails');
      expect(consoleSpy).toHaveBeenCalledWith('Error getting email statistics:', mockError);
      expect(result).toEqual({ success: false, error: mockError });
    });
  });
}); 