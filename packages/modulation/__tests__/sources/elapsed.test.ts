/* eslint-disable unicorn/prevent-abbreviations */
import { test, expect } from 'vitest';
import * as Modulation from '../../src/index.js';
import * as Flow from '@ixfx/flow';
import { round } from "@ixfx/numbers";
import * as Arrays from '@ixfx/arrays';

test(`one-shot`, async () => {
  // oneShot
  const s2 = Modulation.Sources.elapsed(500, { cycleLimit: 1 });
  const s2Results = await Array.fromAsync(Flow.repeatSync(async () => {
    await Flow.sleep(100);
    return round(1, s2())
  }, { count: 10 }));

  const s2Ra = Arrays.isEqual(s2Results, [ 0.2, 0.4, 0.6, 0.8, 1, 1, 1, 1, 1, 1 ]);
  const s2Rb = Arrays.isEqual(s2Results, [ 0.1, 0.4, 0.6, 0.8, 1, 1, 1, 1, 1, 1 ]);
  const s2Somethng = s2Ra || s2Rb;
  if (!s2Somethng) {
    console.log(`s2`, s2Results);
  }
  expect(s2Somethng).toBeTruthy();

});

test(`start-at`, async () => {
  // startAt
  const s3 = Modulation.Sources.elapsed(500, { startAt: performance.now() - 250 });
  const s3x = Flow.repeat(async () => {
    await Flow.sleep(100);
    return round(1, s3())
  }, { count: 10 });
  const s3Results = await Array.fromAsync(s3x);
  const s3a = Arrays.isEqual(s3Results, [ 0.7, 0.9, 0.1, 0.3, 0.5, 0.7, 0.9, 0.1, 0.3, 0.5 ]);
  const s3b = Arrays.isEqual(s3Results, [ 0.7, 0.9, 0.1, 0.2, 0.4, 0.6, 0.8, 0, 0.2, 0.4 ]);
  const s3Something = s3a || s3b;
  if (!s3Something) {
    console.log(`s3`, s3Results);
  }

  //console.log(s3Results);
  expect(s3Something).toBe(true);

});

test(`start-at-relative`, async () => {
  // startAtRelative
  const s4 = Modulation.Sources.elapsed(500, { startAtRelative: 0.5 });
  const s4x = Flow.repeat(async () => {
    await Flow.sleep(100);
    const value = round(1, s4());
    return value;
  }, { count: 10 });

  const s4Results = await Array.fromAsync(s4x);

  const s4a = Arrays.isEqual(s4Results, [ 0.7, 0.9, 0.1, 0.3, 0.5, 0.7, 0.9, 0.1, 0.3, 0.5 ]);
  const s4b = Arrays.isEqual(s4Results, [ 0.7, 0.9, 0.1, 0.2, 0.4, 0.6, 0.8, 0, 0.2, 0.4 ]);
  const s4c = Arrays.isEqual(s4Results, [
    0.6, 0.9, 0.1, 0.2,
    0.4, 0.6, 0.8, 0,
    0.2, 0.4
  ]);
  const s4d = Arrays.isEqual(s4Results, [
    0.7, 0.8, 0.1, 0.2,
    0.4, 0.6, 0.8, 0,
    0.2, 0.4
  ]);
  const s4e = Arrays.isEqual(s4Results, [
    0.7, 0.9, 0.1, 0.1,
    0.4, 0.6, 0.8, 0,
    0.2, 0.4
  ]);
  const s4f = Arrays.isEqual(s4Results, [
    0.7, 0.9, 0.1, 0.2,
    0.4, 0.6, 0.8, 0,
    0.1, 0.4
  ]);
  //console.log(s4Results);
  const s4Something = s4a || s4b || s4c || s4d || s4e || s4f;
  if (!s4Something) {
    console.log(s4Results);
  }
  expect(s4Something).toBe(true);
});

test(`basic`, async () => {
  const s1 = Modulation.Sources.elapsed(500);
  const s1Results = await Array.fromAsync(Flow.repeat(async () => {
    await Flow.sleep(100);
    return round(1, s1())
  }, { count: 10 }));
  const s1R1 = JSON.stringify(s1Results) === JSON.stringify([ 0.2, 0.4, 0.6, 0.8, 0, 0.2, 0.4, 0.6, 0.8, 0 ]);
  const s1R2 = JSON.stringify(s1Results) === JSON.stringify([ 0.1, 0.4, 0.6, 0.8, 0, 0.2, 0.4, 0.6, 0.8, 0 ]);
  expect(s1R1 || s1R2).toBeTruthy();
});