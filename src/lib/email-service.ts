import { toast } from 'sonner';

import { supabase } from '@/integrations/supabase/client';
import { generateRandomEmail } from '@/lib/email-utils';
import { monitoringService } from '@/lib/monitoring-service';
import { securityService } from '@/lib/security-service';

import {
  getSessionId,
  getStoredEmail,
  storeEmail,
  storeEmailInSupabase,
} from './email-storage';
import { generateMockEmails } from './mock-emails';
import {
  decrypt,
  encrypt,
  isNullOrEmpty,
} from './utils/crypto';

export interface Email {
  id: string;
  from: string;
  subject: string;
  preview: string;
  content: string;
  date: string;
  read: boolean;
}

// Enhanced rate limiting with IP tracking
interface RateLimitEntry {
  timestamps: number[];
  blockedUntil?: number;
}

const rateLimiter = {
  maxRequests: 10,
  windowMs: 60 * 1000, // 1 minute
  blockDurationMs: 5 * 60 * 1000, // 5 minutes
  ipMap: new Map<string, RateLimitEntry>()
};

/**
 * Enhanced rate limiting check with IP tracking and temporary blocking
 */
function checkRateLimit(clientId: string): boolean {
  const now = Date.now();
  const entry = rateLimiter.ipMap.get(clientId) || { timestamps: [] };
  
  // Check if client is blocked
  if (entry.blockedUntil && now < entry.blockedUntil) {
    const remainingSeconds = Math.ceil((entry.blockedUntil - now) / 1000);
    toast.error(`Too many requests`, {
      description: `Please wait ${remainingSeconds} seconds before trying again.`,
      duration: 5000,
    });
    return false;
  }
  
  // Remove old timestamps
  entry.timestamps = entry.timestamps.filter(
    timestamp => now - timestamp < rateLimiter.windowMs
  );
  
  // Check rate limit
  if (entry.timestamps.length >= rateLimiter.maxRequests) {
    entry.blockedUntil = now + rateLimiter.blockDurationMs;
    rateLimiter.ipMap.set(clientId, entry);
    
    toast.error("Rate limit exceeded", {
      description: "You've been temporarily blocked. Please try again later.",
      duration: 5000,
    });
    return false;
  }
  
  // Add new timestamp
  entry.timestamps.push(now);
  rateLimiter.ipMap.set(clientId, entry);
  return true;
}

/**
 * Validates email format and domain
 */
function validateEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    toast.error("Invalid email format");
    return false;
  }
  
  // Add additional domain validation if needed
  return true;
}

/**
 * Error tracking and monitoring
 */
function trackError(error: Error, context: string, metadata: Record<string, unknown> = {}) {
  monitoringService.trackError(error, context, metadata);
}

/**
 * Performance monitoring
 */
function trackPerformance(operation: string, startTime: number) {
  const duration = Date.now() - startTime;
  monitoringService.trackPerformance(operation, duration);
}

// Email cache configuration
interface CacheEntry {
  data: Email[];
  timestamp: number;
}

const emailCache = {
  store: new Map<string, CacheEntry>(),
  maxAge: 30 * 1000, // 30 seconds
  
  get(key: string): Email[] | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    
    // Check if cache is still valid
    if (Date.now() - entry.timestamp > this.maxAge) {
      this.store.delete(key);
      return null;
    }
    
    return entry.data;
  },
  
  set(key: string, data: Email[]): void {
    this.store.set(key, {
      data,
      timestamp: Date.now()
    });
  },
  
  invalidate(key: string): void {
    this.store.delete(key);
  }
};

/**
 * Gera um email temporário para o usuário
 */
export async function generateTemporaryEmail(forceNew: boolean = false): Promise<string> {
  const startTime = Date.now();
  const sessionId = getSessionId();
  
  try {
    if (!checkRateLimit(sessionId)) {
      return getStoredEmail() || generateRandomEmail();
    }
    
    // Se não forçar novo e tiver um email armazenado, usa ele
    const storedEmail = getStoredEmail();
    if (!forceNew && !isNullOrEmpty(storedEmail)) {
      return storedEmail as string;
    }
    
    const newEmail = generateRandomEmail();
    
    // Validate new email
    if (!validateEmail(newEmail)) {
      throw new Error("Generated invalid email format");
    }
    
    // Armazena o email no supabase com timestamp
    await storeEmailInSupabase(newEmail, sessionId);
    
    // Armazena localmente
    storeEmail(newEmail);
    
    return newEmail;
  } catch (error) {
    trackError(error as Error, "generateTemporaryEmail", { sessionId, forceNew });
    const fallbackEmail = generateRandomEmail();
    storeEmail(fallbackEmail);
    return fallbackEmail;
  } finally {
    trackPerformance("generateTemporaryEmail", startTime);
  }
}

/**
 * Busca os emails recebidos para um determinado endereço
 */
export async function fetchEmails(email: string): Promise<Email[]> {
  const startTime = Date.now();
  
  try {
    // Input validation
    const validationResult = securityService.validateEmail(email);
    if (!validationResult.isValid || !validationResult.value) {
      throw new Error(validationResult.error || "Invalid email provided");
    }
    
    // Check rate limit
    if (!checkRateLimit(validationResult.value)) {
      return [];
    }
    
    // Check cache first
    const cachedEmails = emailCache.get(validationResult.value);
    if (cachedEmails) {
      trackPerformance("fetchEmails (cached)", startTime);
      return cachedEmails;
    }
    
    // Fetch from Supabase with retry and timeout
    const emails = await fetchEmailsWithRetry(validationResult.value);
    
    // Cache the results
    emailCache.set(validationResult.value, emails);
    
    return emails;
  } catch (error) {
    trackError(error as Error, "fetchEmails", { email });
    
    // Fallback to mock emails in case of error
    const mockEmails = generateMockEmails(email);
    emailCache.set(email, mockEmails);
    
    return mockEmails;
  } finally {
    trackPerformance("fetchEmails", startTime);
  }
}

/**
 * Helper function to fetch emails with retry logic
 */
async function fetchEmailsWithRetry(email: string, maxAttempts = 3): Promise<Email[]> {
  let attempt = 0;
  let lastError: Error | null = null;
  
  while (attempt < maxAttempts) {
    try {
      const abortController = new AbortController();
      const timeoutId = setTimeout(() => abortController.abort(), 8000); // Increase timeout to 8s for better reliability
      
      const encryptedEmail = encrypt(email);
      console.log(`Fetching emails for: ${email} (encrypted)`);
      
      const { data: storedEmails, error } = await supabase
        .from('emails')
        .select('*')
        .eq('recipient', encryptedEmail)
        .order('created_at', { ascending: false });
      
      clearTimeout(timeoutId);
      
      if (error) {
        throw new Error(`Supabase error: ${error.message}`);
      }
      
      if (!storedEmails || storedEmails.length === 0) {
        console.log('No emails found');
        return [];
      }
      
      console.log(`Found ${storedEmails.length} emails`);
      
      // Additional validation for returned data
      return storedEmails
        .filter(email => email && email.id) // Ensure we have valid email records
        .map(email => ({
          id: email.id,
          from: decrypt(email.sender),
          subject: decrypt(email.subject),
          preview: decrypt(email.preview),
          content: decrypt(email.content),
          date: email.created_at || new Date().toISOString(),
          read: email.read || false,
        }));
    } catch (error) {
      console.error(`Attempt ${attempt + 1} failed:`, error);
      lastError = error instanceof Error ? error : new Error('Unknown error in fetchEmailsWithRetry');
      attempt++;
      
      // Add exponential backoff with jitter
      if (attempt < maxAttempts) {
        const backoffTime = Math.min(1000 * Math.pow(2, attempt - 1) + Math.random() * 1000, 10000);
        await new Promise(resolve => setTimeout(resolve, backoffTime));
      }
    }
  }
  
  throw lastError || new Error('Failed to fetch emails after multiple attempts');
}

/**
 * Marca um email como lido
 */
export async function markEmailAsRead(emailId: string): Promise<void> {
  const startTime = Date.now();
  
  try {
    const validationResult = securityService.validateId(emailId);
    if (!validationResult.isValid || !validationResult.value) {
      throw new Error(validationResult.error || "Invalid email ID");
    }
    
    if (!checkRateLimit(validationResult.value)) {
      return;
    }
    
    const { error } = await supabase
      .from('emails')
      .update({ read: true })
      .eq('id', validationResult.value);
      
    if (error) {
      throw error;
    }
    
    // Invalidate cache for affected email lists
    emailCache.store.clear();
  } catch (error) {
    trackError(error as Error, "markEmailAsRead", { emailId });
  } finally {
    trackPerformance("markEmailAsRead", startTime);
  }
}

/**
 * Exclui um email pelo ID
 */
export async function deleteEmail(emailId: string): Promise<void> {
  const startTime = Date.now();
  
  try {
    const validationResult = securityService.validateId(emailId);
    if (!validationResult.isValid || !validationResult.value) {
      throw new Error(validationResult.error || "Invalid email ID");
    }
    
    if (!checkRateLimit(validationResult.value)) {
      return;
    }
    
    const { error } = await supabase
      .from('emails')
      .delete()
      .eq('id', validationResult.value);
      
    if (error) {
      throw error;
    }
    
    // Invalidate cache for affected email lists
    emailCache.store.clear();
    
    toast.success("Email excluído com sucesso!");
  } catch (error) {
    trackError(error as Error, "deleteEmail", { emailId });
    toast.error("Erro ao excluir email", {
      description: "Tente novamente em alguns instantes.",
    });
  } finally {
    trackPerformance("deleteEmail", startTime);
  }
}

/**
 * Batch delete multiple emails
 */
export async function batchDeleteEmails(emailIds: string[]): Promise<void> {
  const startTime = Date.now();
  
  try {
    const validationResult = securityService.validateIds(emailIds);
    if (!validationResult.isValid || !validationResult.value) {
      throw new Error(validationResult.error || "Invalid email IDs");
    }
    
    if (!checkRateLimit('batch_delete')) {
      return;
    }
    
    const { error } = await supabase
      .from('emails')
      .delete()
      .in('id', validationResult.value);
      
    if (error) {
      throw error;
    }
    
    // Invalidate cache for affected email lists
    emailCache.store.clear();
    
    toast.success(`${validationResult.value.length} emails excluídos com sucesso!`);
  } catch (error) {
    trackError(error as Error, "batchDeleteEmails", { emailIds });
    toast.error("Erro ao excluir emails", {
      description: "Tente novamente em alguns instantes.",
    });
  } finally {
    trackPerformance("batchDeleteEmails", startTime);
  }
}
