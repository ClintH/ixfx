import { test, expect } from 'vitest';

import { isStringArray } from '../src/arrays.js';
import { ifNaN, percentTest, integerTest, integerParse, isInteger } from '../src/numbers.js';
import { isPlainObjectOrPrimitive, isPlainObject } from '../src/object.js';


test(`isStringArray`, () => {
  expect(isStringArray([ `a`, `b`, `c` ])).toBe(true);
  expect(isStringArray([ 'a' ])).toBe(true);
  expect(isStringArray([ `a`, `b`, false ])).toBe(false);
  expect(isStringArray([ `a`, `b`, null ])).toBe(false);
  expect(isStringArray([ `a`, `b`, true ])).toBe(false);
  expect(isStringArray([ `a`, `b`, {} ])).toBe(false);
});