import { test, expect } from 'vitest';
import { immutable } from '../../src/map/map.js';

test(`immutableMap`, () => {
  const m = immutable();
  const m2 = m.add([ `apples`, 10 ]);
  const m3 = m2.add({ key: `oranges`, value: 9 }, { key: `grapes`, value: 10 });

  expect(m.isEmpty()).toBe(true);
  expect(m2.isEmpty()).toBe(false);
  expect(m3.isEmpty()).toBe(false);

  expect(m.has(`apples`)).toBe(false);

  expect(m2.has(`apples`)).toBe(true);
  expect(m3.has(`apples`)).toBe(true);

  expect(m.has(`oranges`)).toBe(false);
  expect(m2.has(`oranges`)).toBe(false);
  expect(m3.has(`oranges`)).toBe(true);

  const m4 = m3.clear();
  expect(m4.isEmpty()).toBe(true);
  expect(m.has(`oranges`)).toBe(false);
  expect(m2.has(`oranges`)).toBe(false);
  expect(m3.has(`oranges`)).toBe(true);

  const m5 = m3.delete(`apples`);
  expect(m.has(`apples`)).toBe(false);
  expect(m2.has(`apples`)).toBe(true);
  expect(m3.has(`apples`)).toBe(true);
  expect(m5.has(`apples`)).toBe(false);

  expect(m3.get(`grapes`)).toBe(10);
  expect(m3.get(`notthere`)).toBeFalsy();

  // test starting with data
  const m6 = immutable<string, number>([
    [ `apples`, 10 ],
    [ `oranges`, 9 ],
    [ `grapes`, 10 ],
  ]);
  const m6Entries = Array.from(m6.entries());
  const m3Entries = Array.from(m3.entries());
  expect(m6Entries).toEqual(m3Entries);
});
