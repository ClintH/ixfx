import { describe, it, expect } from 'vitest';
import * as SurfacePoints from '../src/surface-points.js';

describe('surfacePoints', () => {
  describe('circleVogelSpiral', () => {
    it('generates points for unit circle by default', () => {
      const points = [...SurfacePoints.circleVogelSpiral()];
      expect(points.length).toBeGreaterThan(0);
      expect(points[0].x).closeTo(1, 1);
      expect(points[0].y).closeTo(0, 1);
    });

    it('generates points for custom circle', () => {
      const circle = { radius: 100, x: 50, y: 50 };
      const points = [...SurfacePoints.circleVogelSpiral(circle, { maxPoints: 10 })];
      expect(points.length).toBe(10);
      expect(points[0].x).closeTo(50, 1);
      expect(points[0].y).closeTo(50, 1);
    });

    it('respects maxPoints limit', () => {
      const points = [...SurfacePoints.circleVogelSpiral(undefined, { maxPoints: 5 })];
      expect(points.length).toBe(5);
    });

    it('respects density option', () => {
      const pointsDense = [...SurfacePoints.circleVogelSpiral(undefined, { maxPoints: 10, density: 0.99 })];
      const pointsSparse = [...SurfacePoints.circleVogelSpiral(undefined, { maxPoints: 10, density: 0.5 })];
      expect(pointsDense.length).toBe(10);
      expect(pointsSparse.length).toBe(10);
    });

    it('respects spacing option', () => {
      const points = [...SurfacePoints.circleVogelSpiral({ radius: 10 }, { maxPoints: 5, spacing: 1 })];
      expect(points.length).toBe(5);
      expect(points[4].x).toBeDefined();
    });

    it('applies rotation offset', () => {
      const pointsNoRotation = [...SurfacePoints.circleVogelSpiral(undefined, { maxPoints: 1 })];
      const pointsWithRotation = [...SurfacePoints.circleVogelSpiral(undefined, { maxPoints: 1, rotation: Math.PI / 2 })];
      expect(pointsNoRotation[0].x).closeTo(1, 1);
      expect(pointsNoRotation[0].y).closeTo(0, 1);
      expect(pointsWithRotation[0].x).closeTo(0, 1);
      expect(pointsWithRotation[0].y).closeTo(1, 1);
    });

    it('is iterable multiple times', () => {
      const generator = SurfacePoints.circleVogelSpiral(undefined, { maxPoints: 3 });
      const points1 = [...generator];
      const points2 = [...generator];
      expect(points1.length).toBe(3);
      expect(points2.length).toBe(0);
    });
  });

  describe('sphereFibonacci', () => {
    it('generates points for unit sphere by default', () => {
      const points = [...SurfacePoints.sphereFibonacci()];
      expect(points.length).toBe(100);
      expect(points[0]).toHaveProperty('x');
      expect(points[0]).toHaveProperty('y');
      expect(points[0]).toHaveProperty('z');
    });

    it('generates correct number of samples', () => {
      const points = [...SurfacePoints.sphereFibonacci(50)];
      expect(points.length).toBe(50);
    });

    it('generates points for custom sphere', () => {
      const sphere = { x: 10, y: 20, z: 30, radius: 5 };
      const points = [...SurfacePoints.sphereFibonacci(10, 0, sphere)];
      expect(points.length).toBe(10);
      expect(points[0].x).toBeDefined();
      expect(points[0].y).toBeLessThan(20);
      expect(points[0].z).toBeDefined();
    });

    it('applies rotation', () => {
      const pointsNoRotation = [...SurfacePoints.sphereFibonacci(10, 0)];
      const pointsWithRotation = [...SurfacePoints.sphereFibonacci(10, Math.PI)];
      expect(pointsNoRotation.length).toBe(10);
      expect(pointsWithRotation.length).toBe(10);
    });

    it('produces points with varying coordinates', () => {
      const points = [...SurfacePoints.sphereFibonacci(20)];
      const uniqueX = new Set(points.map(p => p.x.toFixed(3)));
      const uniqueY = new Set(points.map(p => p.y.toFixed(3)));
      expect(uniqueX.size).toBeGreaterThan(1);
      expect(uniqueY.size).toBeGreaterThan(1);
    });
  });

  describe('ring', () => {
    it('generates points with count option', () => {
      const circle = { radius: 10, x: 0, y: 0 };
      const points = [...SurfacePoints.ring(circle, { count: 4 })];
      expect(points.length).toBe(4);
      expect(points[0].x).closeTo(10, 5);
      expect(points[0].y).closeTo(0, 5);
    });

    it('generates points with radian interval', () => {
      const circle = { radius: 1, x: 0, y: 0 };
      const points = [...SurfacePoints.ring(circle, { radians: Math.PI / 2 })];
      expect(points.length).toBe(4);
    });

    it('generates points with degree interval', () => {
      const circle = { radius: 1, x: 0, y: 0 };
      const points = [...SurfacePoints.ring(circle, { degrees: 90 })];
      expect(points.length).toBe(4);
    });

    it('applies offset', () => {
      const circle = { radius: 10, x: 0, y: 0 };
      const pointsNoOffset = [...SurfacePoints.ring(circle, { count: 4, offset: 0 })];
      const pointsWithOffset = [...SurfacePoints.ring(circle, { count: 4, offset: Math.PI / 2 })];
      expect(pointsNoOffset.length).toBe(4);
      expect(pointsWithOffset.length).toBe(4);
      expect(pointsNoOffset[0].x).closeTo(10, 1);
      expect(pointsWithOffset[0].x).closeTo(0, 1);
    });

    it('throws on negative offset', () => {
      const circle = { radius: 10, x: 0, y: 0 };
      expect(() => [...SurfacePoints.ring(circle, { count: 4, offset: -0.1 })]).toThrow('Offset should be at least 0');
    });

    it('throws on offset greater than 2*PI', () => {
      const circle = { radius: 10, x: 0, y: 0 };
      expect(() => [...SurfacePoints.ring(circle, { count: 4, offset: Math.PI * 3 })]).toThrow('Offset should be less than 2*PI');
    });

    it('throws on zero interval', () => {
      const circle = { radius: 10, x: 0, y: 0 };
      expect(() => [...SurfacePoints.ring(circle, { radians: 0 })]).toThrow('Interval cannot be 0');
    });

    it('handles custom circle position', () => {
      const circle = { radius: 5, x: 100, y: 200 };
      const points = [...SurfacePoints.ring(circle, { count: 3 })];
      expect(points.length).toBe(3);
      expect(points[0].x).closeTo(105, 1);
      expect(points[0].y).closeTo(200, 1);
    });
  });
});
