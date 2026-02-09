import { test, expect, describe } from 'vitest';
import * as Lines from '../src/line/index.js';

describe('line', () => {
  describe('Empty and Placeholder', () => {
    test('Empty has zero coordinates', () => {
      expect(Lines.Empty).toEqual({ a: { x: 0, y: 0 }, b: { x: 0, y: 0 } });
    });

    test('Placeholder has NaN coordinates', () => {
      expect(Lines.Placeholder.a.x).toBeNaN();
      expect(Lines.Placeholder.a.y).toBeNaN();
    });

    test('isEmpty detects Empty line', () => {
      expect(Lines.isEmpty(Lines.Empty)).toBe(true);
      expect(Lines.isEmpty({ a: { x: 1, y: 0 }, b: { x: 0, y: 0 } })).toBe(false);
    });

    test('isPlaceholder detects Placeholder line', () => {
      expect(Lines.isPlaceholder(Lines.Placeholder)).toBe(true);
      expect(Lines.isPlaceholder(Lines.Empty)).toBe(false);
    });
  });

  describe('fromNumbers', () => {
    test('creates line from coordinates', () => {
      const line = Lines.fromNumbers(0, 0, 10, 10);
      expect(line.a).toEqual({ x: 0, y: 0 });
      expect(line.b).toEqual({ x: 10, y: 10 });
    });

    test('creates horizontal line', () => {
      const line = Lines.fromNumbers(0, 5, 10, 5);
      expect(line.a.y).toBe(5);
      expect(line.b.y).toBe(5);
    });

    test('creates vertical line', () => {
      const line = Lines.fromNumbers(5, 0, 5, 10);
      expect(line.a.x).toBe(5);
      expect(line.b.x).toBe(5);
    });
  });

  describe('fromPoints', () => {
    test('creates line from points', () => {
      const a = { x: 0, y: 0 };
      const b = { x: 10, y: 10 };
      const line = Lines.fromPoints(a, b);
      expect(line.a).toEqual(a);
      expect(line.b).toEqual(b);
    });
  });

  describe('length', () => {
    test('calculates length of diagonal line', () => {
      const line = Lines.fromNumbers(0, 0, 3, 4);
      expect(Lines.length(line)).toBe(5);
    });

    test('calculates length of horizontal line', () => {
      const line = Lines.fromNumbers(0, 0, 10, 0);
      expect(Lines.length(line)).toBe(10);
    });

    test('calculates length of vertical line', () => {
      const line = Lines.fromNumbers(0, 0, 0, 10);
      expect(Lines.length(line)).toBe(10);
    });

    test('returns 0 for zero-length line', () => {
      const line = Lines.fromNumbers(5, 5, 5, 5);
      expect(Lines.length(line)).toBe(0);
    });
  });

  describe('midpoint', () => {
    test('calculates midpoint of line', () => {
      const line = Lines.fromNumbers(0, 0, 10, 10);
      const mid = Lines.midpoint(line);
      expect(mid.x).toBe(5);
      expect(mid.y).toBe(5);
    });

    test('calculates midpoint of horizontal line', () => {
      const line = Lines.fromNumbers(0, 5, 10, 5);
      const mid = Lines.midpoint(line);
      expect(mid.x).toBe(5);
      expect(mid.y).toBe(5);
    });
  });

  describe('interpolate', () => {
    test('returns start point at t=0', () => {
      const line = Lines.fromNumbers(0, 0, 10, 10);
      const point = Lines.interpolate(0, line);
      expect(point.x).toBe(0);
      expect(point.y).toBe(0);
    });

    test('returns end point at t=1', () => {
      const line = Lines.fromNumbers(0, 0, 10, 10);
      const point = Lines.interpolate(1, line);
      expect(point.x).toBe(10);
      expect(point.y).toBe(10);
    });

    test('returns midpoint at t=0.5', () => {
      const line = Lines.fromNumbers(0, 0, 10, 10);
      const point = Lines.interpolate(0.5, line);
      expect(point.x).toBe(5);
      expect(point.y).toBe(5);
    });

    test('handles interpolation at t=0.25', () => {
      const line = Lines.fromNumbers(0, 0, 10, 10);
      const point = Lines.interpolate(0.25, line);
      expect(point.x).toBe(2.5);
      expect(point.y).toBe(2.5);
    });
  });

  describe('angleRadian', () => {
    test('returns 0 for horizontal line to the right', () => {
      const line = Lines.fromNumbers(0, 0, 10, 0);
      expect(Lines.angleRadian(line)).toBe(0);
    });

    test('returns PI for horizontal line to the left', () => {
      const line = Lines.fromNumbers(10, 0, 0, 0);
      expect(Lines.angleRadian(line)).toBeCloseTo(Math.PI, 5);
    });

    test('returns PI/2 for vertical line up', () => {
      const line = Lines.fromNumbers(0, 10, 0, 0);
      expect(Lines.angleRadian(line)).toBeCloseTo(-Math.PI / 2, 5);
    });

    test('works with two points', () => {
      const angle = Lines.angleRadian({ x: 0, y: 0 }, { x: 10, y: 0 });
      expect(angle).toBe(0);
    });

    test('throws when second point missing', () => {
      expect(() => Lines.angleRadian({ x: 0, y: 0 } as any)).toThrow();
    });
  });

  describe('slope', () => {
    test('returns 1 for 45-degree line', () => {
      const line = Lines.fromNumbers(0, 0, 10, 10);
      expect(Lines.slope(line)).toBe(1);
    });

    test('returns 0 for horizontal line', () => {
      const line = Lines.fromNumbers(0, 5, 10, 5);
      expect(Lines.slope(line)).toBe(0);
    });

    test('works with two points', () => {
      const slope = Lines.slope({ x: 0, y: 0 }, { x: 10, y: 10 });
      expect(slope).toBe(1);
    });

    test('throws when second point missing', () => {
      expect(() => Lines.slope({ x: 0, y: 0 } as any)).toThrow();
    });
  });

  describe('isEqual', () => {
    test('returns true for equal lines', () => {
      const a = Lines.fromNumbers(0, 0, 10, 10);
      const b = Lines.fromNumbers(0, 0, 10, 10);
      expect(Lines.isEqual(a, b)).toBe(true);
    });

    test('returns false for different lines', () => {
      const a = Lines.fromNumbers(0, 0, 10, 10);
      const b = Lines.fromNumbers(0, 0, 10, 20);
      expect(Lines.isEqual(a, b)).toBe(false);
    });
  });

  describe('reverse', () => {
    test('reverses line direction', () => {
      const line = Lines.fromNumbers(0, 0, 10, 10);
      const reversed = Lines.reverse(line);
      expect(reversed.a).toEqual({ x: 10, y: 10 });
      expect(reversed.b).toEqual({ x: 0, y: 0 });
    });
  });

  describe('sum', () => {
    test('adds point to line', () => {
      const line = Lines.fromNumbers(0, 0, 10, 10);
      const sum = Lines.sum(line, { x: 5, y: 5 });
      expect(sum.a).toEqual({ x: 5, y: 5 });
      expect(sum.b).toEqual({ x: 15, y: 15 });
    });
  });

  describe('subtract', () => {
    test('subtracts point from line', () => {
      const line = Lines.fromNumbers(10, 10, 20, 20);
      const diff = Lines.subtract(line, { x: 5, y: 5 });
      expect(diff.a).toEqual({ x: 5, y: 5 });
      expect(diff.b).toEqual({ x: 15, y: 15 });
    });
  });

  describe('multiply', () => {
    test('multiplies line by point', () => {
      const line = Lines.fromNumbers(1, 1, 10, 10);
      const scaled = Lines.multiply(line, { x: 2, y: 2 });
      expect(scaled.a).toEqual({ x: 2, y: 2 });
      expect(scaled.b).toEqual({ x: 20, y: 20 });
    });
  });

  describe('divide', () => {
    test('divides line by point', () => {
      const line = Lines.fromNumbers(10, 10, 20, 20);
      const divided = Lines.divide(line, { x: 2, y: 2 });
      expect(divided.a).toEqual({ x: 5, y: 5 });
      expect(divided.b).toEqual({ x: 10, y: 10 });
    });
  });

  describe('nearest', () => {
    test('returns nearest point on line', () => {
      const line = Lines.fromNumbers(0, 0, 10, 0);
      const point = { x: 5, y: 5 };
      const nearest = Lines.nearest(line, point);
      expect(nearest.x).toBe(5);
      expect(nearest.y).toBe(0);
    });
  });

  describe('distance', () => {
    test('calculates distance from point to line', () => {
      const line = Lines.fromNumbers(0, 0, 10, 0);
      const point = { x: 5, y: 5 };
      const dist = Lines.distance(line, point);
      expect(dist).toBe(5);
    });

    test('returns 0 for point on line', () => {
      const line = Lines.fromNumbers(0, 0, 10, 0);
      const point = { x: 5, y: 0 };
      const dist = Lines.distance(line, point);
      expect(dist).toBe(0);
    });
  });

  describe('withinRange', () => {
    test('returns true when point is within range', () => {
      const line = Lines.fromNumbers(0, 0, 10, 0);
      const point = { x: 5, y: 3 };
      expect(Lines.withinRange(line, point, 5)).toBe(true);
    });

    test('returns false when point is outside range', () => {
      const line = Lines.fromNumbers(0, 0, 10, 0);
      const point = { x: 5, y: 10 };
      expect(Lines.withinRange(line, point, 5)).toBe(false);
    });
  });

  describe('toFlatArray', () => {
    test('converts line to flat array', () => {
      const line = Lines.fromNumbers(1, 2, 3, 4);
      const arr = Lines.toFlatArray(line);
      expect(arr).toEqual([1, 2, 3, 4]);
    });

    test('converts two points to flat array', () => {
      const a = { x: 1, y: 2 };
      const b = { x: 3, y: 4 };
      const arr = Lines.toFlatArray(a, b);
      expect(arr).toEqual([1, 2, 3, 4]);
    });
  });

  describe('fromFlatArray', () => {
    test('creates line from flat array', () => {
      const arr = [1, 2, 3, 4];
      const line = Lines.fromFlatArray(arr);
      expect(line.a).toEqual({ x: 1, y: 2 });
      expect(line.b).toEqual({ x: 3, y: 4 });
    });
  });

  describe('bbox', () => {
    test('calculates bounding box of line', () => {
      const line = Lines.fromNumbers(5, 5, 10, 15);
      const bbox = Lines.bbox(line);
      expect(bbox.x).toBe(5);
      expect(bbox.y).toBe(5);
      expect(bbox.width).toBe(5);
      expect(bbox.height).toBe(10);
    });
  });

  describe('scaleFromMidpoint', () => {
    test('scales line from midpoint', () => {
      const line = Lines.fromNumbers(0, 0, 10, 10);
      const scaled = Lines.scaleFromMidpoint(line, 0.5);
      expect(scaled.a.x).toBeCloseTo(2.5, 5);
      expect(scaled.b.x).toBeCloseTo(7.5, 5);
    });
  });

  describe('extendFromA', () => {
    test('extends line from A point', () => {
      const line = Lines.fromNumbers(0, 0, 10, 0);
      const extended = Lines.extendFromA(line, 10);
      expect(extended.b.x).toBe(20);
    });
  });

  describe('pointsOf', () => {
    test('yields integer points along line', () => {
      const line = Lines.fromNumbers(0, 0, 5, 0);
      const points = Array.from(Lines.pointsOf(line));
      expect(points.length).toBeGreaterThanOrEqual(2);
      expect(points[0]).toEqual({ x: 0, y: 0 });
    });
  });

  describe('apply', () => {
    test('applies function to both points', () => {
      const line = Lines.fromNumbers(1, 2, 3, 4);
      const result = Lines.apply(line, p => ({ x: p.x * 2, y: p.y * 2 }));
      expect(result.a).toEqual({ x: 2, y: 4 });
      expect(result.b).toEqual({ x: 6, y: 8 });
    });
  });

  describe('toSvgString', () => {
    test('generates SVG path command', () => {
      const a = { x: 0, y: 0 };
      const b = { x: 10, y: 10 };
      const result = Lines.toSvgString(a, b);
      expect(result[0]).toBe('M0 0 L 10 10');
    });
  });

  describe('asPoints', () => {
    test('yields all points from lines', () => {
      const lines = [
        Lines.fromNumbers(0, 0, 10, 10),
        Lines.fromNumbers(20, 20, 30, 30)
      ];
      const points = Array.from(Lines.asPoints(lines));
      expect(points.length).toBe(4);
      expect(points[0]).toEqual({ x: 0, y: 0 });
      expect(points[1]).toEqual({ x: 10, y: 10 });
    });
  });
});
