import { test, expect, vi } from 'vitest';
import { mutable } from '../src/set/index.js';
import { sleep } from '@ixfx/core';

test(`mutableValueSet`, () => {
  const barry = { name: `Barry`, city: `London` };
  const barryOther = { name: `Barry`, city: `Manchester` };
  const barryCase = { name: `BARRY`, city: `London` };
  const sally = { name: `Sally`, city: `Bristol` };
  const sallyOther = { name: `Sally`, city: `Manchester` };
  const sallyMoreProperties = { name: `Sally`, city: `Bristol`, age: 27 };

  const people = [
    { name: `Barry`, city: `London` },
    { name: `Sally`, city: `Bristol` }
  ];

  type Person = { readonly name: string, readonly city: string }

  // Test default JSON
  const set = mutable();
  set.add(...people);
  expect(set.has(barry)).toBe(true);
  expect(set.has(sally)).toBe(true);
  expect(set.has(barryOther)).toBe(false);
  expect(set.has(barryCase)).toBe(false);
  expect(set.has(sallyOther)).toBe(false);
  expect(set.has(sallyMoreProperties)).toBe(false);
  expect(set.toArray()).toEqual(people);

  expect(set.delete(barry)).toBe(true);
  expect(set.delete(sallyMoreProperties)).toBe(false);

  // Test custom key generator
  const set2 = mutable<Person>(item => (item.name.toLocaleUpperCase() + `-` + item.city.toLocaleUpperCase()));
  set2.add(...people);
  expect(set2.has(barry)).toBe(true);
  expect(set2.has(sally)).toBe(true);
  expect(set2.has(barryOther)).toBe(false);
  expect(set2.has(barryCase)).toBe(true); // <-- different than JSON case
  expect(set2.has(sallyOther)).toBe(false);
  expect(set2.has(sallyMoreProperties)).toBe(true); // <-- different than JSON case
  expect(set2.toArray()).toEqual(people);

  expect(set2.delete(barry)).toBe(true);
  expect(set2.delete(sallyMoreProperties)).toBe(true);
});

test('mutableSet add event', () => {
  // Test events
  const set = mutable<string>();
  const addFunction = vi.fn();

  set.addEventListener(`add`, addFunction);
  set.add(`a`, `b`, `c`, `d`, `e`, `f`);
  expect(addFunction).toBeCalledTimes(6);
});

test('mutableSet delete event', () => {
  const set = mutable<string>();
  set.add(`a`, `b`, `c`, `d`, `e`, `f`);

  const deleteFn = vi.fn();

  set.addEventListener(`delete`, deleteFn);

  expect(set.delete(`a`)).toBe(true);
  expect(set.delete(`b`)).toBe(true);
  expect(deleteFn).toBeCalledTimes(2);
});

test('mutableSet clear event', async () => {
  const set = mutable<string>();
  const callbackFunction = vi.fn();
  set.addEventListener(`clear`, callbackFunction);
  set.add(`a`, `b`, `c`, `d`, `e`, `f`);
  set.clear();
  await sleep(100);
  expect(callbackFunction).toBeCalledTimes(1);
});
