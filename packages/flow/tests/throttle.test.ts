import { describe, test, expect, vi } from 'vitest';
import { throttle } from '../src/throttle.js';
import { sleep } from '@ixfx/core';

describe('flow/throttle', () => {
  test('creates throttled function', () => {
    const fn = () => {};
    const throttled = throttle(fn, 100);
    
    expect(typeof throttled).toBe('function');
  });

  test('calls callback immediately on first invocation', async () => {
    const fn = vi.fn();
    const throttled = throttle(fn, 100);
    
    await throttled();
    
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test('does not call callback again before interval expires', async () => {
    const fn = vi.fn();
    const throttled = throttle(fn, 100);
    
    await throttled();
    expect(fn).toHaveBeenCalledTimes(1);
    
    // Call again immediately - should be throttled
    await throttled();
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test('calls callback again after interval expires', async () => {
    const fn = vi.fn();
    const throttled = throttle(fn, 50);
    
    await throttled();
    expect(fn).toHaveBeenCalledTimes(1);
    
    // Wait for interval to pass
    await sleep(60);
    await throttled();
    expect(fn).toHaveBeenCalledTimes(2);
  });

  test('passes arguments to callback', async () => {
    const fn = vi.fn();
    const throttled = throttle(fn, 100);
    
    await throttled('arg1', 42, { key: 'value' });
    
    expect(fn).toHaveBeenCalledWith(expect.any(Number), 'arg1', 42, { key: 'value' });
  });

  test('passes elapsed time to callback', async () => {
    const fn = vi.fn();
    const throttled = throttle(fn, 100);
    
    await throttled();
    expect(fn).toHaveBeenCalledWith(expect.any(Number));
    
    const firstElapsed = fn.mock.calls[0][0];
    expect(firstElapsed).toBeGreaterThanOrEqual(0);
  });

  test('handles async callbacks', async () => {
    const fn = vi.fn().mockResolvedValue(undefined);
    const throttled = throttle(fn, 50);
    
    await throttled();
    expect(fn).toHaveBeenCalledTimes(1);
    
    await sleep(60);
    await throttled();
    expect(fn).toHaveBeenCalledTimes(2);
  });

  test('waits for async callback to complete', async () => {
    let resolved = false;
    const fn = vi.fn().mockImplementation(async () => {
      await sleep(10);
      resolved = true;
    });
    const throttled = throttle(fn, 100);
    
    await throttled();
    expect(resolved).toBe(true);
  });

  test('handles multiple rapid invocations', async () => {
    const fn = vi.fn();
    const throttled = throttle(fn, 100);
    
    // Rapid invocations
    await throttled();
    await throttled();
    await throttled();
    await throttled();
    await throttled();
    
    // Only first should execute
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test('throttles correctly over multiple intervals', async () => {
    const fn = vi.fn();
    const throttled = throttle(fn, 50);
    
    // First call
    await throttled();
    expect(fn).toHaveBeenCalledTimes(1);
    
    // Wait for interval
    await sleep(60);
    await throttled();
    expect(fn).toHaveBeenCalledTimes(2);
    
    // Wait for another interval
    await sleep(60);
    await throttled();
    expect(fn).toHaveBeenCalledTimes(3);
    
    // Call immediately - should be throttled
    await throttled();
    expect(fn).toHaveBeenCalledTimes(3);
  });

  test('works with event listener pattern', async () => {
    const events: string[] = [];
    const handler = (elapsedMs: number, ...args: readonly unknown[]) => {
      events.push(args[0] as string);
    };
    const throttled = throttle(handler, 100);
    
    // Simulate rapid events
    await throttled('event1');
    await throttled('event2');
    await throttled('event3');
    
    // Only first event should be processed
    expect(events).toEqual(['event1']);
    
    // After interval
    await sleep(110);
    await throttled('event4');
    expect(events).toEqual(['event1', 'event4']);
  });

  test('updates trigger time on each successful call', async () => {
    const fn = vi.fn();
    const throttled = throttle(fn, 50);
    
    await throttled();
    expect(fn).toHaveBeenCalledTimes(1);
    
    // Wait for interval
    await sleep(60);
    await throttled();
    expect(fn).toHaveBeenCalledTimes(2);
    
    // Call immediately after - should be throttled
    await throttled();
    expect(fn).toHaveBeenCalledTimes(2);
    
    // Wait for another interval
    await sleep(60);
    await throttled();
    expect(fn).toHaveBeenCalledTimes(3);
  });
});
