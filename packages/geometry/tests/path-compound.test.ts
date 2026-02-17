import { describe, it, expect } from 'vitest';
import * as Path from '../src/path/index.js';
import * as Line from '../src/line/index.js';

describe('path.startEnd', () => {
  describe('getStart', () => {
    it('returns start point of line', () => {
      const line = Line.toPath(Line.fromNumbers(0, 0, 10, 10));
      const start = Path.getStart(line);
      expect(start.x).toBe(0);
      expect(start.y).toBe(0);
    });

    it('returns start point (a) of quadratic bezier', () => {
      const bezier = { a: { x: 1, y: 1 }, b: { x: 5, y: 5 }, cp: { x: 3, y: 0 }, kind: 'bezier/quadratic' as const };
      const start = Path.getStart(bezier as any);
      expect(start.x).toBe(1);
      expect(start.y).toBe(1);
    });
  });

  describe('getEnd', () => {
    it('returns end point of line', () => {
      const line = Line.toPath(Line.fromNumbers(0, 0, 10, 10));
      const end = Path.getEnd(line);
      expect(end.x).toBe(10);
      expect(end.y).toBe(10);
    });

    it('returns end point (b) of quadratic bezier', () => {
      const bezier = { a: { x: 1, y: 1 }, b: { x: 5, y: 5 }, cp: { x: 3, y: 0 }, kind: 'bezier/quadratic' as const };
      const end = Path.getEnd(bezier as any);
      expect(end.x).toBe(5);
      expect(end.y).toBe(5);
    });
  });
});

describe('path.compoundPath', () => {
  const createLinePath = (x1: number, y1: number, x2: number, y2: number) => {
    return Line.toPath(Line.fromNumbers(x1, y1, x2, y2));
  };

  describe('fromPaths', () => {
    it('creates compound path from connected lines', () => {
      const line1 = createLinePath(0, 0, 10, 0);
      const line2 = createLinePath(10, 0, 10, 10);
      const compound = Path.fromPaths(line1, line2);
      expect(compound.kind).toBe('compound');
      expect(compound.segments).toHaveLength(2);
    });

    it('throws for disconnected paths', () => {
      const line1 = createLinePath(0, 0, 10, 0);
      const line2 = createLinePath(20, 0, 20, 10);
      expect(() => Path.fromPaths(line1, line2)).toThrow('does not start at prior path end');
    });
  });

  describe('computeDimensions', () => {
    it('computes total length and widths', () => {
      const line1 = createLinePath(0, 0, 10, 0);
      const line2 = createLinePath(10, 0, 10, 10);
      const dims = Path.computeDimensions([line1, line2]);
      expect(dims.totalLength).toBeCloseTo(20, 0);
      expect(dims.lengths).toHaveLength(2);
      expect(dims.widths).toHaveLength(2);
    });
  });

  describe('bbox', () => {
    it('computes bounding box for all paths', () => {
      const line1 = createLinePath(0, 0, 10, 0);
      const line2 = createLinePath(10, 0, 10, 10);
      const bbox = Path.bbox([line1, line2]);
      expect(bbox.x).toBe(0);
      expect(bbox.y).toBe(0);
      expect(bbox.width).toBe(10);
      expect(bbox.height).toBe(10);
    });
  });

  describe('guardContinuous', () => {
    it('does not throw for connected paths', () => {
      const line1 = createLinePath(0, 0, 10, 0);
      const line2 = createLinePath(10, 0, 10, 10);
      expect(() => Path.guardContinuous([line1, line2])).not.toThrow();
    });

    it('throws for disconnected paths', () => {
      const line1 = createLinePath(0, 0, 10, 0);
      const line2 = createLinePath(20, 0, 20, 10);
      expect(() => Path.guardContinuous([line1, line2])).toThrow('does not start at prior path end');
    });
  });

  describe('toString', () => {
    it('formats paths as string', () => {
      const line1 = createLinePath(0, 0, 10, 0);
      const line2 = createLinePath(10, 0, 10, 10);
      const s = Path.toString([line1, line2]);
      expect(s).toContain('(0,0)');
      expect(s).toContain('(10,10)');
    });
  });

  describe('setSegment', () => {
    it('returns a new compound path', () => {
      const line1 = createLinePath(0, 0, 10, 0);
      const line2 = createLinePath(10, 0, 10, 10);
      const line3 = createLinePath(10, 10, 20, 10);
      const compound = Path.fromPaths(line1, line2);
      const newCompound = Path.setSegment(compound, 0, line1);
      expect(newCompound.segments).toHaveLength(2);
    });
  });

  describe('interpolate', () => {
    it('interpolates at t=0', () => {
      const line1 = createLinePath(0, 0, 10, 0);
      const line2 = createLinePath(10, 0, 10, 10);
      const compound = Path.fromPaths(line1, line2);
      const pt = compound.interpolate(0);
      expect(pt.x).toBe(0);
      expect(pt.y).toBe(0);
    });

    it('interpolates at t=1', () => {
      const line1 = createLinePath(0, 0, 10, 0);
      const line2 = createLinePath(10, 0, 10, 10);
      const compound = Path.fromPaths(line1, line2);
      const pt = compound.interpolate(1);
      expect(pt.x).toBe(10);
      expect(pt.y).toBe(10);
    });

    it('interpolates at t=0.5', () => {
      const line1 = createLinePath(0, 0, 10, 0);
      const line2 = createLinePath(10, 0, 10, 10);
      const compound = Path.fromPaths(line1, line2);
      const pt = compound.interpolate(0.5);
      expect(pt.x).toBe(10);
      expect(pt.y).toBe(0);
    });
  });

  describe('distanceToPoint', () => {
    it('calculates shortest distance to any path', () => {
      const line1 = createLinePath(0, 0, 10, 0);
      const line2 = createLinePath(10, 0, 10, 10);
      const compound = Path.fromPaths(line1, line2);
      const distance = compound.distanceToPoint({ x: 5, y: 5 });
      expect(distance).toBeCloseTo(5, 1);
    });
  });

  describe('toSvgString', () => {
    it('returns SVG path strings', () => {
      const line1 = createLinePath(0, 0, 10, 0);
      const line2 = createLinePath(10, 0, 10, 10);
      const compound = Path.fromPaths(line1, line2);
      const svg = compound.toSvgString();
      expect(svg.length).toBe(2);
      expect(svg[0]).toContain('M');
      expect(svg[0]).toContain('L');
    });
  });
});
