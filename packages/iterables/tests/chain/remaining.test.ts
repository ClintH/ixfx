import { describe, test, expect } from 'vitest';
import { addToArray } from '../../src/chain/add-to-array.js';
import { asCallback } from '../../src/chain/as-callback.js';
import { timestamp } from '../../src/chain/from/ticks.js';

describe('chain remaining files', () => {
  describe('addToArray', () => {
    test('adds values to array', async () => {
      const target: number[] = [];
      
      async function* gen() {
        yield 1;
        yield 2;
        yield 3;
      }
      
      await addToArray(target, gen());
      
      expect(target).toEqual([1, 2, 3]);
    });

    test('works with GenFactoryNoInput', async () => {
      const target: string[] = [];
      
      async function* inner() {
        yield 'a';
        yield 'b';
      }
      function factory() {
        return inner();
      }
      (factory as any)._type = 'GenFactoryNoInput';
      
      await addToArray(target, factory as any);
      
      expect(target).toEqual(['a', 'b']);
    });

    test('handles empty generator', async () => {
      const target: number[] = [];
      
      async function* gen() {}
      
      await addToArray(target, gen());
      
      expect(target).toEqual([]);
    });

    test('preserves existing array items', async () => {
      const target = [0];
      
      async function* gen() {
        yield 1;
        yield 2;
      }
      
      await addToArray(target, gen());
      
      expect(target).toEqual([0, 1, 2]);
    });
  });

  describe('asCallback', () => {
    test('calls callback for each value', async () => {
      const values: number[] = [];
      
      async function* gen() {
        yield 1;
        yield 2;
        yield 3;
      }
      
      await asCallback(gen(), (v) => values.push(v));
      
      expect(values).toEqual([1, 2, 3]);
    });

    test('calls onDone when complete', async () => {
      let doneCalled = false;
      
      async function* gen() {
        yield 1;
      }
      
      await asCallback(gen(), () => {}, () => doneCalled = true);
      
      expect(doneCalled).toBe(true);
    });

    test('handles arrays', async () => {
      const values: string[] = [];
      
      await asCallback(['a', 'b', 'c'], (v) => values.push(v));
      
      expect(values).toEqual(['a', 'b', 'c']);
    });

    test('handles GenFactoryNoInput', async () => {
      const values: number[] = [];
      
      async function* inner() {
        yield 10;
        yield 20;
      }
      function factory() {
        return inner();
      }
      (factory as any)._type = 'GenFactoryNoInput';
      
      await asCallback(factory as any, (v: number) => values.push(v));
      
      expect(values).toEqual([10, 20]);
    });
  });

  describe('timestamp', () => {
    test('generates timestamps with elapsed time', async () => {
      const source = timestamp({ interval: 10, loops: 3 });
      const results: number[] = [];
      
      for await (const v of source()) {
        results.push(v as number);
      }
      
      expect(results).toHaveLength(3);
      expect(results[0]).toBeGreaterThanOrEqual(0);
    });

    test('generates clock time when asClockTime is true', async () => {
      const source = timestamp({ interval: 10, loops: 2, asClockTime: true });
      const results: number[] = [];
      
      for await (const v of source()) {
        results.push(v);
      }
      
      expect(results).toHaveLength(2);
      // Should be actual timestamps (large numbers)
      expect(results[0]).toBeGreaterThan(1700000000000);
    });

    test('has correct _type and _name', () => {
      const source = timestamp({ interval: 100 });
      expect((source as any)._type).toBe('GenFactoryNoInput');
      expect((source as any)._name).toBe('timestamp');
    });

    test('respects elapsed option', async () => {
      const start = Date.now();
      const source = timestamp({ interval: 50, elapsed: 100 });
      const results: number[] = [];
      
      for await (const v of source()) {
        results.push(v);
      }
      
      const elapsed = Date.now() - start;
      // Should stop after ~100ms
      expect(elapsed).toBeLessThan(300);
    });

    test('respects loops option', async () => {
      const source = timestamp({ interval: 1, loops: 5 });
      const results: number[] = [];
      
      for await (const v of source()) {
        results.push(v);
      }
      
      expect(results).toHaveLength(5);
    });
  });
});
