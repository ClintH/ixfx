/* eslint-disable @typescript-eslint/ban-ts-comment */
import { test, expect } from 'vitest';
import { scale } from '../src/scale.js';
import { proportion } from '../src/proportion.js';

test(`scale`, () => {
  expect(scale(50, 0, 100, 0, 1)).toBe(0.5);
  expect(scale(100, 0, 100, 0, 1)).toBe(1);
  expect(scale(0, 0, 100, 0, 1)).toBe(0);

  expect(scale(0, 0, 1, -5, 5)).toBe(-5);
  expect(scale(0.5, 0, 1, -5, 5)).toBe(0);
  expect(scale(1, 0, 1, -5, 5)).toBe(5);

});

test(`proportion`, () => {
  expect(proportion(0.5, 0.5)).toEqual(0.25);
  expect(proportion(0.5, 0)).toEqual(0);
  expect(proportion(0.5, 1)).toEqual(0.5);

  expect(proportion(() => 0.5, 0.5)).toEqual(0.25);
  expect(proportion(0.5, () => 0)).toEqual(0);

  // @ts-expect-error
  expect(() => proportion(false, 0.5)).toThrow();
  // @ts-expect-error
  expect(() => proportion(0, true)).toThrow();


})