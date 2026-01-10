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

test(`width-int`, () => {
  const test = (width: number, samples: number) => {
    const x = R.lfsrSource({ width, output: `integer` });
    const results: number[] = [];
    for (let index = 0; index < samples; index++) {
      results.push(x());
    }
    return results;
  }
  // const mm1 = minMax(test(8, 1000));
  // console.log(mm1)
  const samples = 10_000;
  expect(minMax(test(8, samples))).toStrictEqual({ min: 1, max: 255 });
  expect(minMax(test(16, samples))).toStrictEqual({ min: 1, max: 65535 });
});

test(`width-float`, () => {
  const test = (width: number, samples: number) => {
    const x = R.lfsrSource({ width, output: `float` });
    const results: number[] = [];
    for (let index = 0; index < samples; index++) {
      results.push(x());
    }
    return results;
  }
  // const mm1 = minMax(test(8, 1000));
  // console.log(mm1)
  const samples = 10_000;
  expect(minMax(test(8, samples))).toStrictEqual({ min: 0, max: 0.9921875 });
  expect(minMax(test(16, samples))).toStrictEqual({ min: 0, max: 0.999969482421875 });
});

test(`repeatable-float`, () => {
  const test = (samples: number) => {
    const x = R.lfsrSource();
    const results: number[] = [];
    for (let index = 0; index < samples; index++) {
      results.push(x());
    }
    return results;
  }
  const samples = 1000
  const r1 = test(samples);
  const r2 = test(samples);
  expect(r1).toStrictEqual(r2);
});

test(`repeatable-integer`, () => {
  const test = (samples: number) => {
    const x = R.lfsrSource({ output: `integer` });
    const results: number[] = [];
    for (let index = 0; index < samples; index++) {
      results.push(x());
    }
    return results;
  }
  const samples = 1000
  const r1 = test(samples);
  const r2 = test(samples);
  expect(r1).toStrictEqual(r2);
});