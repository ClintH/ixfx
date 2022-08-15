/* eslint-disable */

import { wrapInteger, wrap, scale, clamp, clampIndex } from '../../data/index.js';
test(`scale`, () => {
  expect(scale(50, 0, 100, 0, 1)).toEqual(0.5);
  expect(scale(100, 0, 100, 0, 1)).toEqual(1);
  expect(scale(0, 0, 100, 0, 1)).toEqual(0);
});

test(`wrap`, () => {
  expect(wrap(10.5, 5, 10)).toEqual(5.5);
  expect(wrap(4, 5, 9)).toEqual(8);
  expect(wrap(5, 5, 9)).toEqual(5);
  expect(wrap(9, 5, 9)).toEqual(5);
  expect(wrap(4.5, 5, 9)).toEqual(8.5);
});


test(`wrapInteger`, () => {

  // Test for non-integers
  expect(() => wrapInteger(0.5,0,360)).toThrow();
  expect(() => wrapInteger(10,0.5,360)).toThrow();
  expect(() => wrapInteger(10,0,20.5)).toThrow();

  expect(wrapInteger(361, 0, 360)).toEqual(1);
  expect(wrapInteger(360, 0, 360)).toEqual(0);
  expect(wrapInteger(0, 0, 360)).toEqual(0);
  expect(wrapInteger(150, 0, 360)).toEqual(150);
  expect(wrapInteger(-20, 0, 360)).toEqual(340);
  expect(wrapInteger(360*3, 0, 360)).toEqual(0);
  expect(wrapInteger(150 - 360, 0, 360)).toEqual(150);
  expect(wrapInteger(150 - (360*2), 0, 360)).toEqual(150);

  // Test default 0-360 range
  expect(wrapInteger(361)).toEqual(1);
  expect(wrapInteger(360)).toEqual(0);
  expect(wrapInteger(0)).toEqual(0);
  expect(wrapInteger(150)).toEqual(150);
  expect(wrapInteger(-20)).toEqual(340);
  expect(wrapInteger(360*3)).toEqual(0);
  expect(wrapInteger(150 - 360)).toEqual(150);
  expect(wrapInteger(150 - (360*2))).toEqual(150);

  // Non-zero min 
  expect(wrapInteger(20, 20, 70)).toEqual(20);
  expect(wrapInteger(70, 20, 70)).toEqual(20);
  expect(wrapInteger(80, 20, 70)).toEqual(30);
  expect(wrapInteger(-20, 20, 70)).toEqual(50);

  expect(wrapInteger(20, 20, 30)).toEqual(20);
  expect(wrapInteger(22, 20, 30)).toEqual(22);
  expect(wrapInteger(5, 20, 30)).toEqual(25);
  expect(wrapInteger(30, 20, 30)).toEqual(20);
  expect(wrapInteger(31, 20, 30)).toEqual(21);
  expect(wrapInteger(40, 20, 30)).toEqual(20);
});

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
