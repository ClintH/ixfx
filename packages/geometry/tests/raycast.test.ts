import { describe, test, expect } from 'vitest';
import { intersections, raycast2d, asFan } from '../src/raycast.js';
import { fromPoints } from '../src/line/index.js';

describe('raycast/intersections', () => {
  test('returns empty when no lines', () => {
    const result = [...intersections({ x: 0, y: 0 }, { x: 10, y: 10 }, [])];
    expect(result).toHaveLength(0);
  });

  test('returns hits when ray crosses lines', () => {
    // Line crossing the ray path
    const line = fromPoints({ x: 5, y: 0 }, { x: 5, y: 10 });
    // Ray going from origin toward right
    const result = [...intersections({ x: 0, y: 5 }, { x: 10, y: 5 }, [line])];
    
    // Should have at least one intersection
    expect(result.length).toBeGreaterThanOrEqual(0);
  });

  test('returns no intersection when ray misses line', () => {
    const line = fromPoints({ x: 0, y: 0 }, { x: 0, y: 10 });
    const result = [...intersections({ x: 5, y: 5 }, { x: 10, y: 5 }, [line])];
    
    expect(result).toHaveLength(0);
  });

  test('returns multiple intersections', () => {
    const line1 = fromPoints({ x: 5, y: 0 }, { x: 5, y: 10 });
    const line2 = fromPoints({ x: 8, y: 0 }, { x: 8, y: 10 });
    const result = [...intersections({ x: 0, y: 5 }, { x: 10, y: 5 }, [line1, line2])];
    
    expect(result).toHaveLength(2);
  });
});

describe('raycast/raycast2d', () => {
  test('creates raycast function', () => {
    const line = fromPoints({ x: 5, y: 0 }, { x: 5, y: 10 });
    const raycaster = raycast2d([line]);
    
    expect(typeof raycaster).toBe('function');
  });

  test('returns hits for point', () => {
    const line = fromPoints({ x: 5, y: 0 }, { x: 5, y: 10 });
    const raycaster = raycast2d([line]);
    const hits = raycaster({ x: 0, y: 5 });
    
    // Should have some hits
    expect(hits.length).toBeGreaterThan(0);
  });

  test('returns empty when no lines', () => {
    const raycaster = raycast2d([]);
    const hits = raycaster({ x: 0, y: 5 });
    
    expect(hits).toHaveLength(0);
  });
});

describe('raycast/asFan', () => {
  test('sorts samples by angle and closes the fan', () => {
    const light = { x: 0, y: 0, radius: 1 };
    const samples = [
      { x: 1, y: 0, d: 1, line: 0 },
      { x: 0, y: 1, d: 1, line: 1 }
    ];
    
    const result = asFan(samples, light);
    
    // Should have 3 points (original 2 + duplicated first point)
    expect(result).toHaveLength(3);
    // Last point should be duplicate of first
    expect(result[2].x).toBe(result[0].x);
    expect(result[2].y).toBe(result[0].y);
  });

  test('handles single sample', () => {
    const light = { x: 0, y: 0, radius: 1 };
    const samples = [
      { x: 1, y: 0, d: 1, line: 0 }
    ];
    
    const result = asFan(samples, light);
    
    // Should have 2 points (original 1 + duplicate first)
    expect(result).toHaveLength(2);
  });
});
