import { test, expect } from 'vitest';
import { filterIterable, rangeInclusive, thresholdAtLeast } from '../src/filter.js';

test(`filter-iterable`, () => {
  expect([ ...filterIterable([ 1, 2, `apples`, undefined, null, 3 ]) ]).toStrictEqual([ 1, 2, 3 ]);
});

test(`range`, () => {
  const c = rangeInclusive(50, 100);
  expect(c(0)).toBeFalsy();
  expect(c(50)).toBeTruthy();
  expect(c(100)).toBeTruthy();
  expect(c(101)).toBeFalsy();

})

test(`threshold`, () => {
  const c = thresholdAtLeast(50);
  expect(c(50)).toBeTruthy();
  expect(c(49)).toBeFalsy();

})