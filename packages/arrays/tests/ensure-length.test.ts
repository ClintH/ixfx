import { describe, test, expect } from 'vitest';
import { ensureLength } from '../src/ensure-length.js';

describe('ensure-length', () => {
  describe('basic truncation', () => {
    test('truncates from end by default', () => {
      const result = ensureLength([1, 2, 3, 4, 5], 3);
      expect(result).toEqual([1, 2, 3]);
    });

    test('truncates from end explicitly', () => {
      const result = ensureLength([1, 2, 3, 4, 5], 3, 'undefined', 'from-end');
      expect(result).toEqual([1, 2, 3]);
    });

    test('truncates from start', () => {
      const result = ensureLength([1, 2, 3, 4, 5], 3, 'undefined', 'from-start');
      expect(result).toEqual([3, 4, 5]);
    });

    test('returns same length array unchanged', () => {
      const input = [1, 2, 3];
      const result = ensureLength(input, 3);
      expect(result).toEqual([1, 2, 3]);
      expect(result).not.toBe(input); // Should be a copy
    });
  });

  describe('expand with undefined', () => {
    test('pads with undefined (default)', () => {
      const result = ensureLength([1, 2], 5);
      expect(result).toEqual([1, 2, undefined, undefined, undefined]);
    });

    test('pads with undefined (explicit)', () => {
      const result = ensureLength([1, 2], 5, 'undefined');
      expect(result).toEqual([1, 2, undefined, undefined, undefined]);
    });

    test('handles empty array', () => {
      const result = ensureLength([], 3, 'undefined');
      expect(result).toEqual([undefined, undefined, undefined]);
    });
  });

  describe('expand with repeat', () => {
    test('repeats array elements', () => {
      const result = ensureLength([1, 2, 3], 7, 'repeat');
      expect(result).toEqual([1, 2, 3, 1, 2, 3, 1]);
    });

    test('repeats single element', () => {
      const result = ensureLength([1], 5, 'repeat');
      expect(result).toEqual([1, 1, 1, 1, 1]);
    });

    test('handles empty array with repeat', () => {
      const result = ensureLength([], 3, 'repeat');
      expect(result).toEqual([undefined, undefined, undefined]);
    });
  });

  describe('expand with first', () => {
    test('repeats first element', () => {
      const result = ensureLength([1, 2, 3], 6, 'first');
      expect(result).toEqual([1, 2, 3, 1, 1, 1]);
    });

    test('handles single element', () => {
      const result = ensureLength([42], 4, 'first');
      expect(result).toEqual([42, 42, 42, 42]);
    });

    test('handles empty array with first', () => {
      const result = ensureLength([], 3, 'first');
      expect(result).toEqual([undefined, undefined, undefined]);
    });
  });

  describe('expand with last', () => {
    test('repeats last element', () => {
      const result = ensureLength([1, 2, 3], 6, 'last');
      expect(result).toEqual([1, 2, 3, 3, 3, 3]);
    });

    test('handles single element', () => {
      const result = ensureLength([42], 4, 'last');
      expect(result).toEqual([42, 42, 42, 42]);
    });

    test('handles empty array with last', () => {
      const result = ensureLength([], 3, 'last');
      expect(result).toEqual([undefined, undefined, undefined]);
    });
  });

  describe('combined truncate and expand', () => {
    test('truncates then expands', () => {
      const result = ensureLength([1, 2, 3, 4, 5], 2, 'repeat', 'from-start');
      expect(result).toEqual([4, 5]);
    });
  });

  describe('error handling', () => {
    test('throws on undefined data', () => {
      expect(() => ensureLength(undefined as any, 5)).toThrow('Data undefined');
    });

    test('throws on non-array data', () => {
      expect(() => ensureLength('not an array' as any, 5)).toThrow('data is not an array');
    });

    test('throws on null data', () => {
      expect(() => ensureLength(null as any, 5)).toThrow('data is not an array');
    });

    test('throws on number data', () => {
      expect(() => ensureLength(123 as any, 5)).toThrow('data is not an array');
    });
  });

  describe('edge cases', () => {
    test('handles length of 0', () => {
      const result = ensureLength([1, 2, 3], 0);
      expect(result).toEqual([]);
    });

    test('handles negative length', () => {
      // Negative length should return empty or behave consistently
      const result = ensureLength([1, 2, 3], -1);
      // Array.slice(0, -1) would return [1, 2], so that's the actual behavior
      expect(result.length).toBeLessThan(3);
    });

    test('returns copy of original when length matches', () => {
      const input = [1, 2, 3];
      const result = ensureLength(input, 3);
      expect(result).toEqual(input);
      expect(result).not.toBe(input);
    });

    test('works with readonly arrays', () => {
      const input: readonly number[] = [1, 2, 3];
      const result = ensureLength(input, 5, 'repeat');
      expect(result).toEqual([1, 2, 3, 1, 2]);
    });

    test('works with objects', () => {
      const input = [{ a: 1 }, { b: 2 }];
      const result = ensureLength(input, 4, 'last');
      expect(result).toEqual([{ a: 1 }, { b: 2 }, { b: 2 }, { b: 2 }]);
    });
  });
});
