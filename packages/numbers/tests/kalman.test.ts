import { describe, test, expect } from 'vitest';
import { Kalman1dFilter, kalman1dFilter } from '../src/kalman.js';

describe('kalman', () => {
  describe('Kalman1dFilter', () => {
    test('creates filter with default options', () => {
      const kf = new Kalman1dFilter();
      expect(kf.R).toBe(1);
      expect(kf.Q).toBe(1);
      expect(kf.A).toBe(1);
      expect(kf.C).toBe(1);
      expect(kf.B).toBe(0);
    });

    test('creates filter with custom options', () => {
      const kf = new Kalman1dFilter({ r: 0.5, q: 0.3, a: 2, b: 1, c: 1.5 });
      expect(kf.R).toBe(0.5);
      expect(kf.Q).toBe(0.3);
      expect(kf.A).toBe(2);
      expect(kf.B).toBe(1);
      expect(kf.C).toBe(1.5);
    });

    test('filters single value', () => {
      const kf = new Kalman1dFilter();
      const result = kf.filter(10);
      expect(result).toBe(10);
    });

    test('filters multiple values', () => {
      const kf = new Kalman1dFilter();
      const results: number[] = [];
      results.push(kf.filter(10));
      results.push(kf.filter(11));
      results.push(kf.filter(12));
      results.push(kf.filter(13));
      
      expect(results[0]).toBe(10);
      expect(typeof results[1]).toBe('number');
      expect(typeof results[2]).toBe('number');
      expect(typeof results[3]).toBe('number');
    });

    test('smooths noisy data', () => {
      const kf = new Kalman1dFilter({ r: 0.1, q: 0.1 });
      const trueValue = 10;
      const noisyData = [9, 11, 8, 12, 10, 11, 9, 10, 12, 8];
      
      const filtered = noisyData.map(v => kf.filter(v));
      
      // Filtered values should be closer to each other than noisy input
      const inputVariance = calculateVariance(noisyData);
      const outputVariance = calculateVariance(filtered);
      expect(outputVariance).toBeLessThan(inputVariance);
    });

    test('predict returns predicted value', () => {
      const kf = new Kalman1dFilter();
      kf.filter(10);
      const prediction = kf.predict();
      expect(typeof prediction).toBe('number');
    });

    test('predict with control input', () => {
      const kf = new Kalman1dFilter({ b: 1 });
      kf.filter(10);
      const prediction = kf.predict(5);
      expect(prediction).toBe(15); // x + B*u = 10 + 1*5
    });

    test('uncertainty returns uncertainty value', () => {
      const kf = new Kalman1dFilter();
      kf.filter(10);
      const uncertainty = kf.uncertainty();
      expect(typeof uncertainty).toBe('number');
      expect(uncertainty).toBeGreaterThan(0);
    });

    test('lastMeasurement returns last filtered value', () => {
      const kf = new Kalman1dFilter();
      kf.filter(10);
      const lastResult = kf.filter(20);
      // lastMeasurement returns the internal state which may be adjusted by the filter
      expect(typeof kf.lastMeasurement()).toBe('number');
      expect(kf.lastMeasurement()).toBe(lastResult);
    });

    test('setMeasurementNoise updates Q', () => {
      const kf = new Kalman1dFilter();
      kf.setMeasurementNoise(0.5);
      expect(kf.Q).toBe(0.5);
    });

    test('setProcessNoise updates R', () => {
      const kf = new Kalman1dFilter();
      kf.setProcessNoise(0.3);
      expect(kf.R).toBe(0.3);
    });

    test('handles zero values', () => {
      const kf = new Kalman1dFilter();
      expect(kf.filter(0)).toBe(0);
      expect(kf.filter(0)).toBe(0);
    });

    test('handles negative values', () => {
      const kf = new Kalman1dFilter();
      const results: number[] = [];
      results.push(kf.filter(-10));
      results.push(kf.filter(-11));
      results.push(kf.filter(-12));
      
      expect(results[0]).toBe(-10);
      expect(typeof results[1]).toBe('number');
    });
  });

  describe('kalman1dFilter factory', () => {
    test('creates filter function', () => {
      const filter = kalman1dFilter();
      expect(typeof filter).toBe('function');
    });

    test('filter function works', () => {
      const filter = kalman1dFilter();
      expect(filter(10)).toBe(10);
      expect(typeof filter(11)).toBe('number');
    });

    test('accepts options', () => {
      const filter = kalman1dFilter({ r: 0.5, q: 0.3 });
      expect(filter(10)).toBe(10);
    });

    test('accepts control input', () => {
      const filter = kalman1dFilter({ b: 1 });
      filter(10);
      // Second call with control input
      const result = filter(10, 5);
      expect(typeof result).toBe('number');
    });
  });
});

function calculateVariance(data: number[]): number {
  const mean = data.reduce((a, b) => a + b) / data.length;
  const squaredDiffs = data.map(v => Math.pow(v - mean, 2));
  return squaredDiffs.reduce((a, b) => a + b) / data.length;
}
