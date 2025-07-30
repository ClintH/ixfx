import * as Async from './async.js';
import * as Sync from './sync.js';
export * as Async from './async.js';
export * as Sync from './sync.js';
export * as Chains from './chain/index.js';

export { combineLatestToArray } from './chain/combine-latest-to-array.js';
export { combineLatestToObject } from './chain/combine-latest-to-object.js';

export * from './compare-values.js';
export * from './from-event.js';
export * from './guard.js';
export * from './types.js';

import { isAsyncIterable } from './guard.js';
//import * as Chains from './chain/index.js';
// import type { Interval } from '../flow/IntervalType.js';

import { toStringDefault } from '@ixfx/core';
import type { Interval } from '@ixfx/core';

//import type { GenFactoryNoInput } from './chain/Types.js';
import type { ForEachOptions, ToArrayOptions, IteratorControllerOptions, IteratorControllerState } from './types.js';

export * from './numbers-compute.js';

export function min<V>(it: AsyncIterable<V>, gt?: (a: V, b: V) => boolean): AsyncGenerator<V>;
export function min<V>(it: Iterable<V>, gt?: (a: V, b: V) => boolean): Generator<V>;


/**
 * Returns a stream of minimum values.
 * 
 * Streaming result: works with endless iterables.
 * 
 * ```js
 * min([
 *  {i:0,v:1},
 *  {i:1,v:9},
 *  {i:2,v:-2}
 * ], (a, b) => a.v > b.v);
 * // Yields: {i:2, v:1}, {i:2,v:-2}
 * ```
 * @param it Iterable
 * @param gt Should return _true_ if `a` is greater than `b`.
 * @returns Yields minimum values
 */
export function min<V>(it: AsyncIterable<V> | Iterable<V>, gt = (a: V, b: V) => a > b): AsyncGenerator<V> | Generator<V> {
  return isAsyncIterable(it) ? Async.min(it, gt) : Sync.min(it, gt);
}

export function max<V>(it: AsyncIterable<V>, gt?: (a: V, b: V) => boolean): AsyncGenerator<V>;
export function max<V>(it: Iterable<V>, gt?: (a: V, b: V) => boolean): Generator<V>;

/**
 * Returns the maximum value of an iterable as it changes.
 * Streaming result: works with endless iterables.
 * 
 * ```js
 * // Rank values by their 'v' field
 * const rank = (a,b) => a.v > b.v;
 * 
 * min([
 *  {i:0,v:1},
 *  {i:1,v:9},
 *  {i:2,v:-2}
 * ], rank);
 * // Yields: {i:0,v:1}, {i:1,v:9}
 * ```
 * @param it Iterable
 * @param gt Should return _true_ if `a` is greater than `b`.
 * @returns Iterable of maximum values
 */
export function max<V>(it: AsyncIterable<V> | Iterable<V>, gt = (a: V, b: V) => a > b): AsyncGenerator<V> | Generator<V> {
  return isAsyncIterable(it) ? Async.max(it, gt) : Sync.max(it, gt);
}

export function dropWhile<V>(it: AsyncIterable<V>, f: (v: V) => boolean): AsyncGenerator<V>;
export function dropWhile<V>(it: Iterable<V>, f: (v: V) => boolean): Generator<V>;

/**
 * Drops elements that do not meet the predicate `f`.
 * Streaming result: works with endless iterables.
 * 
 * ```js
 * dropWhile([1, 2, 3, 4], e => e < 3);
 * returns [3, 4]
 * ```
 * @param it
 * @param f
 */
export function dropWhile<V>(it: AsyncIterable<V> | Iterable<V>, f: (v: V) => boolean): AsyncGenerator<V> | Generator<V> {
  return isAsyncIterable(it) ? Async.dropWhile(it, f) : Sync.dropWhile(it, f);
}

export function until(it: AsyncIterable<any>, f: () => Promise<boolean> | Promise<undefined>): Promise<undefined>;
export function until(it: Iterable<any>, f: () => boolean | never): void;
export function until(it: Iterable<any>, f: () => Promise<boolean>): Promise<undefined>;

/**
* Loops over a generator until it finishes, calling `callback`.
* Useful if you don't care about the value generator produces, just the number of loops.
* 
* ```js
* until(count(5), () => {
* // do something 5 times
* });
* ```
* 
* If you want the value from the generator, use a `for of` loop as usual.
* If `callback` explicitly returns _false_, the generator is aborted.
* 
* This does not work for infinite generators, `callback` will never be called.
* @param it Generator to run
* @param callback Code to call for each iteration
*/
export function until(it: AsyncIterable<any> | Iterable<any>, callback: () => Promise<boolean> | never | boolean | Promise<undefined>): Promise<undefined> | undefined {
  if (isAsyncIterable(it)) {
    return Async.until(it, callback);
  } else {
    Sync.until(it, callback as (() => boolean));
  }
}


export function chunks<V>(it: Iterable<V>, size: number): Generator<V[]>;
export function chunks<V>(it: AsyncIterable<V>, size: number): AsyncGenerator<V[]>;

/**
 * Breaks an iterable into array chunks
 * 
 * Streaming: works with infinite iterables.
 * 
 * ```js
 * chunks([1,2,3,4,5,6,7,8,9,10], 3);
 * // Yields [[1, 2, 3], [4, 5, 6], [7, 8, 9], [10]]
 * ```
 * @param it
 * @param size
 */
export function chunks<V>(it: AsyncIterable<V> | Iterable<V>, size: number): Generator<V[]> | AsyncGenerator<V[]> {
  return isAsyncIterable(it) ? Async.chunks(it, size) : Sync.chunks(it, size);
}

export function filter<V>(it: AsyncIterable<V>, f: (v: V) => boolean | Promise<boolean>): AsyncGenerator<V>;
export function filter<V>(it: AsyncIterable<V>, f: (v: V) => boolean): Generator<V>;

/**
 * Filters an iterable, only yielding items which match `f`.
 *
 * ```js
 * filter([1, 2, 3, 4], e => e % 2 == 0);
 * returns [2, 4]
 * ```
 * 
 * When using async iterables, `f` can be async as well.
 * @param it
 * @param f
 */
export function filter<V>(it: AsyncIterable<V> | Iterable<V>, f: (v: V) => boolean | Promise<boolean>): AsyncGenerator<V> | Generator<V> {

  return isAsyncIterable(it) ? Async.filter(it, f) : Sync.filter(it, f as (v: V) => boolean);
}


export function fill<V>(it: AsyncIterable<V>, v: V): AsyncGenerator<V>;
export function fill<V>(it: Iterable<V>, v: V): Generator<V>;

/**
 * Yields `v` for each item within `it`.
 *
 * ```js
 * fill([1, 2, 3], 0);
 * // Yields: [0, 0, 0]
 * ```
 * 
 * This is like a `map` where we return a fixed value, ignoring the input.
 * @param it
 * @param v
 */
export function fill<V>(it: AsyncIterable<V> | Iterable<V>, v: V): AsyncGenerator<V> | Generator<V> {
  return isAsyncIterable(it) ? Async.fill(it, v) : Sync.fill(it, v);
}

export function concat<V>(...its: Iterable<V>[]): Generator<V>;
export function concat<V>(...its: AsyncIterable<V>[]): AsyncGenerator<V>;


/**
 * Return concatenation of iterators.
 * 
 * Non-streaming: If one of the input iterables is endless, the other ones won't
 * be processed.
 * @param its
 */
export function concat<V>(...its: Iterable<V>[] | AsyncIterable<V>[]): AsyncGenerator<V> | Generator<V> {
  return isAsyncIterable(its[ 0 ]) ? Async.concat(...its as AsyncIterable<V>[]) : Sync.concat(...its as Iterable<V>[]);
}

export function find<V>(it: V[] | Iterable<V>, f: (v: V) => boolean): V | undefined;
export function find<V>(it: AsyncIterable<V>, f: (v: V) => boolean | Promise<boolean>): Promise<V | undefined>;

/**
 * Returns first item from iterable `it` that matches predicate `f`
 * ```js
 * find([1, 2, 3, 4], e => e > 2);
 * // Yields: 3
 * ```
 * 
 * When using async iterables, `f` can be async as well.
 * @param it
 * @param f
 * @returns
 */
export function find<V>(it: V[] | Iterable<V> | AsyncIterable<V>, f: (v: V) => boolean | Promise<boolean>): Promise<V | undefined> | V | undefined {

  return isAsyncIterable(it) ? Async.find(it, f) : Sync.find(it, f as (v: V) => boolean);
}

/**
 * Execute function `f` for each item in iterable.
 * If `f` returns _false_, iteration stops.
 * ```js
 * forEach(iterable, v => {
 *  // do something with value
 * });
 * ```
 * 
 * When using an async iterable, `fn` can also be async.
 * @param it Iterable or array
 * @param fn Function to execute
 */
// eslint-disable-next-line @typescript-eslint/no-invalid-void-type
export function forEach<T>(it: T[] | AsyncIterable<T> | Iterable<T>, fn: (v: T | undefined) => boolean | Promise<boolean> | void | Promise<void>, options: Partial<ForEachOptions> = {}) {
  if (isAsyncIterable(it)) {
    return Async.forEach(it, fn, options);
  } else {
    Sync.forEach(it, fn as (v: T) => boolean);
  }
}

export function map<V, X>(it: AsyncIterable<V>, f: (v: V) => Promise<X> | X): Generator<X>;
export function map<V, X>(it: V[] | Iterable<V>, f: (v: V) => X): Generator<X>;

/**
 * Maps an iterable through function `f`
 * ```js
 * // For every input value, multiply it by itself
 * map([1, 2, 3], e => e*e)
 * // Yields: 1, 4, 9
 * ```
 * 
 * It can also be used to transform types:
 * ```js
 * map([1, 2, 3], e => { value: e });
 * // Yields: { value: 1 }, { value: 2 }, { value: 3 }
 * ```
 * @param it
 * @param f
 */
export function map<V, X>(it: V[] | AsyncIterable<V> | Iterable<V>, f: (v: V) => X | Promise<X>) {
  return isAsyncIterable(it) ? Async.map(it, f) : Sync.map(it, f);
}

export function fromArray<V>(array: V[], interval: Interval): AsyncGenerator<V>;
export function fromArray<V>(array: V[]): Generator<V>;

/**
 * Yield values from `array`, one at a time.
 * Use `interval` to add time between each item.
 * The first item is yielded without delay.
 * 
 * @param array Array of values
 * @param interval Interval (defaults: 1ms)
 */
export function fromArray<V>(array: V[], interval?: Interval): AsyncGenerator<V> | Generator<V> {
  return interval === undefined ? Sync.fromArray(array) : Async.fromArray(array, interval);
}

export function flatten<V>(it: AsyncIterable<V[] | V>): AsyncIterable<V>;
export function flatten<V>(it: Iterable<V[] | V> | V[]): Iterable<V>;

/**
 * Returns a 'flattened' copy of array, un-nesting arrays one level.
 * Streaming: works with unlimited iterables.
 * ```js
 * flatten([1, [2, 3], [[4]]]);
 * // Yields: [1, 2, 3, [4]];
 * ```
 * @param it
 */
export function flatten<V>(it: V[] | AsyncIterable<V | V[]> | Iterable<V | V[]>): AsyncIterable<V> | Iterable<V> {
  return isAsyncIterable(it) ? Async.flatten(it) : Sync.flatten(it);
}

export function some<V>(it: AsyncIterable<V>, f: (v: V) => boolean | Promise<boolean>): Promise<boolean>
export function some<V>(it: Iterable<V> | V[], f: (v: V) => boolean): boolean

/**
 * Returns true the first time `f` returns true. Useful for spotting any occurrence of
 * data, and exiting quickly
 * ```js
 * some([1, 2, 3, 4], e => e % 3 === 0);
 * // Yields: true
 * ```
 * @param it Iterable
 * @param f Filter function
 * @returns
 */
export function some<V>(it: AsyncIterable<V> | Iterable<V>, f: (v: V) => boolean | Promise<boolean>): boolean | Promise<boolean> {
  return isAsyncIterable(it) ? Async.some(it, f) : Sync.some(it, f as (v: V) => boolean);
}

export function last<V>(it: AsyncIterable<V>): Promise<V | undefined>
export function last<V>(it: Iterable<V>): V

/**
 * Returns the last item of an iterable, or _undefined_ if it yields no results.
 * @param it 
 * @returns 
 */
export function last<V>(it: AsyncIterable<V> | Iterable<V>): undefined | V | Promise<V | undefined> {
  return isAsyncIterable(it) ? Async.last(it) : Sync.last(it);
}

export function reduce<V>(it: AsyncIterable<V>, f: (accumulator: V, current: V) => V, start: V): Promise<V>;
export function reduce<V>(it: Iterable<V> | V[], f: (accumulator: V, current: V) => V, start: V): V;

/**
 * Reduce for iterables
 * ```js
 * reduce([1, 2, 3], (acc, cur) => acc + cur, 0);
 * // Yields: 6
 * ```
 * @param it Iterable
 * @param f Function
 * @param start Start value
 * @returns
 */
export function reduce<V>(it: AsyncIterable<V> | Iterable<V> | V[], f: (accumulator: V, current: V) => V, start: V): Promise<V> | V {
  return isAsyncIterable(it) ? Async.reduce(it, f, start) : Sync.reduce(it, f, start);
}

export function slice<V>(it: AsyncIterable<V>, start?: number, end?: number): AsyncGenerator<V>;
export function slice<V>(it: Iterable<V> | V[], start?: number, end?: number): Generator<V>;
/**
 * Returns a section from an iterable.
 * 
 * 'end' is the end index, not the number of items.
 * 
 * ```js
 * // Return five items from step 10
 * slice(it, 10, 15);
 * ```
 * @param it Iterable
 * @param start Start step
 * @param end Exclusive end step (or until completion)
 */
export function slice<V>(
  it: Iterable<V> | AsyncIterable<V> | V[],
  start = 0,
  end = Number.POSITIVE_INFINITY
) {
  return isAsyncIterable(it) ? Async.slice(it, start, end) : Sync.slice(it, start, end);
}

export function unique<V>(iterable: Iterable<V> | Iterable<V>[]): Generator<V>;
export function unique<V>(iterable: AsyncIterable<V> | AsyncIterable<V>[]): AsyncGenerator<V>;


/**
 * Returns unique items from an iterable or
 * array of iterables.
 *
 * ```js
 * const data = [ 'apples', 'oranges' ]
 * const data2 = [ 'oranges', 'pears' ]
 * const unique = [...unique([data,data2]];
 * // Yields: [ 'apples', 'oranges', 'pears' ]
 * ```
 *
 * Uses object reference to compare values.
 * Use {@link uniqueByValue} if this doesn't suffice.
 * @param iterable Iterable, or array of iterables
 */
export function unique<V>(iterable: V[] | AsyncIterable<V> | Iterable<V> | Iterable<V>[] | AsyncIterable<V>[]): Generator<V> | AsyncGenerator<V> {
  if (Array.isArray(iterable)) {
    if (iterable.length === 0) return Sync.fromArray([]);
    return isAsyncIterable(iterable[ 0 ]) ? Async.unique(iterable as AsyncIterable<V>[]) : Sync.unique(iterable as Iterable<V>[]);
  } else if (isAsyncIterable(iterable)) {
    return Async.unique(iterable);
  } else {
    return Sync.unique(iterable);
  }
}

export function uniqueByValue<T>(input: Iterable<T> | T[], toString: (v: T) => string, seen?: Set<string>): Generator<T>;
export function uniqueByValue<T>(input: AsyncIterable<T>, toString: (v: T) => string, seen?: Set<string>): AsyncGenerator<T>;

/**
 * Filters the `input` iterable, only yielding unique values. Use {@link unique} to compare
 * by object reference instead.
 * 
 * Streaming: Works with unbounded iterables.
 * 
 * ```js
 * const d = ['a', 'b', 'c', 'b', 'd' ];
 * for (const v of uniqueByValue(d)) {
 *  // Yields: 'a', 'b', 'c', 'd'
 * // (extra 'b' is skipped)
 * }
 * ```
 * 
 * By default, JSON.stringify is used to create a string representing value. These are added
 * to a Set of strings, which is how we keep track of uniqueness. If the value is already a string it is used as-is.
 * 
 * This allows you to have custom logic for what determines uniqueness. Eg, using a single field
 * of an object as an identifier:
 * 
 * ```js
 * const people = [
 *  { name: `Mary`, size: 20 }, { name: `Abdul`, size: 19 }, { name: `Mary`, size: 5 }
 * ]
 * for (const v of uniqueByValue(d, v=>v.name)) {
 *  // Yields: { name: `Mary`, size: 20 }, { name: `Abdul`, size: 19 }
 *  // Second 'Mary' is skipped because name is the same, even though size field is different.
 * }
 * ```
 * 
 * If you want to keep track of the set of keys, or prime it with some existing data, provide a Set instance:
 * ```js
 * const unique = new Set();
 * unique.add(`b`);
 * const d = [`a`, `b`, `c`];
 * for (const v of uniqueByValue(d, toStringDefault, unique)) {
 *  // Yields: `a`, `c`
 *  // `b` is skipped because it was already in set
 * }
 * // After completion, `unique` contains `a`, `b` and `c`.
 * ```
 * 
 * Creating your own Set is useful for tracking unique values across several calls to `uniqueByValue`.
 * @param input 
 * @param seen 
 * @param toString 
 */
export function* uniqueByValue<T>(input: AsyncIterable<T> | Iterable<T> | T[], toString: (v: T) => string = toStringDefault, seen: Set<string> = new Set<string>()): Generator<T> | AsyncGenerator<T> {
  yield* isAsyncIterable(input) ? Async.uniqueByValue(input, toString, seen) : Sync.uniqueByValue(input, toString, seen);
}

export function toArray<V>(it: AsyncIterable<V>, options?: Partial<ToArrayOptions>): Promise<V[]>;
export function toArray<V>(it: Iterable<V>, options?: Partial<ToArrayOptions>): V[];

/**
 * Returns an array of values from an iterator.
 *
 * ```js
 * const data = await toArray(adsrIterable(opts, 10));
 * ```
 *
 * Note: If the iterator is infinite, be sure to provide a `count` or the function
 * will never return.
 *
 * @param it Asynchronous iterable
 * @param count Number of items to return, by default all.
 * @returns
 */

export function toArray<V>(it: Iterable<V> | AsyncIterable<V>, options: Partial<ToArrayOptions> = {}): V[] | Promise<V[]> {
  return isAsyncIterable(it) ? Async.toArray(it, options) : Sync.toArray(it, options);
}

export function every<V>(it: Iterable<V> | V[], f: (v: V) => boolean): boolean
export function every<V>(it: AsyncIterable<V>, f: (v: V) => boolean | Promise<boolean>): Promise<boolean>

/**
 * Returns _true_ if `f` returns _true_ for
 * every item in iterable.
 * 
 * Streaming: If an infinite iterable is used, function will never return value.
 * @param it
 * @param f
 * @returns
 */
export function every<V>(it: Iterable<V> | V[] | AsyncIterable<V>, f: (v: V) => boolean | Promise<boolean>): Promise<boolean> | boolean {
  return isAsyncIterable(it) ? Async.every(it, f) : Sync.every(it, f as (v: V) => boolean);
}

export function equals<V>(it1: AsyncIterable<V>, it2: AsyncIterable<V>, equality?: (a: V, b: V) => boolean): Promise<boolean>
export function equals<V>(it1: IterableIterator<V>, it2: IterableIterator<V>, equality?: (a: V, b: V) => boolean): boolean

/**
 * Returns _true_ if items in two iterables are equal, as
 * determined by the `equality` function.
 * Order matters. It compares items at the same 'step' of each iterable.
 * @param it1
 * @param it2
 * @param equality
 * @returns
 */
export function equals<V>(it1: AsyncIterable<V> | IterableIterator<V>, it2: AsyncIterable<V> | IterableIterator<V>, equality?: (a: V, b: V) => boolean) {
  const as = isAsyncIterable(it1) && isAsyncIterable(it2);
  return as ? Async.equals(it1, it2, equality) : Sync.equals(it1 as IterableIterator<V>, it2 as IterableIterator<V>, equality);
}

export function zip<V>(...its: readonly AsyncIterable<V>[]): Generator<V[]>;
export function zip<V>(...its: readonly Iterable<V>[]): Generator<V>;


/**
 * Combine same-positioned items from several iterables
 * ```js
 * zip( [1, 2, 3], [4, 5, 6], [7, 8, 9] );
 * Yields: [ [1, 4, 7], [2, 5, 8], [3, 6, 9] ]
 * ```
 * @param its
 * @returns
 */
export function zip<V>(...its: readonly AsyncIterable<V>[] | readonly Iterable<V>[]) {
  if (its.length === 0) return Sync.fromArray([]);
  return isAsyncIterable(its[ 0 ]) ? Async.zip(...its as readonly AsyncIterable<V>[]) : Sync.zip(...its as readonly Iterable<V>[]);
}

export function fromIterable<V>(iterable: Iterable<V>): Generator<V>
export function fromIterable<V>(iterable: AsyncIterable<V> | Iterable<V>, interval: Interval): AsyncGenerator<V>

/**
 * Yield values from `iterable`, one at a time.
 * Use `interval` to add time between each item.
 * The first item is yielded without delay.
 * @param iterable Iterable or AsyncIterable
 * @param [interval=1] Interval to wait between yield 
 */
export function fromIterable<V>(iterable: Iterable<V> | AsyncIterable<V>, interval?: Interval): AsyncGenerator<V> | Generator<V> {
  if (isAsyncIterable(iterable) || interval !== undefined) return Async.fromIterable(iterable, interval);
  return Sync.fromIterable(iterable);
}

/**
 * Access `callback` as an iterable:
 * ```js
 * const fn = () => Math.random();
 * for (const v of fromFunction(fn)) {
 *  // Generate infinite random numbers
 * }
 * ```
 * 
 * Use {@link fromFunctionAwaited} to await `callback`.
 * @param callback Function that generates a value
 */
export function* fromFunction<T>(callback: () => T) {
  while (true) {
    const v = callback();
    yield v;
  }
}

/**
 * Access awaited `callback` as an iterable:
 * ```js
 * const fn = () => Math.random();
 * for await (const v of fromFunctionAwaited(fn)) {
 *  // Generate infinite random numbers
 * }
 * ```
 * 
 * `callback` can be async, result is awaited.
 * This requires the use of `for await`.
 * Use {@link fromFunction} otherwise;
 * @param callback 
 */
export async function* fromFunctionAwaited<T>(callback: () => Promise<T> | T) {
  while (true) {
    const v = await callback();
    yield v;
  }
}


/**
 * Calls `callback` whenever the generator produces a value.
 * 
 * When using `asCallback`, call it with `await` to let generator 
 * run its course before continuing:
 * ```js
 * await asCallback(tick({ interval:1000, loops:5 }), x => {
 *  // Gets called 5 times, with 1000ms interval
 * });
 * console.log(`Hi`); // Prints after 5 seconds
 * ```
 * 
 * Or if you skip the `await`, code continues and callback will still run:
 * ```js
 * asCallback(tick({ interval: 1000, loops: 5}), x => {
 *  // Gets called 5 times, with 1000ms interval
 * });
 * console.log(`Hi`); // Prints immediately
 * ```
 * @param input 
 * @param callback 
 */
export function asCallback<V>(input: AsyncIterable<V> | Iterable<V>, callback: (v: V) => unknown, onDone?: () => void) {
  if (isAsyncIterable(input)) {
    return Async.asCallback(input, callback);
  } else {
    Sync.asCallback(input, callback); return;
  }
}

