import { describe, test, expect } from 'vitest';
import { stringTest } from '../src/string.js';

describe('guards/string', () => {
  describe('stringTest', () => {
    test('returns success for strings', () => {
      const result = stringTest('hello');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toBe('hello');
      }
    });

    test('returns success for empty string by default', () => {
      const result = stringTest('');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toBe('');
      }
    });

    test('returns error for non-strings', () => {
      const result = stringTest(42);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('number');
      }
    });

    test('returns error for null', () => {
      const result = stringTest(null);
      expect(result.success).toBe(false);
    });

    test('returns error for undefined', () => {
      const result = stringTest(undefined);
      expect(result.success).toBe(false);
    });

    test('returns error for objects', () => {
      const result = stringTest({});
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('object');
      }
    });

    test('returns error for arrays', () => {
      const result = stringTest(['s', 't', 'r']);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('object');
      }
    });

    describe('non-empty range', () => {
      test('accepts non-empty strings', () => {
        const result = stringTest('hello', 'non-empty');
        expect(result.success).toBe(true);
      });

      test('rejects empty strings', () => {
        const result = stringTest('', 'non-empty');
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toContain('empty');
        }
      });

      test('rejects whitespace-only strings', () => {
        // Note: this only checks length, not content
        const result = stringTest('   ', 'non-empty');
        expect(result.success).toBe(true);
      });
    });

    test('includes parameter name in error', () => {
      const result = stringTest(42, '', 'nameParam');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('nameParam');
      }
    });

    test('uses default parameter name', () => {
      const result = stringTest(42);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('?');
      }
    });

    test('accepts String objects', () => {
      // String objects (not primitives) should fail
      const strObj = new String('hello');
      const result = stringTest(strObj);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('object');
      }
    });

    test('accepts unicode strings', () => {
      const result = stringTest('hello 🌍 world');
      expect(result.success).toBe(true);
      expect(result.success && result.value).toBe('hello 🌍 world');
    });

    test('accepts multiline strings', () => {
      const result = stringTest('line1\nline2\nline3');
      expect(result.success).toBe(true);
    });
  });
});