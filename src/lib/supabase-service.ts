import { createClient } from '@supabase/supabase-js';

import { configService } from './config-service';
import { monitoringService } from './monitoring-service';
import { securityService } from './security-service';

// Database types
export type Session = {
  id: string;
  created_at: string;
  last_active_at: string;
  ip_address: string;
  user_agent: string | null;
  is_blocked: boolean;
  blocked_until: string | null;
};

export type RateLimit = {
  id: string;
  session_id: string;
  limit_type: 'email_generation' | 'email_fetch' | 'email_delete';
  request_count: number;
  first_request_at: string;
  last_request_at: string;
};

export type TemporaryEmail = {
  id: string;
  email: string;
  session_id: string;
  created_at: string;
  expires_at: string;
  status: 'active' | 'deleted' | 'expired';
};

export type Email = {
  id: string;
  recipient: string;
  sender: string;
  subject: string;
  preview: string;
  content: string;
  created_at: string;
  read: boolean;
  encrypted: boolean;
  temporary_email_id: string;
};

// Define metadata types
export type ErrorMetadata = {
  browser?: string;
  os?: string;
  url?: string;
  component?: string;
  [key: string]: string | undefined;
};

export type PerformanceMetadata = {
  component?: string;
  action?: string;
  status?: string;
  cached?: boolean;
  [key: string]: string | boolean | undefined;
};

export type SecurityMetadata = {
  ip?: string;
  userAgent?: string;
  url?: string;
  method?: string;
  headers?: Record<string, string>;
  [key: string]: string | Record<string, string> | undefined;
};

export type ErrorLog = {
  id: string;
  session_id: string | null;
  error_type: string;
  error_message: string;
  error_stack: string | null;
  metadata: ErrorMetadata | null;
  created_at: string;
};

export type PerformanceMetric = {
  id: string;
  session_id: string | null;
  operation: string;
  duration: number;
  metadata: PerformanceMetadata | null;
  created_at: string;
};

export type SecurityEvent = {
  id: string;
  session_id: string | null;
  event_type: string;
  severity: string;
  description: string;
  metadata: SecurityMetadata | null;
  created_at: string;
};

class SupabaseService {
  private client;
  private currentSession: Session | null = null;

  constructor() {
    const apiConfig = configService.get('api');
    this.client = createClient(apiConfig.supabaseUrl, apiConfig.supabaseAnonKey);
  }

  // Session management
  async initializeSession(): Promise<Session> {
    try {
      const ipAddress = await this.getClientIp();
      const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent : null;

      const { data, error } = await this.client
        .from('sessions')
        .insert([{ ip_address: ipAddress, user_agent: userAgent }])
        .select()
        .single();

      if (error) throw new Error(error.message);
      this.currentSession = data;
      return data;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Session initialization failed');
      monitoringService.trackError(err, 'SESSION_INITIALIZATION_FAILED');
      throw err;
    }
  }

  async getCurrentSession(): Promise<Session> {
    if (!this.currentSession) {
      return this.initializeSession();
    }
    return this.currentSession;
  }

  // Rate limiting
  async checkRateLimit(
    limitType: RateLimit['limit_type'],
    maxRequests: number,
    windowSeconds: number
  ): Promise<boolean> {
    try {
      const session = await this.getCurrentSession();
      const { data, error } = await this.client.rpc('check_rate_limit', {
        p_session_id: session.id,
        p_limit_type: limitType,
        p_max_requests: maxRequests,
        p_window_seconds: windowSeconds,
      });

      if (error) throw new Error(error.message);
      return data;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Rate limit check failed');
      monitoringService.trackError(err, 'RATE_LIMIT_CHECK_FAILED');
      throw err;
    }
  }

  // Temporary email management
  async createTemporaryEmail(email: string, expiresInHours: number): Promise<TemporaryEmail> {
    try {
      const validatedEmail = await securityService.validateEmail(email);
      const session = await this.getCurrentSession();
      const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000).toISOString();

      const { data, error } = await this.client
        .from('temporary_emails')
        .insert([
          {
            email: validatedEmail,
            session_id: session.id,
            expires_at: expiresAt,
          },
        ])
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Temporary email creation failed');
      monitoringService.trackError(err, 'TEMPORARY_EMAIL_CREATION_FAILED');
      throw err;
    }
  }

  async getTemporaryEmail(email: string): Promise<TemporaryEmail | null> {
    try {
      const validatedEmail = await securityService.validateEmail(email);
      const { data, error } = await this.client
        .from('temporary_emails')
        .select()
        .eq('email', validatedEmail)
        .eq('status', 'active')
        .single();

      if (error && error.code !== 'PGRST116') throw new Error(error.message);
      return data;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Temporary email fetch failed');
      monitoringService.trackError(err, 'TEMPORARY_EMAIL_FETCH_FAILED');
      throw err;
    }
  }

  // Email management
  async getEmails(temporaryEmailId: string): Promise<Email[]> {
    try {
      const validatedId = await securityService.validateId(temporaryEmailId);
      const { data, error } = await this.client
        .from('emails')
        .select()
        .eq('temporary_email_id', validatedId)
        .order('created_at', { ascending: false });

      if (error) throw new Error(error.message);
      return data;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Email fetch failed');
      monitoringService.trackError(err, 'EMAIL_FETCH_FAILED');
      throw err;
    }
  }

  async markEmailAsRead(emailId: string): Promise<void> {
    try {
      const validatedId = await securityService.validateId(emailId);
      const { error } = await this.client
        .from('emails')
        .update({ read: true })
        .eq('id', validatedId);

      if (error) throw new Error(error.message);
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Email mark read failed');
      monitoringService.trackError(err, 'EMAIL_MARK_READ_FAILED');
      throw err;
    }
  }

  async deleteEmail(emailId: string): Promise<void> {
    try {
      const validatedId = await securityService.validateId(emailId);
      const { error } = await this.client
        .from('emails')
        .delete()
        .eq('id', validatedId);

      if (error) throw new Error(error.message);
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Email delete failed');
      monitoringService.trackError(err, 'EMAIL_DELETE_FAILED');
      throw err;
    }
  }

  // Error logging
  async logError(error: Error, metadata?: ErrorMetadata): Promise<void> {
    try {
      const session = await this.getCurrentSession();
      const { error: dbError } = await this.client.from('error_logs').insert([
        {
          session_id: session.id,
          error_type: error.name,
          error_message: error.message,
          error_stack: error.stack,
          metadata,
        },
      ]);

      if (dbError) throw dbError;
    } catch (error) {
      console.error('Failed to log error:', error);
    }
  }

  // Performance metrics
  async trackPerformance(
    operation: string,
    duration: number,
    metadata?: PerformanceMetadata
  ): Promise<void> {
    try {
      const session = await this.getCurrentSession();
      const { error } = await this.client.from('performance_metrics').insert([
        {
          session_id: session.id,
          operation,
          duration,
          metadata,
        },
      ]);

      if (error) throw error;
    } catch (error) {
      console.error('Failed to track performance:', error);
    }
  }

  // Security events
  async logSecurityEvent(
    eventType: string,
    severity: string,
    description: string,
    metadata?: SecurityMetadata
  ): Promise<void> {
    try {
      const session = await this.getCurrentSession();
      const { error } = await this.client.from('security_events').insert([
        {
          session_id: session.id,
          event_type: eventType,
          severity,
          description,
          metadata,
        },
      ]);

      if (error) throw error;
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }

  // Utility methods
  private async getClientIp(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.error('Failed to get client IP:', error);
      return '0.0.0.0';
    }
  }
}

export const supabaseService = new SupabaseService(); 