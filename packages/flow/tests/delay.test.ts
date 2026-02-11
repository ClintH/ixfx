import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { delay, delayLoop } from '../src/delay.js';
import { sleep } from '@ixfx/core';

describe('flow/delay', () => {
  describe('delay()', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    test('delays execution with millisecond number', async () => {
      const callback = vi.fn().mockResolvedValue('result');
      const promise = delay(callback, 100);
      
      expect(callback).not.toHaveBeenCalled();
      
      vi.advanceTimersByTime(100);
      await promise;
      
      expect(callback).toHaveBeenCalledTimes(1);
    });

    test('delays execution with Interval object', async () => {
      const callback = vi.fn().mockResolvedValue('result');
      const promise = delay(callback, { millis: 100 });
      
      vi.advanceTimersByTime(100);
      await promise;
      
      expect(callback).toHaveBeenCalledTimes(1);
    });

    test('delays with seconds in Interval object', async () => {
      const callback = vi.fn().mockResolvedValue('result');
      const promise = delay(callback, { secs: 1 });
      
      vi.advanceTimersByTime(1000);
      await promise;
      
      expect(callback).toHaveBeenCalledTimes(1);
    });

    test('delay "before" option - delays before callback', async () => {
      const callback = vi.fn().mockResolvedValue('result');
      const promise = delay(callback, { millis: 100, delay: 'before' });
      
      expect(callback).not.toHaveBeenCalled();
      vi.advanceTimersByTime(100);
      await promise;
      
      expect(callback).toHaveBeenCalledTimes(1);
    });

    test('delay "after" option - delays after callback', async () => {
      const callback = vi.fn().mockResolvedValue('result');
      
      // Use real timers since sleep doesn't work with fake timers
      vi.useRealTimers();
      
      const promise = delay(callback, { millis: 10, delay: 'after' });
      
      // Callback executes immediately
      expect(callback).toHaveBeenCalledTimes(1);
      
      await promise;
    }, 1000);

    test('delay "both" option - delays before and after', async () => {
      const callback = vi.fn().mockResolvedValue('result');
      
      // Use real timers since sleep doesn't work with fake timers
      vi.useRealTimers();
      
      const promise = delay(callback, { millis: 10, delay: 'both' });
      
      // Should not be called immediately due to "before" delay
      expect(callback).not.toHaveBeenCalled();
      
      await promise;
      
      // Callback should be called after both delays complete
      expect(callback).toHaveBeenCalledTimes(1);
    }, 1000);

    test('returns callback result', async () => {
      const expectedResult = { data: 'test' };
      const callback = vi.fn().mockResolvedValue(expectedResult);
      
      const promise = delay(callback, 100);
      vi.advanceTimersByTime(100);
      
      const result = await promise;
      expect(result).toEqual(expectedResult);
    });

    test('handles async callback errors', async () => {
      const error = new Error('callback error');
      const callback = vi.fn().mockRejectedValue(error);
      
      const promise = delay(callback, 100);
      vi.advanceTimersByTime(100);
      
      await expect(promise).rejects.toThrow('callback error');
    });

    test('passes AbortSignal to cancel delay', async () => {
      const abortController = new AbortController();
      const callback = vi.fn().mockResolvedValue('result');
      
      const promise = delay(callback, { millis: 1000, signal: abortController.signal });
      
      // Abort before delay completes
      abortController.abort();
      
      await expect(promise).rejects.toThrow();
    });
  });

  describe('delayLoop()', () => {
    test('throws on negative timeout', async () => {
      const loop = delayLoop(-1);
      await expect(loop.next()).rejects.toThrow('Timeout is less than zero');
    });

    test('throws on undefined timeout', async () => {
      // @ts-expect-error Testing invalid input
      const loop = delayLoop(undefined);
      await expect(loop.next()).rejects.toThrow('Not a valid interval');
    });

    test('loops at specified interval', async () => {
      const loop = delayLoop(50);
      const iterations: number[] = [];
      
      const runLoop = async () => {
        let count = 0;
        for await (const _ of loop) {
          iterations.push(count++);
          if (count >= 3) break;
        }
      };
      
      await runLoop();
      
      expect(iterations).toEqual([0, 1, 2]);
    }, 1000);

    test('cleans up timer on break', async () => {
      const loop = delayLoop(50);
      
      // Run one iteration then break
      const result = await loop.next();
      expect(result.done).toBe(false);
      
      // Clean up by returning
      await loop.return?.();
    }, 1000);

    test('works with Interval object', async () => {
      const loop = delayLoop({ millis: 50 });
      
      const result = await loop.next();
      expect(result.done).toBe(false);
      
      await loop.return?.();
    }, 1000);

    test('handles multiple concurrent loops independently', async () => {
      const loop1 = delayLoop(50);
      const loop2 = delayLoop(100);
      
      const results1: number[] = [];
      const results2: number[] = [];
      
      const run1 = async () => {
        let count = 0;
        for await (const _ of loop1) {
          results1.push(count++);
          if (count >= 2) break;
        }
      };
      
      const run2 = async () => {
        let count = 0;
        for await (const _ of loop2) {
          results2.push(count++);
          if (count >= 2) break;
        }
      };
      
      await Promise.all([run1(), run2()]);
      
      expect(results1).toEqual([0, 1]);
      expect(results2).toEqual([0, 1]);
    }, 1000);
  });
});
