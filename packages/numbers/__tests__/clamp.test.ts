import { test, expect } from 'vitest';
import { clamp, clampIndex, clamper } from '../src/clamp.js';

test(`clamp-inclusivity`, () => {
  expect(clamp(0, 0, 1)).toBe(0);
  expect(clamp(-1, 0, 1)).toBe(0);

  expect(clamp(1, 0, 1)).toBe(1);
  expect(clamp(1.1, 0, 1)).toBe(1);
});

test(`clamp-range`, () => {
  expect(clamp(0.5, 0, 1)).toBe(0.5);
  expect(clamp(0.000000005, 0, 1)).toBe(0.000000005);

  expect(clamp(100, -100, 100)).toBe(100);
  expect(clamp(-100, -100, 100)).toBe(-100);
  expect(clamp(0, -100, 100)).toBe(0);

  // test guards
  expect(() => clamp(NaN, 0, 100)).toThrow();
  expect(() => clamp(10, NaN, 100)).toThrow();
  expect(() => clamp(10, 0, NaN)).toThrow();
});

test(`clamp-zero-bounds`, () => {
  expect(clampIndex(0, 5)).toBe(0);
  expect(clampIndex(4, 5)).toBe(4);
  expect(clampIndex(5, 5)).toBe(4);
  expect(clampIndex(-5, 5)).toBe(0);

  // test throwing for non-ints
  expect(() => clampIndex(0, 5.5)).toThrow();
  expect(() => clampIndex(0.5, 5)).toThrow();
  expect(() => clampIndex(NaN, 5)).toThrow();
  expect(() => clampIndex(0, NaN)).toThrow();
});

test(`clamper`, () => {
  const c = clamper(0, 100);
  expect(c(50)).toBe(50);
  expect(c(-50)).toBe(0);
  expect(c(101)).toBe(100);

})