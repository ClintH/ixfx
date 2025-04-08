import { test, expect } from 'vitest';

import { isPlainObjectOrPrimitive, isPlainObject } from '../src/object.js';

test('isPlainObjectOrPrimitive', () => {
  expect(isPlainObjectOrPrimitive(`hello`)).toBe(true);
  expect(isPlainObjectOrPrimitive(10)).toBe(true);
  expect(isPlainObjectOrPrimitive({ hello: `there` })).toBe(true);
  expect(isPlainObjectOrPrimitive(undefined)).toBe(false);
  expect(isPlainObjectOrPrimitive(null)).toBe(false);
  expect(isPlainObjectOrPrimitive(Number)).toBe(false);
  if (typeof window !== `undefined`) {
    expect(isPlainObjectOrPrimitive(window)).toBe(false);
  }

});

test('isPlainObject', () => {
  expect(isPlainObject(undefined)).toBe(false);
  expect(isPlainObject(null)).toBe(false);
  expect(isPlainObject(`hello`)).toBe(false);
  expect(isPlainObject(10)).toBe(false);
  expect(isPlainObject(Number)).toBe(false);
  if (typeof window !== `undefined`) {
    expect(isPlainObject(window)).toBe(false);
  }
  expect(isPlainObject({ hello: `there` })).toBe(true);

});