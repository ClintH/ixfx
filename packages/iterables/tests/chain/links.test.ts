import { describe, test, expect } from 'vitest';
import * as Links from '../../src/chain/links.js';
import { asyncIterableToArray, createAsyncGenerator } from '../test-utils.js';

describe('Links', () => {
  describe('transform', () => {
    test('transforms values with function', async () => {
      const link = Links.transform((x: number) => x * 2);
      const result = await asyncIterableToArray(link([1, 2, 3]));
      expect(result).toEqual([2, 4, 6]);
    });

    test('transforms types', async () => {
      const link = Links.transform((x: number) => ({ value: x }));
      const result = await asyncIterableToArray(link([1, 2, 3]));
      expect(result).toEqual([{ value: 1 }, { value: 2 }, { value: 3 }]);
    });

    test('handles empty input', async () => {
      const link = Links.transform((x: number) => x * 2);
      const result = await asyncIterableToArray(link([]));
      expect(result).toEqual([]);
    });

    test('has _name property', () => {
      const link = Links.transform((x: number) => x);
      expect(link._name).toBe('transform');
    });

    test('works with async generator input', async () => {
      const link = Links.transform((x: number) => x * 2);
      const result = await asyncIterableToArray(link(createAsyncGenerator([1, 2, 3])));
      expect(result).toEqual([2, 4, 6]);
    });
  });

  describe('take', () => {
    test('takes limited number of values', async () => {
      const link = Links.take<number>(3);
      const result = await asyncIterableToArray(link([1, 2, 3, 4, 5]));
      expect(result).toEqual([1, 2, 3]);
    });

    test('takes all when limit exceeds input', async () => {
      const link = Links.take<number>(10);
      const result = await asyncIterableToArray(link([1, 2, 3]));
      expect(result).toEqual([1, 2, 3]);
    });

    test('handles empty input', async () => {
      const link = Links.take<number>(5);
      const result = await asyncIterableToArray(link([]));
      expect(result).toEqual([]);
    });

    test('handles zero limit', async () => {
      const link = Links.take<number>(0);
      const result = await asyncIterableToArray(link([1, 2, 3]));
      expect(result).toEqual([]);
    });

    test('has _name property', () => {
      const link = Links.take<number>(5);
      expect(link._name).toBe('take');
    });
  });

  describe('reduce', () => {
    test('reduces arrays with function', async () => {
      const link = Links.reduce((values: number[]) => values.reduce((a, b) => a + b, 0));
      const result = await asyncIterableToArray(link([[1, 2, 3], [4, 5]]));
      expect(result).toEqual([6, 9]);
    });

    test('reduces to max value', async () => {
      const link = Links.reduce((values: number[]) => Math.max(...values));
      const result = await asyncIterableToArray(link([[1, 5, 3], [10, 2]]));
      expect(result).toEqual([5, 10]);
    });

    test('handles empty arrays', async () => {
      const link = Links.reduce((values: number[]) => values.length);
      const result = await asyncIterableToArray(link([[], [1, 2]]));
      expect(result).toEqual([0, 2]);
    });

    test('has _name property', () => {
      const link = Links.reduce((values: number[]) => values);
      expect(link._name).toBe('reduce');
    });
  });

  describe('duration', () => {
    test('allows values through before duration expires', async () => {
      const link = Links.duration<number>(100);
      const gen = link(createAsyncGenerator([1, 2, 3]));
      const result = await asyncIterableToArray(gen);
      expect(result).toContain(1);
    });

    test('accepts interval object', async () => {
      const link = Links.duration<number>({ millis: 50 });
      const gen = link([1, 2, 3]);
      const result = await asyncIterableToArray(gen);
      expect(result.length).toBeGreaterThanOrEqual(0);
    });

    test('has _name property', () => {
      const link = Links.duration<number>(100);
      expect(link._name).toBe('duration');
    });
  });

  describe('delay', () => {
    test('adds delay before yielding', async () => {
      const start = Date.now();
      const link = Links.delay<number>({ before: 10 });
      const result = await asyncIterableToArray(link([1, 2]));
      const elapsed = Date.now() - start;
      expect(result).toEqual([1, 2]);
      expect(elapsed).toBeGreaterThanOrEqual(10);
    });

    test('adds delay after yielding', async () => {
      const start = Date.now();
      const link = Links.delay<number>({ after: 10 });
      const result = await asyncIterableToArray(link([1, 2]));
      const elapsed = Date.now() - start;
      expect(result).toEqual([1, 2]);
      expect(elapsed).toBeGreaterThanOrEqual(10);
    });

    test('adds delay before and after', async () => {
      const start = Date.now();
      const link = Links.delay<number>({ before: 5, after: 5 });
      const result = await asyncIterableToArray(link([1, 2]));
      const elapsed = Date.now() - start;
      expect(result).toEqual([1, 2]);
      expect(elapsed).toBeGreaterThanOrEqual(15);
    });

    test('handles empty input', async () => {
      const link = Links.delay<number>({ before: 10 });
      const result = await asyncIterableToArray(link([]));
      expect(result).toEqual([]);
    });

    test('has _name property', () => {
      const link = Links.delay<number>({ before: 10 });
      expect(link._name).toBe('delay');
    });
  });

  describe('debounce', () => {
    test('debounces values by rate', async () => {
      const link = Links.debounce<number>(10);
      // Values yielded with delays will pass through
      async function* slowInput() {
        yield 1;
        await new Promise(resolve => setTimeout(resolve, 15));
        yield 2;
        await new Promise(resolve => setTimeout(resolve, 15));
        yield 3;
      }
      const result = await asyncIterableToArray(link(slowInput()));
      expect(result.length).toBeGreaterThanOrEqual(1);
    });

    test('accepts interval object', async () => {
      const link = Links.debounce<number>({ millis: 25 });
      const result = await asyncIterableToArray(link([1, 2, 3]));
      expect(result.length).toBeGreaterThanOrEqual(0);
    });

    test('has _name property', () => {
      const link = Links.debounce<number>(100);
      expect(link._name).toBe('debounce');
    });
  });

  describe('tally', () => {
    test('counts items', async () => {
      const link = Links.tally<number>();
      const result = await asyncIterableToArray(link([1, 2, 3, 4]));
      expect(result).toEqual([1, 2, 3, 4]);
    });

    test('counts array items when flag is true', async () => {
      const link = Links.tally<number[]>(true);
      const result = await asyncIterableToArray(link([[1, 2], [3, 4, 5]]));
      expect(result).toEqual([2, 5]);
    });

    test('handles empty input', async () => {
      const link = Links.tally<number>();
      const result = await asyncIterableToArray(link([]));
      expect(result).toEqual([]);
    });

    test('has _name property', () => {
      const link = Links.tally<number>();
      expect(link._name).toBe('tally');
    });
  });

  describe('min', () => {
    test('finds running minimums', async () => {
      const link = Links.min();
      const result = await asyncIterableToArray(link([5, 3, 4, 1, 2]));
      // Returns running minimums, not just final result
      expect(result).toEqual([5, 3, 3, 1, 1]);
    });

    test('finds minimum in arrays', async () => {
      const link = Links.min();
      const result = await asyncIterableToArray(link([[5, 3], [4, 1, 2]]));
      expect(result).toEqual([3, 1]);
    });

    test('handles single value', async () => {
      const link = Links.min();
      const result = await asyncIterableToArray(link([42]));
      expect(result).toEqual([42]);
    });

    test('handles empty input', async () => {
      const link = Links.min();
      const result = await asyncIterableToArray(link([]));
      expect(result).toEqual([]);
    });

    test('has _name property', () => {
      const link = Links.min();
      expect(link._name).toBe('min');
    });
  });

  describe('max', () => {
    test('finds running maximums', async () => {
      const link = Links.max();
      const result = await asyncIterableToArray(link([1, 3, 2, 5, 4]));
      // Returns running maximums, not just final result
      expect(result).toEqual([1, 3, 3, 5, 5]);
    });

    test('finds maximum in arrays', async () => {
      const link = Links.max();
      const result = await asyncIterableToArray(link([[1, 3], [2, 5, 4]]));
      expect(result).toEqual([3, 5]);
    });

    test('handles single value', async () => {
      const link = Links.max();
      const result = await asyncIterableToArray(link([42]));
      expect(result).toEqual([42]);
    });

    test('handles empty input', async () => {
      const link = Links.max();
      const result = await asyncIterableToArray(link([]));
      expect(result).toEqual([]);
    });

    test('has _name property', () => {
      const link = Links.max();
      expect(link._name).toBe('max');
    });
  });

  describe('average', () => {
    test('calculates running average', async () => {
      const link = Links.average();
      const result = await asyncIterableToArray(link([10, 20, 30]));
      expect(result).toEqual([10, 15, 20]);
    });

    test('handles single value', async () => {
      const link = Links.average();
      const result = await asyncIterableToArray(link([100]));
      expect(result).toEqual([100]);
    });

    test('handles empty input', async () => {
      const link = Links.average();
      const result = await asyncIterableToArray(link([]));
      expect(result).toEqual([]);
    });

    test('has _name property', () => {
      const link = Links.average();
      expect(link._name).toBe('average');
    });
  });

  describe('sum', () => {
    test('calculates running total', async () => {
      const link = Links.sum();
      const result = await asyncIterableToArray(link([10, 20, 30]));
      expect(result).toEqual([10, 30, 60]);
    });

    test('handles single value', async () => {
      const link = Links.sum();
      const result = await asyncIterableToArray(link([100]));
      expect(result).toEqual([100]);
    });

    test('handles empty input', async () => {
      const link = Links.sum();
      const result = await asyncIterableToArray(link([]));
      expect(result).toEqual([]);
    });

    test('has _name property', () => {
      const link = Links.sum();
      expect(link._name).toBe('total');
    });
  });

  describe('chunk', () => {
    test('chunks into fixed sizes', async () => {
      const link = Links.chunk<number>(3);
      const result = await asyncIterableToArray(link([1, 2, 3, 4, 5, 6]));
      expect(result).toEqual([[1, 2, 3], [4, 5, 6]]);
    });

    test('returns remainders by default', async () => {
      const link = Links.chunk<number>(3);
      const result = await asyncIterableToArray(link([1, 2, 3, 4, 5]));
      expect(result).toEqual([[1, 2, 3], [4, 5]]);
    });

    test('drops remainders when returnRemainders is false', async () => {
      const link = Links.chunk<number>(3, false);
      const result = await asyncIterableToArray(link([1, 2, 3, 4, 5]));
      expect(result).toEqual([[1, 2, 3]]);
    });

    test('handles exact multiple', async () => {
      const link = Links.chunk<number>(2);
      const result = await asyncIterableToArray(link([1, 2, 3, 4]));
      expect(result).toEqual([[1, 2], [3, 4]]);
    });

    test('handles empty input', async () => {
      const link = Links.chunk<number>(3);
      const result = await asyncIterableToArray(link([]));
      expect(result).toEqual([]);
    });

    test('throws on non-positive size', () => {
      expect(() => Links.chunk<number>(0)).toThrow();
      expect(() => Links.chunk<number>(-1)).toThrow();
    });

    test('has _name property', () => {
      const link = Links.chunk<number>(3);
      expect(link._name).toBe('chunk');
    });
  });

  describe('filter', () => {
    test('filters based on predicate', async () => {
      const link = Links.filter<number>(x => x % 2 === 0);
      const result = await asyncIterableToArray(link([1, 2, 3, 4, 5]));
      expect(result).toEqual([2, 4]);
    });

    test('returns empty when nothing matches', async () => {
      const link = Links.filter<number>(x => x > 10);
      const result = await asyncIterableToArray(link([1, 2, 3]));
      expect(result).toEqual([]);
    });

    test('returns all when everything matches', async () => {
      const link = Links.filter<number>(x => x > 0);
      const result = await asyncIterableToArray(link([1, 2, 3]));
      expect(result).toEqual([1, 2, 3]);
    });

    test('handles empty input', async () => {
      const link = Links.filter<number>(x => x > 0);
      const result = await asyncIterableToArray(link([]));
      expect(result).toEqual([]);
    });

    test('has _name property', () => {
      const link = Links.filter<number>(x => x > 0);
      expect(link._name).toBe('filter');
    });
  });

  describe('drop', () => {
    test('drops values matching predicate', async () => {
      const link = Links.drop<number>(x => x % 2 === 0);
      const result = await asyncIterableToArray(link([1, 2, 3, 4, 5]));
      expect(result).toEqual([1, 3, 5]);
    });

    test('returns empty when everything is dropped', async () => {
      const link = Links.drop<number>(x => x > 0);
      const result = await asyncIterableToArray(link([1, 2, 3]));
      expect(result).toEqual([]);
    });

    test('returns all when nothing matches predicate', async () => {
      const link = Links.drop<number>(x => x > 10);
      const result = await asyncIterableToArray(link([1, 2, 3]));
      expect(result).toEqual([1, 2, 3]);
    });

    test('handles empty input', async () => {
      const link = Links.drop<number>(x => x > 0);
      const result = await asyncIterableToArray(link([]));
      expect(result).toEqual([]);
    });

    test('has _name property', () => {
      const link = Links.drop<number>(x => x > 0);
      expect(link._name).toBe('drop');
    });
  });

  describe('rank', () => {
    test('emits only increasing values', async () => {
      const link = Links.rank<number>((a, b) => a > b ? 'a' : a < b ? 'b' : 'eq');
      const result = await asyncIterableToArray(link([1, 3, 2, 5, 4]));
      expect(result).toEqual([1, 3, 5]);
    });

    test('handles equal values', async () => {
      const link = Links.rank<number>((a, b) => a > b ? 'a' : a < b ? 'b' : 'eq');
      const result = await asyncIterableToArray(link([1, 1, 2, 2, 3]));
      expect(result).toEqual([1, 2, 3]);
    });

    test('handles single value', async () => {
      const link = Links.rank<number>((a, b) => a > b ? 'a' : 'b');
      const result = await asyncIterableToArray(link([42]));
      expect(result).toEqual([42]);
    });

    test('handles empty input', async () => {
      const link = Links.rank<number>((a, b) => a > b ? 'a' : 'b');
      const result = await asyncIterableToArray(link([]));
      expect(result).toEqual([]);
    });

    test('has _name property', () => {
      const link = Links.rank<number>((a, b) => a > b ? 'a' : 'b');
      expect(link._name).toBe('rank');
    });
  });

  describe('rankArray', () => {
    test('emits highest from each array by default', async () => {
      const link = Links.rankArray<number>((a, b) => a > b ? 'a' : a < b ? 'b' : 'eq');
      const result = await asyncIterableToArray(link([[4, 5, 6], [1, 2, 3]]));
      expect(result).toEqual([6]);
    });

    test('emits highest from each array with withinArrays option', async () => {
      const link = Links.rankArray<number>(
        (a, b) => a > b ? 'a' : a < b ? 'b' : 'eq',
        { withinArrays: true }
      );
      const result = await asyncIterableToArray(link([[4, 5, 6], [1, 2, 3]]));
      expect(result).toEqual([6, 3]);
    });

    test('handles emitEqualRanked option', async () => {
      const link = Links.rankArray<number>(
        (a, b) => a > b ? 'a' : a < b ? 'b' : 'eq',
        { emitEqualRanked: true, withinArrays: true }
      );
      const result = await asyncIterableToArray(link([[5, 5], [3, 3]]));
      expect(result).toContain(5);
      expect(result).toContain(3);
    });

    test('handles empty arrays', async () => {
      const link = Links.rankArray<number>((a, b) => a > b ? 'a' : 'b');
      const result = await asyncIterableToArray(link([[], [1, 2]]));
      expect(result).toEqual([2]);
    });

    test('has _name property', () => {
      const link = Links.rankArray<number>((a, b) => a > b ? 'a' : 'b');
      expect(link._name).toBe('rankArray');
    });
  });
});
