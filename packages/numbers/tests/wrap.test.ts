import { test, expect } from 'vitest';
import { wrap, wrapInteger } from '../src/wrap.js';

test(`wrap`, () => {
  expect(wrap(10.5, 5, 10)).toBe(5.5);
  expect(wrap(4, 5, 9)).toBe(8);
  expect(wrap(5, 5, 9)).toBe(5);
  expect(wrap(9, 5, 9)).toBe(5);
  expect(wrap(4.5, 5, 9)).toBe(8.5);
});

test(`wrapInteger`, () => {
  // Test for non-integers
  expect(() => wrapInteger(0.5, 0, 360)).toThrow();
  expect(() => wrapInteger(10, 0.5, 360)).toThrow();
  expect(() => wrapInteger(10, 0, 20.5)).toThrow();

  expect(wrapInteger(361, 0, 360)).toBe(1);
  expect(wrapInteger(360, 0, 360)).toBe(0);
  expect(wrapInteger(0, 0, 360)).toBe(0);
  expect(wrapInteger(150, 0, 360)).toBe(150);
  expect(wrapInteger(-20, 0, 360)).toBe(340);
  expect(wrapInteger(360 * 3, 0, 360)).toBe(0);
  expect(wrapInteger(150 - 360, 0, 360)).toBe(150);
  expect(wrapInteger(150 - 360 * 2, 0, 360)).toBe(150);

  // Test default 0-360 range
  expect(wrapInteger(361)).toBe(1);
  expect(wrapInteger(360)).toBe(0);
  expect(wrapInteger(0)).toBe(0);
  expect(wrapInteger(150)).toBe(150);
  expect(wrapInteger(-20)).toBe(340);
  expect(wrapInteger(360 * 3)).toBe(0);
  expect(wrapInteger(150 - 360)).toBe(150);
  expect(wrapInteger(150 - 360 * 2)).toBe(150);

  // Non-zero min
  expect(wrapInteger(20, 20, 70)).toBe(20);
  expect(wrapInteger(70, 20, 70)).toBe(20);
  expect(wrapInteger(80, 20, 70)).toBe(30);
  expect(wrapInteger(-20, 20, 70)).toBe(50);

  expect(wrapInteger(20, 20, 30)).toBe(20);
  expect(wrapInteger(22, 20, 30)).toBe(22);
  expect(wrapInteger(5, 20, 30)).toBe(25);
  expect(wrapInteger(30, 20, 30)).toBe(20);
  expect(wrapInteger(31, 20, 30)).toBe(21);
  expect(wrapInteger(40, 20, 30)).toBe(20);
});
