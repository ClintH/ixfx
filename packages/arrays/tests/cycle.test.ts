/* eslint-disable @typescript-eslint/ban-ts-comment */
import { describe, test, expect } from 'vitest';
import * as Arrays from '../src/index.js';

describe('cycle', () => {
  test('basic navigation', () => {
    const c1 = Arrays.cycle(`apples oranges pears`.split(` `));
    expect(c1.toArray()).toStrictEqual([`apples`, `oranges`, `pears`]);
    expect(c1.current).toEqual(`apples`);

    expect(c1.next()).toEqual(`oranges`);
    expect(c1.current).toEqual(`oranges`);

    expect(c1.next()).toEqual(`pears`);
    expect(c1.current).toEqual(`pears`);

    expect(c1.next()).toEqual(`apples`);
    expect(c1.current).toEqual(`apples`);

    expect(c1.prev()).toEqual(`pears`);
    expect(c1.current).toEqual(`pears`);
  });

  test('select by value', () => {
    const c = Arrays.cycle(['a', 'b', 'c']);
    c.select('b');
    expect(c.current).toBe('b');
    
    // Select to first occurrence
    const c2 = Arrays.cycle(['a', 'b', 'a', 'c']);
    c2.select('a');
    expect(c2.current).toBe('a');
  });

  test('select by index', () => {
    const c = Arrays.cycle(['a', 'b', 'c', 'd']);
    c.select(2);
    expect(c.current).toBe('c');
    
    c.select(0);
    expect(c.current).toBe('a');
  });

  test('select then next works from new position', () => {
    const c = Arrays.cycle(['a', 'b', 'c', 'd']);
    c.select(2); // at c
    expect(c.next()).toBe('d');
    expect(c.next()).toBe('a'); // wraps
  });

  test('wraps correctly', () => {
    const c = Arrays.cycle([1, 2]);
    expect(c.next()).toBe(2);
    expect(c.next()).toBe(1); // wrap
    expect(c.next()).toBe(2); // wrap again
    expect(c.prev()).toBe(1);
    expect(c.prev()).toBe(2); // wrap back
  });

  test('single element cycles to itself', () => {
    const c = Arrays.cycle([42]);
    expect(c.current).toBe(42);
    expect(c.next()).toBe(42);
    expect(c.next()).toBe(42);
    expect(c.prev()).toBe(42);
  });

  test('works with copy of array', () => {
    const original = ['a', 'b', 'c'];
    const c = Arrays.cycle(original);
    
    original.push('d');
    expect(c.toArray()).toEqual(['a', 'b', 'c']);
  });

  test('toArray returns copy', () => {
    const c = Arrays.cycle(['a', 'b', 'c']);
    const arr = c.toArray();
    arr.push('d');
    expect(c.toArray()).toEqual(['a', 'b', 'c']);
  });

  test('works with objects', () => {
    const items = [{ id: 1 }, { id: 2 }];
    const c = Arrays.cycle(items);
    expect(c.current).toEqual({ id: 1 });
  });

  test('error handling', () => {
    // @ts-expect-error
    expect(() => Arrays.cycle({ hello: `there` })).toThrow();
    // @ts-expect-error
    expect(() => Arrays.cycle(false)).toThrow();
    // Note: empty array [] does not throw - it works but has no elements to cycle
    // @ts-expect-error
    expect(() => Arrays.cycle(null)).toThrow();
    // @ts-expect-error
    expect(() => Arrays.cycle(undefined)).toThrow();
  });

  test('select throws when value not found', () => {
    const c = Arrays.cycle(['a', 'b', 'c']);
    expect(() => c.select('z')).toThrow('Could not find value');
  });
});
