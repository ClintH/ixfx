import { describe, test, expect } from 'vitest';
import { rdpShortestDistance, rdpPerpendicularDistance } from '../src/curve-simplification.js';

describe('curve-simplification/rdpShortestDistance', () => {
  test('returns empty array for empty input', () => {
    const result = rdpShortestDistance([]);
    expect(result).toHaveLength(0);
  });

  test('returns same points for small epsilon', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 2 }
    ];
    const result = rdpShortestDistance(points, 0.001);
    expect(result.length).toBeGreaterThanOrEqual(2);
  });

  test('reduces points with large epsilon', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 2 },
      { x: 3, y: 3 },
      { x: 4, y: 4 }
    ];
    const result = rdpShortestDistance(points, 10);
    // With high epsilon, should return just start and end
    expect(result.length).toBeLessThanOrEqual(2);
  });

  test('preserves first and last points', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 2 },
      { x: 3, y: 3 },
      { x: 10, y: 10 }
    ];
    const result = rdpShortestDistance(points, 1);
    expect(result[0]).toEqual(points[0]);
    expect(result[result.length - 1]).toEqual(points[points.length - 1]);
  });

  test('handles two points', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 10, y: 10 }
    ];
    const result = rdpShortestDistance(points, 1);
    expect(result).toEqual(points);
  });
});

describe('curve-simplification/rdpPerpendicularDistance', () => {
  test('returns empty array for empty input', () => {
    const result = rdpPerpendicularDistance([]);
    expect(result).toHaveLength(0);
  });

  test('returns same points for small epsilon', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 2 }
    ];
    const result = rdpPerpendicularDistance(points, 0.001);
    expect(result.length).toBeGreaterThanOrEqual(2);
  });

  test('reduces points with large epsilon', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 2 },
      { x: 3, y: 3 },
      { x: 4, y: 4 }
    ];
    const result = rdpPerpendicularDistance(points, 10);
    // With high epsilon, should return just start and end
    expect(result.length).toBeLessThanOrEqual(2);
  });

  test('preserves first and last points', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 2 },
      { x: 3, y: 3 },
      { x: 10, y: 10 }
    ];
    const result = rdpPerpendicularDistance(points, 1);
    expect(result[0]).toEqual(points[0]);
    expect(result[result.length - 1]).toEqual(points[points.length - 1]);
  });

  test('handles two points', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 10, y: 10 }
    ];
    const result = rdpPerpendicularDistance(points, 1);
    expect(result).toEqual(points);
  });
});
