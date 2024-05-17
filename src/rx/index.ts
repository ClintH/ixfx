/* eslint-disable @typescript-eslint/unbound-method */
//#region imports
import type { Reactive, ReactiveOrSource, ReactiveWritable, ReactiveOp, InitStreamOptions, WithValueOptions, CombineLatestOptions, RxValueTypes, RxValueTypeObject, PipeSet, ReactiveInitial, ReactiveDisposable } from "./Types.js";

import { isDisposable, messageHasValue, messageIsDoneSignal, opify } from "./Util.js";
import * as OpFns from './ops/index.js';
import { initStream } from "./InitStream.js";
import { type Interval, intervalToMs } from '../flow/IntervalType.js';
import { resolveSource } from './ResolveSource.js';
import type { BatchOptions, DebounceOptions, FieldOptions, SingleFromArrayOptions, SplitOptions, FilterPredicate, SwitcherOptions, SyncOptions, ThrottleOptions } from "./ops/Types.js";
import type { TimeoutTriggerOptions } from "./sources/Types.js";
//#endregion

//#region exports
export * from './ops/index.js';
export * from './Graph.js';
export * from './Types.js';
export * from './ToArray.js';
export * from './ToGenerator.js';
export * from './Util.js';
export * from './Wrap.js';
export * from './ResolveSource.js';
export * from './Count.js';
export * as Dom from './Dom.js';
export * as From from './sources/index.js';
//#endregion

/**
 * Initialises a reactive that pipes values to listeners directly.
 * @returns 
 */
export function manual<V>(options: Partial<InitStreamOptions> = {}): Reactive<V> & ReactiveWritable<V> {
  const events = initStream<V>(options);
  return {
    set(value: V) {
      events.set(value);
    },
    on: events.on,
    value: events.value
  };
}

export const Ops = {
  /**
 * Annotates values.
 * 
 * For every value `input` emits, run it through `transformer`, which should
 * return the original value with additional fields.
 * 
 * Conceptually the same as `transform`, just with typing to enforce result
 * values are V & TAnnotation
 * @param transformer 
 * @returns 
 */
  annotate: <V, TAnnotation>(transformer: (input: V) => V & TAnnotation) => opify(OpFns.annotate, transformer),
  /**
   * Annotates all values with the elapsed time since the last value
   * @returns 
   */
  annotateElapsed: <V>() => opify<V>(OpFns.annotateElapsed),

  /**
   * Takes a stream of values and batches them up (by quantity or time elapsed),
   * emitting them as an array.
   * @param options 
   * @returns 
   */
  batch: <V>(options: Partial<BatchOptions>): ReactiveOp<V, Array<V>> => {
    return (source: ReactiveOrSource<V>) => {
      return OpFns.batch(source, options);
    }
  },

  cloneFromFields: <V>(): ReactiveOp<V, V> => {
    return (source: ReactiveOrSource<V>) => {
      return OpFns.cloneFromFields(source);
    }
  },
  /**
 * Merges values from several sources into a single source that emits values as an array.
 * @param options 
 * @returns 
 */
  combineLatestToArray: <const T extends ReadonlyArray<ReactiveOrSource<any>>>(options: Partial<CombineLatestOptions> = {}) => {
    return (sources: T) => {
      return OpFns.combineLatestToArray(sources, options);
    }
  },
  /**
   * Merges values from several sources into a single source that emits values as an object.
   * @param options
   * @returns 
   */
  combineLatestToObject: <const T extends Record<string, ReactiveOrSource<any>>>(options: Partial<CombineLatestOptions> = {}) => {
    return (reactiveSources: T) => {
      return OpFns.combineLatestToObject(reactiveSources, options);
    }
  },
  /**
 * Debounce values from the stream. It will wait until a certain time
 * has elapsed before emitting latest value.
 * 
 * Effect is that no values are emitted if input emits faster than the provided
 * timeout.
 * 
 * See also: throttle
 * @param options 
 * @returns 
 */
  debounce: <V>(options: Partial<DebounceOptions>): ReactiveOp<V, V> => {
    return (source: ReactiveOrSource<V>) => {
      return OpFns.debounce(source, options);
    }
  },
  /**
   * Yields the value of a field from an input stream of values.
   * Eg if the source reactive emits `{ colour: string, size: number }`,
   * we might use `field` to pluck out the `colour` field, thus returning
   * a stream of string values.
   * @param fieldName 
   * @param options 
   * @returns 
   */
  field: <V extends object>(fieldName: keyof V, options: FieldOptions<V>) => {
    return (source: ReactiveOrSource<V>) => {
      return OpFns.field(source, fieldName, options);
    }
  },
  /**
   * Filters the input stream, only re-emitting values that pass the predicate
   * @param predicate 
   * @returns 
   */
  filter: <V>(predicate: (value: V) => boolean) => opify(OpFns.filter, predicate),

  pipe: <TInput, TOutput>(...streams: Array<Reactive<any> & ReactiveWritable<any>>) => {
    return (source: ReactiveOrSource<TInput>) => {
      const resolved = resolveSource(source);
      const s = [ resolved, ...streams ] as PipeSet<TInput, TOutput>;
      return OpFns.pipe(...s);
    }
  },

  singleFromArray: <V>(options: Partial<SingleFromArrayOptions<V>> = {}) => {
    return (source: ReactiveOrSource<Array<V>>) => {
      return OpFns.singleFromArray(source, options)
    }
  },

  split: <V>(options: Partial<SplitOptions> = {}) => {
    return (source: ReactiveOrSource<V>) => {
      return OpFns.split(source, options);
    }
  },
  splitLabelled: <V>(labels: Array<string>) => {
    return (source: ReactiveOrSource<V>) => {
      return OpFns.splitLabelled(source, labels);
    }
  },
  switcher: <TValue, TRec extends Record<string, FilterPredicate<TValue>>, TLabel extends keyof TRec>(cases: TRec, options: Partial<SwitcherOptions> = {}) => {
    return (source: ReactiveOrSource<TValue>): Record<TLabel, Reactive<TValue>> => {
      return OpFns.switcher(source, cases, options);
    }
  },
  syncToArray: <const T extends ReadonlyArray<ReactiveOrSource<any>>>(options: Partial<SyncOptions> = {}) => {
    return (reactiveSources: T): Reactive<RxValueTypes<T>> => {
      return OpFns.syncToArray(reactiveSources, options);
    }
  },
  syncToObject: <const T extends Record<string, ReactiveOrSource<any>>>(options: Partial<SyncOptions> = {}) => {
    return (reactiveSources: T): Reactive<RxValueTypeObject<T>> => {
      return OpFns.syncToObject(reactiveSources, options);
    }
  },
  /**
 * Throttle values from the stream.
 * Only emits a value if some minimum time has elapsed.
 * @param options 
 * @returns 
 */
  throttle: <V>(options: Partial<ThrottleOptions>) => opify<V>(OpFns.throttle, options),
  /**
   * Trigger a value if 'source' does not emit a value within an interval.
   * Trigger value can be a fixed value, result of function, or step through an iterator.
   * @param options 
   * @returns 
   */
  timeoutTrigger: <V, TTriggerValue>(options: TimeoutTriggerOptions<TTriggerValue>) => {
    return (source: ReactiveOrSource<V>) => {
      return OpFns.timeoutTrigger<V, TTriggerValue>(source, options);
    }
  },
  transform: <In, Out>(transformer: ((value: In) => Out)): ReactiveOp<In, Out> => {
    return (source: ReactiveOrSource<In>) => {
      return OpFns.transform(source, transformer);
    }
  },

  /**
  * Reactive where last (or a given initial) value is available to read
  * @param opts 
  * @returns 
  */
  withValue: <V>(opts: Partial<WithValueOptions<V>>): ReactiveOp<V, V> => {
    return opify<V>(OpFns.withValue, opts);
  },
} as const;

/**
 * Connects `ops` together, ready for a source.
 * Returns a function that takes a `source`.
 * @param ops 
 * @returns 
 */
const prepareOps = <TIn, TOut>(...ops: Array<ReactiveOp<TIn, TOut>>) => {
  return (source: ReactiveOrSource<TIn>) => {
    for (const op of ops) {
      // @ts-expect-error
      source = op(source);
    }
    return source as any as Reactive<TOut>;
  }
}


/**
 * Connects `source` to serially-connected set of ops. Values thus
 * flow from `source` to each op in turn.
 * 
 * Returned result is the final reactive.
 * 
 * @param source 
 * @param ops 
 * @returns 
 */
export function run<TIn, TOut>(source: ReactiveOrSource<TIn>, ...ops: Array<ReactiveOp<any, any>>) {
  const raw = prepareOps<TIn, TOut>(...ops);
  return raw(source);
}

export function cache<T>(r: Reactive<T>, initialValue: T) {
  let lastValue: T | undefined = initialValue;
  r.value(value => {
    lastValue = value;
  });
  return {
    ...r,
    last() {
      return lastValue
    },
    reset() {
      lastValue = undefined;
    }
  }

}

// export function runWithInitial<TIn, TOut>(initial: TOut, source: ReactiveOrSource<TIn>, ...ops: Array<ReactiveOp<any, any>>): ReactiveInitial<TOut> & ReactiveDisposable<TOut> {
//   let lastValue = initial;
//   const raw = prepareOps<TIn, TOut>(...ops);
//   const r = raw(source);
//   let disposed = false;

//   r.value(value => {
//     lastValue = value;
//   });

//   return {
//     ...r,
//     isDisposed() {
//       return disposed
//     },
//     dispose(reason) {
//       if (disposed) return;
//       if (isDisposable(r)) {
//         r.dispose(reason);
//       }
//       disposed = true;
//     },
//     last() {
//       return lastValue;
//     },
//   }
// }

/**
 * Grabs the next value emitted from `source`.
 * By default waits up to a maximum of one second.
 * Handles subscribing and unsubscribing.
 * 
 * ```js
 * const value = await Rx.takeNextValue(source);
 * ```
 * 
 * Throws an error if the source closes without
 * a value or the timeout is reached.
 * 
 * @param source 
 * @param maximumWait 
 * @returns 
 */
export async function takeNextValue<V>(source: ReactiveOrSource<V>, maximumWait: Interval = 1000): Promise<V> {
  const rx = resolveSource(source);
  let off = () => {/** no-op */ };
  let watchdog: ReturnType<typeof globalThis.setTimeout> | undefined;

  const p = new Promise<V>((resolve, reject) => {
    off = rx.on(message => {
      if (watchdog) clearTimeout(watchdog);
      if (messageHasValue(message)) {
        off();
        resolve(message.value);
      } else {
        if (messageIsDoneSignal(message)) {
          reject(new Error(`Source closed. ${ message.context ?? `` }`));
          off();
        }
      }
    });

    watchdog = setTimeout(() => {
      watchdog = undefined;
      off();
      reject(new Error(`Timeout waiting for value (${ JSON.stringify(maximumWait) })`))
    }, intervalToMs(maximumWait));
  });
  return p;
}

/**
 * Connects reactive A to B, passing through a transform function.
 * 
 * Returns a function to unsubcribe A->B
 * @param a 
 * @param b 
 * @param transform 
 */
export const to = <TA, TB>(a: Reactive<TA>, b: ReactiveWritable<TB>, transform: (valueA: TA) => TB, closeBonA = false) => {
  const unsub = a.on(message => {
    if (messageHasValue(message)) {
      b.set(transform(message.value));
    } else if (messageIsDoneSignal(message)) {
      unsub();
      if (closeBonA) {
        if (isDisposable<any>(b)) {
          b.dispose(`Source closed (${ message.context ?? `` })`);
        } else {
          console.warn(`Reactive.to cannot close 'b' reactive since it is not disposable`);
        }
      }
    } else {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      console.warn(`Unsupported message: ${ JSON.stringify(message) }`);
    }

  });
  return unsub;
}