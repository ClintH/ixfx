import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  elapsedInfinity,
  elapsedInterval,
  elapsedOnce,
  elapsedSince,
} from '../src/elapsed.js';

describe(`core/elapsed`, () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe(`elapsedSince`, () => {
    it(`returns a function`, () => {
      const elapsed = elapsedSince();
      expect(typeof elapsed).toBe(`function`);
    });

    it(`returns 0 immediately`, () => {
      const elapsed = elapsedSince();
      expect(elapsed()).toBe(0);
    });

    it(`returns elapsed time`, () => {
      const elapsed = elapsedSince();
      vi.advanceTimersByTime(100);
      expect(elapsed()).toBe(100);
    });

    it(`continues tracking time`, () => {
      const elapsed = elapsedSince();
      vi.advanceTimersByTime(100);
      expect(elapsed()).toBe(100);

      vi.advanceTimersByTime(50);
      expect(elapsed()).toBe(150);
    });

    it(`multiple calls return increasing values`, () => {
      const elapsed = elapsedSince();
      vi.advanceTimersByTime(10);
      const first = elapsed();
      vi.advanceTimersByTime(10);
      const second = elapsed();

      expect(second).toBeGreaterThan(first);
    });

    it(`with skip:1, first call returns 0 (timer starts immediately)`, () => {
      const elapsed = elapsedSince({ skip: 1 });
      expect(elapsed()).toBe(0);
    });

    it(`with skip:1, second call returns interval from first call`, () => {
      const elapsed = elapsedSince({ skip: 1 });
      elapsed();
      vi.advanceTimersByTime(100);
      expect(elapsed()).toBe(100);
    });

    it(`with skip:1, subsequent calls return increasing total elapsed`, () => {
      const elapsed = elapsedSince({ skip: 1 });
      elapsed();
      vi.advanceTimersByTime(50);
      const first = elapsed();
      vi.advanceTimersByTime(50);
      const second = elapsed();
      expect(first).toBe(50);
      expect(second).toBe(100);
    });

    it(`with skip:2, first call returns NaN`, () => {
      const elapsed = elapsedSince({ skip: 2 });
      expect(elapsed()).toBeNaN();
    });

    it(`with skip:2, second call returns 0 (timer starts)`, () => {
      const elapsed = elapsedSince({ skip: 2 });
      elapsed();
      expect(elapsed()).toBe(0);
    });

    it(`with skip:2, third call returns 0 (timer starts)`, () => {
      const elapsed = elapsedSince({ skip: 2 });
      elapsed();
      elapsed();
      expect(elapsed()).toBe(0);
    });

    it(`with skip:2, subsequent calls return increasing total elapsed`, () => {
      const elapsed = elapsedSince({ skip: 2 });
      elapsed();
      elapsed();
      vi.advanceTimersByTime(50);
      const first = elapsed();
      vi.advanceTimersByTime(50);
      const second = elapsed();
      expect(first).toBe(50);
      expect(second).toBe(100);
    });
  });

  describe(`elapsedInterval`, () => {
    it(`returns a function`, () => {
      const interval = elapsedInterval();
      expect(typeof interval).toBe(`function`);
    });

    it(`returns 0 on first call`, () => {
      const interval = elapsedInterval();
      expect(interval()).toBe(0);
    });

    it(`returns time since last call`, () => {
      const interval = elapsedInterval();
      interval(); // First call initializes

      vi.advanceTimersByTime(100);
      expect(interval()).toBe(100);

      vi.advanceTimersByTime(50);
      expect(interval()).toBe(50);
    });

    it(`reset interval on each call`, () => {
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

  describe(`elapsedOnce`, () => {
    it(`returns a function`, () => {
      const once = elapsedOnce();
      expect(typeof once).toBe(`function`);
    });

    it(`returns elapsed time on first call`, () => {
      const once = elapsedOnce();
      vi.advanceTimersByTime(100);
      expect(once()).toBe(100);
    });

    it(`returns same value on subsequent calls`, () => {
      const once = elapsedOnce();
      vi.advanceTimersByTime(100);
      const first = once();

      vi.advanceTimersByTime(100);
      const second = once();

      expect(second).toBe(first);
      expect(second).toBe(100);
    });

    it(`returns 0 if called immediately`, () => {
      const once = elapsedOnce();
      expect(once()).toBe(0);
    });
  });

  describe(`elapsedInfinity`, () => {
    it(`returns a function`, () => {
      const infinity = elapsedInfinity();
      expect(typeof infinity).toBe(`function`);
    });

    it(`always returns Infinity`, () => {
      const infinity = elapsedInfinity();
      expect(infinity()).toBe(Number.POSITIVE_INFINITY);
      expect(infinity()).toBe(Number.POSITIVE_INFINITY);
    });

    it(`useful as initialiser`, () => {
      // Common pattern: init with infinity, then replace with real timer
      let timer = elapsedInfinity();
      expect(timer()).toBe(Number.POSITIVE_INFINITY);

      // Later, when event happens
      timer = elapsedSince();
      vi.advanceTimersByTime(100);
      expect(timer()).toBe(100);
    });
  });

  describe(`use cases`, () => {
    it(`measuring operation duration`, () => {
      const start = elapsedSince();

      // Simulate some work
      vi.advanceTimersByTime(150);

      const duration = start();
      expect(duration).toBe(150);
    });

    it(`measuring intervals between events`, () => {
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

    it(`capturing time at a specific moment`, () => {
      const capture = elapsedOnce();

      vi.advanceTimersByTime(300);
      const captured = capture();

      vi.advanceTimersByTime(500);
      expect(capture()).toBe(captured); // Still the same
      expect(captured).toBe(300);
    });
  });
});