import { test, expect } from 'vitest';
import { Points } from '../src/index.js';
import * as Polar from '../src/polar/index.js';
import { degreeToRadian } from '../src/angles.js';
import type { Point } from '../src/point/point-type.js';

const closeEnough = (a: Point, b: Point): boolean => {
  a = Points.apply(a, Math.round);
  b = Points.apply(b, Math.round);
  const v = (Points.isEqual(a, b));
  if (!v) {
    console.log(`a: ${ JSON.stringify(a) }`);
    console.log(`b: ${ JSON.stringify(b) }`);
  }
  return v;
};

test(`conversion`, () => {

  // Test results via
  // https://keisan.casio.com/exec/system/1223527679
  expect(closeEnough(
    Polar.toCartesian(5, degreeToRadian(60)),
    { x: 2.5, y: 4.33 }
  )).toBe(true);

  expect(closeEnough(
    Polar.toCartesian(5, degreeToRadian(0)),
    { x: 5, y: 0 }
  )).toBe(true);

  expect(closeEnough(
    Polar.toCartesian(5, degreeToRadian(360)),
    { x: 5, y: 0 }
  )).toBe(true);

  expect(closeEnough(
    Polar.toCartesian(5, degreeToRadian(60)),
    { x: 2.5, y: 4.33 }
  )).toBe(true);

  expect(closeEnough(
    Polar.toCartesian(5, degreeToRadian(100)),
    { x: -0.862, y: 4.924 }
  )).toBe(true);

  expect(closeEnough(
    Polar.toCartesian(5, degreeToRadian(-100)),
    { x: -0.862, y: -4.924 }
  )).toBe(true);

  expect(closeEnough(
    Polar.toCartesian(5, degreeToRadian(130)),
    { x: -3.213, y: 3.8302 }
  )).toBe(true);

  expect(closeEnough(
    Polar.toCartesian(5, degreeToRadian(180)),
    { x: -5, y: 0 }
  )).toBe(true);

  expect(closeEnough(
    Polar.toCartesian(5, degreeToRadian(200)),
    { x: -4.69, y: -1.71 }
  )).toBe(true);

  expect(closeEnough(
    Polar.toCartesian(5, degreeToRadian(280)),
    { x: 0.868, y: -4.924 }
  )).toBe(true);

  expect(closeEnough(
    Polar.toCartesian(5, degreeToRadian(-280)),
    { x: 0.868, y: 4.924 }
  )).toBe(true);
});