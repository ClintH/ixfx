/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unsafe-call */


import { test, expect, assert } from 'vitest';
import * as R from '../src/index.js';
import { rangeIntegerTest, rangeTest } from '@ixfx/guards';
import { boolean } from '../src/boolean.js';
const repeat = <V>(count: number, fn: () => V): V[] => {
  const returnValue: V[] = [];
  while (count-- > 0) {
    returnValue.push(fn());
  }
  return returnValue;
}

test(`integerUniqueGen`, () => {
  const d = [ ...R.integerUniqueGen(10) ];
  assert.sameMembers(d, [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 ]);
});

test(`integer`, () => {
  const runs = 10 * 1000;
  // Max-0 range
  const r1 = rangeIntegerTest(repeat(runs, () => R.integer(5)), {
    minInclusive: 0,
    maxExclusive: 5
  });
  expect(r1.success).toBeTruthy();

  const r2 = rangeIntegerTest(repeat(runs, () => R.integer(-5)), {
    minInclusive: -5,
    maxInclusive: 0
  });
  expect(r2.success).toBeTruthy();

  // Max-min
  expect(rangeIntegerTest(repeat(runs, () => R.integer({ max: 10, min: 5 })), {
    minInclusive: 5,
    maxExclusive: 10
  }).success).toBeTruthy();

  expect(rangeIntegerTest(repeat(runs, () => R.integer({ max: -5, min: -10 })), {
    minInclusive: -10,
    maxExclusive: -5
  }).success).toBeTruthy();

  expect(rangeIntegerTest(repeat(runs, () => R.integer({ max: 5, min: -5 })), {
    minInclusive: -5,
    maxExclusive: 5
  }).success).toBeTruthy();

  // Dodgy input
  expect(() => R.integer({ max: 5, min: 10 })).toThrow();
  expect(() => R.integer(0)).toThrow();
  expect(() => R.integer(Number.NaN)).toThrow();
  // @ts-expect-error
  expect(() => integer('hello')).toThrow();
});

test('float', () => {
  const runs = 10 * 1000;
  expect(rangeTest(repeat(runs, () => R.float(10)), {
    minInclusive: 0,
    maxExclusive: 10
  }).success).toBeTruthy();

  expect(rangeTest(repeat(runs, () => R.float(-10)), {
    minInclusive: -10,
    maxExclusive: 0
  }).success).toBeTruthy();

  expect(rangeTest(repeat(runs, () => R.float({ min: -10, max: 10 })), {
    minInclusive: -10,
    maxExclusive: 10
  }).success).toBeTruthy();
});

test(`boolean`, () => {
  expect(typeof boolean()).toBe(`boolean`);

})
