/* eslint-disable @typescript-eslint/ban-ts-comment */
import { test, expect } from 'vitest';
import * as MM from '../../src/map/map-multi-fns.js'
import { isEqualValueDefault } from '@ixfx/core';


test(`firstEntry`, () => {
  const map = new Map();
  map.set('hello', [ 'a', 'b', 'c' ]);
  map.set('there', [ 'd', 'e', 'f' ]);
  const entry = MM.firstEntry(map, (value, key) => {
    return (value === 'e');
  });
  expect(entry).toEqual([ 'there', [ 'd', 'e', 'f' ] ]);
});

test(`longestEntry`, () => {
  const map = new Map();
  map.set('hello', [ 'a', 'b', 'c' ]);
  map.set('there', [ 'd', 'e', 'f' ]);
  map.set('two', [ 'g', 'h', 'i', 'j' ]);
  expect(MM.longestEntry(map)).toEqual([ 'two', [ 'g', 'h', 'i', 'j' ] ]);

  /** @ts-expect-error */
  expect(() => MM.longestEntry()).toThrow();
  /** @ts-expect-error */
  expect(() => MM.longestEntry({})).toThrow();
  /** @ts-expect-error */
  expect(() => MM.longestEntry(null)).toThrow();
  /** @ts-expect-error */
  expect(() => MM.longestEntry(false)).toThrow();

  const badMap = new Map();
  badMap.set(`hello`, [ 'a', 'b', 'c' ]);
  badMap.set(`hello`, 'hello');
  expect(() => MM.longestEntry(badMap)).toThrow();
});

const createBasic = () => {
  const map = new Map();
  map.set('hello', [ 'a', 'b', 'c' ]);
  map.set('there', [ 'd', 'e', 'f' ]);
  map.set('two', [ 'g', 'h', 'i', 'j' ]);
  return map;
}

const createObjects = () => {
  const map = new Map();
  map.set('hello', [ { name: 'Apple', size: 2 }, { name: 'Banana', size: 1 }, { name: 'Carrot', size: 5 } ]);
  map.set('there', [ { name: 'Dingo', size: 5 }, { name: 'Elephant', size: 100 }, { name: 'Fox', size: 3 } ]);
  map.set('two', [ { name: 'Goat', size: 2 }, { name: 'Hippo', size: 50 }, { name: 'Iguana', size: 3 }, { name: 'Jackal', size: 3 } ]);
  return map;
}
test(`cloneShallow`, () => {
  const m1 = createBasic();
  const c1 = MM.cloneShallow(m1);

  expect(c1 === m1).toBeFalsy();
  expect(c1).toEqual(m1);
  expect(c1.size).toBe(3);
  expect([ ...c1.keys() ]).toEqual([ 'hello', 'there', 'two' ]);

  const m2 = createObjects();
  const c2 = MM.cloneShallow(m2);
  expect(c2 === m1).toBeFalsy();
  expect(c2.size).toBe(3);
  expect([ ...c2.keys() ]).toEqual([ 'hello', 'there', 'two' ]);

});

test(`equals-basic`, () => {
  // String values
  const m1 = createBasic();
  const m2 = createBasic();

  // Default uses === equality
  expect(MM.equals(m1, m2)).toBeTruthy();
  // Equal if we compare by string
  expect(MM.equals(m1, m2, isEqualValueDefault)).toBeTruthy();

  m1.set('three', [ 'x' ]);
  expect(MM.equals(m1, m2, isEqualValueDefault)).toBeFalsy();
  m1.delete('three');
  expect(MM.equals(m1, m2, isEqualValueDefault)).toBeTruthy();
  m2.set('three', []);
  expect(MM.equals(m1, m2, isEqualValueDefault)).toBeFalsy();
});

test(`equals-obj`, () => {
  const m1 = createObjects();
  const m2 = createObjects();
  // Default uses === equality
  expect(MM.equals(m1, m2)).toBeFalsy();
  // Equal if we compare by string
  expect(MM.equals(m1, m2, isEqualValueDefault)).toBeTruthy();

});


test(`firstEntryByValue`, () => {
  const map = createBasic();
  expect(MM.firstEntryByValue(map, 'e')).toEqual([ 'there', [ 'd', 'e', 'f' ] ]);
  expect(MM.firstEntryByValue(map, 'z')).toBeUndefined();

  /** @ts-expect-error */
  expect(() => MM.firstEntryByValue()).toThrow();
  /** @ts-expect-error */
  expect(() => MM.firstEntryByValue({})).toThrow();
  /** @ts-expect-error */
  expect(() => MM.firstEntryByValue(null)).toThrow();
  /** @ts-expect-error */
  expect(() => MM.firstEntryByValue(false)).toThrow();
});