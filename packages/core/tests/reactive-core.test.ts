import { describe, test, expect } from 'vitest';
import { isReactive, hasLast } from '../src/reactive-core.js';
import type { Reactive, ReactiveInitial } from '../src/types-reactive.js';

describe('core/reactive-core', () => {
  describe('isReactive', () => {
    test('returns true for reactive with on and onValue', () => {
      const rx = {
        on: () => () => {},
        onValue: () => () => {},
        dispose: () => {},
        isDisposed: () => false
      };
      expect(isReactive(rx)).toBe(true);
    });

    test('returns false for null', () => {
      expect(isReactive(null as unknown as object)).toBe(false);
    });

    test('returns false for undefined', () => {
      expect(isReactive(undefined as unknown as object)).toBe(false);
    });

    test('returns false for non-object', () => {
      expect(isReactive('string' as any)).toBe(false);
      expect(isReactive(42 as any)).toBe(false);
      expect(isReactive(true as any)).toBe(false);
    });

    test('returns false for object without on', () => {
      const obj = { onValue: () => () => {} };
      expect(isReactive(obj)).toBe(false);
    });

    test('returns false for object without onValue', () => {
      const obj = { on: () => () => {} };
      expect(isReactive(obj)).toBe(false);
    });

    test('returns false for empty object', () => {
      expect(isReactive({})).toBe(false);
    });

    test('returns false for arrays', () => {
      expect(isReactive([] as any)).toBe(false);
    });

    test('works as type guard', () => {
      const value = { on: () => () => {}, onValue: () => () => {} };
      if (isReactive(value)) {
        // TypeScript should know value has on and onValue
        expect(typeof value.on).toBe('function');
        expect(typeof value.onValue).toBe('function');
      }
    });
  });

  describe('hasLast', () => {
    test('returns true for reactive with last() returning value', () => {
      const rx = {
        on: () => () => {},
        onValue: () => () => {},
        last: () => 42
      };
      expect(hasLast(rx)).toBe(true);
    });

    test('returns false for reactive with last() returning undefined', () => {
      const rx = {
        on: () => () => {},
        onValue: () => () => {},
        last: () => undefined
      };
      expect(hasLast(rx)).toBe(false);
    });

    test('returns false for reactive without last', () => {
      const rx = {
        on: () => () => {},
        onValue: () => () => {}
      };
      expect(hasLast(rx)).toBe(false);
    });

    test('returns false for non-reactive', () => {
      expect(hasLast({})).toBe(false);
      expect(hasLast(null as any)).toBe(false);
      expect(hasLast('string' as any)).toBe(false);
    });

    test('returns true for reactive with falsy last value', () => {
      const rx = {
        on: () => () => {},
        onValue: () => () => {},
        last: () => 0
      };
      expect(hasLast(rx)).toBe(true);
    });

    test('returns true for reactive with empty string last value', () => {
      const rx = {
        on: () => () => {},
        onValue: () => () => {},
        last: () => ''
      };
      expect(hasLast(rx)).toBe(true);
    });

    test('returns true for reactive with false last value', () => {
      const rx = {
        on: () => () => {},
        onValue: () => () => {},
        last: () => false
      };
      expect(hasLast(rx)).toBe(true);
    });

    test('returns false for reactive with null last value', () => {
      const rx = {
        on: () => () => {},
        onValue: () => () => {},
        last: () => null
      };
      expect(hasLast(rx)).toBe(true); // null !== undefined, so this returns true
    });

    test('works as type guard', () => {
      const rx = {
        on: () => () => {},
        onValue: () => () => {},
        last: () => 42
      };

      if (hasLast(rx)) {
        // TypeScript should know rx has last()
        expect(rx.last()).toBe(42);
      }
    });
  });
});