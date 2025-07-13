import { test, expect } from 'vitest';
/* eslint-disable */
//import { getClosestIntegerKey, mergeByKey } from '../../../data/maps/MapFns.js';
import { ofSimple } from '../../src/map/map-of-simple.js';
import { getClosestIntegerKey, mergeByKey } from '@ixfx/core/maps';

/**
 * Test immutable mapOf
 */
test('mapOfSimple', () => {
  let a = ofSimple<string>();
  let b = a.addKeyedValues('key-1', 'a', 'b', 'c');
  let c = b.addKeyedValues('key-2', 'd', 'e', 'f');

  // Count of keys
  expect(a.count('key-1')).toBe(0);
  expect(b.count('key-1')).toBe(3);
  expect(c.count('key-1')).toBe(3);
  expect(b.count('key-2')).toBe(0);
  expect(c.count('key-2')).toBe(3);

  // Has key
  expect(a.has('key-1')).toBe(false);
  expect(a.has('key-2')).toBe(false);
  expect(b.has('key-1')).toBe(true);
  expect(b.has('key-2')).toBe(false);
  expect(c.has('key-1')).toBe(true);
  expect(c.has('key-2')).toBe(true);

  // Look up key for value

  //t.is(c.firstKeyByValue('a'), 'key-1');
  //t.is(c.firstEntryByIterableValue('z'), undefined);
});

test('getClosestIntegerKey', () => {
  const data = new Map<number, boolean>();
  data.set(1, true);
  data.set(2, true);
  data.set(3, true);
  data.set(4, true);
  expect(getClosestIntegerKey(data, 3)).toBe(3);
  expect(getClosestIntegerKey(data, 3.1)).toBe(3);
  expect(getClosestIntegerKey(data, 3.5)).toBe(4);
  expect(getClosestIntegerKey(data, 3.6)).toBe(4);
  expect(getClosestIntegerKey(data, 100)).toBe(4);
  expect(getClosestIntegerKey(data, -100)).toBe(1);
});

test(`mergeByKey`, () => {
  const m1 = new Map();
  m1.set(`1`, `1-1`);
  m1.set(`2`, `1-2`);
  m1.set(`3`, `1-3`);
  m1.set(`4`, `1-4`);

  const m2 = new Map();
  m2.set(`1`, `2-1`);
  m2.set(`2`, `2-2`);
  m2.set(`3`, `2-3`);
  m2.set(`5`, `2-5`);

  const m3 = mergeByKey(
    (a: string, b: string) => {
      return b.replace(`-`, `!`);
    },
    m1,
    m2
  );

  expect(m3.get(`1`)).toBe(`2!1`);
  expect(m3.get(`2`)).toBe(`2!2`);
  expect(m3.get(`3`)).toBe(`2!3`);
  expect(m3.get(`4`)).toBe(`1-4`);
  expect(m3.get(`5`)).toBe(`2-5`);
});
