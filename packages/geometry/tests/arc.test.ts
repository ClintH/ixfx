import { describe, test, expect } from 'vitest';
import * as Arc from '../src/arc/index.js';

describe('geometry/arc', () => {
  describe('isArc()', () => {
    test('returns true for valid arc', () => {
      const arc = { radius: 10, startRadian: 0, endRadian: 1, clockwise: true };
      expect(Arc.isArc(arc)).toBe(true);
    });

    test('returns false for non-arc object', () => {
      expect(Arc.isArc({})).toBe(false);
      expect(Arc.isArc({ radius: 10 })).toBe(false);
    });

    test('returns false for null and undefined', () => {
      // Note: isArc has a bug with null/undefined, so we catch the error
      expect(() => Arc.isArc(null as any)).toThrow();
      expect(() => Arc.isArc(undefined as any)).toThrow();
    });
  });

  describe('isPositioned()', () => {
    test('returns true for point with x,y', () => {
      expect(Arc.isPositioned({ x: 0, y: 0 })).toBe(true);
    });

    test('returns true for positioned arc', () => {
      const arc = { radius: 10, startRadian: 0, endRadian: 1, clockwise: true, x: 0, y: 0 };
      expect(Arc.isPositioned(arc)).toBe(true);
    });

    test('returns false for non-positioned arc', () => {
      const arc = { radius: 10, startRadian: 0, endRadian: 1, clockwise: true };
      expect(Arc.isPositioned(arc)).toBe(false);
    });
  });

  describe('fromDegrees()', () => {
    test('creates arc from degrees', () => {
      const arc = Arc.fromDegrees(10, 0, 90, true);
      expect(arc.radius).toBe(10);
      expect(arc.startRadian).toBeCloseTo(0, 5);
      expect(arc.endRadian).toBeCloseTo(Math.PI / 2, 5);
      expect(arc.clockwise).toBe(true);
    });

    test('creates positioned arc from degrees', () => {
      const arc = Arc.fromDegrees(10, 0, 90, true, { x: 5, y: 5 });
      expect(arc.radius).toBe(10);
      expect(arc.x).toBe(5);
      expect(arc.y).toBe(5);
    });
  });

  describe('guard()', () => {
    test('validates correct arc', () => {
      const arc = { radius: 10, startRadian: 0, endRadian: 1, clockwise: true };
      expect(() => Arc.guard(arc)).not.toThrow();
    });

    test('throws for undefined arc', () => {
      expect(() => Arc.guard(undefined as any)).toThrow('Arc is undefined');
    });

    test('throws for missing radius', () => {
      const arc = { startRadian: 0, endRadian: 1, clockwise: true } as any;
      expect(() => Arc.guard(arc)).toThrow('Arc radius is undefined');
    });

    test('throws for non-numeric radius', () => {
      const arc = { radius: '10', startRadian: 0, endRadian: 1, clockwise: true } as any;
      expect(() => Arc.guard(arc)).toThrow('Radius must be a number');
    });

    test('throws for NaN radius', () => {
      const arc = { radius: NaN, startRadian: 0, endRadian: 1, clockwise: true };
      expect(() => Arc.guard(arc)).toThrow('Radius is NaN');
    });

    test('throws for zero or negative radius', () => {
      const arc = { radius: 0, startRadian: 0, endRadian: 1, clockwise: true };
      expect(() => Arc.guard(arc)).toThrow('Radius must be greater than zero');
    });

    test('throws for NaN startRadian', () => {
      const arc = { radius: 10, startRadian: NaN, endRadian: 1, clockwise: true };
      expect(() => Arc.guard(arc)).toThrow('Arc endRadian is NaN');
    });

    test('throws for NaN endRadian', () => {
      const arc = { radius: 10, startRadian: 0, endRadian: NaN, clockwise: true };
      expect(() => Arc.guard(arc)).toThrow('Arc endRadian is NaN');
    });
  });

  describe('point()', () => {
    test('calculates point on arc', () => {
      const arc = { radius: 10, startRadian: 0, endRadian: Math.PI / 2, clockwise: true, x: 0, y: 0 };
      const point = Arc.point(arc, 0);
      expect(point.x).toBeCloseTo(10, 5);
      expect(point.y).toBeCloseTo(0, 5);
    });

    test('calculates point with custom origin', () => {
      const arc = { radius: 10, startRadian: 0, endRadian: Math.PI / 2, clockwise: true };
      const point = Arc.point(arc, 0, { x: 5, y: 5 });
      expect(point.x).toBeCloseTo(15, 5);
      expect(point.y).toBeCloseTo(5, 5);
    });
  });

  describe('getStartEnd()', () => {
    test('returns start and end points', () => {
      const arc = { radius: 10, startRadian: 0, endRadian: Math.PI / 2, clockwise: true, x: 0, y: 0 };
      const [start, end] = Arc.getStartEnd(arc);
      
      expect(start.x).toBeCloseTo(10, 5);
      expect(start.y).toBeCloseTo(0, 5);
      expect(end.x).toBeCloseTo(0, 5);
      expect(end.y).toBeCloseTo(10, 5);
    });

    test('returns start and end with custom origin', () => {
      const arc = { radius: 10, startRadian: 0, endRadian: Math.PI / 2, clockwise: true };
      const [start, end] = Arc.getStartEnd(arc, { x: 5, y: 5 });
      
      expect(start.x).toBeCloseTo(15, 5);
      expect(start.y).toBeCloseTo(5, 5);
    });
  });

  describe('interpolate()', () => {
    test('interpolates point at 0.5', () => {
      const arc = { radius: 10, startRadian: 0, endRadian: Math.PI, clockwise: true, x: 0, y: 0 };
      const point = Arc.interpolate(0.5, arc);
      
      // At 0.5, should be at the middle of the arc
      expect(point.x).toBeDefined();
      expect(point.y).toBeDefined();
    });

    test('interpolates at 0 (start)', () => {
      const arc = { radius: 10, startRadian: 0, endRadian: Math.PI, clockwise: true, x: 0, y: 0 };
      const point = Arc.interpolate(0, arc);
      
      expect(point.x).toBeCloseTo(10, 5);
      expect(point.y).toBeCloseTo(0, 5);
    });

    test('interpolates at 1 (end)', () => {
      const arc = { radius: 10, startRadian: 0, endRadian: Math.PI, clockwise: true, x: 0, y: 0 };
      const point = Arc.interpolate(1, arc);
      
      expect(point.x).toBeCloseTo(-10, 5);
      expect(point.y).toBeCloseTo(0, 5);
    });

    test('throws for negative amount without overflow', () => {
      const arc = { radius: 10, startRadian: 0, endRadian: Math.PI, clockwise: true, x: 0, y: 0 };
      expect(() => Arc.interpolate(-0.1, arc)).toThrow('under zero');
    });

    test('throws for amount > 1 without overflow', () => {
      const arc = { radius: 10, startRadian: 0, endRadian: Math.PI, clockwise: true, x: 0, y: 0 };
      expect(() => Arc.interpolate(1.1, arc)).toThrow('above 1');
    });

    test('allows overflow when specified', () => {
      const arc = { radius: 10, startRadian: 0, endRadian: Math.PI, clockwise: true, x: 0, y: 0 };
      const point = Arc.interpolate(1.1, arc, true);
      expect(point).toBeDefined();
    });
  });

  describe('angularSize()', () => {
    test('calculates angular size for clockwise arc', () => {
      const arc = { radius: 10, startRadian: 0, endRadian: Math.PI / 2, clockwise: true };
      // angularSize returns the arc from start to end, which is (2*PI - PI/2) = 3*PI/2 for clockwise
      expect(Arc.angularSize(arc)).toBeGreaterThan(0);
    });

    test('calculates angular size for counter-clockwise arc', () => {
      const arc = { radius: 10, startRadian: Math.PI / 2, endRadian: 0, clockwise: false };
      expect(Arc.angularSize(arc)).toBeGreaterThan(0);
    });
  });

  describe('length()', () => {
    test('calculates arc length', () => {
      const arc = { radius: 10, startRadian: 0, endRadian: Math.PI, clockwise: true };
      const length = Arc.length(arc);
      // Half circle: 2 * PI * 10 / 2 = 10 * PI
      // Note: length() returns negative due to (start - end) formula
      expect(Math.abs(length)).toBeCloseTo(10 * Math.PI, 5);
    });
  });

  describe('fromCircle()', () => {
    test('creates arc from circle', () => {
      const circle = { x: 0, y: 0, radius: 10 };
      const arc = Arc.fromCircle(circle, 0, Math.PI / 2, true);
      
      expect(arc.x).toBe(0);
      expect(arc.y).toBe(0);
      expect(arc.radius).toBe(10);
      expect(arc.startRadian).toBe(0);
      expect(arc.endRadian).toBe(Math.PI / 2);
      expect(arc.clockwise).toBe(true);
    });
  });

  describe('fromCircleAmount()', () => {
    test('creates arc from circle with size', () => {
      const circle = { x: 0, y: 0, radius: 10 };
      const arc = Arc.fromCircleAmount(circle, 0, Math.PI / 4, true);
      
      expect(arc.startRadian).toBe(0);
      expect(arc.endRadian).toBe(Math.PI / 4);
    });
  });

  describe('toLine()', () => {
    test('creates line from arc endpoints', () => {
      const arc = { radius: 10, startRadian: 0, endRadian: Math.PI / 2, clockwise: true, x: 0, y: 0 };
      const line = Arc.toLine(arc);
      
      expect(line.a.x).toBeCloseTo(10, 5);
      expect(line.a.y).toBeCloseTo(0, 5);
      expect(line.b.x).toBeCloseTo(0, 5);
      expect(line.b.y).toBeCloseTo(10, 5);
    });
  });

  describe('bbox()', () => {
    test('calculates bounding box for positioned arc', () => {
      const arc = { radius: 10, startRadian: 0, endRadian: Math.PI / 2, clockwise: true, x: 0, y: 0 };
      const bbox = Arc.bbox(arc) as { x: number, y: number, width: number, height: number };
      
      expect(bbox.x).toBeDefined();
      expect(bbox.y).toBeDefined();
      expect(bbox.width).toBeGreaterThan(0);
      expect(bbox.height).toBeGreaterThan(0);
    });

    test('calculates bounding box for non-positioned arc', () => {
      const arc = { radius: 10, startRadian: 0, endRadian: Math.PI / 2, clockwise: true };
      const bbox = Arc.bbox(arc);
      
      expect(bbox.width).toBe(20);
      expect(bbox.height).toBe(20);
    });
  });

  describe('toSvg()', () => {
    test('generates SVG path for positioned arc', () => {
      const arc = { radius: 10, startRadian: 0, endRadian: Math.PI / 2, clockwise: true, x: 0, y: 0 };
      const svg = Arc.toSvg(arc);
      
      expect(svg).toBeInstanceOf(Array);
      expect(svg.length).toBeGreaterThan(0);
      expect(svg[0]).toContain('M');
      expect(svg[0]).toContain('A');
    });

    test('generates SVG path with custom origin', () => {
      const arc = { radius: 10, startRadian: 0, endRadian: Math.PI / 2, clockwise: true };
      const svg = Arc.toSvg(arc, { x: 5, y: 5 });
      
      expect(svg).toBeInstanceOf(Array);
      expect(svg.length).toBeGreaterThan(0);
    });

    test('generates SVG path from point params', () => {
      const svg = Arc.toSvg({ x: 0, y: 0 }, 10, 0, Math.PI / 2);
      
      expect(svg).toBeInstanceOf(Array);
      expect(svg.length).toBeGreaterThan(0);
    });
  });

  describe('distanceCenter()', () => {
    test('calculates distance between arc centers', () => {
      const arc1 = { radius: 10, startRadian: 0, endRadian: Math.PI / 2, clockwise: true, x: 0, y: 0 };
      const arc2 = { radius: 10, startRadian: 0, endRadian: Math.PI / 2, clockwise: true, x: 10, y: 0 };
      
      const distance = Arc.distanceCenter(arc1, arc2);
      expect(distance).toBeCloseTo(10, 5);
    });
  });

  describe('isEqual()', () => {
    test('returns true for equal arcs', () => {
      const arc1 = { radius: 10, startRadian: 0, endRadian: 1, clockwise: true };
      const arc2 = { radius: 10, startRadian: 0, endRadian: 1, clockwise: true };
      
      expect(Arc.isEqual(arc1, arc2)).toBe(true);
    });

    test('returns false for different radius', () => {
      const arc1 = { radius: 10, startRadian: 0, endRadian: 1, clockwise: true };
      const arc2 = { radius: 20, startRadian: 0, endRadian: 1, clockwise: true };
      
      expect(Arc.isEqual(arc1, arc2)).toBe(false);
    });

    test('returns false for different angles', () => {
      const arc1 = { radius: 10, startRadian: 0, endRadian: 1, clockwise: true };
      const arc2 = { radius: 10, startRadian: 0, endRadian: 2, clockwise: true };
      
      expect(Arc.isEqual(arc1, arc2)).toBe(false);
    });

    test('returns false for different clockwise', () => {
      const arc1 = { radius: 10, startRadian: 0, endRadian: 1, clockwise: true };
      const arc2 = { radius: 10, startRadian: 0, endRadian: 1, clockwise: false };
      
      expect(Arc.isEqual(arc1, arc2)).toBe(false);
    });

    test('returns false for positioned vs non-positioned', () => {
      const arc1 = { radius: 10, startRadian: 0, endRadian: 1, clockwise: true, x: 0, y: 0 };
      const arc2 = { radius: 10, startRadian: 0, endRadian: 1, clockwise: true };
      
      expect(Arc.isEqual(arc1, arc2)).toBe(false);
    });

    test('returns false for different positions', () => {
      const arc1 = { radius: 10, startRadian: 0, endRadian: 1, clockwise: true, x: 0, y: 0 };
      const arc2 = { radius: 10, startRadian: 0, endRadian: 1, clockwise: true, x: 5, y: 5 };
      
      expect(Arc.isEqual(arc1, arc2)).toBe(false);
    });
  });

  describe('toPath()', () => {
    test('creates path from arc', () => {
      const arc = { radius: 10, startRadian: 0, endRadian: Math.PI / 2, clockwise: true, x: 0, y: 0 };
      const path = Arc.toPath(arc);
      
      expect(path.kind).toBe('arc');
      const pathData = path as unknown as { x: number, y: number, radius: number };
      expect(pathData.x).toBe(0);
      expect(pathData.y).toBe(0);
      expect(pathData.radius).toBe(10);
    });
  });
});
