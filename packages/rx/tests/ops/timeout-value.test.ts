import { describe, test, expect } from 'vitest';
import { timeoutValue } from '../../src/ops/timeout-value.js';
import { manual } from '../../src/index.js';
import { sleep } from '@ixfx/core';

describe('rx/ops/timeout-value', () => {
  test('emits fallback value when no value within interval', async () => {
    const source = manual<number>();
    const timeouted = timeoutValue(source, { value: 999, interval: { millis: 50 } });

    const values: (number | string)[] = [];
    timeouted.onValue((v) => values.push(v));

    // Initially no value
    await sleep(10);
    expect(values).toEqual([]);

    // After timeout, should emit fallback
    await sleep(60);
    expect(values).toEqual([999]);
  });

  test('does not emit fallback if value emitted within interval', async () => {
    const source = manual<number>();
    const timeouted = timeoutValue(source, { value: 999, interval: { millis: 100 } });

    const values: (number | string)[] = [];
    timeouted.onValue((v) => values.push(v));

    // Emit before timeout
    source.set(1);
    await sleep(10);
    expect(values).toEqual([1]);

    // Should not have timed out
    await sleep(150);
    // After new timeout from the emit
    expect(values).toEqual([1, 999]);
  });

  test('resets timer when value is emitted', async () => {
    const source = manual<number>();
    const timeouted = timeoutValue(source, { value: 999, interval: { millis: 100 } });

    const values: (number | string)[] = [];
    timeouted.onValue((v) => values.push(v));

    // Emit value
    source.set(1);
    await sleep(10);
    expect(values).toEqual([1]);

    // Emit again - resets timer
    source.set(2);
    await sleep(60);
    expect(values).toEqual([1, 2]);

    // Now timeout
    await sleep(60);
    expect(values).toEqual([1, 2, 999]);
  });

  test('emits fallback from function', async () => {
    const source = manual<number>();
    let callCount = 0;
    const timeouted = timeoutValue(source, {
      fn: () => {
        callCount++;
        return `fallback-${callCount}`;
      },
      interval: { millis: 50 },
    });

    const values: (number | string)[] = [];
    timeouted.onValue((v) => values.push(v));

    await sleep(60);
    expect(values).toEqual(['fallback-1']);
  });

  test('supports repeat option', async () => {
    const source = manual<number>();
    const timeouted = timeoutValue(source, {
      value: 999,
      interval: { millis: 50 },
      repeat: true,
    });

    const values: (number | string)[] = [];
    timeouted.onValue((v) => values.push(v));

    // Wait for multiple timeouts
    await sleep(180);
    expect(values.length).toBeGreaterThanOrEqual(2);
    expect(values.every((v) => v === 999)).toBe(true);
  });

  test('does not repeat when repeat is false', async () => {
    const source = manual<number>();
    const timeouted = timeoutValue(source, {
      value: 999,
      interval: { millis: 50 },
      repeat: false,
    });

    const values: (number | string)[] = [];
    timeouted.onValue((v) => values.push(v));

    await sleep(60);
    expect(values).toEqual([999]);

    // Wait longer - should not repeat
    await sleep(100);
    expect(values).toEqual([999]);
  });

  test('throws if neither value nor fn provided', () => {
    const source = manual<number>();

    expect(() => timeoutValue(source, { interval: { millis: 50 } } as any)).toThrow(
      "Param 'options' does not contain trigger 'value' or 'fn' fields"
    );
  });

  test('clears timer on dispose', async () => {
    const source = manual<number>();
    const timeouted = timeoutValue(source, { value: 999, interval: { millis: 50 } });

    const values: (number | string)[] = [];
    timeouted.onValue((v) => values.push(v));

    // Dispose before timeout
    timeouted.dispose('testing');

    await sleep(60);
    expect(values).toEqual([]);
  });

  test('uses immediate option', async () => {
    const source = manual<number>();
    const timeouted = timeoutValue(source, {
      value: 999,
      interval: { millis: 50 },
      immediate: true,
    });

    const values: (number | string)[] = [];
    timeouted.onValue((v) => values.push(v));

    // With immediate=true (default), should timeout from start
    await sleep(60);
    expect(values).toEqual([999]);
  });

  test('respects immediate: false', async () => {
    const source = manual<number>();
    const timeouted = timeoutValue(source, {
      value: 999,
      interval: { millis: 50 },
      immediate: false,
    });

    const values: (number | string)[] = [];
    timeouted.onValue((v) => values.push(v));

    // With immediate=false, timer doesn't start until first value
    await sleep(60);
    expect(values).toEqual([]);

    // Now emit - timer starts
    source.set(1);
    expect(values).toEqual([1]);

    // Now it should timeout
    await sleep(60);
    expect(values).toEqual([1, 999]);
  });
});
