import { describe, test, expect } from 'vitest';
import { unique, uniqueInstances } from '../../src/trackers/track-unique.js';

describe('core/trackers/track-unique', () => {
  describe('unique', () => {
    test('returns true for first string value', () => {
      const track = unique();
      expect(track('hello')).toBe(true);
    });

    test('returns false for duplicate string value', () => {
      const track = unique();
      expect(track('hello')).toBe(true);
      expect(track('hello')).toBe(false);
    });

    test('tracks multiple unique strings', () => {
      const track = unique();
      expect(track('a')).toBe(true);
      expect(track('b')).toBe(true);
      expect(track('c')).toBe(true);
      expect(track('a')).toBe(false);
      expect(track('b')).toBe(false);
    });

    test('tracks numbers as strings', () => {
      const track = unique();
      expect(track(1)).toBe(true);
      expect(track(2)).toBe(true);
      expect(track(1)).toBe(false);
    });

    test('tracks objects by JSON.stringify by default', () => {
      const track = unique();
      const obj1 = { name: 'John' };
      const obj2 = { name: 'John' }; // Same content, different reference

      expect(track(obj1)).toBe(true);
      expect(track(obj2)).toBe(false); // Same when stringified
    });

    test('throws for null', () => {
      const track = unique();
      expect(() => track(null)).toThrow(TypeError);
      expect(() => track(null)).toThrow('cannot be null');
    });

    test('throws for undefined', () => {
      const track = unique();
      expect(() => track(undefined)).toThrow(TypeError);
      expect(() => track(undefined)).toThrow('cannot be undefined');
    });

    test('uses custom toString function', () => {
      const track = unique((p: { name: string; level: number }) => p.name);
      
      expect(track({ name: 'John', level: 2 })).toBe(true);
      expect(track({ name: 'John', level: 3 })).toBe(false); // Same name
      expect(track({ name: 'Jane', level: 2 })).toBe(true); // Different name
    });

    test('each tracker has independent set', () => {
      const track1 = unique();
      const track2 = unique();

      expect(track1('hello')).toBe(true);
      expect(track2('hello')).toBe(true); // Independent
      
      expect(track1('hello')).toBe(false);
      expect(track2('hello')).toBe(false);
    });

    test('tracks arrays by stringification', () => {
      const track = unique();
      
      expect(track([1, 2, 3])).toBe(true);
      expect(track([1, 2, 3])).toBe(false); // Same content
      expect(track([1, 2, 4])).toBe(true); // Different content
    });

    test('empty string is valid', () => {
      const track = unique();
      
      expect(track('')).toBe(true);
      expect(track('')).toBe(false);
    });

    test('zero is valid', () => {
      const track = unique();
      
      expect(track(0)).toBe(true);
      expect(track(0)).toBe(false);
    });

    test('false is valid', () => {
      const track = unique();
      
      expect(track(false)).toBe(true);
      expect(track(false)).toBe(false);
    });

    test('booleans are tracked as strings', () => {
      const track = unique();
      
      expect(track(true)).toBe(true);
      expect(track(false)).toBe(true);
      expect(track(true)).toBe(false);
    });
  });

  describe('uniqueInstances', () => {
    test('returns true for first object instance', () => {
      const track = uniqueInstances();
      const obj = { name: 'test' };
      
      expect(track(obj)).toBe(true);
    });

    test('returns false for same object instance', () => {
      const track = uniqueInstances();
      const obj = { name: 'test' };
      
      expect(track(obj)).toBe(true);
      expect(track(obj)).toBe(false);
    });

    test('tracks different object instances as unique', () => {
      const track = uniqueInstances();
      const obj1 = { name: 'John' };
      const obj2 = { name: 'John' }; // Same content, different reference

      expect(track(obj1)).toBe(true);
      expect(track(obj2)).toBe(true); // Different instance
      expect(track(obj1)).toBe(false);
      expect(track(obj2)).toBe(false);
    });

    test('tracks multiple instances', () => {
      const track = uniqueInstances();
      const a = {};
      const b = {};
      const c = {};

      expect(track(a)).toBe(true);
      expect(track(b)).toBe(true);
      expect(track(c)).toBe(true);
      expect(track(a)).toBe(false);
      expect(track(b)).toBe(false);
    });

    test('throws for null', () => {
      const track = uniqueInstances();
      expect(() => track(null)).toThrow(TypeError);
      expect(() => track(null)).toThrow('cannot be null');
    });

    test('throws for undefined', () => {
      const track = uniqueInstances();
      expect(() => track(undefined)).toThrow(TypeError);
      expect(() => track(undefined)).toThrow('cannot be undefined');
    });

    test('each tracker has independent set', () => {
      const track1 = uniqueInstances();
      const track2 = uniqueInstances();
      const obj = { test: 'value' };

      expect(track1(obj)).toBe(true);
      expect(track2(obj)).toBe(true); // Independent
    });

    test('works with arrays by reference', () => {
      const track = uniqueInstances();
      const arr1 = [1, 2, 3];
      const arr2 = [1, 2, 3]; // Same content, different reference

      expect(track(arr1)).toBe(true);
      expect(track(arr2)).toBe(true); // Different instance
      expect(track(arr1)).toBe(false);
    });

    test('works with functions', () => {
      const track = uniqueInstances();
      const fn1 = () => {};
      const fn2 = () => {};

      expect(track(fn1)).toBe(true);
      expect(track(fn2)).toBe(true);
      expect(track(fn1)).toBe(false);
    });

    test('works with class instances', () => {
      class TestClass {
        constructor(public value: number) {}
      }

      const track = uniqueInstances();
      const obj1 = new TestClass(1);
      const obj2 = new TestClass(1);

      expect(track(obj1)).toBe(true);
      expect(track(obj2)).toBe(true);
      expect(track(obj1)).toBe(false);
    });
  });

  describe('comparison: unique vs uniqueInstances', () => {
    test('unique compares by value, uniqueInstances by reference', () => {
      const byValue = unique();
      const byRef = uniqueInstances();
      
      const obj1 = { name: 'test' };
      const obj2 = { name: 'test' };

      // unique uses JSON.stringify, so same content = duplicate
      expect(byValue(obj1)).toBe(true);
      expect(byValue(obj2)).toBe(false);

      // uniqueInstances uses reference, so different objects = unique
      expect(byRef(obj1)).toBe(true);
      expect(byRef(obj2)).toBe(true);
    });

    test('strings work the same for both', () => {
      const byValue = unique();
      const byRef = uniqueInstances<string>();

      // Strings are primitives, so they compare by value
      expect(byValue('hello')).toBe(true);
      expect(byRef('hello')).toBe(true);
      expect(byValue('hello')).toBe(false);
      expect(byRef('hello')).toBe(false);
    });

    test('numbers work the same for both', () => {
      const byValue = unique();
      const byRef = uniqueInstances<number>();

      expect(byValue(42)).toBe(true);
      expect(byRef(42)).toBe(true);
      expect(byValue(42)).toBe(false);
      expect(byRef(42)).toBe(false);
    });
  });
});