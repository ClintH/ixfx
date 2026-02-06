import { describe, test, expect } from 'vitest';
import * as Compare from '../src/compare-values.js';

describe('compare-values', () => {
  describe('maxScore', () => {
    test('returns item with highest score', () => {
      const result = Compare.maxScore([1, 2, 3, 4, 5], x => x);
      expect(result).toBe(5);
    });

    test('returns undefined for empty iterable', () => {
      const result = Compare.maxScore([], x => x);
      expect(result).toBeUndefined();
    });

    test('uses custom scoring function', () => {
      const items = [{ v: 1 }, { v: 5 }, { v: 3 }];
      const result = Compare.maxScore(items, x => x.v);
      expect(result).toEqual({ v: 5 });
    });

    test('returns first item with max score on tie', () => {
      const result = Compare.maxScore([5, 5, 3], x => x);
      expect(result).toBe(5);
    });
  });

  describe('minScore', () => {
    test('returns item with lowest score', () => {
      const result = Compare.minScore([5, 4, 3, 2, 1], x => x);
      expect(result).toBe(1);
    });

    test('returns undefined for empty iterable', () => {
      const result = Compare.minScore([], x => x);
      expect(result).toBeUndefined();
    });

    test('uses custom scoring function', () => {
      const items = [{ v: 5 }, { v: 1 }, { v: 3 }];
      const result = Compare.minScore(items, x => x.v);
      expect(result).toEqual({ v: 1 });
    });

    test('returns first item with min score on tie', () => {
      const result = Compare.minScore([1, 1, 3], x => x);
      expect(result).toBe(1);
    });
  });

  describe('hasEqualValuesShallow', () => {
    test('returns true for equal values regardless of order', () => {
      const result = Compare.hasEqualValuesShallow(
        ['apples', 'oranges', 'pears'],
        ['pears', 'oranges', 'apples']
      );
      expect(result).toBe(true);
    });

    test('returns false for different values', () => {
      const result = Compare.hasEqualValuesShallow(
        [1, 2, 3],
        [1, 2, 4]
      );
      expect(result).toBe(false);
    });

    test('returns false for different lengths', () => {
      const result = Compare.hasEqualValuesShallow(
        [1, 2, 3],
        [1, 2]
      );
      expect(result).toBe(false);
    });

    test('returns true for empty iterables', () => {
      const result = Compare.hasEqualValuesShallow([], []);
      expect(result).toBe(true);
    });

    test('uses custom equality function', () => {
      const a = [{ name: 'John' }];
      const b = [{ name: 'John' }];
      // Without custom equality, objects are different
      expect(Compare.hasEqualValuesShallow(a, b)).toBe(false);
      // With custom equality
      expect(Compare.hasEqualValuesShallow(a, b, (aa, bb) => aa.name === bb.name)).toBe(true);
    });
  });
});
