/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unsafe-call */


import { test, expect, assert } from 'vitest';
import * as R from '../src/index.js';
import { rangeIntegerTest, rangeTest } from '@ixfx/guards';
import { boolean } from '../src/boolean.js';
import { frequencyByGroup } from '../src/util/frequency.js';

const repeat = <V>(count: number, fn: () => V): V[] => {
  const returnValue: V[] = [];
  while (count-- > 0) {
    returnValue.push(fn());
  }
  return returnValue;
}

const repeatGrouped = (count: number, fn: () => number, groupBy: (v: number) => string) => {
  const r1 = repeat(count, fn);
  const r1Grouped = frequencyByGroup(groupBy, r1);
  const entries = [ ...r1Grouped.entries() ].map(entry => [ entry[ 0 ], Math.floor(entry[ 1 ] / count * 100) ]);
  return entries.sort();
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

test(`chance`, () => {
  const iterations = 1000;
  // 50% chance
  const r1 = repeatGrouped(iterations, () => R.chance(0.5, 0, 1), v => v === 1 ? `1` : `0`).sort();
  expect(r1[ 0 ][ 1 ]).toBeGreaterThanOrEqual(47);
  expect(r1[ 1 ][ 1 ]).toBeGreaterThanOrEqual(46);
  expect(r1[ 0 ][ 1 ]).toBeLessThanOrEqual(52);
  expect(r1[ 1 ][ 1 ]).toBeLessThanOrEqual(52);

  // 0% chance
  const r2 = repeatGrouped(iterations, () => R.chance(0, 0, 1), v => v === 1 ? `1` : `0`);
  expect(r2).toEqual([ [ '0', 100 ] ]);

  // 100% chance
  const r3 = repeatGrouped(iterations, () => R.chance(1, 0, 1), v => v === 1 ? `1` : `0`);
  expect(r3).toEqual([ [ '1', 100 ] ]);

  // 25% chance
  const r4 = repeatGrouped(iterations, () => R.chance(0.25, 0, 1), v => v === 1 ? `1` : `0`).sort();
  expect(r4[ 0 ][ 1 ]).toBeGreaterThanOrEqual(72);
  expect(r4[ 1 ][ 1 ]).toBeGreaterThanOrEqual(21);
  expect(r4[ 0 ][ 1 ]).toBeLessThanOrEqual(77);
  expect(r4[ 1 ][ 1 ]).toBeLessThanOrEqual(26);

});

test(`bipolar`, () => {
  let count = 50;
  while (count > 50) {
    const v = R.bipolar();
    expect(v).toBeGreaterThanOrEqual(-1);
    expect(v).toBeLessThanOrEqual(1);
  }

  count = 50;
  while (count > 50) {
    const v = R.bipolar({ min: -10 });
    expect(v).toBeGreaterThanOrEqual(-10);
    expect(v).toBeLessThanOrEqual(1);
  }

  count = 50;
  while (count > 50) {
    const v = R.bipolar({ max: -10 });
    expect(v).toBeGreaterThanOrEqual(-1);
    expect(v).toBeLessThanOrEqual(10);
  }

  count = 50;
  while (count > 50) {
    const v = R.bipolar({ min: -10, max: 10 });
    expect(v).toBeGreaterThanOrEqual(-10);
    expect(v).toBeLessThanOrEqual(10);
  }

  count = 50;
  while (count > 50) {
    const v = R.bipolar({ source: () => 0.5 });
    expect(v).toBe(0);
  }
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

  expect(rangeTest(repeat(runs, () => R.float({ min: -10 })), {
    minInclusive: -10,
    maxExclusive: 1
  }).success).toBeTruthy();

  expect(rangeTest(repeat(runs, () => R.float({ min: -10, max: 10 })), {
    minInclusive: -10,
    maxExclusive: 10
  }).success).toBeTruthy();
});

test(`boolean`, () => {
  expect(typeof boolean()).toBe(`boolean`);

})
