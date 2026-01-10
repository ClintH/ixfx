import { test, expect } from 'vitest';
import {
  isEqualDefault,
  isEqualValueDefault,
  isEqualValueIgnoreOrder,
  isEqualValuePartial
} from '../src/is-equal.js'

test(`isEqualValuePartial`, () => {
  const obj1 = {
    name: `blah`,
    address: {
      street: `West`,
      number: 35
    }
  };

  expect(isEqualValuePartial(obj1, { name: `blah` })).toBe(true);
  expect(isEqualValuePartial(obj1, { name: `nope` })).toBe(false);
  expect(isEqualValuePartial(obj1, { address: { number: 35 } })).toBe(true);
  expect(isEqualValuePartial(obj1, { address: { number: 35, street: `West` } })).toBe(true);
  expect(
    isEqualValuePartial(obj1, { address: { number: 35, streetWrong: `West` } })
  ).toBe(false);
  expect(isEqualValuePartial(obj1, { address: { number: 35, street: `North` } })).toBe(false);
  expect(isEqualValuePartial(obj1, {
    name: `blah`,
    address: {
      street: `West`,
      number: 35
    }
  })).toBe(true);
});

test(`isEqualValueIgnoreOrder`, () => {
  // Objects
  const obj1 = {
    name: 'blah',
  };
  const obj2 = {
    name: 'blah',
  };
  expect(isEqualValueIgnoreOrder(obj1, obj1)).toBe(true);
  expect(isEqualValueIgnoreOrder(obj1, obj2)).toBe(true);

  const obj3 = {
    name: `a`,
    colour: {
      r: 200,
      g: 100,
      b: 50
    },
    size: 20
  };
  const obj4 = {
    colour: {
      b: 50,
      g: 100,
      r: 200,
    },
    size: 20,
    name: `a`
  }
  expect(isEqualValueIgnoreOrder(obj3, obj4)).toBe(true);
})

test('isEqual', () => {
  // Booleans
  expect(isEqualDefault(false, false)).toBe(true);
  expect(isEqualDefault(true, true)).toBe(true);
  expect(isEqualDefault(true, false)).toBe(false);
  expect(isEqualDefault(false, true)).toBe(false);

  // Objects
  const obj1 = {
    name: 'blah',
  };
  const obj2 = {
    name: 'blah',
  };
  expect(isEqualDefault(obj1, obj1)).toBe(true);
  expect(isEqualDefault(obj1, obj2)).toBe(false);

  // Numbers
  expect(isEqualDefault(10, 10)).toBe(true);
  expect(isEqualDefault(Number.NaN, Number.NaN)).toBe(false);

  // Strings
  expect(isEqualDefault('hello', 'hello')).toBe(true);
  expect(isEqualDefault('HELLO', 'hello')).toBe(false);
  expect(isEqualDefault('hello', 'there')).toBe(false);
  expect(isEqualDefault('hello', undefined)).toBe(false);
  expect(isEqualDefault('hello', null)).toBe(false);
  expect(isEqualDefault('hello', '')).toBe(false);

  // Arrays
  const arr1 = [ 'hello', 'there' ];
  const arr2 = [ 'hello', 'there' ];
  expect(isEqualDefault(arr1, arr1)).toBe(true);
  expect(isEqualDefault(arr1, arr2)).toBe(false);
});

test('isEqualValueDefault', () => {
  // Booleans
  expect(isEqualValueDefault(false, false)).toBe(true);
  expect(isEqualValueDefault(true, true)).toBe(true);
  expect(isEqualValueDefault(true, false)).toBe(false);
  expect(isEqualValueDefault(false, true)).toBe(false);

  // Objects
  const obj1 = {
    name: 'blah',
  };
  const obj2 = {
    name: 'blah',
  };
  expect(isEqualValueDefault(obj1, obj1)).toBe(true);
  expect(isEqualValueDefault(obj1, obj2)).toBe(true);

  // Numbers
  expect(isEqualValueDefault(10, 10)).toBe(true);
  expect(isEqualValueDefault(Number.NaN, Number.NaN)).toBe(true);

  // Strings
  expect(isEqualValueDefault('hello', 'hello')).toBe(true);
  expect(isEqualValueDefault('HELLO', 'hello')).toBe(false);
  expect(isEqualValueDefault('hello', 'there')).toBe(false);
  expect(isEqualValueDefault('hello', undefined)).toBe(false);
  expect(isEqualValueDefault('hello', null)).toBe(false);
  expect(isEqualValueDefault('hello', '')).toBe(false);

  // Arrays
  const arr1 = [ 'hello', 'there' ];
  const arr2 = [ 'hello', 'there' ];
  expect(isEqualValueDefault(arr1, arr1)).toBe(true);
  expect(isEqualValueDefault(arr1, arr2)).toBe(true);
});

// Default isEqual tests by reference
test(`isEqualDefault`, () => {
  const a = {
    name: "Blah blah",
    age: 30,
    alive: true,
    height: 192.4
  }

  const aa = {
    name: "Blah blah",
    age: 30,
    alive: true,
    height: 192.4
  }

  const b = "Blah blah";
  const bb = "Blah blah";
  const c = "BLAH BLAH";

  expect(isEqualDefault(a, a)).toBe(true);
  expect(isEqualDefault(a, b as any)).toBeFalsy();
  expect(isEqualDefault(a, aa)).toBeFalsy(); // Same content but different references, false

  expect(isEqualDefault(b, b)).toBe(true);
  expect(isEqualDefault(b, bb)).toBe(true); // Strings work by value using ===
  expect(isEqualDefault(b, c)).toBeFalsy();
});
