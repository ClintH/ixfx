/* eslint-disable unicorn/prevent-abbreviations */
import { test, expect } from 'vitest';
import * as Easings from '../src/easing/index.js';
import { repeatSync } from '@ixfx/flow';

test(`tick`, async () => {
  const e1 = Easings.tickEasing(`sineIn`, 10);
  expect(e1.isDone).toBeFalsy();

  const e1D = await Array.fromAsync(repeatSync(() => e1.compute(), { count: 11 }));
  expect(e1.isDone).toBeTruthy();
})