import { describe, test, expect } from 'vitest';
import { reduce } from '../../src/sync/reduce.js';

describe('sync/reduce', () => {
  describe('reduce', () => {
    test('reduces to sum with numbers', () => {
      const result = reduce([1, 2, 3, 4, 5], (acc, cur) => acc + cur, 0 as number);
      expect(result).toBe(15);
    });

    test('works with string concatenation', () => {
      const result = reduce(['a', 'b', 'c'], (acc, cur) => acc + cur, '');
      expect(result).toBe('abc');
    });

    test('uses initial value', () => {
      const result = reduce([1, 2, 3], (acc, cur) => acc + cur, 10 as number);
      expect(result).toBe(16);
    });

    test('handles single element', () => {
      const result = reduce([42], (acc, cur) => acc + cur, 0 as number);
      expect(result).toBe(42);
    });

    test('handles empty array', () => {
      const result = reduce<number>([], (acc, cur) => acc + cur, 0);
      expect(result).toBe(0);
    });

    test('works with multiplication', () => {
      const result = reduce([2, 3, 4], (acc, cur) => acc * cur, 1 as number);
      expect(result).toBe(24);
    });

    test('works with max function', () => {
      const result = reduce([3, 1, 4, 1, 5, 9], (acc, cur) => Math.max(acc, cur), 0 as number);
      expect(result).toBe(9);
    });

    test('works with min function', () => {
      const result = reduce([3, 1, 4, 1, 5, 9], (acc, cur) => Math.min(acc, cur), Infinity);
      expect(result).toBe(1);
    });

    test('works with Set input', () => {
      const input = new Set([1, 2, 3, 4, 5]);
      const result = reduce<number>(input, (acc, cur) => acc + cur, 0);
      expect(result).toBe(15);
    });

    test('works with generator input', () => {
      function* gen() {
        yield 1;
        yield 2;
        yield 3;
      }
      const result = reduce<number>(gen(), (acc, cur) => acc + cur, 0);
      expect(result).toBe(6);
    });

    test('preserves types correctly', () => {
      const result = reduce(['a', 'b', 'c'], (acc, cur) => `${acc}-${cur}`, 'start');
      expect(result).toBe('start-a-b-c');
    });

    test('handles boolean reduce with AND', () => {
      const result = reduce([true, true, false, true], (acc, cur) => acc && cur, true);
      expect(result).toBe(false);
    });

    test('handles boolean reduce with OR', () => {
      const result = reduce([false, false, true, false], (acc, cur) => acc || cur, false);
      expect(result).toBe(true);
    });

    test('works with array reduce pattern', () => {
      const input = [1, 2, 3, 4];
      const result = reduce<number>(input, (acc, cur) => acc + cur, 0);
      expect(result).toBe(10);
    });
  });
});
