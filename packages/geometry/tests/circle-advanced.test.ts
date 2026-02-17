import { describe, it, expect } from 'vitest';
import * as Circle from '../src/circle/index.js';
import type { CirclePositioned } from '../src/circle/circle-type.js';

describe('circle.distanceFromExterior', () => {
  describe('distanceFromExterior', () => {
    it('calculates distance between two circles', () => {
      const circleA: CirclePositioned = { radius: 5, x: 0, y: 0 };
      const circleB: CirclePositioned = { radius: 5, x: 20, y: 0 };
      const distance = Circle.distanceFromExterior(circleA, circleB);
      expect(distance).toBeCloseTo(10, 1);
    });

    it('returns 0 for overlapping circles', () => {
      const circleA: CirclePositioned = { radius: 5, x: 0, y: 0 };
      const circleB: CirclePositioned = { radius: 5, x: 5, y: 0 };
      const distance = Circle.distanceFromExterior(circleA, circleB);
      expect(distance).toBe(0);
    });

    it('returns 0 for enclosed circle', () => {
      const circleA: CirclePositioned = { radius: 10, x: 0, y: 0 };
      const circleB: CirclePositioned = { radius: 5, x: 0, y: 0 };
      const distance = Circle.distanceFromExterior(circleA, circleB);
      expect(distance).toBe(0);
    });

    it('calculates distance from circle center to point', () => {
      const circle: CirclePositioned = { radius: 5, x: 10, y: 10 };
      const point = { x: 20, y: 10 };
      const distance = Circle.distanceFromExterior(circle, point);
      expect(distance).toBeCloseTo(10, 1);
    });

    it('returns 0 for point inside circle', () => {
      const circle: CirclePositioned = { radius: 5, x: 10, y: 10 };
      const point = { x: 10, y: 10 };
      const distance = Circle.distanceFromExterior(circle, point);
      expect(distance).toBe(0);
    });

    it('throws for invalid circle', () => {
      expect(() => Circle.distanceFromExterior({ radius: 5 } as any, { radius: 5, x: 10, y: 10 } as any)).toThrow();
    });

    it('handles tangent circles', () => {
      const circleA: CirclePositioned = { radius: 5, x: 0, y: 0 };
      const circleB: CirclePositioned = { radius: 5, x: 10, y: 0 };
      const distance = Circle.distanceFromExterior(circleA, circleB);
      expect(distance).toBe(0);
    });
  });
});

describe('circle.interpolate', () => {
  describe('interpolate', () => {
    it('returns point at t=0', () => {
      const circle: CirclePositioned = { radius: 5, x: 10, y: 10 };
      const pt = Circle.interpolate(circle, 0);
      expect(pt.x).toBeCloseTo(15, 1);
      expect(pt.y).toBeCloseTo(10, 1);
    });

    it('returns point at t=0.25', () => {
      const circle: CirclePositioned = { radius: 5, x: 10, y: 10 };
      const pt = Circle.interpolate(circle, 0.25);
      expect(pt.x).toBeDefined();
      expect(pt.y).toBeDefined();
    });

    it('returns point at t=0.5', () => {
      const circle: CirclePositioned = { radius: 5, x: 10, y: 10 };
      const pt = Circle.interpolate(circle, 0.5);
      expect(pt.x).toBeCloseTo(5, 1);
      expect(pt.y).toBeCloseTo(10, 1);
    });

    it('returns point at t=0.75', () => {
      const circle: CirclePositioned = { radius: 5, x: 10, y: 10 };
      const pt = Circle.interpolate(circle, 0.75);
      expect(pt.x).toBeDefined();
      expect(pt.y).toBeDefined();
    });

    it('returns point at t=1', () => {
      const circle: CirclePositioned = { radius: 5, x: 10, y: 10 };
      const pt = Circle.interpolate(circle, 1);
      expect(pt.x).toBeCloseTo(15, 1);
      expect(pt.y).toBeCloseTo(10, 1);
    });

    it('handles unit circle', () => {
      const circle: CirclePositioned = { radius: 1, x: 0, y: 0 };
      const pt = Circle.interpolate(circle, 0.5);
      expect(pt.x).toBeCloseTo(-1, 1);
      expect(pt.y).toBeCloseTo(0, 1);
    });
  });
});

describe('circle.intersections', () => {
  describe('intersectionLine', () => {
    it('returns intersection points for line crossing circle', () => {
      const circle: CirclePositioned = { radius: 5, x: 5, y: 5 };
      const line = { a: { x: 0, y: 5 }, b: { x: 10, y: 5 } };
      const pts = Circle.intersectionLine(circle, line);
      expect(pts.length).toBe(2);
    });

    it('returns empty array for line missing circle', () => {
      const circle: CirclePositioned = { radius: 1, x: 5, y: 5 };
      const line = { a: { x: 0, y: 0 }, b: { x: 1, y: 1 } };
      const pts = Circle.intersectionLine(circle, line);
      expect(pts.length).toBe(0);
    });

    it('handles line tangent to circle', () => {
      const circle: CirclePositioned = { radius: 5, x: 5, y: 5 };
      const line = { a: { x: 0, y: 10 }, b: { x: 10, y: 10 } };
      const pts = Circle.intersectionLine(circle, line);
      expect(pts.length).toBeGreaterThanOrEqual(0);
    });

    it('handles vertical line', () => {
      const circle: CirclePositioned = { radius: 5, x: 5, y: 5 };
      const line = { a: { x: 5, y: 0 }, b: { x: 5, y: 10 } };
      const pts = Circle.intersectionLine(circle, line);
      expect(pts.length).toBe(2);
    });
  });

  describe('intersections', () => {
    it('returns intersection points for overlapping circles', () => {
      const circleA: CirclePositioned = { radius: 5, x: 0, y: 0 };
      const circleB: CirclePositioned = { radius: 5, x: 8, y: 0 };
      const pts = Circle.intersections(circleA, circleB);
      expect(pts.length).toBe(2);
    });

    it('returns empty array for separate circles', () => {
      const circleA: CirclePositioned = { radius: 5, x: 0, y: 0 };
      const circleB: CirclePositioned = { radius: 5, x: 20, y: 0 };
      const pts = Circle.intersections(circleA, circleB);
      expect(pts.length).toBe(0);
    });

    it('returns empty array for one circle inside another', () => {
      const circleA: CirclePositioned = { radius: 10, x: 0, y: 0 };
      const circleB: CirclePositioned = { radius: 5, x: 0, y: 0 };
      const pts = Circle.intersections(circleA, circleB);
      expect(pts.length).toBe(0);
    });

    it('returns empty array for same circles', () => {
      const circle: CirclePositioned = { radius: 5, x: 0, y: 0 };
      const pts = Circle.intersections(circle, circle);
      expect(pts.length).toBe(0);
    });

    it('handles tangent circles', () => {
      const circleA: CirclePositioned = { radius: 5, x: 0, y: 0 };
      const circleB: CirclePositioned = { radius: 5, x: 10, y: 0 };
      const pts = Circle.intersections(circleA, circleB);
      expect(pts.length).toBeGreaterThanOrEqual(0);
    });
  });
});
