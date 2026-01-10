import { expect, test } from "vitest";
import * as R from '../src/index.js';

function minMax(data: number[]) {
  let min = Number.MAX_VALUE;
  let max = Number.MIN_VALUE;
  for (const d of data) {
    if (d < min) min = d;
    if (d > max) max = d;
  }
  return { min, max }
}

test(`seeds-different`, () => {
  const test = (seed: number, samples: number) => {
    const x = R.mulberrySource(seed);
    const results: number[] = [];
    for (let index = 0; index < samples; index++) {
      results.push(x());
    }
    return results;
  }
  const samples = 1000;
  const t1 = test(123, samples);
  const t2 = test(456, samples);
  const t3 = test(123, samples);

  expect(t1).not.toEqual(t2);
  expect(t1).toStrictEqual(t3);
});

test(`repeatable`, () => {
  const test = (samples: number) => {
    const x = R.mulberrySource();
    const results: number[] = [];
    for (let index = 0; index < samples; index++) {
      results.push(x());
    }
    return results;
  }
  const samples = 10_000;
  const r1 = test(samples);
  const r2 = test(samples);

  const range = minMax(r1);
  expect(r1).toStrictEqual(r2);
  expect(range.min).toBeLessThan(0.001);
  expect(range.max).toBeGreaterThan(0.999);

});
