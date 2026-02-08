import { describe, test, expect } from 'vitest';
import { combineLatestToObject } from '../../src/ops/combine-latest-to-object.js';
import { manual } from '../../src/index.js';

describe('rx/ops/combine-latest-to-object', () => {
  test('combines sources into object', () => {
    const sourceA = manual<number>();
    const sourceB = manual<string>();

    const combined = combineLatestToObject({ a: sourceA, b: sourceB });

    const values: Array<{ a?: number; b?: string }> = [];
    combined.onValue((v) => values.push(v));

    sourceA.set(1);
    expect(values[values.length - 1]).toEqual({ a: 1 });

    sourceB.set('hello');
    expect(values[values.length - 1]).toEqual({ a: 1, b: 'hello' });
  });

  test('emits whenever any source updates', () => {
    const sourceX = manual<number>();
    const sourceY = manual<number>();

    const combined = combineLatestToObject({ x: sourceX, y: sourceY });

    const values: Array<{ x?: number; y?: number }> = [];
    combined.onValue((v) => values.push(v));

    sourceX.set(1);
    sourceY.set(2);
    sourceX.set(10);
    sourceY.set(20);

    expect(values).toEqual([
      { x: 1 },
      { x: 1, y: 2 },
      { x: 10, y: 2 },
      { x: 10, y: 20 }
    ]);
  });

  test('provides last() method to read current values', () => {
    const sourceA = manual<number>();
    const sourceB = manual<string>();

    const combined = combineLatestToObject({ a: sourceA, b: sourceB });

    combined.onValue(() => {});

    sourceA.set(42);
    sourceB.set('test');

    const lastValue = combined.last();
    expect(lastValue).toEqual({ a: 42, b: 'test' });
  });

  test('provides hasSource method', () => {
    const sourceA = manual<number>();
    const sourceB = manual<string>();

    const combined = combineLatestToObject({ a: sourceA, b: sourceB });

    expect(combined.hasSource('a')).toBe(true);
    expect(combined.hasSource('b')).toBe(true);
    expect(combined.hasSource('c')).toBe(false);
  });

  test('provides setWith method to update writable sources', () => {
    const sourceA = manual<number>();
    const sourceB = manual<string>();

    const combined = combineLatestToObject({ a: sourceA, b: sourceB });

    combined.onValue(() => {});

    const result = combined.setWith({ a: 100 });
    expect(result).toEqual({ a: 100 });

    const lastValue = combined.last();
    expect(lastValue.a).toBe(100);
  });

  test('provides replaceSource method', () => {
    const sourceA = manual<number>();
    const sourceB = manual<string>();

    const combined = combineLatestToObject({ a: sourceA, b: sourceB });

    combined.onValue(() => {});

    const newSource = manual<number>();
    combined.replaceSource('a', newSource);

    newSource.set(999);
    const lastValue = combined.last();
    expect(lastValue.a).toBe(999);
  });

  test('disposes when a source completes', () => {
    const sourceA = manual<number>();
    const sourceB = manual<string>();

    const combined = combineLatestToObject({ a: sourceA, b: sourceB });

    combined.on(() => {});

    expect(combined.isDisposed()).toBe(false);

    sourceA.dispose('done');

    expect(combined.isDisposed()).toBe(true);
  });

  test('handles multiple fields', () => {
    const sources = {
      num: manual<number>(),
      str: manual<string>(),
      bool: manual<boolean>(),
      arr: manual<number[]>()
    };

    const combined = combineLatestToObject(sources);

    const values: Array<any> = [];
    combined.onValue((v) => values.push(v));

    sources.num.set(1);
    sources.str.set('test');
    sources.bool.set(true);
    sources.arr.set([1, 2, 3]);

    expect(values[values.length - 1]).toEqual({
      num: 1,
      str: 'test',
      bool: true,
      arr: [1, 2, 3]
    });
  });
});
