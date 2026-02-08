import { test, expect, describe } from 'vitest';
import { number, NumberTracker } from '../src/number-tracker.js';

describe('NumberTracker', () => {
  describe('basic tracking', () => {
    test('tracks single value', () => {
      const tracker = number();
      tracker.seen(42);
      
      expect(tracker.min).toBe(42);
      expect(tracker.max).toBe(42);
      expect(tracker.avg).toBe(42);
      expect(tracker.total).toBe(42);
    });

    test('tracks multiple values', () => {
      const tracker = number();
      tracker.seen(10);
      tracker.seen(20);
      tracker.seen(30);
      
      expect(tracker.min).toBe(10);
      expect(tracker.max).toBe(30);
      expect(tracker.avg).toBe(20);
      expect(tracker.total).toBe(60);
    });

    test('tracks negative values', () => {
      const tracker = number();
      tracker.seen(-10);
      tracker.seen(0);
      tracker.seen(10);
      
      expect(tracker.min).toBe(-10);
      expect(tracker.max).toBe(10);
      expect(tracker.avg).toBe(0);
    });

    test('tracks decimal values', () => {
      const tracker = number();
      tracker.seen(1.5);
      tracker.seen(2.5);
      
      expect(tracker.min).toBe(1.5);
      expect(tracker.max).toBe(2.5);
      expect(tracker.avg).toBe(2);
      expect(tracker.total).toBe(4);
    });
  });

  describe('NaN handling', () => {
    test('throws on NaN by default', () => {
      const tracker = number();
      tracker.seen(10);
      expect(() => tracker.seen(Number.NaN)).toThrow('Cannot add NaN');
    });

    test('does not update stats after NaN is rejected', () => {
      const tracker = number();
      tracker.seen(10);
      try {
        tracker.seen(Number.NaN);
      } catch { /* ignore */ }
      
      expect(tracker.min).toBe(10);
      expect(tracker.max).toBe(10);
      expect(tracker.total).toBe(10);
    });
  });

  describe('difference calculations', () => {
    test('calculates difference between last and initial', () => {
      const tracker = number();
      tracker.seen(10);
      tracker.seen(30);
      
      expect(tracker.difference()).toBe(20);
    });

    test('calculates relative difference', () => {
      const tracker = number();
      tracker.seen(10);
      tracker.seen(30);
      
      expect(tracker.relativeDifference()).toBe(3);
    });

    test('returns correct values with only one value', () => {
      const tracker = number();
      tracker.seen(10);

      expect(tracker.difference()).toBe(0); // last - initial = 10 - 10 = 0
      expect(tracker.relativeDifference()).toBe(1); // last/initial = 10/10 = 1
    });

    test('returns undefined for difference with no values', () => {
      const tracker = number();
      
      expect(tracker.difference()).toBeUndefined();
      expect(tracker.relativeDifference()).toBeUndefined();
    });
  });

  describe('reset functionality', () => {
    test('reset clears all values', () => {
      const tracker = number();
      tracker.seen(10);
      tracker.seen(20);
      tracker.reset();
      
      expect(tracker.min).toBe(Number.MAX_SAFE_INTEGER);
      expect(tracker.max).toBe(Number.MIN_SAFE_INTEGER);
      expect(tracker.total).toBe(0);
      expect(tracker.values.length).toBe(0);
    });

    test('works after reset', () => {
      const tracker = number();
      tracker.seen(10);
      tracker.reset();
      tracker.seen(5);
      
      expect(tracker.min).toBe(5);
      expect(tracker.max).toBe(5);
      expect(tracker.avg).toBe(5);
    });
  });

  describe('last and initial values', () => {
    test('tracks last value', () => {
      const tracker = number();
      tracker.seen(10);
      tracker.seen(20);
      tracker.seen(30);
      
      expect(tracker.last).toBe(30);
    });

    test('tracks initial value', () => {
      const tracker = number();
      tracker.seen(10);
      tracker.seen(20);
      
      expect(tracker.initial).toBe(10);
    });

    test('returns undefined when no values', () => {
      const tracker = number();
      
      expect(tracker.last).toBeUndefined();
      expect(tracker.initial).toBeUndefined();
    });
  });

  describe('elapsed time', () => {
    test('throws when no values seen', () => {
      const tracker = number();
      expect(() => tracker.elapsed).toThrow('No values seen yet');
    });

    test('returns elapsed time after values', () => {
      const tracker = number();
      tracker.seen(10);
      
      const elapsed = tracker.elapsed;
      expect(typeof elapsed).toBe('number');
      expect(elapsed).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getMinMaxAvg', () => {
    test('returns min, max, and avg', () => {
      const tracker = number();
      tracker.seen(10);
      tracker.seen(20);
      tracker.seen(30);
      
      const result = tracker.getMinMaxAvg();
      expect(result).toEqual({ min: 10, max: 30, avg: 20 });
    });
  });

  describe('sample limiting', () => {
    test('respects sampleLimit', () => {
      const tracker = number({ sampleLimit: 3, storeIntermediate: true });
      
      // Add many values
      for (let i = 1; i <= 20; i++) {
        tracker.seen(i);
      }

      // After many values, should have been trimmed
      expect(tracker.values.length).toBeLessThanOrEqual(6); // sampleLimit * 2 or less
    });
  });

  describe('storeIntermediate option', () => {
    test('stores all values when storeIntermediate is true', () => {
      const tracker = number({ storeIntermediate: true });
      tracker.seen(1);
      tracker.seen(2);
      tracker.seen(3);
      
      expect(tracker.values).toEqual([1, 2, 3]);
    });

    test('does not store intermediate values by default', () => {
      const tracker = number();
      tracker.seen(1);
      tracker.seen(2);
      tracker.seen(3);
      
      // Without storeIntermediate, only stores initial and last
      expect(tracker.values.length).toBeLessThanOrEqual(2);
    });
  });

  describe('size tracking', () => {
    test('tracks number of values', () => {
      const tracker = number();
      expect(tracker.size).toBe(0);
      
      tracker.seen(10);
      expect(tracker.size).toBe(1);
      
      tracker.seen(20);
      expect(tracker.size).toBe(2);
    });
  });
});
