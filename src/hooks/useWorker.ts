import {
  useEffect,
  useState,
} from 'react';

import { workerManager } from '@/lib/worker-manager';

interface UseWorkerOptions {
  /**
   * Auto-initialize the worker on hook mount
   */
  autoInit?: boolean;
  
  /**
   * Timeout in milliseconds for worker tasks
   */
  timeout?: number;
  
  /**
   * Callback for worker initialization success
   */
  onInitSuccess?: () => void;
  
  /**
   * Callback for worker initialization error
   */
  onInitError?: (error: Error) => void;
}

interface UseWorkerResult<T> {
  /**
   * Execute a task in the worker
   */
  execute: <R = unknown>(taskType: string, payload: unknown) => Promise<R>;
  
  /**
   * Initialize the worker (if not auto-initialized)
   */
  initialize: () => Promise<boolean>;
  
  /**
   * Current state of the worker
   */
  status: 'idle' | 'initializing' | 'ready' | 'error';
  
  /**
   * Whether the worker is currently executing a task
   */
  isProcessing: boolean;
  
  /**
   * Last error that occurred
   */
  error: Error | null;
  
  /**
   * Last successful result
   */
  lastResult: T | null;
  
  /**
   * Terminate the worker
   */
  terminate: () => void;
}

/**
 * Hook for using Web Workers in React components
 * 
 * @param workerName - Name of the worker (must match registration name)
 * @param workerUrl - URL to the worker script
 * @param options - Options for worker behavior
 */
export function useWorker<T = unknown>(
  workerName: string,
  workerUrl: string,
  options: UseWorkerOptions = {}
): UseWorkerResult<T> {
  const {
    autoInit = true,
    timeout = 30000,
    onInitSuccess,
    onInitError
  } = options;
  
  const [status, setStatus] = useState<'idle' | 'initializing' | 'ready' | 'error'>(
    autoInit ? 'initializing' : 'idle'
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastResult, setLastResult] = useState<T | null>(null);
  
  // Initialize worker if autoInit is true
  useEffect(() => {
    if (autoInit) {
      initialize().catch((err) => {
        setError(err);
        setStatus('error');
        if (onInitError) onInitError(err);
      });
    }
    
    // Cleanup: terminate the worker on unmount
    return () => {
      workerManager.terminateWorker(workerName);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  /**
   * Initialize the worker
   */
  const initialize = async (): Promise<boolean> => {
    try {
      setStatus('initializing');
      setError(null);
      
      if (!workerManager.supportsWorkers()) {
        throw new Error('Web Workers are not supported in this browser');
      }
      
      const result = workerManager.registerWorker(workerName, workerUrl);
      
      if (result) {
        setStatus('ready');
        if (onInitSuccess) onInitSuccess();
        return true;
      } else {
        throw new Error(`Failed to register worker: ${workerName}`);
      }
    } catch (err) {
      setStatus('error');
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      if (onInitError) onInitError(error);
      return false;
    }
  };
  
  /**
   * Execute a task in the worker
   */
  const execute = async <R = unknown>(taskType: string, payload: unknown): Promise<R> => {
    try {
      if (status !== 'ready') {
        throw new Error(`Worker not ready. Current status: ${status}`);
      }
      
      setIsProcessing(true);
      setError(null);
      
      const result = await workerManager.executeTask<R>(workerName, taskType, payload, timeout);
      
      setLastResult(result as unknown as T);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };
  
  /**
   * Terminate the worker
   */
  const terminate = (): void => {
    workerManager.terminateWorker(workerName);
    setStatus('idle');
  };
  
  return {
    execute,
    initialize,
    status,
    isProcessing,
    error,
    lastResult,
    terminate
  };
}

export default useWorker; 