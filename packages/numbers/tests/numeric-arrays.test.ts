/* eslint-disable @typescript-eslint/ban-ts-comment */
import { expect, describe, test } from 'vitest';
import * as N from '../src/index.js';


test(`numberArrayCompute`, () => {
  const r1 = N.numberArrayCompute([ 1, 2, 3, 4, 5 ]);
  expect(r1.min).eq(1);
  expect(r1.max).eq(5);
  expect(r1.total).eq(15);
  expect(r1.avg).eq(3);

  const r3 = N.numberArrayCompute([ 5, 6, 7 ]);
  expect(r3.avg).eq(6);
  expect(r3.total).eq(18);
  expect(r3.min).eq(5);
  expect(r3.max).eq(7);
});

test(`weight`, t => {
  // @ts-expect-error  
  expect(() => N.weight(null)).toThrow();

  // @ts-expect-error  
  expect(() => N.weight([ 1, 2, null ])).toThrow();

  // @ts-expect-error  
  expect(() => N.weight([ 1, 2, 3 ], v => null)).toThrow();
})

test(`dotProduct`, () => {
  expect(N.dotProduct([ [ 1, 2, 3 ], [ 2, 4, 6 ] ])).toEqual(28);
  // @ts-expect-error
  expect(() => N.dotProduct([ [ 1, 2, null ], [ 2, 4, 6 ] ], `error`)).toThrow();

})

test(`min`, () => {
  expect(N.min([ 10, 20, 0 ])).toBe(0);
});
test(`minFast`, () => {
  expect(N.minFast([ 10, 20, 0 ])).toBe(0);
});
test(`max`, () => {
  expect(N.max([ 10, 20, 0 ])).toBe(20);
});
test(`maxFast`, () => {
  expect(N.maxFast([ 10, 20, 0 ])).toBe(20);
});
test(`totalFast`, () => {
  expect(N.totalFast([ 10, 20, 0 ])).toBe(30);
});
test(`total`, () => {
  expect(N.total([ 10, 20, 0 ])).toBe(30);
});
test(`minIndex`, () => {
  expect(N.minIndex([ 10, 20, 0 ])).toBe(2);
});
test(`maxIndex`, () => {
  expect(N.maxIndex([ 10, 20, 0 ])).toBe(1);
});