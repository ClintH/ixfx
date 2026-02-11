import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { TaskQueueMutable } from '../src/task-queue-mutable.js';

describe('flow/task-queue-mutable', () => {
  let queue: TaskQueueMutable;

  beforeEach(() => {
    // Clear the shared instance before each test
    TaskQueueMutable.shared.clear();
    queue = TaskQueueMutable.shared;
  });

  afterEach(() => {
    queue.clear();
  });

  describe('shared instance', () => {
    test('provides singleton instance', () => {
      const instance1 = TaskQueueMutable.shared;
      const instance2 = TaskQueueMutable.shared;
      
      expect(instance1).toBe(instance2);
    });
  });

  describe('enqueue()', () => {
    test('adds task to queue', () => {
      const task = vi.fn().mockResolvedValue(undefined);
      
      const length = queue.enqueue(task);
      
      expect(length).toBe(1);
      expect(queue.length).toBe(1);
      expect(queue.isEmpty).toBe(false);
    });

    test('fires started event when first task added', async () => {
      const startedHandler = vi.fn();
      queue.addEventListener('started', startedHandler);
      
      const task = vi.fn().mockResolvedValue(undefined);
      queue.enqueue(task);
      
      expect(startedHandler).toHaveBeenCalledTimes(1);
    });

    test('returns correct queue length after multiple enqueues', () => {
      const task1 = vi.fn().mockResolvedValue(undefined);
      const task2 = vi.fn().mockResolvedValue(undefined);
      
      const length1 = queue.enqueue(task1);
      const length2 = queue.enqueue(task2);
      
      expect(length1).toBe(1);
      expect(length2).toBe(2);
      expect(queue.length).toBe(2);
    });
  });

  describe('dequeue()', () => {
    test('returns undefined when queue is empty', () => {
      const task = queue.dequeue();
      
      expect(task).toBeUndefined();
    });

    test('returns and removes task from queue', () => {
      const task = vi.fn().mockResolvedValue(undefined);
      queue.enqueue(task);
      
      const dequeued = queue.dequeue();
      
      expect(dequeued).toBe(task);
      expect(queue.length).toBe(0);
    });

    test('returns tasks in FIFO order', () => {
      const task1 = vi.fn().mockResolvedValue(undefined);
      const task2 = vi.fn().mockResolvedValue(undefined);
      const task3 = vi.fn().mockResolvedValue(undefined);
      
      queue.enqueue(task1);
      queue.enqueue(task2);
      queue.enqueue(task3);
      
      expect(queue.dequeue()).toBe(task1);
      expect(queue.dequeue()).toBe(task2);
      expect(queue.dequeue()).toBe(task3);
    });
  });

  describe('clear()', () => {
    test('removes all tasks from queue', () => {
      queue.enqueue(vi.fn().mockResolvedValue(undefined));
      queue.enqueue(vi.fn().mockResolvedValue(undefined));
      
      queue.clear();
      
      expect(queue.length).toBe(0);
      expect(queue.isEmpty).toBe(true);
    });

    test('fires empty event', () => {
      const emptyHandler = vi.fn();
      queue.addEventListener('empty', emptyHandler);
      
      queue.enqueue(vi.fn().mockResolvedValue(undefined));
      queue.clear();
      
      expect(emptyHandler).toHaveBeenCalledTimes(1);
    });

    test('does nothing when queue is already empty', () => {
      const emptyHandler = vi.fn();
      queue.addEventListener('empty', emptyHandler);
      
      queue.clear();
      
      expect(emptyHandler).not.toHaveBeenCalled();
    });
  });

  describe('isEmpty getter', () => {
    test('returns true when queue is empty', () => {
      expect(queue.isEmpty).toBe(true);
    });

    test('returns false when queue has items', () => {
      queue.enqueue(vi.fn().mockResolvedValue(undefined));
      
      expect(queue.isEmpty).toBe(false);
    });

    test('returns true after clearing', () => {
      queue.enqueue(vi.fn().mockResolvedValue(undefined));
      queue.clear();
      
      expect(queue.isEmpty).toBe(true);
    });
  });

  describe('length getter', () => {
    test('returns 0 when queue is empty', () => {
      expect(queue.length).toBe(0);
    });

    test('returns correct count of items', () => {
      queue.enqueue(vi.fn().mockResolvedValue(undefined));
      queue.enqueue(vi.fn().mockResolvedValue(undefined));
      queue.enqueue(vi.fn().mockResolvedValue(undefined));
      
      expect(queue.length).toBe(3);
    });

    test('updates after dequeue', () => {
      queue.enqueue(vi.fn().mockResolvedValue(undefined));
      queue.enqueue(vi.fn().mockResolvedValue(undefined));
      
      queue.dequeue();
      
      expect(queue.length).toBe(1);
    });
  });

  describe('event handling', () => {
    test('fires empty event when queue becomes empty after processing', async () => {
      const emptyHandler = vi.fn();
      queue.addEventListener('empty', emptyHandler);
      
      const task = vi.fn().mockResolvedValue(undefined);
      queue.enqueue(task);
      
      // Wait for processing
      await new Promise(resolve => setTimeout(resolve, 200));
      
      expect(emptyHandler).toHaveBeenCalledTimes(1);
    });

    test('does not fire started event when adding to non-empty queue', async () => {
      const startedHandler = vi.fn();
      queue.addEventListener('started', startedHandler);
      
      // Add first task
      queue.enqueue(vi.fn().mockResolvedValue(undefined));
      expect(startedHandler).toHaveBeenCalledTimes(1);
      
      // Wait a bit for processing to start
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Add second task - should not fire started again
      queue.enqueue(vi.fn().mockResolvedValue(undefined));
      expect(startedHandler).toHaveBeenCalledTimes(1);
    });

    test('allows removing event listeners', () => {
      const handler = vi.fn();
      queue.addEventListener('empty', handler);
      queue.removeEventListener('empty', handler);
      
      queue.enqueue(vi.fn().mockResolvedValue(undefined));
      queue.clear();
      
      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    test('handles task errors gracefully', async () => {
      const error = new Error('Task failed');
      const failingTask = vi.fn().mockRejectedValue(error);
      const successTask = vi.fn().mockResolvedValue(undefined);
      
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      queue.enqueue(failingTask);
      queue.enqueue(successTask);
      
      // Wait for processing
      await new Promise(resolve => setTimeout(resolve, 300));
      
      expect(consoleError).toHaveBeenCalledWith(error);
      expect(failingTask).toHaveBeenCalledTimes(1);
      expect(successTask).toHaveBeenCalledTimes(1);
      
      consoleError.mockRestore();
    });

    test('continues processing after task error', async () => {
      const error = new Error('Task failed');
      const failingTask = vi.fn().mockRejectedValue(error);
      const successTask = vi.fn().mockResolvedValue(undefined);
      
      vi.spyOn(console, 'error').mockImplementation(() => {});
      
      queue.enqueue(failingTask);
      queue.enqueue(successTask);
      
      // Wait for processing
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Both tasks should have been executed
      expect(failingTask).toHaveBeenCalledTimes(1);
      expect(successTask).toHaveBeenCalledTimes(1);
    });
  });

  describe('async task execution', () => {
    test('executes tasks asynchronously', async () => {
      const executionOrder: string[] = [];
      
      const task1 = async () => {
        executionOrder.push('task1-start');
        await new Promise(resolve => setTimeout(resolve, 50));
        executionOrder.push('task1-end');
      };
      
      const task2 = async () => {
        executionOrder.push('task2-start');
        executionOrder.push('task2-end');
      };
      
      queue.enqueue(task1);
      queue.enqueue(task2);
      
      // Wait for all processing
      await new Promise(resolve => setTimeout(resolve, 300));
      
      expect(executionOrder).toEqual([
        'task1-start',
        'task1-end',
        'task2-start',
        'task2-end'
      ]);
    });

    test('processes tasks in order', async () => {
      const results: number[] = [];
      
      queue.enqueue(async () => { results.push(1); });
      queue.enqueue(async () => { results.push(2); });
      queue.enqueue(async () => { results.push(3); });
      
      // Wait for all processing
      await new Promise(resolve => setTimeout(resolve, 400));
      
      expect(results).toEqual([1, 2, 3]);
    });
  });
});
