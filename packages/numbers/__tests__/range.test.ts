/* eslint-disable @typescript-eslint/ban-ts-comment */

import { test, expect } from 'vitest';
import * as R from '../src/range.js';

test(`mergeValue`, () => {
  expect(R.rangeMergeValue(10, { min: 0, max: 10 })).toStrictEqual({ min: 0, max: 10 });
  expect(R.rangeMergeValue(-1, { min: 0, max: 10 })).toStrictEqual({ min: -1, max: 10 });
  expect(R.rangeMergeValue(11, { min: 0, max: 10 })).toStrictEqual({ min: 0, max: 11 });


  expect(() => R.rangeMergeValue(Number.NaN, { min: 0, max: 10 }, `error`)).toThrow();
  // @ts-expect-error
  expect(() => R.rangeMergeValue({}, { min: 0, max: 10 }, `error`)).toThrow();

  expect(R.rangeMergeValue(Number.NaN, { min: 0, max: 10 }, `skip`)).toStrictEqual({ min: 0, max: 10 });
  // @ts-expect-error
  expect(R.rangeMergeValue({}, { min: 0, max: 10 }, `skip`)).toStrictEqual({ min: 0, max: 10 });

});

test(`scaler`, () => {
  // Default to output range of 0..1
  const s1 = R.rangeScaler({ min: 0, max: 100 });
  expect(s1(0)).toBe(0);
  expect(s1(50)).toBe(0.5);
  expect(s1(100)).toBe(1);

  const s2 = R.rangeScaler({ min: 0, max: 100 }, 10, 0);
  expect(s2(0)).toBe(0);
  expect(s2(50)).toBe(5);
  expect(s2(100)).toBe(10);
});

test(`mergeRange`, () => {
  // No change
  expect(R.rangeMergeRange({ min: 50, max: 60 }, { min: 0, max: 100 })).toStrictEqual({ min: 0, max: 100 });

  expect(R.rangeMergeRange({ min: -10, max: 60 }, { min: 0, max: 100 })).toStrictEqual({ min: -10, max: 100 });

  expect(R.rangeMergeRange({ min: 50, max: 110 }, { min: 0, max: 100 })).toStrictEqual({ min: 0, max: 110 });
});

test(`init`, () => {
  expect(R.rangeInit()).toStrictEqual({ min: Number.MAX_SAFE_INTEGER, max: Number.MIN_SAFE_INTEGER });
});

test(`isEqual`, () => {
  expect(R.rangeIsEqual({ min: 0, max: 1 }, { min: 0, max: 1 })).toBeTruthy();
  expect(R.rangeIsEqual({ min: 0, max: 1 }, { min: 0, max: 10 })).toBeFalsy();
  expect(R.rangeIsEqual(undefined, { min: 0, max: 1 })).toBeFalsy();
  expect(R.rangeIsEqual({ min: 0, max: 1 }, undefined)).toBeFalsy();
});

test(`isWithin`, () => {
  expect(R.rangeIsWithin({ min: 50, max: 60 }, { min: 0, max: 100 })).toBeTruthy();
  expect(R.rangeIsWithin({ min: 50, max: 60 }, { min: 50, max: 60 })).toBeTruthy();

  expect(R.rangeIsWithin({ min: 40, max: 60 }, { min: 50, max: 60 })).toBeFalsy();
  expect(R.rangeIsWithin({ min: 50, max: 65 }, { min: 50, max: 60 })).toBeFalsy();


  expect(R.rangeIsWithin(undefined, { min: 50, max: 60 })).toBeFalsy();
  expect(R.rangeIsWithin({ min: 50, max: 60 }, undefined)).toBeFalsy();

});

test(`stream`, () => {
  const s = R.rangeStream();
  s.seen(10);
  expect(s.range).toStrictEqual({ min: 10, max: 10 });
  s.seen(20);
  expect(s.range).toStrictEqual({ min: 10, max: 20 });
  s.seen(5);
  expect(s.range).toStrictEqual({ min: 5, max: 20 });
  expect(s.max).toBe(20);
  expect(s.min).toBe(5);


  s.reset();
  expect(s.range).toStrictEqual({
    min: Number.MAX_SAFE_INTEGER,
    max: Number.MIN_SAFE_INTEGER
  });

  const s2 = R.rangeStream({ min: 5, max: 10 });
  expect(s2.range).toStrictEqual({ min: 5, max: 10 });
})

test(`compute`, () => {
  expect(R.rangeCompute([ 10, 0, 5, 90 ])).toStrictEqual({ min: 0, max: 90 });

  expect(() => R.rangeCompute([ 10, 0, 5, Number.NaN, 90 ], `error`)).toThrow();
  expect(() => R.rangeCompute([ 10, 0, 5, null, 90 ], `error`)).toThrow();

  expect(R.rangeCompute([ 10, 0, 5, Number.NaN, 90 ], `skip`)).toStrictEqual({ min: 0, max: 90 });
  expect(R.rangeCompute([ 10, 0, 5, {}, 90 ], `skip`)).toStrictEqual({ min: 0, max: 90 });


});