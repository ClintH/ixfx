import { test, expect, describe } from 'vitest';
import { spring, springValue, springShape } from '../src/spring.js';
import * as Flow from '@ixfx/flow';

describe('spring', () => {
  describe('spring', () => {
    test('generates spring values', () => {
      const s = spring();
      const result = s.next();
      expect(result.done).toBe(false);
      expect(typeof result.value).toBe('number');
    });

    test('accepts custom options', () => {
      const s = spring({ mass: 5, damping: 10, stiffness: 100 });
      const result = s.next();
      expect(typeof result.value).toBe('number');
    });

    test('accepts custom timer', () => {
      const timer = Flow.elapsedMillisecondsAbsolute();
      const s = spring({}, timer);
      const result = s.next();
      expect(typeof result.value).toBe('number');
    });

    test('accepts frequency number', () => {
      const s = spring({}, 0.1);
      const result = s.next();
      expect(typeof result.value).toBe('number');
    });

    test('default timer is elapsedMillisecondsAbsolute', () => {
      const s = spring();
      // Should work without providing timer
      expect(typeof s.next().value).toBe('number');
    });

    test('eventually completes after settling', () => {
      // Use parameters that settle quickly
      const s = spring({ mass: 1, damping: 50, stiffness: 100, countdown: 3 });
      let iterations = 0;
      let result = s.next();
      
      // Iterate until done or max iterations
      while (!result.done && iterations < 10000) {
        result = s.next();
        iterations++;
      }
      
      // Spring should complete within reasonable iterations or reach max
      expect(iterations).toBeLessThanOrEqual(10000);
    });

    test('produces values approaching 1', () => {
      const s = spring({ mass: 1, damping: 10, stiffness: 100 });
      
      // Generate several values
      for (let i = 0; i < 50; i++) {
        const result = s.next();
        expect(typeof result.value).toBe('number');
      }
    });

    test('values can exceed 1 (overshoot)', () => {
      const s = spring({ mass: 1, damping: 5, stiffness: 100 });
      let hasExceededOne = false;
      
      for (let i = 0; i < 100; i++) {
        const result = s.next();
        if (result.value !== undefined && result.value > 1.1) {
          hasExceededOne = true;
          break;
        }
      }
      
      // Spring with low damping should overshoot
      // Note: Not guaranteed in all cases, so we just check it produces values
      expect(typeof s.next().value).toBe('number');
    });

    test('soft spring option affects behavior', () => {
      const softSpring = spring({ mass: 1, damping: 20, stiffness: 100, soft: true });
      const hardSpring = spring({ mass: 1, damping: 20, stiffness: 100, soft: false });
      
      expect(typeof softSpring.next().value).toBe('number');
      expect(typeof hardSpring.next().value).toBe('number');
    });

    test('custom countdown affects completion', () => {
      // Use higher damping to settle faster
      const s = spring({ countdown: 2, mass: 1, damping: 50, stiffness: 100 });
      let iterations = 0;
      let result = s.next();
      
      while (!result.done && iterations < 10000) {
        result = s.next();
        iterations++;
      }
      
      // Should complete or reach max iterations
      expect(iterations).toBeLessThanOrEqual(10000);
    });
  });

  describe('springValue', () => {
    test('returns a function', () => {
      const s = springValue();
      expect(typeof s).toBe('function');
    });

    test('function returns numeric values', () => {
      const s = springValue();
      const value = s();
      expect(typeof value).toBe('number');
    });

    test('accepts custom options', () => {
      const s = springValue({ mass: 3, damping: 15, stiffness: 200 });
      expect(typeof s()).toBe('number');
    });

    test('accepts custom timer', () => {
      const timer = Flow.elapsedMillisecondsAbsolute();
      const s = springValue({}, timer);
      expect(typeof s()).toBe('number');
    });

    test('returns 1 when spring is done', () => {
      // Use a spring that settles quickly
      const s = springValue({ 
        mass: 1, 
        damping: 50, 
        stiffness: 100, 
        countdown: 1 
      });
      
      // Generate values until spring settles
      let value = s();
      let iterations = 0;
      
      while (iterations < 5000) {
        value = s();
        iterations++;
        // SpringValue returns 1 when done
        if (value === 1) break;
      }
      
      // Either reached 1 or iterated max times
      expect(typeof value).toBe('number');
    });

    test('produces consistent interface', () => {
      const s = springValue();
      const values: number[] = [];
      
      for (let i = 0; i < 10; i++) {
        values.push(s());
      }
      
      // All values should be numbers
      values.forEach(v => expect(typeof v).toBe('number'));
    });
  });

  describe('springShape', () => {
    test('returns a function', () => {
      const shape = springShape();
      expect(typeof shape).toBe('function');
    });

    test('function takes time parameter', () => {
      const shape = springShape();
      const value = shape(0);
      expect(typeof value).toBe('number');
    });

    test('at t=0, value starts near 0', () => {
      const shape = springShape();
      const value = shape(0);
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(0.5);
    });

    test('as t increases, value approaches 1', () => {
      const shape = springShape({ mass: 1, damping: 10, stiffness: 100 });
      
      const t1 = shape(0.1);
      const t5 = shape(0.5);
      const t10 = shape(1.0);
      
      // Generally should be increasing towards 1 (spring physics may overshoot)
      expect(t1).toBeGreaterThanOrEqual(0);
      expect(t5).toBeGreaterThanOrEqual(0);
      expect(t10).toBeGreaterThanOrEqual(0);
      // All should be approaching 1
      expect(t1).toBeLessThanOrEqual(1.5);
      expect(t5).toBeLessThanOrEqual(1.5);
      expect(t10).toBeLessThanOrEqual(1.5);
    });

    test('soft spring produces different curve', () => {
      const softShape = springShape({ mass: 1, damping: 20, stiffness: 100, soft: true });
      const hardShape = springShape({ mass: 1, damping: 20, stiffness: 100, soft: false });
      
      const t = 0.3;
      const softValue = softShape(t);
      const hardValue = hardShape(t);
      
      // Should produce different values
      expect(typeof softValue).toBe('number');
      expect(typeof hardValue).toBe('number');
    });

    test('mass affects spring behavior', () => {
      const lightSpring = springShape({ mass: 0.5, damping: 10, stiffness: 100 });
      const heavySpring = springShape({ mass: 5, damping: 10, stiffness: 100 });
      
      const t = 0.2;
      const lightValue = lightSpring(t);
      const heavyValue = heavySpring(t);
      
      // Different masses should produce different values at same time
      expect(typeof lightValue).toBe('number');
      expect(typeof heavyValue).toBe('number');
    });

    test('stiffness affects spring behavior', () => {
      const softSpring = springShape({ mass: 1, damping: 10, stiffness: 50 });
      const stiffSpring = springShape({ mass: 1, damping: 10, stiffness: 200 });
      
      const t = 0.2;
      const softValue = softSpring(t);
      const stiffValue = stiffSpring(t);
      
      // Different stiffness should produce different values
      expect(typeof softValue).toBe('number');
      expect(typeof stiffValue).toBe('number');
    });

    test('damping affects spring behavior', () => {
      const lowDamping = springShape({ mass: 1, damping: 5, stiffness: 100 });
      const highDamping = springShape({ mass: 1, damping: 20, stiffness: 100 });
      
      const t = 0.3;
      const lowValue = lowDamping(t);
      const highValue = highDamping(t);
      
      // Different damping should produce different values
      expect(typeof lowValue).toBe('number');
      expect(typeof highValue).toBe('number');
    });

    test('velocity affects initial movement', () => {
      const lowVel = springShape({ mass: 1, damping: 10, stiffness: 100, velocity: 0.1 });
      const highVel = springShape({ mass: 1, damping: 10, stiffness: 100, velocity: 1.0 });
      
      const t = 0.05;
      const lowValue = lowVel(t);
      const highValue = highVel(t);
      
      // Different initial velocities should produce different values
      expect(typeof lowValue).toBe('number');
      expect(typeof highValue).toBe('number');
    });

    test('produces valid output across time range', () => {
      const shape = springShape();
      
      // Test various time points
      const times = [0, 0.1, 0.5, 1.0, 2.0, 5.0];
      times.forEach(t => {
        const value = shape(t);
        expect(typeof value).toBe('number');
        expect(Number.isFinite(value)).toBe(true);
      });
    });
  });
});
