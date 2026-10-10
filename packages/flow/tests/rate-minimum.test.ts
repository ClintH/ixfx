import { expect, it, vi } from 'vitest';
import { rateMinimum } from '../src/rate-minimum.js';

// Calls faster than 'interval': fallback never triggers
it(`rateMinimum-0`, () => {
  vi.useFakeTimers();
  let fallbackCalled = 0;
  let wtcCalled = 0;
  const rm = rateMinimum<number>({
    interval: 100,
    fallback: () => {
      fallbackCalled++;
      return -1;
    },
    whatToCall: () => {
      wtcCalled++;
    },
  });

  for (let i = 0; i < 10; i++) {
    vi.advanceTimersByTime(50);
    rm(i);
  }
  expect(wtcCalled).toBe(10);
  expect(fallbackCalled).toBe(0);

  // Stop calling: after 'interval' elapses, fallback kicks in
  vi.advanceTimersByTime(100);
  expect(fallbackCalled).toBe(1);
  expect(wtcCalled).toBe(11);
  vi.useRealTimers();
});

// Calls slower than 'interval': fallback fires once per gap
it(`rateMinimum-1`, () => {
  vi.useFakeTimers();
  let fallbackCalled = 0;
  let wtcCalled = 0;
  const rm = rateMinimum<number>({
    interval: 100,
    fallback: () => {
      fallbackCalled++;
      return -1;
    },
    whatToCall: () => {
      wtcCalled++;
    },
  });

  for (let i = 0; i < 5; i++) {
    vi.advanceTimersByTime(150);
    rm(i);
  }
  // 5 calls plus one fallback per 150ms gap
  expect(fallbackCalled).toBe(5);
  expect(wtcCalled).toBe(10);
  vi.useRealTimers();
});
