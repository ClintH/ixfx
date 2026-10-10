import { isApprox } from "@ixfx/numbers";
import { expect, it } from 'vitest';
import { perMinute, perSecond } from '../src/source/per-second.js';

function arrayIsApprox(values: number[], baseValue: number, pc = 0.015) {
  for (const v of values) {
    expect(isApprox(pc, baseValue, v)).toBe(true);
  }
}

// Deterministic fake clock: no real sleeping, exact elapsed times
function clock() {
  let now = 0;
  return {
    now: () => now,
    advance: (ms: number) => {
      now += ms;
    },
  };
}

it(`per-second`, () => {
  const c1 = clock();
  const r1 = perSecond(1000, { timeSource: c1.now });
  const r1R: number[] = [];
  for (let i = 0; i < 4; i++) {
    c1.advance(100);
    r1R.push(r1());
  }
  arrayIsApprox(r1R, 100, 0.02);

  const c2 = clock();
  const r2 = perSecond(1000, { timeSource: c2.now });
  const r2R: number[] = [];
  for (let i = 0; i < 2; i++) {
    c2.advance(500);
    r2R.push(r2());
  }
  arrayIsApprox(r2R, 500);

  // Overflow
  const c3 = clock();
  const r3 = perSecond(1000, { timeSource: c3.now });
  const r4 = perSecond(1000, { clamp: true, timeSource: c3.now });

  c3.advance(2000);
  const r3R = r3();
  expect(r3R).toBeCloseTo(2000, 0);

  // Overflow clamped
  const r4R = r4();
  expect(r4R).toBe(1000);
});

it(`per-second options`, () => {
  expect(() => perSecond(1, { clamp: true, max: 10 })).toThrow(`Use either 'max' or 'clamp', not both.`);

  const c = clock();
  const r = perSecond(1000, { min: 5, timeSource: c.now });
  c.advance(1);
  expect(r()).toBe(5);
  c.advance(100);
  expect(r()).toBeCloseTo(100);
});

it(`per-minute`, () => {
  const c = clock();
  const pm = perMinute(600, { timeSource: c.now });
  c.advance(1000);
  expect(pm()).toBeCloseTo(10);
});
