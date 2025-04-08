import { test, expect, assert } from 'vitest';
import * as R from '../src/index.js';
import { integerArrayTest, rangeIntegerTest, rangeTest } from '@ixfxfun/guards';

const repeat = <V>(count: number, fn: () => V): V[] => {
  let ret: any[] = [];
  while (count-- > 0) {
    ret.push(fn());
  }
  return ret;
}

test(`mersenne-twister-seed`, () => {
  let tests = 10_000;
  const mt1 = R.mersenneTwister(100);
  let r1: number[] = [];
  for (let i = 0; i < tests; i++) {
    r1.push(mt1.float());
  }

  const mt2 = R.mersenneTwister(100);
  let r2: number[] = [];
  for (let i = 0; i < tests; i++) {
    r2.push(mt2.float());
  }

  for (let i = 0; i < tests; i++) {
    expect(r1[ i ]).toBe(r2[ i ]);
  }
})

test(`mersenne-twister-integer`, () => {
  const mt = R.mersenneTwister();
  let tests = 10_000;
  for (let i = 0; i < tests; i++) {
    let v = mt.integer(10);
    expect(v < 10).toBe(true);

  }

  for (let i = 0; i < tests; i++) {
    let v = mt.integer(10, 5);
    expect(v >= 5).toBe(true);
    expect(v < 10).toBe(true);
  }

})
test(`integerUniqueGen`, async () => {
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
  expect(r1[ 0 ], r1[ 1 ]).toBeTruthy();

  const r2 = rangeIntegerTest(repeat(runs, () => R.integer(-5)), {
    minInclusive: -5,
    maxInclusive: 0
  });
  expect(r2[ 0 ], r2[ 1 ]).toBeTruthy();

  // Max-min
  expect(rangeIntegerTest(repeat(runs, () => R.integer({ max: 10, min: 5 })), {
    minInclusive: 5,
    maxExclusive: 10
  })[ 0 ]).toBeTruthy();

  expect(rangeIntegerTest(repeat(runs, () => R.integer({ max: -5, min: -10 })), {
    minInclusive: -10,
    maxExclusive: -5
  })[ 0 ]).toBeTruthy();

  expect(rangeIntegerTest(repeat(runs, () => R.integer({ max: 5, min: -5 })), {
    minInclusive: -5,
    maxExclusive: 5
  })[ 0 ]).toBeTruthy();

  // Dodgy input
  expect(() => R.integer({ max: 5, min: 10 })).toThrow();
  expect(() => R.integer(0)).toThrow();
  expect(() => R.integer(Number.NaN)).toThrow();
  // @ts-ignore
  expect(() => integer('hello')).toThrow();
});

test('float', async () => {
  const runs = 10 * 1000;

  expect(rangeTest(repeat(runs, () => R.float(10)), {
    minInclusive: 0,
    maxExclusive: 10
  })[ 0 ]).toBeTruthy();

  expect(rangeTest(repeat(runs, () => R.float(-10)), {
    minInclusive: -10,
    maxExclusive: 0
  })[ 0 ]).toBeTruthy();

  expect(rangeTest(repeat(runs, () => R.float({ min: -10, max: 10 })), {
    minInclusive: -10,
    maxExclusive: 10
  })[ 0 ]).toBeTruthy();
});

