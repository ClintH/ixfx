import { test, expect, describe } from 'vitest';
import * as Circles from '../src/circle/index.js';

describe('circle', () => {
  describe('guard', () => {
    test('validates circle with radius only', () => {
      expect(() => Circles.guard({ radius: 5 })).not.toThrow();
    });

    test('validates positioned circle', () => {
      expect(() => Circles.guard({ radius: 5, x: 10, y: 10 })).not.toThrow();
    });

    test('throws for negative radius', () => {
      expect(() => Circles.guard({ radius: -5 })).toThrow('radius must be greater than zero');
    });

    test('throws for zero radius', () => {
      expect(() => Circles.guard({ radius: 0 })).toThrow('radius must be greater than zero');
    });

    test('throws for NaN radius', () => {
      expect(() => Circles.guard({ radius: NaN })).toThrow('radius is NaN');
    });
  });

  describe('guardPositioned', () => {
    test('validates positioned circle', () => {
      expect(() => Circles.guardPositioned({ radius: 5, x: 10, y: 10 })).not.toThrow();
    });

    test('throws for non-positioned circle', () => {
      expect(() => Circles.guardPositioned({ radius: 5 } as any)).toThrow('positioned circle');
    });
  });

  describe('isPositioned', () => {
    test('returns true for positioned circle', () => {
      expect(Circles.isPositioned({ radius: 5, x: 10, y: 10 })).toBe(true);
    });

    test('returns false for circle without position', () => {
      expect(Circles.isPositioned({ radius: 5 })).toBe(false);
    });
  });

  describe('isCircle', () => {
    test('returns true for circle object', () => {
      expect(Circles.isCircle({ radius: 5 })).toBe(true);
    });

    test('returns true for positioned circle', () => {
      expect(Circles.isCircle({ radius: 5, x: 10, y: 10 })).toBe(true);
    });

    test('returns false for non-circle', () => {
      expect(Circles.isCircle({ x: 10, y: 10 })).toBe(false);
    });
  });

  describe('isCirclePositioned', () => {
    test('returns true for positioned circle', () => {
      expect(Circles.isCirclePositioned({ radius: 5, x: 10, y: 10 })).toBe(true);
    });

    test('returns false for circle without position', () => {
      expect(Circles.isCirclePositioned({ radius: 5 })).toBe(false);
    });
  });

  describe('isNaN', () => {
    test('returns true for NaN radius', () => {
      expect(Circles.isNaN({ radius: NaN })).toBe(true);
    });

    test('returns true for NaN x in positioned circle', () => {
      expect(Circles.isNaN({ radius: 5, x: NaN, y: 10 })).toBe(true);
    });

    test('returns true for NaN y in positioned circle', () => {
      expect(Circles.isNaN({ radius: 5, x: 10, y: NaN })).toBe(true);
    });

    test('returns false for valid circle', () => {
      expect(Circles.isNaN({ radius: 5, x: 10, y: 10 })).toBe(false);
    });
  });

  describe('area', () => {
    test('calculates area of circle', () => {
      const circle = { radius: 5 };
      expect(Circles.area(circle)).toBeCloseTo(78.54, 1);
    });

    test('calculates area with different radius', () => {
      const circle = { radius: 10 };
      expect(Circles.area(circle)).toBeCloseTo(314.16, 1);
    });

    test('throws for invalid circle', () => {
      expect(() => Circles.area({ radius: -5 })).toThrow();
    });
  });

  describe('circumference', () => {
    test('calculates circumference', () => {
      const circle = { radius: 5 };
      expect(Circles.circumference(circle)).toBeCloseTo(31.42, 1);
    });

    test('circumference of unit circle', () => {
      const circle = { radius: 1 };
      expect(Circles.circumference(circle)).toBeCloseTo(6.28, 1);
    });
  });

  describe('length', () => {
    test('is alias of circumference', () => {
      const circle = { radius: 5 };
      expect(Circles.length(circle)).toBe(Circles.circumference(circle));
    });
  });

  describe('pointOnPerimeter', () => {
    test('returns point at angle 0', () => {
      const circle = { radius: 5, x: 10, y: 10 };
      const point = Circles.pointOnPerimeter(circle, 0);
      expect(point.x).toBeCloseTo(15, 5);
      expect(point.y).toBeCloseTo(10, 5);
    });

    test('returns point at angle PI', () => {
      const circle = { radius: 5, x: 10, y: 10 };
      const point = Circles.pointOnPerimeter(circle, Math.PI);
      expect(point.x).toBeCloseTo(5, 5);
      expect(point.y).toBeCloseTo(10, 5);
    });

    test('returns point at angle PI/2', () => {
      const circle = { radius: 5, x: 10, y: 10 };
      const point = Circles.pointOnPerimeter(circle, Math.PI / 2);
      expect(point.x).toBeCloseTo(10, 5);
      expect(point.y).toBeCloseTo(5, 5);
    });

    test('uses custom origin for non-positioned circle', () => {
      const circle = { radius: 5 };
      const origin = { x: 20, y: 20 };
      const point = Circles.pointOnPerimeter(circle, 0, origin);
      expect(point.x).toBeCloseTo(25, 5);
      expect(point.y).toBeCloseTo(20, 5);
    });
  });

  describe('interpolate', () => {
    test('returns point at t=0', () => {
      const circle = { radius: 5, x: 10, y: 10 };
      const point = Circles.interpolate(circle, 0);
      expect(point.x).toBeCloseTo(15, 5);
      expect(point.y).toBeCloseTo(10, 5);
    });

    test('returns point at t=0.5', () => {
      const circle = { radius: 5, x: 10, y: 10 };
      const point = Circles.interpolate(circle, 0.5);
      expect(point.x).toBeCloseTo(5, 5);
      expect(point.y).toBeCloseTo(10, 5);
    });

    test('returns point at t=0.25', () => {
      const circle = { radius: 5, x: 10, y: 10 };
      const point = Circles.interpolate(circle, 0.25);
      expect(point.x).toBeCloseTo(10, 5);
      expect(point.y).toBeCloseTo(5, 5);
    });
  });

  describe('nearest', () => {
    test('returns nearest point on circle perimeter', () => {
      const circle = { radius: 5, x: 10, y: 10 };
      const point = { x: 20, y: 10 };
      const nearest = Circles.nearest(circle, point);
      expect(nearest.x).toBeCloseTo(15, 5);
      expect(nearest.y).toBeCloseTo(10, 5);
    });

    test('returns nearest from multiple circles', () => {
      const circles = [
        { radius: 5, x: 0, y: 0 },
        { radius: 5, x: 100, y: 0 }
      ];
      const point = { x: 80, y: 0 };
      const nearest = Circles.nearest(circles, point);
      // Should be closest to second circle
      expect(nearest.x).toBeCloseTo(95, 5);
      expect(nearest.y).toBeCloseTo(0, 5);
    });
  });

  describe('isEqual', () => {
    test('returns true for equal circles', () => {
      const a = { radius: 5 };
      const b = { radius: 5 };
      expect(Circles.isEqual(a, b)).toBe(true);
    });

    test('returns false for different radius', () => {
      const a = { radius: 5 };
      const b = { radius: 10 };
      expect(Circles.isEqual(a, b)).toBe(false);
    });

    test('returns true for equal positioned circles', () => {
      const a = { radius: 5, x: 10, y: 10 };
      const b = { radius: 5, x: 10, y: 10 };
      expect(Circles.isEqual(a, b)).toBe(true);
    });

    test('returns false for different position', () => {
      const a = { radius: 5, x: 10, y: 10 };
      const b = { radius: 5, x: 20, y: 10 };
      expect(Circles.isEqual(a, b)).toBe(false);
    });
  });

  describe('multiplyScalar', () => {
    test('scales circle radius', () => {
      const circle = { radius: 5 };
      const result = Circles.multiplyScalar(circle, 2);
      expect(result.radius).toBe(10);
    });

    test('scales position when circle has position', () => {
      const circle = { radius: 5, x: 10, y: 10 };
      const result = Circles.multiplyScalar(circle, 2) as any;
      expect(result.radius).toBe(10);
      expect(result.x).toBe(20);
      expect(result.y).toBe(20);
    });

    test('scales down with factor less than 1', () => {
      const circle = { radius: 10 };
      const result = Circles.multiplyScalar(circle, 0.5);
      expect(result.radius).toBe(5);
    });
  });
});
