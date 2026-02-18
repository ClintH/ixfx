import { describe, test, expect } from 'vitest';
import { arrayObject } from '../../src/from/array-object.js';

describe('rx/from/array-object', () => {
  test('creates reactive array with initial value', () => {
    const arr = arrayObject([1, 2, 3]);

    expect(arr.last()).toEqual([1, 2, 3]);
  });

  test('set replaces entire array', () => {
    const arr = arrayObject([1, 2, 3]);
    const values: number[][] = [];

    arr.onValue(v => values.push(v));

    arr.set([4, 5, 6]);

    expect(values).toEqual([[4, 5, 6]]);
    expect(arr.last()).toEqual([4, 5, 6]);
  });

  test('push adds element to end', () => {
    const arr = arrayObject([1, 2]);
    const values: number[][] = [];
    const arrayChanges: any[] = [];

    arr.onValue(v => values.push(v));
    arr.onArray(v => arrayChanges.push(v));

    arr.push(3);
    arr.push(4);

    expect(values).toEqual([[1, 2, 3], [1, 2, 3, 4]]);
    expect(arr.last()).toEqual([1, 2, 3, 4]);
  });

  test('deleteAt removes element at index', () => {
    const arr = arrayObject([1, 2, 3]);
    const values: number[][] = [];

    arr.onValue(v => values.push(v));

    arr.deleteAt(1);

    expect(values).toEqual([[1, 3]]);
    expect(arr.last()).toEqual([1, 3]);
  });

  test('deleteWhere removes matching elements', () => {
    const arr = arrayObject([1, 2, 3, 2, 4]);
    const values: number[][] = [];

    arr.onValue(v => values.push(v));

    const count = arr.deleteWhere(v => v === 2);

    expect(count).toBe(2);
    expect(arr.last()).toEqual([1, 3, 4]);
  });

  test('array methods work correctly', () => {
    const arr = arrayObject([1]);

    arr.push(2);
    arr.push(3);
    arr.deleteAt(0);
    arr.insertAt(1, 5);

    expect(arr.last()?.length).toBe(3);
  });

  test('setAt updates element at index', () => {
    const arr = arrayObject([1, 2, 3]);
    const values: number[][] = [];

    arr.onValue(v => values.push(v));

    arr.setAt(1, 999);

    expect(arr.last()).toEqual([1, 999, 3]);
  });

  test('onArray receives change records', () => {
    const arr = arrayObject([1, 2]);
    const changes: any[] = [];

    arr.onArray(v => changes.push(v));

    arr.push(3);
    arr.deleteAt(0);
    arr.insertAt(1, 5);

    expect(changes.length).toBeGreaterThan(0);
  });

  test('multiple subscribers receive updates', () => {
    const arr = arrayObject([1, 2]);
    const values1: number[][] = [];
    const values2: number[][] = [];

    arr.onValue(v => values1.push(v));
    arr.onValue(v => values2.push(v));

    arr.push(3);

    expect(values1).toEqual([[1, 2, 3]]);
    expect(values2).toEqual([[1, 2, 3]]);
  });

  test('unsubscribe stops receiving updates', () => {
    const arr = arrayObject([1, 2]);
    const values: number[][] = [];

    const unsub = arr.onValue(v => values.push(v));

    arr.push(3);
    unsub();
    arr.push(4);

    expect(values).toEqual([[1, 2, 3]]);
  });

  test('dispose marks as disposed', () => {
    const arr = arrayObject([1, 2]);

    expect(arr.isDisposed()).toBe(false);
    arr.dispose('test');
    expect(arr.isDisposed()).toBe(true);
  });

  test('empty array', () => {
    const arr = arrayObject<number>([]);

    expect(arr.last()).toEqual([]);
  });

  test('array methods work correctly', () => {
    const arr = arrayObject([1]);

    arr.push(2);
    arr.push(3);
    arr.deleteAt(0);
    arr.insertAt(1, 5);

    expect(arr.last()?.length).toBe(3);
  });
});
