import { describe, test, expect } from 'vitest';
import { nullUndefTest, isDefined } from '../src/empty.js';

describe('guards/empty', () => {
  describe('nullUndefTest', () => {
    test('returns success for defined value', () => {
      const result = nullUndefTest(42);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toBe(42);
      }
    });

    test('returns error for undefined', () => {
      const result = nullUndefTest(undefined);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('undefined');
      }
    });

    test('returns error for null', () => {
      const result = nullUndefTest(null);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('null');
      }
    });

    test('includes parameter name in error', () => {
      const result = nullUndefTest(undefined, 'myParam');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('myParam');
      }
    });

    test('accepts falsy values that are not null/undefined', () => {
      expect(nullUndefTest(0).success).toBe(true);
      expect(nullUndefTest('').success).toBe(true);
      expect(nullUndefTest(false).success).toBe(true);
    });

    test('accepts empty objects and arrays', () => {
      expect(nullUndefTest({}).success).toBe(true);
      expect(nullUndefTest([]).success).toBe(true);
    });
  });

  describe('isDefined', () => {
    test('returns true for defined values', () => {
      expect(isDefined(42)).toBe(true);
      expect(isDefined('')).toBe(true);
      expect(isDefined(0)).toBe(true);
      expect(isDefined(false)).toBe(true);
      expect(isDefined({})).toBe(true);
      expect(isDefined([])).toBe(true);
    });

    test('returns false for undefined', () => {
      expect(isDefined(undefined)).toBe(false);
    });

    test('returns true for null (only checks undefined)', () => {
      // Note: isDefined only checks for undefined, not null
      expect(isDefined(null)).toBe(true);
    });

    test('works as type guard', () => {
      const value: string | undefined = 'test';
      if (isDefined(value)) {
        // TypeScript should know value is string here
        expect(value.length).toBe(4);
      }
    });
  });
});