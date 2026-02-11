import { describe, test, expect } from 'vitest';
import { circleRect, circleCircle } from '../src/intersects.js';
import type { CirclePositioned } from '../src/circle/circle-type.js';
import type { RectPositioned } from '../src/rect/index.js';

describe('geometry/intersects', () => {
  describe('circleCircle()', () => {
    test('returns true when circles overlap', () => {
      const circle1: CirclePositioned = { x: 0, y: 0, radius: 10 };
      const circle2: CirclePositioned = { x: 15, y: 0, radius: 10 };
      
      expect(circleCircle(circle1, circle2)).toBe(true);
    });

    test('returns true when circles touch', () => {
      const circle1: CirclePositioned = { x: 0, y: 0, radius: 10 };
      const circle2: CirclePositioned = { x: 20, y: 0, radius: 10 };
      
      expect(circleCircle(circle1, circle2)).toBe(true);
    });

    test('returns false when circles are separate', () => {
      const circle1: CirclePositioned = { x: 0, y: 0, radius: 10 };
      const circle2: CirclePositioned = { x: 30, y: 0, radius: 10 };
      
      expect(circleCircle(circle1, circle2)).toBe(false);
    });

    test('returns false when one circle is inside another (no intersection points)', () => {
      const circle1: CirclePositioned = { x: 0, y: 0, radius: 20 };
      const circle2: CirclePositioned = { x: 0, y: 0, radius: 5 };
      
      // No intersection points when one circle is inside another
      expect(circleCircle(circle1, circle2)).toBe(false);
    });

    test('returns false when circles are identical (no intersection points)', () => {
      const circle1: CirclePositioned = { x: 0, y: 0, radius: 10 };
      const circle2: CirclePositioned = { x: 0, y: 0, radius: 10 };
      
      // No intersection points when circles are identical
      expect(circleCircle(circle1, circle2)).toBe(false);
    });
  });

  describe('circleRect()', () => {
    test('returns true when circle intersects rect', () => {
      const circle: CirclePositioned = { x: 5, y: 5, radius: 10 };
      const rect: RectPositioned = { x: 0, y: 0, width: 10, height: 10 };
      
      expect(circleRect(circle, rect)).toBe(true);
    });

    test('returns false when circle is outside rect', () => {
      const circle: CirclePositioned = { x: 30, y: 30, radius: 5 };
      const rect: RectPositioned = { x: 0, y: 0, width: 10, height: 10 };
      
      expect(circleRect(circle, rect)).toBe(false);
    });

    test('returns true when circle center is inside rect', () => {
      const circle: CirclePositioned = { x: 5, y: 5, radius: 3 };
      const rect: RectPositioned = { x: 0, y: 0, width: 10, height: 10 };
      
      expect(circleRect(circle, rect)).toBe(true);
    });

    test('returns false when circle touches rect edge (uses strict <)', () => {
      const circle: CirclePositioned = { x: 20, y: 5, radius: 10 };
      const rect: RectPositioned = { x: 0, y: 0, width: 10, height: 10 };
      
      // The implementation uses < not <=, so touching doesn't count
      expect(circleRect(circle, rect)).toBe(false);
    });

    test('handles circle to the left of rect', () => {
      const circle: CirclePositioned = { x: -15, y: 5, radius: 10 };
      const rect: RectPositioned = { x: 0, y: 0, width: 10, height: 10 };
      
      expect(circleRect(circle, rect)).toBe(false);
    });

    test('handles circle above rect', () => {
      const circle: CirclePositioned = { x: 5, y: -15, radius: 10 };
      const rect: RectPositioned = { x: 0, y: 0, width: 10, height: 10 };
      
      expect(circleRect(circle, rect)).toBe(false);
    });

    test('handles circle at rect corner', () => {
      const circle: CirclePositioned = { x: 14, y: 14, radius: 5 };
      const rect: RectPositioned = { x: 0, y: 0, width: 10, height: 10 };
      
      // Distance from (14,14) to (10,10) is sqrt(16+16) = sqrt(32) ≈ 5.66
      // Since radius is 5, they don't intersect
      expect(circleRect(circle, rect)).toBe(false);
    });
  });
});
