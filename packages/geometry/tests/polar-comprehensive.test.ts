import { test, expect } from 'vitest';
import * as Polar from '../src/polar/index.js';
import { degreeToRadian, radianToDegree } from '../src/angles.js';
import type { Coord, PolarRay, PolarLine } from '../src/polar/types.js';
import { Points } from '../src/index.js';

function roundPoint(p: { x: number, y: number }): { x: number, y: number } {
  return { x: Math.round(p.x), y: Math.round(p.y) };
}

function isCloseTo(a: number, b: number, decimals = 3) {
  return Math.abs(a - b) < Math.pow(10, -decimals);
}

const origin = { x: 0, y: 0 };
const coord: Coord = { distance: 5, angleRadian: Math.PI / 4 };
const coord2: Coord = { distance: 3, angleRadian: 0 };

test(`isPolarCoord - returns true for valid coord`, () => {
  expect(Polar.isPolarCoord(coord)).toBe(true);
});

test(`isPolarCoord - returns false for missing distance`, () => {
  expect(Polar.isPolarCoord({ angleRadian: 0 })).toBe(false);
});

test(`isPolarCoord - returns false for missing angle`, () => {
  expect(Polar.isPolarCoord({ distance: 5 })).toBe(false);
});

test(`isPolarCoord - returns false for non-object`, () => {
  expect(Polar.isPolarCoord(5)).toBe(false);
  expect(Polar.isPolarCoord('string')).toBe(false);
});

test(`guard - valid coord does not throw`, () => {
  expect(() => Polar.guard(coord)).not.toThrow();
});

test(`guard - undefined throws`, () => {
  expect(() => Polar.guard(undefined as unknown as Coord)).toThrow();
});

test(`guard - null throws`, () => {
  expect(() => Polar.guard(null as unknown as Coord)).toThrow();
});

test(`guard - missing angleRadian throws`, () => {
  expect(() => Polar.guard({ distance: 5 } as unknown as Coord)).toThrow();
});

test(`guard - missing distance throws`, () => {
  expect(() => Polar.guard({ angleRadian: 0 } as unknown as Coord)).toThrow();
});

test(`guard - NaN values throw`, () => {
  expect(() => Polar.guard({ distance: NaN, angleRadian: 0 })).toThrow();
  expect(() => Polar.guard({ distance: 5, angleRadian: NaN })).toThrow();
});

test(`guard - wrong type throws`, () => {
  expect(() => Polar.guard({ distance: '5', angleRadian: 0 } as unknown as Coord)).toThrow();
  expect(() => Polar.guard({ distance: 5, angleRadian: '0' } as unknown as Coord)).toThrow();
});

test(`rotate - rotates coord by radians`, () => {
  const rotated = Polar.rotate(coord, Math.PI / 4);
  expect(rotated.distance).toBe(coord.distance);
  expect(rotated.angleRadian).toBe(coord.angleRadian + Math.PI / 4);
});

test(`rotate - preserves frozen object`, () => {
  const rotated = Polar.rotate(coord, Math.PI / 4);
  expect(Object.isFrozen(rotated)).toBe(true);
});

test(`rotateDegrees - rotates coord by degrees`, () => {
  const rotated = Polar.rotateDegrees(coord, 90);
  expect(isCloseTo(rotated.angleRadian, coord.angleRadian + Math.PI / 2)).toBe(true);
});

test(`invert - reverses direction`, () => {
  const inverted = Polar.invert(coord);
  expect(inverted.distance).toBe(coord.distance);
  expect(inverted.angleRadian).toBe(coord.angleRadian - Math.PI);
});

test(`isOpposite - same magnitude opposite direction`, () => {
  const c1: Coord = { distance: 5, angleRadian: Math.PI / 4 };
  const c2: Coord = { distance: 5, angleRadian: -Math.PI / 4 };
  expect(Polar.isOpposite(c1, c2)).toBe(true);
});

test(`isOpposite - different magnitude returns false`, () => {
  const c1: Coord = { distance: 5, angleRadian: Math.PI / 4 };
  const c2: Coord = { distance: 3, angleRadian: -Math.PI / 4 };
  expect(Polar.isOpposite(c1, c2)).toBe(false);
});

test(`isParallel - same angle regardless of magnitude`, () => {
  expect(Polar.isParallel(coord, coord2)).toBe(false);
  const c1: Coord = { distance: 5, angleRadian: Math.PI / 4 };
  const c2: Coord = { distance: 10, angleRadian: Math.PI / 4 };
  expect(Polar.isParallel(c1, c2)).toBe(true);
});

test(`isAntiParallel - opposite angles`, () => {
  const c1: Coord = { distance: 5, angleRadian: Math.PI / 4 };
  const c2: Coord = { distance: 10, angleRadian: -Math.PI / 4 };
  expect(Polar.isAntiParallel(c1, c2)).toBe(true);
});

test(`normalise - sets distance to 1`, () => {
  const normalised = Polar.normalise(coord);
  expect(normalised.distance).toBe(1);
  expect(normalised.angleRadian).toBe(coord.angleRadian);
});

test(`normalise - throws on zero distance`, () => {
  expect(() => Polar.normalise({ distance: 0, angleRadian: 0 })).toThrow();
});

test(`clampMagnitude - clamps to max`, () => {
  const clamped = Polar.clampMagnitude(coord, 3);
  expect(clamped.distance).toBe(3);
});

test(`clampMagnitude - clamps to min`, () => {
  const clamped = Polar.clampMagnitude(coord, 10, 6);
  expect(clamped.distance).toBe(6);
});

test(`clampMagnitude - no change when within range`, () => {
  const clamped = Polar.clampMagnitude(coord, 10, 1);
  expect(clamped.distance).toBe(coord.distance);
});

test(`dotProduct - calculates dot product`, () => {
  const c1: Coord = { distance: 1, angleRadian: 0 };
  const c2: Coord = { distance: 1, angleRadian: 0 };
  expect(Polar.dotProduct(c1, c2)).toBeCloseTo(1);
});

test(`dotProduct - perpendicular vectors`, () => {
  const c1: Coord = { distance: 1, angleRadian: 0 };
  const c2: Coord = { distance: 1, angleRadian: Math.PI / 2 };
  expect(Polar.dotProduct(c1, c2)).toBeCloseTo(0);
});

test(`multiply - scales distance`, () => {
  const multiplied = Polar.multiply(coord, 2);
  expect(multiplied.distance).toBe(10);
  expect(multiplied.angleRadian).toBe(coord.angleRadian);
});

test(`multiply - zero multiplier`, () => {
  const multiplied = Polar.multiply(coord, 0);
  expect(multiplied.distance).toBe(0);
});

test(`multiply - throws on invalid amt`, () => {
  expect(() => Polar.multiply(coord, NaN)).toThrow();
});

test(`divide - divides distance`, () => {
  const divided = Polar.divide(coord, 2);
  expect(divided.distance).toBeCloseTo(2.5);
  expect(divided.angleRadian).toBe(coord.angleRadian);
});

test(`between - angle within range`, () => {
  const start = { angleRadian: 0 };
  const end = { angleRadian: Math.PI / 2 };
  const check = { angleRadian: Math.PI / 4 };
  expect(Polar.between(check, start, end)).toBe(true);
});

test(`between - angle outside range`, () => {
  const start = { angleRadian: 0 };
  const end = { angleRadian: Math.PI / 2 };
  const check = { angleRadian: Math.PI };
  expect(Polar.between(check, start, end)).toBe(false);
});

test(`toCartesian - converts with Coord and origin`, () => {
  const point = Polar.toCartesian(coord, origin);
  expect(isCloseTo(point.x, 5 * Math.cos(Math.PI / 4))).toBe(true);
  expect(isCloseTo(point.y, 5 * Math.sin(Math.PI / 4))).toBe(true);
});

test(`toCartesian - converts with distance, angle, and origin`, () => {
  const point = Polar.toCartesian(5, Math.PI / 4, origin);
  expect(isCloseTo(point.x, 5 * Math.cos(Math.PI / 4))).toBe(true);
  expect(isCloseTo(point.y, 5 * Math.sin(Math.PI / 4))).toBe(true);
});

test(`toCartesian - throws on invalid params`, () => {
  expect(() => Polar.toCartesian({ distance: 5, angleRadian: 0 }, 'not a point' as any)).toThrow();
  expect(() => Polar.toCartesian(5, 0, 'not a point' as any)).toThrow();
});

test(`toLine - converts coord to line`, () => {
  const line = Polar.toLine(coord, origin);
  expect(line.a).toEqual(origin);
  expect(line.b.x).toBeCloseTo(coord.distance * Math.cos(coord.angleRadian));
  expect(line.b.y).toBeCloseTo(coord.distance * Math.sin(coord.angleRadian));
});

test(`fromCartesian - converts point to polar`, () => {
  const point = { x: 5, y: 5 };
  const polar = Polar.fromCartesian(point, origin, { digits: 3, fullCircle: true });
  expect(polar.distance).toBeCloseTo(Math.hypot(5, 5));
  expect(polar.angleRadian).toBeCloseTo(Math.PI / 4);
});

test(`fromCartesian - with fullCircle false`, () => {
  const point = { x: -5, y: 5 };
  const polar = Polar.fromCartesian(point, origin, { digits: 3, fullCircle: false });
  expect(polar.distance).toBeCloseTo(Math.hypot(-5, 5));
  expect(polar.angleRadian).toBeCloseTo(Math.PI * 0.75);
});

test(`fromCartesian - with non-zero origin`, () => {
  const point = { x: 10, y: 10 };
  const origin = { x: 5, y: 5 };
  const polar = Polar.fromCartesian(point, origin, { digits: 3, fullCircle: true });
  expect(polar.distance).toBeCloseTo(Math.hypot(5, 5));
});

test(`fromCartesian - at origin`, () => {
  const polar = Polar.fromCartesian(origin, origin, { digits: 3, fullCircle: true });
  expect(polar.distance).toBe(0);
  expect(polar.angleRadian).toBe(0);
});

test(`toString - formats polar coord`, () => {
  const str = Polar.toString(coord);
  expect(str).toContain('(');
  expect(str).toContain(')');
  expect(str).toContain(',');
});

test(`toString - with precision`, () => {
  const str = Polar.toString(coord, 2);
  expect(str).toContain('(');
  expect(str).toContain(')');
});

test(`toString - handles undefined/null`, () => {
  expect(Polar.toString(undefined as any)).toBe('(undefined)');
  expect(Polar.toString(null as any)).toBe('(null)');
});

test(`toPoint - converts coord to point`, () => {
  const point = Polar.toPoint(coord, origin);
  expect(point.x).toBeCloseTo(coord.distance * Math.cos(coord.angleRadian));
  expect(point.y).toBeCloseTo(coord.distance * Math.sin(coord.angleRadian));
});

test(`toPolarLine - converts line to polar`, () => {
  const line = { a: { x: 0, y: 0 }, b: { x: 5, y: 5 } };
  const polarLine = Polar.toPolarLine(line, origin);
  expect(polarLine.a.distance).toBeCloseTo(0);
  expect(polarLine.b.distance).toBeCloseTo(Math.hypot(5, 5));
});

test(`toPolarLine - with orderBy distance`, () => {
  const line = { a: { x: 5, y: 5 }, b: { x: 0, y: 0 } };
  const polarLine = Polar.toPolarLine(line, origin, { orderBy: 'distance' });
  expect(polarLine.a.distance).toBeLessThanOrEqual(polarLine.b.distance);
});

test(`toPolarLine - array of lines`, () => {
  const lines = [
    { a: { x: 0, y: 0 }, b: { x: 5, y: 0 } },
    { a: { x: 0, y: 0 }, b: { x: 0, y: 5 } },
  ];
  const polarLines = Polar.toPolarLine(lines, origin);
  expect(polarLines.length).toBe(2);
  expect(Array.isArray(polarLines)).toBe(true);
});

test(`polarLineToString - formats polar line`, () => {
  const line: PolarLine = { a: { distance: 0, angleRadian: 0 }, b: { distance: 5, angleRadian: Math.PI / 4 } };
  const str = Polar.polarLineToString(line);
  expect(str).toContain('angle');
  expect(str).toContain('dist');
});

test(`lineToCartesian - converts polar line to cartesian`, () => {
  const polarLine: PolarLine = {
    a: { distance: 0, angleRadian: 0 },
    b: { distance: 5, angleRadian: Math.PI / 4 },
  };
  const line = Polar.lineToCartesian(polarLine, origin);
  expect(line.a.x).toBe(0);
  expect(line.a.y).toBe(0);
  expect(line.b.x).toBeCloseTo(5 * Math.cos(Math.PI / 4));
  expect(line.b.y).toBeCloseTo(5 * Math.sin(Math.PI / 4));
});

test(`lineToCartesian - array of lines`, () => {
  const polarLines: PolarLine[] = [
    { a: { distance: 0, angleRadian: 0 }, b: { distance: 5, angleRadian: 0 } },
    { a: { distance: 0, angleRadian: 0 }, b: { distance: 5, angleRadian: Math.PI / 2 } },
  ];
  const lines = Polar.lineToCartesian(polarLines, origin);
  expect(lines.length).toBe(2);
  expect(Array.isArray(lines)).toBe(true);
});

test(`lineToCartesian - empty array returns empty array`, () => {
  const result = Polar.lineToCartesian([], origin);
  expect(result).toEqual([]);
});

test(`spiral - generates coordinates`, () => {
  const gen = Polar.spiral(0.1, 1);
  const first = gen.next();
  expect(first.done).toBe(false);
  expect(first.value.distance).toBe(0);
  expect(first.value.step).toBe(1);
});

test(`spiral - second iteration`, () => {
  const gen = Polar.spiral(0.1, 1);
  gen.next();
  const second = gen.next();
  expect(second.value.distance).toBeCloseTo(0.1);
  expect(second.value.step).toBe(2);
});

test(`spiralRaw - calculates coordinate for step`, () => {
  const coord = Polar.spiralRaw(5, 0.1, 1);
  expect(coord.distance).toBeCloseTo(0.5);
  expect(coord.angleRadian).toBeCloseTo(0.5);
});

test(`Ray.toCartesian - converts ray to cartesian line`, () => {
  const ray: PolarRay = { angleRadian: 0, length: 10, offset: 0 };
  const line = Polar.Ray.toCartesian(ray, origin);
  expect(line.a.x).toBe(0);
  expect(line.a.y).toBe(0);
  expect(line.b.x).toBe(10);
  expect(line.b.y).toBe(0);
});

test(`Ray.toCartesian - with offset`, () => {
  const ray: PolarRay = { angleRadian: 0, length: 5, offset: 5 };
  const line = Polar.Ray.toCartesian(ray, origin);
  expect(line.a.x).toBe(5);
  expect(line.a.y).toBe(0);
  expect(line.b.x).toBe(10);
  expect(line.b.y).toBe(0);
});

test(`Ray.toCartesian - array of rays`, () => {
  const rays: PolarRay[] = [
    { angleRadian: 0, length: 5, offset: 0 },
    { angleRadian: Math.PI / 2, length: 5, offset: 0 },
  ];
  const lines = Polar.Ray.toCartesian(rays, origin);
  expect(lines.length).toBe(2);
});

test(`Ray.fromLine - converts line to ray`, () => {
  const line = { a: { x: 0, y: 0 }, b: { x: 5, y: 0 } };
  const ray = Polar.Ray.fromLine(line);
  expect(ray.angleRadian).toBe(0);
  expect(ray.length).toBe(5);
  expect(ray.origin?.x).toBe(0);
  expect(ray.origin?.y).toBe(0);
});

test(`Ray.fromLine - with origin`, () => {
  const line = { a: { x: 5, y: 0 }, b: { x: 10, y: 0 } };
  const origin = { x: 0, y: 0 };
  const ray = Polar.Ray.fromLine(line, origin);
  expect(ray.offset).toBe(5);
  expect(ray.length).toBe(5);
});

test(`Ray.fromLine - array of lines`, () => {
  const lines = [
    { a: { x: 0, y: 0 }, b: { x: 5, y: 0 } },
    { a: { x: 0, y: 0 }, b: { x: 0, y: 5 } },
  ];
  const rays = Polar.Ray.fromLine(lines);
  expect(rays.length).toBe(2);
});

test(`Ray.isParallel - same angle`, () => {
  const ray1: PolarRay = { angleRadian: 0, length: 5 };
  const ray2: PolarRay = { angleRadian: 0, length: 10 };
  expect(Polar.Ray.isParallel(ray1, ray2)).toBe(true);
});

test(`Ray.isParallel - different angle`, () => {
  const ray1: PolarRay = { angleRadian: 0, length: 5 };
  const ray2: PolarRay = { angleRadian: Math.PI / 2, length: 5 };
  expect(Polar.Ray.isParallel(ray1, ray2)).toBe(false);
});

test(`Ray.toString - formats ray`, () => {
  const ray: PolarRay = { angleRadian: Math.PI / 4, length: 5, offset: 0 };
  const str = Polar.Ray.toString(ray);
  expect(str).toContain('PolarRay');
  expect(str).toContain('angle');
});

test(`intersectionDistance - ray hits line`, () => {
  const line: PolarLine = {
    a: { distance: 1, angleRadian: 0 },
    b: { distance: 1, angleRadian: Math.PI / 2 },
  };
  const dist = Polar.intersectionDistance(Math.PI / 4, line);
  expect(dist).toBeLessThan(Infinity);
});

test(`intersectionDistance - ray misses line`, () => {
  const line: PolarLine = {
    a: { distance: 10, angleRadian: Math.PI },
    b: { distance: 10, angleRadian: Math.PI * 1.5 },
  };
  const dist = Polar.intersectionDistance(Math.PI / 4, line);
  expect(dist).toBe(Infinity);
});

test(`intersectionDistanceCompute - creates compute function`, () => {
  const line: PolarLine = {
    a: { distance: 1, angleRadian: 0 },
    b: { distance: 1, angleRadian: Math.PI / 2 },
  };
  const computer = Polar.intersectionDistanceCompute(line);
  expect(computer.compute).toBeDefined();
  expect(computer.visibilityPolygon).toBeDefined();
});

test(`intersectionDistanceCompute - compute yields results`, () => {
  const line: PolarLine = {
    a: { distance: 1, angleRadian: 0 },
    b: { distance: 1, angleRadian: Math.PI / 2 },
  };
  const computer = Polar.intersectionDistanceCompute(line);
  const results = [...computer.compute(Math.PI / 4)];
  expect(Array.isArray(results)).toBe(true);
});
