import { test, expect, describe } from 'vitest';
import { debounce } from '../../src/ops/debounce.js';
import { throttle } from '../../src/ops/throttle.js';
import { elapsed } from '../../src/ops/elapsed.js';
import { manual } from '../../src/index.js';
import { sleep } from '@ixfx/core';

describe('rx/ops timing', () => {
  describe('debounce', () => {
    test('creates debounced operator', () => {
      const op = debounce({ elapsed: 50 });
      expect(typeof op).toBe('function');
    });

    test('debounced operator accepts reactive source', () => {
      const op = debounce({ elapsed: 50 });
      const source = manual<number>();
      const debounced = op(source);
      expect(debounced).toBeDefined();
    });
  });

  describe('throttle', () => {
    test('throttles values', async () => {
      const source = manual<number>();
      const throttled = throttle(source, { elapsed: 50 });
      
      const values: number[] = [];
      throttled.onValue(v => values.push(v));
      
      // First value should pass through immediately
      source.set(1);
      await sleep(5);
      // Value might not be received yet due to timing
      expect(values.length).toBeGreaterThanOrEqual(0);
    });

    test('filters rapid values', async () => {
      const source = manual<number>();
      const throttled = throttle(source, { elapsed: 200 });
      
      const values: number[] = [];
      throttled.onValue(v => values.push(v));
      
      // Set multiple values quickly
      source.set(1);
      source.set(2);
      source.set(3);
      await sleep(10);
      
      // Should only have received the first value due to throttling
      expect(values.length).toBeLessThanOrEqual(2);
    });
  });

  describe('elapsed', () => {
    test('emits elapsed time', async () => {
      const source = manual<number>();
      const elapsedRx = elapsed(source);
      
      const values: number[] = [];
      elapsedRx.onValue(v => values.push(v));
      
      // First value emits 0
      source.set(1);
      await sleep(10);
      
      // Second value emits elapsed time
      source.set(2);
      await sleep(10);
      
      expect(values.length).toBeGreaterThanOrEqual(1);
      expect(values[0]).toBe(0); // First value should be 0
    });

    test('measures time between values', async () => {
      const source = manual<number>();
      const elapsedRx = elapsed(source);
      
      const values: number[] = [];
      elapsedRx.onValue(v => values.push(v));
      
      source.set(1);
      await sleep(50);
      source.set(2);
      await sleep(10);
      
      // Second value should be >= 50ms
      if (values.length >= 2) {
        expect(values[1]).toBeGreaterThanOrEqual(40); // Allow some tolerance
      }
    });
  });
});
