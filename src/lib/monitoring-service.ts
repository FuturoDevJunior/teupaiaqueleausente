import { toast } from 'sonner';

// Types for error tracking
interface ErrorMetadata {
  context: string;
  timestamp: string;
  metadata: Record<string, unknown>;
}

// Types for performance tracking
interface PerformanceMetric {
  operation: string;
  duration: number;
  timestamp: string;
  tags?: Record<string, string>;
}

// Constants for monitoring
const STORAGE_KEYS = {
  ERRORS: 'teupai_error_buffer',
  METRICS: 'teupai_metrics_buffer'
};

class MonitoringService {
  private static instance: MonitoringService;
  private errorBuffer: ErrorMetadata[] = [];
  private performanceBuffer: PerformanceMetric[] = [];
  private readonly maxBufferSize = 100;
  private readonly flushInterval = 60000; // 1 minute
  private readonly errorEndpoint = import.meta.env.VITE_ERROR_TRACKING_ENDPOINT || '';
  private readonly metricsEndpoint = import.meta.env.VITE_METRICS_ENDPOINT || '';
  
  private constructor() {
    this.loadFromStorage();
    this.setupPeriodicFlush();
    this.setupBeforeUnload();
  }
  
  public static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService();
    }
    return MonitoringService.instance;
  }
  
  /**
   * Track an error with context and metadata
   */
  public trackError(error: Error, context: string, metadata: Record<string, unknown> = {}): void {
    console.error(`[${context}] Error:`, error, metadata);
    
    // Enrich error data with browser and app information
    const enrichedMetadata = {
      ...metadata,
      errorMessage: error.message,
      errorStack: error.stack,
      userAgent: navigator.userAgent,
      url: window.location.href,
      appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
    };
    
    this.errorBuffer.push({
      context,
      timestamp: new Date().toISOString(),
      metadata: enrichedMetadata,
    });
    
    this.saveToStorage();
    
    if (this.errorBuffer.length >= this.maxBufferSize) {
      this.flushErrors();
    }
  }
  
  /**
   * Track a performance metric
   */
  public trackPerformance(operation: string, duration: number, tags?: Record<string, string>): void {
    console.info(`[Performance] ${operation}: ${duration}ms`);
    
    this.performanceBuffer.push({
      operation,
      duration,
      timestamp: new Date().toISOString(),
      tags
    });
    
    this.saveToStorage();
    
    if (this.performanceBuffer.length >= this.maxBufferSize) {
      this.flushPerformanceMetrics();
    }
  }
  
  /**
   * Setup periodic flushing of buffers
   */
  private setupPeriodicFlush(): void {
    setInterval(() => {
      if (navigator.onLine) {
        this.flushAll();
      }
    }, this.flushInterval);
    
    // Also flush when coming back online
    window.addEventListener('online', () => {
      console.info('[Monitoring] Back online, flushing metrics');
      this.flushAll();
    });
  }
  
  /**
   * Save current state to localStorage before page unload
   */
  private setupBeforeUnload(): void {
    window.addEventListener('beforeunload', () => {
      this.saveToStorage();
    });
  }
  
  /**
   * Save buffers to localStorage
   */
  private saveToStorage(): void {
    try {
      if (this.errorBuffer.length > 0) {
        localStorage.setItem(STORAGE_KEYS.ERRORS, JSON.stringify(this.errorBuffer));
      }
      
      if (this.performanceBuffer.length > 0) {
        localStorage.setItem(STORAGE_KEYS.METRICS, JSON.stringify(this.performanceBuffer));
      }
    } catch (error) {
      console.error('[Monitoring] Failed to save to localStorage:', error);
    }
  }
  
  /**
   * Load buffers from localStorage
   */
  private loadFromStorage(): void {
    try {
      const storedErrors = localStorage.getItem(STORAGE_KEYS.ERRORS);
      if (storedErrors) {
        this.errorBuffer = JSON.parse(storedErrors);
      }
      
      const storedMetrics = localStorage.getItem(STORAGE_KEYS.METRICS);
      if (storedMetrics) {
        this.performanceBuffer = JSON.parse(storedMetrics);
      }
      
      console.info(`[Monitoring] Loaded from storage: ${this.errorBuffer.length} errors, ${this.performanceBuffer.length} metrics`);
    } catch (error) {
      console.error('[Monitoring] Failed to load from localStorage:', error);
    }
  }
  
  /**
   * Flush all buffers
   */
  private flushAll(): void {
    this.flushErrors();
    this.flushPerformanceMetrics();
  }
  
  /**
   * Flush error buffer to backend/monitoring service
   */
  private async flushErrors(): Promise<void> {
    if (this.errorBuffer.length === 0) return;
    
    try {
      if (this.errorEndpoint) {
        const response = await fetch(this.errorEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            errors: this.errorBuffer,
            timestamp: new Date().toISOString(),
            source: 'web-client'
          }),
        });
        
        if (!response.ok) {
          throw new Error(`Failed to send errors: ${response.status}`);
        }
      }
      
      // Clear buffer and storage regardless of whether we sent to backend
      // (prevents buildup of stale errors)
      this.errorBuffer = [];
      localStorage.removeItem(STORAGE_KEYS.ERRORS);
    } catch (error) {
      console.error('[Monitoring] Failed to flush errors:', error);
      
      // Only notify user in production
      if (import.meta.env.PROD) {
        toast.error('Erro de monitoramento', {
          description: 'Não foi possível enviar relatórios de erro.',
          id: 'monitoring-error',
          duration: 5000
        });
      }
    }
  }
  
  /**
   * Flush performance metrics buffer to backend/monitoring service
   */
  private async flushPerformanceMetrics(): Promise<void> {
    if (this.performanceBuffer.length === 0) return;
    
    try {
      if (this.metricsEndpoint) {
        const response = await fetch(this.metricsEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            metrics: this.performanceBuffer,
            timestamp: new Date().toISOString(),
            source: 'web-client'
          }),
        });
        
        if (!response.ok) {
          throw new Error(`Failed to send metrics: ${response.status}`);
        }
      }
      
      // Clear buffer and storage
      this.performanceBuffer = [];
      localStorage.removeItem(STORAGE_KEYS.METRICS);
    } catch (error) {
      console.error('[Monitoring] Failed to flush performance metrics:', error);
    }
  }
  
  /**
   * Get current buffer sizes (for debugging)
   */
  public getBufferSizes(): { errors: number; performance: number } {
    return {
      errors: this.errorBuffer.length,
      performance: this.performanceBuffer.length,
    };
  }
  
  /**
   * Manually force flush all data
   */
  public forceFlush(): Promise<void> {
    return Promise.all([
      this.flushErrors(),
      this.flushPerformanceMetrics()
    ]).then(() => {});
  }
}

export const monitoringService = MonitoringService.getInstance(); 