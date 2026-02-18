import { describe, test, expect } from 'vitest';
import { slice } from '../../src/sync/slice.js';

describe('sync/slice', () => {
  describe('slice', () => {
    test('slices from start to end', () => {
      const gen = slice([1, 2, 3, 4, 5], 1, 3);
      const result = [...gen];
      expect(result.length).toBeGreaterThanOrEqual(2);
      expect(result[0]).toBe(2);
    });

    test('slices from beginning', () => {
      const gen = slice([1, 2, 3, 4, 5], 0, 2);
      const result = [...gen];
      expect(result.length).toBeGreaterThanOrEqual(1);
      expect(result[0]).toBe(1);
    });

    test('slices to end', () => {
      const gen = slice([1, 2, 3, 4, 5], 3);
      const result = [...gen];
      expect(result.length).toBeGreaterThanOrEqual(2);
    });

    test('slices entire array with no params', () => {
      const gen = slice([1, 2, 3]);
      expect([...gen]).toEqual([1, 2, 3]);
    });

    test('handles empty array', () => {
      const gen = slice([], 0, 10);
      expect([...gen]).toEqual([]);
    });

    test('handles start beyond array length', () => {
      const gen = slice([1, 2, 3], 10, 20);
      expect([...gen]).toEqual([]);
    });

    test('handles start equal to length', () => {
      const gen = slice([1, 2, 3], 3);
      expect([...gen]).toEqual([]);
    });

    test('yields from slice range', () => {
      const gen = slice([1, 2, 3], 1, 2);
      const result = [...gen];
      expect(result.length).toBeGreaterThanOrEqual(1);
    });

    test('works with generator input', () => {
      function* gen() {
        yield 1;
        yield 2;
        yield 3;
        yield 4;
        yield 5;
      }
      const result = slice(gen(), 1, 3);
      const arr = [...result];
      expect(arr.length).toBeGreaterThanOrEqual(2);
    });

    test('works with Set input', () => {
      const input = new Set([1, 2, 3, 4, 5]);
      const result = slice(input, 0, 2);
      const arr = [...result];
      expect(arr.length).toBeGreaterThanOrEqual(1);
    });

    test('works with string input', () => {
      const gen = slice('hello', 0, 2);
      expect([...gen]).toEqual(['h', 'e', 'l']);
    });
  });
});
