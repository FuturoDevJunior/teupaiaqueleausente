import { z } from 'zod';

import { monitoringService } from './monitoring-service';

// Configuration schema
const configSchema = z.object({
  api: z.object({
    supabaseUrl: z.string().url(),
    supabaseAnonKey: z.string().min(1),
  }),
  
  // Rate Limiting
  rateLimiting: z.object({
    maxRequestsPerMinute: z.number().int().positive().default(10),
    blockDurationMs: z.number().int().positive().default(5 * 60 * 1000),
  }),
  
  // Cache Configuration
  cache: z.object({
    maxAge: z.number().int().positive().default(30 * 1000),
    maxSize: z.number().int().positive().default(1000),
  }),
  
  // Security
  security: z.object({
    maxContentLength: z.number().int().positive().default(50000),
    allowedDomains: z.array(z.string()).default([]),
    encryptionKey: z.string().min(32).optional(),
  }),
  
  // Monitoring
  monitoring: z.object({
    enabled: z.boolean().default(true),
    flushInterval: z.number().int().positive().default(60000),
    errorSamplingRate: z.number().min(0).max(1).default(1),
  }),
});

export type Config = z.infer<typeof configSchema>;

class ConfigService {
  private static instance: ConfigService;
  private config: Config;
  
  private constructor() {
    this.config = this.loadConfig();
  }
  
  public static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }
    return ConfigService.instance;
  }
  
  /**
   * Load and validate configuration from environment variables
   */
  private loadConfig(): Config {
    try {
      const config = {
        api: {
          supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
          supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
        
        rateLimiting: {
          maxRequestsPerMinute: Number(import.meta.env.VITE_RATE_LIMIT_MAX_REQUESTS) || 10,
          blockDurationMs: Number(import.meta.env.VITE_RATE_LIMIT_BLOCK_DURATION) || 5 * 60 * 1000,
        },
        
        cache: {
          maxAge: Number(import.meta.env.VITE_CACHE_MAX_AGE) || 30 * 1000,
          maxSize: Number(import.meta.env.VITE_CACHE_MAX_SIZE) || 1000,
        },
        
        security: {
          maxContentLength: Number(import.meta.env.VITE_MAX_CONTENT_LENGTH) || 50000,
          allowedDomains: import.meta.env.VITE_ALLOWED_DOMAINS?.split(',') || [],
          encryptionKey: import.meta.env.VITE_ENCRYPTION_KEY,
        },
        
        monitoring: {
          enabled: import.meta.env.VITE_MONITORING_ENABLED !== 'false',
          flushInterval: Number(import.meta.env.VITE_MONITORING_FLUSH_INTERVAL) || 60000,
          errorSamplingRate: Number(import.meta.env.VITE_ERROR_SAMPLING_RATE) || 1,
        },
      };
      
      // Validate configuration
      const result = configSchema.safeParse(config);
      
      if (!result.success) {
        throw new Error(`Invalid configuration: ${result.error.message}`);
      }
      
      return result.data;
    } catch (error) {
      monitoringService.trackError(error as Error, 'ConfigService.loadConfig');
      throw new Error('Failed to load configuration');
    }
  }
  
  /**
   * Get the entire configuration object
   */
  public getConfig(): Readonly<Config> {
    return Object.freeze({ ...this.config });
  }
  
  /**
   * Get a specific configuration value
   */
  public get<K extends keyof Config>(key: K): Readonly<Config[K]> {
    return Object.freeze({ ...this.config[key] });
  }
  
  /**
   * Check if monitoring is enabled
   */
  public isMonitoringEnabled(): boolean {
    return this.config.monitoring.enabled;
  }
  
  /**
   * Get rate limiting configuration
   */
  public getRateLimitConfig(): Readonly<Config['rateLimiting']> {
    return Object.freeze({ ...this.config.rateLimiting });
  }
  
  /**
   * Get cache configuration
   */
  public getCacheConfig(): Readonly<Config['cache']> {
    return Object.freeze({ ...this.config.cache });
  }
  
  /**
   * Get security configuration
   */
  public getSecurityConfig(): Readonly<Config['security']> {
    return Object.freeze({ ...this.config.security });
  }
  
  /**
   * Validate a domain against allowed domains
   */
  public isAllowedDomain(domain: string): boolean {
    if (this.config.security.allowedDomains.length === 0) {
      return true; // If no domains specified, allow all
    }
    return this.config.security.allowedDomains.includes(domain.toLowerCase());
  }
}

export const configService = ConfigService.getInstance(); 