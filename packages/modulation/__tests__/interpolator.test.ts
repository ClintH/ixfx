import { test } from 'vitest';
import { interpolatorInterval } from '../src/interpolate.js';
import { delayLoop } from '@ixfxfun/flow';
import { round } from '@ixfxfun/numbers';

test(`interpolatorInterval`, async () => {
  const v = interpolatorInterval(100);
  let values: number[] = [];

  for await (const _ of delayLoop(9)) {
    const value = v();
    values.push(round(1, value));
    if (value >= 1) break;
  }
});