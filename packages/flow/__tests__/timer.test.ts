import { test, expect } from 'vitest';
import * as Timer from '../src/timer.js';
import * as Elapsed from '@ixfxfun/core/elapsed';
import { sleep } from '@ixfxfun/core';
import { isApprox, round } from '@ixfxfun/numbers';

test(`of-total`, async () => {
  const r1 = Timer.ofTotal(500, { clampValue: false });
  let since = Elapsed.elapsedSince();
  for (let index = 0; index < 10; index++) {
    const v = r1();
    if (since() >= 500) {
      // if total time has elapsed, expect r1() to be above 1
      expect(v > 1).toBe(true);
    } else {
      // if total time hasn't elapsed, expect it to be below
      expect(v < 1).toBe(true);
    }
    await sleep(100);
  }

  const r2 = Timer.ofTotal(500, { clampValue: true });
  since = Elapsed.elapsedSince();
  for (let index = 0; index < 10; index++) {
    const v = r2();
    if (since() >= 500) {
      // if total time has elapsed, expect r2() to be above 1
      expect(v).toBe(1);
    } else {
      // if total time hasn't elapsed, expect it to be below
      expect(v < 1).toBe(true);
    }
    await sleep(100);
  }

  const r3 = Timer.ofTotal(500, { wrapValue: true });
  since = Elapsed.elapsedSince();
  let v2 = 0;
  for (let index = 1; index < 7; index++) {
    const v1 = round(4, r3());
    expect(isApprox(0.15, v2, v1)).toBe(true);
    await sleep(100);
    v2 += 0.2;
    // Wrapping point
    if (index === 5) v2 = 0;
  }

  const r4 = Timer.ofTotal(500, { wrapValue: false, clampValue: true });
  since = Elapsed.elapsedSince();
  let v3 = 0;
  for (let index = 1; index < 15; index++) {
    const v1 = round(2, r4());
    if (since() >= 500) {
      expect(v1).toBe(1);
    } else {
      expect(isApprox(0.01, v3, v1)).toBe(true);
    }
    await sleep(100);
    v3 += 0.2;
  }
});

test('of-total-ticks', async () => {
  let totalTicks = 100;
  const r1 = Timer.ofTotalTicks(totalTicks, { clampValue: false, wrapValue: false });
  for (let index = 1; index < 100; index++) {
    const v1 = r1();
    const v2 = index / 100;
    expect(v1).toBe(v2);
  }

  // clamp:false
  for (let index = 0; index < 30; index++) {
    const v1 = round(3, r1());
    const v2 = round(3, 1 + (index / totalTicks));
    expect(v1).toBe(v2);
  }

  totalTicks = 10;
  const r2 = Timer.ofTotalTicks(totalTicks, { clampValue: true });
  // Burn through total
  for (let index = 0; index < totalTicks; index++) r2();
  for (let index = 1; index < (totalTicks * 2); index++) {
    // Expect to return 1 since clampValue:true
    expect(r2()).toBe(1);
  }

  totalTicks = 10;
  const r3 = Timer.ofTotalTicks(totalTicks, { wrapValue: true });
  // Burn through total
  for (let index = 0; index < totalTicks; index++) r3();
  // Next call should wrap
  for (let index = 1; index < totalTicks; index++) {
    const v1 = round(5, r3());
    const v2 = index / 10;

    // Let value be a bit off due to rounding
    expect(isApprox(0.001, v2, v1)).toBe(true);
  }

});