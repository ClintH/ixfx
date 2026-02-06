import { test, expect, describe } from 'vitest';
import { runOnce } from '../src/run-once.js';

describe('runOnce', () => {
  test('runs function only once', () => {
    let callCount = 0;
    const onceFn = runOnce(() => {
      callCount++;
      return true;
    });

    // First call should execute
    const result1 = onceFn();
    expect(result1).toBe(true);
    expect(callCount).toBe(1);

    // Second call should not execute
    const result2 = onceFn();
    expect(result2).toBe(true);
    expect(callCount).toBe(1); // Still 1

    // Third call should also not execute
    const result3 = onceFn();
    expect(result3).toBe(true);
    expect(callCount).toBe(1); // Still 1
  });

  test('returns false when function returns false', () => {
    let callCount = 0;
    const onceFn = runOnce(() => {
      callCount++;
      return false;
    });

    const result = onceFn();
    expect(result).toBe(false);
    expect(callCount).toBe(1);
  });

  test('returns cached result on subsequent calls', () => {
    let returnValue = true;
    let callCount = 0;
    const onceFn = runOnce(() => {
      callCount++;
      return returnValue;
    });

    // First call returns true
    expect(onceFn()).toBe(true);
    expect(callCount).toBe(1);

    // Change return value
    returnValue = false;

    // Second call should still return cached true
    expect(onceFn()).toBe(true);
    expect(callCount).toBe(1); // Not called again
  });

  test('handles exceptions in function', () => {
    let callCount = 0;
    const onceFn = runOnce(() => {
      callCount++;
      throw new Error('test error');
    });

    // First call throws
    expect(() => onceFn()).toThrow('test error');
    expect(callCount).toBe(1);

    // Second call returns false (initial value of success)
    // because success was never assigned due to the exception
    const result = onceFn();
    expect(result).toBe(false);
  });

  test('multiple runOnce instances are independent', () => {
    let count1 = 0;
    let count2 = 0;

    const once1 = runOnce(() => {
      count1++;
      return true;
    });

    const once2 = runOnce(() => {
      count2++;
      return true;
    });

    once1();
    once1();
    expect(count1).toBe(1);
    expect(count2).toBe(0);

    once2();
    expect(count1).toBe(1);
    expect(count2).toBe(1);
  });
});
