import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
  elapsedSince, 
  elapsedInterval, 
  elapsedOnce, 
  elapsedInfinity 
} from '../src/elapsed.js';

describe('core/elapsed', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('elapsedSince', () => {
    test('returns a function', () => {
      const elapsed = elapsedSince();
      expect(typeof elapsed).toBe('function');
    });

    test('returns 0 immediately', () => {
      const elapsed = elapsedSince();
      expect(elapsed()).toBe(0);
    });

    test('returns elapsed time', () => {
      const elapsed = elapsedSince();
      vi.advanceTimersByTime(100);
      expect(elapsed()).toBe(100);
    });

    test('continues tracking time', () => {
      const elapsed = elapsedSince();
      vi.advanceTimersByTime(100);
      expect(elapsed()).toBe(100);
      
      vi.advanceTimersByTime(50);
      expect(elapsed()).toBe(150);
    });

    test('multiple calls return increasing values', () => {
      const elapsed = elapsedSince();
      vi.advanceTimersByTime(10);
      const first = elapsed();
      vi.advanceTimersByTime(10);
      const second = elapsed();
      
      expect(second).toBeGreaterThan(first);
    });
  });

  describe('elapsedInterval', () => {
    test('returns a function', () => {
      const interval = elapsedInterval();
      expect(typeof interval).toBe('function');
    });

    test('returns 0 on first call', () => {
      const interval = elapsedInterval();
      expect(interval()).toBe(0);
    });

    test('returns time since last call', () => {
      const interval = elapsedInterval();
      interval(); // First call initializes
      
      vi.advanceTimersByTime(100);
      expect(interval()).toBe(100);
      
      vi.advanceTimersByTime(50);
      expect(interval()).toBe(50);
    });

    test('reset interval on each call', () => {
      const interval = elapsedInterval();
      interval();
      
      vi.advanceTimersByTime(100);
      const first = interval();
      expect(first).toBe(100);
      
      vi.advanceTimersByTime(100);
      const second = interval();
      expect(second).toBe(100);
    });
  });

  describe('elapsedOnce', () => {
    test('returns a function', () => {
      const once = elapsedOnce();
      expect(typeof once).toBe('function');
    });

    test('returns elapsed time on first call', () => {
      const once = elapsedOnce();
      vi.advanceTimersByTime(100);
      expect(once()).toBe(100);
    });

    test('returns same value on subsequent calls', () => {
      const once = elapsedOnce();
      vi.advanceTimersByTime(100);
      const first = once();
      
      vi.advanceTimersByTime(100);
      const second = once();
      
      expect(second).toBe(first);
      expect(second).toBe(100);
    });

    test('returns 0 if called immediately', () => {
      const once = elapsedOnce();
      expect(once()).toBe(0);
    });
  });

  describe('elapsedInfinity', () => {
    test('returns a function', () => {
      const infinity = elapsedInfinity();
      expect(typeof infinity).toBe('function');
    });

    test('always returns Infinity', () => {
      const infinity = elapsedInfinity();
      expect(infinity()).toBe(Number.POSITIVE_INFINITY);
      expect(infinity()).toBe(Number.POSITIVE_INFINITY);
    });

    test('useful as initialiser', () => {
      // Common pattern: init with infinity, then replace with real timer
      let timer = elapsedInfinity();
      expect(timer()).toBe(Number.POSITIVE_INFINITY);
      
      // Later, when event happens
      timer = elapsedSince();
      vi.advanceTimersByTime(100);
      expect(timer()).toBe(100);
    });
  });

  describe('use cases', () => {
    test('measuring operation duration', () => {
      const start = elapsedSince();
      
      // Simulate some work
      vi.advanceTimersByTime(150);
      
      const duration = start();
      expect(duration).toBe(150);
    });

    test('measuring intervals between events', () => {
      const interval = elapsedInterval();
      interval(); // Initialize
      
      // Event 1
      vi.advanceTimersByTime(100);
      const timeSinceLast1 = interval();
      expect(timeSinceLast1).toBe(100);
      
      // Event 2
      vi.advanceTimersByTime(200);
      const timeSinceLast2 = interval();
      expect(timeSinceLast2).toBe(200);
    });

    test('capturing time at a specific moment', () => {
      const capture = elapsedOnce();
      
      vi.advanceTimersByTime(300);
      const captured = capture();
      
      vi.advanceTimersByTime(500);
      expect(capture()).toBe(captured); // Still the same
      expect(captured).toBe(300);
    });
  });
});