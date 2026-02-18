import { describe, test, expect, vi } from 'vitest';
import { func } from '../../src/from/function.js';
import { toArray } from '../../src/to-array.js';

describe('rx/from/function', () => {
  test('emits result of function', async () => {
    const fn = vi.fn().mockReturnValue(42);
    const rx = func(fn, { interval: 1, maximumRepeats: 3 });

    const values = await toArray(rx);
    expect(values).toEqual([42, 42, 42]);
    expect(fn).toHaveBeenCalledTimes(3);
  });

  test('manual mode does not auto-call function', async () => {
    const fn = vi.fn().mockReturnValue(42);
    const rx = func(fn, { manual: true });

    expect(fn).toHaveBeenCalledTimes(0);
  });

  test('interval controls timing', async () => {
    const fn = vi.fn().mockReturnValue(1);
    const rx = func(fn, { interval: 10, maximumRepeats: 3 });

    const start = Date.now();
    await toArray(rx);
    const elapsed = Date.now() - start;

    expect(elapsed).toBeGreaterThanOrEqual(20);
  });

  test('predelay delays first call', async () => {
    const fn = vi.fn().mockReturnValue(1);
    const rx = func(fn, { interval: 1, predelay: 20, maximumRepeats: 2 });

    const start = Date.now();
    await toArray(rx);
    const elapsed = Date.now() - start;

    expect(elapsed).toBeGreaterThanOrEqual(20);
  });

  test('signal aborts execution', async () => {
    const ac = new AbortController();
    const fn = vi.fn().mockImplementation(() => {
      if (ac.signal.aborted) throw new Error('aborted');
      return 1;
    });

    const rx = func(fn, { interval: 5, signal: ac.signal, maximumRepeats: 100 });

    setTimeout(() => ac.abort('test'), 10);

    const values = await toArray(rx);
    expect(values.length).toBeLessThan(100);
  });

  test('async function works', async () => {
    const fn = vi.fn().mockResolvedValue('async result');
    const rx = func(fn, { interval: 1, maximumRepeats: 3 });

    const values = await toArray(rx);
    expect(values).toEqual(['async result', 'async result', 'async result']);
  });

  test('abort callback stops execution', async () => {
    let shouldContinue = true;
    const fn = vi.fn().mockImplementation((abort) => {
      if (!shouldContinue) {
        abort('stopped');
        return 0;
      }
      return 1;
    });

    const rx = func(fn, { interval: 1, maximumRepeats: 100 });

    await new Promise(r => setTimeout(r, 5));
    shouldContinue = false;

    const values = await toArray(rx);
    expect(values.length).toBeLessThan(100);
  });

  test('lazy very option stops when no subscribers', async () => {
    const fn = vi.fn().mockReturnValue(1);
    const rx = func(fn, { interval: 1, maximumRepeats: 100, lazy: 'very' });

    const unsub = rx.onValue(() => {});
    await new Promise(r => setTimeout(r, 5));
    unsub();

    const callsAfterUnsub = fn.mock.calls.length;
    await new Promise(r => setTimeout(r, 5));

    expect(fn.mock.calls.length).toBe(callsAfterUnsub);
  });

  test('throws error when manual and interval both set', () => {
    const fn = () => 1;

    expect(() => func(fn, { manual: true, interval: 100 })).toThrow();
  });
});
