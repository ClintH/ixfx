/* eslint-disable unicorn/no-array-callback-reference */
/* eslint-disable unicorn/no-array-for-each */
/* eslint-disable unicorn/no-array-method-this-argument */

import * as Async from '../iterables/IterableAsync.js';
import * as Sync from '../iterables/IterableSync.js';
export * as Async from '../iterables/IterableAsync.js';
export * as Sync from '../iterables/IterableSync.js';
export * as Chains from './chain/index.js';
export * from './Iterable.js';
import { isAsyncIterable } from '../iterables/Iterable.js';
import * as Chains from './chain/index.js';
import type { Interval } from '../flow/IntervalType.js';

import { toStringDefault } from '../Util.js';
import type { GenFactoryNoInput } from './chain/Types.js';

export function combineLatestToArray(sources: Array<Chains.GenOrData<any> | GenFactoryNoInput<any>>, options: Partial<Chains.CombineLatestOptions> = {}): AsyncGenerator<Array<any>> {
  return Chains.combineLatestToArray(sources, options);
}

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

export function until(it: AsyncIterable<any> | Iterable<any>, callback: () => Promise<boolean> | never | boolean | Promise<undefined>): Promise<undefined> | undefined {
  if (isAsyncIterable(it)) {
    return Async.until(it, callback);
  } else {
    // @ts-expect-error
    Sync.until(it, callback);
  }
}


export function chunks<V>(it: Iterable<V>, size: number): Generator<Array<V>>;
export function chunks<V>(it: AsyncIterable<V>, size: number): AsyncGenerator<Array<V>>;

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
export function chunks<V>(it: AsyncIterable<V> | Iterable<V>, size: number): Generator<Array<V>> | AsyncGenerator<Array<V>> {
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
  // eslint-disable-next-line unicorn/no-array-method-this-argument, unicorn/no-array-callback-reference
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

export function concat<V>(...its: Array<Iterable<V>>): Generator<V>;
export function concat<V>(...its: Array<AsyncIterable<V>>): AsyncGenerator<V>;


/**
 * Return concatenation of iterators.
 * 
 * Non-streaming: If one of the input iterables is endless, the other ones won't
 * be processed.
 * @param its
 */
export function concat<V>(...its: Array<Iterable<V>> | Array<AsyncIterable<V>>): AsyncGenerator<V> | Generator<V> {
  return isAsyncIterable(its[ 0 ]) ? Async.concat(...its as Array<AsyncIterable<V>>) : Sync.concat(...its as Array<Iterable<V>>);
}

export function find<V>(it: Array<V> | Iterable<V>, f: (v: V) => boolean): V | undefined;
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
export function find<V>(it: Array<V> | Iterable<V> | AsyncIterable<V>, f: (v: V) => boolean | Promise<boolean>): Promise<V | undefined> | V | undefined {
  // eslint-disable-next-line unicorn/no-array-method-this-argument, unicorn/no-array-callback-reference
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
 * When using an async iterable, `f` can also be async.
 * @param it
 * @param f
 */
export function forEach<V>(it: Array<V> | AsyncIterable<V> | Iterable<V>, f: (v: V) => boolean | Promise<boolean>) {
  if (isAsyncIterable(it)) {
    return Async.forEach(it, f);
  } else {
    Sync.forEach(it, f as (v: V) => boolean);
  }
}

export function map<V, X>(it: AsyncIterable<V>, f: (v: V) => Promise<X> | X): Generator<X>;
export function map<V, X>(it: Array<V> | Iterable<V>, f: (v: V) => X): Generator<X>;

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
export function map<V, X>(it: Array<V> | AsyncIterable<V> | Iterable<V>, f: (v: V) => X | Promise<X>) {
  return isAsyncIterable(it) ? Async.map(it, f) : Sync.map(it, f);
}

export function fromArray<V>(array: Array<V>, interval: Interval): AsyncGenerator<V>;
export function fromArray<V>(array: Array<V>): Generator<V>;

/**
 * Yield values from `array`, one at a time.
 * Use `interval` to add time between each item.
 * The first item is yielded without delay.
 * 
 * @param array Array of values
 * @param interval Interval (defaults: 1ms)
 */
export function fromArray<V>(array: Array<V>, interval?: Interval): AsyncGenerator<V> | Generator<V> {
  return interval === undefined ? Sync.fromArray(array) : Async.fromArray(array, interval);
}

export function flatten<V>(it: AsyncIterable<Array<V> | V>): AsyncIterable<V>;
export function flatten<V>(it: Iterable<Array<V> | V> | Array<V>): Iterable<V>;

/**
 * Returns a 'flattened' copy of array, un-nesting arrays one level.
 * Streaming: works with unlimited iterables.
 * ```js
 * flatten([1, [2, 3], [[4]]]);
 * // Yields: [1, 2, 3, [4]];
 * ```
 * @param it
 */
export function flatten<V>(it: Array<V> | AsyncIterable<V | Array<V>> | Iterable<V | Array<V>>): AsyncIterable<V> | Iterable<V> {
  return isAsyncIterable(it) ? Async.flatten(it) : Sync.flatten(it);
}

export function some<V>(it: AsyncIterable<V>, f: (v: V) => boolean | Promise<boolean>): Promise<boolean>
export function some<V>(it: Iterable<V> | Array<V>, f: (v: V) => boolean): boolean

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

export function reduce<V>(it: AsyncIterable<V>, f: (accumulator: V, current: V) => V, start: V): Promise<V>;
export function reduce<V>(it: Iterable<V> | Array<V>, f: (accumulator: V, current: V) => V, start: V): V;

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
export function reduce<V>(it: AsyncIterable<V> | Iterable<V> | Array<V>, f: (accumulator: V, current: V) => V, start: V): Promise<V> | V {
  return isAsyncIterable(it) ? Async.reduce(it, f, start) : Sync.reduce(it, f, start);
}

export function slice<V>(it: AsyncIterable<V>, start?: number, end?: number): AsyncGenerator<V>;
export function slice<V>(it: Iterable<V> | Array<V>, start?: number, end?: number): Generator<V>;
/**
 * Returns a section from an iterable
 * @param it Iterable
 * @param start Start index
 * @param end Exclusive end index (or until completion)
 */
export function slice<V>(
  it: Iterable<V> | AsyncIterable<V> | Array<V>,
  start = 0,
  end = Number.POSITIVE_INFINITY
) {
  return isAsyncIterable(it) ? Async.slice(it, start, end) : Sync.slice(it, end);
}

export function unique<V>(iterable: Iterable<V> | Array<Iterable<V>>): Generator<V>;
export function unique<V>(iterable: AsyncIterable<V> | Array<AsyncIterable<V>>): AsyncGenerator<V>;


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
export function unique<V>(iterable: Array<V> | AsyncIterable<V> | Iterable<V> | Array<Iterable<V>> | Array<AsyncIterable<V>>): Generator<V> | AsyncGenerator<V> {
  if (Array.isArray(iterable)) {
    if (iterable.length === 0) return Sync.fromArray([]);
    return isAsyncIterable(iterable[ 0 ]) ? Async.unique(iterable as Array<AsyncIterable<V>>) : Sync.unique(iterable as Array<Iterable<V>>);
  } else if (isAsyncIterable(iterable)) {
    return Async.unique(iterable);
  } else {
    return Sync.unique(iterable);
  }
}

export function uniqueByValue<T>(input: Iterable<T> | Array<T>, toString: (v: T) => string, seen?: Set<string>): Generator<T>;
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
export function* uniqueByValue<T>(input: AsyncIterable<T> | Iterable<T> | Array<T>, toString: (v: T) => string = toStringDefault, seen: Set<string> = new Set<string>()): Generator<T> | AsyncGenerator<T> {
  return isAsyncIterable(input) ? Async.uniqueByValue(input, toString, seen) : Sync.uniqueByValue(input, toString, seen);
}

export function toArray<V>(it: AsyncIterable<V>, count?: number): Promise<Array<V>>;
export function toArray<V>(it: Iterable<V>, count?: number): Array<V>;

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
//eslint-disable-next-line func-style
export function toArray<V>(it: Iterable<V> | AsyncIterable<V>, count = Number.POSITIVE_INFINITY): Array<V> | Promise<Array<V>> {
  return isAsyncIterable(it) ? Async.toArray(it, count) : Sync.toArray(it, count);
}

export function every<V>(it: Iterable<V> | Array<V>, f: (v: V) => boolean): boolean
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
export function every<V>(it: Iterable<V> | Array<V> | AsyncIterable<V>, f: (v: V) => boolean | Promise<boolean>): Promise<boolean> | boolean {
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

export function zip<V>(...its: ReadonlyArray<AsyncIterable<V>>): Generator<Array<V>>;
export function zip<V>(...its: ReadonlyArray<Iterable<V>>): Generator<V>;


/**
 * Combine same-positioned items from several iterables
 * ```js
 * zip( [1, 2, 3], [4, 5, 6], [7, 8, 9] );
 * Yields: [ [1, 4, 7], [2, 5, 8], [3, 6, 9] ]
 * ```
 * @param its
 * @returns
 */
export function zip<V>(...its: ReadonlyArray<AsyncIterable<V>> | ReadonlyArray<Iterable<V>>) {
  if (its.length === 0) return Sync.fromArray([]);
  return isAsyncIterable(its[ 0 ]) ? Async.zip(...its as ReadonlyArray<AsyncIterable<V>>) : Sync.zip(...its as ReadonlyArray<Iterable<V>>);
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
