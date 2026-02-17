import { test, expect, describe } from 'vitest';
import { mergeObjects } from '../../src/records/merge.js';

describe(`records/merge`, () => {
  describe(`mergeObjects`, () => {
    test(`merges two objects`, () => {
      const result = mergeObjects({ a: 1 }, { b: 2 });
      expect(result).toEqual({ a: 1, b: 2 });
    });

    test(`later objects override earlier ones`, () => {
      const result = mergeObjects({ x: 1 }, { x: 2 });
      expect(result).toEqual({ x: 2 });
    });

    test(`merges three objects`, () => {
      const result = mergeObjects({ a: 1 }, { b: 2 }, { c: 3 });
      expect(result).toEqual({ a: 1, b: 2, c: 3 });
    });

    test(`later objects override earlier ones for nested properties`, () => {
      const result = mergeObjects({ outer: { inner: 1 } }, { outer: { other: 2 } });
      expect(result).toEqual({ outer: { other: 2 } });
    });

    test(`handles arrays`, () => {
      const result = mergeObjects({ arr: [1, 2] }, { arr: [3, 4] });
      expect(result).toEqual({ arr: [3, 4] });
    });

    test(`handles empty objects`, () => {
      const result = mergeObjects({}, {});
      expect(result).toEqual({});
    });

    test(`handles single object`, () => {
      const result = mergeObjects({ a: 1 });
      expect(result).toEqual({ a: 1 });
    });

    test(`handles primitive values`, () => {
      const result = mergeObjects({ str: `hello` }, { num: 42 }, { bool: true });
      expect(result).toEqual({ str: `hello`, num: 42, bool: true });
    });

    test(`handles null and undefined values`, () => {
      const result = mergeObjects({ a: null }, { a: undefined });
      expect(result).toEqual({ a: undefined });
    });

    test(`maintains properties from prototype`, () => {
      class MyClass {
        constructor(public value: number) {}
      }
      const source = new MyClass(1);
      const result = mergeObjects(source);
      expect((result as any).value).toBe(1);
    });

    test(`preserves function properties`, () => {
      const fn = () => {};
      const result = mergeObjects({ method: fn });
      expect((result as any).method).toBe(fn);
    });

    test(`handles symbol properties`, () => {
      const sym = Symbol(`test`);
      const result = mergeObjects({ [sym]: 1 });
      expect((result as any)[sym]).toBe(1);
    });

    test(`merges objects, later overriding earlier`, () => {
      const result = mergeObjects(
        { a: { b: 1 } },
        { a: { c: 2 } },
        { a: { d: 3 } }
      );
      expect(result).toEqual({ a: { d: 3 } });
    });
  });
});
