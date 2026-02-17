import { test, expect, describe } from 'vitest';
import { mapObjectKeys } from '../../src/records/map-object-keys.js';

describe(`records/map-object-keys`, () => {
  describe(`mapObjectKeys`, () => {
    test(`maps keys to uppercase`, () => {
      const input = { hello: `there`, chap: `chappie` };
      const result = mapObjectKeys(input, key => key.toUpperCase());
      expect(result).toEqual({ HELLO: `there`, CHAP: `chappie` });
    });

    test(`maps keys to lowercase`, () => {
      const input = { HELLO: `there`, WORLD: `!` };
      const result = mapObjectKeys(input, key => key.toLowerCase());
      expect(result).toEqual({ hello: `there`, world: `!` });
    });

    test(`adds prefix to keys`, () => {
      const input = { a: 1, b: 2 };
      const result = mapObjectKeys(input, key => `prefix_${key}`);
      expect(result).toEqual({ prefix_a: 1, prefix_b: 2 });
    });

    test(`adds suffix to keys`, () => {
      const input = { name: `test`, value: 42 };
      const result = mapObjectKeys(input, key => `${key}_field`);
      expect(result).toEqual({ name_field: `test`, value_field: 42 });
    });

    test(`maps numeric keys to strings`, () => {
      const input: Record<number, string> = { 1: `one`, 2: `two` };
      const result = mapObjectKeys(input, key => `num_${key}`);
      expect(result).toEqual({ num_1: `one`, num_2: `two` });
    });

    test(`handles empty object`, () => {
      const input = {};
      const result = mapObjectKeys(input, key => key);
      expect(result).toEqual({});
    });

    test(`handles single property`, () => {
      const input = { x: 10 };
      const result = mapObjectKeys(input, key => `key_${key}`);
      expect(result).toEqual({ key_x: 10 });
    });

    test(`preserves values`, () => {
      const input = { a: { nested: true }, b: [1, 2, 3] };
      const result = mapObjectKeys(input, key => key.toUpperCase());
      expect(result.A).toEqual({ nested: true });
      expect(result.B).toEqual([1, 2, 3]);
    });

    test(`transforms keys using custom function`, () => {
      const input = { firstName: `John`, lastName: `Doe` };
      const result = mapObjectKeys(input, key => key.replace(/([A-Z])/g, `_$1`).toLowerCase());
      expect(result).toEqual({ first_name: `John`, last_name: `Doe` });
    });

    test(`handles symbol keys`, () => {
      const input = { a: 1 };
      const result = mapObjectKeys(input, key => `symbol_${key}`);
      expect(result).toEqual({ symbol_a: 1 });
    });

    test(`returns new object without modifying original`, () => {
      const input = { a: 1 };
      const result = mapObjectKeys(input, key => key.toUpperCase());
      expect(input).toEqual({ a: 1 });
      expect(result).toEqual({ A: 1 });
    });
  });
});
