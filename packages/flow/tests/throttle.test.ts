import { describe, test, expect } from 'vitest';
import { throttle } from '../src/throttle.js';

describe('flow/throttle', () => {
  test('creates throttled function', () => {
    const fn = () => {};
    const throttled = throttle(fn, 100);
    
    expect(typeof throttled).toBe('function');
  });
});