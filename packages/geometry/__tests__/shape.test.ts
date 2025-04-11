import { test, expect } from 'vitest';

import * as Shape from '../src/shape/index.js';
import { Circles, Rects } from '../src/index.js';

test(`random-point`, () => {
  // @ts-expect-error
  expect(() => Shape.randomPoint({ x: 10, y: 20 })).toThrow();

  const shape1 = { x: 10, y: 10, radius: 10 };
  const r1 = Shape.randomPoint(shape1);
  expect(Shape.isIntersecting(shape1, r1)).toBe(true);

  const shape2 = { x: 10, y: 10, width: 5, height: 5 };
  const r2 = Shape.randomPoint(shape2);
  expect(Shape.isIntersecting(shape2, r2)).toBe(true);
});

test(`center`, () => {
  const shape1 = { x: 10, y: 10, radius: 10 };
  const r1 = Shape.center(shape1);
  expect(Circles.center(shape1)).toEqual(r1);

  const shape2 = { x: 10, y: 10, width: 5, height: 5 };
  const r2 = Shape.center(shape2);
  expect(Rects.center(shape2)).toEqual(r2);

});

test(`corners`, () => {

  // Rectangle -> Point
  expect(
    Shape.isIntersecting({ x: 100, y: 100, width: 5, height: 5 }, { x: 100, y: 100 })
  ).toBe(true);
  expect(
    Shape.isIntersecting({ x: 100, y: 100, width: 5, height: 5 }, { x: 101, y: 101 })
  ).toBe(true);
  expect(
    Shape.isIntersecting({ x: 100, y: 100, width: 5, height: 5 }, { x: 99, y: 99 })
  ).toBe(false);

  // Rectangle -> Circle
  expect(
    Shape.isIntersecting({ x: 100, y: 100, width: 5, height: 5 }, { x: 100, y: 100, radius: 5 })
  ).toBe(true);
  expect(
    Shape.isIntersecting({ x: 100, y: 100, width: 5, height: 5 }, { x: 101, y: 101, radius: 5 })
  ).toBe(true);
  expect(
    Shape.isIntersecting({ x: 100, y: 100, width: 5, height: 5 }, { x: 99, y: 99, radius: 5 })
  ).toBe(true);
  expect(
    Shape.isIntersecting({ x: 100, y: 100, width: 5, height: 5 }, { x: 90, y: 90, radius: 5 })
  ).toBe(false);

  // Circle -> Point
  expect(Shape.isIntersecting({ x: 100, y: 100, radius: 5 }, { x: 100, y: 100 })).toBe(true);
  expect(Shape.isIntersecting({ x: 100, y: 100, radius: 5 }, { x: 101, y: 101 })).toBe(true);
  expect(Shape.isIntersecting({ x: 100, y: 100, radius: 5 }, { x: 99, y: 99 })).toBe(true);
  expect(Shape.isIntersecting({ x: 100, y: 100, radius: 5 }, { x: 90, y: 90 })).toBe(false);

  // @ts-expect-error
  expect(() => Shape.isIntersecting(null, null)).toThrow();
  // @ts-expect-error
  expect(() => Shape.isIntersecting({ width: 10, height: 20 }, { x: 10, y: 20 })).toThrow();

});
