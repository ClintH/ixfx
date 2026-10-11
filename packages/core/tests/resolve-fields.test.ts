import { expect, it } from 'vitest';
import { resolveFields, resolveFieldsSync } from '../src/resolve-fields.js';

it(`resolveFieldsSync`, () => {
  // Plain values pass through
  expect(resolveFieldsSync({ a: 1, b: `hello`, c: true })).toEqual({ a: 1, b: `hello`, c: true });

  // Functions are invoked
  expect(resolveFieldsSync({ a: () => 10 })).toEqual({ a: 10 });

  // Generators yield their next value
  const gen = (function* () {
    yield 1;
    yield 2;
  })();
  expect(resolveFieldsSync({ v: gen })).toEqual({ v: 1 });
  expect(resolveFieldsSync({ v: gen })).toEqual({ v: 2 });
});

it(`resolveFields`, async () => {
  // Mix of plain values, functions, promises and generators
  const obj = {
    plain: 5,
    fn: () => `hi`,
    prom: Promise.resolve(42),
    gen: (function* () {
      yield `first`;
    })(),
  };
  expect(await resolveFields(obj)).toEqual({
    plain: 5,
    fn: `hi`,
    prom: 42,
    gen: `first`,
  });

  // Async functions work
  expect(await resolveFields({ a: async () => `async!` })).toEqual({ a: `async!` });

  // Empty object
  expect(await resolveFields({})).toEqual({});
});
