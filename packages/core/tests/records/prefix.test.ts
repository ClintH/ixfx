import { test, expect, describe } from 'vitest';
import { prefixProperties } from '../../src/records/prefix.js';

describe(`records/prefix`, () => {
  describe(`prefixProperties`, () => {
    test(`prefixes single object`, () => {
      const data = [{ name: `x`, size: 10 }];
      const result = prefixProperties(data, `test-`);
      expect(result).toEqual([{ 'test-name': `x`, 'test-size': 10 }]);
    });

    test(`prefixes multiple objects`, () => {
      const data = [
        { name: `a`, size: 1 },
        { name: `b`, size: 2 }
      ];
      const result = prefixProperties(data, `item-`);
      expect(result).toEqual([
        { 'item-name': `a`, 'item-size': 1 },
        { 'item-name': `b`, 'item-size': 2 }
      ]);
    });

    test(`handles empty array`, () => {
      const data: { name: string }[] = [];
      const result = prefixProperties(data, `prefix-`);
      expect(result).toEqual([]);
    });

    test(`handles empty object`, () => {
      const data = [{}];
      const result = prefixProperties(data, `test-`);
      expect(result).toEqual([{}]);
    });

    test(`handles numeric keys`, () => {
      const data = [{ 1: `one`, 2: `two` }];
      const result = prefixProperties(data, `num-`);
      expect(result).toEqual([{ 'num-1': `one`, 'num-2': `two` }]);
    });

    test(`handles special characters in prefix`, () => {
      const data = [{ a: 1 }];
      const result = prefixProperties(data, `__`);
      expect(result).toEqual([{ '__a': 1 }]);
    });

    test(`handles multiple properties`, () => {
      const data = [{ x: 1, y: 2, z: 3 }];
      const result = prefixProperties(data, `coord-`);
      expect(result).toEqual([{ 'coord-x': 1, 'coord-y': 2, 'coord-z': 3 }]);
    });

    test(`does not modify original data`, () => {
      const data = [{ name: `test` }];
      prefixProperties(data, `prefix-`);
      expect(data).toEqual([{ name: `test` }]);
    });
  });
});
