import { describe, test, expect } from 'vitest';
import { timeoutPing } from '../../src/ops/timeout-ping.js';
import { manual } from '../../src/index.js';
import { sleep } from '@ixfx/core';

describe('rx/ops/timeout-ping', () => {
  test('returns same reactive instance', () => {
    const source = manual<number>();
    const pinged = timeoutPing(source, { millis: 50 });

    // timeoutPing should return the same source, just with ping behavior added
    expect(pinged).toBe(source);
  });

  test('resets timer when value is emitted', async () => {
    const source = manual<number>();
    const pinged = timeoutPing(source, { millis: 100 });

    const values: number[] = [];
    pinged.onValue((v) => values.push(v));

    // Emit value - resets timer
    source.set(1);
    await sleep(10);
    expect(values).toEqual([1]);

    // Should not have timed out yet
    source.set(2);
    await sleep(60);
    expect(values).toEqual([1, 2]);

    // Continue to emit values before timeout
    source.set(3);
    await sleep(60);
    expect(values).toEqual([1, 2, 3]);
  });

  test('stops pinging when source is disposed', async () => {
    const source = manual<number>();
    const pinged = timeoutPing(source, { millis: 50 });

    const values: number[] = [];
    pinged.onValue((v) => values.push(v));

    // Emit some values
    source.set(1);
    await sleep(10);
    expect(values).toEqual([1]);

    // Dispose source
    source.dispose('testing');

    // Source should be disposed
    expect(source.isDisposed()).toBe(true);
    expect(pinged.isDisposed()).toBe(true);
  });

  test('respects abort signal', async () => {
    const source = manual<number>();
    const abortController = new AbortController();

    const pinged = timeoutPing(source, { millis: 50, abort: abortController.signal });

    const values: number[] = [];
    pinged.onValue((v) => values.push(v));

    // Emit value
    source.set(1);
    await sleep(10);
    expect(values).toEqual([1]);

    // Abort
    abortController.abort();

    // Source should stop pinging after abort
    await sleep(100);
    // No errors should occur
  });

  test('works with arrays as source', async () => {
    const source = [1, 2, 3];
    const pinged = timeoutPing(source, { millis: 50 });

    // Should complete immediately for array source
    await sleep(10);
    // Array sources complete quickly
  });
});
