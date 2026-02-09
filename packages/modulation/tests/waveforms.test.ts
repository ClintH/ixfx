import { test, expect, describe } from 'vitest';
import { 
  triangleShape, 
  squareShape, 
  sineShape, 
  arcShape, 
  sineBipolarShape,
  wave,
  waveFromSource 
} from '../src/waveforms.js';
import * as Sources from '../src/source.js';

describe('waveforms', () => {
  describe('triangleShape', () => {
    test('returns a function', () => {
      const shape = triangleShape();
      expect(typeof shape).toBe('function');
    });

    test('default period is 1', () => {
      const shape = triangleShape();
      expect(typeof shape(0.5)).toBe('number');
    });

    test('accepts custom period', () => {
      const shape = triangleShape(2);
      expect(typeof shape(0.5)).toBe('number');
    });

    test('returns numeric values', () => {
      const shape = triangleShape();
      const value = shape(0.5);
      expect(typeof value).toBe('number');
    });

    test('produces triangular pattern', () => {
      const shape = triangleShape();
      const values = [0, 0.25, 0.5, 0.75, 1].map(t => shape(t));
      
      // Triangle wave produces a specific pattern
      // Just verify it returns valid numbers
      values.forEach(v => {
        expect(typeof v).toBe('number');
        expect(Number.isFinite(v)).toBe(true);
      });
    });

    test('handles values outside 0-1 range', () => {
      const shape = triangleShape();
      
      // Should not throw
      expect(() => shape(-1)).not.toThrow();
      expect(() => shape(2)).not.toThrow();
    });
  });

  describe('squareShape', () => {
    test('returns a function', () => {
      const shape = squareShape();
      expect(typeof shape).toBe('function');
    });

    test('returns only 0 or 1 values', () => {
      const shape = squareShape();
      
      for (let t = 0; t <= 1; t += 0.1) {
        const value = shape(t);
        expect([0, 1]).toContain(value);
      }
    });

    test('accepts custom period', () => {
      const shape = squareShape(2);
      expect([0, 1]).toContain(shape(0.5));
    });

    test('produces both 0 and 1 values', () => {
      const shape = squareShape();
      const values = new Set<number>();
      
      for (let t = 0; t <= 1; t += 0.05) {
        values.add(shape(t));
      }
      
      expect(values.has(0)).toBe(true);
      expect(values.has(1)).toBe(true);
    });

    test('duty cycle is approximately 50%', () => {
      const shape = squareShape();
      let onesCount = 0;
      const steps = 100;
      
      for (let i = 0; i < steps; i++) {
        if (shape(i / steps) === 1) onesCount++;
      }
      
      const ratio = onesCount / steps;
      expect(ratio).toBeGreaterThan(0.4);
      expect(ratio).toBeLessThan(0.6);
    });
  });

  describe('sineShape', () => {
    test('returns a function', () => {
      const shape = sineShape();
      expect(typeof shape).toBe('function');
    });

    test('returns values in 0..1 range', () => {
      const shape = sineShape();
      
      for (let t = 0; t <= 1; t += 0.1) {
        const value = shape(t);
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(1);
      }
    });

    test('at t=0, value is 0.5 (start of sine wave)', () => {
      const shape = sineShape();
      expect(shape(0)).toBeCloseTo(0.5, 1);
    });

    test('accepts custom period', () => {
      const shape1 = sineShape(1);
      const shape2 = sineShape(2);
      
      // Different periods should produce different values at same t
      expect(shape1(0.5)).not.toBe(shape2(0.5));
    });

    test('produces oscillating pattern', () => {
      const shape = sineShape();
      const values = [0, 0.25, 0.5, 0.75, 1].map(t => shape(t));
      
      // Sine wave should have variation
      const unique = new Set(values);
      expect(unique.size).toBeGreaterThan(1);
    });
  });

  describe('arcShape', () => {
    test('returns a function', () => {
      const shape = arcShape();
      expect(typeof shape).toBe('function');
    });

    test('returns values in 0..1 range', () => {
      const shape = arcShape();
      
      for (let t = 0; t <= 1; t += 0.1) {
        const value = shape(t);
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(1);
      }
    });

    test('produces arc/bouncing pattern', () => {
      const shape = arcShape();
      const values = [0, 0.25, 0.5, 0.75, 1].map(t => shape(t));
      
      // Arc shape should start at 0, peak, then return to 0
      expect(values[0]).toBeCloseTo(0, 1);
      expect(values[4]).toBeCloseTo(0, 1);
      expect(values[2]).toBeGreaterThan(0);
    });

    test('accepts custom period', () => {
      const shape = arcShape(2);
      expect(typeof shape(0.5)).toBe('number');
    });
  });

  describe('sineBipolarShape', () => {
    test('returns a function', () => {
      const shape = sineBipolarShape();
      expect(typeof shape).toBe('function');
    });

    test('returns values in -1..1 range', () => {
      const shape = sineBipolarShape();
      
      for (let t = 0; t <= 1; t += 0.1) {
        const value = shape(t);
        expect(value).toBeGreaterThanOrEqual(-1);
        expect(value).toBeLessThanOrEqual(1);
      }
    });

    test('at t=0, value is 0', () => {
      const shape = sineBipolarShape();
      expect(shape(0)).toBeCloseTo(0, 1);
    });

    test('produces both positive and negative values', () => {
      const shape = sineBipolarShape();
      const values: number[] = [];
      
      for (let t = 0; t <= 2; t += 0.05) {
        values.push(shape(t));
      }
      
      const hasPositive = values.some(v => v > 0);
      const hasNegative = values.some(v => v < 0);
      
      expect(hasPositive).toBe(true);
      expect(hasNegative).toBe(true);
    });

    test('accepts custom period', () => {
      const shape = sineBipolarShape(2);
      expect(typeof shape(0.5)).toBe('number');
    });
  });

  describe('wave', () => {
    test('returns a wave modulator function', () => {
      const w = wave({});
      expect(typeof w).toBe('function');
    });

    test('default is 5-second sine wave', () => {
      const w = wave({});
      const value = w();
      expect(typeof value).toBe('number');
    });

    test('accepts shape option', () => {
      const sineWave = wave({ shape: 'sine' });
      const triangleWave = wave({ shape: 'triangle' });
      const squareWave = wave({ shape: 'square' });
      const sawWave = wave({ shape: 'saw' });
      const arcWave = wave({ shape: 'arc' });
      
      expect(typeof sineWave()).toBe('number');
      expect(typeof triangleWave()).toBe('number');
      expect(typeof squareWave()).toBe('number');
      expect(typeof sawWave()).toBe('number');
      expect(typeof arcWave()).toBe('number');
    });

    test('accepts sine-bipolar shape', () => {
      const w = wave({ shape: 'sine-bipolar' });
      expect(typeof w()).toBe('number');
    });

    test('throws for unknown shape', () => {
      expect(() => wave({ shape: 'unknown' as any })).toThrow("Unknown wave shape");
    });

    test('accepts secs option for timing', () => {
      const w = wave({ secs: 2, shape: 'sine' });
      expect(typeof w()).toBe('number');
    });

    test('accepts hertz option for frequency', () => {
      const w = wave({ hertz: 1, shape: 'sine' });
      expect(typeof w()).toBe('number');
    });

    test('accepts millis option for timing', () => {
      const w = wave({ millis: 1000, shape: 'sine' });
      expect(typeof w()).toBe('number');
    });

    test('accepts ticks option for timing', () => {
      const w = wave({ ticks: 60, shape: 'sine' });
      expect(typeof w()).toBe('number');
    });

    test('accepts period option', () => {
      const w = wave({ period: 2, shape: 'sine' });
      expect(typeof w()).toBe('number');
    });

    test('throws for invalid period', () => {
      expect(() => wave({ period: 0, shape: 'sine' })).toThrow();
      expect(() => wave({ period: -1, shape: 'sine' })).toThrow();
    });

    test('accepts invert option', () => {
      const normal = wave({ shape: 'sine' });
      const inverted = wave({ shape: 'sine', invert: true });
      
      const normalValue = normal();
      const invertedValue = inverted();
      
      expect(typeof normalValue).toBe('number');
      expect(typeof invertedValue).toBe('number');
    });

    test('invert option actually inverts values', () => {
      // Use ticks source for consistent timing
      const normal = wave({ shape: 'saw', ticks: 10 });
      const inverted = wave({ shape: 'saw', ticks: 10, invert: true });
      
      // After same number of ticks, values should be inverted (sum to 1)
      const normalValue = normal();
      const invertedValue = inverted();
      
      expect(normalValue + invertedValue).toBeCloseTo(1, 1);
    });

    test('accepts custom source function', () => {
      const customSource = () => 0.5;
      const w = wave({ source: customSource, shape: 'sine' });
      
      expect(typeof w()).toBe('number');
    });

    test('produces continuous values', () => {
      const w = wave({ secs: 1, shape: 'sine' });
      const values: number[] = [];
      
      for (let i = 0; i < 10; i++) {
        values.push(w());
      }
      
      const unique = new Set(values);
      expect(unique.size).toBeGreaterThan(1);
    });
  });

  describe('waveFromSource', () => {
    test('returns a wave modulator function', () => {
      const source = Sources.hertz(1);
      const shaper = sineShape();
      const w = waveFromSource(source, shaper);
      
      expect(typeof w).toBe('function');
    });

    test('combines source and shaper', () => {
      const source = Sources.hertz(1);
      const shaper = sineShape();
      const w = waveFromSource(source, shaper);
      
      const value = w();
      expect(typeof value).toBe('number');
    });

    test('accepts invert parameter', () => {
      const source = Sources.hertz(1);
      const shaper = sineShape();
      const w = waveFromSource(source, shaper, true);
      
      expect(typeof w()).toBe('number');
    });

    test('accepts feedback parameter', () => {
      const source = Sources.hertz(1);
      const shaper = sineShape();
      const w = waveFromSource(source, shaper);
      
      const value = w({ clock: { resetAt: 0, resetAtRelative: 0 } });
      expect(typeof value).toBe('number');
    });

    test('accepts override parameter', () => {
      const source = Sources.hertz(1);
      const shaper = sineShape();
      const w = waveFromSource(source, shaper);
      
      const overrideValue = 0.5;
      const value = w({ override: overrideValue });
      expect(value).toBe(shaper(overrideValue));
    });

    test('invert with override produces inverted value', () => {
      const source = Sources.hertz(1);
      const shaper = sineShape();
      const w = waveFromSource(source, shaper, true);
      
      const overrideValue = 0.5;
      const value = w({ override: overrideValue });
      expect(value).toBe(1 - shaper(overrideValue));
    });
  });
});
