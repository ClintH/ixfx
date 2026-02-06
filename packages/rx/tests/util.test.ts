import { describe, test, expect } from 'vitest';
import { 
  isReactive, 
  isWritable, 
  isPingable, 
  messageHasValue, 
  messageIsSignal,
  messageIsDoneSignal,
  hasLast,
  isWrapped,
  opify,
  isTriggerValue,
  isTriggerFunction
} from '../src/util.js';

describe('rx/util', () => {
  describe('isReactive', () => {
    test('returns true for reactive objects', () => {
      const reactive = { on: () => {}, onValue: () => {} };
      expect(isReactive(reactive)).toBe(true);
    });

    test('returns false for non-objects', () => {
      expect(isReactive(null)).toBe(false);
      expect(isReactive(undefined)).toBe(false);
      expect(isReactive('string')).toBe(false);
      expect(isReactive(123)).toBe(false);
    });

    test('returns false for objects without on and onValue', () => {
      expect(isReactive({})).toBe(false);
      expect(isReactive({ on: () => {} })).toBe(false);
      expect(isReactive({ onValue: () => {} })).toBe(false);
    });

    test('returns false for objects with null on/onValue', () => {
      expect(isReactive({ on: null, onValue: null })).toBe(false);
    });
  });

  describe('isWritable', () => {
    test('returns true for writable reactives', () => {
      const writable = { on: () => {}, onValue: () => {}, set: () => {} };
      expect(isWritable(writable)).toBe(true);
    });

    test('returns false for non-writable reactives', () => {
      const readable = { on: () => {}, onValue: () => {} };
      expect(isWritable(readable)).toBe(false);
    });

    test('returns false for non-reactives', () => {
      expect(isWritable({})).toBe(false);
      expect(isWritable(null)).toBe(false);
    });
  });

  describe('isPingable', () => {
    test('returns true for pingable reactives', () => {
      const pingable = { on: () => {}, onValue: () => {}, ping: () => {} };
      expect(isPingable(pingable)).toBe(true);
    });

    test('returns false for non-pingable reactives', () => {
      const nonPingable = { on: () => {}, onValue: () => {} };
      expect(isPingable(nonPingable)).toBe(false);
    });

    test('returns false for non-reactives', () => {
      expect(isPingable({})).toBe(false);
      expect(isPingable(null)).toBe(false);
    });
  });

  describe('messageHasValue', () => {
    test('returns true when value is defined', () => {
      expect(messageHasValue({ value: 42 })).toBe(true);
      expect(messageHasValue({ value: 0 })).toBe(true);
      expect(messageHasValue({ value: '' })).toBe(true);
      expect(messageHasValue({ value: false })).toBe(true);
    });

    test('returns false when value is undefined', () => {
      expect(messageHasValue({ value: undefined })).toBe(false);
      expect(messageHasValue({})).toBe(false);
    });
  });

  describe('messageIsSignal', () => {
    test('returns true for signal messages', () => {
      expect(messageIsSignal({ signal: 'done' })).toBe(true);
      expect(messageIsSignal({ signal: 'ping' })).toBe(true);
    });

    test('returns false for value messages', () => {
      expect(messageIsSignal({ value: 42 })).toBe(false);
    });

    test('returns false for undefined signal', () => {
      expect(messageIsSignal({ signal: undefined })).toBe(false);
    });
  });

  describe('messageIsDoneSignal', () => {
    test('returns true for done signal', () => {
      expect(messageIsDoneSignal({ signal: 'done' })).toBe(true);
    });

    test('returns false for other signals', () => {
      expect(messageIsDoneSignal({ signal: 'ping' })).toBe(false);
    });

    test('returns false for value messages', () => {
      expect(messageIsDoneSignal({ value: 42 })).toBe(false);
    });
  });

  describe('hasLast', () => {
    test('returns true for reactive with last method returning non-undefined', () => {
      const reactive = { 
        on: () => {}, 
        onValue: () => {}, 
        last: () => 42 
      };
      expect(hasLast(reactive)).toBe(true);
    });

    test('returns false when last returns undefined', () => {
      const reactive = { 
        on: () => {}, 
        onValue: () => {}, 
        last: () => undefined 
      };
      expect(hasLast(reactive)).toBe(false);
    });

    test('returns false when last method missing', () => {
      const reactive = { on: () => {}, onValue: () => {} };
      expect(hasLast(reactive)).toBe(false);
    });
  });

  describe('isWrapped', () => {
    test('returns true for wrapped values', () => {
      const wrapped = { source: {}, annotate: {} };
      expect(isWrapped(wrapped)).toBe(true);
    });

    test('returns false for non-wrapped', () => {
      expect(isWrapped({})).toBe(false);
      expect(isWrapped({ source: {} })).toBe(false);
      expect(isWrapped({ annotate: {} })).toBe(false);
      expect(isWrapped(null)).toBe(false);
    });
  });

  describe('opify', () => {
    test('returns a function', () => {
      const fn = (source: any) => source;
      const op = opify(fn);
      expect(typeof op).toBe('function');
    });

    test('creates operator that calls original function', () => {
      const fn = (source: any, multiplier: number) => source * multiplier;
      const double = opify(fn, 2);
      expect(double(5)).toBe(10);
    });

    test('passes multiple arguments', () => {
      const fn = (source: any, a: number, b: number) => source + a + b;
      const addFive = opify(fn, 2, 3);
      expect(addFive(10)).toBe(15);
    });
  });

  describe('isTriggerValue', () => {
    test('returns true for trigger value', () => {
      expect(isTriggerValue({ value: 42 })).toBe(true);
    });

    test('returns false for other triggers', () => {
      expect(isTriggerValue({ fn: () => {} })).toBe(false);
    });
  });

  describe('isTriggerFunction', () => {
    test('returns true for trigger function', () => {
      expect(isTriggerFunction({ fn: () => {} })).toBe(true);
    });

    test('returns false for other triggers', () => {
      expect(isTriggerFunction({ value: 42 })).toBe(false);
    });
  });
});
