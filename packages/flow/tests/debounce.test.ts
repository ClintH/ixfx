import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { debounce } from '../src/debounce.js';

describe(`flow/debounce`, () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it(`creates debounced function`, () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    expect(typeof debounced).toBe(`function`);
  });

  it(`does not call function immediately`, () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    debounced();
    expect(fn).not.toHaveBeenCalled();
  });

  it(`calls function after interval`, () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    debounced();
    vi.advanceTimersByTime(100);

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it(`resets timer on subsequent calls`, () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    debounced();
    vi.advanceTimersByTime(50);
    debounced(); // Reset timer
    vi.advanceTimersByTime(50);

    // Should not have been called yet
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(50);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it(`only calls once after rapid invocations`, () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    debounced();
    debounced();
    debounced();
    debounced();
    debounced();

    vi.advanceTimersByTime(100);

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it(`passes arguments to callback`, () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    debounced(`arg1`, 42, { key: `value` });
    vi.advanceTimersByTime(100);

    expect(fn).toHaveBeenCalledWith(`arg1`, 42, { key: `value` });
  });

  it(`calls function with latest arguments`, () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    debounced(`first`);
    debounced(`second`);
    debounced(`third`);

    vi.advanceTimersByTime(100);

    expect(fn).toHaveBeenCalledWith(`third`);
    expect(fn).not.toHaveBeenCalledWith(`first`);
    expect(fn).not.toHaveBeenCalledWith(`second`);
  });

  it(`supports multiple debounced calls after completion`, () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    debounced();
    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);

    debounced();
    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it(`works with async callbacks`, async () => {
    const fn = vi.fn().mockResolvedValue(undefined);
    const debounced = debounce(fn, 100);

    debounced();
    vi.advanceTimersByTime(100);

    await vi.runAllTimersAsync();
    expect(fn).toHaveBeenCalled();
  });

  it(`result handler only reports last result`, () => {
    const results: string[] = [];
    const handler = (label: string) => {
      return label.toUpperCase();
    };

    const debounced = debounce(handler, 100, (result) => {
      if (result.success) {
        results.push(result.value);
      }
    });

    // Simulate rapid events
    debounced(`event1`);
    debounced(`event2`);
    debounced(`event3`);

    vi.advanceTimersByTime(100);

    // Only the last event should be processed
    expect(results).toEqual([`EVENT3`]);
  });
});