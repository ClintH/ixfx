import { describe, test, expect } from 'vitest';
import { combineLatestToArray } from '../../src/ops/combine-latest-to-array.js';
import { manual } from '../../src/index.js';

describe('rx/ops/combine-latest-to-array', () => {
  test('combines multiple sources into array', () => {
    const source1 = manual<number>();
    const source2 = manual<string>();
    const source3 = manual<boolean>();

    const combined = combineLatestToArray([source1, source2, source3]);

    const values: Array<[number | undefined, string | undefined, boolean | undefined]> = [];
    combined.onValue((v) => values.push(v));

    // No initial emission until a value is set
    expect(values).toHaveLength(0);

    source1.set(1);
    expect(values[values.length - 1]).toEqual([1, undefined, undefined]);

    source2.set('hello');
    expect(values[values.length - 1]).toEqual([1, 'hello', undefined]);

    source3.set(true);
    expect(values[values.length - 1]).toEqual([1, 'hello', true]);
  });

  test('emits whenever any source updates', () => {
    const source1 = manual<number>();
    const source2 = manual<number>();

    const combined = combineLatestToArray([source1, source2]);

    const values: Array<[number | undefined, number | undefined]> = [];
    combined.onValue((v) => values.push(v));

    source1.set(1);
    source2.set(2);
    source1.set(10);
    source2.set(20);

    expect(values).toEqual([
      [1, undefined],
      [1, 2],
      [10, 2],
      [10, 20]
    ]);
  });

  test('disposes when a source completes with break option', () => {
    const source1 = manual<number>();
    const source2 = manual<number>();

    const combined = combineLatestToArray([source1, source2], { onSourceDone: 'break' });

    combined.on(() => {});
    source1.set(1);
    source2.set(2);

    expect(combined.isDisposed()).toBe(false);

    source1.dispose('done');

    expect(combined.isDisposed()).toBe(true);
  });

  test('continues when a source completes with allow option', () => {
    const source1 = manual<number>();
    const source2 = manual<number>();

    const combined = combineLatestToArray([source1, source2], { onSourceDone: 'allow' });

    const values: Array<[number | undefined, number | undefined]> = [];
    combined.onValue((v) => values.push(v));

    source1.set(1);
    source2.set(2);

    source1.dispose('done');

    // Combined should not be disposed
    expect(combined.isDisposed()).toBe(false);

    // Other source can still emit
    source2.set(20);
    expect(values[values.length - 1]).toEqual([1, 20]);
  });

  test('disposes when all sources complete with allow option', () => {
    const source1 = manual<number>();
    const source2 = manual<number>();

    const combined = combineLatestToArray([source1, source2], { onSourceDone: 'allow' });

    combined.on(() => {});

    source1.dispose('done1');
    expect(combined.isDisposed()).toBe(false);

    source2.dispose('done2');
    expect(combined.isDisposed()).toBe(true);
  });

  test('works with array sources', async () => {
    const arr1 = [1, 2, 3];
    const arr2 = ['a', 'b'];

    const combined = combineLatestToArray([arr1, arr2]);

    const values: any[] = [];
    combined.onValue((v) => values.push(v));

    // Array sources emit immediately - give time for async processing
    await new Promise(resolve => setTimeout(resolve, 10));

    expect(values.length).toBeGreaterThan(0);
    // The arrays should be in the result
    expect(values[0]).toBeDefined();
  });

  test('handles single source', () => {
    const source = manual<number>();

    const combined = combineLatestToArray([source]);

    const values: Array<[number | undefined]> = [];
    combined.onValue((v) => values.push(v));

    source.set(42);
    expect(values[values.length - 1]).toEqual([42]);
  });

  test('handles many sources', () => {
    const sources = [
      manual<number>(),
      manual<number>(),
      manual<number>(),
      manual<number>(),
      manual<number>()
    ];

    const combined = combineLatestToArray(sources);

    const values: number[][] = [];
    combined.onValue((v) => values.push(v as number[]));

    sources.forEach((src, i) => src.set(i));

    expect(values[values.length - 1]).toEqual([0, 1, 2, 3, 4]);
  });
});
