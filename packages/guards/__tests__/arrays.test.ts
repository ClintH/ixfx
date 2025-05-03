import { test, expect } from 'vitest';

import { arrayStringsTest } from '../src/arrays.js';
import { ifNaN, percentTest, integerTest, integerParse, isInteger } from '../src/numbers.js';
import { testPlainObjectOrPrimitive, testPlainObject } from '../src/object.js';


test(`isStringArray`, () => {
  expect(arrayStringsTest([ `a`, `b`, `c` ])).toBe(true);
  expect(arrayStringsTest([ 'a' ])).toBe(true);
  expect(arrayStringsTest([ `a`, `b`, false ])).toBe(false);
  expect(arrayStringsTest([ `a`, `b`, null ])).toBe(false);
  expect(arrayStringsTest([ `a`, `b`, true ])).toBe(false);
  expect(arrayStringsTest([ `a`, `b`, {} ])).toBe(false);
});