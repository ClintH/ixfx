import { test, expect } from 'vitest';
import { mutable } from '../../src/map/map-mutable.js';

test(`mutableMap`, () => {
  const m = mutable();
  expect(m.isEmpty()).toBe(true);
  m.add([ `apples`, 10 ], [ `oranges`, 9 ]);
  expect(m.isEmpty()).toBe(false);
  expect(m.has(`apples`)).toBe(true);
  expect(m.has(`oranges`)).toBe(true);
  expect(m.has(`notthere`)).toBe(false);

  m.add({ key: `grapes`, value: 10 });
  m.set(`mangoes`, 100);
  m.delete(`oranges`);
  expect(m.has(`oranges`)).toBe(false);
  expect(m.has(`apples`)).toBe(true);
  expect(m.has(`grapes`)).toBe(true);
  expect(m.has(`mangoes`)).toBe(true);

  expect(m.get(`apples`)).toBe(10);
  expect(m.get(`notthere`)).toBeFalsy();
});
