import { describe, test, expect } from 'vitest';
import { boolean, number, string } from '../../src/from/index.js';
import { toArray } from '../../src/to-array.js';

describe('rx/from/primitives', () => {
  describe('boolean', () => {
    test('creates reactive with initial value', () => {
      const b = boolean(true);
      expect(b.last()).toBe(true);
    });

    test('creates reactive without initial value', () => {
      const b = boolean();
      expect(b.last()).toBeUndefined();
    });

    test('set updates value and emits', () => {
      const b = boolean(false);
      const values: boolean[] = [];

      b.onValue(v => values.push(v));

      b.set(true);
      b.set(false);
      b.set(true);

      expect(values).toEqual([true, false, true]);
      expect(b.last()).toBe(true);
    });

  test('set emits new value', () => {
    const b = boolean(false);
    const values: boolean[] = [];

    b.onValue(v => values.push(v));

    b.set(true);
    b.set(false);
    b.set(true);

    expect(values).toEqual([true, false, true]);
    expect(b.last()).toBe(true);
  });

    test('multiple subscribers receive updates', () => {
      const b = boolean(false);
      const values1: boolean[] = [];
      const values2: boolean[] = [];

      b.onValue(v => values1.push(v));
      b.onValue(v => values2.push(v));

      b.set(true);
      b.set(false);

      expect(values1).toEqual([true, false]);
      expect(values2).toEqual([true, false]);
    });

    test('unsubscribe stops receiving updates', () => {
      const b = boolean(false);
      const values: boolean[] = [];

      const unsub = b.onValue(v => values.push(v));

      b.set(true);
      unsub();
      b.set(false);

      expect(values).toEqual([true]);
    });

    test('dispose marks as disposed', () => {
      const b = boolean(true);

      expect(b.isDisposed()).toBe(false);
      b.dispose('test');
      expect(b.isDisposed()).toBe(true);
    });

    test('toggle switches value', () => {
      const b = boolean(true);
      const values: boolean[] = [];

      b.onValue(v => values.push(v));

      b.set(!b.last());
      b.set(!b.last());

      expect(values).toEqual([false, true]);
    });
  });

  describe('number', () => {
    test('creates reactive with initial value', () => {
      const n = number(42);
      expect(n.last()).toBe(42);
    });

    test('creates reactive without initial value', () => {
      const n = number();
      expect(n.last()).toBeUndefined();
    });

    test('set updates value and emits', () => {
      const n = number(0);
      const values: number[] = [];

      n.onValue(v => values.push(v));

      n.set(10);
      n.set(20);
      n.set(30);

      expect(values).toEqual([10, 20, 30]);
      expect(n.last()).toBe(30);
    });

  test('set emits new value', () => {
    const n = number(0);
    const values: number[] = [];

    n.onValue(v => values.push(v));

    n.set(10);
    n.set(20);
    n.set(30);

    expect(values).toEqual([10, 20, 30]);
    expect(n.last()).toBe(30);
  });

    test('multiple subscribers receive updates', () => {
      const n = number(0);
      const values1: number[] = [];
      const values2: number[] = [];

      n.onValue(v => values1.push(v));
      n.onValue(v => values2.push(v));

      n.set(1);
      n.set(2);

      expect(values1).toEqual([1, 2]);
      expect(values2).toEqual([1, 2]);
    });

    test('unsubscribe stops receiving updates', () => {
      const n = number(0);
      const values: number[] = [];

      const unsub = n.onValue(v => values.push(v));

      n.set(1);
      unsub();
      n.set(2);

      expect(values).toEqual([1]);
    });

    test('dispose marks as disposed', () => {
      const n = number(10);

      expect(n.isDisposed()).toBe(false);
      n.dispose('test');
      expect(n.isDisposed()).toBe(true);
    });

    test('handles numeric operations', () => {
      const n = number(0);
      const values: number[] = [];

      n.onValue(v => values.push(v));

      n.set(n.last()! + 5);
      n.set(n.last()! * 2);

      expect(values).toEqual([5, 10]);
    });
  });

  describe('string', () => {
    test('creates reactive with initial value', () => {
      const s = string('hello');
      expect(s.last()).toBe('hello');
    });

    test('creates reactive without initial value', () => {
      const s = string();
      expect(s.last()).toBeUndefined();
    });

    test('set updates value and emits', () => {
      const s = string('initial');
      const values: string[] = [];

      s.onValue(v => values.push(v));

      s.set('hello');
      s.set('world');

      expect(values).toEqual(['hello', 'world']);
      expect(s.last()).toBe('world');
    });

  test('set emits new value', () => {
    const s = string('initial');
    const values: string[] = [];

    s.onValue(v => values.push(v));

    s.set('hello');
    s.set('world');

    expect(values).toEqual(['hello', 'world']);
    expect(s.last()).toBe('world');
  });

    test('multiple subscribers receive updates', () => {
      const s = string('a');
      const values1: string[] = [];
      const values2: string[] = [];

      s.onValue(v => values1.push(v));
      s.onValue(v => values2.push(v));

      s.set('b');
      s.set('c');

      expect(values1).toEqual(['b', 'c']);
      expect(values2).toEqual(['b', 'c']);
    });

    test('unsubscribe stops receiving updates', () => {
      const s = string('a');
      const values: string[] = [];

      const unsub = s.onValue(v => values.push(v));

      s.set('b');
      unsub();
      s.set('c');

      expect(values).toEqual(['b']);
    });

    test('dispose marks as disposed', () => {
      const s = string('test');

      expect(s.isDisposed()).toBe(false);
      s.dispose('test');
      expect(s.isDisposed()).toBe(true);
    });

    test('handles string concatenation', () => {
      const s = string('hello');
      const values: string[] = [];

      s.onValue(v => values.push(v));

      s.set(s.last() + ' world');
      s.set(s.last() + '!');

      expect(values).toEqual(['hello world', 'hello world!']);
    });
  });
});
