import { test, expect } from 'vitest';

import { testPlainObjectOrPrimitive, testPlainObject } from '../src/object.js';

test('isPlainObjectOrPrimitive', () => {
  expect(testPlainObjectOrPrimitive(`hello`).success).toBeTruthy();
  expect(testPlainObjectOrPrimitive(10).success).toBeTruthy();
  expect(testPlainObjectOrPrimitive({ hello: `there` }).success).toBeTruthy();
  expect(testPlainObjectOrPrimitive(undefined).success).toBeFalsy();
  expect(testPlainObjectOrPrimitive(null).success).toBeFalsy();
  expect(testPlainObjectOrPrimitive(Number).success).toBeFalsy();
  if (typeof window !== `undefined`) {
    expect(testPlainObjectOrPrimitive(window).success).toBeFalsy();
  }

});

test('isPlainObject', () => {
  expect(testPlainObject(undefined).success).toBeFalsy();
  expect(testPlainObject(null).success).toBeFalsy();
  expect(testPlainObject(`hello`).success).toBeFalsy();
  expect(testPlainObject(10).success).toBeFalsy();
  expect(testPlainObject(Number).success).toBeFalsy();
  if (typeof window !== `undefined`) {
    expect(testPlainObject(window).success).toBeFalsy();
  }
  expect(testPlainObject({ hello: `there` }).success).toBeTruthy();

});