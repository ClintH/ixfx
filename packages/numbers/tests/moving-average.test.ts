import { describe, test, expect } from 'vitest';
import { movingAverageLight, movingAverage, movingAverageWithContext, noiseFilter } from '../src/moving-average.js';

describe('moving-average', () => {
  describe('movingAverageLight', () => {
    test('basic functionality', () => {
      const ma = movingAverageLight(5);
      expect(ma(1)).toBe(1);
      expect(ma(2)).toBe(1.5);
      expect(ma(3)).toBe(2);
      expect(ma(4)).toBe(2.5);
      expect(ma(5)).toBe(3);
    });

    test('handles undefined and NaN', () => {
      const ma = movingAverageLight(5);
      ma(5);
      expect(ma()).toBe(5); // Returns last average
      expect(ma(Number.NaN)).toBe(5);
    });

    test('saturates with repeated values', () => {
      const ma = movingAverageLight(5);
      expect(ma(1)).toBe(1);
      expect(ma(2)).toBe(1.5);
      expect(ma(3)).toBe(2);
      expect(ma(4)).toBe(2.5);
      expect(ma(5)).toBe(3);
      ma(5);
      ma(5);
      const result = ma(5);
      expect(result).toBeGreaterThan(3); // Should increase towards 5
      expect(result).toBeLessThan(5);
    });

    test('creates with default scaling', () => {
      const ma = movingAverageLight();
      expect(ma(10)).toBe(10);
    });

    test('with scaling of 1 returns last value', () => {
      const ma = movingAverageLight(1);
      expect(ma(10)).toBe(10);
      expect(ma(20)).toBe(20);
      expect(ma(30)).toBe(30);
    });

    test('throws on invalid scaling', () => {
      expect(() => movingAverageLight(0)).toThrow();
      expect(() => movingAverageLight(-1)).toThrow();
    });

    test('handles consecutive same values', () => {
      const ma = movingAverageLight();
      expect(ma(5)).toBe(5);
      expect(ma(5)).toBe(5);
      expect(ma(5)).toBe(5);
    });
  });

  describe('movingAverage', () => {
    test('creates with sample count', () => {
      const ma = movingAverage(3);
      expect(ma(10)).toBe(10);
      expect(ma(20)).toBe(15); // (10+20)/2
      expect(ma(30)).toBe(20); // (10+20+30)/3
    });

    test('maintains fixed window size', () => {
      const ma = movingAverage(3);
      ma(10);
      ma(20);
      ma(30);
      expect(ma(40)).toBe(30); // (20+30+40)/3
      expect(ma(50)).toBe(40); // (30+40+50)/3
    });

    test('calculates running average', () => {
      const ma = movingAverage(3);
      expect(ma(10)).toBe(10);
      expect(ma(20)).toBe(15);
      expect(ma(30)).toBe(20);
      expect(ma(40)).toBe(30);
    });
  });

  describe('movingAverageWithContext', () => {
    test('returns context object', () => {
      const ctx = movingAverageWithContext(3);
      expect(typeof ctx.seen).toBe('function');
      expect(Array.isArray(ctx.data)).toBe(true);
      expect(typeof ctx.average).toBe('number');
    });

    test('data property returns copy', () => {
      const ctx = movingAverageWithContext(3);
      ctx.seen(10);
      ctx.seen(20);
      const data1 = ctx.data;
      const data2 = ctx.data;
      expect(data1).toEqual([10, 20]);
      expect(data1).not.toBe(data2);
    });

    test('average property calculates average', () => {
      const ctx = movingAverageWithContext(3);
      ctx.seen(10);
      ctx.seen(20);
      ctx.seen(30);
      expect(ctx.average).toBe(20);
    });

    test('throws on NaN with throw policy', () => {
      const ctx = movingAverageWithContext({ samples: 3, nanPolicy: 'throw' });
      expect(() => ctx.seen(NaN)).toThrow('Value is NaN');
    });

    test('ignores NaN with ignore policy', () => {
      const ctx = movingAverageWithContext({ samples: 3, nanPolicy: 'ignore' });
      ctx.seen(10);
      ctx.seen(NaN);
      expect(ctx.data).toEqual([10]);
    });
  });

  describe('noiseFilter', () => {
    test('creates with default parameters', () => {
      const nf = noiseFilter();
      expect(typeof nf).toBe('function');
    });

    test('filters noise', () => {
      const nf = noiseFilter(1, 0, 1);
      const noisySignal = [10, 12, 9, 11, 10, 12, 9, 11, 10];
      const filtered = noisySignal.map(v => nf(v));
      
      const inputVariance = calculateVariance(noisySignal);
      const outputVariance = calculateVariance(filtered);
      expect(outputVariance).toBeLessThanOrEqual(inputVariance);
    });

    test('accepts custom timestamp', () => {
      const nf = noiseFilter(1, 0, 1);
      const result1 = nf(10, 0);
      const result2 = nf(11, 100);
      expect(typeof result1).toBe('number');
      expect(typeof result2).toBe('number');
    });
  });
});

function calculateVariance(data: number[]): number {
  const mean = data.reduce((a, b) => a + b) / data.length;
  const squaredDiffs = data.map(v => Math.pow(v - mean, 2));
  return squaredDiffs.reduce((a, b) => a + b) / data.length;
}
