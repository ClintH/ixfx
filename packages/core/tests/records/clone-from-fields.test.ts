import { test, expect, describe } from 'vitest';
import { cloneFromFields } from '../../src/records/clone-from-fields.js';

describe(`records/clone-from-fields`, () => {
  describe(`cloneFromFields`, () => {
    test(`clones object with primitive fields`, () => {
      const source = { name: `test`, value: 42, active: true };
      const result = cloneFromFields(source);
      expect(result).toEqual({ name: `test`, value: 42, active: true });
    });

    test(`includes nested objects`, () => {
      const source = { name: `test`, nested: { a: 1, b: 2 } };
      const result = cloneFromFields(source);
      expect(result).toEqual({ name: `test`, nested: { a: 1, b: 2 } });
    });

    test(`includes arrays`, () => {
      const source = { name: `test`, items: [1, 2, 3] };
      const result = cloneFromFields(source);
      expect(result).toEqual({ name: `test`, items: [1, 2, 3] });
    });

    test(`includes functions`, () => {
      const source = { name: `test`, method: () => {} };
      const result = cloneFromFields(source);
      expect(result.name).toBe(`test`);
      expect(typeof result.method).toBe(`function`);
    });

    test(`handles empty object`, () => {
      const source = {};
      const result = cloneFromFields(source);
      expect(result).toEqual({});
    });

    test(`includes undefined values`, () => {
      const source = { name: `test`, value: undefined };
      const result = cloneFromFields(source);
      expect(result).toEqual({ name: `test`, value: undefined });
    });

    test(`includes null values`, () => {
      const source = { name: `test`, value: null };
      const result = cloneFromFields(source);
      expect(result).toEqual({ name: `test`, value: null });
    });

    test(`returns new object without modifying source`, () => {
      const source = { name: `test` };
      const result = cloneFromFields(source);
      result.name = `modified`;
      expect(source.name).toBe(`test`);
    });

    test(`includes string values`, () => {
      const source = { name: `John`, message: `hello world` };
      const result = cloneFromFields(source);
      expect(result).toEqual(source);
    });

    test(`includes numeric values`, () => {
      const source = { count: 42, price: 99.99 };
      const result = cloneFromFields(source);
      expect(result).toEqual(source);
    });

    test(`includes boolean values`, () => {
      const source = { active: true, deleted: false };
      const result = cloneFromFields(source);
      expect(result).toEqual(source);
    });

    test(`excludes symbol properties`, () => {
      const sym = Symbol(`test`);
      const source = { name: `test`, [sym]: `value` };
      const result = cloneFromFields(source);
      expect(result).toEqual({ name: `test` });
    });

    test(`includes Date values`, () => {
      const date = new Date();
      const source = { name: `test`, created: date };
      const result = cloneFromFields(source);
      expect(result).toEqual({ name: `test`, created: date });
    });

    test(`includes instance properties`, () => {
      class MyClass {
        constructor(public value: number) {}
      }
      const source = new MyClass(42);
      const result = cloneFromFields(source);
      expect((result as any).value).toBe(42);
    });
  });
});
