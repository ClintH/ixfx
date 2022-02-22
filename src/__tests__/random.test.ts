/* eslint-disable */
import {weightedInteger} from '../Random.js';

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

test(`weightedInteger`, () => {
  const test1 = repeat(1000, () => weightedInteger(10));
  expect(inBounds(test1, 0, 10)).toBeTruthy();

  const test2 = repeat(1000, () => weightedInteger(10, 20));
  expect(inBounds(test2, 0, 20)).toBeTruthy();

  const test3 = repeat(1000, () => weightedInteger(20, `easeInBack`));
  expect(inBounds(test3, 0, 20)).toBeTruthy();

  // Error: max is greater than min
  expect(()=>weightedInteger(10,5)).toThrow();

  // Error: easing not found
  // @ts-ignore
  expect(()=>weightedInteger(10, `madeUpEasing`)).toThrow();

  // Error: wrong param for second type
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