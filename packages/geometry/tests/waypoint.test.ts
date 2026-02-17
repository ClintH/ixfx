import { describe, test, expect } from 'vitest';
import { fromPoints, init } from '../src/waypoint.js';
import { fromPoints as lineFromPoints, toPath } from '../src/line/index.js';

describe('waypoint/fromPoints', () => {
  test('creates waypoints from points', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 10, y: 10 },
      { x: 20, y: 20 }
    ];
    const waypoints = fromPoints(points);
    expect(typeof waypoints).toBe('function');
  });

  test('handles empty points array', () => {
    const waypoints = fromPoints([]);
    const results = waypoints({ x: 5, y: 5 });
    expect(results).toHaveLength(0);
  });

  test('handles single point', () => {
    const points = [{ x: 0, y: 0 }];
    const waypoints = fromPoints(points);
    expect(typeof waypoints).toBe('function');
  });
});

describe('waypoint/init', () => {
  test('initializes waypoint matcher', () => {
    const paths = [
      toPath(lineFromPoints({ x: 0, y: 0 }, { x: 10, y: 0 })),
      toPath(lineFromPoints({ x: 0, y: 10 }, { x: 10, y: 10 }))
    ];
    const waypoints = init(paths);
    expect(typeof waypoints).toBe('function');
  });

  test('finds nearest path for point', () => {
    const paths = [
      toPath(lineFromPoints({ x: 0, y: 0 }, { x: 10, y: 0 })),
      toPath(lineFromPoints({ x: 0, y: 10 }, { x: 10, y: 10 }))
    ];
    const waypoints = init(paths, { maxDistanceFromLine: 10 });
    const results = waypoints({ x: 5, y: 1 });
    
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].path).toBeDefined();
    expect(results[0].nearest).toBeDefined();
    expect(results[0].distance).toBeGreaterThanOrEqual(0);
  });

  test('respects maxDistanceFromLine option', () => {
    const paths = [
      toPath(lineFromPoints({ x: 0, y: 0 }, { x: 10, y: 0 }))
    ];
    const waypoints = init(paths, { maxDistanceFromLine: 0.5 });
    const results = waypoints({ x: 100, y: 100 }); // Far away point
    
    expect(results).toHaveLength(0);
  });

  test('returns empty for empty paths', () => {
    const waypoints = init([]);
    const results = waypoints({ x: 5, y: 5 });
    expect(results).toHaveLength(0);
  });

  test('ranks results by distance', () => {
    const paths = [
      toPath(lineFromPoints({ x: 0, y: 0 }, { x: 10, y: 0 })),   // Closer
      toPath(lineFromPoints({ x: 0, y: 10 }, { x: 10, y: 10 })) // Further
    ];
    const waypoints = init(paths, { maxDistanceFromLine: 10 });
    const results = waypoints({ x: 5, y: 1 });
    
    expect(results.length).toBe(2);
    expect(results[0].rank).toBe(0);
    expect(results[1].rank).toBe(1);
    expect(results[0].distance).toBeLessThanOrEqual(results[1].distance);
  });
});
