import { describe, it, expect } from 'vitest';
import * as Vector from '../src/vector.js';
import * as Polar from '../src/polar/index.js';
import type { Point } from '../src/point/point-type.js';
import type { Coord as PolarCoord } from '../src/polar/index.js';

describe('vector', () => {
  describe('fromRadians', () => {
    it('converts 0 radians to (1, 0)', () => {
      const v = Vector.fromRadians(0);
      expect(v.x).closeTo(1, 10);
      expect(v.y).closeTo(0, 10);
    });

    it('converts π/2 radians to (0, 1)', () => {
      const v = Vector.fromRadians(Math.PI / 2);
      expect(v.x).closeTo(0, 10);
      expect(v.y).closeTo(1, 10);
    });

    it('converts π radians to (-1, 0)', () => {
      const v = Vector.fromRadians(Math.PI);
      expect(v.x).closeTo(-1, 10);
      expect(v.y).closeTo(0, 10);
    });

    it('converts 3π/2 radians to (0, -1)', () => {
      const v = Vector.fromRadians(3 * Math.PI / 2);
      expect(v.x).closeTo(0, 10);
      expect(v.y).closeTo(-1, 10);
    });
  });

  describe('toRadians', () => {
    it('converts (1, 0) to 0 radians', () => {
      const radians = Vector.toRadians({ x: 1, y: 0 });
      expect(radians).closeTo(0, 10);
    });

    it('converts (0, 1) to π/2 radians', () => {
      const radians = Vector.toRadians({ x: 0, y: 1 });
      expect(radians).closeTo(Math.PI / 2, 10);
    });

    it('converts (-1, 0) to π radians', () => {
      const radians = Vector.toRadians({ x: -1, y: 0 });
      expect(radians).closeTo(Math.PI, 10);
    });

    it('converts (0, -1) to -π/2 radians', () => {
      const radians = Vector.toRadians({ x: 0, y: -1 });
      expect(radians).closeTo(-Math.PI / 2, 10);
    });
  });

  describe('fromPointPolar', () => {
    it('converts point to polar with default origin', () => {
      const p: Polar.Coord = Vector.fromPointPolar({ x: 1, y: 1 });
      expect(p.distance).closeTo(Math.sqrt(2), 10);
      expect(p.angleRadian).closeTo(Math.PI / 4, 10);
    });

    it('converts point with custom origin', () => {
      const p: Polar.Coord = Vector.fromPointPolar({ x: 3, y: 3 }, '', { x: 1, y: 1 });
      expect(p.distance).closeTo(Math.sqrt(8), 10);
      expect(p.angleRadian).closeTo(Math.PI / 4, 10);
    });

    it('uses unipolar normalisation', () => {
      const p: Polar.Coord = Vector.fromPointPolar({ x: -1, y: 1 }, 'unipolar');
      expect(p.angleRadian).closeTo(3 * Math.PI / 4, 10);
    });

    it('uses bipolar normalisation', () => {
      const p: Polar.Coord = Vector.fromPointPolar({ x: 0, y: 1 }, 'bipolar');
      expect(p.angleRadian).closeTo(Math.PI / 2, 10);
    });

    it('handles point at origin', () => {
      const p: Polar.Coord = Vector.fromPointPolar({ x: 0, y: 0 });
      expect(p.distance).toBe(0);
      expect(p.angleRadian).toBe(0);
    });
  });

  describe('fromLineCartesian', () => {
    it('returns vector from line a->b', () => {
      const v = Vector.fromLineCartesian({ a: { x: 0, y: 0 }, b: { x: 3, y: 4 } });
      expect(v.x).toBe(3);
      expect(v.y).toBe(4);
    });

    it('handles negative direction', () => {
      const v = Vector.fromLineCartesian({ a: { x: 5, y: 5 }, b: { x: 2, y: 2 } });
      expect(v.x).toBe(-3);
      expect(v.y).toBe(-3);
    });
  });

  describe('fromLinePolar', () => {
    it('returns polar vector from line a->b', () => {
      const v: Polar.Coord = Vector.fromLinePolar({ a: { x: 0, y: 0 }, b: { x: 3, y: 4 } });
      expect(v.distance).closeTo(5, 10);
      expect(v.angleRadian).closeTo(Math.atan2(4, 3), 10);
    });

    it('handles horizontal line', () => {
      const v: Polar.Coord = Vector.fromLinePolar({ a: { x: 0, y: 0 }, b: { x: 5, y: 0 } });
      expect(v.distance).toBe(5);
      expect(v.angleRadian).closeTo(0, 10);
    });

    it('handles vertical line', () => {
      const v: Polar.Coord = Vector.fromLinePolar({ a: { x: 0, y: 0 }, b: { x: 0, y: 5 } });
      expect(v.distance).toBe(5);
      expect(v.angleRadian).closeTo(Math.PI / 2, 10);
    });
  });

  describe('normalise', () => {
    it('normalises cartesian vector to unit length', () => {
      const v = Vector.normalise({ x: 3, y: 4 });
      expect((v as Point).x).closeTo(0.6, 10);
      expect((v as Point).y).closeTo(0.8, 10);
    });

    it('normalises polar vector', () => {
      const v = Vector.normalise({ distance: 5, angleRadian: Math.PI / 4 });
      expect((v as PolarCoord).distance).toBe(1);
      expect((v as PolarCoord).angleRadian).closeTo(Math.PI / 4, 10);
    });

    it('handles zero vector', () => {
      const v = Vector.normalise({ x: 0, y: 0 });
      expect((v as Point).x).toBe(0);
      expect((v as Point).y).toBe(0);
    });
  });

  describe('quadrantOffsetAngle', () => {
    it('returns 0 for Q1 (x >= 0, y >= 0)', () => {
      expect(Vector.quadrantOffsetAngle({ x: 1, y: 1 })).toBe(0);
      expect(Vector.quadrantOffsetAngle({ x: 0, y: 1 })).toBe(0);
      expect(Vector.quadrantOffsetAngle({ x: 1, y: 0 })).toBe(0);
    });

    it('returns π for Q2 (x < 0, y >= 0)', () => {
      expect(Vector.quadrantOffsetAngle({ x: -1, y: 1 })).toBe(Math.PI);
      expect(Vector.quadrantOffsetAngle({ x: -0.1, y: 0 })).toBe(Math.PI);
    });

    it('returns π for Q3 (x < 0, y < 0)', () => {
      expect(Vector.quadrantOffsetAngle({ x: -1, y: -1 })).toBe(Math.PI);
    });

    it('returns 2π for Q4 (x >= 0, y < 0)', () => {
      expect(Vector.quadrantOffsetAngle({ x: 1, y: -1 })).toBe(2 * Math.PI);
      expect(Vector.quadrantOffsetAngle({ x: 0, y: -1 })).toBe(2 * Math.PI);
    });
  });

  describe('toPolar', () => {
    it('converts cartesian point to polar', () => {
      const p: Polar.Coord = Vector.toPolar({ x: 3, y: 4 });
      expect(p.distance).closeTo(5, 10);
      expect(p.angleRadian).closeTo(Math.atan2(4, 3), 10);
    });

    it('returns polar coord unchanged', () => {
      const original: Polar.Coord = { distance: 5, angleRadian: Math.PI / 4 };
      const result = Vector.toPolar(original);
      expect(result).toEqual(original);
    });
  });

  describe('toCartesian', () => {
    it('converts polar coord to cartesian', () => {
      const p = Vector.toCartesian({ distance: 5, angleRadian: Math.PI / 4 });
      expect(p.x).closeTo(5 * Math.cos(Math.PI / 4), 10);
      expect(p.y).closeTo(5 * Math.sin(Math.PI / 4), 10);
    });

    it('returns cartesian point unchanged', () => {
      const original = { x: 3, y: 4 };
      const result = Vector.toCartesian(original);
      expect(result).toEqual(original);
    });
  });

  describe('toString', () => {
    it('formats polar coord', () => {
      const s = Vector.toString({ distance: 5, angleRadian: Math.PI / 4 });
      expect(s).toContain('5');
      expect(s).toContain('45');
    });

    it('formats cartesian point with no default truncation', () => {
      const s = Vector.toString({ x: 3.14159, y: 2.71828 });
      expect(s).toContain('3.14159');
      expect(s).toContain('2.71828');
    });

    it('formats with custom digits', () => {
      const s = Vector.toString({ x: 3.14159, y: 2.71828 }, 2);
      expect(s).toContain('3.14');
    });
  });

  describe('dotProduct', () => {
    it('calculates dot product of two cartesian vectors', () => {
      const a = { x: 1, y: 2 };
      const b = { x: 3, y: 4 };
      expect(Vector.dotProduct(a, b)).toBe(11);
    });

    it('calculates dot product of two polar vectors', () => {
      const a: Polar.Coord = { distance: 1, angleRadian: 0 };
      const b: Polar.Coord = { distance: 1, angleRadian: 0 };
      expect(Vector.dotProduct(a, b)).closeTo(1, 10);
    });

    it('calculates dot product of perpendicular polar vectors', () => {
      const a: Polar.Coord = { distance: 1, angleRadian: 0 };
      const b: Polar.Coord = { distance: 1, angleRadian: Math.PI / 2 };
      expect(Vector.dotProduct(a, b)).closeTo(0, 10);
    });

    it('calculates dot product of opposite polar vectors', () => {
      const a: Polar.Coord = { distance: 2, angleRadian: 0 };
      const b: Polar.Coord = { distance: 3, angleRadian: Math.PI };
      expect(Vector.dotProduct(a, b)).closeTo(-6, 10);
    });
  });

  describe('clampMagnitude', () => {
    it('clamps cartesian vector within range', () => {
      const v = Vector.clampMagnitude({ x: 10, y: 0 }, 5, 2);
      expect((v as Point).x).toBe(5);
      expect((v as Point).y).toBe(0);
    });

    it('clamps cartesian vector below minimum', () => {
      const v = Vector.clampMagnitude({ x: 1, y: 0 }, 5, 2);
      expect((v as Point).x).toBe(2);
      expect((v as Point).y).toBe(0);
    });

    it('clamps polar vector within range', () => {
      const v = Vector.clampMagnitude({ distance: 10, angleRadian: 0 }, 5, 2);
      expect((v as PolarCoord).distance).toBe(5);
    });

    it('uses default min of 0 when specified', () => {
      const v = Vector.clampMagnitude({ x: 1, y: 0 }, 2, 0);
      expect((v as Point).x).toBe(1);
      expect((v as Point).y).toBe(0);
    });
  });

  describe('sum', () => {
    it('adds two cartesian vectors', () => {
      const a = { x: 1, y: 2 };
      const b = { x: 3, y: 4 };
      const result = Vector.sum(a, b);
      expect((result as Point).x).toBe(4);
      expect((result as Point).y).toBe(6);
    });

    it('adds two polar vectors, returns polar', () => {
      const a: Polar.Coord = { distance: 1, angleRadian: 0 };
      const b: Polar.Coord = { distance: 1, angleRadian: 0 };
      const result = Vector.sum(a, b);
      expect((result as PolarCoord).distance).closeTo(2, 10);
    });

    it('adds polar to cartesian, returns cartesian', () => {
      const a = { x: 1, y: 2 };
      const b: Polar.Coord = { distance: 1, angleRadian: 0 };
      const result = Vector.sum(a, b);
      expect((result as Point).x).toBe(2);
      expect((result as Point).y).toBe(2);
    });

    it('adds cartesian to polar, returns polar', () => {
      const a: Polar.Coord = { distance: 1, angleRadian: 0 };
      const b = { x: 1, y: 2 };
      const result = Vector.sum(a, b);
      expect('distance' in result).toBe(true);
    });
  });

  describe('subtract', () => {
    it('subtracts two cartesian vectors', () => {
      const a = { x: 5, y: 6 };
      const b = { x: 3, y: 4 };
      const result = Vector.subtract(a, b);
      expect((result as Point).x).toBe(2);
      expect((result as Point).y).toBe(2);
    });

    it('subtracts two polar vectors, returns polar', () => {
      const a: Polar.Coord = { distance: 5, angleRadian: 0 };
      const b: Polar.Coord = { distance: 3, angleRadian: 0 };
      const result = Vector.subtract(a, b);
      expect((result as PolarCoord).distance).closeTo(2, 10);
    });
  });

  describe('multiply', () => {
    it('multiplies two cartesian vectors', () => {
      const a = { x: 2, y: 3 };
      const b = { x: 4, y: 5 };
      const result = Vector.multiply(a, b);
      expect((result as Point).x).toBe(8);
      expect((result as Point).y).toBe(15);
    });

    it('multiplies two polar vectors, returns polar', () => {
      const a: Polar.Coord = { distance: 2, angleRadian: 0 };
      const b: Polar.Coord = { distance: 3, angleRadian: Math.PI / 2 };
      const result = Vector.multiply(a, b);
      expect((result as PolarCoord).distance).closeTo(6, 10);
    });
  });

  describe('divide', () => {
    it('divides two cartesian vectors', () => {
      const a = { x: 10, y: 12 };
      const b = { x: 2, y: 3 };
      const result = Vector.divide(a, b);
      expect((result as Point).x).toBe(5);
      expect((result as Point).y).toBe(4);
    });

    it('divides two polar vectors, returns polar', () => {
      const a: Polar.Coord = { distance: 10, angleRadian: 0 };
      const b: Polar.Coord = { distance: 2, angleRadian: Math.PI / 4 };
      const result = Vector.divide(a, b);
      expect((result as PolarCoord).distance).closeTo(5, 10);
    });

    it('throws error on division by zero in cartesian', () => {
      const a = { x: 10, y: 12 };
      const b = { x: 0, y: 2 };
      expect(() => Vector.divide(a, b)).toThrow('Cannot divide by zero');
    });
  });
});
