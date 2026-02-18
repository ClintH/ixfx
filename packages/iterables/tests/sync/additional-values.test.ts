import { describe, test, expect } from 'vitest';
import { additionalValues } from '../../src/sync/additional-values.js';

describe('sync/additional-values', () => {
  describe('additionalValues', () => {
    test('yields values not in source', () => {
      const source = [1, 2, 3];
      const values = [3, 4, 5];
      const gen = additionalValues(source, values);
      expect([...gen]).toEqual([4, 5]);
    });

    test('yields from multiple values', () => {
      const source = [1, 2];
      const values = [2, 3, 4, 5];
      const gen = additionalValues(source, values);
      expect([...gen]).toEqual([3, 4, 5]);
    });

    test('handles empty source', () => {
      const source: number[] = [];
      const values = [1, 2, 3];
      const gen = additionalValues(source, values);
      expect([...gen]).toEqual([1, 2, 3]);
    });

    test('handles empty values', () => {
      const source = [1, 2, 3];
      const values: number[] = [];
      const gen = additionalValues(source, values);
      expect([...gen]).toEqual([]);
    });

    test('handles both empty', () => {
      const source: number[] = [];
      const values: number[] = [];
      const gen = additionalValues(source, values);
      expect([...gen]).toEqual([]);
    });

    test('deduplicates values', () => {
      const source = [1, 2];
      const values = [3, 3, 4, 4, 5, 5];
      const gen = additionalValues(source, values);
      expect([...gen]).toEqual([3, 4, 5]);
    });

    test('ignores duplicates in values', () => {
      const source = [1];
      const values = [2, 2, 2, 2];
      const gen = additionalValues(source, values);
      expect([...gen]).toEqual([2]);
    });

    test('uses custom equality function', () => {
      const source = [{ id: 1 }, { id: 2 }];
      const values = [{ id: 3 }, { id: 1 }, { id: 4 }];
      const gen = additionalValues(source, values, (a, b) => a.id === b.id);
      expect([...gen]).toEqual([{ id: 3 }, { id: 4 }]);
    });

    test('works with strings', () => {
      const source = ['a', 'b', 'c'];
      const values = ['b', 'd', 'e', 'f'];
      const gen = additionalValues(source, values);
      expect([...gen]).toEqual(['d', 'e', 'f']);
    });

    test('works with objects by reference', () => {
      const obj1 = { id: 1 };
      const obj2 = { id: 2 };
      const source = [obj1, obj2];
      const obj3 = { id: 3 };
      const values = [obj2, obj3, obj1];
      const gen = additionalValues(source, values);
      expect([...gen]).toEqual([obj3]);
    });

    test('handles when source is set', () => {
      const source = new Set([1, 2, 3]);
      const values = [2, 3, 4, 5];
      const gen = additionalValues(source, values);
      expect([...gen]).toEqual([4, 5]);
    });

    test('handles generator input', () => {
      function* genSource() {
        yield 1;
        yield 2;
        yield 3;
      }
      function* genValues() {
        yield 3;
        yield 4;
        yield 5;
      }
      const gen = additionalValues(genSource(), genValues());
      expect([...gen]).toEqual([4, 5]);
    });

    test('complex case with multiple iterations', () => {
      const source = [1, 2, 3];
      const values = [1, 2, 3, 4, 4, 5, 5, 5];
      const gen = additionalValues(source, values);
      expect([...gen]).toEqual([4, 5]);
    });

    test('mixed types', () => {
      const source = [1, 'a', true];
      const values = [1, 'a', false, null, 2];
      const gen = additionalValues(source, values);
      expect([...gen]).toEqual([false, null, 2]);
    });
  });
});
