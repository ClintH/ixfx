/* eslint-disable @typescript-eslint/unbound-method */
import { type Interval, intervalToMs } from "../flow/IntervalType.js";
import { type Reactive, type ReactiveWritable, messageHasValue, messageIsSignal, isDisposable, initStream, type InitStreamOptions, type ReactiveOrSource, initUpstream, messageIsDoneSignal, type ReactiveDisposable, type Passed, type ReactiveStream, resolveSource, toArray, type ToArrayOptions, toArrayOrThrow } from "./Reactive.js";
import { QueueMutable } from "../collections/index.js";
import { continuously } from "../flow/Continuously.js";
import { isPlainObjectOrPrimitive } from "../Util.js";
import { shuffle } from "../collections/arrays/index.js";
import { timeout } from "../flow/Timeout.js";
import { map as ImmutableMap } from "../Immutable.js";

export type TransformOpts = InitStreamOptions;

export type BatchOptions = InitStreamOptions & {
  /**
   * If _true_ (default) remaining results are yielded
   * if source closes. If _false_, only 'complete' batches are yielded.
   */
  returnRemainder: boolean
  elapsed: Interval
  quantity: number
}

export type FieldOptions<V> = InitStreamOptions & {

  /**
   * If `field` is missing on a value, this value is used in its place.
   * If not set, the value is skipped.
   */
  missingFieldDefault: V
};

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
        if (isDisposable(b)) {
          b.dispose(`Source closed (${ message.context })`);
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

export type SplitOptions = {
  quantity: number
}

/**
 * Creates a set of streams each of which receives data from `source`.
 * By default these are lazy and dispose if the upstream source closes.
 * 
 * See also {@link splitLabelled} to split into named streams.
 * @param source 
 * @param quantity 
 * @returns 
 */
export const split = <T>(options: Partial<SplitOptions> = {}) => {
  const quantity = options.quantity ?? 2;
  return (r: ReactiveOrSource<T>) => {
    const outputs: Array<ReactiveStream<T>> = [];
    const source = resolveSource(r);
    for (let index = 0; index < quantity; index++) {
      outputs.push(initUpstream(source, { disposeIfSourceDone: true, lazy: true }));
    }
    return outputs;
  }
}

/**
 * Splits `source` into several duplicated streams. Returns an object with keys according to `labels`.
 * Each value is a stream which echos the values from `source`.
 * ```js
 * const [a,b,c] = splitLabelled(source, `a`, `b`, `c`);
 * // a, b, c are Reactive types
 * ```
 * 
 * See also {@link split} to get an unlabelled split
 * @param source 
 * @param labels 
 * @returns 
 */
export const splitLabelled = <T, K extends PropertyKey>(...labels: Array<K>) => {
  return (r: ReactiveOrSource<T>): Record<K, Reactive<T>> => {
    const source = resolveSource(r);
    const t: Partial<Record<K, Reactive<T>>> = {}
    for (const label of labels) {
      t[ label ] = initUpstream(source, { lazy: true, disposeIfSourceDone: true });
    }
    return t as Record<K, Reactive<T>>;
  }
}

/**
 * Switcher options.
 * 
 * match (default: 'first')
 * * 'first': Outputs to first case where predicate is _true_
 * * 'all': Outputs to all cases where predicate is _true_
 */
export type SwitcherOptions = {
  match: `first` | `all`
}

/**
 * Switcher generates several output streams, labelled according to the values of `cases`.
 * Values from `source` are fed to the output streams if their associated predicate function returns _true_.
 * 
 * In this way, we can split one input stream into several output streams, each potentially getting a different
 * subset of the input.
 * 
 * With `options`, you can specify whether to send to multiple outputs if several match, or just the first (default behaviour).
 * 
 * The below example shows setting up a switcher and consuming the output streams.
 * @example
 * ```js
 * // Initialise a reactive number, starting at 0
 * const switcherSource = Reactive.number(0);
 * // Set up the switcher
 * const x = Reactive.switcher(switcherSource, {
 *  even: v => v % 2 === 0,
 *  odd: v => v % 2 !== 0
 * });
 * // Listen for outputs from each of the resulting streams
 * x.even.on(msg => {
 *   console.log(`even: ${msg.value}`);
 * });
 * x.odd.on(msg => {
 *   console.log(`odd: ${msg.value}`);
 * })
 * // Set new values to the number source, counting upwards
 * // ...this will in turn trigger the console outputs above
 * setInterval(() => {
 *   switcherSource.set(switcherSource.last() + 1);
 * }, 1000);
 * ```
 * 
 * If `source` closes, all the output streams will be closed as well.
 * @param source 
 * @param cases 
 * @param options 
 * @returns 
 */
export const switcher = <TValue, TRec extends Record<string, FilterPredicate<TValue>>, TLabel extends keyof TRec>(cases: TRec, options: Partial<SwitcherOptions> = {}) => {
  return (r: ReactiveOrSource<TValue>): Record<TLabel, Reactive<TValue>> => {
    const match = options.match ?? `first`;
    const source = resolveSource(r);
    let disposed = false;
    // Setup output streams
    const t: Partial<Record<TLabel, ReactiveStream<TValue>>> = {}
    for (const label of Object.keys(cases)) {
      (t as any)[ label ] = initStream<TValue>();
    }

    const performDispose = () => {
      if (disposed) return;
      unsub();
      disposed = true;
      for (const stream of Object.values(t)) {
        (stream as ReactiveStream<any>).dispose(`switcher source dispose`);
      }
    }

    // Listen to source
    const unsub = source.on(message => {
      // Got a value
      if (messageHasValue(message)) {
        for (const [ lbl, pred ] of Object.entries(cases)) {
          if (pred(message.value)) {
            ((t as any)[ lbl ] as ReactiveStream<TValue>).set(message.value);
            if (match === `first`) break;
          }
        }
      } else if (messageIsDoneSignal(message)) {
        performDispose();
      }
    })
    return t as Record<TLabel, Reactive<TValue>>;
  }
}

export type PipeSet<In, Out> = [
  Reactive<In>,
  ...Array<Reactive<any> & ReactiveWritable<any>>,
  ReactiveWritable<Out> & Reactive<any>
]

/**
 * Pipes the output of one stream into another, in order.
 * The stream returned is a new stream which captures the final output.
 * 
 * If any stream in the pipe closes the whole pipe is closed.
 * @param streams 
 * @returns 
 */
export const pipe = <TInput, TOutput>(...streams: PipeSet<TInput, TOutput>): Reactive<TOutput> & ReactiveDisposable => {
  const event = initStream<TOutput>();
  const unsubs: Array<() => void> = [];
  const performDispose = (reason: string) => {
    for (const s of streams) {
      if (isDisposable(s) && !s.isDisposed) s.dispose(reason);
    }
    for (const s of unsubs) {
      s();
    }
    event.dispose(reason);
  }

  for (let index = 0; index < streams.length; index++) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    unsubs.push(streams[ index ].on((message: Passed<unknown>) => {
      const isLast = index === streams.length - 1;
      if (messageHasValue(message)) {
        if (isLast) {
          // Last stream, send to output
          event.set(message.value as TOutput);
        } else {
          // @ts-expect-error
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call
          streams[ index + 1 ].set(message.value);
        }
      } else if (messageIsDoneSignal(message)) {
        performDispose(`Upstream disposed`);
      }
    }));
  }
  return {
    on: event.on,
    value: event.value,
    dispose(reason) {
      performDispose(reason);
    },
    isDisposed() {
      return event.isDisposed();
    },
  };
}

/**
 * Monitors input reactive values, storing values as they happen to an array.
 * Whenever a new value is emitted, the whole array is sent out, containing current
 * values from each source.
 * 
 * @param values 
 * @returns 
 */
export function mergeAsArray<V>(...values: Array<Reactive<V>>): Reactive<Array<V | undefined>> {
  const event = initStream<Array<V | undefined>>();
  const data: Array<V | undefined> = [];

  for (const [ index, v ] of values.entries()) {
    data[ index ] = undefined;
    v.on(valueChanged => {
      if (!messageIsSignal(valueChanged)) {
        data[ index ] = valueChanged.value;
      }
      event.set(data);
    });
  }

  return {
    on: event.on,
    value: event.value
  }
}

/**
 * Waits for all sources to produce a value, sending the combined results as an array.
 * After sending, it waits again for each source to send a value.
 * 
 * Each source's latest value is returned, in the case of some sources producing results
 * faster than others.
 * 
 * If a value completes, we won't wait for it and the result set gets smaller.
 * 
 */
export function synchronise<V>() {
  return (...sources: Array<ReactiveOrSource<V>>): Reactive<Array<V | undefined>> => {
    const event = initStream<Array<V>>();
    let data: Array<V | undefined> = [];

    for (const [ index, source ] of sources.entries()) {
      data[ index ] = undefined;
      const v = resolveSource(source);
      v.on(valueChanged => {
        if (messageIsSignal(valueChanged)) {
          if (valueChanged.signal === `done`) {
            sources.splice(index, 1);
          }
          return;
        }
        data[ index ] = valueChanged.value;

        if (!data.includes(undefined)) {
          // All array elements contain values
          event.set(data as Array<V>);
          data = [];
        }
      });
    }

    return {
      on: event.on,
      value: event.value
    }
  }
}

export type ResolveOptions = {
  /**
   * How many times to return value or call function.
   * If _infinite_ is set to true, this value is ignored
   */
  loops: number
  /**
   * If _true_ loops forever
   */
  infinite: boolean
  /**
   * Delay before value
   */
  interval: Interval
  /**
   * If _true_, resolution only starts after first subscriber. Looping, if active,
   * stops if there are no subscribers.
   * 
   * _False_ by default.
   * 
   */
  lazy: boolean
}


/**
 * Wraps a function or value as a reactive. Can optionally wait for a given period or continually produce the value.
 * 
 * ```js
 * const rx = resolve('hello', { interval: 5000 });
 * rx.on(msg => {
 *  // 'hello' after 5 seconds
 *  console.log(msg.value);
 * });
 * ```
 * 
 * ```js
 * // Produces a random number every second, but only
 * // when there is a subscriber.
 * const rx = resolve(() => Math.floor(Math.random()*100), { interval: 1000, infinite: true, lazy: true });
 * ```
 * 
 * Options:
 * - Set _loops_ or _infinite_. If neither of these are set, it runs once.
 * - _interval_ is 0 by default.
 * @param callbackOrValue 
 * @param options 
 * @returns 
 */
export function resolve<V>(callbackOrValue: V | (() => V), options: Partial<ResolveOptions> = {}): Reactive<V> {
  const intervalMs = intervalToMs(options.interval, 0);
  const lazy = options.lazy ?? false;
  const event = initStream<V>({
    onFirstSubscribe() {
      if (lazy && c.runState === `idle`) c.start();
    },
    onNoSubscribers() {
      if (lazy) {
        c.cancel();
      }
    }
  });

  const loops = options.infinite ? Number.MAX_SAFE_INTEGER : options.loops ?? 1;
  let remaining = loops;

  const c = continuously(() => {
    if (typeof callbackOrValue === `function`) {
      // eslint-disable-next-line @typescript-eslint/ban-types
      const value = (callbackOrValue as (Function))();
      event.set(value);
    } else {
      event.set(callbackOrValue);
    }
    remaining--;
    if (remaining === 0) return false; // Stop loop
  }, intervalMs);


  if (!lazy) c.start();

  return {
    on: event.on,
    value: event.value
  };
}

/**
 * From a source value, yields a field from it.
 * 
 * If a source value doesn't have that field, it is skipped.

 * @returns 
 */
export function field<TIn, TFieldType>(fieldName: keyof TIn, options: Partial<FieldOptions<TFieldType>> = {}): ReactiveOp<TIn, TFieldType> {
  return (fieldSource: ReactiveOrSource<TIn>): Reactive<TFieldType> => {
    const upstream = initUpstream<TIn, TFieldType>(fieldSource, {
      disposeIfSourceDone: true,
      ...options,
      onValue(value) {
        let t = (value)[ fieldName ];
        if (t === undefined && options.missingFieldDefault !== undefined) {
          // @ts-expect-error
          t = options.missingFieldDefault as TFieldType;
        }
        upstream.set(t as TFieldType);
      },
    })

    return toReadable(upstream);
  }
}

export type FilterPredicate<In> = (value: In) => boolean;

/**
 * Passes all values where `predicate` function returns _true_.
 */
export function filter<In>(predicate: FilterPredicate<In>, options: Partial<InitStreamOptions>): ReactiveOp<In, In> {
  return (input: ReactiveOrSource<In>): Reactive<In> => {
    const upstream = initUpstream<In, In>(input, {
      ...options,
      onValue(value) {
        if (predicate(value)) {
          upstream.set(value);
        }
      },
    })

    return toReadable(upstream);
  }
}

const toReadable = <V>(upstream: ReactiveStream<V>) => ({ on: upstream.on, value: upstream.value });

/**
 * Transforms values from `source` using the `transformer` function.
 * @param transformer 
 * @returns 
 */
export function transform<In, Out>(transformer: (value: In) => Out, options: Partial<TransformOpts> = {}): ReactiveOp<In, Out> {
  return (input: ReactiveOrSource<In>): Reactive<Out> => {
    const upstream = initUpstream<In, Out>(input, {
      ...options,
      onValue(value) {
        const t = transformer(value);
        upstream.set(t);
      },
    })

    return toReadable(upstream);
  }
}


/**
 * Annotates values from `source`, appending new fields to values.
 * Output stream will be the type `In & Out`.
 */
export function annotate<In, TAnnotation>(transformer: (value: In) => In & TAnnotation, options: Partial<TransformOpts> = {}): ReactiveOp<In, In & TAnnotation> {
  return (input: ReactiveOrSource<In>): Reactive<In & TAnnotation> => {
    const upstream = initUpstream<In, In & TAnnotation>(input, {
      ...options,
      onValue(value) {
        const t = transformer(value);
        upstream.set(t);
      },
    })

    return toReadable(upstream);
  }
}

export type AnnotationElapsed = {
  elapsedMs: number
}

/**
 * Annotates values from `source`, adding a `elapsedMs` field to values.
 * Elapsed will be the time in milliseconds since the last value. If it is the first value, -1 is used.
 * @param input 
 * @param transformer 
 * @param options 
 * @returns 
 */
export const annotateElapsed = <In>() => {
  return (input: ReactiveOrSource<In>) => {
    let last = 0;
    const a = annotate<In, AnnotationElapsed>((value) => {
      const elapsed = last === 0 ? 0 : Date.now() - last;
      last = Date.now();
      return { ...value, elapsedMs: elapsed };
    })(input);
    return a;
  }
}

/**
 * Create a new object from input, based on cloning fields rather than a destructured copy.
 * This is useful for event args.
 * @param input 
 * @returns 
 */
export const cloneFromFields = <In>(): ReactiveOp<In, In> => transform<In, In>((v): In => {
  const entries: Array<[ key: string, value: any ]> = [];
  for (const field in v) {
    const value = (v as any)[ field ];
    if (isPlainObjectOrPrimitive(value as unknown)) {
      entries.push([ field, value ]);
    }
  }
  return Object.fromEntries(entries) as In;
})

export type SingleFromArrayOptions<V> = {
  /**
   * Function to select a single value from array
   * @param value 
   * @returns 
   */
  predicate: (value: V) => boolean
  /**
   * `default`: leave array in same order (default option)
   * `random`: shuffles array before further processing
   * function: function that sorts values
   */
  order: `default` | `random` | ((a: V, b: V) => number)
  /**
   * Selects an index from array. 0 being first, 1 being second.
   * Reverse indexing also works: -1 being last, -2 being second last...
   * 
   * If index exceeds length of array, _undefined_ is returned
   */
  at: number
}

/**
 * For a stream that emits arrays of values, this op will select a single value.
 * 
 * Can select based on:
 * * predicate: a function that returns _true_ for a value
 * * at: selection based on array index (can be combined with random ordering to select a random value)
 * 
 * ```js
 * // If source is Reactive<Array<number>>, picks the first even number
 * singleFromArray(source, { 
 *  predicate: v => v % 2 === 0
 * });
 * 
 * // Selects a random value from source
 * singleFromArray(source, { 
 *  order: `random`,
 *  at: 0
 * });
 * ```
 * 
 * If neither `predicate` or `at` options are given, exception is thrown.
 * @param source Source to read from
 * @param options Options for selection
 * @returns 
 */
export function singleFromArray<V>(source: ReactiveOrSource<Array<V>>, options: Partial<SingleFromArrayOptions<V>> = {}): Reactive<V> {
  const order = options.order ?? `default`;
  if (!options.at && !options.predicate) throw new Error(`Options must have 'predicate' or 'at' fields`);

  let preprocess = (values: Array<V>) => values;
  if (order === `random`) preprocess = shuffle;
  else if (typeof order === `function`) preprocess = (values) => values.toSorted(order);

  const upstream = initUpstream<Array<V>, V>(source, {
    onValue(values) {
      values = preprocess(values);
      if (options.predicate) {
        for (const v of values) {
          if (options.predicate(v)) {
            upstream.set(v);
          }
        }
      } else if (options.at) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        upstream.set(values.at(options.at)!);
      }
    },
  });
  return upstream;
}

/**
 * Batches values from `source`, and then emits a single value according to the selection logic.
 * @param source 
 * @param options 
 * @returns 
 */
// export function batchAndSingle<V>(options: Partial<SingleFromArrayOptions<V> & BatchOptions>): ReactiveOp<V, V> {
//   const b = batch(options);
//   return (source: ReactiveOrSource<V>) => {
//     const batched = batch(source, options);
//     const single = singleFromArray(batched, options);
//     return single;
//   }
// }

/**
 * Wrapped Reactive for object-oriented access
 */
export type Wrapped<TIn> = {
  source: Reactive<TIn>,
  /**
   * Copies values from source into an array, throwing
   * an error if expected number of items is not reached
   * @param options 
   * @returns 
   */
  toArrayOrThrow: (options: Partial<ToArrayOptions<TIn>>) => Promise<Array<TIn>>
  /**
   * Copies values from source into an array.
   * @param options 
   * @returns 
   */
  toArray: (options: Partial<ToArrayOptions<TIn>>) => Promise<Array<TIn | undefined>>
  /**
   * Accumulate a batch of values, emitted as an array
   * @param options 
   * @returns 
   */
  batch: (options: Partial<BatchOptions>) => Wrapped<Array<TIn>>
  /**
   * Annotate values with a timestamp of elapsed time
   * (uses `annotate`)
   * @returns 
   */
  annotateElapsed: () => Wrapped<TIn & AnnotationElapsed>
  /**
   * Annotate values with some additional field(s)
   * @param transformer 
   * @returns 
   */
  annotate: <TAnnotation>(transformer: (value: TIn) => TIn & TAnnotation) => Wrapped<TIn & TAnnotation>
  /**
   * Pluck and emit a single field from values
   * @param fieldName 
   * @param options 
   * @returns 
   */
  field: <TFieldType>(fieldName: keyof TIn, options: Partial<FieldOptions<TFieldType>>) => Wrapped<TFieldType>
  /**
   * Throws away values that don't match `predicate`
   * @param predicate 
   * @param options 
   * @returns 
   */
  filter: (predicate: FilterPredicate<TIn>, options: Partial<InitStreamOptions>) => Wrapped<TIn>
  /**
   * Converts one source stream into two, with values being emitted by both
   * @param options 
   * @returns 
   */
  split: (options: Partial<SplitOptions>) => Array<Wrapped<TIn>>
  /**
   * Transforms all values
   * @param transformer 
   * @param options 
   * @returns 
   */
  transform: <TOut>(transformer: (value: TIn) => TOut, options?: Partial<TransformOpts>) => Wrapped<TOut>
  /**
   * Only allow values through if a minimum of time has elapsed. Throws away values.
   * Ie. converts a fast stream into a slower one.
   * @param options 
   * @returns 
   */
  throttle: (options: Partial<ThrottleOptions>) => Wrapped<TIn>
  debounce: (options: Partial<DebounceOptions>) => Wrapped<TIn>

  /**
   * Emits values when this stream and any additional streams produce a value.
   * Outputted values captures the last value from each stream.
   * @returns 
   */
  synchronise: (...additionalSources: Array<ReactiveOrSource<TIn> | Wrapped<TIn>>) => Wrapped<Array<TIn | undefined>>
  /**
   * Creates new streams for each case, sending values to the stream if they match the filter predicate
   * @param cases 
   * @param options 
   * @returns 
   */
  switcher: <TRec extends Record<string, FilterPredicate<TIn>>, TLabel extends keyof TRec>(cases: TRec, options: Partial<SwitcherOptions>) => Record<TLabel, Wrapped<TIn>>
  /**
   * Creates new streams for each case
   * @param labels 
   * @returns 
   */
  splitLabelled: <K extends keyof TIn>(...labels: Array<K>) => Record<K, Wrapped<TIn>>
  /**
   * Listen for values
   * @param callback 
   * @returns 
   */
  value: (callback: (value: TIn) => void) => void
}

/**
 * Wrap a reactive source in a OOP wrapper to allow for chained
 * function calls.
 * 
 * For every `pointerup` event on the body, batch the events over
 * periods of 200ms, and then get the number of events in that period,
 * finally printing it out.
 * 
 * eg. detecting single or double-clicks
 * ```js
 * wrap(event<{ x: number, y: number }>(document.body, `pointerup`))
 *  .batch({ elapsed: 200 })
 *  .transform(v => v.length)
 *  .value(v => { console.log(v) });
 * ```
 * @param source 
 * @returns 
 */
export function wrap<TIn>(source: ReactiveOrSource<TIn>): Wrapped<TIn> {
  return {
    source: resolveSource(source),
    toArray: (options: Partial<ToArrayOptions<TIn>>) => {
      return toArray(source, options);
    },
    toArrayOrThrow: (options: Partial<ToArrayOptions<TIn>>) => {
      return toArrayOrThrow(source, options);
    },
    value: (callback: ((value: TIn) => void)) => {
      const s = resolveSource(source);
      s.on(message => {
        if (messageHasValue(message)) callback(message.value);
      })
    },
    batch: (options: Partial<BatchOptions>): Wrapped<Array<TIn>> => {
      const w = wrap<Array<TIn>>(batch(source, options));
      return w;
    },
    annotate: <TAnnotation>(transformer: (value: TIn) => TIn & TAnnotation): Wrapped<TIn & TAnnotation> => {
      const a = annotate<TIn, TAnnotation>(transformer)(source);
      return wrap(a);
    },
    annotateElapsed: () => {
      return wrap(annotateElapsed<TIn>()(source));
    },
    field: <TFieldType>(fieldName: keyof TIn, options: Partial<FieldOptions<TFieldType>> = {}) => {
      const f = field<TIn, TFieldType>(fieldName, options)(source);
      return wrap<TFieldType>(f);
    },
    filter: (predicate: FilterPredicate<TIn>, options: Partial<InitStreamOptions>) => {
      return wrap(filter(predicate, options)(source));
    },
    split: (options: Partial<SplitOptions> = {}) => {
      const streams = split<TIn>(options)(source).map(v => wrap(v));
      return streams;
    },
    splitLabelled: <K extends keyof TIn>(...labels: Array<K>) => {
      const l = splitLabelled<TIn, keyof TIn>(...labels)(source);
      const m = ImmutableMap<typeof l, Wrapped<TIn>>(l, v => wrap(v)) as Record<K, Wrapped<TIn>>;
      return m;
    },
    switcher: <TRec extends Record<string, FilterPredicate<TIn>>, TLabel extends keyof TRec>(cases: TRec, options: Partial<SwitcherOptions> = {}) => {
      const s = switcher<TIn, TRec, TLabel>(cases, options)(source);
      const m = ImmutableMap<typeof s, Wrapped<TIn>>(s, v => wrap(v));
      return m as Record<TLabel, Wrapped<TIn>>;
    },
    synchronise: (...additionalSources: Array<Wrapped<TIn> | ReactiveOrSource<TIn>>) => {
      const unwrapped: Array<Reactive<TIn>> = additionalSources.map(v => {
        return `source` in v ? v.source : resolveSource(v);
      });
      return wrap(synchronise<TIn>()(source, ...unwrapped));
    },
    debounce: (options: Partial<DebounceOptions> = {}) => {
      return wrap(debounce<TIn>(source, options));
    },
    throttle: (options: Partial<ThrottleOptions> = {}) => {
      return wrap(throttle<TIn>(source, options));
    },
    transform: <TOut>(transformer: (value: TIn) => TOut, options: Partial<TransformOpts> = {}) => {
      return wrap(transform(transformer, options)(source));
    }
  }
}

// export function batchOp<V>(options: Partial<BatchOptions>): ReactiveOp<V, Array<V>> {
//   return (source: ReactiveOrSource<V>) => {
//     return batch(source, options);
//   }
// }

const opify = <V>(fn: (source: ReactiveOrSource<V>, ...args: Array<any>) => Reactive<V>, ...args: Array<any>) => {
  return (source: ReactiveOrSource<V>) => {
    return fn(source, ...args);
  }
}

export const Ops = {
  batch: <V>(options: Partial<BatchOptions>): ReactiveOp<V, Array<V>> => {
    return (source: ReactiveOrSource<V>) => {
      return batch(source, options);
    }
  },
  debounce: <V>(options: Partial<DebounceOptions>): ReactiveOp<V, V> => {
    return (source: ReactiveOrSource<V>) => {
      return debounce(source, options);
    }
  },
  throttle: <V>(options: Partial<ThrottleOptions>) => opify<V>(throttle, options)
  // throttle: <V>(options: Partial<ThrottleOptions>): ReactiveOp<V, V> => {
  //   return (source: ReactiveOrSource> V >)
  // }
} as const;

export type ReactiveOpInit<TIn, TOut, TOpts> = (options: Partial<TOpts>) => ReactiveOp<TIn, TOut>
export type ReactiveOp<TIn, TOut> = (source: ReactiveOrSource<TIn>) => Reactive<TOut>

export type ReactiveOpLinks<In, Out> = [
  ReactiveOrSource<In>,
  ...Array<ReactiveOp<any, any>>,
  ReactiveOp<any, Out>
]

/**
 * Connects all the `ops` together, ready for a source.
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

/**
 * Queue from `source`, emitting when thresholds are reached. Returns a new Reactive
 * which produces arrays.
 * 
 * Can use a combination of elapsed time or number of data items.
 * 
 * By default options are OR'ed together.
 *
 * ```js
 * // Emit data in batches of 5 items
 * batch(source, { quantity: 5 });
 * // Emit data every second
 * batch(source, { elapsed: 1000 });
 * ```
 * @param batchSource 
 * @param options 
 * @returns 
 */
export function batch<V>(batchSource: ReactiveOrSource<V>, options: Partial<BatchOptions> = {}): Reactive<Array<V>> {
  const queue = new QueueMutable<V>();
  const quantity = options.quantity ?? 0;
  //const logic = options.logic ?? `or`;
  const returnRemainder = options.returnRemainder ?? true;

  //let lastFire = performance.now();
  const upstreamOpts = {
    ...options,
    onStop() {
      if (returnRemainder && !queue.isEmpty) {
        const data = queue.toArray();
        queue.clear();
        upstream.set(data);
      }
    },
    onValue(value: V) {
      queue.enqueue(value);
      //console.log(`Reactive.batch onValue. Queue len: ${ queue.length } quantity: ${ quantity } timer state: '${ timer?.runState }'`);
      if (quantity > 0 && queue.length >= quantity) {
        // Reached quantity limit
        send();
      }
      // Start timer
      //console.log(timer?.isDone);
      if (timer !== undefined && timer.runState === `idle`) {
        //console.log(`Reactive.batch timer started`);
        timer.start();
      }
    },
  }
  const upstream = initUpstream<V, Array<V>>(batchSource, upstreamOpts);

  const send = () => {
    //console.log(`Reactive.batch send`);
    if (queue.isEmpty) return;

    // Reset timer
    if (timer !== undefined) timer.start();

    // Fire queued data
    const data = queue.toArray();
    queue.clear();
    upstream.set(data);
  }

  const timer = options.elapsed ? timeout(send, options.elapsed) : undefined

  // const trigger = () => {
  //   const now = performance.now();
  //   let byElapsed = false;
  //   let byLimit = false;
  //   if (elapsed > 0 && (now - lastFire > elapsed)) {
  //     lastFire = now;
  //     byElapsed = true;
  //   }
  //   if (limit > 0 && queue.length >= limit) {
  //     byLimit = true;
  //   }
  //   if (logic === `or` && (!byElapsed && !byLimit)) return;
  //   if (logic === `and` && (!byElapsed || !byLimit)) return;

  //   send();
  // }

  return toReadable(upstream);
}

export type DebounceOptions = InitStreamOptions & {
  /**
   * Minimum time between events. Default 50ms
   */
  elapsed: Interval
}

/**
 * Debounce waits for `elapsed` time after the last received value before emitting it.
 * 
 * If a flurry of values are received that are within the interval, it won't emit anything. But then
 * as soon as there is a gap in the messages that meets the interval, the last received value is sent out.
 * 
 * `debounce` always emits with at least `elapsed` as a delay after a value received. While {@link throttle} potentially
 * sends immediately, if it's outside of the elapsed period.
 * 
 * This is a subtly different logic to {@link throttle}. `throttle` more eagerly sends the first value, potentially
 * not sending later values. `debouce` however will send later values, potentially ignoring earlier ones.
 * @param source 
 * @param options 
 * @returns 
 */
export function debounce<V>(source: ReactiveOrSource<V>, options: Partial<DebounceOptions> = {}): Reactive<V> {
  const elapsed = intervalToMs(options.elapsed, 50);
  let lastValue: V | undefined;

  const timer = timeout(() => {
    const v = lastValue;
    if (v) {
      upstream.set(v);
      lastValue = undefined;
    }
  }, elapsed);

  const upstream = initUpstream<V, V>(source, {
    ...options,
    onValue(value) {
      lastValue = value;
      timer.start();
    }
  });
  return toReadable(upstream);
}

export type ThrottleOptions = InitStreamOptions & {
  elapsed: Interval
}

/**
 * Only allow a value through if a minimum amount of time has elapsed.
 * since the last value. This effectively slows down a source to a given number
 * of values/ms. Values emitted by the source which are too fast are discarded.
 * 
 * Throttle will fire on the first value received.
 * 
 * In more detail:
 * Every time throttle passes a value, it records the time it allowed something through. For every
 * value received, it checks the elapsed time against this timestamp, throwing away values if
 * the period hasn't elapsed.
 * 
 * With this logic, a fury of values of the source might be discarded if they fall within the elapsed time
 * window. But then if there is not a new value for a while, the actual duration between values can be longer
 * than expected. This is in contrast to {@link debounce}, which will emit the last value received after a duration, 
 * even if the source stops sending.
 * @param options 
 * @returns 
 */
export function throttle<V>(throttleSource: ReactiveOrSource<V>, options: Partial<ThrottleOptions> = {}): Reactive<V> {

  const elapsed = intervalToMs(options.elapsed, 0);
  let lastFire = performance.now();
  let lastValue: V | undefined;

  const upstream = initUpstream<V, V>(throttleSource, {
    ...options,
    onValue(value) {
      lastValue = value;
      trigger();
    },
  });

  const trigger = () => {
    const now = performance.now();
    if (elapsed > 0 && (now - lastFire > elapsed)) {
      lastFire = now;
      if (lastValue !== undefined) {
        upstream.set(lastValue);
      }
    }
  }


  return toReadable(upstream);

}

