import { generateSessionId } from '../../lib/crypto-utils';
import * as cryptoModule from '../../lib/utils/crypto';

jest.mock('../../lib/utils/crypto', () => ({
  generateSessionId: jest.fn(),
}));

describe('crypto-utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateSessionId', () => {
    it('should call the underlying crypto module function', () => {
      // Setup mock implementation
      const mockSessionId = 'mock-session-id-123';
      (cryptoModule.generateSessionId as jest.Mock).mockReturnValue(mockSessionId);

      // Call the function
      const result = generateSessionId();

      // Assert
      expect(cryptoModule.generateSessionId).toHaveBeenCalledTimes(1);
      expect(result).toBe(mockSessionId);
    });

    it('should return a string value', () => {
      // Setup mock implementation
      const mockSessionId = 'some-random-session-id';
      (cryptoModule.generateSessionId as jest.Mock).mockReturnValue(mockSessionId);

      // Call the function
      const result = generateSessionId();

      // Assert
      expect(typeof result).toBe('string');
      expect(result).toBe(mockSessionId);
    });
  });
}); 