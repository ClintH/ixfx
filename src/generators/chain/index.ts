/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable unicorn/prefer-ternary */
import { Async } from "../index.js";
import { Elapsed } from "../../flow/index.js";
import { intervalToMs, type Interval } from "../../flow/IntervalType.js";
import { sleep } from "../../flow/Sleep.js";
import { Queues } from "../../collections/index.js";
import { resolveToAsyncGen, resolveToGen } from "./Util.js";
import type { Link, GenFactoryNoInput, LazyChain, GenOrData, LinksWithSource, Gen, TickOptions, DelayOptions, RankArrayOptions, RankFunction, RankOptions } from "./Types.js";
import * as L from './Links.js';
export * as Dom from './Dom.js';
export * as Links from './Links.js';
export * from './Types.js';

function isNoInput<Out>(c: Link<any, any>): c is GenFactoryNoInput<Out> {
  if (`_allowNoInput` in c) return true;
  return false;
}

export function lazy<In, Out>(): LazyChain<In, Out> {
  const chained: Array<Link<any, any>> = [];
  let dataToUse: GenOrData<In> | undefined;

  const asGenerator = <V>(data?: GenOrData<In>) => {
    if (data === undefined) data = dataToUse;
    let d = resolveToAsyncGen(data);
    for (const c of chained) {
      if (d === undefined) {
        if (isNoInput<In>(c)) {
          d = c();
        } else {
          throw new Error(`Function '${ getLinkName(c) }' requires input. Provide it to the function, or call 'input' earlier.`)
        }
      } else {
        d = c(d);
      }
    }
    return d as AsyncGenerator<V>
  }

  const w: LazyChain<In, Out> = {
    rankArray: (r: RankFunction<In>, options: Partial<RankArrayOptions>): LazyChain<In, Out> => {
      chained.push(L.rankArray(r, options));
      return w;
    },
    rank: (r: RankFunction<In>, options: Partial<RankOptions>): LazyChain<In, Out> => {
      chained.push(L.rank(r, options));
      return w;
    },
    transform: (transformer: (v: any) => any) => {
      chained.push(L.transform(transformer));
      return w;
    },
    flatten: (flattener: (values: Array<any>) => any) => {
      chained.push(L.flatten(flattener));
      return w;
    },
    drop: (predicate: (v: In) => boolean) => {
      chained.push(L.drop(predicate));
      return w;
    },
    delay: (options: DelayOptions) => {
      chained.push(L.delay(options));
      return w;
    },
    duration: (elapsed: Interval) => {
      chained.push(L.duration(elapsed));
      return w;
    },
    debounce: (rate: Interval) => {
      chained.push(L.debounce(rate));
      return w;
    },
    fromFunction: (callback: () => any) => {
      chained.push(fromFunction(callback));
      return w;
    },
    take: (limit: number) => {
      chained.push(L.take(limit));
      return w;
    },
    chunk: (size: number, returnRemainders = true) => {
      chained.push(L.chunk(size, returnRemainders))
      return w;
    },
    filter: (predicate: (input: any) => boolean) => {
      chained.push(L.filter(v => predicate(v)));
      return w;
    },
    min: (): LazyChain<any, number> => {
      chained.push(L.min());
      return w as unknown as LazyChain<any, number>;
    },
    max: (): LazyChain<any, number> => {
      chained.push(L.max());
      return w as unknown as LazyChain<any, number>;
    },
    average: (): LazyChain<any, number> => {
      chained.push(L.average());
      return w as unknown as LazyChain<any, number>;
    },
    total: (): LazyChain<any, number> => {
      chained.push(L.total());
      return w as unknown as LazyChain<any, number>;
    },
    tally: (): LazyChain<any, number> => {
      chained.push(L.tally());
      return w as unknown as LazyChain<any, number>;
    },
    input(data: GenOrData<In>) {
      dataToUse = data;
      return w
    },
    asGenerator,
    asAsync(data?: GenOrData<In>) {
      let d = data ?? dataToUse;
      for (const c of chained) {
        if (d === undefined && isNoInput<In>(c)) {
          d = c();
        } else if (d === undefined) {
          throw new Error(`Function '${ getLinkName(c) }' needs input. Pass in data calling 'asAsync', or call 'input' earlier`);
        } else {
          d = c(d);
        }
      }
      return w;
    },
    asArray: async (data?: GenOrData<In>): Promise<Array<Out>> => {
      const g = asGenerator<Out>(data);
      return await Async.toArray<Out>(g);
    },
    firstOutput: async (data?: GenOrData<In>): Promise<Out | undefined> => {
      const g = asGenerator<Out>(data);
      const v = await g.next();
      return v.value as Out;
    },
    lastOutput: async (data?: GenOrData<In>): Promise<Out | undefined> => {
      const g = asGenerator<Out>(data);
      let lastValue: Out | undefined;
      for await (const v of g) {
        lastValue = v as Out;
      }
      return lastValue;
    },
  }
  return w as unknown as LazyChain<In, Out>;
}

/**
 * Generate timestamp values at `interval` rate. By default it runs forever. 
 * Use `loops` or `elapsed` to set upper limit on how long it should run.
 * 
 * Options:
 * - `asClockTime`: If _true_, yielded value will be clock time rather than elapsed milliseconds
 * @param options 
 * @returns 
 */
export function tick(options: TickOptions): GenFactoryNoInput<number> {
  const intervalMs = intervalToMs(options.interval, 0);
  const asClockTime = options.asClockTime ?? false;
  const loops = options.loops ?? Number.MAX_SAFE_INTEGER;
  let looped = 0;
  const durationTime = intervalToMs(options.elapsed, Number.MAX_SAFE_INTEGER);

  async function* ts(): AsyncGenerator<number> {
    const elapsed = Elapsed.since();
    while (looped < loops && elapsed() < durationTime) {
      yield asClockTime ? Date.now() : elapsed();

      // Adjust sleep period so timing errors don't accumulate
      const expectedTimeDiff = (looped * intervalMs) - elapsed();
      await sleep(Math.max(0, intervalMs + expectedTimeDiff));
      looped++;
    }
  }
  ts._name = `timestamp`;
  return ts;
}

/**
 * Produce a value from a callback. When
 * the callback returns _undefined_ it is considered done.
 * 
 * ```js
 * const callback = () => Math.random();
 * 
 * const f = Chains.fromFunction(callback);
 * f(); // New random number
 * ```
 * 
 * In the context of a chain:
 * ```js
 * let produced = 0;
 * const chain = Chains.chain<number, string>(
 *  // Produce incrementing numbers
 *  Chains.fromFunction(() => produced++),
 *  // Convert to `x:0`, `x:1` ...
 *  Chains.transform(v => `x:${ v }`),
 *  // Take first 5 results
 *  Chains.cap(5)
 * );
 * const data = await Chains.asArray(chain);
 * ```
 * @param callback 
 * @returns 
 */
export function fromFunction<Out>(callback: () => Promise<Out> | Out): GenFactoryNoInput<Out> {
  async function* fromFunction(): AsyncGenerator<Out> {
    while (true) {
      const v = await callback();
      if (v === undefined) break;
      yield v;
    }
  }
  fromFunction._name = `fromFunction`;
  return fromFunction;
}

const oncePromise = (target: EventTarget, name: string): Promise<any> => {
  return new Promise(resolve => {
    const handler = (...args: Array<any>) => {
      target.removeEventListener(name, handler);
      resolve(args);
    };
    target.addEventListener(name, handler);
  });
};

export function fromEvent<Out>(target: EventTarget, name: string) {
  async function* fromEvent(): AsyncGenerator<Out> {
    while (true) {
      yield await oncePromise(target, name) as Out;
    }
  }
  fromEvent._name = `fromEvent`;
  return fromEvent;
}

/**
 * Treats the chain/generator as a promise
 * 
 * ```js
 * const ticker = asPromise(tick({ interval: 1000 }));
 * const x = await ticker(); //  Waits for 1000ms before giving a value
 * ```
 * 
 * This will only ever return one value. To return multiple values, it's necessary
 * to call `asPromise` and `await` the result in a loop.
 * @param valueToWrap 
 * @returns 
 */
export function asPromise<V>(valueToWrap: AsyncGenerator<V> | GenFactoryNoInput<V>) {
  let lastValue: V | undefined;

  const outputType = (typeof valueToWrap === `function`) ? valueToWrap() : valueToWrap;

  async function asPromise(): Promise<V | undefined> {
    const v = await outputType.next();
    if (v.done) return;
    lastValue = v.value;
    return lastValue;
  }
  return asPromise;
}

/**
 * Returns the most recent value from the chain/generator, or
 * `initialValue` (defaulting to _undefined_) if no value
 * has been emitted yet.
 * 
 * ```js
 * const ticker = asValue(tick({ interval: 1000 }));
 * x = ticker(); // Get the most recent value
 * ```
 * 
 * Every time it's called, it fetches a new value from the generator, assuming
 * it isn't already awaiting a result.
 * 
 * In the meantime, the last value (or `initialValue`) is returned.
 * @param valueToWrap Value to wrap
 * @param initialValue Initial value
 * @returns 
 */
export function asValue<V>(valueToWrap: AsyncGenerator<V> | GenFactoryNoInput<V>, initialValue?: V) {
  let lastValue: V | undefined = initialValue;
  let awaiting = false;
  const outputType = (typeof valueToWrap === `function`) ? valueToWrap() : valueToWrap;

  function asValue(): V | undefined {
    if (!awaiting) {
      awaiting = true;
      outputType.next().then(v => {
        lastValue = v.value;
        awaiting = false;
      }).catch(error => {
        awaiting = false;
        throw error;
      });
    }
    return lastValue;
  }
  return asValue;
}

/**
 * Calls `callback` whenever the chain/generator produces a value.
 * 
 * When using `asCallback`, call it with `await` to let generator run its course before continuing:
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
 * @param valueToWrap 
 * @param callback 
 */
export async function asCallback<V>(valueToWrap: GenOrData<V> | GenFactoryNoInput<V>, callback: (v: V) => unknown, onDone?: () => void) {
  const outputType = (typeof valueToWrap === `function`) ? valueToWrap() : valueToWrap;
  for await (const value of outputType) {
    callback(value);
  }
  if (onDone) onDone();
}


/**
 * Async function that returns the chain as an array of values
 * ```js
 * const values = await asArray(tick( { interval: 1000, loops: 5 }));
 * // After 5 seconds, values will be a set of timestamps.
 * ```
 * @param valueToWrap 
 * @returns 
 */
export async function asArray<Out>(valueToWrap: AsyncGenerator<Out> | GenFactoryNoInput<Out>): Promise<Array<Out>> {
  const outputType = (typeof valueToWrap === `function`) ? valueToWrap() : valueToWrap;
  return Async.toArray(outputType);
}

/**
 * Adds values to the provided array as they are produced,
 * mutating array.
 * 
 * ```js
 * const data = [];
 * addToArray(data, tick({ interval: 1000, loops: 5 }));
 * // Execution continues immediately, with `data` mutated over time
 * ```
 * @param valueToWrap 
 * @param array 
 */
export async function addToArray<Out>(array: Array<Out>, valueToWrap: AsyncGenerator<Out> | GenFactoryNoInput<Out>) {
  const outputType = (typeof valueToWrap === `function`) ? valueToWrap() : valueToWrap;
  for await (const value of outputType) {
    array.push(value);
  }
}

/**
 * Input a single value to the chain, return a single result
 * @param f 
 * @param input 
 * @returns 
 */
export async function single<In, Out>(f: Link<In, Out>, input: In): Promise<Out | undefined> {
  const iterator = await f([ input ]).next();
  return iterator.value as Out | undefined;
}

/**
 * Merge values from several sources into one stream, interleaving values.
 * When all streams are complete it finishes.
 * 
 * Alternatively:
 * - {@link mergeAsArray} emits snapshots of all the generators, as quickly as the fastest one
 * - {@link synchronise} which releases a set of results when all inputs have emitted a value
 * @param sources 
 */
export async function* mergeFlat<Out>(...sources: Array<GenOrData<any> | GenFactoryNoInput<any>>): AsyncGenerator<Out> {
  const sourcesInput = sources.map(source => resolveToAsyncGen(source));
  const buffer = Queues.mutable<Out>();
  let completed = 0;

  const schedule = async (source: AsyncGenerator<any> | undefined) => {
    if (source === undefined) {
      completed++;
      return;
    }

    const x = await source.next();
    if (x.done) {
      completed++;
    } else {
      buffer.enqueue(x.value as Out);
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      setTimeout(() => schedule(source), 1);
    }
  }

  for (const source of sourcesInput) {
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    setTimeout(() => schedule(source), 1);
  }

  const loopSpeed = 10;
  let loopFactor = 1;
  while (completed < sourcesInput.length) {
    const d = buffer.dequeue();
    if (d === undefined) {
      // Grow loop factor up to 10
      loopFactor = Math.min(loopFactor + 1, 10);
    } else {
      yield d;
      // Reset loop factor
      loopFactor = 1;
    }
    await sleep(loopSpeed * loopFactor);
  }
}

/**
 * Generate values for each source, returning results as an array.  
 * If a source finishes before another, null will be used at its position in the results.
 * Use {@link synchronise} instead to only release results when all sources have yielded a value.
 * 
 * Finishes when all generators finish.
 * 
 * Alternatively:
 * - {@link mergeFlat} interleaves streams as single values
 * - {@link synchronise} only return results when all sourcse have yielded a value
 * @param sources 
 */
export async function* mergeAsArray(...sources: Array<GenOrData<any> | GenFactoryNoInput<any>>): AsyncGenerator<Array<any>> {
  const sourcesInput = sources.map(source => resolveToGen(source));
  let somethingProduced = true;
  while (somethingProduced) {
    let data = [];
    for (let index = 0; index < sourcesInput.length; index++) {
      // eslint-disable-next-line unicorn/no-null
      data[ index ] = null;
    }

    somethingProduced = false;
    // Request the next value from each source
    for (const [ index, source ] of sourcesInput.entries()) {
      const v = await source.next();
      if (!v.done) {
        data[ index ] = v.value;
        somethingProduced = true;
      }
    }
    if (somethingProduced) {
      // Send data
      yield data;
      data = [];
    }
  }
}

/**
 * Synchronise several sources, releasing a set of results when every
 * source has produced something. Finishes as soon as _any_ source finishes.
 * 
 * ie. the rate of emitting data is determined by the slowest source.
 * 
 * Alternatively:
 * - {@link mergeFlat} interleaves streams as single values
 * - {@link mergeAsArray} emits snapshots of all the generators, as quickly as the fastest one
 * @param sources 
 */
export async function* synchronise(...sources: Array<GenOrData<any> | GenFactoryNoInput<any>>): AsyncGenerator<Array<any>> {
  const sourcesInput = sources.map(source => resolveToGen(source));
  let somethingStopped = false;
  while (!somethingStopped) {
    let data = [];
    for (let index = 0; index < sourcesInput.length; index++) {
      // eslint-disable-next-line unicorn/no-null
      data[ index ] = null;
    }

    somethingStopped = false;
    // Request the next value from each source
    for (const [ index, source ] of sourcesInput.entries()) {
      const v = await source.next();
      if (v.done) {
        somethingStopped = true;
        break;
      } else {
        data[ index ] = v.value;
      }
    }

    if (somethingStopped) break;
    yield data;
    data = [];
  }
}

const getLinkName = (c: Link<any, any>): string => {
  if (`_name` in c) {
    return c._name as string;
  } else {
    return c.name;
  }
}

/**
 * Chain functions together. First argument is the source.
 * `runN` takes any number of chain functions. Use {@link run} if
 * possible, because it has improved type hinting.
 * 
 * @example Process an array of strings. Transforming into
 * integers, and then filtering only even numbers.
 * ```js
 * const ch = Chains.runN(
 *  [ `1`, `2`, `3`, `4`, `5`, `6`, `7`, `8`, `9`, `10` ],
 *  Chains.transform<string, number>(v => Number.parseInt(v)),
 *  Chains.filter(v => v % 2 === 0)
 *);
 * const output = await Async.toArray(ch2);
 * // [ 2, 4, 6, 8, 10 ]
 * ```
 * @param functions 
 * @returns 
 */
export async function* runN<In, Out>(...functions: LinksWithSource<In, Out>): AsyncGenerator<Out> {
  let input: Gen<In> | undefined;
  for (const fnOrData of functions) {
    if (typeof fnOrData === `function`) {
      input = fnOrData(input ?? []);
    } else {
      input = resolveToGen(fnOrData);
    }
  }
  if (input === undefined) return;
  for await (const v of input) {
    yield v as Out;
  }
}

export function run<T1>(gen: GenOrData<T1> | GenFactoryNoInput<T1>): AsyncGenerator<T1>;
export function run<T1, T2>(gen: GenOrData<T1> | GenFactoryNoInput<T1>, l0: Link<T1, T2>): AsyncGenerator<T2>;
export function run<T1, T2, T3>(gen: GenOrData<T1> | GenFactoryNoInput<T1>, l0: Link<T1, T2>, l1: Link<T2, T3>): AsyncGenerator<T3>;
export function run<T1, T2, T3, T4>(gen: GenOrData<T1> | GenFactoryNoInput<T1>, l0: Link<T1, T2>, l1: Link<T2, T3>, l2: Link<T3, T4>): AsyncGenerator<T4>;
export function run<T1, T2, T3, T4, T5>(gen: GenOrData<T1> | GenFactoryNoInput<T1>, l0: Link<T1, T2>, l1: Link<T2, T3>, l2: Link<T3, T4>, l3: Link<T4, T5>): AsyncGenerator<T5>;
export function run<T1, T2, T3, T4, T5, T6>(gen: GenOrData<T1> | GenFactoryNoInput<T1>, l0: Link<T1, T2>, l1: Link<T2, T3>, l2: Link<T3, T4>, l3: Link<T4, T5>, l4: Link<T5, T6>): AsyncGenerator<T6>;
export function run<T1, T2, T3, T4, T5, T6, T7>(gen: GenOrData<T1> | GenFactoryNoInput<T1>, l0: Link<T1, T2>, l1: Link<T2, T3>, l2: Link<T3, T4>, l3: Link<T4, T5>, l4: Link<T5, T6>, l5: Link<T6, T7>): AsyncGenerator<T7>;

/**
 * Chain functions together. First argument is the source.
 * Use {@link runN} if you want to chain more links than is possible here,
 * at the cost of poorer type hinting.
 * 
 * @example Process an array of strings. Transforming into
 * integers, and then filtering only even numbers.
 * ```js
 * const ch = Chains.run(
 *  [ `1`, `2`, `3`, `4`, `5`, `6`, `7`, `8`, `9`, `10` ],
 *  Chains.transform(v => Number.parseInt(v)),
 *  Chains.filter(v => v % 2 === 0)
 *);
 * const output = await Async.toArray(ch2);
 * // [ 2, 4, 6, 8, 10 ]
 * ```
 * @param gen 
 * @param l0 
 * @param l1 
 * @param l2 
 * @param l3 
 * @returns 
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function* run<T1, T2, T3, T4, T5, T6, T7>(gen: GenOrData<T1> | GenFactoryNoInput<T1>, l0?: Link<T1, T2>, l1?: Link<T2, T3>, l2?: Link<T3, T4>, l3?: Link<T4, T5>, l4?: Link<T5, T6>, l5?: Link<T6, T7>): AsyncGenerator<T1> {
  let input: Gen<any> | undefined;
  // eslint-disable-next-line prefer-rest-params
  const functions = arguments;
  for (const fnOrData of functions) {
    if (typeof fnOrData === `function`) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      input = fnOrData(input ?? []);
    } else {
      input = resolveToGen(fnOrData);
    }
  }
  if (input === undefined) return;
  for await (const v of input) {
    yield v;
  }
}


/**
 * Prepare a chain, allowing you to provide a source at execution time.
 * ```js
 * const chain = Chains.prepare(
 *  Chains.transform<string,number>( v => number.parseInt(v) ),
 *  Chains.filter<number>(v => v % 2 === 0)
 * );
 *
 * // Run it with provided source
 * for await (const v of chain([`1`, `2`, `3`])) {
 *
 * }
 * ```
 * @param functions
 * @returns
 */
// export function prepare<In, Out>(...functions: Links<In, Out>) {
//   const r = (source: GenOrData<In> | GenFactoryNoInput<Out>) => {
//     return run(source);
//   }
//   return r;
// }
