import { describe, it, expect } from 'vitest';
import * as Circle from '../src/circle/index.js';
import type { CirclePositioned } from '../src/circle/circle-type.js';

describe('circle.svg', () => {
  describe('toSvg', () => {
    it('creates SVG path for positioned circle', () => {
      const circle: CirclePositioned = { radius: 5, x: 10, y: 20 };
      const svg = Circle.toSvg(circle, true);
      expect(svg.length).toBeGreaterThan(0);
      expect(svg.join('')).toContain('M');
    });

    it('creates different SVG for different sweep values', () => {
      const circle: CirclePositioned = { radius: 5, x: 10, y: 20 };
      const svgSweep1 = Circle.toSvg(circle, true).join('');
      const svgSweep0 = Circle.toSvg(circle, false).join('');
      expect(svgSweep1).not.toEqual(svgSweep0);
    });
  });
});

describe('circle.toPath', () => {
  describe('toPath', () => {
    it('converts positioned circle to circular path', () => {
      const circle: CirclePositioned = { radius: 5, x: 10, y: 20 };
      const path = Circle.toPath(circle);
      expect(path.kind).toBe('circular');
      expect(path.radius).toBe(5);
    });

    it('has interpolate method', () => {
      const circle: CirclePositioned = { radius: 5, x: 10, y: 10 };
      const path = Circle.toPath(circle);
      const pt = path.interpolate(0);
      expect(pt.x).toBeCloseTo(15, 1);
      expect(pt.y).toBeCloseTo(10, 1);
    });

    it('has bbox method', () => {
      const circle: CirclePositioned = { radius: 5, x: 10, y: 10 };
      const path = Circle.toPath(circle);
      const box = path.bbox();
      expect(box.x).toBe(5);
      expect(box.y).toBe(5);
      expect(box.width).toBe(10);
      expect(box.height).toBe(10);
    });

    it('has length method', () => {
      const circle: CirclePositioned = { radius: 5, x: 10, y: 10 };
      const path = Circle.toPath(circle);
      const len = path.length();
      expect(len).toBeCloseTo(2 * Math.PI * 5, 1);
    });

    it('has toSvgString method', () => {
      const circle: CirclePositioned = { radius: 5, x: 10, y: 10 };
      const path = Circle.toPath(circle);
      const svg = path.toSvgString();
      expect(svg.length).toBeGreaterThan(0);
    });

    it('has nearest method', () => {
      const circle: CirclePositioned = { radius: 5, x: 10, y: 10 };
      const path = Circle.toPath(circle);
      const nearest = path.nearest({ x: 20, y: 10 });
      expect(nearest.x).toBeCloseTo(15, 1);
      expect(nearest.y).toBeCloseTo(10, 1);
    });

    it('throws for relativePosition', () => {
      const circle: CirclePositioned = { radius: 5, x: 10, y: 10 };
      const path = Circle.toPath(circle);
      expect(() => path.relativePosition({ x: 10, y: 10 }, 1)).toThrow('Not implemented');
    });

    it('throws for distanceToPoint', () => {
      const circle: CirclePositioned = { radius: 5, x: 10, y: 10 };
      const path = Circle.toPath(circle);
      expect(() => path.distanceToPoint({ x: 10, y: 10 })).toThrow('Not implemented');
    });
  });
});

describe('circle.circularPath type', () => {
  it('is a Path type', () => {
    const circle: CirclePositioned = { radius: 5, x: 10, y: 20 };
    const path = Circle.toPath(circle);
    expect(path.kind).toBe('circular');
    expect(path.length).toBeDefined();
    expect(path.interpolate).toBeDefined();
    expect(path.bbox).toBeDefined();
  });
});
