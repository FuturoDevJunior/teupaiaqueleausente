import { monitoringService } from '@/lib/monitoring-service';

// Mock toast from sonner
jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
  }
}));

// Mock console methods
const originalConsoleError = console.error;
const originalConsoleInfo = console.info;

describe('MonitoringService', () => {
  beforeEach(() => {
    // Mock console methods
    console.error = jest.fn();
    console.info = jest.fn();
    
    // Clear mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Restore original console methods
    console.error = originalConsoleError;
    console.info = originalConsoleInfo;
  });

  describe('trackError', () => {
    it('should log error to console', () => {
      const error = new Error('Test error');
      const context = 'testContext';
      const metadata = { userId: '123' };

      monitoringService.trackError(error, context, metadata);

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining(context),
        error,
        metadata
      );
    });

    it('should track errors in buffer', () => {
      // Check initial buffer sizes
      const initialSizes = monitoringService.getBufferSizes();
      
      // Track a new error
      monitoringService.trackError(new Error('Test error'), 'testContext');
      
      // Buffer size should increase
      const newSizes = monitoringService.getBufferSizes();
      expect(newSizes.errors).toBe(initialSizes.errors + 1);
    });
  });

  describe('trackPerformance', () => {
    it('should log performance metrics to console', () => {
      const operation = 'testOperation';
      const duration = 100;

      monitoringService.trackPerformance(operation, duration);

      expect(console.info).toHaveBeenCalledWith(
        expect.stringContaining(`[Performance] ${operation}: ${duration}ms`)
      );
    });

    it('should track performance metrics in buffer', () => {
      // Check initial buffer sizes
      const initialSizes = monitoringService.getBufferSizes();
      
      // Track a new performance metric
      monitoringService.trackPerformance('testOperation', 100);
      
      // Buffer size should increase
      const newSizes = monitoringService.getBufferSizes();
      expect(newSizes.performance).toBe(initialSizes.performance + 1);
    });
  });

  describe('getBufferSizes', () => {
    it('should return current buffer sizes', () => {
      const sizes = monitoringService.getBufferSizes();
      
      expect(sizes).toHaveProperty('errors');
      expect(sizes).toHaveProperty('performance');
      expect(typeof sizes.errors).toBe('number');
      expect(typeof sizes.performance).toBe('number');
    });
  });

  // Note: Testing the private methods like flushErrors and flushPerformanceMetrics
  // would require either:
  // 1. Using jest.spyOn with Object.getPrototypeOf to spy on private methods
  // 2. Exposing the methods for testing
  // 3. Testing the behavior indirectly
  
  // For this test suite, we're testing the public API and observable behavior
}); 