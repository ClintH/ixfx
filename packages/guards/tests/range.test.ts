/* eslint-disable @typescript-eslint/no-floating-promises */
import { test, expect } from 'vitest';
import { rangeTest, rangeIntegerTest } from '../src/range.js';
import { describe } from 'node:test';

describe(`rangeTest`, () => {
  test('exclusive', () => {
    // Within range
    // Exclusive range 4-6 = 5
    expect(rangeTest([ 5 ], { minExclusive: 4, maxExclusive: 6 }).success).toBeTruthy();
    expect(rangeTest([ 4, 5 ], { minExclusive: 4, maxExclusive: 6 }).success).toBeFalsy();
    expect(rangeTest([ 5, 6 ], { minExclusive: 4, maxExclusive: 6 }).success).toBeFalsy();
    expect(rangeTest([ 4, 5, 6 ], { minExclusive: 4, maxExclusive: 6 }).success).toBeFalsy();
  });

  test(`inclusive`, () => {
    // Inclusive range 4-6 = 4, 5, 6
    const b1 = rangeTest([ 4, 5, 6 ], { minInclusive: 4, maxInclusive: 6 });
    expect(b1.success).toBeTruthy();

    const b2 = rangeTest([ 3, 4, 5, 6 ], { minInclusive: 4, maxInclusive: 6 })
    expect(b2.success).toBeFalsy();

    const b3 = rangeTest([ 4, 5, 6, 7 ], { minInclusive: 4, maxInclusive: 6 });
    expect(b3.success).toBeFalsy();

    const b4 = rangeTest([ 3, 4, 5, 6, 7 ], { minInclusive: 4, maxInclusive: 6 });
    expect(b4.success).toBeFalsy();
  });

  test(`integer`, () => {
    const b1 = rangeIntegerTest([ 4, 5, 6 ], { minInclusive: 4, maxInclusive: 6 });
    expect(b1.success).toBeTruthy();

    const b2 = rangeIntegerTest([ 4, 5.5, 6 ], { minInclusive: 4, maxInclusive: 6 });
    expect(b2.success).toBeFalsy();

  })
});