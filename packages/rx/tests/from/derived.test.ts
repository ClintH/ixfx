import { describe, test, expect } from 'vitest';
import { derived } from '../../src/from/derived.js';
import { manual } from '../../src/index.js';
import type { Reactive } from '../../src/types.js';

describe('rx/from/derived', () => {
  test('emits when source changes', async () => {
    const a = manual<number>();

    const doubled = derived<number, Record<string, Reactive<any>>>((combined) => {
      return (combined.a as number) * 2;
    }, { a });

    const values: number[] = [];
    doubled.onValue(v => values.push(v));

    a.set(5);
    a.set(10);

    expect(values).toContain(10);
    expect(values).toContain(20);
  });

  test('ignoreIdentical option prevents duplicate emissions', async () => {
    const a = manual<number>();

    const identity = derived<number, Record<string, Reactive<any>>>((combined) => {
      return combined.a as number;
    }, { a }, { ignoreIdentical: true });

    const values: number[] = [];
    identity.onValue(v => values.push(v));

    a.set(10);
    a.set(10);
    a.set(10);

    expect(values).toHaveLength(1);
  });

  test('multiple subscribers receive updates', async () => {
    const a = manual<number>();

    const doubled = derived<number, Record<string, Reactive<any>>>((combined) => {
      return (combined.a as number) * 2;
    }, { a });

    const values1: number[] = [];
    const values2: number[] = [];

    doubled.onValue(v => values1.push(v));
    doubled.onValue(v => values2.push(v));

    a.set(5);

    expect(values1).toContain(10);
    expect(values2).toContain(10);
  });

  test('unsubscribe stops receiving updates', async () => {
    const a = manual<number>();

    const doubled = derived<number, Record<string, Reactive<any>>>((combined) => {
      return (combined.a as number) * 2;
    }, { a });

    const values: number[] = [];

    const unsub = doubled.onValue(v => values.push(v));

    a.set(5);
    unsub();
    a.set(10);

    expect(values).toEqual([10]);
  });

  test('dispose marks as disposed', async () => {
    const a = manual<number>();

    const doubled = derived<number, Record<string, Reactive<any>>>((combined) => {
      return (combined.a as number) * 2;
    }, { a });

    expect(doubled.isDisposed()).toBe(false);
    doubled.dispose('test');
    expect(doubled.isDisposed()).toBe(true);
  });

  test('derived with boolean sources', async () => {
    const flag = manual<boolean>();

    const negated = derived<boolean, Record<string, Reactive<any>>>((combined) => {
      return !(combined.flag as boolean);
    }, { flag });

    const values: boolean[] = [];
    negated.onValue(v => values.push(v));

    flag.set(true);
    flag.set(false);

    expect(values).toContain(false);
    expect(values).toContain(true);
  });

  test('computed value uses current source values', async () => {
    const x = manual<number>();
    const y = manual<number>();

    const sum = derived<number, Record<string, Reactive<any>>>((combined) => {
      return (combined.x as number) + (combined.y as number);
    }, { x, y });

    x.set(10);
    y.set(20);

    expect(sum.last()).toBe(30);
  });

  test('derived with three sources', async () => {
    const a = manual<number>();
    const b = manual<number>();
    const c = manual<number>();

    const total = derived<number, Record<string, Reactive<any>>>((combined) => {
      return (combined.a as number) + (combined.b as number) + (combined.c as number);
    }, { a, b, c });

    a.set(1);
    b.set(2);
    c.set(3);

    expect(total.last()).toBe(6);
  });

  test('derived returns undefined', async () => {
    const a = manual<number | undefined>();

    const maybe = derived<number | undefined, Record<string, Reactive<any>>>((combined) => {
      return combined.a as number | undefined;
    }, { a });

    expect(maybe.last()).toBeUndefined();
  });
});
