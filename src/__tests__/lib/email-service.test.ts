import {
  deleteEmail,
  fetchEmails,
  generateTemporaryEmail,
} from '@/lib/email-service';

// Mock crypto utils
jest.mock('@/lib/utils/crypto', () => ({
  generateMD5Hash: jest.fn(() => ({ success: true, data: 'mock-hash' })),
  validateUUID: jest.fn(() => ({ isValid: true })),
  cryptoService: {
    generateMD5Hash: jest.fn(() => ({ success: true, data: 'mock-hash' })),
  },
}));

// Mock dependencies
jest.mock('@/lib/supabase-service', () => ({
  supabaseService: {
    createTemporaryEmail: jest.fn().mockResolvedValue({ id: 'mock-id' }),
    getEmails: jest.fn().mockResolvedValue([
      { id: 'mock-id', content: 'Test email', created_at: new Date().toISOString() }
    ]),
    deleteEmail: jest.fn().mockResolvedValue({ success: true }),
  },
}));

jest.mock('@/lib/security-service', () => ({
  SecurityService: {
    getInstance: jest.fn().mockReturnValue({
      encryptData: jest.fn(data => `encrypted-${data}`),
      decryptData: jest.fn(data => data.replace('encrypted-', '')),
      validateEmail: jest.fn(() => ({ isValid: true, value: 'test@example.com' })),
    }),
  },
  securityService: {
    validateEmail: jest.fn(() => ({ isValid: true, value: 'test@example.com' })),
  },
}));

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

// Mock storage functions
jest.mock('@/lib/email-storage', () => ({
  getSessionId: jest.fn().mockReturnValue('mock-session-id'),
  getStoredEmail: jest.fn().mockReturnValue(null),
  storeEmail: jest.fn(),
  storeEmailInSupabase: jest.fn().mockResolvedValue(true),
}));

// Mock email utils
jest.mock('@/lib/email-utils', () => ({
  generateRandomEmail: jest.fn().mockReturnValue('legal.piloto717@teupaiausente.com.br'),
}));

// Mock global fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ emails: [] }),
  })
) as jest.Mock;

// Adicionando mock para mock-emails
jest.mock('@/lib/mock-emails', () => ({
  generateMockEmails: jest.fn(() => [
    { id: 'mock-id', content: 'Mock email content' }
  ]),
}));

describe('Email Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateTemporaryEmail', () => {
    it('should generate a temporary email', async () => {
      const email = await generateTemporaryEmail();
      expect(email).toBeTruthy();
      expect(typeof email).toBe('string');
    });

    it('should generate a new email when forceNew is true', async () => {
      const email = await generateTemporaryEmail(true);
      expect(email).toBeTruthy();
    });
  });

  describe('fetchEmails', () => {
    it('should fetch emails for a valid email address', async () => {
      // Mock implementation as needed based on the actual implementation
      // This is a simplified test as we don't have access to the full implementation
      const emails = await fetchEmails('test@example.com');
      expect(Array.isArray(emails)).toBeTruthy();
    });
  });

  describe('deleteEmail', () => {
    it('should delete an email successfully', async () => {
      // This is a simplified test as we don't have access to the full implementation
      await expect(deleteEmail('mock-id')).resolves.not.toThrow();
    });
  });
}); 