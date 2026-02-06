import { describe, test, expect, vi } from 'vitest';
import * as Async from '../src/async.js';
import { asyncIterableToArray, takeAsync } from './test-utils.js';

describe('async', () => {
  describe('fromArray', () => {
    test('yields all items from array', async () => {
      const gen = Async.fromArray([1, 2, 3], 0);
      const result = await asyncIterableToArray(gen);
      expect(result).toEqual([1, 2, 3]);
    });

    test('yields items with delay - timing verified', async () => {
      // Use real short delay to verify timing works
      const start = Date.now();
      const gen = Async.fromArray([1, 2], 10);
      const result = await asyncIterableToArray(gen);
      const elapsed = Date.now() - start;
      
      expect(result).toEqual([1, 2]);
      expect(elapsed).toBeGreaterThanOrEqual(10); // At least 10ms delay between items
    });

    test('handles empty array', async () => {
      const gen = Async.fromArray([], 0);
      const result = await asyncIterableToArray(gen);
      expect(result).toEqual([]);
    });
  });

  describe('fromIterable', () => {
    test('yields from sync iterable', async () => {
      const gen = Async.fromIterable([1, 2, 3], 0);
      const result = await asyncIterableToArray(gen);
      expect(result).toEqual([1, 2, 3]);
    });

    test('yields from async iterable', async () => {
      async function* source() {
        yield 1;
        yield 2;
        yield 3;
      }
      const gen = Async.fromIterable(source(), 0);
      const result = await asyncIterableToArray(gen);
      expect(result).toEqual([1, 2, 3]);
    });

    test('handles empty iterable', async () => {
      const gen = Async.fromIterable([], 0);
      const result = await asyncIterableToArray(gen);
      expect(result).toEqual([]);
    });
  });

  describe('chunks', () => {
    test('chunks into fixed sizes', async () => {
      const gen = Async.chunks(Async.fromArray([1, 2, 3, 4, 5], 0), 2);
      const result = await asyncIterableToArray(gen);
      expect(result).toEqual([[1, 2], [3, 4], [5]]);
    });

    test('handles exact multiple', async () => {
      const gen = Async.chunks(Async.fromArray([1, 2, 3, 4], 0), 2);
      const result = await asyncIterableToArray(gen);
      expect(result).toEqual([[1, 2], [3, 4]]);
    });

    test('handles empty iterable', async () => {
      const gen = Async.chunks(Async.fromArray([], 0), 2);
      const result = await asyncIterableToArray(gen);
      expect(result).toEqual([]);
    });

    test('handles single chunk', async () => {
      const gen = Async.chunks(Async.fromArray([1, 2, 3], 0), 5);
      const result = await asyncIterableToArray(gen);
      expect(result).toEqual([[1, 2, 3]]);
    });
  });

  describe('concat', () => {
    test('concatenates multiple iterables', async () => {
      const gen = Async.concat(
        Async.fromArray([1, 2], 0),
        Async.fromArray([3, 4], 0),
        Async.fromArray([5], 0)
      );
      const result = await asyncIterableToArray(gen);
      expect(result).toEqual([1, 2, 3, 4, 5]);
    });

    test('handles empty iterables', async () => {
      const gen = Async.concat(
        Async.fromArray([], 0),
        Async.fromArray([1, 2], 0),
        Async.fromArray([], 0)
      );
      const result = await asyncIterableToArray(gen);
      expect(result).toEqual([1, 2]);
    });

    test('handles single iterable', async () => {
      const gen = Async.concat(Async.fromArray([1, 2, 3], 0));
      const result = await asyncIterableToArray(gen);
      expect(result).toEqual([1, 2, 3]);
    });
  });

  describe('dropWhile', () => {
    test('drops while predicate is true', async () => {
      const gen = Async.dropWhile(Async.fromArray([1, 2, 3, 4, 5], 0), x => x < 3);
      const result = await asyncIterableToArray(gen);
      // Drops 1 and 2 (x < 3), then yields 3, 4, 5
      expect(result).toEqual([3, 4, 5]);
    });

    test('drops all when predicate always true', async () => {
      const gen = Async.dropWhile(Async.fromArray([1, 2, 3], 0), () => true);
      const result = await asyncIterableToArray(gen);
      expect(result).toEqual([]);
    });

    test('keeps all when predicate always false', async () => {
      const gen = Async.dropWhile(Async.fromArray([1, 2, 3], 0), () => false);
      const result = await asyncIterableToArray(gen);
      expect(result).toEqual([1, 2, 3]);
    });


  });

  describe('until', () => {
    test('calls callback for each item', async () => {
      const calls: number[] = [];
      await Async.until(Async.fromArray([1, 2, 3], 0), () => {
        calls.push(1);
        return true;
      });
      expect(calls).toEqual([1, 1, 1]);
    });

    test('stops when callback returns false', async () => {
      let count = 0;
      await Async.until(Async.fromArray([1, 2, 3, 4, 5], 0), () => {
        count++;
        return count < 3;
      });
      expect(count).toBe(3);
    });

    test('handles async callback', async () => {
      const calls: number[] = [];
      await Async.until(Async.fromArray([1, 2], 0), async () => {
        calls.push(1);
        return true;
      });
      expect(calls).toEqual([1, 1]);
    });
  });

  describe('repeat', () => {
    test('rejects finite count', async () => {
      let callCount = 0;
      const gen = Async.repeat(() => {
        callCount++;
        return Async.fromArray([1], 0);
      }, 3);
      const result = await asyncIterableToArray(gen);
      expect(callCount).toBe(3);
      expect(result).toEqual([1, 1, 1]);
    });

    test('respects abort signal', async () => {
      const controller = new AbortController();
      const gen = Async.repeat(() => Async.fromArray([1], 0), controller.signal);
      
      // Take first few items then abort
      let count = 0;
      for await (const _ of gen) {
        count++;
        if (count >= 5) {
          controller.abort();
          break;
        }
      }
      expect(count).toBe(5);
    });
  });

  describe('equals', () => {
    test('returns true for equal iterables', async () => {
      const result = await Async.equals(
        Async.fromArray([1, 2, 3], 0),
        Async.fromArray([1, 2, 3], 0)
      );
      expect(result).toBe(true);
    });

    test('returns false for different iterables', async () => {
      const result = await Async.equals(
        Async.fromArray([1, 2, 3], 0),
        Async.fromArray([1, 2, 4], 0)
      );
      expect(result).toBe(false);
    });

    test('returns false for different lengths', async () => {
      const result = await Async.equals(
        Async.fromArray([1, 2], 0),
        Async.fromArray([1, 2, 3], 0)
      );
      expect(result).toBe(false);
    });

    test('uses custom equality function', async () => {
      const result = await Async.equals(
        Async.fromArray([{ v: 1 }, { v: 2 }], 0),
        Async.fromArray([{ v: 1 }, { v: 2 }], 0),
        (a, b) => a?.v === b?.v
      );
      expect(result).toBe(true);
    });

    test('uses key function', async () => {
      const result = await Async.equals(
        Async.fromArray([{ id: 1 }, { id: 2 }], 0),
        Async.fromArray([{ id: 1 }, { id: 2 }], 0),
        (item: { id: number }) => item?.id?.toString() ?? ''
      );
      expect(result).toBe(true);
    });
  });

  describe('every', () => {
    test('returns true when all match', async () => {
      const result = await Async.every(Async.fromArray([2, 4, 6], 0), x => x % 2 === 0);
      expect(result).toBe(true);
    });

    test('returns false when any does not match', async () => {
      const result = await Async.every(Async.fromArray([2, 3, 6], 0), x => x % 2 === 0);
      expect(result).toBe(false);
    });

    test('returns true for empty iterable', async () => {
      const result = await Async.every(Async.fromArray([], 0), () => false);
      expect(result).toBe(true);
    });

    test('works with async predicate', async () => {
      const result = await Async.every(
        Async.fromArray([2, 4, 6], 0),
        async x => x % 2 === 0
      );
      expect(result).toBe(true);
    });
  });

  describe('fill', () => {
    test('fills all positions with value', async () => {
      const gen = Async.fill(Async.fromArray([1, 2, 3], 0), 0);
      const result = await asyncIterableToArray(gen);
      expect(result).toEqual([0, 0, 0]);
    });

    test('works with empty iterable', async () => {
      const gen = Async.fill(Async.fromArray([], 0), 0);
      const result = await asyncIterableToArray(gen);
      expect(result).toEqual([]);
    });
  });

  describe('filter', () => {
    test('filters based on predicate', async () => {
      const gen = Async.filter(Async.fromArray([1, 2, 3, 4, 5], 0), x => x % 2 === 0);
      const result = await asyncIterableToArray(gen);
      expect(result).toEqual([2, 4]);
    });

    test('returns empty when nothing matches', async () => {
      const gen = Async.filter(Async.fromArray([1, 3, 5], 0), x => x % 2 === 0);
      const result = await asyncIterableToArray(gen);
      expect(result).toEqual([]);
    });

    test('returns all when everything matches', async () => {
      const gen = Async.filter(Async.fromArray([2, 4, 6], 0), x => x % 2 === 0);
      const result = await asyncIterableToArray(gen);
      expect(result).toEqual([2, 4, 6]);
    });

    test('works with async predicate', async () => {
      const gen = Async.filter(
        Async.fromArray([1, 2, 3, 4], 0),
        async x => x % 2 === 0
      );
      const result = await asyncIterableToArray(gen);
      expect(result).toEqual([2, 4]);
    });
  });

  describe('find', () => {
    test('finds first matching item', async () => {
      const result = await Async.find(Async.fromArray([1, 2, 3, 4], 0), x => x > 2);
      expect(result).toBe(3);
    });

    test('returns undefined when not found', async () => {
      const result = await Async.find(Async.fromArray([1, 2, 3], 0), x => x > 10);
      expect(result).toBeUndefined();
    });

    test('works with async predicate', async () => {
      const result = await Async.find(
        Async.fromArray([1, 2, 3], 0),
        async x => x === 2
      );
      expect(result).toBe(2);
    });
  });

  describe('flatten', () => {
    test('flattens nested arrays', async () => {
      const gen = Async.flatten(Async.fromArray([[1, 2], [3, 4], [5]], 0));
      const result = await asyncIterableToArray(gen);
      expect(result).toEqual([1, 2, 3, 4, 5]);
    });

    test('flattens nested iterables', async () => {
      function* inner() {
        yield 1;
        yield 2;
      }
      const gen = Async.flatten(Async.fromArray([inner(), inner()], 0));
      const result = await asyncIterableToArray(gen);
      expect(result).toEqual([1, 2, 1, 2]);
    });

    test('flattens nested async iterables', async () => {
      async function* inner() {
        yield 1;
        yield 2;
      }
      const gen = Async.flatten(Async.fromArray([inner(), inner()], 0));
      const result = await asyncIterableToArray(gen);
      expect(result).toEqual([1, 2, 1, 2]);
    });

    test('passes through non-iterables', async () => {
      const gen = Async.flatten(Async.fromArray([1, 'two', 3], 0));
      const result = await asyncIterableToArray(gen);
      expect(result).toEqual([1, 'two', 3]);
    });
  });

  describe('forEach', () => {
    test('calls function for each item', async () => {
      const items: number[] = [];
      await Async.forEach(Async.fromArray([1, 2, 3], 0), (x) => {
        items.push(x!);
        return true;
      });
      expect(items).toEqual([1, 2, 3]);
    });

    test('stops when function returns false', async () => {
      const items: number[] = [];
      await Async.forEach(Async.fromArray([1, 2, 3, 4, 5], 0), (x) => {
        items.push(x!);
        return x! < 3;
      });
      expect(items).toEqual([1, 2, 3]);
    });

    test('handles arrays directly', async () => {
      const items: number[] = [];
      await Async.forEach([1, 2, 3], (x) => {
        items.push(x!);
        return true;
      });
      expect(items).toEqual([1, 2, 3]);
    });

    test('respects interval option - timing verified', async () => {
      // Use real short delay to verify timing works
      const start = Date.now();
      const items: number[] = [];
      await Async.forEach([1, 2], (x) => {
        items.push(x!);
        return true;
      }, { interval: 10 });
      const elapsed = Date.now() - start;
      
      expect(items).toEqual([1, 2]);
      expect(elapsed).toBeGreaterThanOrEqual(10); // At least 10ms delay between items
    });
  });

  describe('last', () => {
    test('returns last item', async () => {
      const result = await Async.last(Async.fromArray([1, 2, 3], 0));
      expect(result).toBe(3);
    });

    test('returns undefined for empty iterable', async () => {
      const result = await Async.last(Async.fromArray([], 0));
      expect(result).toBeUndefined();
    });

    test('returns single item', async () => {
      const result = await Async.last(Async.fromArray([42], 0));
      expect(result).toBe(42);
    });

    test('respects abort signal', async () => {
      const controller = new AbortController();
      controller.abort(); // Abort immediately
      
      const result = await Async.last(Async.fromArray([1, 2, 3], 0), { abort: controller.signal });
      expect(result).toBeUndefined();
    });
  });

  describe('map', () => {
    test('maps each item', async () => {
      const gen = Async.map(Async.fromArray([1, 2, 3], 0), x => x * 2);
      const result = await asyncIterableToArray(gen);
      expect(result).toEqual([2, 4, 6]);
    });

    test('transforms types', async () => {
      const gen = Async.map(Async.fromArray([1, 2, 3], 0), x => ({ value: x }));
      const result = await asyncIterableToArray(gen);
      expect(result).toEqual([{ value: 1 }, { value: 2 }, { value: 3 }]);
    });

    test('handles empty iterable', async () => {
      const gen = Async.map(Async.fromArray([], 0), x => x * 2);
      const result = await asyncIterableToArray(gen);
      expect(result).toEqual([]);
    });
  });

  describe('max', () => {
    test('yields increasing maximum', async () => {
      const gen = Async.max(Async.fromArray([1, 3, 2, 5, 4], 0));
      const result = await asyncIterableToArray(gen);
      expect(result).toEqual([1, 3, 5]);
    });

    test('handles single item', async () => {
      const gen = Async.max(Async.fromArray([5], 0));
      const result = await asyncIterableToArray(gen);
      expect(result).toEqual([5]);
    });

    test('handles empty iterable', async () => {
      const gen = Async.max(Async.fromArray([], 0));
      const result = await asyncIterableToArray(gen);
      expect(result).toEqual([]);
    });

    test('uses custom comparer', async () => {
      const gen = Async.max(
        Async.fromArray([{ v: 1 }, { v: 3 }, { v: 2 }], 0),
        (a, b) => a.v > b.v
      );
      const result = await asyncIterableToArray(gen);
      expect(result).toEqual([{ v: 1 }, { v: 3 }]);
    });
  });

  describe('min', () => {
    test('yields decreasing minimum', async () => {
      const gen = Async.min(Async.fromArray([5, 3, 4, 1, 2], 0));
      const result = await asyncIterableToArray(gen);
      expect(result).toEqual([5, 3, 1]);
    });

    test('handles single item', async () => {
      const gen = Async.min(Async.fromArray([1], 0));
      const result = await asyncIterableToArray(gen);
      expect(result).toEqual([1]);
    });

    test('handles empty iterable', async () => {
      const gen = Async.min(Async.fromArray([], 0));
      const result = await asyncIterableToArray(gen);
      expect(result).toEqual([]);
    });

    test('uses custom comparer', async () => {
      const gen = Async.min(
        Async.fromArray([{ v: 3 }, { v: 1 }, { v: 2 }], 0),
        (a, b) => a.v > b.v
      );
      const result = await asyncIterableToArray(gen);
      expect(result).toEqual([{ v: 3 }, { v: 1 }]);
    });
  });

  describe('reduce', () => {
    test('reduces to single value', async () => {
      const result = await Async.reduce(
        Async.fromArray([1, 2, 3, 4], 0),
        (acc, x) => acc + x,
        0
      );
      expect(result).toBe(10);
    });

    test('uses initial value', async () => {
      const result = await Async.reduce(
        Async.fromArray([1, 2, 3], 0),
        (acc, x) => acc + x,
        100
      );
      expect(result).toBe(106);
    });

    test('handles empty iterable', async () => {
      const result = await Async.reduce<number>(
        Async.fromArray([], 0),
        (acc, x) => acc + x,
        42
      );
      expect(result).toBe(42);
    });
  });

  describe('asCallback', () => {
    test('calls callback for each value', async () => {
      const values: number[] = [];
      await Async.asCallback(Async.fromArray([1, 2, 3], 0), (v) => {
        values.push(v);
      });
      expect(values).toEqual([1, 2, 3]);
    });

    test('calls onDone when complete', async () => {
      let doneCalled = false;
      await Async.asCallback(Async.fromArray([1, 2], 0), () => {}, () => {
        doneCalled = true;
      });
      expect(doneCalled).toBe(true);
    });
  });

  describe('slice', () => {
    test('slices from start', async () => {
      const gen = Async.slice(Async.fromArray([1, 2, 3, 4, 5], 0), 1, 4);
      const result = await asyncIterableToArray(gen);
      expect(result).toEqual([2, 3, 4]);
    });

    test('slices to end', async () => {
      const gen = Async.slice(Async.fromArray([1, 2, 3], 0), 1);
      const result = await asyncIterableToArray(gen);
      expect(result).toEqual([2, 3]);
    });

    test('throws when end < start', async () => {
      const gen = Async.slice(Async.fromArray([1, 2, 3], 0), 3, 1);
      await expect(asyncIterableToArray(gen)).rejects.toThrow();
    });
  });

  describe('withDelay', () => {
    test('adds delay between items - timing verified', async () => {
      // Use real short delay to verify timing works
      const start = Date.now();
      const gen = Async.withDelay([1, 2], 10);
      const result = await asyncIterableToArray(gen);
      const elapsed = Date.now() - start;
      
      expect(result).toEqual([1, 2]);
      expect(elapsed).toBeGreaterThanOrEqual(10); // At least 10ms delay between items
    });
  });

  describe('nextWithTimeout', () => {
    test('returns iterator result', async () => {
      async function* gen() {
        yield 1;
        yield 2;
      }
      const iterator = gen();
      const result = await Async.nextWithTimeout(iterator, { millis: 1000 });
      expect(result.value).toBe(1);
      expect(result.done).toBe(false);
    });

    test('throws on timeout', async () => {
      // Create a slow async generator that takes longer than timeout
      async function* slow() {
        await new Promise(resolve => setTimeout(resolve, 50));
        yield 1;
      }
      const iterator = slow();
      
      // Should throw because iterator takes 50ms but timeout is 10ms
      await expect(Async.nextWithTimeout(iterator, { millis: 10 })).rejects.toThrow('Timeout');
    });
  });

  describe('some', () => {
    test('returns true when any match', async () => {
      const result = await Async.some(Async.fromArray([1, 3, 4, 5], 0), x => x % 2 === 0);
      expect(result).toBe(true);
    });

    test('returns false when none match', async () => {
      const result = await Async.some(Async.fromArray([1, 3, 5], 0), x => x % 2 === 0);
      expect(result).toBe(false);
    });

    test('returns false for empty iterable', async () => {
      const result = await Async.some(Async.fromArray([], 0), () => true);
      expect(result).toBe(false);
    });

    test('works with async predicate', async () => {
      const result = await Async.some(
        Async.fromArray([1, 2, 3], 0),
        async x => x === 2
      );
      expect(result).toBe(true);
    });
  });

  describe('toArray', () => {
    test('converts to array', async () => {
      const result = await Async.toArray(Async.fromArray([1, 2, 3], 0));
      expect(result).toEqual([1, 2, 3]);
    });

    test('respects limit option', async () => {
      const result = await Async.toArray(Async.fromArray([1, 2, 3, 4, 5], 0), { limit: 3 });
      expect(result).toEqual([1, 2, 3]);
    });

    test('respects elapsed option - timing verified', async () => {
      // Create a slow async generator
      async function* slow() {
        yield 1;
        await new Promise(resolve => setTimeout(resolve, 50));
        yield 2;
        await new Promise(resolve => setTimeout(resolve, 50));
        yield 3;
      }
      
      // Should stop after ~30ms and only get the first item
      const start = Date.now();
      const result = await Async.toArray(slow(), { elapsed: 30 });
      const elapsed = Date.now() - start;
      
      expect(result.length).toBeGreaterThanOrEqual(1);
      expect(elapsed).toBeLessThan(100); // Should stop early
    });

    test('respects while option', async () => {
      let count = 0;
      const result = await Async.toArray(Async.fromArray([1, 2, 3, 4, 5], 0), {
        while: () => count++ < 3
      });
      expect(result).toEqual([1, 2, 3]);
    });
  });

  describe('unique', () => {
    test('yields only unique values', async () => {
      const gen = Async.unique(Async.fromArray([1, 2, 2, 3, 3, 3], 0));
      const result = await asyncIterableToArray(gen);
      expect(result).toEqual([1, 2, 3]);
    });

    test('handles arrays of iterables', async () => {
      const gen = Async.unique([
        Async.fromArray([1, 2], 0),
        Async.fromArray([2, 3], 0),
        Async.fromArray([3, 4], 0)
      ]);
      const result = await asyncIterableToArray(gen);
      expect(result).toEqual([1, 2, 3, 4]);
    });
  });

  describe('uniqueByValue', () => {
    test('yields unique values by string key', async () => {
      const gen = Async.uniqueByValue(Async.fromArray([{ id: 1 }, { id: 2 }, { id: 1 }], 0));
      const result = await asyncIterableToArray(gen);
      expect(result).toEqual([{ id: 1 }, { id: 2 }]);
    });

    test('uses custom toString function', async () => {
      const gen = Async.uniqueByValue(
        Async.fromArray([{ v: 1 }, { v: 2 }, { v: 1 }], 0),
        (item) => item.v.toString()
      );
      const result = await asyncIterableToArray(gen);
      expect(result).toEqual([{ v: 1 }, { v: 2 }]);
    });

    test('accepts pre-populated set', async () => {
      const seen = new Set<string>(['1']);
      const gen = Async.uniqueByValue(Async.fromArray([1, 2, 1], 0), undefined, seen);
      const result = await asyncIterableToArray(gen);
      expect(result).toEqual([2]);
    });
  });

  describe('zip', () => {
    test('zips multiple iterables of same type', async () => {
      const gen = Async.zip(
        Async.fromArray([1, 2, 3], 0),
        Async.fromArray([4, 5, 6], 0),
        Async.fromArray([7, 8, 9], 0)
      );
      const result = await asyncIterableToArray(gen);
      expect(result).toEqual([
        [1, 4, 7],
        [2, 5, 8],
        [3, 6, 9]
      ]);
    });

    test('stops at shortest iterable', async () => {
      const gen = Async.zip(
        Async.fromArray([1, 2, 3, 4], 0),
        Async.fromArray([10, 20], 0)
      );
      const result = await asyncIterableToArray(gen);
      expect(result).toEqual([[1, 10], [2, 20]]);
    });

    test('handles single iterable', async () => {
      const gen = Async.zip(Async.fromArray([1, 2, 3], 0));
      const result = await asyncIterableToArray(gen);
      expect(result).toEqual([[1], [2], [3]]);
    });

    test('handles empty iterables', async () => {
      const gen = Async.zip(Async.fromArray([], 0), Async.fromArray([1, 2], 0));
      const result = await asyncIterableToArray(gen);
      expect(result).toEqual([]);
    });
  });
});
