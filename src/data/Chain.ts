/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable unicorn/prefer-ternary */
import { Async } from "../Generators.js";
import { Elapsed } from "../flow/index.js";
import { intervalToMs, type Interval } from "../flow/Interval.js";
import { sleep } from "../flow/Sleep.js";
import { isAsyncIterable } from "../Iterable.js";
import { Queues } from "../collections/index.js";
import { throwIntegerTest } from "../Guards.js";

/**
 * A Generator, AsyncGenerator or IterableIterator
 */
export type Gen<V> = Generator<V> | AsyncGenerator<V> | IterableIterator<V>;
type GenOrData<V> = Array<V> | Gen<V>;

type Chain<In, Out> = (input: GenOrData<In>) => AsyncGenerator<Out>;

type GenFactoryNoInput<Out> = () => AsyncGenerator<Out>;

export type ChainArguments<In, Out> = [
  Chain<In, any> | GenOrData<In> | GenFactoryNoInput<Out>,
  ...Array<Chain<any, any>>,
  Chain<any, Out>
]

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
 * Resolve the data, primitive or function to an AsyncGenerator
 * @param input 
 * @returns 
 */
function resolveToAsyncGen<V>(input: GenOrData<V> | GenFactoryNoInput<V>): AsyncGenerator<V> {
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

/**
 * Resolve the array, data or function to a Generator
 * @param input 
 * @returns 
 */
function resolveToGen<V>(input: GenOrData<V> | GenFactoryNoInput<V>): Gen<V> {
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
 * Delay options
 */
export type DelayOptions = {
  /**
   * Time before yielding
   */
  before?: Interval,
  /**
   * Time after yielding
   */
  after?: Interval
}

/**
 * Add delay before/after values are emitted from the input stream.
 * @param options 
 * @returns 
 */
export function delay<In>(options: DelayOptions): Chain<In, In> {
  const before = intervalToMs(options.before, 0);
  const after = intervalToMs(options.after, 0);

  async function* delay(input: GenOrData<In>): AsyncGenerator<In> {
    input = resolveToGen(input);
    for await (const value of input) {
      if (before > 0) {
        await sleep(before);
      }
      yield value;
      if (after > 0) {
        await sleep(after);
      }
    }
  }
  delay._name = `delay`;
  return delay;
}


/**
 * Ensure a minimum length of time between values.
 * Values being produced too quickly are dropped.
 * 
 * In the following example, only three values will be let through.
 * ```js
 * const chain = Chains.chain(
 *  // Produce values every 10ms for 350ms
 *  Chains.tick({ interval: 10, elapsed: 350 }),
 *  // Only let a value through every 100ms
 *  Chains.debounce(100)
 * );
 * ```
 * @param rate 
 * @returns 
 */
export function debounce<In>(rate: Interval): Chain<In, In> {
  const rateMs = intervalToMs(rate, 0);

  async function* debounce(input: GenOrData<In>): AsyncGenerator<In> {
    input = resolveToGen(input);
    let elapsed = Elapsed.since();
    for await (const value of input) {
      if (elapsed() < rateMs) continue;
      yield value;
      elapsed = Elapsed.since();
    }
  }
  debounce._name = `debounce`;
  return debounce;
}

/**
 * Allow values through until a duration has elapsed. After
 * that, the chain stops.
 * @param duration 
 * @returns 
 */
export function duration<In>(elapsed: Interval): Chain<In, In> {
  const durationMs = intervalToMs(elapsed, 0);

  async function* duration(input: GenOrData<In>): AsyncGenerator<In> {
    input = resolveToGen(input);
    const elapsed = Elapsed.since();
    for await (const value of input) {
      if (elapsed() > durationMs) break;
      yield value;
    }
  }
  duration._name = `duration`;
  return duration;
}

export type TickOptions = {
  interval: Interval
  loops?: number
  elapsed?: Interval
  asClockTime?: boolean
}

/**
 * Generate timestamp values
 * By default it runs forever. 
 * Use `loops` or `elapsed` to set upper limits.
 * 
 * Options:
 * - `asClockTime`: If true, yielded value will be clock time rather than elapsed
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
 * @param valueToWrap 
 * @param initialValue 
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
 * @param chain 
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
 * @param chain 
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
export async function single<In, Out>(f: Chain<In, Out>, input: In): Promise<Out | undefined> {
  const iterator = await f([ input ]).next();
  return iterator.value as Out | undefined;
}

/**
 * Takes an array of values, flattening to a single one
 * using the provided `flattener` function.
 * 
 * ```js
 * // Create a chain that flattens values
 * const flatten = Chains.flatten(values => Math.max(...values));
 * // Feed it a single input (an array), get a single output back:
 * const result = await Chains.single(flatten, [ 1, 2, 3]); // 3
 * ```
 * @param flattener Function to flatten array of values to a single value
 * @returns 
 */
export function flatten<In, Out>(flattener: (v: Array<In>) => Out): Chain<Array<In>, Out> {
  async function* flatten(input: GenOrData<Array<In>>): AsyncGenerator<Out> {
    input = resolveToGen(input);
    for await (const value of input) {
      yield flattener(value);
    }
  }
  flatten._name = `flatten`;
  return flatten;
}

/**
 * Transform values from one type to another. Just like a map function.
 * @param transformer 
 * @returns 
 */
export function transform<In, Out>(transformer: (v: In) => Out): Chain<In, Out> {
  async function* transform(input: GenOrData<In>): AsyncGenerator<Out> {
    input = resolveToGen(input);
    for await (const value of input) {
      yield transformer(value);
    }
  }
  transform._name = `transform`;
  return transform;
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

  const schedule = async (source: AsyncGenerator<any>) => {
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

/**
 * Emits up to a capped amount of items from the input
 * @param limit 
 * @returns 
 */
export function cap<In>(limit: number): Chain<In, In> {
  async function* cap(input: GenOrData<In>): AsyncGenerator<In> {
    input = resolveToGen(input);
    let yielded = 0;
    for await (const value of input) {
      if (++yielded > limit) break;
      yield value;
    }
  }
  cap._name = `cap`;
  return cap;
}

/**
 * Returns a running tally of how many items have been
 * emitted from the input source.
 * @param limit 
 * @returns 
 */
export function tally<In>(): Chain<In, number> {
  async function* tally(input: GenOrData<In>): AsyncGenerator<number> {
    input = resolveToGen(input);
    let count = 0;
    for await (const _ of input) {
      yield ++count;
    }
  }
  tally._name = `tally`;
  return tally;
}

/**
 * Chunks an input stream into `size` chunks.
 * @param size 
 * @param returnRemainders If true (default) left over data that didn't make a full chunk is also returned
 * @returns 
 */
export function chunk<In>(size: number, returnRemainders = true): Chain<In, Array<In>> {
  throwIntegerTest(size, `aboveZero`, `size`);
  async function* chunk(input: GenOrData<In>): AsyncGenerator<Array<In>> {
    input = resolveToGen(input);
    let buffer: Array<In> = [];
    for await (const value of input) {
      buffer.push(value);
      if (buffer.length >= size) {
        yield buffer;
        buffer = []
      }
    }
    if (returnRemainders && buffer.length > 0) yield buffer;
  }
  chunk._name = `chunk`;
  return chunk;
}

/**
 * Filters the input source, only allowing through
 * data for which `predicate` returns _true_
 * @param predicate 
 * @returns 
 */
export function filter<In>(predicate: (v: In) => boolean): Chain<In, In> {
  async function* filter(input: GenOrData<In>): AsyncGenerator<In> {
    input = resolveToGen(input);
    for await (const value of input) {
      if (predicate(value)) {
        yield value;
      }
    }
  }
  filter._name = `filter`;
  return filter;
}

/**
 * Chain functions together.
 * 
 * @example Process an array of strings. Transforming into
 * integers, and then filtering only even numbers.
 * ```js
 * const ch = Chains.chain(
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
export async function* chain<In, Out>(...functions: ChainArguments<In, Out>): AsyncGenerator<Out> {
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