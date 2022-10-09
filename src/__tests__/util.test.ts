/* eslint-disable */
import { expect, test } from '@jest/globals';
import { toStringDefault, isEqualDefault, isEqualValueDefault} from '../Util.js';

test(`toStringDefault`, () => {
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
  const bb ="Blah blah";

  expect(toStringDefault(a)).toEqual(toStringDefault(aa));
  expect(toStringDefault(b)).toEqual(toStringDefault(bb));
})

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
  const bb ="Blah blah";
  const c = "BLAH BLAH";

  expect(isEqualDefault(a,a)).toBeTruthy();
  expect(isEqualDefault(a, b as any)).toBeFalsy();
  expect(isEqualDefault(a,aa)).toBeFalsy(); // Same content but different references, false

  expect(isEqualDefault(b, b)).toBeTruthy();
  expect(isEqualDefault(b,bb)).toBeTruthy(); // Strings work by value using ===
  expect(isEqualDefault(b, c)).toBeFalsy();
});


// Test by value
test(`isEqualValueDefault`, () => {
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
  const bb ="Blah blah";
  const c = "BLAH BLAH";

  expect(isEqualValueDefault(a,a)).toBeTruthy();
  expect(isEqualValueDefault(a, b as any)).toBeFalsy();
  expect(isEqualValueDefault(a,aa)).toBeTruthy();

  expect(isEqualValueDefault(b, b)).toBeTruthy();
  expect(isEqualValueDefault(b,bb)).toBeTruthy();
  expect(isEqualValueDefault(b, c)).toBeFalsy();
});

