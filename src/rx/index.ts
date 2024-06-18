/* eslint-disable @typescript-eslint/unbound-method */
//#region imports
import type { Reactive, ReactiveOrSource, ReactiveWritable, ReactiveOp, InitStreamOptions, WithValueOptions, CombineLatestOptions, RxValueTypes, RxValueTypeObject, PipeSet } from "./Types.js";
import { messageHasValue, messageIsDoneSignal, opify } from "./Util.js";
import * as OpFns from './ops/index.js';
import { initStream } from "./InitStream.js";
import { type Interval, intervalToMs } from '../flow/IntervalType.js';
import { resolveSource } from './ResolveSource.js';
import type { BatchOptions, DebounceOptions, FieldOptions, SingleFromArrayOptions, SplitOptions, FilterPredicate, SwitcherOptions, SyncOptions, ThrottleOptions } from "./ops/Types.js";
import type { TimeoutTriggerOptions } from "./sources/Types.js";
import * as SinkFns from './sinks/index.js';
import type { RankFunction, RankOptions } from "src/data/BasicProcessors.js";
export * from './Chain.js';

//#endregion

//#region exports
export * from './ops/index.js';
export * from './sinks/index.js';
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
    dispose: events.dispose,
    isDisposed: events.isDisposed,
    set(value: V) {
      events.set(value);
    },
    on: events.on,
    onValue: events.onValue
  };
}

export const Sinks = {
  setHtmlText: (options: SinkFns.SetHtmlOptions) => {
    return (source: ReactiveOrSource<string>) => {
      SinkFns.setHtmlText(source, options);
    }
  }
}

export const Ops = {
  /**
 * Annotates values with the result of a function.
 * The input value needs to be an object.
 * 
 * For every value `input` emits, run it through `annotator`, which should
 * return the original value with additional fields.
 * 
 * Conceptually the same as `transform`, just with typing to enforce result
 * values are V & TAnnotation
 * @param annotator 
 * @returns 
 */
  annotate: <V, TAnnotation>(annotator: (input: V) => V & TAnnotation) => opify(OpFns.annotate, annotator),
  /**
   * Annotates the input stream using {@link ReactiveOp} as the source of annotations.
   * The output values will have the shape of `{ value: TIn, annotation: TAnnotation }`.
   * Meaning that the original value is stored under `.value`, and the annotation under `.annotation`.
   * 
   * ```js
   * // Emit values from an array
   * const r1 = Rx.run(
   *  Rx.From.array([ 1, 2, 3 ]),
   *  Rx.Ops.annotateWithOp(
   *    // Add the 'max' operator to emit the largest-seen value
   *    Rx.Ops.sum()
   *  )
   * );
   * const data = await Rx.toArray(r1);
   * // Data =  [ { value: 1, annotation: 1 }, { value: 2, annotation: 3 }, { value: 3, annotation: 6 } ]
   * ```
   * @param annotatorOp 
   * @returns 
   */
  annotateWithOp: <TIn, TAnnotation>(annotatorOp: ReactiveOp<TIn, TAnnotation>) => opify(OpFns.annotateWithOp, annotatorOp),
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
  elapsed: <V>(): ReactiveOp<V, number> => opify(OpFns.elapsed),
  /**
   * Yields the value of a field from an input stream of values.
   * Eg if the source reactive emits `{ colour: string, size: number }`,
   * we might use `field` to pluck out the `colour` field, thus returning
   * a stream of string values.
   * @param fieldName 
   * @param options 
   * @returns 
   */
  field: <TSource extends object, TFieldType>(fieldName: keyof TSource, options: FieldOptions<TSource, TFieldType>) => {
    return (source: ReactiveOrSource<TSource>) => {
      return OpFns.field(source, fieldName, options);
    }
  },
  /**
   * Filters the input stream, only re-emitting values that pass the predicate
   * @param predicate 
   * @returns 
   */
  filter: <V>(predicate: (value: V) => boolean) => opify(OpFns.filter, predicate),
  /**
 * Outputs the minimum numerical value of the stream.
 * A value is only emitted when minimum decreases.
 * @returns 
 */
  min: <TIn = number>(options?: OpFns.OpMathOptions) => opify<TIn, number>(OpFns.min, options),
  /**
   * Outputs the maxium numerical value of the stream.
   * A value is only emitted when maximum increases.
   * @returns 
   */
  max: <TIn = number>(options?: OpFns.OpMathOptions) => opify<TIn, number>(OpFns.max, options),
  sum: <TIn = number>(options?: OpFns.OpMathOptions) => opify<TIn, number>(OpFns.sum, options),
  average: <TIn = number>(options?: OpFns.OpMathOptions) => opify<TIn, number>(OpFns.average, options),
  tally: <TIn>(options?: OpFns.TallyOptions) => opify<TIn, number>(OpFns.tally, options),
  rank: <TIn>(rank: RankFunction<TIn>, options?: RankOptions & OpFns.OpMathOptions) => opify<TIn>(OpFns.rank, rank, options),

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
  tapProcess: <In>(processor: ((value: In) => any)): ReactiveOp<In, In> => {
    return (source: ReactiveOrSource<In>) => {
      return OpFns.tapProcess(source, processor);
    }
  },
  tapStream: <In>(divergedStream: ReactiveWritable<In>): ReactiveOp<In, In> => {
    return (source: ReactiveOrSource<In>) => {
      return OpFns.tapStream(source, divergedStream);
    }
  },
  tapOps: <In, Out>(...ops: Array<ReactiveOp<In, Out>>) => {
    return (source: ReactiveOrSource<In>) => {
      return OpFns.tapOps(source, ...ops);
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
  transform: <In, Out>(transformer: ((value: In) => Out), options: Partial<OpFns.TransformOpts> = {}): ReactiveOp<In, Out> => {
    return (source: ReactiveOrSource<In>) => {
      return OpFns.transform(source, transformer, options);
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
// export const chain = <TIn, TOut>(...ops: Array<ReactiveOp<TIn, TOut>>) => {
//   return (source: ReactiveOrSource<TIn>) => {
//     for (const op of ops) {
//       // @ts-expect-error
//       source = op(source);
//     }
//     return source as any as Reactive<TOut>;
//   }
// }

// export const chainStream = <TIn, TOut>(...ops: Array<ReactiveOp<TIn, TOut>>): ReactiveStream<TIn, TOut> => {
//   const stream = manual<TIn>();
//   const c = chain(...ops);
//   const x = c(stream);
//   return x;
// }



// function chainx<TIn, TOut>(...ops: Array<ReactiveOp<any, any>>) {
//   return (source: ReactiveOrSource<TIn>) => {
//     for (const op of ops) {
//       source = op(source);
//     }
//     return source as any as Reactive<TOut>;
//   }
// }

export function cache<T>(r: Reactive<T>, initialValue: T) {
  let lastValue: T = initialValue;
  r.onValue(value => {
    lastValue = value;
  });
  return {
    ...r,
    last() {
      return lastValue
    },
    reset() {
      // @ts-expect-error
      lastValue = undefined;
    }
  }
}

// export function runWithInitial<TIn, TOut>(initial: TOut, source: ReactiveOrSource<TIn>, ...ops: Array<ReactiveOp<any, any>>): ReactiveInitial<TOut> & ReactiveDisposable<TOut> {
//   let lastValue = initial;
//   const raw = prepareOps<TIn, TOut>(...ops);
//   const r = raw(source);
//   let disposed = false;

//   r.onValue(value => {
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
        b.dispose(`Source closed (${ message.context ?? `` })`);
      }
    } else {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      console.warn(`Unsupported message: ${ JSON.stringify(message) }`);
    }

  });
  return unsub;
}