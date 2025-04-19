import { test, expect } from 'vitest';
import * as Teq from '../src/triangle/equilateral.js';
import * as Tra from '../src/triangle/right.js';
import * as Tis from '../src/triangle/isosceles.js';
import { degreeToRadian } from '../src/angles.js';
import { isCloseTo } from '@ixfx/numbers';

test(`equilateral`, () => {
  const t: Teq.TriangleEquilateral = {
    length: 10,
  };

  expect(isCloseTo(Teq.area(t), 43.301, 3)).toBeTruthy();
  expect(isCloseTo(Teq.perimeter(t), 30)).toBeTruthy()
  expect(isCloseTo(Teq.height(t), 8.660254037844386)).toBeTruthy()
  expect(isCloseTo(Teq.circumcircle(t).radius, 5.773502691896257)).toBeTruthy()
  expect(isCloseTo(Teq.incircle(t).radius, 2.8867513459481287)).toBeTruthy()
});

test(`isosceles`, () => {
  // https://rechneronline.de/pi/isosceles-triangle.php
  const t = { legs: 20, base: 10 };

  expect(isCloseTo(Tis.height(t), 19.365, 3)).toBeTruthy()
  expect(isCloseTo(Tis.perimeter(t), 50, 3)).toBeTruthy()
  expect(isCloseTo(Tis.area(t), 96.825, 3)).toBeTruthy()
  expect(isCloseTo(Tis.apexAngle(t), degreeToRadian(28.955), 3)).toBeTruthy()
  expect(isCloseTo(Tis.circumcircle(t).radius, 10.328, 4)).toBeTruthy()
  expect(isCloseTo(Tis.incircle(t).radius, 3.873, 4)).toBeTruthy()

  const medians = Tis.medians(t);
  expect(isCloseTo(medians[ 0 ], 12.2474, 3)).toBeTruthy()
  expect(isCloseTo(medians[ 1 ], 12.2474, 3)).toBeTruthy()
  expect(isCloseTo(medians[ 2 ], 19.365, 3)).toBeTruthy()
});

test(`rightAngle`, () => {
  // https://rechneronline.de/pi/right-triangle.php
  const t = { opposite: 10, adjacent: 15 };

  expect(isCloseTo(Tra.height(t), 8.321, 3)).toBeTruthy()
  expect(isCloseTo(Tra.perimeter(t), 43.028, 3)).toBeTruthy()
  expect(isCloseTo(Tra.area(t), 75, 3)).toBeTruthy()
  expect(isCloseTo(Tra.angleAtPointA(t), 0.588, 3)).toBeTruthy()
  expect(isCloseTo(Tra.angleAtPointB(t), 0.9827, 3)).toBeTruthy()
  expect(isCloseTo(Tra.circumcircle(t).radius, 9.013878, 4)).toBeTruthy()
  expect(isCloseTo(Tra.incircle(t).radius, 3.486122, 4)).toBeTruthy()

  const hypoSegments = Tra.hypotenuseSegments(t);
  expect(isCloseTo(hypoSegments[ 0 ], 5.547002, 4)).toBeTruthy()
  expect(isCloseTo(hypoSegments[ 1 ], 12.480754, 4)).toBeTruthy()

  const medians = Tra.medians(t);
  expect(isCloseTo(medians[ 0 ], 15.811388, 4)).toBeTruthy()
  expect(isCloseTo(medians[ 1 ], 12.5, 1)).toBeTruthy()
  expect(isCloseTo(medians[ 2 ], 9.013878, 4)).toBeTruthy()

  expect(isCloseTo(Tra.oppositeFromAdjacent(1, 10), 15.57408, 5)).toBeTruthy()
  expect(isCloseTo(Tra.oppositeFromHypotenuse(1, 10), 8.41471, 5)).toBeTruthy()

  expect(isCloseTo(Tra.adjacentFromHypotenuse(1, 10), 5.40302, 5)).toBeTruthy()
  expect(isCloseTo(Tra.adjacentFromOpposite(1, 10), 6.42093, 5)).toBeTruthy()

  expect(isCloseTo(Tra.hypotenuseFromOpposite(1, 10), 11.88395, 5)).toBeTruthy()
  expect(isCloseTo(Tra.hypotenuseFromAdjacent(1, 10), 18.50816, 5)).toBeTruthy()
});
