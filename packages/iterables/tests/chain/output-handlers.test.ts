import { describe, test, expect } from 'vitest';
import { asArray } from '../../src/chain/as-array.js';
import { asValue } from '../../src/chain/as-value.js';
import { asPromise } from '../../src/chain/as-promise.js';
import { sleep } from '@ixfx/core';

describe('chain output handlers', () => {
  describe('asArray', () => {
    test('converts generator to array', async () => {
      async function* gen() {
        yield 1;
        yield 2;
        yield 3;
      }
      
      const result = await asArray(gen());
      expect(result).toEqual([1, 2, 3]);
    });

    test('converts GenFactoryNoInput to array', async () => {
      async function* inner() {
        yield 'a';
        yield 'b';
      }
      function factory() {
        return inner();
      }
      (factory as any)._type = 'GenFactoryNoInput';
      
      const result = await asArray(factory as any);
      expect(result).toEqual(['a', 'b']);
    });

    test('respects limit option', async () => {
      async function* gen() {
        yield 1;
        yield 2;
        yield 3;
        yield 4;
        yield 5;
      }
      
      const result = await asArray(gen(), { limit: 3 });
      expect(result).toEqual([1, 2, 3]);
    });

    test('handles empty generator', async () => {
      async function* gen() {}
      
      const result = await asArray(gen());
      expect(result).toEqual([]);
    });

    test('respects elapsed option', async () => {
      async function* slowGen() {
        yield 1;
        await sleep(100);
        yield 2;
        await sleep(100);
        yield 3;
      }
      
      const start = Date.now();
      const result = await asArray(slowGen(), { elapsed: 50 });
      const elapsed = Date.now() - start;
      
      // Should stop early due to elapsed timeout
      expect(elapsed).toBeLessThan(200);
    });
  });

  describe('asValue', () => {
    test('returns function that gets latest value', async () => {
      async function* gen() {
        yield 1;
        yield 2;
        yield 3;
      }
      
      const getValue = asValue(gen());
      
      // Initial call should return undefined (no value yet)
      expect(getValue()).toBeUndefined();
      
      // Wait for first value
      await sleep(10);
      const val1 = getValue();
      expect(val1).toBe(1);
      
      // Wait a bit more
      await sleep(10);
      const val2 = getValue();
      expect([1, 2, 3]).toContain(val2);
    });

    test('uses initialValue when no value emitted', () => {
      async function* gen() {
        yield 1;
      }
      
      const getValue = asValue(gen(), 42);
      
      // Before any value is fetched, should return initialValue
      const firstCall = getValue();
      expect(firstCall).toBe(42);
    });

    test('works with GenFactoryNoInput', async () => {
      async function* inner() {
        yield 'test';
      }
      function factory() {
        return inner();
      }
      (factory as any)._type = 'GenFactoryNoInput';
      
      const getValue = asValue(factory as any, 'initial');
      expect(getValue()).toBe('initial');
      
      await sleep(10);
      expect(getValue()).toBe('test');
    });
  });

  describe('asPromise', () => {
    test('returns function that returns promise for next value', async () => {
      async function* gen() {
        yield 1;
        yield 2;
        yield 3;
      }
      
      const getNext = asPromise(gen());
      
      const val1 = await getNext();
      expect(val1).toBe(1);
      
      const val2 = await getNext();
      expect(val2).toBe(2);
      
      const val3 = await getNext();
      expect(val3).toBe(3);
    });

    test('returns undefined when generator done', async () => {
      async function* gen() {
        yield 1;
      }
      
      const getNext = asPromise(gen());
      
      const val1 = await getNext();
      expect(val1).toBe(1);
      
      const val2 = await getNext();
      expect(val2).toBeUndefined();
    });

    test('works with GenFactoryNoInput', async () => {
      async function* inner() {
        yield 'value';
      }
      function factory() {
        return inner();
      }
      (factory as any)._type = 'GenFactoryNoInput';
      
      const getNext = asPromise(factory as any);
      const val = await getNext();
      expect(val).toBe('value');
    });
  });
});
