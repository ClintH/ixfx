import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { waitFor } from '../src/wait-for.js';

describe('flow/wait-for', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('returns done function', () => {
    const onAborted = vi.fn();
    const done = waitFor(1000, onAborted);
    
    expect(typeof done).toBe('function');
  });

  test('calls onAborted when timeout expires', () => {
    const onAborted = vi.fn();
    waitFor(1000, onAborted);
    
    expect(onAborted).not.toHaveBeenCalled();
    
    vi.advanceTimersByTime(1000);
    
    expect(onAborted).toHaveBeenCalledTimes(1);
    expect(onAborted).toHaveBeenCalledWith('Timeout after 1000ms');
  });

  test('does not call onAborted when done() called before timeout', () => {
    const onAborted = vi.fn();
    const done = waitFor(1000, onAborted);
    
    done();
    
    vi.advanceTimersByTime(1000);
    
    expect(onAborted).not.toHaveBeenCalled();
  });

  test('clears timeout when done() is called', () => {
    const onAborted = vi.fn();
    const done = waitFor(1000, onAborted);
    
    // Signal success
    done();
    
    // Advance past timeout
    vi.advanceTimersByTime(2000);
    
    // onAborted should not be called
    expect(onAborted).not.toHaveBeenCalled();
  });

  test('calls onAborted with error message when done(error) called', () => {
    const onAborted = vi.fn();
    const done = waitFor(1000, onAborted);
    
    done('Something went wrong');
    
    expect(onAborted).toHaveBeenCalledTimes(1);
    expect(onAborted).toHaveBeenCalledWith('Something went wrong');
  });

  test('calls onComplete with true on success', () => {
    const onAborted = vi.fn();
    const onComplete = vi.fn();
    const done = waitFor(1000, onAborted, onComplete);
    
    done();
    
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledWith(true);
  });

  test('calls onComplete with false on error', () => {
    const onAborted = vi.fn();
    const onComplete = vi.fn();
    const done = waitFor(1000, onAborted, onComplete);
    
    done('Error occurred');
    
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledWith(false);
  });

  test('calls onComplete with false on timeout', () => {
    const onAborted = vi.fn();
    const onComplete = vi.fn();
    waitFor(1000, onAborted, onComplete);
    
    vi.advanceTimersByTime(1000);
    
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledWith(false);
  });

  test('onComplete is called after onAborted on timeout', () => {
    const callOrder: string[] = [];
    const onAborted = () => callOrder.push('onAborted');
    const onComplete = () => callOrder.push('onComplete');
    
    waitFor(1000, onAborted, onComplete);
    vi.advanceTimersByTime(1000);
    
    expect(callOrder).toEqual(['onAborted', 'onComplete']);
  });

  test('onComplete is called after onAborted on error', () => {
    const callOrder: string[] = [];
    const onAborted = () => callOrder.push('onAborted');
    const onComplete = () => callOrder.push('onComplete');
    
    const done = waitFor(1000, onAborted, onComplete);
    done('Error');
    
    expect(callOrder).toEqual(['onAborted', 'onComplete']);
  });

  test('onComplete is called immediately on success', () => {
    const onAborted = vi.fn();
    const onComplete = vi.fn();
    const done = waitFor(1000, onAborted, onComplete);
    
    done();
    
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledWith(true);
    expect(onAborted).not.toHaveBeenCalled();
  });

  test('works without onComplete callback', () => {
    const onAborted = vi.fn();
    const done = waitFor(1000, onAborted);
    
    // Should not throw
    done();
    
    expect(onAborted).not.toHaveBeenCalled();
  });

  test('works without onComplete on timeout', () => {
    const onAborted = vi.fn();
    waitFor(1000, onAborted);
    
    // Should not throw
    vi.advanceTimersByTime(1000);
    
    expect(onAborted).toHaveBeenCalledTimes(1);
  });

  test('works without onComplete on error', () => {
    const onAborted = vi.fn();
    const done = waitFor(1000, onAborted);
    
    // Should not throw
    done('Error');
    
    expect(onAborted).toHaveBeenCalledTimes(1);
  });

  test('handles very short timeouts', () => {
    const onAborted = vi.fn();
    waitFor(0, onAborted);
    
    vi.advanceTimersByTime(0);
    
    expect(onAborted).toHaveBeenCalledWith('Timeout after 0ms');
  });

  test('handles multiple calls to done()', () => {
    const onAborted = vi.fn();
    const onComplete = vi.fn();
    const done = waitFor(1000, onAborted, onComplete);
    
    // Call done multiple times - only first should matter
    done();
    done();
    done();
    
    expect(onComplete).toHaveBeenCalledTimes(3);
    expect(onComplete).toHaveBeenCalledWith(true);
  });

  test('handles done() called after timeout', () => {
    const onAborted = vi.fn();
    const onComplete = vi.fn();
    const done = waitFor(100, onAborted, onComplete);
    
    vi.advanceTimersByTime(100);
    
    // onAborted and onComplete already called
    expect(onAborted).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledTimes(1);
    
    // Calling done after timeout should be safe
    done();
    
    // No additional calls
    expect(onAborted).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledTimes(2);
  });
});
