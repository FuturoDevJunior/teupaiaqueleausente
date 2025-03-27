/**
 * Worker Manager
 * 
 * A utility for managing and communicating with Web Workers
 * to handle CPU-intensive tasks in the background.
 */

// Types for worker communication
type WorkerTask = {
  id: string;
  type: string;
  payload: unknown;
};

type WorkerResponse = {
  id: string;
  type: string;
  result?: unknown;
  error?: string;
};

export class WorkerManager {
  private static instance: WorkerManager;
  private workers: Map<string, Worker> = new Map();
  private pendingTasks: Map<string, { 
    resolve: (value: unknown) => void;
    reject: (reason: unknown) => void;
    timeout: number; 
  }> = new Map();
  private isSupported: boolean;
  
  private constructor() {
    // Check if Web Workers are supported
    this.isSupported = typeof Worker !== 'undefined';
    
    // Setup task timeout checking
    setInterval(() => this.checkTimeouts(), 5000);
  }
  
  public static getInstance(): WorkerManager {
    if (!WorkerManager.instance) {
      WorkerManager.instance = new WorkerManager();
    }
    return WorkerManager.instance;
  }
  
  /**
   * Register a worker for a specific task type
   */
  public registerWorker(name: string, workerUrl: string): boolean {
    if (!this.isSupported) {
      console.warn('Web Workers are not supported in this browser');
      return false;
    }
    
    try {
      const worker = new Worker(workerUrl, { name, type: 'module' });
      
      worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
        const { id, result, error } = event.data;
        
        const pendingTask = this.pendingTasks.get(id);
        if (pendingTask) {
          if (error) {
            pendingTask.reject(new Error(error));
          } else {
            pendingTask.resolve(result);
          }
          this.pendingTasks.delete(id);
        }
      };
      
      worker.onerror = (error) => {
        console.error(`Error in worker ${name}:`, error);
      };
      
      this.workers.set(name, worker);
      return true;
    } catch (error) {
      console.error(`Failed to register worker ${name}:`, error);
      return false;
    }
  }
  
  /**
   * Execute a task in a background worker
   */
  public executeTask<T = unknown>(
    workerName: string, 
    taskType: string, 
    payload: unknown,
    timeoutMs: number = 30000
  ): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const worker = this.workers.get(workerName);
      
      if (!worker) {
        reject(new Error(`Worker ${workerName} not found`));
        return;
      }
      
      const taskId = `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
      
      // Store the promise callbacks
      this.pendingTasks.set(taskId, {
        resolve: resolve as (value: unknown) => void,
        reject,
        timeout: Date.now() + timeoutMs
      });
      
      // Create the task
      const task: WorkerTask = {
        id: taskId,
        type: taskType,
        payload
      };
      
      // Send to worker
      worker.postMessage(task);
    });
  }
  
  /**
   * Terminate a worker
   */
  public terminateWorker(name: string): boolean {
    const worker = this.workers.get(name);
    if (worker) {
      worker.terminate();
      this.workers.delete(name);
      return true;
    }
    return false;
  }
  
  /**
   * Check for timed out tasks
   */
  private checkTimeouts(): void {
    const now = Date.now();
    
    for (const [id, task] of this.pendingTasks.entries()) {
      if (task.timeout < now) {
        task.reject(new Error('Task timed out'));
        this.pendingTasks.delete(id);
      }
    }
  }
  
  /**
   * Terminate all workers
   */
  public terminateAll(): void {
    for (const [name, worker] of this.workers.entries()) {
      worker.terminate();
      this.workers.delete(name);
    }
    
    // Reject all pending tasks
    for (const [id, task] of this.pendingTasks.entries()) {
      task.reject(new Error('Worker terminated'));
      this.pendingTasks.delete(id);
    }
  }
  
  /**
   * Check if Web Workers are supported
   */
  public supportsWorkers(): boolean {
    return this.isSupported;
  }
}

export const workerManager = WorkerManager.getInstance(); 