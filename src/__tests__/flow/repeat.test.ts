import { expect, test } from '@jest/globals';
import { repeat } from '../../flow/index.js';

test(`repeat`, () => {
  const test1 = repeat(5, () => 1);
  expect(test1.length).toEqual(5);

  const test2 = repeat(0, () => 1);
  expect(test2.length).toEqual(0);

  // Error: not a number
  // @ts-ignore
  expect(() => repeat(undefined, () => 10)).toThrow();

  // Test using predicate
  const test3 = repeat((repeats):boolean => {
    if (repeats >= 5) return false;
    return true;
  }, () => 1);
  expect(test3.length).toEqual(5);

  const test4 = repeat((repeats, valuesProduced):boolean => {
    if (valuesProduced >= 20) return false;
    return true;
  }, () => 1);
  expect(test4.length).toEqual(20);
});