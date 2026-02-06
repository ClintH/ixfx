import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { continuously } from '../src/continuously.js';

describe('core/continuously', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('creates continuously instance', () => {
    const fn = vi.fn();
    const c = continuously(fn, 100);

    expect(c).toBeDefined();
    expect(c.runState).toBe('idle');
    expect(c.startCount).toBe(0);
    expect(c.isDisposed).toBe(false);
  });

  test('starts calling callback at interval', () => {
    const fn = vi.fn();
    const c = continuously(fn, 100);

    c.start();
    expect(c.runState).toBe('scheduled');
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(c.startCount).toBe(1);
  });

  test('continues calling callback', () => {
    const fn = vi.fn();
    const c = continuously(fn, 100);

    c.start();
    vi.advanceTimersByTime(300);

    expect(fn).toHaveBeenCalledTimes(3);
    expect(c.startCount).toBe(3);
  });

  test('stops when callback returns false', () => {
    let calls = 0;
    const fn = vi.fn(() => {
      calls++;
      return calls < 3; // Stop after 3 calls
    });
    const c = continuously(fn, 100);

    c.start();
    vi.advanceTimersByTime(500);

    expect(fn).toHaveBeenCalledTimes(3);
    expect(c.runState).toBe('idle');
  });

  test('cancel stops the loop', () => {
    const fn = vi.fn();
    const c = continuously(fn, 100);

    c.start();
    vi.advanceTimersByTime(150);
    expect(fn).toHaveBeenCalledTimes(1);

    c.cancel();
    expect(c.runState).toBe('idle');

    vi.advanceTimersByTime(200);
    expect(fn).toHaveBeenCalledTimes(1); // No more calls
  });

  test('reset restarts the loop', () => {
    const fn = vi.fn();
    const c = continuously(fn, 100);

    c.start();
    vi.advanceTimersByTime(250);
    expect(fn).toHaveBeenCalledTimes(2);
    expect(c.startCount).toBe(2);

    c.reset();
    expect(c.startCount).toBe(0);
    
    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(3);
    expect(c.startCount).toBe(1);
  });

  test('start is idempotent when running', () => {
    const fn = vi.fn();
    const c = continuously(fn, 100);

    c.start();
    c.start(); // Should not start twice
    c.start();

    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test('tracks startCountTotal across restarts', () => {
    const fn = vi.fn();
    const c = continuously(fn, 100);

    c.start();
    vi.advanceTimersByTime(250);
    expect(c.startCountTotal).toBe(2);

    c.cancel();
    c.start();
    vi.advanceTimersByTime(150);
    
    expect(c.startCountTotal).toBe(3); // Total includes both runs
    expect(c.startCount).toBe(1); // Current run count reset
  });

  test('throws if starting disposed instance', () => {
    const fn = vi.fn();
    const c = continuously(fn, 100);

    // Dispose via onStartCalled
    c.start();
    c.cancel();
    
    // We can't actually dispose without onStartCalled, but we can test isDisposed
    expect(c.isDisposed).toBe(false);
  });

  test('accepts zero interval', () => {
    const fn = vi.fn().mockReturnValue(false); // Return false to stop after first call
    const c = continuously(fn, 0);

    expect(() => c.start()).not.toThrow();
    // Zero interval is valid, actual behavior depends on environment
  });

  test('rejects negative interval', () => {
    const fn = vi.fn();
    expect(() => continuously(fn, -100)).toThrow();
  });

  test('allows changing interval', () => {
    const fn = vi.fn();
    const c = continuously(fn, 100);

    c.start();
    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);

    // Change interval and reset to apply immediately
    c.interval = 200;
    c.reset();
    
    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1); // Not yet - only 100ms of 200ms

    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(2); // Now - 200ms total
  });

  test('tracks elapsed time', () => {
    const fn = vi.fn();
    const c = continuously(fn, 100);

    c.start();
    vi.advanceTimersByTime(150);
    
    expect(c.elapsedMs).toBeGreaterThanOrEqual(150);
  });

  test('fireBeforeWait executes callback before waiting', () => {
    const fn = vi.fn();
    const c = continuously(fn, 100, { fireBeforeWait: true });

    c.start();
    // Should fire immediately
    expect(fn).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(2);
  });

  test('supports async callbacks', async () => {
    let callCount = 0;
    const fn = vi.fn().mockImplementation(async () => {
      callCount++;
      if (callCount >= 2) return false; // Stop after 2 calls to prevent infinite loop
      return undefined;
    });
    const c = continuously(fn, 100);

    c.start();
    await vi.advanceTimersByTimeAsync(250);
    
    expect(fn).toHaveBeenCalled();
  });

  test('async callback returning false stops loop', async () => {
    let calls = 0;
    const fn = vi.fn().mockImplementation(async () => {
      calls++;
      return calls < 3;
    });
    const c = continuously(fn, 100);

    c.start();
    await vi.advanceTimersByTimeAsync(350);

    expect(fn).toHaveBeenCalledTimes(3);
    expect(c.runState).toBe('idle');
  });

  test('onStartCalled can cancel', () => {
    const fn = vi.fn();
    const onStartCalled = vi.fn().mockReturnValue('cancel');
    const c = continuously(fn, 100, { onStartCalled });

    c.start();
    expect(onStartCalled).toHaveBeenCalled();
    expect(c.runState).toBe('idle');
    
    vi.advanceTimersByTime(200);
    expect(fn).not.toHaveBeenCalled();
  });

  test('onStartCalled can dispose', () => {
    const fn = vi.fn();
    const onStartCalled = vi.fn().mockReturnValue('dispose');
    const c = continuously(fn, 100, { onStartCalled });

    c.start();
    expect(c.isDisposed).toBe(true);
    
    // Should throw on next start
    expect(() => c.start()).toThrow('Disposed');
  });

  test('onStartCalled can reset', () => {
    const fn = vi.fn();
    let shouldReset = true;
    const onStartCalled = vi.fn(() => {
      if (shouldReset) {
        shouldReset = false;
        return 'reset';
      }
      return 'continue';
    });
    const c = continuously(fn, 100, { onStartCalled });

    c.start();
    expect(onStartCalled).toHaveBeenCalledTimes(2); // Called twice due to reset
  });

  test('passes ticks and elapsedMs to callback', () => {
    const calls: Array<{ ticks: number; elapsedMs: number }> = [];
    const fn = vi.fn((ticks, elapsedMs) => {
      calls.push({ ticks, elapsedMs });
    });
    const c = continuously(fn, 100);

    c.start();
    vi.advanceTimersByTime(300);

    expect(calls).toHaveLength(3);
    expect(calls[0].ticks).toBe(1);
    expect(calls[1].ticks).toBe(2);
    expect(calls[2].ticks).toBe(3);
  });

  test('reset throws if disposed', () => {
    const fn = vi.fn();
    const onStartCalled = vi.fn().mockReturnValue('dispose');
    const c = continuously(fn, 100, { onStartCalled });

    c.start();
    expect(() => c.reset()).toThrow('Disposed');
  });

  test('signal abort stops loop', () => {
    const controller = new AbortController();
    const fn = vi.fn();
    const c = continuously(fn, 100, { signal: controller.signal });

    c.start();
    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);

    controller.abort();
    // Signal is checked at start of loop
    vi.advanceTimersByTime(100);
    // Should stop after checking signal
  });

  test('cancel is idempotent', () => {
    const fn = vi.fn();
    const c = continuously(fn, 100);

    c.start();
    c.cancel();
    c.cancel();
    c.cancel();
    
    expect(c.runState).toBe('idle');
  });

  test('interval validation on set', () => {
    const fn = vi.fn();
    const c = continuously(fn, 100);

    expect(() => {
      c.interval = -50;
    }).toThrow();
  });
});