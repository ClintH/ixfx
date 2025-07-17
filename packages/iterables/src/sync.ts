import { type ToString, toStringDefault } from '@ixfx/core';
import { type IsEqual, intervalToMs } from '@ixfx/core';
import { isIterable } from './guard.js';
//import { intervalToMs } from '../flow/IntervalType.js';
import type { ToArrayOptions } from './types.js';
export { slice } from './sync/slice.js';
export { reduce } from './sync/reduce.js';

export function* uniqueByValue<T>(input: Iterable<T>, toString: ToString<T> = toStringDefault, seen: Set<string> = new Set<string>()): Generator<T> {
  for (const v of input) {
    const key = toString(v);
    if (seen.has(key)) continue;
    seen.add(key);
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
export function asCallback<V>(input: Iterable<V>, callback: (v: V) => unknown, onDone?: () => void) {
  for (const value of input) {
    callback(value);
  }
  if (onDone) onDone();
}

/**
 * Returns a function that yields a value from a generator.
 * ```js
 * const spring = yieldNumber(Oscillators.spring());
 *
 * spring(); // latest value
 * ```
 *
 * Instead of:
 * ```js
 * const spring = Oscillators.spring();
 *
 * spring.next().value
 * ```
 *
 * A `defaultValue` can be provided if the source generator returns undefined:
 * ```js
 * const spring = yieldNumber(Oscillators.spring(), 0);
 * spring(); // Returns 0 if the generator returns undefined
 * ```
 * @param generator
 * @param defaultValue
 * @returns
 */
export function yieldNumber(
  generator: Generator<number>,
  defaultValue?: number
) {

  return (): number | undefined => {
    const v: number | undefined = generator.next().value as number | undefined;
    if (v === undefined) return defaultValue;
    return v;
  };
}

/**
 * Return first value from an iterable, or _undefined_ if
 * no values are generated
 * @param it
 * @returns
 */
export function first<V>(it: Iterable<V>): V | undefined {
  for (const value of it) {
    return value;
  }
}

/**
 * Returns last value from an iterable, or _undefined_
 * if no values are generated
 * @param it
 */
export function last<V>(it: Iterable<V>): V | undefined {
  let returnValue: V | undefined;
  for (const value of it) {
    returnValue = value;
  }
  return returnValue;
}

/**
 * Yields chunks of the iterable `it` such that the end of a chunk is the
 * start of the next chunk.
 *
 * Eg, with the input [1,2,3,4,5] and a size of 2, we would get back
 * [1,2], [2,3], [3,4], [4,5].
 *
 *
 * @param it
 * @param size
 * @returns
 */
export function* chunksOverlapping<V>(it: Iterable<V>, size: number) {
  if (size <= 1) throw new Error(`Size should be at least 2`);

  //eslint-disable-next-line functional/no-let
  let buffer: V[] = [];

  for (const v of it) {
    //eslint-disable-next-line functional/immutable-data
    buffer.push(v);
    if (buffer.length === size) {
      yield buffer;
      //eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      buffer = [ buffer.at(-1)! ];
    }
  }
  if (buffer.length <= 1) return;

  if (buffer.length > 0) yield buffer;
}


export function* chunks<V>(it: Iterable<V>, size: number) {
  //eslint-disable-next-line functional/no-let
  let buffer: V[] = [];

  for (const v of it) {
    //eslint-disable-next-line functional/immutable-data
    buffer.push(v);
    if (buffer.length === size) {
      yield buffer;
      buffer = [];
    }
  }
  if (buffer.length > 0) yield buffer;
}

export function* concat<V>(...its: readonly Iterable<V>[]) {
  for (const it of its) yield* it;
}

export function* dropWhile<V>(
  it: Iterable<V>,
  f: (v: V) => boolean
) {
  for (const v of it) {
    if (!f(v)) {
      yield v;
    }
  }
}

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
* @param it Generator to run
* @param callback Code to call for each iteration
*/
// eslint-disable-next-line @typescript-eslint/no-invalid-void-type
export const until = (it: Iterable<any>, callback: () => (void | boolean | never)) => {
  for (const _ of it) {
    const value = callback();
    if (typeof value === `boolean` && !value) break;
  }
}

export const next = <T>(it: Generator<T>) => {
  return () => {
    const r = it.next();
    if (r.done) return;
    return r.value;
  }
}

/**
 * Returns true if items in two iterables are equal, as
 * determined by the `equality` function.
 * @param it1
 * @param it2
 * @param equality
 * @returns
 */
export function equals<V>(
  it1: IterableIterator<V>,
  it2: IterableIterator<V>,
  equality?: IsEqual<V>
) {
  //it1 = it1[Symbol.iterator]();
  //it2 = it2[Symbol.iterator]();

  while (true) {
    const index1 = it1.next(),
      index2 = it2.next();
    if (equality !== undefined) {
      if (!equality(index1.value, index2.value)) return false;
    } else if (index1.value !== index2.value) return false;
    if (index1.done ?? index2.done) return index1.done && index2.done;
  }
}

export function every<V>(it: Iterable<V>, f: (v: V) => boolean) {
  for (const v of it) {
    const result = f(v);
    if (!result) return false;
  }
  return true;
}


export function* fill<V>(it: Iterable<V>, v: V) {
  // https://surma.github.io/underdash/


  for (const _ of it) yield v;
}

/**
 * Iterates over `iterator` (iterable/array), calling `fn` for each value.
 * If `fn` returns _false_, iterator cancels.
 *
 * Over the default JS `forEach` function, this one allows you to exit the
 * iteration early.
 *
 * @example
 * ```js
 * import { Sync } from "https://unpkg.com/ixfx/dist/iterables.js"
 * Sync.forEach(count(5), () => console.log(`Hi`));  // Prints `Hi` 5x
 * Sync.forEach(count(5), i => console.log(i));      // Prints 0 1 2 3 4
 * Sync.forEach([0,1,2,3,4], i => console.log(i));   // Prints 0 1 2 3 4
 * ```
 *
 * Use {@link forEach} if you want to use an async `iterator` and async `fn`.
 * 
 * Alternatives:
 * * {@link @ixfx/flow.repeat}/{@link @ixfx/flow.repeatSync}: if you want to call something a given number of times and get the result
 * @param iterator Iterable or array
 * @typeParam T Type of iterable's values
 * @param fn Function to call for each item. If function returns _false_, iteration cancels
 */
export function forEach<T>(iterator: Iterable<T> | T[], fn: (v: T) => boolean | void) {
  for (const v of iterator) {
    const result = fn(v);
    if (typeof result === `boolean` && !result) break;
  }
}

/**
 * ```js
 * filter([1, 2, 3, 4], e => e % 2 == 0);
 * returns [2, 4]
 * ```
 * @param it
 * @param f
 */
export function* filter<V>(it: Iterable<V>, f: (v: V) => boolean) {
  // https://surma.github.io/underdash/

  for (const v of it) {
    if (!f(v)) continue;
    yield v;
  }
}

export function find<V>(it: Iterable<V>, f: (v: V) => boolean) {
  // https://surma.github.io/underdash/

  for (const v of it) {
    if (f(v)) return v;
  }
}

export function* flatten<V>(it: Iterable<V>) {
  // https://surma.github.io/underdash/
  for (const v of it) {
    if (typeof v === `object`) {
      if (Array.isArray(v)) {
        for (const vv of v) yield vv;
      } else if (isIterable(v)) {
        for (const vv of v) {
          yield vv;
        }
      }
    } else {
      yield v;
    }

  }
}


/**
 * Maps an iterable of type `V` to type `X`.
 * ```js
 * map([1, 2, 3], e => e*e)
 * returns [1, 4, 9]
 * ```
 * @param it
 * @param f
 */

export function* map<V, X>(it: Iterable<V>, f: (v: V) => X) {
  // https://surma.github.io/underdash/

  for (const v of it) {
    yield f(v);
  }
}

export function* max<V>(it: Iterable<V>, gt = (a: V, b: V) => a > b): Generator<V> {
  let max: V | undefined;
  for (const v of it) {
    if (max === undefined) {
      max = v;
      yield max;
      continue;
    }
    if (gt(v, max)) {
      max = v;
      yield max;
    }
  }
  return max;
}

export function* min<V>(it: Iterable<V>, gt = (a: V, b: V) => a > b) {
  let min: V | undefined;
  for (const v of it) {
    if (min === undefined) {
      min = v;
      yield min;
    }
    if (gt(min, v)) {
      min = v;
      yield min;
    }
  }
}



export function some<V>(it: Iterable<V>, f: (v: V) => boolean) {
  // https://surma.github.io/underdash/

  for (const v of it) {
    if (f(v)) return true;
  }
  return false;
}

// export function* takeWhile<V>(it: Iterable<V>, f: (v: V) => boolean) {
//   // https://surma.github.io/underdash/
//   for (const v of it) {
//     if (!f(v)) return;
//     yield v;
//   }
// }

export function* repeat<T>(genCreator: () => Iterable<T>, repeatsOrSignal: number | AbortSignal): Generator<T> {
  const repeats = typeof repeatsOrSignal === `number` ? repeatsOrSignal : Number.POSITIVE_INFINITY;
  const signal = typeof repeatsOrSignal === `number` ? undefined : repeatsOrSignal;
  let count = repeats;

  while (true) {
    for (const v of genCreator()) {
      yield v;
      if (signal?.aborted) break;
    }
    if (Number.isFinite(repeats)) {
      count--;
      if (count === 0) break;
    }
    if (signal?.aborted) break;
  }
}


export function* unique<V>(
  iterable: Iterable<V> | Iterable<V>[]
) {
  // Adapted from https://surma.github.io/underdash/
  const buffer: any[] = [];
  let itera: Iterable<V>[] = [];
  itera = Array.isArray(iterable) ? iterable : [ iterable ];
  for (const it of itera) {
    for (const v of it) {
      if (buffer.includes(v)) continue;
      buffer.push(v);
      yield v;
    }
  }
}

/**
 * Combine same-positioned items from several iterables
 * ```js
 * zip( [1, 2, 3], [4, 5, 6], [7, 8, 9] );
 * Yields: [ [1, 4, 7], [2, 5, 8], [3, 6, 9] ]
 * ```
 * @param its
 * @returns
 */

export function* zip<V>(...its: readonly Iterable<V>[]) {
  // https://surma.github.io/underdash/
  const iits = its.map((it) => it[ Symbol.iterator ]());

  while (true) {
    const vs = iits.map((it) => it.next());
    if (vs.some((v) => v.done)) return;
    yield vs.map((v) => v.value as V);
  }
}

export function* fromIterable<T>(iterable: Iterable<T>) {
  for (const v of iterable) {
    yield v;
  }
}

/**
 * Returns an array of values from an iterator.
 *
 * ```js
 * const data = await toArray(adsrIterable(opts, 10));
 * ```
 *
 * Note: If the iterator is infinite, be sure to provide a limit via the options or the function
 * will never return.
 *
 * @param it Asynchronous iterable
 * @param options Options when converting to array.
 * @returns
 */

export function toArray<V>(
  it: Iterable<V>,
  options: Partial<ToArrayOptions> = {}
): V[] {
  const result: V[] = [];
  const started = Date.now();
  const whileFunction = options.while;
  const maxItems = options.limit ?? Number.POSITIVE_INFINITY;
  const maxElapsed = intervalToMs(options.elapsed, Number.POSITIVE_INFINITY);
  for (const v of it) {
    if (whileFunction) {
      if (!whileFunction(result.length)) break;
    }
    if (result.length >= maxItems) break;
    if (Date.now() - started > maxElapsed) break;
    result.push(v);
  }
  return result;
}

/**
 * Yield values from `array`, one at a time.
 * Use `interval` to add time between each item.
 * The first item is yielded without delay.
 * @param array Array of values
 */
export function* fromArray<V>(array: V[]): Generator<V> {
  for (const v of array) {
    yield v;
  }
}