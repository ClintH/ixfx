import { test, expect } from 'vitest';
import { rateMinimum } from '../src/rate-minimum.js';
import { sleep } from '@ixfx/core';

// In this case we don't expect fallback
// to be triggered because rm() is being invoked faster than rateMin's interval
test(`rateMinimum-0`, async () => {
  let fallbackCalled = 0;
  let wtcCalled = 0;
  const rm = rateMinimum({
    interval: 100,
    fallback() {
      fallbackCalled++;
      return Math.random();
    },
    whatToCall(args) {
      wtcCalled++;
      return Math.random();
    },
  });

  const t1 = setInterval(() => {
    rm(Math.random());
    if (wtcCalled >= 10) {
      expect(fallbackCalled).toBe(0);
      clearInterval(t1);
    }
  }, 50);
  await sleep(1000);
});

// In this case we expect fallback to be triggered half the times
test(`rateMinimum-1`, async () => {
  let fallbackCalled = 0;
  let wtcCalled = 0;
  const rm = rateMinimum({
    interval: 100,
    fallback() {
      fallbackCalled++;
      return Math.random();
    },
    whatToCall(args) {
      wtcCalled++;
    },
  });

  const t1 = setInterval(() => {
    rm(Math.random());
    if (wtcCalled >= 10) {
      expect(fallbackCalled).toBe(5);
      clearInterval(t1);
    }
  }, 150);
  await sleep(1000);

});