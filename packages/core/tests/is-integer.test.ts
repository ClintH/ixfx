import { expect, it } from 'vitest';
import { isInteger } from '../src/is-integer.js';

it(`numbers`, () => {
  expect(isInteger(1)).toBe(true);
  expect(isInteger(-10)).toBe(true);
  expect(isInteger(0)).toBe(true);
  expect(isInteger(1.1)).toBe(false);
  expect(isInteger(Number.NaN)).toBe(false);
  expect(isInteger(Number.POSITIVE_INFINITY)).toBe(false);
});

it(`strings parse`, () => {
  expect(isInteger(`1`)).toBe(true);
  expect(isInteger(`-5`)).toBe(true);
  expect(isInteger(`1.1`)).toBe(false);
  expect(isInteger(`hello`)).toBe(false);
  // Leading zeros do not round-trip through parse
  expect(isInteger(`01`)).toBe(false);
});

it(`other types are false`, () => {
  expect(isInteger(undefined as any)).toBe(false);
  expect(isInteger(true as any)).toBe(false);
  expect(isInteger({} as any)).toBe(false);
});
