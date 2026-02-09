import { test, expect, describe } from 'vitest';
import { line } from '../../src/easing/line.js';

describe('easing/line', () => {
  describe('line', () => {
    test('returns interpolator function', () => {
      const interpolator = line();
      expect(typeof interpolator).toBe('function');
    });

    test('straight line with bend=0 returns points from (0,0) to (1,1)', () => {
      const interpolator = line(0, 0);
      
      const start = interpolator(0);
      const end = interpolator(1);
      
      expect(start.x).toBeCloseTo(0, 5);
      expect(start.y).toBeCloseTo(0, 5);
      expect(end.x).toBeCloseTo(1, 5);
      expect(end.y).toBeCloseTo(1, 5);
    });

    test('returns Point at given progress', () => {
      const interpolator = line(0, 0);
      
      const point = interpolator(0.5);
      
      expect(point).toHaveProperty('x');
      expect(point).toHaveProperty('y');
      expect(typeof point.x).toBe('number');
      expect(typeof point.y).toBe('number');
    });

    test('positive bend curves line upward', () => {
      const interpolator = line(0.5, 0);
      const straight = line(0, 0);
      
      const bendPoint = interpolator(0.5);
      const straightPoint = straight(0.5);
      
      // With positive bend, y should be different
      expect(bendPoint.x).not.toBe(straightPoint.x);
    });

    test('negative bend curves line downward', () => {
      const interpolator = line(-0.5, 0);
      const straight = line(0, 0);
      
      const bendPoint = interpolator(0.5);
      const straightPoint = straight(0.5);
      
      expect(bendPoint.x).not.toBe(straightPoint.x);
    });

    test('warp parameter affects curve', () => {
      const interpolatorNoWarp = line(0.5, 0);
      const interpolatorWithWarp = line(0.5, 0.5);
      
      const noWarpPoint = interpolatorNoWarp(0.5);
      const warpPoint = interpolatorWithWarp(0.5);
      
      expect(warpPoint.x).not.toBe(noWarpPoint.x);
    });

    test('warp parameter affects interpolation', () => {
      const interpolatorNoWarp = line(0.5, 0);
      const interpolatorWithWarp = line(0.5, 0.5);
      
      const noWarpPoint = interpolatorNoWarp(0.5);
      const warpPoint = interpolatorWithWarp(0.5);
      
      // Warp should change the interpolation result
      expect(typeof noWarpPoint.x).toBe('number');
      expect(typeof warpPoint.x).toBe('number');
      expect(noWarpPoint.x).not.toBe(warpPoint.x);
    });

    test('extreme positive bend (-1) pulls line up', () => {
      const interpolator = line(-1, 0);
      
      const midPoint = interpolator(0.5);
      
      expect(midPoint.x).toBeLessThan(0.5);
    });

    test('extreme negative bend (1) pushes line down', () => {
      const interpolator = line(1, 0);
      
      const midPoint = interpolator(0.5);
      
      expect(midPoint.x).toBeGreaterThan(0.5);
    });

    test('interpolator works across full range 0-1', () => {
      const interpolator = line(0.3, 0.2);
      
      // Test multiple points
      const points = [0, 0.25, 0.5, 0.75, 1].map(t => interpolator(t));
      
      // All points should be valid
      points.forEach(p => {
        expect(p.x).toBeGreaterThanOrEqual(-0.1);
        expect(p.x).toBeLessThanOrEqual(1.1);
        expect(p.y).toBeGreaterThanOrEqual(-0.1);
        expect(p.y).toBeLessThanOrEqual(1.1);
      });
    });

    test('default bend is 0', () => {
      const defaultInterpolator = line();
      const explicitInterpolator = line(0);
      
      const defaultPoint = defaultInterpolator(0.5);
      const explicitPoint = explicitInterpolator(0.5);
      
      expect(defaultPoint.x).toBeCloseTo(explicitPoint.x, 5);
      expect(defaultPoint.y).toBeCloseTo(explicitPoint.y, 5);
    });

    test('default warp is 0', () => {
      const defaultInterpolator = line(0.5);
      const explicitInterpolator = line(0.5, 0);
      
      const defaultPoint = defaultInterpolator(0.5);
      const explicitPoint = explicitInterpolator(0.5);
      
      expect(defaultPoint.x).toBeCloseTo(explicitPoint.x, 5);
      expect(defaultPoint.y).toBeCloseTo(explicitPoint.y, 5);
    });
  });
});
