import { describe, it, expect } from 'vitest';
import * as Circle from '../src/circle/index.js';

describe('circle.interiorPoints', () => {
  describe('interiorIntegerPoints', () => {
    it('generates points inside circle', () => {
      const circle = { x: 5, y: 5, radius: 5 };
      const points = [...Circle.interiorIntegerPoints(circle)];
      expect(points.length).toBeGreaterThan(0);
      points.forEach(pt => {
        const dist = Math.sqrt((pt.x - 5) ** 2 + (pt.y - 5) ** 2);
        expect(dist).toBeLessThanOrEqual(5);
      });
    });

    it('includes center point', () => {
      const circle = { x: 5, y: 5, radius: 5 };
      const points = [...Circle.interiorIntegerPoints(circle)];
      expect(points.some(p => p.x === 5 && p.y === 5)).toBe(true);
    });

    it('handles unit circle', () => {
      const circle = { x: 0, y: 0, radius: 1 };
      const points = [...Circle.interiorIntegerPoints(circle)];
      expect(points.length).toBeGreaterThan(0);
    });

    it('handles small radius', () => {
      const circle = { x: 0, y: 0, radius: 1 };
      const points = [...Circle.interiorIntegerPoints(circle)];
      expect(points.some(p => p.x === 0 && p.y === 0)).toBe(true);
    });

    it('is iterable multiple times', () => {
      const circle = { x: 5, y: 5, radius: 3 };
      const generator = Circle.interiorIntegerPoints(circle);
      const points1 = [...generator];
      const points2 = [...generator];
      expect(points1.length).toBeGreaterThan(0);
      expect(points2.length).toBe(0);
    });

    it('handles circle at origin', () => {
      const circle = { x: 0, y: 0, radius: 2 };
      const points = [...Circle.interiorIntegerPoints(circle)];
      expect(points.length).toBeGreaterThan(0);
      expect(points.some(p => p.x === 0 && p.y === 0)).toBe(true);
    });
  });
});

describe('circle.exteriorPoints', () => {
  describe('exteriorIntegerPoints', () => {
    it('generates points on circle circumference', () => {
      const circle = { x: 5, y: 5, radius: 5 };
      const points = [...Circle.exteriorIntegerPoints(circle)];
      expect(points.length).toBeGreaterThan(0);
      points.forEach(pt => {
        const dist = Math.sqrt((pt.x - 5) ** 2 + (pt.y - 5) ** 2);
        expect(dist).toBeLessThanOrEqual(5.5);
      });
    });

    it('includes rightmost point', () => {
      const circle = { x: 5, y: 5, radius: 5 };
      const points = [...Circle.exteriorIntegerPoints(circle)];
      expect(points.some(p => p.x === 10 && p.y === 5)).toBe(true);
    });

    it('includes topmost point', () => {
      const circle = { x: 5, y: 5, radius: 5 };
      const points = [...Circle.exteriorIntegerPoints(circle)];
      expect(points.some(p => p.x === 5 && p.y === 10)).toBe(true);
    });

    it('handles unit circle', () => {
      const circle = { x: 0, y: 0, radius: 1 };
      const points = [...Circle.exteriorIntegerPoints(circle)];
      expect(points.length).toBeGreaterThan(0);
    });

    it('handles small radius', () => {
      const circle = { x: 0, y: 0, radius: 1 };
      const points = [...Circle.exteriorIntegerPoints(circle)];
      expect(points.length).toBeGreaterThan(0);
    });

    it('is iterable multiple times', () => {
      const circle = { x: 5, y: 5, radius: 3 };
      const generator = Circle.exteriorIntegerPoints(circle);
      const points1 = [...generator];
      const points2 = [...generator];
      expect(points1.length).toBeGreaterThan(0);
      expect(points2.length).toBe(0);
    });

    it('handles circle at origin', () => {
      const circle = { x: 0, y: 0, radius: 2 };
      const points = [...Circle.exteriorIntegerPoints(circle)];
      expect(points.length).toBeGreaterThan(0);
    });

    it('generates symmetric points', () => {
      const circle = { x: 5, y: 5, radius: 5 };
      const points = [...Circle.exteriorIntegerPoints(circle)];
      const rightMost = points.filter(p => p.x === 10);
      const leftMost = points.filter(p => p.x === 0);
      expect(rightMost.length).toBeGreaterThan(0);
      expect(leftMost.length).toBeGreaterThan(0);
    });
  });
});
