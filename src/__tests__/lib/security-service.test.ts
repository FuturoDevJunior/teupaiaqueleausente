import { securityService } from '@/lib/security-service';

// Mock monitoringService
jest.mock('@/lib/monitoring-service', () => ({
  monitoringService: {
    trackError: jest.fn(),
  }
}));

describe('SecurityService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('validateEmail', () => {
    it('should validate correct email addresses', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user-name@domain.com',
      ];

      validEmails.forEach(email => {
        const result = securityService.validateEmail(email);
        expect(result.isValid).toBe(true);
        expect(result.value).toBe(email.toLowerCase());
      });
    });

    it('should reject invalid email addresses', () => {
      const invalidEmails = [
        'test',
        'test@',
        '@example.com',
        'test@example',
        'test@.com',
        'test@example..com',
      ];

      invalidEmails.forEach(email => {
        const result = securityService.validateEmail(email);
        expect(result.isValid).toBe(false);
        expect(result.error).toBeTruthy();
      });
    });

    it('should sanitize emails with HTML', () => {
      const result = securityService.validateEmail('<script>alert("XSS")</script>user@example.com');
      expect(result.isValid).toBe(false);
    });
  });

  describe('validateId', () => {
    it('should validate correct UUIDs', () => {
      const validId = '123e4567-e89b-12d3-a456-426614174000';
      
      const result = securityService.validateId(validId);
      expect(result.isValid).toBe(true);
      expect(result.value).toBe(validId);
    });

    it('should reject invalid UUIDs', () => {
      const invalidIds = [
        '123',
        '123e4567-e89b-12d3-a456',
        'not-a-uuid',
      ];

      invalidIds.forEach(id => {
        const result = securityService.validateId(id);
        expect(result.isValid).toBe(false);
        expect(result.error).toBeTruthy();
      });
    });
  });

  describe('validateContent', () => {
    it('should validate correct content', () => {
      const validContent = 'This is some valid content';
      
      const result = securityService.validateContent(validContent);
      expect(result.isValid).toBe(true);
      expect(result.value).toBe(validContent);
    });

    it('should sanitize content with HTML', () => {
      const htmlContent = '<div>This is <script>alert("XSS")</script> content</div>';
      const sanitizedContentExpected = 'This is alert("XSS") content';
      
      const result = securityService.validateContent(htmlContent);
      expect(result.isValid).toBe(true);
      expect(result.value).toBe(sanitizedContentExpected);
    });

    it('should reject empty content', () => {
      const result = securityService.validateContent('');
      expect(result.isValid).toBe(false);
    });
  });

  describe('sanitizeInput', () => {
    it('should remove HTML tags', () => {
      const input = '<div>Test</div>';
      const sanitized = securityService.sanitizeInput(input);
      expect(sanitized).toBe('Test');
    });

    it('should remove script tags and content', () => {
      const input = 'Before <script>alert("XSS")</script> After';
      const sanitizedExpected = 'Before alert("XSS") After';
      const sanitized = securityService.sanitizeInput(input);
      expect(sanitized).toBe(sanitizedExpected);
    });

    it('should normalize whitespace', () => {
      const input = 'Multiple    spaces\t\tand\ntabs';
      const sanitized = securityService.sanitizeInput(input);
      expect(sanitized).toBe('Multiple spaces and tabs');
    });

    it('should handle non-string input', () => {
      // @ts-expect-error - Testing improper usage
      const sanitized = securityService.sanitizeInput(null);
      expect(sanitized).toBe('');
    });
  });

  describe('validateIds', () => {
    it('should validate an array of valid IDs', () => {
      const validIds = [
        '123e4567-e89b-12d3-a456-426614174000',
        '223e4567-e89b-12d3-a456-426614174000',
      ];
      
      const result = securityService.validateIds(validIds);
      expect(result.isValid).toBe(true);
      expect(result.value).toEqual(validIds);
    });

    it('should reject if any ID is invalid', () => {
      const ids = [
        '123e4567-e89b-12d3-a456-426614174000',
        'invalid-id',
      ];
      
      const result = securityService.validateIds(ids);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('invalid-id');
    });
  });

  describe('hasMaliciousContent', () => {
    it('should detect script tags', () => {
      expect(securityService.hasMaliciousContent('<script>alert("XSS")</script>')).toBe(true);
    });

    it('should detect javascript: protocol', () => {
      expect(securityService.hasMaliciousContent('javascript:alert("XSS")')).toBe(true);
    });

    it('should detect event handlers', () => {
      expect(securityService.hasMaliciousContent('onclick=alert("XSS")')).toBe(true);
      expect(securityService.hasMaliciousContent('onload=alert("XSS")')).toBe(true);
      expect(securityService.hasMaliciousContent('onerror=alert("XSS")')).toBe(true);
    });

    it('should not flag normal content', () => {
      expect(securityService.hasMaliciousContent('This is normal content')).toBe(false);
    });
  });
}); 