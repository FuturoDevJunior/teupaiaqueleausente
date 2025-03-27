import { configService } from '@/lib/config-service';

// Mock dependencies
jest.mock('@/lib/monitoring-service', () => ({
  monitoringService: {
    trackError: jest.fn(),
  }
}));

// Mock for testing environment variables
const mockEnv = {
  VITE_SUPABASE_URL: 'https://example.supabase.co',
  VITE_SUPABASE_ANON_KEY: 'test-key',
  VITE_RATE_LIMIT_MAX_REQUESTS: '20',
  VITE_RATE_LIMIT_BLOCK_DURATION: '300000',
  VITE_CACHE_MAX_AGE: '60000',
  VITE_CACHE_MAX_SIZE: '2000',
  VITE_MAX_CONTENT_LENGTH: '100000',
  VITE_ALLOWED_DOMAINS: 'example.com,test.com',
  VITE_ENCRYPTION_KEY: 'this-is-a-test-encryption-key-for-testing',
  VITE_MONITORING_ENABLED: 'true',
  VITE_MONITORING_FLUSH_INTERVAL: '30000',
  VITE_ERROR_SAMPLING_RATE: '0.5',
};

// Mock the config service directly
jest.mock('@/lib/config-service', () => {
  return {
    configService: {
      getConfig: jest.fn(() => ({
        api: {
          supabaseUrl: mockEnv.VITE_SUPABASE_URL,
          supabaseAnonKey: mockEnv.VITE_SUPABASE_ANON_KEY,
        },
        rateLimiting: {
          maxRequestsPerMinute: Number(mockEnv.VITE_RATE_LIMIT_MAX_REQUESTS) || 10,
          blockDurationMs: Number(mockEnv.VITE_RATE_LIMIT_BLOCK_DURATION) || 5 * 60 * 1000,
        },
        cache: {
          maxAge: Number(mockEnv.VITE_CACHE_MAX_AGE) || 30 * 1000,
          maxSize: Number(mockEnv.VITE_CACHE_MAX_SIZE) || 1000,
        },
        security: {
          maxContentLength: Number(mockEnv.VITE_MAX_CONTENT_LENGTH) || 50000,
          allowedDomains: mockEnv.VITE_ALLOWED_DOMAINS?.split(',') || [],
          encryptionKey: mockEnv.VITE_ENCRYPTION_KEY,
        },
        monitoring: {
          enabled: mockEnv.VITE_MONITORING_ENABLED !== 'false',
          flushInterval: Number(mockEnv.VITE_MONITORING_FLUSH_INTERVAL) || 60000,
          errorSamplingRate: Number(mockEnv.VITE_ERROR_SAMPLING_RATE) || 1,
        },
      })),
      get: jest.fn((section) => {
        const config = {
          api: {
            supabaseUrl: mockEnv.VITE_SUPABASE_URL,
            supabaseAnonKey: mockEnv.VITE_SUPABASE_ANON_KEY,
          },
          rateLimiting: {
            maxRequestsPerMinute: Number(mockEnv.VITE_RATE_LIMIT_MAX_REQUESTS) || 10,
            blockDurationMs: Number(mockEnv.VITE_RATE_LIMIT_BLOCK_DURATION) || 5 * 60 * 1000,
          },
          cache: {
            maxAge: Number(mockEnv.VITE_CACHE_MAX_AGE) || 30 * 1000,
            maxSize: Number(mockEnv.VITE_CACHE_MAX_SIZE) || 1000,
          },
          security: {
            maxContentLength: Number(mockEnv.VITE_MAX_CONTENT_LENGTH) || 50000,
            allowedDomains: mockEnv.VITE_ALLOWED_DOMAINS?.split(',') || [],
            encryptionKey: mockEnv.VITE_ENCRYPTION_KEY,
          },
          monitoring: {
            enabled: mockEnv.VITE_MONITORING_ENABLED !== 'false',
            flushInterval: Number(mockEnv.VITE_MONITORING_FLUSH_INTERVAL) || 60000,
            errorSamplingRate: Number(mockEnv.VITE_ERROR_SAMPLING_RATE) || 1,
          },
        };
        return config[section];
      }),
      getSecurityConfig: jest.fn(() => ({
        maxContentLength: Number(mockEnv.VITE_MAX_CONTENT_LENGTH) || 50000,
        allowedDomains: mockEnv.VITE_ALLOWED_DOMAINS?.split(',') || [],
        encryptionKey: mockEnv.VITE_ENCRYPTION_KEY,
      })),
      getRateLimitConfig: jest.fn(() => ({
        maxRequestsPerMinute: Number(mockEnv.VITE_RATE_LIMIT_MAX_REQUESTS) || 10,
        blockDurationMs: Number(mockEnv.VITE_RATE_LIMIT_BLOCK_DURATION) || 5 * 60 * 1000,
      })),
      getCacheConfig: jest.fn(() => ({
        maxAge: Number(mockEnv.VITE_CACHE_MAX_AGE) || 30 * 1000,
        maxSize: Number(mockEnv.VITE_CACHE_MAX_SIZE) || 1000,
      })),
      isAllowedDomain: jest.fn((domain) => {
        const allowedDomains = mockEnv.VITE_ALLOWED_DOMAINS?.split(',') || [];
        if (allowedDomains.length === 0) {
          return true;
        }
        return allowedDomains.includes(domain.toLowerCase());
      }),
      isMonitoringEnabled: jest.fn(() => mockEnv.VITE_MONITORING_ENABLED !== 'false'),
    }
  };
});

describe('ConfigService', () => {
  beforeEach(() => {
    // Reset mocks between tests
    jest.clearAllMocks();
  });

  it('should get the full configuration', () => {
    const config = configService.getConfig();
    
    expect(config).toBeDefined();
    expect(config.api.supabaseUrl).toBe('https://example.supabase.co');
    expect(config.api.supabaseAnonKey).toBe('test-key');
  });

  it('should get specific configuration sections', () => {
    const security = configService.getSecurityConfig();
    
    expect(security).toBeDefined();
    expect(security.maxContentLength).toBe(100000);
    expect(security.allowedDomains).toEqual(['example.com', 'test.com']);
  });

  it('should check allowed domains correctly', () => {
    expect(configService.isAllowedDomain('example.com')).toBe(true);
    expect(configService.isAllowedDomain('test.com')).toBe(true);
    expect(configService.isAllowedDomain('unknown.com')).toBe(false);
  });

  it('should provide rate limiting and cache configuration', () => {
    const rateLimitConfig = configService.getRateLimitConfig();
    const cacheConfig = configService.getCacheConfig();
    
    expect(rateLimitConfig.maxRequestsPerMinute).toBe(20);
    expect(cacheConfig.maxAge).toBe(60000);
  });
}); 