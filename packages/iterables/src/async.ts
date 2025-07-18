import { intervalToMs, type Interval, type IsEqual, toStringDefault } from '@ixfx/core';
import { sleep, type SleepOpts } from '@ixfx/core';
import type { ForEachOptions, ToArrayOptions } from './types.js';
import { isAsyncIterable, isIterable } from './guard.js';

/**
 * Yield values from `array`, one at a time.
 * Use `interval` to add time between each item.
 * The first item is yielded without delay.
 * 
 * @param array Array of values
 * @param interval Interval (defaults: 1ms)
 */
export async function* fromArray<V>(array: V[], interval: Interval = 1): AsyncGenerator<V> {
  for (const v of array) {
    yield v;
    await sleep(interval);
  }
}

/**
 * Yield values from `iterable`, one at a time.
 * Use `interval` to add time between each item.
 * The first item is yielded without delay.
 * @param iterable Iterable or AsyncIterable
 * @param [interval=1] Interval to wait between yield
 */
export async function* fromIterable<V>(iterable: Iterable<V> | AsyncIterable<V>, interval: Interval = 1): AsyncGenerator<V> {
  for await (const v of iterable) {
    yield v;
    await sleep(interval);
  }
}

export async function* chunks<V>(it: AsyncIterable<V>, size: number) {
  // Source: https://surma.github.io/underdash/
  let buffer: V[] = [];
  for await (const v of it) {
    buffer.push(v);
    if (buffer.length === size) {
      yield buffer;
      buffer = [];
    }
  }
  if (buffer.length > 0) yield buffer;
}


export async function* concat<V>(...its: readonly AsyncIterable<V>[]) {
  // Source: https://surma.github.io/underdash/
  for await (const it of its) yield* it;
}

export async function* dropWhile<V>(
  it: AsyncIterable<V>,
  f: (v: V) => boolean
) {
  for await (const v of it) {
    if (!f(v)) {
      yield v;
    }
  }
}

/**
 * Loops over a generator until it finishes, calling `callback`.
 * Useful if you don't care about the value generator produces, just the number of loops.
 * 
 * In this version, we do a `for await of` over `gen`, and also `await callback()`. 

 * ```js
 * await until(count(5), () => {
 * // do something 5 times
 * });
 * ```
 * 
 * If you want the value from the generator, use a `for of` loop as usual.
 * 
 * If `callback` explicitly returns _false_, the generator is aborted.
 * @param it Generator to run
 * @param callback Code to call for each iteration
 */
// eslint-disable-next-line @typescript-eslint/no-invalid-void-type
export const until = async (it: AsyncIterable<any> | Iterable<any>, callback: () => (void | Promise<boolean> | undefined | boolean | Promise<undefined> | Promise<void>)): Promise<undefined> => {
  for await (const _ of it) {
    const value = await callback();
    if (typeof value === `boolean` && !value) break;
  }
}

/**
 * This generator will repeat another generator up until some condition. This is the version
 * that can handle async generators.
 * 
 * For example, {@link @ixfx/numbers.count} will count from 0..number and then finish:
 * ```js
 * import { count } from '@ixfx/numbers'
 * for (const v of count(5)) {
 *  // v: 0, 1, 2, 3, 4
 * }
 * ```
 * 
 * But what if we want to repeat the count? We have to provide a function to create the generator,
 * rather than using the generator directly, since it's "one time use"
 * ```js
 * for await (const v of repeat(() => count(5))) {
 *  // v: 0, 1, 2, 3, 4, 0, 1, 2, 3, 4, 0, ...
 *  // warning: never ends
 * }
 * ```
 * 
 * Limiting the number of repeats can be done by passing in extra parameters
 * ```js
 * repeat(generator, { count: 5} ); // Iterate over `generator` five times
 * ```
 * 
 * ```js
 * const ac = new AbortController();
 * repeat(generator, { signal: ac.signal }); // Pass in signal
 * ...
 * ac.abort(); // Trigger signal at some point
 * ```
 * @param genCreator 
 * @param repeatsOrSignal 
 */
export const repeat = async function*<T>(genCreator: () => Iterable<T> | AsyncIterable<T>, repeatsOrSignal: number | AbortSignal): AsyncGenerator<T> {
  const repeats = typeof repeatsOrSignal === `number` ? repeatsOrSignal : Number.POSITIVE_INFINITY;
  const signal = typeof repeatsOrSignal === `number` ? undefined : repeatsOrSignal;
  let count = repeats;

  while (true) {
    for await (const v of genCreator()) {
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

/**
 * Returns true if items in two iterables are equal, as
 * determined by the `equality` function.
 * Order matters. It compares items at the same 'step' of each iterable.
 * @param it1
 * @param it2
 * @param equality
 * @returns
 */
export async function equals<V>(
  it1: AsyncIterable<V>,
  it2: AsyncIterable<V>,
  equality?: IsEqual<V>
) {
  // https://surma.github.io/underdash/
  const iit1 = it1[ Symbol.asyncIterator ]();// it1[ Symbol.iterator ]();
  const iit2 = it2[ Symbol.asyncIterator ]();
  while (true) {
    const index1 = await iit1.next();
    const index2 = await iit2.next();
    if (equality !== undefined) {
      if (!equality(index1.value, index2.value)) return false;
    } else if (index1.value !== index2.value) return false;
    if (index1.done ?? index2.done) return index1.done && index2.done;
  }
}

export async function every<V>(it: AsyncIterable<V>, f: (v: V) => boolean | Promise<boolean>) {
  for await (const v of it) {
    const result = await f(v);
    if (!result) return false;
  }
  return true;
}

export async function* fill<V>(it: AsyncIterable<V>, v: V) {
  // https://surma.github.io/underdash/
  for await (const _ of it) yield v;
}

/**
 * Filters an iterable, only yielding items which match `f`.
 *
 * ```js
 * filter([1, 2, 3, 4], e => e % 2 == 0);
 * returns [2, 4]
 * ```
 * @param it
 * @param f
 */
export async function* filter<V>(it: AsyncIterable<V>, f: (v: V) => boolean | Promise<boolean>) {
  // https://surma.github.io/underdash/
  for await (const v of it) {
    if (!await f(v)) continue;
    yield v;
  }
}


export async function find<V>(it: AsyncIterable<V>, f: (v: V) => boolean | Promise<boolean>) {
  // https://surma.github.io/underdash/
  for await (const v of it) {
    if (await f(v)) return v;
  }
}


export async function* flatten<V>(it: AsyncIterable<V>) {
  // https://surma.github.io/underdash/
  for await (const v of it) {
    if (typeof v === `object`) {
      if (Array.isArray(v)) {
        for (const vv of v) yield vv;
      } else if (isAsyncIterable(v)) {
        for await (const vv of v) {
          yield vv;
        }
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
 * Iterates over an async iterable or array, calling `fn` for each value, with optional
 * interval between each loop. If the async `fn` returns _false_, iterator cancels.
 *
 * ```
 * import { forEach } from "https://unpkg.com/ixfx/dist/flow.js"
 * // Prints items from array every second
 * await forEach([0,1,2,3], i => console.log(i), 1000);
 * ```
 *
 * ```
 * // Retry up to five times, with 5 seconds between each attempt
 * await forEach(count(5), i=> {
 *  try {
 *    await doSomething();
 *    return false; // Succeeded, exit early
 *  } catch (ex) {
 *    console.log(ex);
 *    return true; // Keep trying
 *  }
 * }, 5000);
 * ```
 * @param iterator Iterable thing to loop over
 * @param fn Function to invoke on each item. If it returns _false_ loop ends.
 * @param options Options
 * @typeParam V Type of iterable
 */
export const forEach = async function <T>(
  iterator: AsyncIterable<T> | T[],
  fn: (v?: T) => Promise<boolean> | Promise<void> | boolean | void,
  options: Partial<ForEachOptions> = {}
) {
  const interval = options.interval;
  if (Array.isArray(iterator)) {
    // Handle array
    for (const x of iterator) {
      const r = await fn(x);
      if (typeof r === `boolean` && !r) break;
      if (interval) await sleep(interval);
    }
  } else {
    // Handle an async iterator
    for await (const x of iterator) {
      const r = await fn(x);
      if (typeof r === `boolean` && !r) break;
      if (interval) await sleep(interval);
    }
  }
};

// export async function forEach<V>(it: AsyncIterable<V>, f: (v: V) => void | boolean | Promise<boolean | void>) {
//   // https://surma.github.io/underdash/
//   for await (const v of it) {
//     const result = await f(v);
//     if (typeof result === `boolean` && !result) break;
//   }
// }

/**
 * Returns last value from an iterable, or _undefined_
 * if no values are generated
 * @param it
 */
export async function last<V>(it: AsyncIterable<V>, opts: Partial<{ abort: AbortSignal }> = {}): Promise<V | undefined> {
  const abort = opts.abort;
  let returnValue: V | undefined;

  for await (const value of it) {
    if (abort?.aborted) return undefined;
    returnValue = value;
  }
  return returnValue;
}

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

export async function* map<V, X>(it: AsyncIterable<V>, f: (v: V) => X) {
  // https://surma.github.io/underdash/

  for await (const v of it) {
    yield f(v);
  }
}


export async function* max<V>(it: AsyncIterable<V>, gt = ((a: V, b: V) => a > b)) {
  let max: V | undefined;
  for await (const v of it) {
    if (max === undefined) {
      max = v;
      yield (max);
      continue;
    }
    // If V is bigger than max, we have a new max
    if (gt(v, max)) {
      max = v;
      yield v;
    }
  }
}

/**
 * Returns the minimum seen of an iterable as it changes.
 * Streaming result: works with endless iterables.
 * 
 * Note that `gt` function returns true if A is _greater_ than B, even
 * though we're looking for the minimum.
 * 
 * ```js
 * // Rank objects based on 'v' value
 * const rank = (a,b) => a.v > b.v;
 * min([
 *  {i:0,v:1},
 *  {i:1,v:9},
 *  {i:2,v:-2}
 * ], rank);
 * // Yields: {i:2, v:1}, {i:2,v:-2}
 * ```
 * @param it Iterable
 * @param gt Should return _true_ if `a` is greater than `b`.
 * @returns
 */
export async function* min<V>(it: AsyncIterable<V>, gt = (a: V, b: V) => a > b) {
  let min: V | undefined;
  for await (const v of it) {
    if (min === undefined) {
      min = v;
      yield min;
      continue;
    }
    // If min is bigger than V, V is the new min
    if (gt(min, v)) {
      min = v;
      yield v;
    }
  }
  return min;
}

export async function reduce<V>(
  it: AsyncIterable<V>,
  f: (accumulator: V, current: V) => V,
  start: V
) {
  // https://surma.github.io/underdash/

  for await (const v of it) start = f(start, v);
  return start;
}

/**
 * Calls `callback` whenever the async generator produces a value.
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
export async function asCallback<V>(input: AsyncIterable<V>, callback: (v: V) => unknown, onDone?: () => void) {
  for await (const value of input) {
    callback(value);
  }
  if (onDone) onDone();
}

export async function* slice<V>(
  it: AsyncIterable<V>,
  start = 0,
  end = Number.POSITIVE_INFINITY
) {
  console.log(`Async slice start: ${ start }`);

  // https://surma.github.io/underdash/
  const iit = it[ Symbol.asyncIterator ]();
  if (end < start) throw new Error(`Param 'end' should be more than 'start'`);

  for (; start > 0; start--, end--) await iit.next();

  for await (const v of it) {
    if (end-- > 0) {
      yield v;
    } else {
      break;
    }
  }
}

/**
 * Enumerates over an input iterable, with a delay between items.
 * @param it 
 * @param delay 
 */
export async function* withDelay<V>(it: Iterable<V>, delay: Interval) {
  for (const v of it) {
    await sleep(delay);
    yield v;
  }
}

/***
 * Returns the next IteratorResult,
 * throwing an error if it does not happen
 * within `interval` (default: 1s)
 */
export async function nextWithTimeout<V>(it: AsyncIterableIterator<V> | IterableIterator<V>, options: SleepOpts<any>) {
  const ms = intervalToMs(options, 1000);

  const value: IteratorResult<V> | undefined = await Promise.race([
    (async () => {
      await sleep({ millis: ms, signal: options.signal });

      return undefined;
    })(),
    (async () => {
      return await it.next();
    })()
  ]);
  if (value === undefined) throw new Error(`Timeout`);
  return value;
}

export async function some<V>(it: AsyncIterable<V>, f: (v: V) => boolean | Promise<boolean>) {
  // https://surma.github.io/underdash/
  for await (const v of it) {
    if (await f(v)) return true;
  }
  return false;
}

// export async function* takeWhile<V>(
//   it: AsyncIterable<V>,
//   f: (v: V) => boolean
// ) {
//   // https://surma.github.io/underdash/

//   for await (const v of it) {
//     if (!f(v)) return;
//     yield v;
//   }
// }

/**
 * Returns an array of values from an iterator.
 *
 * ```js
 * const data = await toArray(adsrIterable(opts, 10));
 * ```
 *
 * Note: If the iterator is infinite, be sure to provide limits via the options.
 * ```js
 * // Return maximum five items
 * const data = await toArray(iterable, { limit: 5 });
 * // Return results for a maximum of 5 seconds
 * const data = await toArray(iterable, { elapsed: 5000 });
 * ```
 * Note that limits are ORed, `toArray` will finish if either of them is true.
 * 
 * @param it Asynchronous iterable
 * @param options Options when converting to array
 * @returns
 */
export async function toArray<V>(it: AsyncIterable<V>, options: Partial<ToArrayOptions> = {}): Promise<V[]> {
  // https://2ality.com/2016/10/asynchronous-iteration.html
  const result: V[] = [];
  const iterator = it[ Symbol.asyncIterator ]();
  const started = Date.now();
  const maxItems = options.limit ?? Number.POSITIVE_INFINITY;
  const whileFunction = options.while;
  const maxElapsed = intervalToMs(options.elapsed, Number.POSITIVE_INFINITY);

  while (result.length < maxItems && (Date.now() - started < maxElapsed)) {
    if (whileFunction) {
      if (!whileFunction(result.length)) break;
    }
    const r = await iterator.next();
    if (r.done) break;
    //eslint-disable-next-line functional/immutable-data
    result.push(r.value);
  }
  return result;
}


export async function* unique<V>(
  iterable: AsyncIterable<V> | AsyncIterable<V>[]
) {
  const buffer: any[] = [];
  const itera: AsyncIterable<V>[] = Array.isArray(iterable) ? iterable : [ iterable ];
  for await (const it of itera) {
    for await (const v of it) {
      if (buffer.includes(v)) continue;
      buffer.push(v);
      yield v;
    }
  }
}

export async function* uniqueByValue<T>(input: AsyncIterable<T>, toString: (value: T) => string = toStringDefault, seen: Set<string> = new Set<string>()): AsyncGenerator<T> {
  for await (const v of input) {
    const key = toString(v);
    if (seen.has(key)) continue;
    seen.add(key);
    yield v;
  }
}

/**
 * Returns unique items from iterables, given a particular key function
 * ```js
 * unique([{i:0,v:2},{i:1,v:3},{i:2,v:2}], e => e.v);
 * Yields:  [{i:0,v:2},{i:1,v:3}]
 * @param it
 * @param f
 */

// export async function* unique<V>(
//   it: AsyncIterable<V>,
//   f: (id: V) => V = (id) => id
// ) {
//   // https://surma.github.io/underdash/
//   const buffer: Array<V> = [];

//   for await (const v of it) {
//     const fv = f(v);
//     if (buffer.includes(fv)) continue;
//     buffer.push(fv);
//     yield v;
//   }
// }

/**
 * Combine same-positioned items from several iterables
 * ```js
 * zip( [1, 2, 3], [4, 5, 6], [7, 8, 9] );
 * Yields: [ [1, 4, 7], [2, 5, 8], [3, 6, 9] ]
 * ```
 * @param its
 * @returns
 */
export async function* zip<V>(...its: readonly AsyncIterable<V>[]) {
  // https://surma.github.io/underdash/
  const iits = its.map((it) => it[ Symbol.asyncIterator ]());

  while (true) {
    const vs = await Promise.all(iits.map((it) => it.next()));
    if (vs.some((v) => v.done)) return;
    yield vs.map((v) => v.value as V);
  }
}
