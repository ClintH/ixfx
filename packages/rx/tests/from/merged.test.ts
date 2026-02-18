import { describe, test, expect } from 'vitest';
import { merged, mergedWithOptions } from '../../src/from/merged.js';
import { number } from '../../src/from/number.js';
import { toArray } from '../../src/to-array.js';
import { manual } from '../../src/index.js';

describe('rx/from/merged', () => {
  test('merges values from multiple sources', async () => {
    const s1 = manual<number>();
    const s2 = manual<number>();

    const merged$ = merged(s1, s2);
    const values: number[] = [];

    merged$.onValue(v => values.push(v));

    s1.set(1);
    s2.set(2);
    s1.set(3);

    expect(values).toEqual([1, 2, 3]);
  });

  test('mergedWithOptions works the same', async () => {
    const s1 = manual<number>();
    const s2 = manual<number>();

    const merged$ = mergedWithOptions([s1, s2]);
    const values: number[] = [];

    merged$.onValue(v => values.push(v));

    s1.set(10);
    s2.set(20);

    expect(values).toEqual([10, 20]);
  });

  test('merges string values', async () => {
    const s1 = manual<string>();
    const s2 = manual<string>();

    const merged$ = merged(s1, s2);
    const values: string[] = [];

    merged$.onValue(v => values.push(v));

    s1.set('a');
    s2.set('b');
    s1.set('c');

    expect(values).toEqual(['a', 'b', 'c']);
  });

  test('merges boolean values', async () => {
    const s1 = manual<boolean>();
    const s2 = manual<boolean>();

    const merged$ = merged(s1, s2);
    const values: boolean[] = [];

    merged$.onValue(v => values.push(v));

    s1.set(true);
    s2.set(false);
    s1.set(false);

    expect(values).toEqual([true, false, false]);
  });

  test('empty merge returns no values', async () => {
    const merged$ = merged<number>();
    const values: number[] = [];

    merged$.onValue(v => values.push(v));

    expect(values).toEqual([]);
  });

  test('single source merge', async () => {
    const s1 = manual<number>();

    const merged$ = merged(s1);
    const values: number[] = [];

    merged$.onValue(v => values.push(v));

    s1.set(1);
    s1.set(2);

    expect(values).toEqual([1, 2]);
  });

  test('multiple subscribers receive values', async () => {
    const s1 = manual<number>();
    const s2 = manual<number>();

    const merged$ = merged(s1, s2);
    const values1: number[] = [];
    const values2: number[] = [];

    merged$.onValue(v => values1.push(v));
    merged$.onValue(v => values2.push(v));

    s1.set(1);
    s2.set(2);

    expect(values1).toEqual([1, 2]);
    expect(values2).toEqual([1, 2]);
  });

  test('unsubscribe stops receiving updates', async () => {
    const s1 = manual<number>();
    const s2 = manual<number>();

    const merged$ = merged(s1, s2);
    const values: number[] = [];

    const unsub = merged$.onValue(v => values.push(v));

    s1.set(1);
    unsub();
    s2.set(2);

    expect(values).toEqual([1]);
  });

  test('dispose marks as disposed', async () => {
    const s1 = manual<number>();
    const s2 = manual<number>();

    const merged$ = merged(s1, s2);

    expect(merged$.isDisposed()).toBe(false);
    merged$.dispose('test');
    expect(merged$.isDisposed()).toBe(true);
  });

  test('three source merge', async () => {
    const s1 = manual<number>();
    const s2 = manual<number>();
    const s3 = manual<number>();

    const merged$ = merged(s1, s2, s3);
    const values: number[] = [];

    merged$.onValue(v => values.push(v));

    s1.set(1);
    s2.set(2);
    s3.set(3);

    expect(values).toEqual([1, 2, 3]);
  });

  test('many source merge', async () => {
    const sources = Array.from({ length: 5 }, () => manual<number>());
    const merged$ = merged(...sources);
    const values: number[] = [];

    merged$.onValue(v => values.push(v));

    sources.forEach((s, i) => s.set(i + 1));

    expect(values).toEqual([1, 2, 3, 4, 5]);
  });

  test('lazy option defers subscription', async () => {
    const s1 = manual<number>();

    const merged$ = mergedWithOptions([s1], { lazy: 'initial' });
    const values: number[] = [];

    merged$.onValue(v => values.push(v));

    s1.set(1);

    expect(values).toEqual([1]);
  });
});
