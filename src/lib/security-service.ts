import { z } from 'zod';

import { monitoringService } from './monitoring-service';

// Validation schemas
const emailSchema = z.string().email().min(5).max(255);
const idSchema = z.string().uuid();
const contentSchema = z.string().min(1).max(50000); // 50KB max

interface ValidationResult<T> {
  isValid: boolean;
  value?: T;
  error?: string;
}

class SecurityService {
  private static instance: SecurityService;
  private readonly emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  private readonly htmlRegex = /<[^>]*>/g;
  private readonly scriptRegex = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
  
  private constructor() {}
  
  public static getInstance(): SecurityService {
    if (!SecurityService.instance) {
      SecurityService.instance = new SecurityService();
    }
    return SecurityService.instance;
  }
  
  /**
   * Validate and sanitize email address
   */
  public validateEmail(email: string): ValidationResult<string> {
    try {
      const sanitizedEmail = this.sanitizeInput(email).toLowerCase();
      const result = emailSchema.safeParse(sanitizedEmail);
      
      if (!result.success) {
        return {
          isValid: false,
          error: 'Invalid email format',
        };
      }
      
      if (!this.emailRegex.test(sanitizedEmail)) {
        return {
          isValid: false,
          error: 'Invalid email format',
        };
      }
      
      return {
        isValid: true,
        value: sanitizedEmail,
      };
    } catch (error) {
      monitoringService.trackError(error as Error, 'validateEmail', { email });
      return {
        isValid: false,
        error: 'Email validation failed',
      };
    }
  }
  
  /**
   * Validate UUID
   */
  public validateId(id: string): ValidationResult<string> {
    try {
      const result = idSchema.safeParse(id);
      
      if (!result.success) {
        return {
          isValid: false,
          error: 'Invalid ID format',
        };
      }
      
      return {
        isValid: true,
        value: id,
      };
    } catch (error) {
      monitoringService.trackError(error as Error, 'validateId', { id });
      return {
        isValid: false,
        error: 'ID validation failed',
      };
    }
  }
  
  /**
   * Validate and sanitize content
   */
  public validateContent(content: string): ValidationResult<string> {
    try {
      const sanitizedContent = this.sanitizeInput(content);
      const result = contentSchema.safeParse(sanitizedContent);
      
      if (!result.success) {
        return {
          isValid: false,
          error: 'Invalid content format or size',
        };
      }
      
      return {
        isValid: true,
        value: sanitizedContent,
      };
    } catch (error) {
      monitoringService.trackError(error as Error, 'validateContent', { contentLength: content.length });
      return {
        isValid: false,
        error: 'Content validation failed',
      };
    }
  }
  
  /**
   * Sanitize input string
   */
  public sanitizeInput(input: string): string {
    if (typeof input !== 'string') {
      return '';
    }
    
    return input
      .trim()
      // Remove HTML tags
      .replace(this.htmlRegex, '')
      // Remove script tags and contents
      .replace(this.scriptRegex, '')
      // Remove null bytes
      .replace(/\0/g, '')
      // Normalize whitespace
      .replace(/\s+/g, ' ');
  }
  
  /**
   * Validate array of IDs
   */
  public validateIds(ids: string[]): ValidationResult<string[]> {
    try {
      const validIds: string[] = [];
      const invalidIds: string[] = [];
      
      for (const id of ids) {
        const result = this.validateId(id);
        if (result.isValid && result.value) {
          validIds.push(result.value);
        } else {
          invalidIds.push(id);
        }
      }
      
      if (invalidIds.length > 0) {
        return {
          isValid: false,
          error: `Invalid IDs found: ${invalidIds.join(', ')}`,
        };
      }
      
      return {
        isValid: true,
        value: validIds,
      };
    } catch (error) {
      monitoringService.trackError(error as Error, 'validateIds', { ids });
      return {
        isValid: false,
        error: 'IDs validation failed',
      };
    }
  }
  
  /**
   * Check if string might contain malicious content
   */
  public hasMaliciousContent(input: string): boolean {
    const suspiciousPatterns = [
      /<script/i,
      /javascript:/i,
      /data:/i,
      /vbscript:/i,
      /onclick/i,
      /onload/i,
      /onerror/i,
      /eval\(/i,
      /alert\(/i,
    ];
    
    return suspiciousPatterns.some(pattern => pattern.test(input));
  }
}

export const securityService = SecurityService.getInstance(); 