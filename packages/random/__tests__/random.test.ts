/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unsafe-call */

/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { test, expect, assert } from 'vitest';
import * as R from '../src/index.js';
import { rangeIntegerTest, rangeTest } from '@ixfx/guards';
import { frequencyByGroup } from '../src/util/frequency.js';

const groupByTens = (v: number) => Math.floor(v * 10);
const repeat = <V>(count: number, fn: () => V): V[] => {
  const returnValue: V[] = [];
  while (count-- > 0) {
    returnValue.push(fn());
  }
  return returnValue;
}

test(`gaussian`, () => {
  const tests = 10_000;
  const r1: number[] = [];
  const g = R.gaussianSource();
  while (r1.length < tests) {
    r1.push(g());
  };

  const frequency = [ ...frequencyByGroup(groupByTens, r1).entries() ];
  //console.log(frequency);

  for (const entry of frequency) {
    entry[ 1 ] = Math.floor((entry[ 1 ] / tests) * 100);
  }
  frequency.sort((a, b) => a[ 0 ] > b[ 0 ] ? 1 : a[ 0 ] === b[ 0 ] ? 0 : -1);

  expect(frequency.at(0)![ 1 ]).toBe(0);
  expect(frequency.at(-1)![ 1 ]).toBe(0);

  expect(frequency.at(1)![ 1 ]).toBeOneOf([ 2, 1, 0 ]);
  expect(frequency.at(-2)![ 1 ]).toBeOneOf([ 2, 1, 0 ]);

  expect(frequency.at(2)![ 1 ]).toBeOneOf([ 14, 13, 12 ]);
  expect(frequency.at(-3)![ 1 ]).toBeOneOf([ 14, 13, 12 ]);

  expect(frequency.at(3)![ 1 ]).toBeOneOf([ 35, 34, 33 ]);
  expect(frequency.at(-4)![ 1 ]).toBeOneOf([ 35, 34, 33 ]);

});

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

})
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

