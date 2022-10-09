/* eslint-disable */
import { expect, test } from '@jest/globals';
import {weightedInteger, integer} from '../Random.js';

const inBounds = (ar:number[], minInclusive:number, maxExclusive:number):boolean => {
  for (let i=0;i<ar.length;i++) {
    if(ar[i] < minInclusive) return false;
    if (ar[i] >= maxExclusive) return false;
  }
  return true;
}

const repeat = <V>(count:number, fn:()=>V):V[] => {
  let ret = [];
  while (count-- > 0) {
    ret.push(fn());
  }
  return ret;
}

const testRange = (runs:number, upper:number, lower:number, test:()=>number) => {
  let lowerBounds = Number.MAX_SAFE_INTEGER;
  let upperBounds = Number.MIN_SAFE_INTEGER;

  for (let i=0;i<runs;i++) {
    const r = test();
    lowerBounds = Math.min(lowerBounds, r);
    upperBounds = Math.max(upperBounds, r);
    expect(Math.abs(r) % 1).toEqual(0); // Check for whole number
    expect(r).toBeGreaterThanOrEqual(lower);
    expect(r).toBeLessThanOrEqual(upper);

  }
  expect(upperBounds).toEqual(upper);
  expect(lowerBounds).toEqual(lower);
 
}

test(`integer`, () => {
  testRange(10*1000, 4, 0, () => integer(5));

  testRange(10*1000, 9, 5,() => integer(5, 10));

  testRange(10*1000, -0, -4,() => integer(-5));
  
  testRange(10*1000, -6, -10,() => integer(-5, -10));

});

test(`weightedInteger`, () => {
  const test1 = repeat(1000, () => weightedInteger(10));
  expect(inBounds(test1, 0, 10)).toBeTruthy();

  const test2 = repeat(1000, () => weightedInteger(10, 20));
  expect(inBounds(test2, 0, 20)).toBeTruthy();

  const test3 = repeat(1000, () => weightedInteger(20, `backIn`));
  expect(inBounds(test3, 0, 20)).toBeTruthy();

  // Error: max is greater than min
  expect(()=>weightedInteger(10,5)).toThrow();

  // Error: easing not found
  // @ts-ignore
  expect(()=>weightedInteger(10, `madeUpEasing`)).toThrow();

  // Error: wrong param for second types
  // @ts-ignore
  expect(()=>weightedInteger(0,false)).toThrow();

  // Error: no params
  // @ts-ignore
  expect(()=>weightedInteger()).toThrow();

  // Error: string param
  // @ts-ignore
  expect(()=>weightedInteger(`blah`)).toThrow();

  // Error: NaN
  expect(()=>weightedInteger(Number.NaN)).toThrow();

});