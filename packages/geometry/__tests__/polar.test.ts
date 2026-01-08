import { test, expect } from 'vitest';
import { Points } from '../src/index.js';
import * as Polar from '../src/polar/index.js';
import { degreeToRadian } from '../src/angles.js';
import type { Point } from '../src/point/point-type.js';
import { distance } from '../src/point/distance.js';
import type { angleRadian } from '../src/point/angle.js';

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

test(`fromCartesian`, () => {
  // https://www.omnicalculator.com/math/cartesian-to-polar

  // fullCircle: false
  expect(Polar.fromCartesian({ x: 10, y: 20 }, { x: 0, y: 0 }, { digits: 3, fullCircle: false })).toStrictEqual({ distance: 22.361, angleRadian: 1.107 });
  expect(Polar.fromCartesian({ x: -10, y: -15 }, { x: 0, y: 0 }, { digits: 3, fullCircle: false })).toStrictEqual({ distance: 18.028, angleRadian: -2.159 });
  expect(Polar.fromCartesian({ x: 12, y: -15 }, { x: 0, y: 0 }, { digits: 3, fullCircle: false })).toStrictEqual({ distance: 19.209, angleRadian: -0.896 });
  expect(Polar.fromCartesian({ x: -16, y: 15 }, { x: 0, y: 0 }, { digits: 3, fullCircle: false })).toStrictEqual({ distance: 21.932, angleRadian: 2.388 });
  expect(Polar.fromCartesian({ x: 0, y: 0 }, { x: 0, y: 0 }, { digits: 3, fullCircle: false })).toStrictEqual({ distance: 0, angleRadian: 0 });

  // Verified with: https://unitscalculator.com/polar-coordinates/
  expect(Polar.fromCartesian({ x: 10, y: 20 }, { x: 0, y: 0 }, { digits: 3, fullCircle: true })).toStrictEqual({ distance: 22.361, angleRadian: 1.107 });
  expect(Polar.fromCartesian({ x: -10, y: -15 }, { x: 0, y: 0 }, { digits: 3, fullCircle: true })).toStrictEqual({ distance: 18.028, angleRadian: 4.124 });
  expect(Polar.fromCartesian({ x: 12, y: -15 }, { x: 0, y: 0 }, { digits: 3, fullCircle: true })).toStrictEqual({ distance: 19.209, angleRadian: 5.387 });
  expect(Polar.fromCartesian({ x: -16, y: 15 }, { x: 0, y: 0 }, { digits: 3, fullCircle: true })).toStrictEqual({ distance: 21.932, angleRadian: 2.388 });
  expect(Polar.fromCartesian({ x: 0, y: 0 }, { x: 0, y: 0 }, { digits: 3, fullCircle: true })).toStrictEqual({ distance: 0, angleRadian: 0 });
});

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