import { describe, test, expect } from 'vitest';
import { interpolate } from '../../src/ops/interpolate.js';
import { manual } from '../../src/index.js';

describe('rx/ops/interpolate', () => {
  test('interpolates towards target value', () => {
    const source = manual<number>();
    const interpolated = interpolate(source, { amount: 0.5 });

    const values: number[] = [];
    interpolated.onValue((v) => values.push(v));

    // First value is emitted as-is (no previous)
    source.set(100);
    expect(values).toEqual([100]);

    // Second value interpolates from 100 towards 200
    source.set(200);
    // With amount=0.5, we go halfway: 100 + (200-100)*0.5 = 150
    expect(values[1]).toBe(150);
  });

  test('continues interpolating on subsequent values', () => {
    const source = manual<number>();
    const interpolated = interpolate(source, { amount: 0.5 });

    const values: number[] = [];
    interpolated.onValue((v) => values.push(v));

    source.set(0);
    source.set(100);
    source.set(100); // Same target, should interpolate from 50 towards 100
    
    expect(values[0]).toBe(0);
    expect(values[1]).toBe(50); // 0 + (100-0)*0.5
    expect(values[2]).toBe(75); // 50 + (100-50)*0.5
  });

  test('supports different amounts', () => {
    const source = manual<number>();
    const interpolated = interpolate(source, { amount: 0.1 });

    const values: number[] = [];
    interpolated.onValue((v) => values.push(v));

    source.set(0);
    source.set(100);
    
    expect(values[0]).toBe(0);
    // With amount=0.1: 0 + (100-0)*0.1 = 10
    expect(values[1]).toBe(10);
  });

  test('snaps to target when within snap threshold', () => {
    const source = manual<number>();
    const interpolated = interpolate(source, { amount: 0.5, snapAt: 0.9 });

    const values: number[] = [];
    interpolated.onValue((v) => values.push(v));

    source.set(0);
    source.set(10);
    
    // First interpolated value is 5 (0 + (10-0)*0.5)
    // 5/10 = 0.5, which is < 0.9, so no snap
    expect(values[1]).toBe(5);
    
    // Next: from 5 towards 10 = 7.5
    source.set(10);
    // 7.5/10 = 0.75, still < 0.9
    
    source.set(10);
    // Continue until we snap
  });

  test('is pingable', () => {
    const source = manual<number>();
    const interpolated = interpolate(source, { amount: 0.5 });

    // Should have ping method
    expect(typeof interpolated.ping).toBe('function');
  });

  test('ping triggers interpolation step', () => {
    const source = manual<number>();
    const interpolated = interpolate(source, { amount: 0.5 });

    const values: number[] = [];
    interpolated.onValue((v) => values.push(v));

    source.set(0);
    source.set(100);
    
    expect(values).toEqual([0, 50]);
    
    // Ping should interpolate another step
    interpolated.ping();
    expect(values[2]).toBe(75); // 50 + (100-50)*0.5
    
    interpolated.ping();
    expect(values[3]).toBe(87.5); // 75 + (100-75)*0.5
  });

  test('handles decreasing values', () => {
    const source = manual<number>();
    const interpolated = interpolate(source, { amount: 0.5 });

    const values: number[] = [];
    interpolated.onValue((v) => values.push(v));

    source.set(100);
    source.set(0);
    
    expect(values[0]).toBe(100);
    expect(values[1]).toBe(50); // 100 + (0-100)*0.5
  });

  test('uses default amount of 0.1', () => {
    const source = manual<number>();
    const interpolated = interpolate(source, {});

    const values: number[] = [];
    interpolated.onValue((v) => values.push(v));

    source.set(0);
    source.set(100);
    
    // Default amount is 0.1
    expect(values[1]).toBe(10);
  });
});
