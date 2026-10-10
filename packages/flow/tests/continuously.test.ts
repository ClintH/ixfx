import { continuously } from '@ixfx/core';

import { expect, it, vi } from 'vitest';

it(`continuously`, async () => {
  vi.useFakeTimers();
  const loopCount = 5;
  const calls: number[] = [];
  let loops = loopCount;
  const fn = () => {
    calls.push(Date.now());
    loops--;
    return loops > 0;
  };

  const c = continuously(fn, 50);
  expect(c.startCount).toBe(0);
  expect(c.runState).toBe(`idle`);
  c.start();
  expect(c.runState).toBe(`scheduled`);

  await vi.advanceTimersByTimeAsync(1000);

  // Loop ran the requested number of times at the requested interval
  // (Date.now is faked, so call timestamps are deterministic)
  expect(calls.length).toBe(loopCount);
  expect(calls[1] - calls[0]).toBe(50);
  expect(calls[4] - calls[3]).toBe(50);
  expect(c.startCountTotal > 0).toBe(true);
  vi.useRealTimers();
});
