import { expect, test } from "vitest";
import * as R from '../src/index.js';

test(`mersenne-twister-seed`, () => {
  const tests = 10_000;
  const mt1 = R.mersenneTwister(100);
  const r1: number[] = [];
  for (let index = 0; index < tests; index++) {
    r1.push(mt1.float());
  }

  const mt2 = R.mersenneTwister(100);
  const r2: number[] = [];
  for (let index = 0; index < tests; index++) {
    r2.push(mt2.float());
  }

  for (let index = 0; index < tests; index++) {
    expect(r1[ index ]).toBe(r2[ index ]);
  }
})

test(`mersenne-twister-integer`, () => {
  const mt = R.mersenneTwister();
  const tests = 10_000;
  for (let index = 0; index < tests; index++) {
    const v = mt.integer(10);
    expect(v < 10).toBe(true);

  }

  for (let index = 0; index < tests; index++) {
    const v = mt.integer(10, 5);
    expect(v >= 5).toBe(true);
    expect(v < 10).toBe(true);
  }
});