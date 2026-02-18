import { test, expect } from 'vitest';
import * as Points from '../src/point/index.js';

test(`guard - valid point does not throw`, () => {
  expect(() => Points.guard({ x: 10, y: 20 })).not.toThrow();
});

test(`guard - undefined throws`, () => {
  expect(() => Points.guard(undefined as any)).toThrow();
});

test(`isPoint - detects valid point`, () => {
  expect(Points.isPoint({ x: 10, y: 20 })).toBe(true);
  expect(Points.isPoint(null)).toBe(false);
  expect(Points.isPoint(undefined)).toBe(false);
  expect(Points.isPoint({ x: 10 })).toBe(false);
});

test(`isPoint3d - detects 3d point`, () => {
  expect(Points.isPoint3d({ x: 10, y: 20, z: 30 })).toBe(true);
  expect(Points.isPoint3d({ x: 10, y: 20 })).toBe(false);
});

test(`isEmpty - checks for zero values`, () => {
  expect(Points.isEmpty({ x: 0, y: 0 })).toBe(true);
  expect(Points.isEmpty({ x: 1, y: 0 })).toBe(false);
});

test(`isPlaceholder - checks for NaN`, () => {
  expect(Points.isPlaceholder({ x: NaN, y: NaN })).toBe(true);
  expect(Points.isPlaceholder({ x: 10, y: NaN })).toBe(false);
});

test(`Empty - has zero values`, () => {
  expect(Points.Empty.x).toBe(0);
  expect(Points.Empty.y).toBe(0);
});

test(`Placeholder - has NaN values`, () => {
  expect(Number.isNaN(Points.Placeholder.x)).toBe(true);
  expect(Number.isNaN(Points.Placeholder.y)).toBe(true);
});

test(`from - creates point from numbers`, () => {
  expect(Points.from(10, 20)).toEqual({ x: 10, y: 20 });
  expect(Points.from(10, 20, 30)).toEqual({ x: 10, y: 20, z: 30 });
  expect(Points.from([10, 20])).toEqual({ x: 10, y: 20 });
});

test(`distance - calculates distance`, () => {
  expect(Points.distance({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5);
  expect(Points.distance({ x: 0, y: 0 }, { x: 0, y: 0 })).toBe(0);
});

test(`angleRadian - calculates angle`, () => {
  expect(Points.angleRadian({ x: 1, y: 0 })).toBeCloseTo(0, 3);
  expect(Points.angleRadian({ x: 0, y: 1 })).toBeCloseTo(Math.PI / 2, 3);
});

test(`sum - adds points`, () => {
  expect(Points.sum({ x: 10, y: 20 }, { x: 5, y: 10 })).toEqual({ x: 15, y: 30 });
  expect(Points.sum(10, 20, 5, 10)).toEqual({ x: 15, y: 30 });
});

test(`subtract - subtracts points`, () => {
  expect(Points.subtract({ x: 10, y: 20 }, { x: 5, y: 10 })).toEqual({ x: 5, y: 10 });
  expect(Points.subtract(10, 20, 5, 10)).toEqual({ x: 5, y: 10 });
});

test(`multiply - multiplies point`, () => {
  expect(Points.multiply({ x: 10, y: 20 }, { x: 2, y: 3 })).toEqual({ x: 20, y: 60 });
});

test(`divide - divides point`, () => {
  expect(Points.divide({ x: 10, y: 20 }, { x: 2, y: 4 })).toEqual({ x: 5, y: 5 });
});

test(`interpolate - linear interpolation`, () => {
  expect(Points.interpolate(0, { x: 0, y: 0 }, { x: 10, y: 10 })).toEqual({ x: 0, y: 0 });
  expect(Points.interpolate(0.5, { x: 0, y: 0 }, { x: 10, y: 10 })).toEqual({ x: 5, y: 5 });
  expect(Points.interpolate(1, { x: 0, y: 0 }, { x: 10, y: 10 })).toEqual({ x: 10, y: 10 });
});

test(`normalise - unit vector`, () => {
  const norm = Points.normalise({ x: 3, y: 4 });
  expect(Math.abs(Math.hypot(norm.x, norm.y) - 1)).toBeLessThan(0.001);
});

test(`abs - absolute values`, () => {
  expect(Points.abs({ x: -10, y: -20 })).toEqual({ x: 10, y: 20 });
});

test(`invert - negate values`, () => {
  expect(Points.invert({ x: 10, y: -20 })).toEqual({ x: -10, y: 20 });
});

test(`round - rounds values`, () => {
  expect(Points.round({ x: 1.234, y: 5.674 }, 2)).toEqual({ x: 1.23, y: 5.67 });
  expect(Points.round(1.234, 5.674, 2)).toEqual({ x: 1.23, y: 5.67 });
});

test(`clamp - clamps values`, () => {
  expect(Points.clamp({ x: 150, y: 200 }, 0, 100)).toEqual({ x: 100, y: 100 });
});

test(`reduce - reduces points`, () => {
  const pts = [{ x: 1, y: 2 }, { x: 3, y: 4 }];
  const sum = Points.reduce(pts, (acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }));
  expect(sum).toEqual({ x: 4, y: 6 });
});

test(`apply - applies function`, () => {
  expect(Points.apply({ x: 10, y: 20 }, (v) => v * 2)).toEqual({ x: 20, y: 40 });
});

test(`compareByX - sorts by x`, () => {
  expect(Points.compareByX({ x: 10, y: 0 }, { x: 5, y: 0 })).toBeGreaterThan(0);
  expect(Points.compareByX({ x: 5, y: 0 }, { x: 10, y: 0 })).toBeLessThan(0);
});

test(`compareByY - sorts by y`, () => {
  expect(Points.compareByY({ x: 0, y: 10 }, { x: 0, y: 5 })).toBeGreaterThan(0);
  expect(Points.compareByY({ x: 0, y: 5 }, { x: 0, y: 10 })).toBeLessThan(0);
});

test(`leftmost - finds leftmost point`, () => {
  const pts = [{ x: 10, y: 0 }, { x: 5, y: 0 }, { x: 15, y: 0 }];
  const left = Points.leftmost(...pts);
  expect(left.x).toBe(5);
});

test(`rightmost - finds rightmost point`, () => {
  const pts = [{ x: 10, y: 0 }, { x: 5, y: 0 }, { x: 15, y: 0 }];
  const right = Points.rightmost(...pts);
  expect(right.x).toBe(15);
});

test(`rotate - rotates point around origin`, () => {
  const rotated = Points.rotate({ x: 10, y: 0 }, Math.PI / 2);
  expect(rotated.x).toBeCloseTo(0, 1);
  expect(rotated.y).toBeCloseTo(10, 1);
});

test(`dotProduct - calculates dot product`, () => {
  expect(Points.dotProduct({ x: 1, y: 0 }, { x: 0, y: 1 })).toBe(0);
  expect(Points.dotProduct({ x: 1, y: 0 }, { x: 1, y: 0 })).toBe(1);
});

test(`bbox - calculates bounding box`, () => {
  const pts = [{ x: 0, y: 0 }, { x: 10, y: 10 }, { x: 5, y: 5 }];
  const box = Points.bbox(...pts);
  expect(box.x).toBe(0);
  expect(box.y).toBe(0);
  expect(box.width).toBe(10);
  expect(box.height).toBe(10);
});

test(`bbox3d - calculates 3d bounding box`, () => {
  const pts = [{ x: 0, y: 0, z: 0 }, { x: 10, y: 10, z: 10 }];
  const box = Points.bbox3d(...pts);
  expect(box.x).toBe(0);
  expect(box.y).toBe(0);
  expect(box.z).toBe(0);
  expect(box.width).toBe(10);
  expect(box.height).toBe(10);
  expect(box.depth).toBe(10);
});

test(`toArray - converts to array`, () => {
  expect(Points.toArray({ x: 10, y: 20 })).toEqual([10, 20]);
});

test(`fromString - parses string`, () => {
  expect(Points.fromString(`10,20`)).toEqual({ x: 10, y: 20 });
  expect(Points.fromString(`10,20,30`)).toEqual({ x: 10, y: 20, z: 30 });
});

test(`getTwoPointParameters - returns point array`, () => {
  const result = Points.getTwoPointParameters({ x: 1, y: 2 }, { x: 3, y: 4 });
  expect(result).toHaveLength(2);
});

test(`random - generates random point`, () => {
  const pt = Points.random();
  expect(pt.x).toBeDefined();
  expect(pt.y).toBeDefined();
});
