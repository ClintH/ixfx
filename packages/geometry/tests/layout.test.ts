import { describe, test, expect } from 'vitest';
import { CirclePacking, circleRings } from '../src/layout.js';

describe('layout/circle-packing', () => {
  test('random throws on non-array input', () => {
    // @ts-expect-error - testing invalid input
    expect(() => CirclePacking.random('not an array', { x: 0, y: 0, radius: 10 })).toThrow();
  });

  test('random places circles in container', () => {
    const circles = [
      { radius: 5 },
      { radius: 3 },
      { radius: 2 }
    ];
    const container = { x: 0, y: 0, radius: 20 };
    const result = CirclePacking.random(circles, container);
    
    expect(result).toBeInstanceOf(Array);
    // All circles should be positioned
    for (const c of result) {
      expect(c.x).toBeDefined();
      expect(c.y).toBeDefined();
      expect(c.radius).toBeDefined();
    }
  });

  test('random with empty array returns empty', () => {
    const container = { x: 0, y: 0, radius: 20 };
    const result = CirclePacking.random([], container);
    expect(result).toHaveLength(0);
  });

  test('random with custom attempts', () => {
    const circles = [{ radius: 5 }];
    const container = { x: 0, y: 0, radius: 20 };
    const result = CirclePacking.random(circles, container, { attempts: 10 });
    expect(result).toBeInstanceOf(Array);
  });
});

describe('layout/circle-rings', () => {
  test('generates points in rings', () => {
    const circle = { x: 0, y: 0, radius: 10 };
    const result = [...circleRings(circle, { rings: 2 })];
    
    expect(result.length).toBeGreaterThan(0);
    // First point should be at center
    expect(result[0]).toEqual({ x: 0, y: 0 });
  });

  test('uses default values when no circle provided', () => {
    const result = [...circleRings()];
    
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toEqual({ x: 0, y: 0 });
  });

  test('respects rings option', () => {
    const circle = { x: 5, y: 5, radius: 10 };
    const result2 = [...circleRings(circle, { rings: 2 })];
    const result5 = [...circleRings(circle, { rings: 5 })];
    
    // More rings should give more points
    expect(result5.length).toBeGreaterThan(result2.length);
  });

  test('respects rotation option', () => {
    const circle = { x: 0, y: 0, radius: 10 };
    const resultNoRotation = [...circleRings(circle, { rings: 1, rotation: 0 })];
    const resultWithRotation = [...circleRings(circle, { rings: 1, rotation: Math.PI / 2 })];
    
    // First point after center should be different with rotation
    expect(resultNoRotation[1]).not.toEqual(resultWithRotation[1]);
  });
});
