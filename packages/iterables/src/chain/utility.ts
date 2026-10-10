import type { Gen, GenFactoryNoInput, GenOrData } from "./types.js";
import { sleep } from "@ixfx/core";
import * as Async from "../async.js";
import { isAsyncIterable } from "../index.js";

export function isGenFactoryNoInput<Out>(c: any): c is GenFactoryNoInput<Out> {
  // A GenFactoryNoInput is a function (an async generator function) with
  // metadata attached, so accept both functions and objects.
  if (c === null)
    return false;
  if (typeof c !== `object` && typeof c !== `function`)
    return false;
  if (!(`_type` in c))
    return false;
  if (c._type === `GenFactoryNoInput`)
    return true;
  return false;
}

/**
 * Wrap the primitive value as generator
 * @param value
 */
function* primitiveToGenerator(value: number | boolean | string) {
  yield value;
}

/**
 * Wrap the primitive value as an async generator
 * @param value
 */
async function* primitiveToAsyncGenerator(value: number | boolean | string) {
  yield value;
  await sleep(1);
}

/**
 * Resolve the array, data or function to a Generator
 * @param input
 * @returns
 */
export function resolveToGen<V>(input: GenOrData<V> | GenFactoryNoInput<V>): Gen<V> {
  if (Array.isArray(input)) {
    const a = input.values();
    (a as any)._name = `arrayInput`;
    return a;
  } else if (typeof input === `number` || typeof input === `boolean` || typeof input === `string`) {
    // Assumes V is primitive
    return primitiveToGenerator(input) as Gen<V>;
  } else if (typeof input === `function`) {
    return input();
  }
  return input;
}

/**
 * Resolve the data, primitive or function to an AsyncGenerator
 * @param input
 * @returns
 */
export function resolveToAsyncGen<V>(input: GenOrData<V> | GenFactoryNoInput<V> | undefined): AsyncGenerator<V> | undefined {
  if (input === undefined)
    return;
  if (Array.isArray(input)) {
    return Async.fromArray(input);
  } else if (typeof input === `number` || typeof input === `boolean` || typeof input === `string`) {
    // Assumes V is primitive
    return primitiveToAsyncGenerator(input) as AsyncGenerator<V>;
  } else if (typeof input === `function`) {
    return input();
  } else if (isAsyncIterable(input)) {
    return input;
  }
  return Async.fromIterable(input);
}
