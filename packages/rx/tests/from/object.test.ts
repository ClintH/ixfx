import { describe, test, expect } from 'vitest';
import { object } from '../../src/from/object.js';

describe('rx/from/object', () => {
  test('creates reactive with initial value', () => {
    const initial = { name: 'test', value: 42 };
    const obj = object(initial);

    expect(obj.last()).toEqual(initial);
  });

  test('set updates the entire object', () => {
    const obj = object({ name: 'initial', count: 0 });
    const values: any[] = [];

    obj.onValue(v => values.push(v));

    obj.set({ name: 'updated', count: 10 });

    expect(values).toEqual([{ name: 'updated', count: 10 }]);
    expect(obj.last()).toEqual({ name: 'updated', count: 10 });
  });

  test('onDiff receives changes', () => {
    const obj = object({ name: 'bob', level: 2 });
    const diffs: any[] = [];

    obj.onDiff(v => diffs.push(v));

    obj.set({ name: 'mary', level: 3 });

    expect(diffs).toHaveLength(1);
    expect(diffs[0]).toEqual(expect.arrayContaining([
      expect.objectContaining({ path: 'name', previous: 'bob', value: 'mary' }),
      expect.objectContaining({ path: 'level', previous: 2, value: 3 })
    ]));
  });

  test('set with same value does not emit', () => {
    const obj = object({ value: 1 });
    const values: any[] = [];

    obj.onValue(v => values.push(v));

    obj.set({ value: 1 });

    expect(values).toHaveLength(0);
  });

  test('update merges partial changes', () => {
    const obj = object({ name: 'test', age: 25, city: 'NYC' });
    const values: any[] = [];

    obj.onValue(v => values.push(v));

    obj.update({ age: 26 });

    expect(values).toEqual([{ name: 'test', age: 26, city: 'NYC' }]);
    expect(obj.last()).toEqual({ name: 'test', age: 26, city: 'NYC' });
  });

  test('updateField changes specific field', () => {
    const obj = object({ name: 'test', nested: { value: 10 } });
    const values: any[] = [];

    obj.onValue(v => values.push(v));

    obj.updateField('nested.value', 20);

    expect(values).toHaveLength(1);
    expect(obj.last()).toEqual({ name: 'test', nested: { value: 20 } });
  });

  test('onField listens to specific field changes via update', () => {
    const obj = object({ name: 'test', age: 25 });
    const nameChanges: any[] = [];

    obj.onField('name', (change) => {
      nameChanges.push(change);
    });

    // onField triggers on update() and updateField(), not set()
    obj.update({ name: 'updated' });
    obj.update({ name: 'again' });

    expect(nameChanges).toHaveLength(2);
    expect(nameChanges[0]).toMatchObject({ fieldName: 'name', value: 'updated' });
    expect(nameChanges[1]).toMatchObject({ fieldName: 'name', value: 'again' });
  });

  test('onField supports wildcards', () => {
    const obj = object({ 
      user: { name: 'test' },
      data: { value: 10 }
    });
    const changes: any[] = [];

    obj.onField('*', (change) => {
      changes.push(change);
    });

    obj.updateField('user.name', 'updated');

    expect(changes.length).toBeGreaterThan(0);
  });

  test('dispose marks as disposed', () => {
    const obj = object({ value: 1 });

    expect(obj.isDisposed()).toBe(false);
    obj.dispose('test');
    expect(obj.isDisposed()).toBe(true);
  });

  test('works with nested objects', () => {
    const obj = object({
      level1: {
        level2: {
          value: 'deep'
        }
      }
    });
    const values: any[] = [];

    obj.onValue(v => values.push(v));

    obj.updateField('level1.level2.value', 'deeper');

    expect(obj.last()).toEqual({
      level1: {
        level2: {
          value: 'deeper'
        }
      }
    });
  });

  test('handles arrays in objects', () => {
    const obj = object({ items: [1, 2, 3] });

    obj.updateField('items', [1, 2, 3, 4]);

    expect(obj.last()?.items).toEqual([1, 2, 3, 4]);
  });

  test('creates reactive without initial value', () => {
    const obj = object<{ name: string; value: number }>(undefined);

    expect(obj.last()).toBeUndefined();

    const values: any[] = [];
    obj.onValue(v => values.push(v));

    obj.set({ name: 'test', value: 1 });

    expect(values).toEqual([{ name: 'test', value: 1 }]);
  });

  test('update without initial value sets entire object', () => {
    const obj = object<{ name: string }>(undefined);
    const values: any[] = [];

    obj.onValue(v => values.push(v));

    obj.update({ name: 'test' });

    expect(obj.last()).toEqual({ name: 'test' });
    expect(values).toEqual([{ name: 'test' }]);
  });

  test('field updates trigger onDiff', () => {
    const obj = object({ a: 1, b: 2 });
    const diffs: any[] = [];

    obj.onDiff(v => diffs.push(v));

    obj.updateField('a', 10);

    expect(diffs).toHaveLength(1);
    expect(diffs[0]).toContainEqual(expect.objectContaining({
      path: 'a',
      previous: 1,
      value: 10
    }));
  });

  test('multiple subscribers receive updates', () => {
    const obj = object({ value: 0 });
    const values1: any[] = [];
    const values2: any[] = [];

    obj.onValue(v => values1.push(v));
    obj.onValue(v => values2.push(v));

    obj.set({ value: 1 });
    obj.set({ value: 2 });

    expect(values1).toEqual([{ value: 1 }, { value: 2 }]);
    expect(values2).toEqual([{ value: 1 }, { value: 2 }]);
  });

  test('unsubscribe stops receiving updates', () => {
    const obj = object({ value: 0 });
    const values: any[] = [];

    const unsub = obj.onValue(v => values.push(v));

    obj.set({ value: 1 });
    unsub();
    obj.set({ value: 2 });

    expect(values).toEqual([{ value: 1 }]);
  });

  test('custom equality function', () => {
    // Use custom equality that ignores case for strings
    const obj = object({ name: 'Test' }, {
      eq: (a: any, b: any) => typeof a === 'string' && typeof b === 'string' 
        ? (a as string).toLowerCase() === (b as string).toLowerCase() 
        : a === b
    });
    const values: any[] = [];

    obj.onValue(v => values.push(v));

    obj.set({ name: 'TEST' }); // Same when ignoring case

    expect(values).toHaveLength(0);
  });
});