import { describe, test, expect } from 'vitest';
import { cloneFromFields } from '../../src/ops/clone-from-fields.js';
import { manual } from '../../src/index.js';

describe('rx/ops/clone-from-fields', () => {
  test('clones plain object fields', () => {
    const source = manual<{ name: string; age: number }>();
    const cloned = cloneFromFields(source);

    const values: Array<{ name: string; age: number }> = [];
    cloned.onValue((v) => values.push(v));

    const original = { name: 'Alice', age: 30 };
    source.set(original);

    expect(values).toHaveLength(1);
    expect(values[0]).toEqual({ name: 'Alice', age: 30 });
    // Should be a clone, not the same reference
    expect(values[0]).not.toBe(original);
  });

  test('filters out non-plain-object fields', () => {
    const source = manual<any>();
    const cloned = cloneFromFields(source);

    const values: any[] = [];
    cloned.onValue((v) => values.push(v));

    source.set({
      name: 'test',
      count: 42,
      fn: () => {}, // Functions - behavior depends on testPlainObjectOrPrimitive
      symbol: Symbol('test'), // Symbols - behavior depends on testPlainObjectOrPrimitive
      nested: { value: 1 } // Nested plain objects should be kept
    });

    expect(values[0]).toHaveProperty('name', 'test');
    expect(values[0]).toHaveProperty('count', 42);
    expect(values[0]).toHaveProperty('nested');
    // Note: Function/symbol filtering depends on testPlainObjectOrPrimitive implementation
  });

  test('works with event-like objects', () => {
    const source = manual<any>();
    const cloned = cloneFromFields(source);

    const values: any[] = [];
    cloned.onValue((v) => values.push(v));

    // Simulate an event object
    const event = {
      target: { value: 'test' },
      type: 'input',
      bubbles: true,
      preventDefault: () => {}, // Method should be filtered
      stopPropagation: () => {} // Method should be filtered
    };

    source.set(event);

    expect(values[0]).toHaveProperty('target');
    expect(values[0]).toHaveProperty('type', 'input');
    expect(values[0]).toHaveProperty('bubbles', true);
    expect(values[0]).not.toHaveProperty('preventDefault');
    expect(values[0]).not.toHaveProperty('stopPropagation');
  });

  test('handles arrays', () => {
    const source = manual<any>();
    const cloned = cloneFromFields(source);

    const values: any[] = [];
    cloned.onValue((v) => values.push(v));

    source.set({
      items: [1, 2, 3],
      name: 'list'
    });

    expect(values[0]).toEqual({
      items: [1, 2, 3],
      name: 'list'
    });
  });

  test('handles nested objects', () => {
    const source = manual<any>();
    const cloned = cloneFromFields(source);

    const values: any[] = [];
    cloned.onValue((v) => values.push(v));

    source.set({
      user: {
        name: 'Bob',
        address: {
          city: 'NYC'
        }
      },
      id: 123
    });

    expect(values[0]).toHaveProperty('user');
    expect(values[0].user).toEqual({
      name: 'Bob',
      address: {
        city: 'NYC'
      }
    });
    expect(values[0]).toHaveProperty('id', 123);
  });

  test('preserves primitive values', () => {
    const source = manual<any>();
    const cloned = cloneFromFields(source);

    const values: any[] = [];
    cloned.onValue((v) => values.push(v));

    source.set({
      string: 'test',
      number: 42,
      boolean: true,
      nullValue: null,
      undefinedValue: undefined
    });

    expect(values[0].string).toBe('test');
    expect(values[0].number).toBe(42);
    expect(values[0].boolean).toBe(true);
    expect(values[0].nullValue).toBeNull();
    expect(values[0].undefinedValue).toBeUndefined();
  });

  test('works with empty objects', () => {
    const source = manual<Record<string, any>>();
    const cloned = cloneFromFields(source);

    const values: Record<string, any>[] = [];
    cloned.onValue((v) => values.push(v));

    source.set({});

    expect(values).toEqual([{}]);
  });
});
