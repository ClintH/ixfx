import { test } from 'vitest';
import { interpolatorInterval } from '../src/interpolate.js';
import { delayLoop } from '@ixfx/flow';
import { round } from '@ixfx/numbers';

test(`interpolatorInterval`, async () => {
  const v = interpolatorInterval(100);
  const values: number[] = [];

  for await (const _ of delayLoop(9)) {
    const value = v();
    values.push(round(1, value));
    if (value >= 1) break;
  }
});