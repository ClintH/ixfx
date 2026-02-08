import { describe, test, expect } from 'vitest';
import { withValue } from '../../src/ops/with-value.js';
import { manual } from '../../src/index.js';

describe('rx/ops/with-value', () => {
  test('provides initial value before any emissions', () => {
    const source = manual<number>();
    const withVal = withValue(source, { initial: 42 });

    // Can read initial value immediately
    expect(withVal.last()).toBe(42);
  });

  test('last() returns most recent value', () => {
    const source = manual<number>();
    const withVal = withValue(source, { initial: 0 });

    withVal.onValue(() => {});

    source.set(10);
    expect(withVal.last()).toBe(10);

    source.set(20);
    expect(withVal.last()).toBe(20);

    source.set(5);
    expect(withVal.last()).toBe(5);
  });

  test('emits values to subscribers', () => {
    const source = manual<number>();
    const withVal = withValue(source, { initial: 0 });

    const values: number[] = [];
    withVal.onValue((v) => values.push(v));

    source.set(1);
    source.set(2);
    source.set(3);

    expect(values).toEqual([1, 2, 3]);
  });

  test('works with string values', () => {
    const source = manual<string>();
    const withVal = withValue(source, { initial: 'start' });

    expect(withVal.last()).toBe('start');

    const values: string[] = [];
    withVal.onValue((v) => values.push(v));

    source.set('hello');
    source.set('world');

    expect(withVal.last()).toBe('world');
    expect(values).toEqual(['hello', 'world']);
  });

  test('works with object values', () => {
    const source = manual<{ x: number; y: number }>();
    const initial = { x: 0, y: 0 };
    const withVal = withValue(source, { initial });

    expect(withVal.last()).toEqual({ x: 0, y: 0 });

    withVal.onValue(() => {});

    source.set({ x: 10, y: 20 });
    expect(withVal.last()).toEqual({ x: 10, y: 20 });
  });

  test('last() can be called multiple times', () => {
    const source = manual<number>();
    const withVal = withValue(source, { initial: 100 });

    withVal.onValue(() => {});

    source.set(50);
    
    expect(withVal.last()).toBe(50);
    expect(withVal.last()).toBe(50);
    expect(withVal.last()).toBe(50);
  });

  test('handles initial undefined value', () => {
    const source = manual<string | undefined>();
    const withVal = withValue(source, { initial: undefined });

    expect(withVal.last()).toBeUndefined();

    const values: (string | undefined)[] = [];
    withVal.onValue((v) => values.push(v));

    source.set('test');
    expect(withVal.last()).toBe('test');
  });

});
