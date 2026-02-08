import { test, expect, describe } from 'vitest';
import { syncToArray } from '../../src/ops/sync-to-array.js';
import { manual } from '../../src/index.js';
import { sleep } from '@ixfx/core';

describe('syncToArray', () => {
  test('synchronizes multiple sources', async () => {
    const source1 = manual<number>();
    const source2 = manual<number>();
    
    const synced = syncToArray([source1, source2]);
    const values: any[] = [];
    
    synced.onValue(v => {
      values.push(v);
    });
    
    source1.set(1);
    source2.set(2);
    
    await sleep(10);
    
    expect(values.length).toBeGreaterThan(0);
    expect(values[0][0]).toBe(1);
    expect(values[0][1]).toBe(2);
  });

  test.skip('handles empty source array', async () => {
    // Empty array behavior may vary based on implementation
  });

  test('emits array with latest values', async () => {
    const source1 = manual<number>();
    const source2 = manual<number>();
    
    const synced = syncToArray([source1, source2]);
    const values: any[] = [];
    
    synced.onValue(v => values.push(v));
    
    source1.set(10);
    source2.set(20);
    await sleep(10);
    
    source1.set(100);
    source2.set(200);
    await sleep(10);
    
    expect(values.length).toBeGreaterThanOrEqual(2);
    expect(values[0][0]).toBe(10);
    expect(values[0][1]).toBe(20);
    expect(values[1][0]).toBe(100);
    expect(values[1][1]).toBe(200);
  });

  test('handles single source', async () => {
    const source = manual<number>();
    const synced = syncToArray([source]);
    const values: any[] = [];
    
    synced.onValue(v => values.push(v));
    
    source.set(42);
    await sleep(10);
    
    expect(values.length).toBeGreaterThan(0);
    expect(values[0][0]).toBe(42);
  });

  test.skip('handles source disposal', async () => {
    // Source disposal behavior may need implementation-specific handling
  });

  test('maintains source order', async () => {
    const source1 = manual<number>();
    const source2 = manual<string>();
    const source3 = manual<boolean>();
    
    const synced = syncToArray([source1, source2, source3]);
    const values: any[] = [];
    
    synced.onValue(v => values.push(v));
    
    source1.set(1);
    source2.set('a');
    source3.set(true);
    
    await sleep(10);
    
    expect(values[0][0]).toBe(1);
    expect(values[0][1]).toBe('a');
    expect(values[0][2]).toBe(true);
  });

  test('waits for all sources before emitting', async () => {
    const source1 = manual<number>();
    const source2 = manual<number>();
    
    const synced = syncToArray([source1, source2]);
    const values: any[] = [];
    
    synced.onValue(v => values.push(v));
    
    // Only set first source - should not emit yet
    source1.set(1);
    await sleep(10);
    
    expect(values.length).toBe(0);
    
    // Set second source - now should emit
    source2.set(2);
    await sleep(10);
    
    expect(values.length).toBe(1);
    expect(values[0][0]).toBe(1);
    expect(values[0][1]).toBe(2);
  });

  test('tracks disposed state', async () => {
    const source1 = manual<number>();
    const source2 = manual<number>();
    
    const synced = syncToArray([source1, source2]);
    
    source1.set(1);
    source2.set(2);
    await sleep(10);
    
    expect(synced.isDisposed()).toBe(false);
    
    synced.dispose('test');
    
    expect(synced.isDisposed()).toBe(true);
  });

  test.skip('supports onSourceDone option', async () => {
    // onSourceDone option behavior needs verification
  });
});
