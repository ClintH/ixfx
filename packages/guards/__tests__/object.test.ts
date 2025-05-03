import { test, expect } from 'vitest';

import { testPlainObjectOrPrimitive, testPlainObject } from '../src/object.js';

test('isPlainObjectOrPrimitive', () => {
  expect(testPlainObjectOrPrimitive(`hello`)).toBe(true);
  expect(testPlainObjectOrPrimitive(10)).toBe(true);
  expect(testPlainObjectOrPrimitive({ hello: `there` })).toBe(true);
  expect(testPlainObjectOrPrimitive(undefined)).toBe(false);
  expect(testPlainObjectOrPrimitive(null)).toBe(false);
  expect(testPlainObjectOrPrimitive(Number)).toBe(false);
  if (typeof window !== `undefined`) {
    expect(testPlainObjectOrPrimitive(window)).toBe(false);
  }

});

test('isPlainObject', () => {
  expect(testPlainObject(undefined)).toBe(false);
  expect(testPlainObject(null)).toBe(false);
  expect(testPlainObject(`hello`)).toBe(false);
  expect(testPlainObject(10)).toBe(false);
  expect(testPlainObject(Number)).toBe(false);
  if (typeof window !== `undefined`) {
    expect(testPlainObject(window)).toBe(false);
  }
  expect(testPlainObject({ hello: `there` })).toBe(true);

});