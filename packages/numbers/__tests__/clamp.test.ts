import { test, expect } from 'vitest';
import { clamp, clampIndex, clamper, maxAbs } from '../src/clamp.js';

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

test(`clampIndex`, () => {
  expect(clampIndex(0, 5)).toBe(0);
  expect(clampIndex(4, 5)).toBe(4);
  expect(clampIndex(5, 5)).toBe(4);
  expect(clampIndex(-5, 5)).toBe(0);

  expect(clampIndex(3, [ 1, 2, 3, 4, 5 ])).toBe(3);

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

  expect(() => clamper(Number.NaN, 1)).toThrow();
  expect(() => clamper(1, Number.NaN)).toThrow();

});

test(`maxAbs`, () => {
  expect(maxAbs(1, 5)).toBe(5);
  expect(maxAbs(-10, 5)).toBe(-10);
  expect(maxAbs([ -10, 5 ])).toBe(-10);

})