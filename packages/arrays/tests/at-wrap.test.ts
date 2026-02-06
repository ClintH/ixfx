import { describe, test, expect } from 'vitest';
import { atWrap } from '../src/at-wrap.js';

describe('at-wrap', () => {
  describe('positive indices', () => {
    test('returns element at index', () => {
      const arr = [1, 2, 3, 4, 5];
      expect(atWrap(arr, 0)).toBe(1);
      expect(atWrap(arr, 1)).toBe(2);
      expect(atWrap(arr, 4)).toBe(5);
    });

    test('wraps around for index beyond length', () => {
      const arr = [1, 2, 3];
      expect(atWrap(arr, 3)).toBe(1);
      expect(atWrap(arr, 4)).toBe(2);
      expect(atWrap(arr, 5)).toBe(3);
      expect(atWrap(arr, 6)).toBe(1);
    });

    test('handles large indices', () => {
      const arr = ['a', 'b'];
      expect(atWrap(arr, 100)).toBe('a'); // 100 % 2 = 0
      expect(atWrap(arr, 101)).toBe('b'); // 101 % 2 = 1
    });
  });

  describe('negative indices', () => {
    test('returns element from end', () => {
      const arr = [1, 2, 3, 4, 5];
      expect(atWrap(arr, -1)).toBe(5);
      expect(atWrap(arr, -2)).toBe(4);
      expect(atWrap(arr, -5)).toBe(1);
    });

    test('wraps around for negative index beyond length', () => {
      const arr = [1, 2, 3];
      expect(atWrap(arr, -4)).toBe(3); // -4 % 3 = -1, arr.at(-1) = 3
      expect(atWrap(arr, -5)).toBe(2); // -5 % 3 = -2, arr.at(-2) = 2
      expect(atWrap(arr, -6)).toBe(1); // -6 % 3 = 0, arr.at(0) = 1
      expect(atWrap(arr, -7)).toBe(3); // -7 % 3 = -1, arr.at(-1) = 3
    });
  });

  describe('edge cases', () => {
    test('works with single element array', () => {
      const arr = [42];
      expect(atWrap(arr, 0)).toBe(42);
      expect(atWrap(arr, 1)).toBe(42);
      expect(atWrap(arr, 100)).toBe(42);
      expect(atWrap(arr, -1)).toBe(42);
      expect(atWrap(arr, -100)).toBe(42);
    });

    test('works with empty array', () => {
      // Modulo of empty array is NaN, at(NaN) is undefined
      const arr: number[] = [];
      expect(atWrap(arr, 0)).toBeUndefined();
      expect(atWrap(arr, 1)).toBeUndefined();
    });

    test('works with objects', () => {
      const arr = [{ a: 1 }, { b: 2 }, { c: 3 }];
      expect(atWrap(arr, 0)).toEqual({ a: 1 });
      expect(atWrap(arr, 3)).toEqual({ a: 1 }); // wraps
    });
  });

  describe('error handling', () => {
    test('throws on non-array input', () => {
      expect(() => atWrap('not an array' as any, 0)).toThrow("Param 'array' is not an array");
    });

    test('throws on null input', () => {
      expect(() => atWrap(null as any, 0)).toThrow("Param 'array' is not an array");
    });

    test('throws on undefined input', () => {
      expect(() => atWrap(undefined as any, 0)).toThrow("Param 'array' is not an array");
    });

    test('throws on number input', () => {
      expect(() => atWrap(123 as any, 0)).toThrow("Param 'array' is not an array");
    });

    test('throws on object input', () => {
      expect(() => atWrap({} as any, 0)).toThrow("Param 'array' is not an array");
    });

    test('throws on NaN index', () => {
      expect(() => atWrap([1, 2, 3], NaN)).toThrow();
    });

    test('throws on non-number index', () => {
      expect(() => atWrap([1, 2, 3], 'not a number' as any)).toThrow();
    });
  });
});
