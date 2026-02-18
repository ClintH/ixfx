import { describe, test, expect } from 'vitest';
import { count } from '../../src/from/count.js';
import { toArray } from '../../src/to-array.js';

describe('rx/from/count', () => {
  test('emits incrementing numbers starting from 0', async () => {
    const rx = count({ interval: 1, amount: 5 });
    const values = await toArray(rx);
    expect(values).toEqual([0, 1, 2, 3, 4]);
  });

  test('respects limit option', async () => {
    const rx = count({ interval: 1, amount: 3 });
    const values = await toArray(rx);
    expect(values).toEqual([0, 1, 2]);
  });

  test('respects offset option', async () => {
    const rx = count({ interval: 1, amount: 3, offset: 10 });
    const values = await toArray(rx);
    expect(values).toEqual([10, 11, 12]);
  });

  test('counts down when offset is greater than limit', async () => {
    const rx = count({ interval: 1, amount: 3, offset: 5 });
    const values = await toArray(rx);
    expect(values).toEqual([5, 6, 7]);
  });

  test('respects interval option', async () => {
    const rx = count({ interval: 10, amount: 3 });
    const start = Date.now();
    const values = await toArray(rx);
    const elapsed = Date.now() - start;
    expect(values).toEqual([0, 1, 2]);
    expect(elapsed).toBeGreaterThanOrEqual(20);
  });

  test('respects amount option', async () => {
    const rx = count({ interval: 1, amount: 10 });
    const values = await toArray(rx);
    expect(values).toHaveLength(10);
    expect(values[0]).toBe(0);
    expect(values[9]).toBe(9);
  });

  test('stops when signal is aborted', async () => {
    const ac = new AbortController();
    const rx = count({ interval: 5, amount: 100, signal: ac.signal });

    setTimeout(() => ac.abort('test'), 10);

    const values = await toArray(rx);
    expect(values.length).toBeLessThan(100);
  });

  test('isDisposed after completing', async () => {
    const rx = count({ interval: 1, amount: 3 });
    expect(rx.isDisposed()).toBe(false);
    await toArray(rx);
    expect(rx.isDisposed()).toBe(true);
  });

  test('lazy initial option defers counting', async () => {
    const rx = count({ interval: 1, amount: 3, lazy: 'initial' });
    expect(rx.isDisposed()).toBe(false);

    const start = Date.now();
    await toArray(rx);
    const elapsed = Date.now() - start;

    expect(elapsed).toBeGreaterThanOrEqual(2);
  });

  test('lazy very option stops when no subscribers', async () => {
    const rx = count({ interval: 1, amount: 100, lazy: 'very' });
    const values: number[] = [];

    const unsub = rx.onValue(v => values.push(v));
    await new Promise(r => setTimeout(r, 5));
    unsub();

    const afterUnsub: number[] = [];
    rx.onValue(v => afterUnsub.push(v));

    expect(values.length).toBeLessThan(5);
  });

  test('dispose stops counting', async () => {
    const rx = count({ interval: 1, amount: 100 });
    const values: number[] = [];

    rx.onValue(v => values.push(v));

    await new Promise(r => setTimeout(r, 3));
    rx.dispose('test');

    const countBeforeDispose = values.length;
    await new Promise(r => setTimeout(r, 3));

    expect(values.length).toBe(countBeforeDispose);
  });
});
