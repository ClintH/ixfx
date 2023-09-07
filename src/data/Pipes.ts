
import { average as NumericArrayAverage } from "../collections/NumericArrays.js";
import { intervalToMs, type Interval } from "../flow/Interval.js";
// import { isAsyncIterable, isIterable } from "../Iterable.js";
// import { KeyValues } from "src/index.js";
// import { isMap } from "../Util.js";
import { count } from "../Generators.js";

export type PipeSignalClose = {
  ch: `pipe`,
  type: `closed`
}
export type PipeSignalSourceError = {
  ch: `pipe`,
  type: `error`,
  message: string
}
export type PipeSignal = PipeSignalClose | PipeSignalSourceError;

type OutletCallback<V> = (value: V, signal?: PipeSignal) => void;

export type PipeReadable<V> = {
  setOutlet: (callback: OutletCallback<V> | PipeWriteable<V>, setOpts?: SetOutletOptions) => void
  getOutlet: () => OutletCallback<V> | undefined
  last: () => V | undefined
}

export type FinitePipe = {
  isClosed: () => boolean
}

export function isFinitePipe(p: PipeReadable<any> | PipeWriteable<any> | FinitePipe): p is FinitePipe {
  return (`isClosed` in p);
}

export type PipeWriteable<V> = {
  inlet: (value: V, signal?: PipeSignal) => void
}

export type PipeBidi<V> = PipeReadable<V> & PipeWriteable<V> & FinitePipe;

export async function* asAsyncIterable<V>(p: PipeReadable<V>): AsyncGenerator<V> {
  let promise = asPromise(p);
  while (true) {
    const value = await promise;
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (value === undefined) return;

    yield value;
    if (isFinitePipe(p) && p.isClosed()) return;
    promise = asPromise(p);
  }
}

export type WaitForOptions = {
  overwritePolicy?: `latest` | `first`
  reset?: boolean
}

export const NullSink = (_: any) => {
  /** no-op */
}

export const LogSink = (value: any, signal?: PipeSignal) => {
  if (signal) {
    console.log(`Pipes.LogSink value: ${ JSON.stringify(value) } signal: ${ JSON.stringify(signal) }`);
  } else {
    console.log(`Pipes.LogSink value: ${ JSON.stringify(value) }`);
  }
}

export const signal = (pipe: PipeWriteable<any>, signal: PipeSignal) => {
  pipe.inlet(undefined, signal);
}

/**
 * Inserts `insertPipe` between output of `sourcePipe` and its existing downstream pipe.
 * Assumes `sourcePipe` is already connected to something - if it's not, it's the same as `connect`.
 * @param sourcePipe 
 * @param interceptingPipe 
 */
export const insert = <V>(sourcePipe: PipeReadable<V>, insertPipe: PipeBidi<V>) => {
  const existingOutlet = sourcePipe.getOutlet();
  sourcePipe.setOutlet(insertPipe);
  if (existingOutlet) insertPipe.setOutlet(existingOutlet);
}

/**
 * Waits for each pipe to emit a value, sending the combined outcome
 * as an array.
 * 
 * By default:
 * - returns the latest values from each stream
 * - after all pipes have emitted a value, we reset and wait for the next batch
 * 
 * If `reset` is not enabled, pipe will close when done
 * @param p 
 */
export const synchronise = (opts: WaitForOptions, ...pipes: Array<PipeReadable<any>>): PipeReadable<Array<any>> => {
  const overwritePolicy = opts.overwritePolicy ?? `latest`;
  const reset = opts.reset ?? true;
  const pipe = bidi<Array<any>>();
  let results: Array<any> = [];

  const resetValues = () => {
    results = [];
    for (const [ index ] of pipes.entries()) {
      results[ index ] = undefined;
    }
  }

  const checkCompletion = () => {
    // Still something undefined?
    if (results.includes(undefined)) return;

    // Everything is in place!
    pipe.inlet(results);
    if (reset) {
      resetValues();
    } else {
      dispose();
    }
  }

  const dispose = () => {
    for (const p of pipes) {
      p.setOutlet(NullSink);
    }
    signal(pipe, { type: `closed`, ch: `pipe` })
  }

  resetValues();

  for (const [ index, p ] of pipes.entries()) {
    p.setOutlet(value => {
      switch (overwritePolicy) {
        case `first`: {
          if (results[ index ] !== undefined) {
            results[ index ] = value;
          }
          break;
        }
        case `latest`: {
          results[ index ] = value;
        }
      }
      checkCompletion();
    });
  }
  return pipe;
}

export async function asPromise<V>(p: PipeReadable<V>): Promise<V> {
  if (isFinitePipe(p) && p.isClosed()) throw new Error(`Finite pipe has closed`);

  let resolveP: (value: V) => unknown;
  let _rejectP: (reason?: any) => unknown;
  const initPromise = () => {
    const p = new Promise<V>((resolveParameter, rejectParameter) => {
      resolveP = resolveParameter;
      _rejectP = rejectParameter;
    });
    return p;
  }

  const promise = initPromise();

  p.setOutlet((value, _signal) => {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    // if (signal && signal.ch === `pipe` && signal.type === `closed`) {
    //   _rejectP(`Received closed signal`);
    //   return;
    // }
    resolveP(value);
  });
  return promise;
}

export type SetOutletOptions = {
  /**
   * If true, the last value of the pipe (if available) is sent to the outlet when connected.
   */
  prime?: boolean
}

export type BidiOptions<V> = {
  initialValue?: V
  primeOutlet?: boolean
}

export const bidi = <V>(opts: BidiOptions<V> = {}): PipeBidi<V> => {
  const primeOutlet = opts.primeOutlet ?? false;
  let currentOutlet: ((value: V, signal?: PipeSignal) => unknown) | undefined;
  let last: V | undefined = opts.initialValue;
  let closed = false;

  const inlet = (value: V, signal?: PipeSignal) => {
    //console.log(`bidi.inlet: ${ value }`);
    last = value;

    if (signal) {
      // eslint-disable-next-line unicorn/no-lonely-if, @typescript-eslint/no-unnecessary-condition
      if (signal.ch === `pipe` && signal.type === `closed`) {
        closed = true;
      }
    }

    if (currentOutlet) {
      currentOutlet(value, signal);
    }
  }

  const isClosed = () => {
    return closed;
  }

  const setOutlet = (callback: OutletCallback<V> | PipeWriteable<V>, setOpts: SetOutletOptions = {}) => {
    if (closed) throw new Error(`Pipe is closed`);
    currentOutlet = (typeof callback === `function`) ? callback : callback.inlet;
    if (last && (primeOutlet || setOpts.prime)) {
      currentOutlet(last);
    }
  }

  return { getOutlet: () => currentOutlet, inlet, setOutlet, last: () => last, isClosed };
}

export const number = (initialValue: NumberPipeOrNumber): NumberPipe => {
  return typeof initialValue === `number` ? bidi({ initialValue, primeOutlet: true }) : initialValue;
}

export type NumberPipe = PipeBidi<number>;
export type NumberPipeOrNumber = NumberPipe | number;


export const slidingWindow = <V>(p: PipeReadable<V>, length: NumberPipeOrNumber): PipeReadable<Array<V>> => {
  const pipe = bidi<Array<V>>();
  let buffer: Array<V> = [];
  const lengthValue = number(length);

  p.setOutlet(value => {
    buffer.push(value);
    if (buffer.length > (lengthValue.last() ?? 0)) {
      buffer = buffer.slice(1);
    }
    pipe.inlet(buffer);
  });
  return pipe;
}

export type CapOptions = {
  length: number
  keepOpen?: boolean
}

/**
 * Only allow a certain number of items from source through
 * 
 * eg. let through the first five items.
 * 
 * By default, output pipe will close when cap is reached.
 * Signals with no values do not count towards cap, but are sent to output.
 * @param p 
 * @param options 
 * @returns 
 */
export const cap = <V>(p: PipeReadable<V>, options: CapOptions): PipeReadable<V> => {
  let count = 0;
  const length = options.length;
  const keepOpen = options.keepOpen ?? false;
  const pipe = bidi<V>();

  const stop = () => {
    if (keepOpen) return;
    signal(pipe, { ch: `pipe`, type: `closed` });
    p.setOutlet(NullSink);
  }

  p.setOutlet((value, signal) => {
    if (value === undefined) {
      // Signal
      pipe.inlet(value, signal);
    } else {
      pipe.inlet(value, signal);
      count++;
    }
    if (count >= length) {
      stop();
    }
  });
  return pipe;
}

/**
 * Passes every value from `p` through `monitorFunction`. Values continue through
 * to returned output pipe.
 * @param p 
 * @param monitorFunction 
 * @param initialState 
 * @returns 
 */
export const monitor = <V, State>(p: PipeReadable<V>, monitorFunction: (value: V, state: State) => State, initialState: State) => {
  const pipe = bidi<V>();
  let state = initialState;
  p.setOutlet(value => {
    state = monitorFunction(value, state);
    pipe.inlet(value);
  })
  return pipe;
}

export const transform = <InputType, OutputType>(p: PipeReadable<InputType> | PipeBidi<InputType>, transform: (v: InputType) => OutputType): PipeReadable<OutputType> | PipeBidi<OutputType> => {
  const pipe = bidi<OutputType>();
  p.setOutlet(value => {
    pipe.inlet(transform(value));
  });
  return pipe;
}

const isClosedSignal = (value: any, signal?: PipeSignal): boolean => {
  if (signal === undefined) return false;
  if (value !== undefined) return false;
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  return (signal.ch === `pipe` && signal.type === `closed`)
}
/**
 * Streams values from `p` where `filterPredicate` returns true
 * @param p 
 * @param filterPredicate 
 * @returns 
 */
export const filter = <V>(p: PipeReadable<V>, filterPredicate: (v: V) => boolean): PipeReadable<V> => {
  const pipe = bidi<V>();
  p.setOutlet((value, signal) => {
    //console.log(`filter: ${ value } signal: ${ JSON.stringify(signal) }`);
    if (isClosedSignal(value, signal)) {
      pipe.inlet(value, signal);
      return;
    }
    if (filterPredicate(value)) {
      pipe.inlet(value, signal)
    }
  });
  return pipe;
}

/**
 * Splits `p` into two pipes. `a` is when `filterPredicate` returns true, `b` is false.
 * @param p 
 * @param filterPredicate 
 * @returns 
 */
export const filterAB = <V>(p: PipeReadable<V>, filterPredicate: (v: V) => boolean): [ a: PipeReadable<V>, b: PipeReadable<V> ] => {
  const pipeA = bidi<V>();
  const pipeB = bidi<V>();
  p.setOutlet((value, signal) => {
    if (isClosedSignal(value, signal)) {
      pipeA.inlet(value, signal);
      pipeB.inlet(value, signal);
      return;
    }
    if (filterPredicate(value)) {
      pipeA.inlet(value)
    } else {
      pipeB.inlet(value);
    }
  });
  return [ pipeA, pipeB ];
}

/**
 * All values from `p` are sent to `seenPipe`.
 * If a value matches `filterPredicate`, it is also sent to `seenPipe`.
 * 
 * @param p 
 * @param filterPredicate 
 * @returns 
 */
export const splitFilter = <V>(p: PipeReadable<V>, filterPredicate: (v: V) => boolean) => {
  const seenPipe = bidi<V>();
  const regularPipe = bidi<V>();

  p.setOutlet(value => {
    if (filterPredicate(value)) {
      seenPipe.inlet(value);
    }
    regularPipe.inlet(value);
  });
  return [ seenPipe, regularPipe ];
}

export const reduce = <V>(p: PipeReadable<Array<V>>, reducer: (inputValues: Array<V>) => V): PipeReadable<V> => {
  const pipe = bidi<V>();
  p.setOutlet(values => {
    pipe.inlet(reducer(values));
  });
  return pipe;
}

export type ReadGeneratorOptions = {
  keepOpen?: boolean
}

/**
 * Returns a pipe from an async iterable
 * @param iterable 
 * @param options 
 * @returns 
 */
export const readAsyncGenerator = <V>(pipe: PipeWriteable<V>, generator: AsyncGenerator<V>, options: ReadGeneratorOptions = {}) => {
  const keepOpen = options.keepOpen ?? false;

  const done = () => {
    if (keepOpen) return;
    signal(pipe, { ch: `pipe`, type: `closed` });
  }
  const watchAsync = () => {
    generator.next().then((value) => {
      pipe.inlet(value.value);
      if (value.done) {
        done();
      } else {
        setTimeout(() => { watchAsync() }, 1);
      }
    }, (error) => {
      signal(pipe, { ch: `pipe`, type: `error`, message: `Async iterable cancelled ${ error }` });
      done();
    });
  }

  setTimeout(() => { watchAsync() }, 1);
}

export const readGenerator = <V>(pipe: PipeWriteable<V>, generator: Generator<V> | Iterable<V>, options: ReadGeneratorOptions = {}) => {
  const keepOpen = options.keepOpen ?? false;
  for (const v of generator) {
    pipe.inlet(v);
  }
  if (!keepOpen) {
    signal(pipe, { type: `closed`, ch: `pipe` });
  }
}

export type ReadArrayOptions = {
  interval?: Interval
  keepOpen?: boolean
  startIndex?: number
  moveBy?: number
}

export type ReadMapOptions = {
  interval?: Interval
  keepOpen?: boolean
  maximumValues?: number
}

export const readMap = <K, V>(pipe: PipeWriteable<[ K, V ]>, map: Map<K, V>, options: ReadMapOptions = {}) => {
  const iterator = map.entries();
  const ms = intervalToMs(options.interval, 0);
  const keepOpen = options.keepOpen ?? false;
  const maximumValues = options.maximumValues ?? Number.MAX_SAFE_INTEGER;
  let count = 0;

  const done = () => {
    if (keepOpen) return;
    signal(pipe, { type: `closed`, ch: `pipe` });
  }

  const read = () => {
    if (count >= maximumValues) {
      done();
      return;
    }
    const n = iterator.next();
    if (n.done) {
      done();
      return;
    } else {
      pipe.inlet(n.value);
      count++;
    }
    setTimeout(read, ms);
  }
  setTimeout(read, ms);
}

/**
 * Feed content of `values` into `pipe`
 * 
 * Default options:
 * - interval: 0  - send data quickly
 * - keepOpen: false - closes pipe when array is done
 * - startIndex: 0 - start at beginning of array
 * - moveBy: 1  - move by 1 through array
 * @param pipe 
 * @param values 
 * @param options 
 */
export const readArray = <V>(pipe: PipeWriteable<V>, values: Array<V>, options: ReadArrayOptions = {}) => {
  const interval = options.interval ?? 0;
  const keepOpen = options.keepOpen ?? false;
  const startIndex = options.startIndex ?? 0;
  const moveBy = options.moveBy ?? 1;
  const ms = intervalToMs(interval);

  let index = startIndex;

  const run = () => {
    const value = values.at(index);
    index += moveBy;
    if (value === undefined && !keepOpen) {
      signal(pipe, { ch: `pipe`, type: `closed` });
      return;
    } else if (value !== undefined) {
      pipe.inlet(value);
    }
    setTimeout(run, ms)
  }

  setTimeout(run, ms);
}

/**
 * Feeds a variety of data into `pipe`.
 * Supports: arrays, maps, iterables/generators and async versions
 * @param pipe 
 * @param values 
 */
// export function toInlet<V>(pipe: PipeWriteable<V> | PipeWriteable<[ any, V ]>, values: Map<any, V> | Array<V> | Iterable<V> | Generator<V> | AsyncGenerator<V>) {
//   if (Array.isArray(values)) arrayToInlet(pipe as PipeWriteable<V>, values);
//   else if (isMap(values)) mapToInlet(pipe as PipeWriteable<[ any, V ]>, values);
//   else if (isIterable(values)) generatorToInlet(pipe as PipeWriteable<V>, values);
//   else if (isAsyncIterable(values)) generatorAsyncToInlet(pipe as PipeWriteable<V>, values);
// }

/**
 * Creates a pipe, reading `values` into it
 * @param values 
 * @returns 
 */
// export function from<V>(values: Map<any, V> | Array<V> | Iterable<V> | Generator<V> | AsyncGenerator<V>):PipeReadable<V> {
//   const pipe = bidi<V>();
//   toInlet(pipe, values);
//   return pipe;
// }

export const fromArray = <V>(values: Array<V>, options: ReadArrayOptions = {}): PipeReadable<V> => {
  const pipe = bidi<V>();
  readArray(pipe, values, options);
  return pipe;
}

export type AsArrayOptions = {
  maximumValues?: number
}
/**
 * Gather output of readable pipe into an array. Must use await
 * ```js
 * const array = await asArray(pipe);
 * ```
 * 
 * Options:
 * - maximumValues: by default returns all values. Set a value to return early.
 * @param pipe 
 * @returns 
 */
export const asArray = async <V>(pipe: PipeReadable<V>, options: AsArrayOptions = {}): Promise<Array<V>> => {
  const returnArray: Array<V> = [];
  const maximumValues = options.maximumValues ?? Number.MAX_SAFE_INTEGER;

  for await (const v of asAsyncIterable(pipe)) {
    if (returnArray.length >= maximumValues) break;
    returnArray.push(v);
  }
  return returnArray;
}

export const fromCallback = <ResultValue, EventArguments>(computeValue: (data: EventArguments) => ResultValue): [ pipe: PipeReadable<ResultValue>, listener: (args: EventArguments) => unknown ] => {
  const pipe = bidi<ResultValue>();
  const listener = (args: EventArguments) => {
    pipe.inlet(computeValue(args));
  }
  return [ pipe, listener ];
}

export const fromTrigger = <ResultValue>(computeValue: () => ResultValue, opts: BidiOptions<ResultValue> = {}): [ pipe: PipeReadable<ResultValue>, listener: () => unknown ] => {
  const pipe = bidi<ResultValue>(opts);
  const listener = () => {
    pipe.inlet(computeValue());
  }

  if (opts.primeOutlet) listener();
  return [ pipe, listener ];
}

export const minMaxAvg = (p: PipeReadable<number>): PipeReadable<{ min: number, max: number, avg: number }> => {
  const pipe = bidi<{ min: number, max: number, avg: number }>();
  let min = Number.MAX_SAFE_INTEGER;
  let max = Number.MIN_SAFE_INTEGER;
  let avg = Number.NaN;
  let total = 0;
  let count = 1;

  p.setOutlet(value => {
    if (value > max) max = value;
    if (value < min) min = value;
    total += value;
    count++;
    avg = total / count;
    pipe.inlet({ min, max, avg });
  });
  return pipe;
}

export const averageNumbers = (p: PipeReadable<Array<number>>) => reduce(p, inputValues => NumericArrayAverage(inputValues));

/**
 * Join all the input pipes into one new output pipe.
 * 
 * If all input pipes close, output pipe also closes.
 * @param inputPipes 
 * @returns 
 */
export const fromPipes = (...inputPipes: Array<PipeReadable<any>>) => {
  const b = bidi<any>();
  readPipes(b, inputPipes);
  // for (const input of inputPipes) {
  //   input.setOutlet(value => {
  //     b.inlet(value);
  //   })
  // }
  return b;
}

export type ReadPipesOptions = {
  close?: `any` | `all` | `never`
}

/**
 * Read values from `sourcePipes` to `destinationPipe`.
 * 
 * By default closes destination if all sources close.
 * 
 * Close policies
 * - any: if any source pipe closes, destination closes and all other reading stops
 * - all: destination closes when all source pipes close
 * - never: close signals are filtered
 * @param destinationPipe 
 * @param sourcePipes 
 * @param options 
 */
export const readPipes = <V>(destinationPipe: PipeWriteable<V>, sourcePipes: Array<PipeReadable<V>>, options: ReadPipesOptions = {}) => {
  const closePolicy = options.close ?? `all`;
  sourcePipes = [ ...sourcePipes ];
  let closedCount = 0;

  const close = () => {
    for (const source of sourcePipes) {
      source.setOutlet(NullSink);
    }
    signal(destinationPipe, { ch: `pipe`, type: `closed` });
  }

  for (const source of sourcePipes) {
    source.setOutlet((value, signal) => {
      if (isClosedSignal(value, signal)) {
        switch (closePolicy) {
          case `all`: {
            closedCount++;
            source.setOutlet(NullSink); // Make sure we don't get any more messages from this source
            if (closedCount >= sourcePipes.length) {
              close();
            }
            return;
          }
          case `any`: {
            close();
            return;
          }
          case `never`: {
            return;
          } /** no-op */
        }
      }
      destinationPipe.inlet(value, signal);
    })
  }
}

export type SplitOptions = {
  copies?: number
  filterSignals?: boolean
}

/**
 * Splits output of `source` into n number of streams. By default two
 * copies are made, thus splitting
 * 
 * Each output of `source` is copied to destination stream(s).
 * 
 * If `numberCopies` is 1, the source pipe is returned.
 * @param source 
 * @returns 
 */
export const split = <V>(source: PipeReadable<V>, options: SplitOptions = {}): Array<PipeReadable<V>> => {
  const numberOfCopies = options.copies ?? 2;
  const filterSignals = options.filterSignals ?? false;

  const copies: Array<PipeBidi<V>> = [];
  for (const _ of count(numberOfCopies)) {
    copies.push(bidi<V>());
  }

  const split: OutletCallback<V> = (v: V, signal?: PipeSignal) => {
    for (const copy of copies) {
      if (filterSignals) {
        if (v !== undefined) {
          copy.inlet(v);
        }
      } else {
        copy.inlet(v, signal);
      }
    }
  }
  source.setOutlet(split);
  return [ ...copies ];
}

export type MergeValuesOptions = {
  allowUndefinedValues?: boolean
}

/**
 * A change in any of the inputs produces a new input
 * @param pipes 
 * @returns 
 */
export const mergeValues = <InputValue, OutputValue>(merger: (...values: Array<InputValue | undefined>) => OutputValue, opts: MergeValuesOptions, ...pipes: Array<PipeReadable<InputValue>>): PipeReadable<OutputValue> => {
  const pipe = bidi<OutputValue>();
  const values: Array<InputValue | undefined> = [];
  const allowUndefinedValues = opts.allowUndefinedValues ?? false;
  let undefinedExists = true;

  const compute = () => {
    if (undefinedExists) {
      // eslint-disable-next-line unicorn/no-lonely-if
      if (!values.includes(undefined)) {
        undefinedExists = false;
      }
    }
    if (!allowUndefinedValues && undefinedExists) return;

    const mergedValue = merger(...values);
    pipe.inlet(mergedValue);
  }

  for (const [ index ] of pipes.entries()) {
    values[ index ] = undefined;
  }

  for (const [ index, pipe ] of pipes.entries()) {
    // Gather values together in array when they change
    pipe.setOutlet(value => {
      values[ index ] = value;
      compute();
    });
  }

  return pipe;
}

export const throttle = (p: PipeReadable<any>, rateMs: number, bidiOpts: SetOutletOptions & BidiOptions<any> = {}): PipeReadable<any> => {
  const pipe = bidi(bidiOpts);
  let lastFire = 0;
  let timer = 0;
  let latestValue: unknown;

  const trigger = () => {
    const elapsed = performance.now() - lastFire;
    // Long enough time since last triggered
    if (elapsed > rateMs) {
      lastFire = performance.now();
      pipe.inlet(latestValue);
      window.clearTimeout(timer);
      return;
    }

    // Otherwise, schedule to trigger in future
    clearTimeout(timer);
    timer = window.setTimeout(trigger, rateMs - elapsed);
  }

  p.setOutlet(value => {
    latestValue = value;
    trigger();
  }, bidiOpts);

  return pipe
}

export type RxWindowOptions = {
  throttle?: Interval
}

export const asBasic = <V>(p: PipeBidi<V>) => {
  const t = {
    get value(): V | undefined {
      return p.last();
    },
    set value(value: V) {
      p.inlet(value);
    },
    on(callback: (value: V) => unknown) {
      p.setOutlet(callback);
    }
  }
  return t;
}

export const rxWindow = (opts: RxWindowOptions = {}) => {
  const throttleMs = intervalToMs(opts.throttle, 50);

  const [ onResizePipe, onResizeListener ] = fromTrigger(() => {
    return { width: window.innerWidth, height: window.innerHeight }
  }, { primeOutlet: true });
  window.addEventListener(`resize`, onResizeListener);

  const resize = throttle(onResizePipe, throttleMs, { primeOutlet: true, prime: true });
  const dispose = () => {
    window.removeEventListener(`resize`, onResizeListener);
  }

  return {
    size: resize.setOutlet,
    dispose
  }
}

/**
 * 
 *  const dataStream = new DataStream();
 *  dataStream.in({ key: `x`, value: 0.5 }); 
 *  const label = (obj:any) => {
 *    if (`key` in obj) return obj;
 *    return { key: randomKey(), ...obj }
 *  }
 *  const stream = pipeline(dataStream, label);
 *  // Actively compute size of window based on window width
 *  const windowSize = ops.divide(rxWindow.innerWidth, pointSize);
 *  const dataWindow = window(stream, windowSize);
 *  const dataToPoints = (value);
 * 
 *  const drawPlot = (dataWindow) => {
 *    for (const dataPoint in dataWindow) {
 *    }
 *  }
 */

/**
 * Connects `source` to `receiver`
 * @param input 
 * @param output 
 */
export const connect = <V>(source: PipeReadable<V>, receiver: PipeWriteable<V>) => {
  source.setOutlet(value => {
    receiver.inlet(value);
  })
}

export const wrapBidi = <V>(p: PipeBidi<V>) => {
  return {
    transform: <OutputType>(transformFunction: (value: V) => OutputType) => {
      return wrapBidi<OutputType>(transform(p, transformFunction) as PipeBidi<OutputType>);
    },
    inlet: (v: V) => {
      p.inlet(v);
      return wrapBidi(p);
    },
    monitor: <State>(monitorFunction: (value: V) => State, initialState: State) => {
      return wrapBidi(monitor(p, monitorFunction, initialState));
    },
    connect: (output: PipeWriteable<V>) => {
      connect(p, output);
      return output;
    },
    split: (options: SplitOptions) => {
      return split(p, options).map(b => wrapBidi(b as PipeBidi<V>));
    },
    slidingWindow: (length: NumberPipeOrNumber) => {
      return wrapBidi(slidingWindow(p, length) as PipeBidi<Array<V>>);
    }
  }
}


export const bidiWrapped = <V>() => wrapBidi<V>(bidi<V>());

