
import { test, expect, describe } from 'vitest';
import { applyToValues, round } from '@ixfx/numbers';
import * as Colour from '../src/colour/index.js';

test(`is-hsl`, () => {
  expect(Colour.isHsl(Colour.HslSpace.scalar(0.1, 0.2, 0.3, 0.4))).toBeTruthy();
  expect(Colour.isHsl(Colour.HslSpace.absolute(100, 0.2, 0.3, 0.4))).toBeTruthy();
  expect(Colour.isHsl(Colour.OklchSpace.absolute(0.1, 0.2, 0.3, 0.4))).toBeFalsy();
  expect(Colour.isHsl(Colour.OklchSpace.scalar(0.1, 0.2, 0.3, 0.4))).toBeFalsy();
  expect(Colour.isHsl(Colour.SrgbSpace.scalar(0.1, 0.2, 0.3, 0.4))).toBeFalsy();
  expect(Colour.isHsl(Colour.SrgbSpace.eightBit(10, 20, 30, 50))).toBeFalsy();
});

test(`is-oklch`, () => {
  expect(Colour.isOkLch(Colour.HslSpace.scalar(0.1, 0.2, 0.3, 0.4))).toBeFalsy();
  expect(Colour.isOkLch(Colour.HslSpace.absolute(100, 0.2, 0.3, 0.4))).toBeFalsy();
  expect(Colour.isOkLch(Colour.OklchSpace.absolute(0.1, 0.2, 0.3, 0.4))).toBeTruthy();
  expect(Colour.isOkLch(Colour.OklchSpace.scalar(0.1, 0.2, 0.3, 0.4))).toBeTruthy();
  expect(Colour.isOkLch(Colour.SrgbSpace.scalar(0.1, 0.2, 0.3, 0.4))).toBeFalsy();
  expect(Colour.isOkLch(Colour.SrgbSpace.eightBit(10, 20, 30, 50))).toBeFalsy();
});

test(`is-rgb`, () => {
  expect(Colour.isRgb(Colour.HslSpace.scalar(0.1, 0.2, 0.3, 0.4))).toBeFalsy();
  expect(Colour.isRgb(Colour.HslSpace.absolute(100, 0.2, 0.3, 0.4))).toBeFalsy();
  expect(Colour.isRgb(Colour.OklchSpace.absolute(0.1, 0.2, 0.3, 0.4))).toBeFalsy();
  expect(Colour.isRgb(Colour.OklchSpace.scalar(0.1, 0.2, 0.3, 0.4))).toBeFalsy();
  expect(Colour.isRgb(Colour.SrgbSpace.scalar(0.1, 0.2, 0.3, 0.4))).toBeTruthy();
  expect(Colour.isRgb(Colour.SrgbSpace.eightBit(10, 20, 30, 50))).toBeTruthy();
});