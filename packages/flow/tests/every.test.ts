import { test, expect } from 'vitest';
import { everyNth } from '../src/every.js';

function countMatches<V>(data: readonly V[], nth: number) {
  //eslint-disable-next-line functional/no-let
  let count = 0;
  const f = everyNth(nth);
  data.forEach((d) => {
    if (f(d)) count++;
  });
  return count;
}

test(`everyNth`, () => {
  const data = [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ];

  expect(countMatches(data, 0)).toBe(0);
  expect(countMatches(data, 1)).toBe(10);
  expect(countMatches(data, 2)).toBe(5);
  expect(countMatches(data, 10)).toBe(1);

  // Error: not a number
  // @ts-ignore
  expect(() => everyNth(undefined)).toThrow();

  // Error: not an integer
  // @ts-ignore
  expect(() => everyNth(1.5)).toThrow();
});
