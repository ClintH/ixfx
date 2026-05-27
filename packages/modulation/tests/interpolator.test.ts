import { delayLoop } from '@ixfx/flow';
import { round } from '@ixfx/numbers';
import { describe, expect, it } from 'vitest';
import { interpolatorBoolean, interpolatorInterval } from '../src/interpolate.js';

// it(`interpolatorInterval`, async () => {
//   const v = interpolatorInterval(100);
//   const values: number[] = [];

//   for await (const _ of delayLoop(9)) {
//     const value = v();
//     values.push(round(1, value));
//     if (value >= 1)
//       break;
//   }
// });

describe(`interpolatorBoolean`, () => {
  it(`default`, () => {
    const i = interpolatorBoolean(false, true);
    expect(i(0)).toBe(false);
    expect(i(0.25)).toBe(false);
    expect(i(0.5)).toBe(true);
    expect(i(0.75)).toBe(true);
    expect(i(1)).toBe(true);
  });
  it(`threshold`, () => {
    const i = interpolatorBoolean(false, true, { threshold: 0.8 });
    expect(i(0)).toBe(false);
    expect(i(0.25)).toBe(false);
    expect(i(0.5)).toBe(false);
    expect(i(0.8)).toBe(true);
    expect(i(0.81)).toBe(true);
    expect(i(1)).toBe(true);
  });
});