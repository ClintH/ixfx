/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable unicorn/prefer-ternary */
import { Async } from "../Generators.js";
import { Elapsed } from "../flow/index.js";
import { intervalToMs, type Interval } from "../flow/Interval.js";
import { sleep } from "../flow/Sleep.js";
import { isAsyncIterable } from "../Iterable.js";
import { Queues } from "../collections/index.js";
import { throwIntegerTest } from "../Guards.js";

type GenAsync<V> = AsyncGenerator<V>
type Gen<V> = Generator<V> | AsyncGenerator<V> | IterableIterator<V>;
type GenOrData<V> = Array<V> | Gen<V>;

type GenFactory<In, Out> = (input: GenOrData<In>) => GenAsync<Out>;
type GenFactoryNoInput<Out> = () => GenAsync<Out>;

export type ChainArguments<In, Out> = [
  GenFactory<In, any> | GenOrData<In> | GenFactoryNoInput<Out>,
  ...Array<GenFactory<any, any>>,
  GenFactory<any, Out>
]

function* primitiveToGenerator(value: number | boolean | string) {
  yield value;
}

async function* primitiveToAsyncGenerator(value: number | boolean | string) {
  yield value;
  await sleep(1);
}

function resolveToGenAsync<V>(input: GenOrData<V> | GenFactoryNoInput<V>): GenAsync<V> {
  if (Array.isArray(input)) {
    return Async.fromArray(input);
  } else if (typeof input === `number` || typeof input === `boolean` || typeof input === `string`) {
    // Assumes V is primitive
    return primitiveToAsyncGenerator(input) as GenAsync<V>;
  } else if (typeof input === `function`) {
    return input();
  } else if (isAsyncIterable(input)) {
    return input;
  }
  return Async.fromIterable(input);
}

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

export type DelayOptions = {
  before?: Interval,
  after?: Interval
}


export function delay<In>(options: DelayOptions): GenFactory<In, In> {
  const before = intervalToMs(options.before, 0);
  const after = intervalToMs(options.after, 0);

  async function* delay(input: GenOrData<In>): GenAsync<In> {
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
export function debounce<In>(rate: Interval): GenFactory<In, In> {
  const rateMs = intervalToMs(rate, 0);

  async function* debounce(input: GenOrData<In>): GenAsync<In> {
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
 * Allow values through until a duration has elapsed
 * @param duration 
 * @returns 
 */
export function duration<In>(elapsed: Interval): GenFactory<In, In> {
  const durationMs = intervalToMs(elapsed, 0);

  async function* duration(input: GenOrData<In>): GenAsync<In> {
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

  async function* ts(): GenAsync<number> {
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
 * Treats generator as a promise
 * 
 * ```js
 * const ticker = asPromise(tick({ interval: 1000 }));
 * const x = await ticker(); //  Waits for 1000 before giving a value
 * ```
 * @param valueToWrap 
 * @returns 
 */
export function asPromise<V>(valueToWrap: GenAsync<V> | GenFactoryNoInput<V>) {
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
 * Returns the most recent value from the generator, or
 * `initialValue` (defaulting to _undefined_) if there is no
 * value returned from generator.
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
export function asValue<V>(valueToWrap: GenAsync<V> | GenFactoryNoInput<V>, initialValue?: V) {
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
 * Calls `callback` whenever the generator produces a value.
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
export async function asArray<Out>(valueToWrap: GenAsync<Out> | GenFactoryNoInput<Out>): Promise<Array<Out>> {
  const outputType = (typeof valueToWrap === `function`) ? valueToWrap() : valueToWrap;
  return Async.toArray(outputType);
}

/**
 * Adds values to an array as they are produced,
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
export async function addToArray<Out>(array: Array<Out>, valueToWrap: GenAsync<Out> | GenFactoryNoInput<Out>) {
  const outputType = (typeof valueToWrap === `function`) ? valueToWrap() : valueToWrap;
  for await (const value of outputType) {
    array.push(value);
  }
}

/**
 * Input a single value, return a single value
 * @param f 
 * @param input 
 * @returns 
 */
export async function single<In, Out>(f: GenFactory<In, Out>, input: In): Promise<Out | undefined> {
  const iterator = await f([ input ]).next();
  return iterator.value as Out | undefined;
}

/**
 * Takes an array of values, flattening to a single one
 * @param flattener 
 * @returns 
 */
export function flatten<In, Out>(flattener: (v: Array<In>) => Out): GenFactory<Array<In>, Out> {
  async function* flatten(input: GenOrData<Array<In>>): GenAsync<Out> {
    input = resolveToGen(input);
    for await (const value of input) {
      yield flattener(value);
    }
  }
  flatten._name = `flatten`;
  return flatten;
}


export function transform<In, Out>(transformer: (v: In) => Out): GenFactory<In, Out> {
  async function* transform(input: GenOrData<In>): GenAsync<Out> {
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
 * Alternatively, {@link mergeAsArray} emits snapshots of all the generators, as quickly as the fastest one
 * Or {@link synchronise} which releases a set of results when all inputs have emitted a value
 * @param sources 
 */
export async function* mergeFlat<Out>(...sources: Array<GenOrData<any> | GenFactoryNoInput<any>>): GenAsync<Out> {
  const sourcesInput = sources.map(source => resolveToGenAsync(source));
  const buffer = Queues.mutable<Out>();
  let completed = 0;

  const schedule = async (source: GenAsync<any>) => {
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
export async function* mergeAsArray(...sources: Array<GenOrData<any> | GenFactoryNoInput<any>>): GenAsync<Array<any>> {
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

export async function* synchronise(...sources: Array<GenOrData<any> | GenFactoryNoInput<any>>): GenAsync<Array<any>> {
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

export function cap<In>(limit: number): GenFactory<In, In> {
  async function* cap(input: GenOrData<In>): GenAsync<In> {
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
export function tally<In>(): GenFactory<In, number> {
  async function* tally(input: GenOrData<In>): GenAsync<number> {
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
export function chunk<In>(size: number, returnRemainders = true): GenFactory<In, Array<In>> {
  throwIntegerTest(size, `aboveZero`, `size`);
  async function* chunk(input: GenOrData<In>): GenAsync<Array<In>> {
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

export function filter<In>(predicate: (v: In) => boolean): GenFactory<In, In> {
  async function* filter(input: GenOrData<In>): GenAsync<In> {
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



export async function* chain<In, Out>(...functions: ChainArguments<In, Out>): GenAsync<Out> {
  let input: Gen<In> | undefined;
  for (const fnOrData of functions) {
    // console.log(`chain: fnOrData: ${ JSON.stringify(fnOrData) }`);
    // if (`_name` in fnOrData) {
    //   console.log(` fnOrData name: ${ fnOrData._name as string }`);
    // }
    // if (input && `_name` in input) {
    //   console.log(` input name: ${ input._name as string }`);
    // }
    if (typeof fnOrData === `function`) {
      input = fnOrData(input ?? []);
    } else {
      input = resolveToGen(fnOrData);
      //console.log(` input data resolved to: ${ JSON.stringify(input) }`);
    }
  }
  if (input === undefined) return;
  for await (const v of input) {
    //console.log(`chain output: ${ JSON.stringify(v) }`);
    yield v as Out;
  }
  //console.log(`Done`);
  //return input;
  //yield* input as Output<Out>;
}

//const t = chain<number, number>([ 1, 2, 3 ]);
