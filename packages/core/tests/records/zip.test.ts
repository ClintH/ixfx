import { test, expect, describe } from 'vitest';
import {  zip } from '../../src/records/zip.js';

describe(`records/zip`, () => {
  describe(`zip`, () => {
    test(`zips two arrays of same length`, () => {
      const a = [{ id: 1 }, { id: 2 }];
      const b = [{ name: `one` }, { name: `two` }];
      const result = [...zip(a as any, b as any)];
      expect(result).toEqual([
        { id: 1, name: `one` },
        { id: 2, name: `two` }
      ]);
    });

    test(`b overrides a for same keys`, () => {
      const a = [{ x: 1, y: 2 }];
      const b = [{ x: 10, z: 3 }];
      const result = [...zip(a as any, b as any)];
      expect(result).toEqual([{ x: 10, y: 2, z: 3 }]);
    });

    test(`throws for array length mismatch`, () => {
      const a = [{ id: 1 }];
      const b = [{ id: 1 }, { id: 2 }];
      expect(() => [...zip(a as any, b as any)]).toThrow(/Array length mismatch/);
    });

    test(`throws for non-array first parameter`, () => {
      const b = [{ id: 1 }];
      expect(() => [...zip({} as any, b)]).toThrow(/Value at index 0 is not an array as expected/);
    });

    test(`throws for non-array second parameter`, () => {
      const a = [{ id: 1 }];
      expect(() => [...zip(a, {} as any)]).toThrow(/Value at index 1 is not an array as expected/);
    });

    test(`handles empty arrays`, () => {
      const a: { id: number }[] = [];
      const b: { name: string }[] = [];
      const result = [...zip(a as any, b as any)];
      expect(result).toEqual([]);
    });

    test(`handles single element arrays`, () => {
      const a = [{ x: 1 }];
      const b = [{ y: 2 }];
      const result = [...zip(a as any, b as any)];
      expect(result).toEqual([{ x: 1, y: 2 }]);
    });

    test(`handles objects with nested properties`, () => {
      const a = [{ position: { x: 1 } }];
      const b = [{ velocity: { dx: 0.5 } }];
      const result = [...zip(a as any, b as any)];
      expect(result).toEqual([{ position: { x: 1 }, velocity: { dx: 0.5 } }]);
    });

    test(`is iterable`, () => {
      const a = [{ a: 1 }];
      const b = [{ b: 2 }];
      const iterator = zip(a as any, b as any);
      expect(typeof iterator[Symbol.iterator]).toBe(`function`);
      const result = [...iterator];
      expect(result).toEqual([{ a: 1, b: 2 }]);
    });

    test(`preserves symbol keys`, () => {
      const sym = Symbol(`key`);
      const a = [{ [sym]: 1 }];
      const b = [{ other: 2 }];
      const result = [...zip(a as any, b as any)];
      expect(result).toEqual([{ [sym]: 1, other: 2 }]);
    });
  });
});
