import { test, expect } from 'vitest';
import * as Tri from '../src/triangle/index.js';
import { degreeToRadian } from '../src/angles.js';
import { numberDecimalTest } from '@ixfx/guards';

function isCloseTo(a: number, b: number, decimals = 3) {
  return numberDecimalTest(a, b, decimals).success;
}

const triangle: Tri.Triangle = {
  a: { x: 0, y: 0 },
  b: { x: 4, y: 0 },
  c: { x: 2, y: 3 },
};

const origin = { x: 0, y: 0 };

test(`guard - valid triangle does not throw`, () => {
  expect(() => Tri.guard(triangle)).not.toThrow();
});

test(`guard - undefined throws`, () => {
  expect(() => Tri.guard(undefined as unknown as Tri.Triangle)).toThrow();
});

test(`isTriangle - returns true for valid triangle`, () => {
  expect(Tri.isTriangle(triangle)).toBe(true);
});

test(`isTriangle - returns false for undefined`, () => {
  expect(Tri.isTriangle(undefined)).toBe(false);
});

test(`isTriangle - returns false for partial object`, () => {
  expect(Tri.isTriangle({ a: { x: 0, y: 0 } })).toBe(false);
});

test(`isEmpty - returns true for empty points`, () => {
  const emptyTri: Tri.Triangle = {
    a: { x: 0, y: 0 },
    b: { x: 0, y: 0 },
    c: { x: 0, y: 0 },
  };
  expect(Tri.isEmpty(emptyTri)).toBe(true);
});

test(`isEmpty - returns false for non-empty triangle`, () => {
  expect(Tri.isEmpty(triangle)).toBe(false);
});

test(`isPlaceholder - returns true for placeholder triangle`, () => {
  const placeholderTri: Tri.Triangle = {
    a: { x: Number.NaN, y: Number.NaN },
    b: { x: Number.NaN, y: Number.NaN },
    c: { x: Number.NaN, y: Number.NaN },
  };
  expect(Tri.isPlaceholder(placeholderTri)).toBe(true);
});

test(`isPlaceholder - returns false for valid triangle`, () => {
  expect(Tri.isPlaceholder(triangle)).toBe(false);
});

test(`isEqual - returns true for equal triangles`, () => {
  const triangle2: Tri.Triangle = {
    a: { x: 0, y: 0 },
    b: { x: 4, y: 0 },
    c: { x: 2, y: 3 },
  };
  expect(Tri.isEqual(triangle, triangle2)).toBe(true);
});

test(`isEqual - returns false for different triangles`, () => {
  const differentTri: Tri.Triangle = {
    a: { x: 0, y: 0 },
    b: { x: 5, y: 0 },
    c: { x: 2, y: 3 },
  };
  expect(Tri.isEqual(triangle, differentTri)).toBe(false);
});

test(`fromRadius - creates equilateral triangle`, () => {
  const tri = Tri.fromRadius(origin, 10);
  expect(Tri.isTriangle(tri)).toBe(true);
  expect(tri.a.x).toBe(10);
  expect(tri.a.y).toBe(0);
});

test(`fromRadius - with initial angle`, () => {
  const tri = Tri.fromRadius(origin, 10, { initialAngleRadian: Math.PI / 2 });
  expect(Tri.isTriangle(tri)).toBe(true);
  expect(tri.a.x).toBeCloseTo(0, 3);
  expect(tri.a.y).toBeCloseTo(10, 3);
});

test(`fromFlatArray - creates triangle from array`, () => {
  const tri = Tri.fromFlatArray([0, 0, 4, 0, 2, 3]);
  expect(tri.a.x).toBe(0);
  expect(tri.a.y).toBe(0);
  expect(tri.b.x).toBe(4);
  expect(tri.b.y).toBe(0);
  expect(tri.c.x).toBe(2);
  expect(tri.c.y).toBe(3);
});

test(`fromFlatArray - throws on wrong length`, () => {
  expect(() => Tri.fromFlatArray([0, 0, 4, 0])).toThrow();
});

test(`fromPoints - creates triangle from point array`, () => {
  const points = [{ x: 0, y: 0 }, { x: 4, y: 0 }, { x: 2, y: 3 }] as const;
  const tri = Tri.fromPoints(points);
  expect(tri.a.x).toBe(0);
  expect(tri.b.x).toBe(4);
  expect(tri.c.x).toBe(2);
});

test(`fromPoints - throws on wrong number of points`, () => {
  const points = [{ x: 0, y: 0 }, { x: 4, y: 0 }] as const;
  expect(() => Tri.fromPoints(points)).toThrow();
});

test(`toFlatArray - converts triangle to array`, () => {
  const arr = Tri.toFlatArray(triangle);
  expect(arr).toEqual([0, 0, 4, 0, 2, 3]);
});

test(`corners - returns array of vertices`, () => {
  const corners = Tri.corners(triangle);
  expect(corners.length).toBe(3);
  expect(corners[0]).toEqual({ x: 0, y: 0 });
  expect(corners[1]).toEqual({ x: 4, y: 0 });
  expect(corners[2]).toEqual({ x: 2, y: 3 });
});

test(`edges - returns polyline of triangle edges`, () => {
  const edges = Tri.edges(triangle);
  expect(edges.length).toBe(3);
});

test(`angles - returns three interior angles in radians`, () => {
  const angles = Tri.angles(triangle);
  expect(angles.length).toBe(3);
  expect(angles[0]).not.toBeNaN();
  expect(angles[1]).not.toBeNaN();
  expect(angles[2]).not.toBeNaN();
});

test(`anglesDegrees - returns angles in degrees`, () => {
  const angles = Tri.anglesDegrees(triangle);
  expect(angles.length).toBe(3);
  expect(angles[0]).not.toBeNaN();
  expect(angles[1]).not.toBeNaN();
  expect(angles[2]).not.toBeNaN();
});

test(`area - calculates triangle area`, () => {
  const area = Tri.area(triangle);
  expect(isCloseTo(area, 6)).toBe(true);
});

test(`perimeter - calculates triangle perimeter`, () => {
  const perimeter = Tri.perimeter(triangle);
  const side1 = 4;
  const side2 = Math.hypot(2, 3);
  const side3 = Math.hypot(2, 3);
  expect(isCloseTo(perimeter, side1 + side2 + side3)).toBe(true);
});

test(`lengths - returns lengths of three sides`, () => {
  const lengths = Tri.lengths(triangle);
  expect(lengths.length).toBe(3);
  expect(isCloseTo(lengths[0], 4)).toBe(true);
  expect(isCloseTo(lengths[1], Math.hypot(2, 3))).toBe(true);
  expect(isCloseTo(lengths[2], Math.hypot(2, 3))).toBe(true);
});

test(`centroid - returns center point`, () => {
  const center = Tri.centroid(triangle);
  expect(isCloseTo(center.x, 2)).toBe(true);
  expect(isCloseTo(center.y, 1)).toBe(true);
});

test(`bbox - returns bounding box`, () => {
  const box = Tri.bbox(triangle);
  expect(box.x).toBe(0);
  expect(box.y).toBe(0);
  expect(box.width).toBe(4);
  expect(box.height).toBe(3);
});

test(`bbox - with inflation`, () => {
  const box = Tri.bbox(triangle, 1);
  expect(box.x).toBe(-1);
  expect(box.y).toBe(-1);
  expect(box.width).toBe(6);
  expect(box.height).toBe(5);
});

test(`rotate - rotates around centroid`, () => {
  const rotated = Tri.rotate(triangle, Math.PI / 2);
  expect(Tri.isTriangle(rotated)).toBe(true);
  const center = Tri.centroid(rotated);
  expect(center.x).toBeCloseTo(Tri.centroid(triangle).x, 3);
  expect(center.y).toBeCloseTo(Tri.centroid(triangle).y, 3);
});

test(`rotate - zero rotation returns same triangle`, () => {
  const rotated = Tri.rotate(triangle, 0);
  expect(Tri.isEqual(rotated, triangle)).toBe(true);
});

test(`rotate - with custom origin`, () => {
  const rotated = Tri.rotate(triangle, Math.PI / 2, { x: 0, y: 0 });
  expect(Tri.isTriangle(rotated)).toBe(true);
});

test(`rotateByVertex - rotates around specified vertex`, () => {
  const rotated = Tri.rotateByVertex(triangle, Math.PI, 'a');
  expect(Tri.isTriangle(rotated)).toBe(true);
  expect(rotated.a).toEqual(triangle.a);
});

test(`apply - applies function to all vertices`, () => {
  const applied = Tri.apply(triangle, (p) => ({ x: p.x * 2, y: p.y * 2 }));
  expect(applied.a.x).toBe(0);
  expect(applied.b.x).toBe(8);
  expect(applied.c.x).toBe(4);
});

test(`intersectsPoint - point inside triangle`, () => {
  expect(Tri.intersectsPoint(triangle, { x: 2, y: 1 })).toBe(true);
});

test(`intersectsPoint - point outside triangle`, () => {
  expect(Tri.intersectsPoint(triangle, { x: 5, y: 5 })).toBe(false);
});

test(`intersectsPoint - point on edge`, () => {
  expect(Tri.intersectsPoint(triangle, { x: 2, y: 0 })).toBe(true);
});

test(`barycentricCoord - centroid`, () => {
  const center = Tri.centroid(triangle);
  const bc = Tri.barycentricCoord(triangle, center);
  expect(isCloseTo(bc.a, 0.333, 2)).toBe(true);
  expect(isCloseTo(bc.b, 0.333, 2)).toBe(true);
  expect(isCloseTo(bc.c, 0.333, 2)).toBe(true);
});

test(`barycentricToCartestian - converts back to cartesian`, () => {
  const center = Tri.centroid(triangle);
  const bc = Tri.barycentricCoord(triangle, center);
  const cartesian = Tri.barycentricToCartestian(triangle, bc);
  expect(cartesian.x).toBeCloseTo(center.x, 3);
  expect(cartesian.y).toBeCloseTo(center.y, 3);
});

test(`create - Empty triangle`, () => {
  expect(Tri.Empty.a.x).toBe(0);
  expect(Tri.Empty.a.y).toBe(0);
});

test(`create - Placeholder triangle`, () => {
  expect(Number.isNaN(Tri.Placeholder.a.x)).toBe(true);
});

test(`equilateralFromVertex - creates triangle from vertex`, () => {
  const tri = Tri.equilateralFromVertex({ x: 5, y: 5 }, 10, Math.PI / 2);
  expect(Tri.isTriangle(tri)).toBe(true);
  expect(tri.b.x).toBe(5);
  expect(tri.b.y).toBe(5);
});
