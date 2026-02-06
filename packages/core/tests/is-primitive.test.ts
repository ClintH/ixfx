import { test, expect, describe } from 'vitest';
import { isPrimitive, isPrimitiveOrObject } from '../src/is-primitive.js';

describe('isPrimitive', () => {
  test('returns true for numbers', () => {
    expect(isPrimitive(42)).toBe(true);
    expect(isPrimitive(0)).toBe(true);
    expect(isPrimitive(-1)).toBe(true);
    expect(isPrimitive(3.14)).toBe(true);
    expect(isPrimitive(NaN)).toBe(true);
    expect(isPrimitive(Infinity)).toBe(true);
  });

  test('returns true for strings', () => {
    expect(isPrimitive('hello')).toBe(true);
    expect(isPrimitive('')).toBe(true);
  });

  test('returns true for booleans', () => {
    expect(isPrimitive(true)).toBe(true);
    expect(isPrimitive(false)).toBe(true);
  });

  test('returns true for bigint', () => {
    expect(isPrimitive(BigInt(9007199254740991))).toBe(true);
    expect(isPrimitive(123n)).toBe(true);
  });

  test('returns false for objects', () => {
    expect(isPrimitive({})).toBe(false);
    expect(isPrimitive({ foo: 'bar' })).toBe(false);
    expect(isPrimitive([])).toBe(false);
    expect(isPrimitive([1, 2, 3])).toBe(false);
  });

  test('returns false for null', () => {
    expect(isPrimitive(null)).toBe(false);
  });

  test('returns false for undefined', () => {
    expect(isPrimitive(undefined)).toBe(false);
  });

  test('returns false for functions', () => {
    expect(isPrimitive(() => {})).toBe(false);
    expect(isPrimitive(function() {})).toBe(false);
  });

  test('returns false for symbols', () => {
    expect(isPrimitive(Symbol('test'))).toBe(false);
  });

  test('works as type guard', () => {
    const value: unknown = 42;
    if (isPrimitive(value)) {
      // TypeScript should narrow to Primitive type
      expect(typeof value).toBe('number');
    }
  });
});

describe('isPrimitiveOrObject', () => {
  test('returns true for primitives', () => {
    expect(isPrimitiveOrObject(42)).toBe(true);
    expect(isPrimitiveOrObject('hello')).toBe(true);
    expect(isPrimitiveOrObject(true)).toBe(true);
    expect(isPrimitiveOrObject(123n)).toBe(true);
  });

  test('returns true for objects', () => {
    expect(isPrimitiveOrObject({})).toBe(true);
    expect(isPrimitiveOrObject({ foo: 'bar' })).toBe(true);
    expect(isPrimitiveOrObject([])).toBe(true);
    expect(isPrimitiveOrObject([1, 2, 3])).toBe(true);
    expect(isPrimitiveOrObject(new Date())).toBe(true);
  });

  test('returns true for null', () => {
    expect(isPrimitiveOrObject(null)).toBe(true);
  });

  test('returns false for undefined', () => {
    expect(isPrimitiveOrObject(undefined)).toBe(false);
  });

  test('returns false for functions', () => {
    expect(isPrimitiveOrObject(() => {})).toBe(false);
  });

  test('returns false for symbols', () => {
    expect(isPrimitiveOrObject(Symbol('test'))).toBe(false);
  });

  test('works as type guard', () => {
    const value: unknown = { foo: 'bar' };
    if (isPrimitiveOrObject(value)) {
      // TypeScript should narrow to PrimitiveOrObject type
      expect(typeof value).toBe('object');
    }
  });
});
