import { describe, test, expect } from 'vitest';
import { array } from '../../src/chain/from/array.js';
import { func } from '../../src/chain/from/function.js';
import { iterable } from '../../src/chain/from/iterable.js';

describe('chain/from', () => {
  describe('array', () => {
    test('yields all array values', async () => {
      const source = array([1, 2, 3], 0);
      const results: number[] = [];
      for await (const v of source()) {
        results.push(v);
      }
      expect(results).toEqual([1, 2, 3]);
    });

    test('yields empty array', async () => {
      const source = array([], 0);
      const results: number[] = [];
      for await (const v of source()) {
        results.push(v);
      }
      expect(results).toEqual([]);
    });

    test('has correct _type and _name', () => {
      const source = array([1, 2, 3]);
      expect((source as any)._type).toBe('GenFactoryNoInput');
      expect((source as any)._name).toBe('fromArray');
    });

    test('respects delay between items', async () => {
      const source = array([1, 2], 10);
      const start = Date.now();
      const results: number[] = [];
      for await (const v of source()) {
        results.push(v);
      }
      const elapsed = Date.now() - start;
      expect(results).toEqual([1, 2]);
      expect(elapsed).toBeGreaterThanOrEqual(10);
    });

    test('works with strings', async () => {
      const source = array(['a', 'b', 'c'], 0);
      const results: string[] = [];
      for await (const v of source()) {
        results.push(v);
      }
      expect(results).toEqual(['a', 'b', 'c']);
    });

    test('works with objects', async () => {
      const source = array([{ id: 1 }, { id: 2 }], 0);
      const results: { id: number }[] = [];
      for await (const v of source()) {
        results.push(v);
      }
      expect(results).toEqual([{ id: 1 }, { id: 2 }]);
    });
  });

  describe('func', () => {
    test('yields callback values', async () => {
      let counter = 0;
      const source = func(() => {
        counter++;
        if (counter > 3) return undefined;
        return counter;
      });
      
      const results: number[] = [];
      for await (const v of source()) {
        results.push(v);
      }
      expect(results).toEqual([1, 2, 3]);
    });

    test('stops on undefined', async () => {
      let called = 0;
      const source = func(() => {
        called++;
        if (called === 1) return 'value';
        return undefined;
      });
      
      const results: string[] = [];
      for await (const v of source()) {
        results.push(v);
      }
      expect(results).toEqual(['value']);
      expect(called).toBe(2);
    });

    test('has correct _type and _name', () => {
      const source = func(() => 42);
      expect((source as any)._type).toBe('GenFactoryNoInput');
      expect((source as any)._name).toBe('fromFunction');
    });

    test('handles async callback', async () => {
      let counter = 0;
      const source = func(async () => {
        counter++;
        if (counter > 2) return undefined;
        await new Promise(r => setTimeout(r, 1));
        return counter;
      });
      
      const results: number[] = [];
      for await (const v of source()) {
        results.push(v);
      }
      expect(results).toEqual([1, 2]);
    });

    test('returns immediately on first undefined', async () => {
      const source = func(() => undefined);
      
      const results: unknown[] = [];
      for await (const v of source()) {
        results.push(v);
      }
      expect(results).toEqual([]);
    });
  });

  describe('iterable', () => {
    test('yields from sync iterable', async () => {
      const source = iterable([1, 2, 3]);
      const results: number[] = [];
      for await (const v of source()) {
        results.push(v);
      }
      expect(results).toEqual([1, 2, 3]);
    });

    test('yields from async iterable', async () => {
      async function* asyncGen() {
        yield 'a';
        yield 'b';
        yield 'c';
      }
      
      const source = iterable(asyncGen());
      const results: string[] = [];
      for await (const v of source()) {
        results.push(v);
      }
      expect(results).toEqual(['a', 'b', 'c']);
    });

    test('yields empty iterable', async () => {
      const source = iterable([]);
      const results: number[] = [];
      for await (const v of source()) {
        results.push(v);
      }
      expect(results).toEqual([]);
    });

    test('has correct _type and _name', () => {
      const source = iterable([1, 2, 3]);
      expect((source as any)._type).toBe('GenFactoryNoInput');
      expect((source as any)._name).toBe('fromIterable');
    });

    test('works with Set', async () => {
      const source = iterable(new Set([1, 2, 3]));
      const results: number[] = [];
      for await (const v of source()) {
        results.push(v);
      }
      expect(results).toEqual([1, 2, 3]);
    });

    test('works with Map values', async () => {
      const map = new Map([['a', 1], ['b', 2], ['c', 3]]);
      const source = iterable(map.values());
      const results: number[] = [];
      for await (const v of source()) {
        results.push(v);
      }
      expect(results).toEqual([1, 2, 3]);
    });
  });
});
