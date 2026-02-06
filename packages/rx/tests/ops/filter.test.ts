import { describe, test, expect } from 'vitest';
import { filter, drop } from '../../src/ops/filter.js';
import { manual } from '../../src/index.js';
import { toArray } from '../../src/to-array.js';

describe('rx/ops/filter', () => {
  describe('filter', () => {
    test('passes values matching predicate', async () => {
      const source = manual<number>();
      const values: number[] = [];

      const filtered = filter(source, (v) => v > 5, {});
      filtered.onValue(v => values.push(v));

      source.set(3);
      source.set(7);
      source.set(2);
      source.set(8);
      source.set(1);

      expect(values).toEqual([7, 8]);
    });

    test('throws if predicate is not a function', () => {
      const source = manual<number>();
      
      expect(() => filter(source, null as any, {})).toThrow(TypeError);
      expect(() => filter(source, 'not a function' as any, {})).toThrow(TypeError);
      expect(() => filter(source, 123 as any, {})).toThrow(TypeError);
    });

    test('works with arrays as source', async () => {
      const source = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const filtered = filter(source, (v) => v % 2 === 0, {});
      
      const values = await toArray(filtered);
      expect(values).toEqual([2, 4, 6, 8, 10]);
    });

    test('handles string filtering', async () => {
      const source = ['apple', 'banana', 'cherry', 'date'];
      const filtered = filter(source, (v) => v.length > 5, {});
      
      const values = await toArray(filtered);
      expect(values).toEqual(['banana', 'cherry']);
    });

    test('handles empty source', async () => {
      const source: number[] = [];
      const filtered = filter(source, () => true, {});
      
      const values = await toArray(filtered);
      expect(values).toEqual([]);
    });

    test('handles no matches', async () => {
      const source = [1, 2, 3];
      const filtered = filter(source, (v) => v > 10, {});
      
      const values = await toArray(filtered);
      expect(values).toEqual([]);
    });

    test('predicate receives value', () => {
      const source = manual<number>();
      const calls: number[] = [];

      const filtered = filter(source, (v) => {
        calls.push(v);
        return true;
      }, {});

      filtered.onValue(() => {});

      source.set(10);
      source.set(20);

      expect(calls).toEqual([10, 20]);
    });

    test('handles object filtering', () => {
      const source = manual<{ type: string; value: number }>();
      const values: number[] = [];

      const filtered = filter(source, (v) => v.type === 'A', {});
      filtered.onValue(v => values.push(v.value));

      source.set({ type: 'A', value: 1 });
      source.set({ type: 'B', value: 2 });
      source.set({ type: 'A', value: 3 });

      expect(values).toEqual([1, 3]);
    });
  });

  describe('drop', () => {
    test('drops values matching predicate', async () => {
      const source = manual<number>();
      const values: number[] = [];

      const dropped = drop(source, (v) => v < 5, {});
      dropped.onValue(v => values.push(v));

      source.set(3);
      source.set(7);
      source.set(2);
      source.set(8);
      source.set(1);

      expect(values).toEqual([7, 8]);
    });

    test('throws if predicate is not a function', () => {
      const source = manual<number>();
      
      expect(() => drop(source, null as any, {})).toThrow(TypeError);
      expect(() => drop(source, undefined as any, {})).toThrow(TypeError);
    });

    test('works with arrays as source', async () => {
      const source = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const dropped = drop(source, (v) => v % 2 === 0, {});
      
      const values = await toArray(dropped);
      expect(values).toEqual([1, 3, 5, 7, 9]);
    });

    test('handles empty source', async () => {
      const source: number[] = [];
      const dropped = drop(source, () => true, {});
      
      const values = await toArray(dropped);
      expect(values).toEqual([]);
    });

    test('filter and drop are opposites', () => {
      const source = manual<number>();
      const filteredValues: number[] = [];
      const droppedValues: number[] = [];

      const predicate = (v: number) => v > 5;

      const filtered = filter(source, predicate, {});
      const dropped = drop(source, predicate, {});

      filtered.onValue(v => filteredValues.push(v));
      dropped.onValue(v => droppedValues.push(v));

      source.set(3);
      source.set(7);
      source.set(10);
      source.set(2);

      // Values > 5 go to filtered
      expect(filteredValues).toEqual([7, 10]);
      // Values <= 5 go to dropped
      expect(droppedValues).toEqual([3, 2]);
    });
  });
});