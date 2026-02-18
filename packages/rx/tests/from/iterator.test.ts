import { describe, test, expect } from 'vitest';
import { iterator } from '../../src/from/iterator.js';
import { toArray } from '../../src/to-array.js';

describe('rx/from/iterator', () => {
  test('emits values from generator', async () => {
    function* gen() {
      yield 1;
      yield 2;
      yield 3;
    }

    const rx = iterator(gen());
    const values = await toArray(rx);
    expect(values).toEqual([1, 2, 3]);
  });

  test('emits values from async generator', async () => {
    async function* gen() {
      yield 10;
      yield 20;
      yield 30;
    }

    const rx = iterator(gen());
    const values = await toArray(rx);
    expect(values).toEqual([10, 20, 30]);
  });

  test('emits values from array', async () => {
    const rx = iterator([1, 2, 3]);
    const values = await toArray(rx);
    expect(values).toEqual([1, 2, 3]);
  });

  test('emits values from iterator', async () => {
    const arr = [1, 2, 3];
    const rx = iterator(arr[Symbol.iterator]());
    const values = await toArray(rx);
    expect(values).toEqual([1, 2, 3]);
  });

  test('emits string values', async () => {
    function* gen() {
      yield 'a';
      yield 'b';
      yield 'c';
    }

    const rx = iterator(gen());
    const values = await toArray(rx);
    expect(values).toEqual(['a', 'b', 'c']);
  });

  test('emits object values', async () => {
    function* gen() {
      yield { name: 'test' };
      yield { value: 42 };
    }

    const rx = iterator(gen());
    const values = await toArray(rx);
    expect(values).toEqual([{ name: 'test' }, { value: 42 }]);
  });

  test('isDisposed after completing', async () => {
    function* gen() {
      yield 1;
      yield 2;
    }

    const rx = iterator(gen());
    expect(rx.isDisposed()).toBe(false);
    await toArray(rx);
    expect(rx.isDisposed()).toBe(true);
  });

  test('dispose stops iteration', async () => {
    function* gen() {
      for (let i = 0; i < 100; i++) {
        yield i;
      }
    }

    const rx = iterator(gen());
    const values: number[] = [];

    rx.onValue(v => values.push(v));

    await new Promise(r => setTimeout(r, 10));
    rx.dispose('test');

    const countBeforeDispose = values.length;
    await new Promise(r => setTimeout(r, 10));

    expect(values.length).toBe(countBeforeDispose);
  });

  test('lazy very option defers iteration', async () => {
    function* gen() {
      yield 1;
      yield 2;
      yield 3;
    }

    const rx = iterator(gen(), { lazy: 'very' });
    expect(rx.isDisposed()).toBe(false);

    const start = Date.now();
    await toArray(rx);
    const elapsed = Date.now() - start;

    expect(elapsed).toBeGreaterThanOrEqual(3);
  });

  test('respects signal option', async () => {
    const ac = new AbortController();
    function* gen() {
      for (let i = 0; i < 100; i++) {
        yield i;
      }
    }

    const rx = iterator(gen(), { signal: ac.signal });
    const values: number[] = [];

    rx.onValue(v => values.push(v));

    setTimeout(() => ac.abort('test'), 10);
    await new Promise(r => setTimeout(r, 20));

    expect(values.length).toBeLessThan(100);
  });

  test('empty generator emits nothing', async () => {
    function* gen() {
    }

    const rx = iterator(gen());
    const values = await toArray(rx);
    expect(values).toEqual([]);
  });

  test('single value generator', async () => {
    function* gen() {
      yield 42;
    }

    const rx = iterator(gen());
    const values = await toArray(rx);
    expect(values).toEqual([42]);
  });

  test('multiple subscribers receive values', async () => {
    function* gen() {
      yield 1;
      yield 2;
    }

    const rx = iterator(gen());
    const values1: number[] = [];
    const values2: number[] = [];

    rx.onValue(v => values1.push(v));
    rx.onValue(v => values2.push(v));

    await toArray(rx);

    expect(values1).toEqual([1, 2]);
    expect(values2).toEqual([1, 2]);
  });
});
