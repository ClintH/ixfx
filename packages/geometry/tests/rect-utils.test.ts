import type { RectPositioned } from '../src/rect/rect-types.js';
import { expect, it } from 'vitest';
import * as Rects from '../src/rect/index.js';
import { nearestInternal } from '../src/rect/nearest.js';

const rect: RectPositioned = { x: 0, y: 0, width: 10, height: 10 };

it(`distanceFromExterior`, () => {
  // Inside / on edge: zero
  expect(Rects.distanceFromExterior(rect, { x: 5, y: 5 })).toBe(0);
  expect(Rects.distanceFromExterior(rect, { x: 10, y: 5 })).toBe(0);

  // Along one axis
  expect(Rects.distanceFromExterior(rect, { x: 13, y: 5 })).toBe(3);
  expect(Rects.distanceFromExterior(rect, { x: -2, y: 5 })).toBe(2);
  expect(Rects.distanceFromExterior(rect, { x: 5, y: -4 })).toBe(4);

  // Diagonal: 3-4-5
  expect(Rects.distanceFromExterior(rect, { x: 13, y: 14 })).toBe(5);
});

it(`distanceFromCenter`, () => {
  expect(Rects.distanceFromCenter(rect, { x: 5, y: 5 })).toBe(0);
  expect(Rects.distanceFromCenter(rect, { x: 8, y: 5 })).toBe(3);
});

it(`nearest`, () => {
  // Inside: unchanged
  expect(nearestInternal(rect, { x: 5, y: 5 })).toEqual({ x: 5, y: 5 });
  // Clamped to edges
  expect(nearestInternal(rect, { x: -5, y: 20 })).toEqual({ x: 0, y: 10 });
  expect(nearestInternal(rect, { x: 15, y: 3 })).toEqual({ x: 10, y: 3 });
});

it(`dividerByLargestDimension`, () => {
  const divide = Rects.dividerByLargestDimension({ width: 10, height: 5 });
  expect(divide(20)).toBe(2);
  expect(divide({ x: 10, y: 5 })).toEqual({ x: 1, y: 0.5 });
  // Point3d normalises all three axes
  const p3 = divide({ x: 10, y: 5, z: 20 } as any) as any;
  expect(p3.x).toBe(1);
  expect(p3.y).toBe(0.5);
  expect(p3.z).toBe(2);

  expect(() => divide(`nope` as any)).toThrow(/neither number nor Point/);
});

it(`lengths`, () => {
  expect(Rects.lengths(rect)).toEqual([10, 10, 10, 10]);
  expect(Rects.lengths({ x: 0, y: 0, width: 3, height: 4 })).toEqual([3, 4, 3, 4]);
});

it(`toArray and fromNumbers round-trip`, () => {
  expect(Rects.toArray({ width: 3, height: 4 })).toEqual([3, 4]);
  expect(Rects.toArray({ x: 1, y: 2, width: 3, height: 4 })).toEqual([1, 2, 3, 4]);
  expect(Rects.fromNumbers(3, 4)).toEqual({ width: 3, height: 4 });
  expect(Rects.fromNumbers(1, 2, 3, 4)).toEqual({ x: 1, y: 2, width: 3, height: 4 });
});

it(`applyFields`, () => {
  // op is called per field as (value, fieldName)
  const double = (value: number, field: string) => (field === `width` || field === `height` ? value * 2 : value);
  expect(Rects.applyFields(double, rect)).toEqual({ x: 0, y: 0, width: 20, height: 20 });

  // Position-less form: op sees only width/height
  expect(Rects.applyFields(double, { width: 2, height: 3 })).toEqual({ width: 4, height: 6 });
});
