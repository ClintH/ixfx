/* eslint-disable @typescript-eslint/ban-ts-comment */
import { expect, describe, test } from 'vitest';
import * as N from '../src/index.js';

describe('average', () => {
  describe('basic average', () => {
    test('calculates average of single element', () => {
      expect(N.average([1])).toBe(1);
    });

    test('calculates average of multiple elements', () => {
      expect(N.average([1, 2, 3, 4, 5])).toBe(3);
      expect(N.average([10, 20, 30])).toBe(20);
    });

    test('works with negative numbers', () => {
      expect(N.average([-5, 5])).toBe(0);
      expect(N.average([-10, -20, -30])).toBe(-20);
    });

    test('works with decimals', () => {
      expect(N.average([1, 1.4, 0.9, 0.1])).toBe(0.85);
    });

    test('handles null, undefined, NaN as zeros', () => {
      // @ts-expect-error
      expect(N.average([1, 0, null, undefined, NaN])).toBe(0.5);
    });

    test('throws on non-array inputs', () => {
      // @ts-expect-error
      expect(() => N.average(false)).toThrow();
      // @ts-expect-error
      expect(() => N.average(2)).toThrow();
      // @ts-expect-error
      expect(() => N.average({})).toThrow();
      // @ts-expect-error
      expect(() => N.average('string')).toThrow();
    });
  });

  describe('median', () => {
    test('calculates median of odd-length array', () => {
      expect(N.median([1, 2, 3, 4, 5])).toBe(3);
      expect(N.median([5, 3, 1, 2, 4])).toBe(3);
    });

    test('calculates median of even-length array', () => {
      expect(N.median([1, 2, 3, 4])).toBe(2);
      expect(N.median([1, 2, 3, 4, 5, 6])).toBe(3);
    });

    test('works with single element', () => {
      expect(N.median([42])).toBe(42);
    });

    test('works with two elements', () => {
      expect(N.median([1, 3])).toBe(2);
    });

    test('throws on non-array', () => {
      // @ts-expect-error
      expect(() => N.median('not array')).toThrow();
      // @ts-expect-error
      expect(() => N.median(null)).toThrow();
    });
  });

  describe('mean', () => {
    test('calculates mean of array', () => {
      expect(N.mean([1, 2, 3, 4, 5])).toBe(3);
      expect(N.mean([10, 20, 30])).toBe(20);
    });

    test('works with single element', () => {
      expect(N.mean([42])).toBe(42);
    });

    test('works with negative numbers', () => {
      expect(N.mean([-1, 0, 1])).toBe(0);
    });

    test('returns NaN for empty array', () => {
      expect(N.mean([])).toBeNaN();
    });
  });

  describe('averageWeighted', () => {
    test('calculates weighted average with array weights', () => {
      expect(N.averageWeighted([1, 2, 3], [1, 1, 1])).toBe(2);
      expect(N.averageWeighted([1, 2, 3], [1, 0.5, 0.25])).toBeCloseTo(1.571, 2);
    });

    test('calculates weighted average with function', () => {
      // When passing a function, weight() is called which multiplies data value by weigher(relativePos)
      // For [1, 2, 3] with weigher = relPos + 1 (where relPos = index/(length-1)):
      // - index 0: relPos = 0/2 = 0, weight = 1 * (0+1) = 1
      // - index 1: relPos = 1/2 = 0.5, weight = 2 * (0.5+1) = 3
      // - index 2: relPos = 2/2 = 1, weight = 3 * (1+1) = 6
      // weights = [1, 3, 6]
      // Average = (1*1 + 2*3 + 3*6) / (1+3+6) = (1+6+18)/10 = 25/10 = 2.5
      const weigher = (relPos: number) => relPos + 1;
      expect(N.averageWeighted([1, 2, 3], weigher)).toBe(2.5);
    });

    test('works with equal weights', () => {
      expect(N.averageWeighted([10, 20, 30], [1, 1, 1])).toBe(20);
    });

    test('works with zero weights', () => {
      expect(N.averageWeighted([10, 20, 30], [0, 1, 0])).toBe(20);
    });
  });

  describe('averageWeigher', () => {
    test('returns function that computes weighted average', () => {
      // The weight function multiplies data value by the weigher result
      // averageWeigher((relPos) => relPos + 1) with [1, 2, 3]:
      // The weight function calculates weights: [1*(0+1), 2*(0.5+1), 3*(1+1)] = [1, 3, 6]
      // Then averageWeighted does: (1*1 + 2*3 + 3*6) / (1+3+6) = (1+6+18)/10 = 25/10 = 2.5
      const weigher = N.averageWeigher((relPos) => relPos + 1);
      expect(typeof weigher).toBe('function');
      expect(weigher([1, 2, 3])).toBeCloseTo(2.5, 2);
    });

    test('returned function works with different arrays', () => {
      // With constant weigher of 1, the weight function returns the original data
      // For [1, 2, 3]: weights = [1, 2, 3]
      // Average = (1*1 + 2*2 + 3*3) / (1+2+3) = (1+4+9)/6 = 14/6 ≈ 2.33
      const weigher = N.averageWeigher(() => 1);
      expect(weigher([1, 2, 3])).toBeCloseTo(2.33, 2);
      // For [10, 20, 30]: weights = [10, 20, 30]
      // Average = (10*10 + 20*20 + 30*30) / (10+20+30) = (100+400+900)/60 = 1400/60 ≈ 23.33
      expect(weigher([10, 20, 30])).toBeCloseTo(23.33, 2);
    });

    test('weighs by relative position', () => {
      // Weight by relative position: earlier items get less weight
      const weigher = N.averageWeigher((relPos) => relPos);
      // For [10, 20, 30]:
      // The weight function calculates weights: [10*0, 20*0.5, 30*1] = [0, 10, 30]
      // Then averageWeighted does: (10*0 + 20*10 + 30*30) / (0+10+30) = (0+200+900)/40 = 1100/40 = 27.5
      expect(weigher([10, 20, 30])).toBe(27.5);
    });
  });
});
