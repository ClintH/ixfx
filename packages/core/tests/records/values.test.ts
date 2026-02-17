import { test, expect, describe } from 'vitest';
import { enumerateNumericalValues } from '../../src/records/values.js';

describe(`records/values`, () => {
  describe(`enumerateNumericalValues`, () => {
    test(`extracts numerical values from array of objects`, () => {
      const data = [{ size: 10 }, { size: 20 }, { size: 0 }];
      const result = [...enumerateNumericalValues(data, `size`)];
      expect(result).toEqual([10, 20, 0]);
    });

    test(`throws for non-numerical property value`, () => {
      const data = [{ size: 10 }, { size: `not-a-number` }];
      expect(() => [...enumerateNumericalValues(data, `size`)]).toThrow(/Property value was not a number/);
    });

    test(`throws for undefined property value`, () => {
      const data = [{ size: 10 }, { other: 20 }];
      expect(() => [...enumerateNumericalValues(data, `size`)]).toThrow(/Property value was not a number/);
    });

    test(`handles negative numbers`, () => {
      const data = [{ value: -5 }, { value: 0 }, { value: 10 }];
      const result = [...enumerateNumericalValues(data, `value`)];
      expect(result).toEqual([-5, 0, 10]);
    });

    test(`handles floating point numbers`, () => {
      const data = [{ value: 1.5 }, { value: 2.7 }];
      const result = [...enumerateNumericalValues(data, `value`)];
      expect(result).toEqual([1.5, 2.7]);
    });

    test(`handles empty array`, () => {
      const data: { value: number }[] = [];
      const result = [...enumerateNumericalValues(data, `value`)];
      expect(result).toEqual([]);
    });

    test(`handles single object`, () => {
      const data = [{ count: 42 }];
      const result = [...enumerateNumericalValues(data, `count`)];
      expect(result).toEqual([42]);
    });

    test(`yields values in order`, () => {
      const data = [{ n: 1 }, { n: 2 }, { n: 3 }, { n: 4 }, { n: 5 }];
      const result = [...enumerateNumericalValues(data, `n`)];
      expect(result).toEqual([1, 2, 3, 4, 5]);
    });

    test(`handles zero values`, () => {
      const data = [{ value: 0 }, { value: 0 }];
      const result = [...enumerateNumericalValues(data, `value`)];
      expect(result).toEqual([0, 0]);
    });
  });
});
