import { test, expect, describe } from 'vitest';
import * as Timer from '../src/timer.js';
import type { Timer as TimerType } from '../src/timer.js';
import * as Elapsed from '@ixfx/core/elapsed';
import { sleep } from '@ixfx/core';
import { isApprox, round } from '@ixfx/numbers';

// Helper to create a mock timer with controlled elapsed values
const createMockTimer = (elapsedValues: number[]): TimerType => {
  let index = 0;
  return {
    reset: () => { index = 0; },
    get elapsed() {
      const value = elapsedValues[index] ?? elapsedValues[elapsedValues.length - 1] ?? 0;
      index++;
      return value;
    }
  };
};

describe('of-total', () => {
  test('without clamping - values can exceed 1', () => {
    const mockTimer = createMockTimer([0, 250, 500, 750, 1000]);
    const timer = Timer.ofTotal(500, { clampValue: false, timer: mockTimer });
    
    expect(timer()).toBe(0);      // 0/500 = 0
    expect(timer()).toBe(0.5);    // 250/500 = 0.5
    expect(timer()).toBe(1);      // 500/500 = 1
    expect(timer()).toBe(1.5);    // 750/500 = 1.5 (exceeds 1)
    expect(timer()).toBe(2);      // 1000/500 = 2
  });

  test('with clamping - values capped at 1', () => {
    const mockTimer = createMockTimer([0, 250, 500, 750, 1000]);
    const timer = Timer.ofTotal(500, { clampValue: true, timer: mockTimer });
    
    expect(timer()).toBe(0);      // 0/500 = 0
    expect(timer()).toBe(0.5);    // 250/500 = 0.5
    expect(timer()).toBe(1);      // 500/500 = 1
    expect(timer()).toBe(1);      // 750/500 = 1.5 → clamped to 1
    expect(timer()).toBe(1);      // 1000/500 = 2 → clamped to 1
  });

  test('with wrapping - values wrap around at 1', () => {
    const mockTimer = createMockTimer([0, 250, 500, 750, 1000, 1250, 1500]);
    const timer = Timer.ofTotal(500, { wrapValue: true, timer: mockTimer });
    
    expect(timer()).toBe(0);      // 0/500 = 0
    expect(timer()).toBe(0.5);    // 250/500 = 0.5
    expect(timer()).toBe(0);      // 500/500 = 1 → wraps to 0
    expect(timer()).toBe(0.5);    // 750/500 = 1.5 → wraps to 0.5
    expect(timer()).toBe(0);      // 1000/500 = 2 → wraps to 0
    expect(timer()).toBe(0.5);    // 1250/500 = 2.5 → wraps to 0.5
    expect(timer()).toBe(0);      // 1500/500 = 3 → wraps to 0
  });

  test('progression through multiple intervals', () => {
    const mockTimer = createMockTimer([0, 100, 200, 300, 400, 500]);
    const timer = Timer.ofTotal(500, { timer: mockTimer });
    
    expect(timer()).toBe(0);      // 0%
    expect(timer()).toBe(0.2);    // 20%
    expect(timer()).toBe(0.4);    // 40%
    expect(timer()).toBe(0.6);    // 60%
    expect(timer()).toBe(0.8);    // 80%
    expect(timer()).toBe(1);      // 100%
  });

  test('integration with real timer - loose tolerance', async () => {
    // This test uses actual time but with relaxed expectations
    const timer = Timer.ofTotal(200, { clampValue: true });
    
    // Initial value should be near 0
    const v1 = timer();
    expect(v1).toBeGreaterThanOrEqual(0);
    expect(v1).toBeLessThan(0.1);
    
    // Wait for half the duration
    await sleep(100);
    const v2 = timer();
    expect(v2).toBeGreaterThan(0.3);  // Allow 20% variance
    expect(v2).toBeLessThan(0.7);
    
    // Wait for full duration
    await sleep(150);
    const v3 = timer();
    expect(v3).toBe(1);  // Should be clamped at 1
  });
});

test('of-total-ticks', async () => {
  let totalTicks = 100;
  const r1 = Timer.ofTotalTicks(totalTicks, { clampValue: false, wrapValue: false });
  for (let index = 1; index < 100; index++) {
    const v1 = r1();
    const v2 = index / 100;
    expect(v1).toBe(v2);
  }

  // clamp:false
  for (let index = 0; index < 30; index++) {
    const v1 = round(3, r1());
    const v2 = round(3, 1 + (index / totalTicks));
    expect(v1).toBe(v2);
  }

  totalTicks = 10;
  const r2 = Timer.ofTotalTicks(totalTicks, { clampValue: true });
  // Burn through total
  for (let index = 0; index < totalTicks; index++) r2();
  for (let index = 1; index < (totalTicks * 2); index++) {
    // Expect to return 1 since clampValue:true
    expect(r2()).toBe(1);
  }

  totalTicks = 10;
  const r3 = Timer.ofTotalTicks(totalTicks, { wrapValue: true });
  // Burn through total
  for (let index = 0; index < totalTicks; index++) r3();
  // Next call should wrap
  for (let index = 1; index < totalTicks; index++) {
    const v1 = round(5, r3());
    const v2 = index / 10;

    // Let value be a bit off due to rounding
    expect(isApprox(0.001, v2, v1)).toBe(true);
  }

});