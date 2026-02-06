import { describe, test, expect } from 'vitest';
import { isFunction, functionTest } from '../src/function.js';

describe('guards/function', () => {
  describe('isFunction', () => {
    test('returns true for regular functions', () => {
      function namedFn() {}
      expect(isFunction(namedFn)).toBe(true);
    });

    test('returns true for arrow functions', () => {
      const arrowFn = () => {};
      expect(isFunction(arrowFn)).toBe(true);
    });

    test('returns true for class constructors', () => {
      class MyClass {}
      expect(isFunction(MyClass)).toBe(true);
    });

    test('returns true for built-in functions', () => {
      expect(isFunction(Array.isArray)).toBe(true);
      expect(isFunction(parseInt)).toBe(true);
      expect(isFunction(Date)).toBe(true);
    });

    test('returns false for non-functions', () => {
      expect(isFunction(42)).toBe(false);
      expect(isFunction('string')).toBe(false);
      expect(isFunction({})).toBe(false);
      expect(isFunction([])).toBe(false);
      expect(isFunction(null)).toBe(false);
      expect(isFunction(undefined)).toBe(false);
    });

    test('returns false for objects with function-like properties', () => {
      const obj = { call: () => {} };
      expect(isFunction(obj)).toBe(false);
    });

    test('works as type guard', () => {
      const value: unknown = () => 'test';
      if (isFunction(value)) {
        // TypeScript should know value is callable here
        expect(typeof value).toBe('function');
      }
    });
  });

  describe('functionTest', () => {
    test('returns success for functions', () => {
      const fn = () => 42;
      const result = functionTest(fn);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toBe(fn);
      }
    });

    test('returns error for undefined', () => {
      const result = functionTest(undefined);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('undefined');
      }
    });

    test('returns error for null', () => {
      const result = functionTest(null);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('null');
      }
    });

    test('returns error for non-function types', () => {
      const result = functionTest(42, 'myCallback');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('myCallback');
        expect(result.error).toContain('number');
      }
    });

    test('returns error for objects', () => {
      const result = functionTest({});
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('object');
      }
    });

    test('accepts async functions', () => {
      const asyncFn = async () => 'test';
      const result = functionTest(asyncFn);
      expect(result.success).toBe(true);
    });

    test('accepts generator functions', () => {
      function* genFn() { yield 1; }
      const result = functionTest(genFn);
      expect(result.success).toBe(true);
    });

    test('uses default parameter name', () => {
      const result = functionTest(42);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('?');
      }
    });

    test('includes custom parameter name in error', () => {
      const result = functionTest('not a function', 'handler');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('handler');
      }
    });
  });
});