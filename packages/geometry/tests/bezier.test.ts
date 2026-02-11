import { describe, test, expect } from 'vitest';
import * as Bezier from '../src/bezier/index.js';
import { isQuadraticBezier, isCubicBezier } from '../src/bezier/guard.js';

describe('geometry/bezier', () => {
  describe('isQuadraticBezier()', () => {
    test('returns true for quadratic bezier', () => {
      const q = { a: { x: 0, y: 0 }, b: { x: 10, y: 10 }, quadratic: { x: 5, y: 0 } };
      expect(isQuadraticBezier(q)).toBe(true);
    });

    test('returns false for cubic bezier', () => {
      const c = { a: { x: 0, y: 0 }, b: { x: 10, y: 10 }, cubic1: { x: 3, y: 3 }, cubic2: { x: 7, y: 7 } };
      expect(isQuadraticBezier(c)).toBe(false);
    });

    test('returns false for regular object', () => {
      expect(isQuadraticBezier({} as any)).toBe(false);
      expect(isQuadraticBezier({ a: { x: 0, y: 0 } } as any)).toBe(false);
    });
  });

  describe('isCubicBezier()', () => {
    test('returns true for cubic bezier', () => {
      const c = { a: { x: 0, y: 0 }, b: { x: 10, y: 10 }, cubic1: { x: 3, y: 3 }, cubic2: { x: 7, y: 7 } };
      expect(isCubicBezier(c)).toBe(true);
    });

    test('returns false for quadratic bezier', () => {
      const q = { a: { x: 0, y: 0 }, b: { x: 10, y: 10 }, quadratic: { x: 5, y: 0 } };
      expect(isCubicBezier(q)).toBe(false);
    });

    test('returns false when missing one cubic handle', () => {
      const c = { a: { x: 0, y: 0 }, b: { x: 10, y: 10 }, cubic1: { x: 3, y: 3 } } as any;
      expect(isCubicBezier(c)).toBe(false);
    });

    test('returns false for regular object', () => {
      expect(isCubicBezier({} as any)).toBe(false);
    });
  });

  describe('quadratic()', () => {
    test('creates quadratic bezier', () => {
      const start = { x: 0, y: 0 };
      const end = { x: 10, y: 10 };
      const handle = { x: 5, y: 0 };
      
      const q = Bezier.quadratic(start, end, handle);
      
      expect(q.a).toEqual(start);
      expect(q.b).toEqual(end);
      expect(q.quadratic).toEqual(handle);
    });

    test('freezes the points', () => {
      const q = Bezier.quadratic({ x: 0, y: 0 }, { x: 10, y: 10 }, { x: 5, y: 0 });
      
      expect(Object.isFrozen(q.a)).toBe(true);
      expect(Object.isFrozen(q.b)).toBe(true);
      expect(Object.isFrozen(q.quadratic)).toBe(true);
    });
  });

  describe('cubic()', () => {
    test('creates cubic bezier', () => {
      const start = { x: 0, y: 0 };
      const end = { x: 10, y: 10 };
      const cubic1 = { x: 3, y: 0 };
      const cubic2 = { x: 7, y: 10 };
      
      const c = Bezier.cubic(start, end, cubic1, cubic2);
      
      expect(c.a).toEqual(start);
      expect(c.b).toEqual(end);
      expect(c.cubic1).toEqual(cubic1);
      expect(c.cubic2).toEqual(cubic2);
    });

    test('freezes the points', () => {
      const c = Bezier.cubic({ x: 0, y: 0 }, { x: 10, y: 10 }, { x: 3, y: 0 }, { x: 7, y: 10 });
      
      expect(Object.isFrozen(c.a)).toBe(true);
      expect(Object.isFrozen(c.b)).toBe(true);
      expect(Object.isFrozen(c.cubic1)).toBe(true);
      expect(Object.isFrozen(c.cubic2)).toBe(true);
    });
  });

  describe('quadraticSimple()', () => {
    test('creates quadratic bezier with bend 0', () => {
      const q = Bezier.quadraticSimple({ x: 0, y: 0 }, { x: 10, y: 10 }, 0);
      
      expect(q.a).toEqual({ x: 0, y: 0 });
      expect(q.b).toEqual({ x: 10, y: 10 });
      expect(q.quadratic).toBeDefined();
    });

    test('creates quadratic bezier with positive bend', () => {
      const q = Bezier.quadraticSimple({ x: 0, y: 0 }, { x: 10, y: 10 }, 0.5);
      
      expect(q.a).toEqual({ x: 0, y: 0 });
      expect(q.b).toEqual({ x: 10, y: 10 });
      expect(q.quadratic).toBeDefined();
    });

    test('creates quadratic bezier with negative bend', () => {
      const q = Bezier.quadraticSimple({ x: 0, y: 0 }, { x: 10, y: 10 }, -0.5);
      
      expect(q.a).toEqual({ x: 0, y: 0 });
      expect(q.b).toEqual({ x: 10, y: 10 });
      expect(q.quadratic).toBeDefined();
    });

    test('throws for NaN bend', () => {
      expect(() => Bezier.quadraticSimple({ x: 0, y: 0 }, { x: 10, y: 10 }, NaN)).toThrow('bend is NaN');
    });

    test('throws for bend < -1', () => {
      expect(() => Bezier.quadraticSimple({ x: 0, y: 0 }, { x: 10, y: 10 }, -1.5)).toThrow('Expects bend range of -1 to 1');
    });

    test('throws for bend > 1', () => {
      expect(() => Bezier.quadraticSimple({ x: 0, y: 0 }, { x: 10, y: 10 }, 1.5)).toThrow('Expects bend range of -1 to 1');
    });

    test('handles upward slope', () => {
      const q = Bezier.quadraticSimple({ x: 0, y: 10 }, { x: 10, y: 0 }, 0.5);
      expect(q.quadratic).toBeDefined();
    });

    test('handles downward slope', () => {
      const q = Bezier.quadraticSimple({ x: 0, y: 0 }, { x: 10, y: 10 }, 0.5);
      expect(q.quadratic).toBeDefined();
    });
  });

  describe('interpolator()', () => {
    test('interpolates quadratic bezier at 0', () => {
      const q = Bezier.quadratic({ x: 0, y: 0 }, { x: 10, y: 10 }, { x: 5, y: 0 });
      const interp = Bezier.interpolator(q);
      
      const point = interp(0);
      expect(point.x).toBeCloseTo(0, 5);
      expect(point.y).toBeCloseTo(0, 5);
    });

    test('interpolates quadratic bezier at 1', () => {
      const q = Bezier.quadratic({ x: 0, y: 0 }, { x: 10, y: 10 }, { x: 5, y: 0 });
      const interp = Bezier.interpolator(q);
      
      const point = interp(1);
      expect(point.x).toBeCloseTo(10, 5);
      expect(point.y).toBeCloseTo(10, 5);
    });

    test('interpolates quadratic bezier at 0.5', () => {
      const q = Bezier.quadratic({ x: 0, y: 0 }, { x: 10, y: 10 }, { x: 5, y: 0 });
      const interp = Bezier.interpolator(q);
      
      const point = interp(0.5);
      expect(point.x).toBeDefined();
      expect(point.y).toBeDefined();
    });

    test('interpolates cubic bezier at 0', () => {
      const c = Bezier.cubic({ x: 0, y: 0 }, { x: 10, y: 10 }, { x: 3, y: 0 }, { x: 7, y: 10 });
      const interp = Bezier.interpolator(c);
      
      const point = interp(0);
      expect(point.x).toBeCloseTo(0, 5);
      expect(point.y).toBeCloseTo(0, 5);
    });

    test('interpolates cubic bezier at 1', () => {
      const c = Bezier.cubic({ x: 0, y: 0 }, { x: 10, y: 10 }, { x: 3, y: 0 }, { x: 7, y: 10 });
      const interp = Bezier.interpolator(c);
      
      const point = interp(1);
      expect(point.x).toBeCloseTo(10, 5);
      expect(point.y).toBeCloseTo(10, 5);
    });
  });

  describe('quadraticToSvgString()', () => {
    test('generates SVG path string', () => {
      const svg = Bezier.quadraticToSvgString({ x: 0, y: 0 }, { x: 10, y: 10 }, { x: 5, y: 0 });
      
      expect(svg).toBeInstanceOf(Array);
      expect(svg.length).toBe(1);
      expect(svg[0]).toContain('M 0 0');
      expect(svg[0]).toContain('Q 5 0 10 10');
    });
  });

  describe('toPath()', () => {
    test('creates path from quadratic bezier', () => {
      const q = Bezier.quadratic({ x: 0, y: 0 }, { x: 10, y: 10 }, { x: 5, y: 0 });
      const path = Bezier.toPath(q);
      
      expect(path.kind).toBe('bezier/quadratic');
      expect(typeof path.length).toBe('function');
      expect(typeof path.interpolate).toBe('function');
      expect(typeof path.bbox).toBe('function');
      expect(typeof path.toSvgString).toBe('function');
    });

    test('creates path from cubic bezier', () => {
      const c = Bezier.cubic({ x: 0, y: 0 }, { x: 10, y: 10 }, { x: 3, y: 0 }, { x: 7, y: 10 });
      const path = Bezier.toPath(c);
      
      expect(path.kind).toBe('bezier/cubic');
      expect(typeof path.length).toBe('function');
      expect(typeof path.interpolate).toBe('function');
      expect(typeof path.bbox).toBe('function');
    });

    test('throws for unknown bezier type', () => {
      expect(() => Bezier.toPath({} as any)).toThrow('Unknown bezier type');
    });
  });

  describe('QuadraticBezierPath', () => {
    test('calculates length', () => {
      const q = Bezier.quadratic({ x: 0, y: 0 }, { x: 10, y: 10 }, { x: 5, y: 0 });
      const path = Bezier.toPath(q);
      
      const length = path.length();
      expect(length).toBeGreaterThan(0);
    });

    test('interpolates points', () => {
      const q = Bezier.quadratic({ x: 0, y: 0 }, { x: 10, y: 10 }, { x: 5, y: 0 });
      const path = Bezier.toPath(q);
      
      const point = path.interpolate(0.5);
      expect(point.x).toBeDefined();
      expect(point.y).toBeDefined();
    });

    test('calculates bounding box', () => {
      const q = Bezier.quadratic({ x: 0, y: 0 }, { x: 10, y: 10 }, { x: 5, y: 0 });
      const path = Bezier.toPath(q);
      
      const bbox = path.bbox();
      expect(bbox.width).toBeGreaterThan(0);
      expect(bbox.height).toBeGreaterThan(0);
    });

    test('generates SVG string', () => {
      const q = Bezier.quadratic({ x: 0, y: 0 }, { x: 10, y: 10 }, { x: 5, y: 0 });
      const path = Bezier.toPath(q);
      
      const svg = path.toSvgString();
      expect(svg).toBeInstanceOf(Array);
      expect(svg.length).toBeGreaterThan(0);
    });
  });

  describe('CubicBezierPath', () => {
    test('calculates length', () => {
      const c = Bezier.cubic({ x: 0, y: 0 }, { x: 10, y: 10 }, { x: 3, y: 0 }, { x: 7, y: 10 });
      const path = Bezier.toPath(c);
      
      const length = path.length();
      expect(length).toBeGreaterThan(0);
    });

    test('interpolates points', () => {
      const c = Bezier.cubic({ x: 0, y: 0 }, { x: 10, y: 10 }, { x: 3, y: 0 }, { x: 7, y: 10 });
      const path = Bezier.toPath(c);
      
      const point = path.interpolate(0.5);
      expect(point.x).toBeDefined();
      expect(point.y).toBeDefined();
    });

    test('calculates bounding box', () => {
      const c = Bezier.cubic({ x: 0, y: 0 }, { x: 10, y: 10 }, { x: 3, y: 0 }, { x: 7, y: 10 });
      const path = Bezier.toPath(c);
      
      const bbox = path.bbox();
      expect(bbox.width).toBeGreaterThan(0);
      expect(bbox.height).toBeGreaterThan(0);
    });
  });
});
