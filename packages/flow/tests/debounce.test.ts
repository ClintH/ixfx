import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { debounce } from '../src/debounce.js';

describe('flow/debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('creates debounced function', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);
    
    expect(typeof debounced).toBe('function');
  });

  test('does not call function immediately', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);
    
    debounced();
    expect(fn).not.toHaveBeenCalled();
  });

  test('calls function after interval', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);
    
    debounced();
    vi.advanceTimersByTime(100);
    
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test('resets timer on subsequent calls', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);
    
    debounced();
    vi.advanceTimersByTime(50);
    debounced(); // Reset timer
    vi.advanceTimersByTime(50);
    
    // Should not have been called yet
    expect(fn).not.toHaveBeenCalled();
    
    vi.advanceTimersByTime(50);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test('only calls once after rapid invocations', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);
    
    debounced();
    debounced();
    debounced();
    debounced();
    debounced();
    
    vi.advanceTimersByTime(100);
    
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test('passes arguments to callback', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);
    
    debounced('arg1', 42, { key: 'value' });
    vi.advanceTimersByTime(100);
    
    expect(fn).toHaveBeenCalledWith(expect.any(Number), 'arg1', 42, { key: 'value' });
  });

  test('calls function with latest arguments', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);
    
    debounced('first');
    debounced('second');
    debounced('third');
    
    vi.advanceTimersByTime(100);
    
    expect(fn).toHaveBeenCalledWith(expect.any(Number), 'third');
    expect(fn).not.toHaveBeenCalledWith(expect.any(Number), 'first');
    expect(fn).not.toHaveBeenCalledWith(expect.any(Number), 'second');
  });

  test('supports multiple debounced calls after completion', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);
    
    debounced();
    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);
    
    debounced();
    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(2);
  });

  test('works with async callbacks', async () => {
    const fn = vi.fn().mockResolvedValue(undefined);
    const debounced = debounce(fn, 100);
    
    debounced();
    vi.advanceTimersByTime(100);
    
    await vi.runAllTimersAsync();
    expect(fn).toHaveBeenCalled();
  });





  test('can be used with event listeners pattern', () => {
    const events: string[] = [];
    const handler = (...args: any[]) => {
      events.push(args[1] as string);
    };
    const debounced = debounce(handler, 100);
    
    // Simulate rapid events
    debounced('event1');
    debounced('event2');
    debounced('event3');
    
    vi.advanceTimersByTime(100);
    
    // Only the last event should be processed
    expect(events).toEqual(['event3']);
  });
});