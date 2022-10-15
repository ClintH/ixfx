import { expect, test } from '@jest/globals';
import { everyNth } from '../../flow/index.js';

function countMatches<V>(data:readonly V[], nth:number) {
  //eslint-disable-next-line functional/no-let
  let count = 0;
  const f = everyNth(nth);
  data.forEach(d => {
    if (f(d)) count++;
  });
  return count;
}

test(`everyNth`, () => {
  const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
 
  expect(countMatches(data, 0)).toEqual(0);
  expect(countMatches(data, 1)).toEqual(10);
  expect(countMatches(data, 2)).toEqual(5);
  expect(countMatches(data, 10)).toEqual(1);

  // Error: not a number
  // @ts-ignore
  expect(() => everyNth(undefined)).toThrow();

  // Error: not an integer
  // @ts-ignore
  expect(() => everyNth(1.5)).toThrow();

});