import { intervalToMs, type Interval } from "../flow/IntervalType.js";
import { DispatchList, type Dispatch } from "../flow/DispatchList.js"
import * as Immutable from '../Immutable.js';
import { QueueMutable } from "../collections/index.js";
import * as DiGraph from "./graphs/DirectedGraph.js";

export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

export type SignalKinds = `done`;
export type Passed<V> = {
  value: V | undefined
  signal?: SignalKinds
  context?: string
}

export type PassedSignal = Passed<any> & {
  value: undefined
  signal: `done`
  context: string
}

export type PassedValue<V> = Passed<V> & {
  value: V
}

export function isSignal<V>(v: Passed<V> | PassedSignal): v is PassedSignal {
  if (v.value !== undefined) return false;
  if (`signal` in v && v.signal !== undefined) return true;
  return false;
}

/**
 * Returns _true_ if `v` has a non-undefined value. Note that sometimes
 * _undefined_ is a legal value to pass
 * @param v 
 * @returns 
 */
export function hasValue<V>(v: Passed<V> | PassedSignal): v is PassedValue<V> {
  if (v.value !== undefined) return true;
  return false;
}

export type Reactive<V> = {
  /**
   * Subscribes to a reactive.
   * Return result unsubscribes.
   * @param handler 
   */
  on(handler: (value: Passed<V>) => void): () => void
}

export type ReactiveNonInitial<V> = Reactive<V> & {
  last(): V | undefined
}

export type ReactiveWritable<V> = {
  set(value: V): void
}

export type ReactiveInitial<V> = Reactive<V> & {
  last(): V
}

export type ReactiveDisposable = {
  dispose(reason: string): void
  isDisposed(): boolean
}

export type ReactiveFinite = {
  isDone(): boolean

}

// export type ReactiveCloseable = ReactiveFinite & {
//   close(reason: string): void
// }

export type ReactiveDiff<V> = ReactiveDisposable & ReactiveWritable<V> & {
  onDiff(handler: (changes: Passed<Array<Immutable.Change<any>>>) => void): void
  update(changedPart: Record<string, any>): void
  updateField(field: string, value: any): void
}

// export function readable<V>(): ReactiveDisposable & Reactive<V> {
//   const events = initEvent<V>();
//   let disposed = false;
//   return {
//     dispose(reason) {
//       if (disposed) return;
//       disposed = true;
//       events.signal(`done`, `Closed: ${ reason }`);
//     },
//     isDisposed() {
//       return disposed;
//     },
//     on: events.on
//   }
// }

export function number(initialValue: number): ReactiveDisposable & ReactiveWritable<number> & ReactiveInitial<number>;
export function number(): ReactiveDisposable & ReactiveWritable<number> & ReactiveNonInitial<number>;
export function number(initialValue?: number): ReactiveDisposable & ReactiveWritable<number> & (ReactiveNonInitial<number> | ReactiveInitial<number>) {
  let value = initialValue;
  const events = initEvent<number>();

  const set = (v: number) => {
    value = v;
    events.notify(v);
  }

  return {
    dispose: events.dispose,
    isDisposed: events.isDisposed,
    last: () => value,
    on: events.on,
    set
  }
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
  const event = initEvent<Array<V | undefined>>();
  const data: Array<V | undefined> = [];

  for (const [ index, v ] of values.entries()) {
    data[ index ] = undefined;
    v.on(valueChanged => {
      if (!isSignal(valueChanged)) {
        data[ index ] = valueChanged.value;
      }
      event.notify(data);
    });
  }

  return {
    on: event.on
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
 * @param sources 
 * @returns 
 */
export function synchronise<V>(...sources: Array<Reactive<V>>): Reactive<Array<V | undefined>> {
  const event = initEvent<Array<V>>();
  let data: Array<V | undefined> = [];

  for (const [ index, v ] of sources.entries()) {
    data[ index ] = undefined;
    v.on(valueChanged => {
      if (isSignal(valueChanged)) {
        if (valueChanged.signal === `done`) {
          sources.splice(index, 1);
        }
        return;
      }
      data[ index ] = valueChanged.value;

      if (!data.includes(undefined)) {
        // All array elements contain values
        event.notify(data as Array<V>);
        data = [];
      }
    });
  }

  return {
    on: event.on
  }
}



export type ResolveAfterOptions = {
  loops?: number
  infinite?: boolean
}

export function resolveAfter<V extends Record<string, any>>(interval: Interval, callbackOrValue: V | (() => V), options: ResolveAfterOptions = {}): Reactive<V> {
  const intervalMs = intervalToMs(interval, 0);
  const event = initEvent<V>();
  const loops = options.infinite ? Number.MAX_SAFE_INTEGER : options.loops ?? 1;
  let remaining = loops;

  const run = () => {
    if (typeof callbackOrValue === `function`) {
      const value = callbackOrValue();
      event.notify(value);
    } else {
      event.notify(callbackOrValue);
    }
    remaining--;
    if (remaining > 0) {
      setTimeout(run, intervalMs);
    }
  }
  setTimeout(run, intervalMs);

  const r: Reactive<V> = {
    on: event.on
  }
  return r;
}

export type EventOptions<V> = {
  process: (args?: Event | undefined) => V
  lazy?: boolean
}

export function event<V extends Record<string, any>, EventName extends string>(target: EventTarget, name: EventName, options: EventOptions<V>): ReactiveInitial<V> & ReactiveDisposable;

export function event<V extends Record<string, any>, EventName extends string>(target: EventTarget, name: EventName, options?: Optional<EventOptions<V>, `process`>): ReactiveNonInitial<V> & ReactiveDisposable;

/**
 * Subscribes to an event, emitting data
 * @param target Event emitter
 * @param name Event name
 * @param options Options
 * @returns 
 */
export function event<V extends Record<string, any>, EventName extends string>(target: EventTarget, name: EventName, options: Partial<EventOptions<V>> = {}): (ReactiveInitial<V> | ReactiveNonInitial<V>) & ReactiveDisposable {
  const process = options.process;
  const initialValue = process ? process() : undefined;

  const rxObject = initialValue ? object<V>(initialValue, { deepEntries: true }) : object<V>(undefined, { deepEntries: true });
  const lazy = options.lazy ?? false;
  let eventAdded = false;
  let disposed = false;

  const callback = (args: any) => {
    rxObject.set(process ? process(args) : args);
  }

  const remove = () => {
    if (!eventAdded) return;
    eventAdded = false;
    target.removeEventListener(name, callback);
  }

  const add = () => {
    if (eventAdded) return;
    eventAdded = true;
    target.addEventListener(name, callback);
  }

  if (!lazy) add();

  return {
    last: () => {
      if (lazy) add();
      return rxObject.last();
    },
    dispose: (reason: string) => {
      if (disposed) return;
      disposed = true;
      remove();
      rxObject.dispose(reason);
    },
    isDisposed() {
      return disposed;
    },
    on: (handler: (v: Passed<V>) => void) => {
      if (lazy) add();
      return rxObject.on(handler);
    }
  }
  // const result = {
  //   dispose: () => {
  //     target.removeEventListener(name, callback)
  //   },
  //   [ `${ name }` ]: rxObject
  // }

  // return result as {
  //   [ key in EventName ]: typeof rxObject
  // } & {
  //   dispose: () => void
  // };
}

export function manual<V>(): Reactive<V> & ReactiveWritable<V> {
  const events = initEvent<V>();
  return {
    set(value: V) {
      events.notify(value);
    },
    on: events.on
  };
}

export type ObjectOptions<V> = {
  deepEntries: boolean
  eq: Immutable.IsEqualContext<V>
}

//export function object<V extends Record<string, any>>(options?: Partial<ObjectOptions<V>>): ReactiveDiff<V> & ReactiveNonInitial<V>;

export function object<V extends Record<string, any>>(initialValue: V, options?: Partial<ObjectOptions<V>>): ReactiveDiff<V> & ReactiveInitial<V>;

export function object<V extends Record<string, any>>(initialValue: undefined, options?: Partial<ObjectOptions<V>>): ReactiveDiff<V> & ReactiveNonInitial<V>;


/**
 * Emits when fields of the object change.
 * * `set()` updates the whole object
 * * `update()` changes a particular field
 * 
 * `on` gets the whole object when it changes.
 * ```js
 * const o = object({ name: `bob`, level: 2 });
 * o.on(value => {
 *  const changed = value.value;
 * });
 * o.set({ name: `mary`, level: 3 });
 * 
 * // `on` will get called, with `changed` having a value of:
 * // { name: `mary`, level: 3 }
 * ```
 * 
 * Use `last()` to get the last set value.
 * 
 * `onDiff` subscribes to a rough diff of the object.
 * 
 * ```js
 * const o = object({ name: `bob`, level: 2 });
 * o.onDiff(diffValue => {
 *  const diff = diffValue.value;
 * })
 * o.set({ name: `mary`, level: 3 });
 * 
 * // onDiff would fire with `diff` of:
 * [
 *  { path: `name`, previous: `bob`, value: `mary` },
 *  { path: `level`, previous: 2, value: 3 }
 * ]
 * ```
 * @param initialValue 
 * @param eq 
 * @returns 
 */
export function object<V extends Record<string, any>>(initialValue?: V, options: Partial<ObjectOptions<V>> = {}): ReactiveDisposable & ReactiveDiff<V> & (ReactiveInitial<V> | ReactiveNonInitial<V>) {
  const eq = options.eq ?? Immutable.isEqualContextString;
  const setEvent = initEvent<V>();
  const diffEvent = initEvent<Array<Immutable.Change<any>>>();

  let value: V | undefined = initialValue;
  let disposed = false;

  const set = (v: V) => {
    if (value !== undefined) {
      const diff = Immutable.compareData(value, v, ``, options);
      if (diff.length === 0) return;
      diffEvent.notify(diff);
    }

    value = v;
    setEvent.notify(v);
  }


  const update = (toMerge: Partial<V>) => {
    const pd = Immutable.getPathsAndData(toMerge);
    // eslint-disable-next-line unicorn/prefer-ternary
    if (value === undefined) {
      value = toMerge as V;
    } else {
      const diff = Immutable.compareData(toMerge, value);
      if (diff.length === 0) return; // No changes
      value = {
        ...value,
        ...toMerge
      }
      diffEvent.notify(pd);
    }
    setEvent.notify(value);
  }

  const updateField = (path: string, valueForField: any) => {
    if (value === undefined) throw new Error(`Cannot update value when it has not already been set`);
    const existing = Immutable.getField<any>(value, path);
    if (eq(existing, valueForField, path)) return;
    const o = Immutable.updateByPath(value, path, valueForField);
    value = o;
    diffEvent.notify([ { path, value: valueForField, previous: existing } ]);
    setEvent.notify(o);
  }

  const dispose = (reason: string) => {
    if (disposed) return;
    diffEvent.dispose(reason);
    setEvent.dispose(reason);
    disposed = true;
  }

  return {
    dispose,
    isDisposed() {
      return disposed
    },
    /**
     * Update a field.
     * Exception is thrown if field does not exist
     */
    updateField,
    last: () => value,
    on: setEvent.on,
    onDiff: diffEvent.on,
    /**
     * Set the whole object
     */
    set,
    /**
     * Update the object with a partial set of fields and values
     */
    update
  }
}

export type InitEventOptions = {
  onFirstSubscribe: () => void
  onNoSubscribers: () => void
}

function initEvent<V>(options: Partial<InitEventOptions> = {}) {
  let dispatcher: DispatchList<Passed<V>> | undefined;
  let disposed = false;
  let firstSubscribe = false;
  let emptySubscriptions = true;
  const onFirstSubscribe = options.onFirstSubscribe ?? undefined;
  const onNoSubscribers = options.onNoSubscribers ?? undefined;

  const isEmpty = () => {
    if (dispatcher === undefined) return;
    if (!dispatcher.isEmpty) return;
    if (!emptySubscriptions) {
      emptySubscriptions = true;
      firstSubscribe = false;
      if (onNoSubscribers) onNoSubscribers();
    }
  }
  return {
    dispose: (reason: string) => {
      if (disposed) return;
      //console.log(`initEvent dispose ${ reason }`);
      dispatcher?.notify({ value: undefined, signal: `done`, context: `Disposed: ${ reason }` });
      disposed = true;
    },
    isDisposed: () => {
      return disposed
    },
    clear: () => {
      dispatcher?.clear();
      isEmpty();
    },
    notify: (v: V) => {
      if (disposed) throw new Error(`Disposed`);
      dispatcher?.notify({ value: v });
    },
    through: (pass: Passed<V>) => {
      if (disposed) throw new Error(`Disposed`);
      dispatcher?.notify(pass)
    },
    signal: (signal: SignalKinds, context?: string) => {
      if (disposed) throw new Error(`Disposed`);
      dispatcher?.notify({ signal, value: undefined, context });
    },
    on: (handler: Dispatch<Passed<V>>) => {
      if (disposed) throw new Error(`Disposed`);
      if (dispatcher === undefined) dispatcher = new DispatchList();
      const id = dispatcher.add(handler);
      if (!firstSubscribe) {
        firstSubscribe = true;
        if (onFirstSubscribe) setTimeout(() => { onFirstSubscribe() }, 10);
      }
      return () => {
        dispatcher?.remove(id);
        isEmpty();
      }
    }
  }
}

export type UpstreamOptions<In> = {
  lazy: boolean
  /**
   * If _true_ (default), we dispose the underlying stream if the upstream closes. This happens after onStop() is called.
   */
  disposeIfSourceDone: boolean
  onValue: (v: In) => void
  /**
   * Called just before we subscribe to source
   * @returns 
   */
  onStart: () => void
  /**
   * Called after we unsubscribe from source
   * @returns
   */
  onStop: () => void
}

const initUpstream = <In, Out>(upstreamSource: ReactiveOrSource<In>, options: Partial<UpstreamOptions<In>>) => {
  const lazy = options.lazy ?? true;
  const disposeIfSourceDone = options.disposeIfSourceDone ?? true;
  const onValue = options.onValue ?? ((_v: In) => {/** no-op */ })
  const source = resolveSource(upstreamSource);
  let unsub: undefined | (() => void);

  const start = () => {
    if (unsub !== undefined) return;

    if (options.onStart) options.onStart();
    unsub = source.on(value => {
      if (isSignal(value)) {
        if (value.signal === `done`) {
          stop();
          if (disposeIfSourceDone) events.dispose(`Source is completed`);
        } else {
          events.through(value);
        }
      } else if (hasValue(value)) {
        onValue(value.value);
      }
    });
  }

  const stop = () => {
    if (unsub === undefined) return;
    unsub();
    unsub = undefined;
    if (options.onStop) options.onStop();
  }

  const initOpts: InitEventOptions = {
    onFirstSubscribe() {
      if (lazy) start();
    },
    onNoSubscribers() {
      if (lazy) stop();
    },
  }
  if (!lazy) start();
  const events = initEvent<Out>(initOpts);
  return events;
}

export type FieldOptions<V> = InitEventOptions & {
  /**
   * If `field` is missing on a value, this value is used in its place.
   * If not set, the value is skipped.
   */
  missingFieldDefault: V
};
/**
 * From a source value, yields a field from it.
 * 
 * If a source value doesn't have that field, it is skipped.
 * 
 * @param source 
 * @param field 
 * @returns 
 */
export function field<In, Out>(fieldSource: ReactiveOrSource<In>, field: keyof In, options: Partial<FieldOptions<Out>> = {}): Reactive<Out> {
  const upstream = initUpstream<In, Out>(fieldSource, {
    disposeIfSourceDone: true,
    ...options,
    onValue(value) {
      let t = (value as any)[ field ];
      if (t === undefined && options.missingFieldDefault !== undefined) {
        t = options.missingFieldDefault as Out;
      }
      upstream.notify(t as Out);
    },
  })

  return {
    on: upstream.on
  }
  // const source = resolveSource(fieldSource);
  // const events = initEvent<Out>();
  // source.on(value => {
  //   if (isSignal(value)) {
  //     if (value.signal === `done`) {
  //       events.dispose(`Source stream closed`);
  //     }
  //     return;
  //   }
  //   if (value.value) {
  //     const t = value.value[ field ];
  //     events.notify(t as Out);
  //   }
  // })

  // return {
  //   on: events.on,
  //   dispose: events.dispose,
  //   isDisposed() {
  //     return events.isDisposed();
  //   },
  // }
}

export type TransformOpts = InitEventOptions;

/**
 * Transforms values from `source` using the `transformer` function.
 * @param source 
 * @param transformer 
 * @returns 
 */
export function transform<In, Out>(input: ReactiveOrSource<In>, transformer: (value: In) => Out, options: Partial<TransformOpts> = {}): Reactive<Out> {
  const upstream = initUpstream<In, Out>(input, {
    ...options,
    onValue(value) {
      const t = transformer(value);
      upstream.notify(t);
    },
  })

  return {
    on: upstream.on
  }
}

export type BatchOptions = InitEventOptions & {
  /**
   * If _true_ (default) remaining results are yielded
   * if source closes. If _false_, only 'complete' batches are yielded.
   */
  returnRemainder: boolean
  elapsed: Interval
  limit: number
  logic: `or` | `and`
}

export type GeneratorOptions = {
  /**
   * By default (true) only accesses the generator if there is a subscriber.
   */
  lazy: boolean
}
/**
 * Creates a readable reactive based on a generator
 * ```js
 * // Generators that makes a random value every 5 seconds
 * const valuesOverTime = Flow.interval(() => Math.random(), 5000);
 * // Wrap the generator
 * const r = Reactive.generator(time);
 * // Get notified when there is a new value
 * r.on(v => {
 *   console.log(v.value);
 * });
 * ```
 * @param generator 
 */
export function generator<V>(generator: IterableIterator<V> | AsyncIterableIterator<V> | Generator<V> | AsyncGenerator<V>, options: Partial<GeneratorOptions> = {}): ReactiveDisposable & Reactive<V> {
  const lazy = options.lazy ?? true;
  let reading = false;

  const eventOpts: InitEventOptions = {
    onFirstSubscribe() {
      if (lazy && !reading) {
        readingStart();
      }
    },
    onNoSubscribers() {
      if (lazy && reading) {
        reading = false;
      }
    },
  }
  const events = initEvent<V>(eventOpts);

  const read = async () => {
    try {
      const v = await generator.next();
      if (v.done) {
        events.dispose(`Generator complete`);
        return;
      }
      if (!reading) return;
      events.notify(v.value);
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      events.dispose(`Generator error: ${ (error as any).toString() }`);
      return;
    }
    if (events.isDisposed()) return;
    if (!reading) return;
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    setTimeout(read);
  }

  const readingStart = () => {
    if (reading) return;
    reading = true;
    void read();
  }
  if (!lazy) readingStart();

  return {
    on: events.on,
    dispose: events.dispose,
    isDisposed: events.isDisposed
  }
}

export type ReactiveOrSource<V> = Reactive<V> | IterableIterator<V> | AsyncIterableIterator<V> | Generator<V> | AsyncGenerator<V> | Array<V>

/**
 * Resolves various kinds of sources into a Reactive.
 * If `source` is an iterable/generator, it gets wrapped via `generator()`.
 * @param source 
 * @returns 
 */
export const resolveSource = <V>(source: ReactiveOrSource<V>): Reactive<V> => {
  if (`on` in source) return source;
  // eslint-disable-next-line unicorn/prefer-ternary
  if (Array.isArray(source)) {
    return generator(source.values(), { lazy: true });
  } else {
    return generator(source, { lazy: true });
  }
}
/**
 * Queue from `source`, emitting when thresholds are reached.
 * Can use a combination of elapsed time or number of data items.
 * 
 * By default options are ORed
 *
 * ```js
 * // Emit data in batches of 5 items
 * batch(source, { limit: 5 });
 * // Emit data every second
 * batch(source, { elapsed: 1000 });
 * ```
 * @param source 
 * @param options 
 * @returns 
 */
export function batch<V>(batchSource: ReactiveOrSource<V>, options: Partial<BatchOptions> = {}): Reactive<Array<V>> {
  //const source = resolveSource(batchSource);
  const elapsed = intervalToMs(options.elapsed, 0);
  const queue = new QueueMutable<V>();
  const limit = options.limit ?? 0;
  const logic = options.logic ?? `or`;
  const returnRemainder = options.returnRemainder ?? true;

  let lastFire = performance.now();
  const upstreamOpts = {
    ...options,
    onStop() {
      if (returnRemainder && !queue.isEmpty) {
        const data = queue.toArray();
        queue.clear();
        upstream.notify(data);
      }
    },
    onValue(value: V) {
      queue.enqueue(value);
      trigger();
    },
  }
  const upstream = initUpstream<V, Array<V>>(batchSource, upstreamOpts);

  // let off: undefined | (() => void);

  // const close = (reason: string) => {
  //   console.log(`batch.close queue: ${ queue.length } returnRemainer: ${ returnRemainder }`);
  //   if (off !== undefined) off();
  //   if (returnRemainder && !queue.isEmpty) {
  //     const data = queue.data;
  //     queue.clear();
  //     events.notify(data as Array<V>);
  //   }
  //   events.dispose(reason);
  // }

  // const initOpts: InitEventOptions = {
  //   onFirstSubscribe() {
  //     console.log(`batch onFirstSub`);
  //     off = source.on(value => {
  //       console.log(`batch value ${ JSON.stringify(value) }`);
  //       if (isValue(value)) {
  //         queue.enqueue(value.value);
  //         trigger();
  //       } else if (isSignal(value) && value.signal === `done`) {
  //         close(`batch source closed`);
  //       }
  //     });
  //   },
  //   onNoSubscribers() {
  //     close(`batch onNoSubscribers`);
  //   },
  // }
  //const events = initEvent<Array<V>>(initOpts);

  const trigger = () => {
    const now = performance.now();
    let byElapsed = false;
    let byLimit = false;
    if (elapsed > 0 && (now - lastFire > elapsed)) {
      lastFire = now;
      byElapsed = true;
    }
    if (limit > 0 && queue.length >= limit) {
      byLimit = true;
    }
    if (logic === `or` && (!byElapsed && !byLimit)) return;
    if (logic === `and` && (!byElapsed || !byLimit)) return;

    // Fire queued data
    const data = queue.toArray();
    queue.clear();
    upstream.notify(data);
  }

  const r: Reactive<Array<V>> = {
    on: upstream.on
  }
  return r;
}

export type ToArrayOptions = {
  limit: number
  elapsed: number
}

/**
 * Reads the values of a reactive into an array.
 * Use the `limit` or `elapsed` to limit how many
 * items to read, and/or for how long.
 * @param reactive 
 * @param options 
 * @returns 
 */
export const toArray = async <V>(reactiveSource: ReactiveOrSource<V>, options: Partial<ToArrayOptions> = {}): Promise<Array<V>> => {
  const source = resolveSource(reactiveSource);
  const maxValues = options.limit ?? Number.MAX_SAFE_INTEGER;
  const maxDuration = options.elapsed ?? Number.MAX_SAFE_INTEGER;
  let buffer: Array<V> = [];

  let start = -1;
  const promise = new Promise<Array<V>>((resolve, _reject) => {
    const done = () => {
      off();
      resolve(buffer);
      buffer = []
    }

    const off = source.on(value => {
      if (start === -1) start = Date.now();
      if (isSignal(value) && value.signal === `done`) {
        done();
      } else if (hasValue(value)) {
        buffer.push(value.value);
        if (buffer.length >= maxValues) {
          done();
        }
      }
      if (Date.now() - start > maxDuration) {
        done();
      }
    });
  })
  return promise;
}

export type ThrottleOptions = InitEventOptions & {
  elapsed: Interval
}

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
    let byElapsed = false;
    if (elapsed > 0 && (now - lastFire > elapsed)) {
      lastFire = now;
      byElapsed = true;
    }
    if (!byElapsed) return;

    if (lastValue !== undefined) {
      upstream.notify(lastValue);
    }
  }

  const r: Reactive<V> = {
    on: upstream.on
  }
  return r;
}

export function win() {
  const generateRect = () => ({ width: window.innerWidth, height: window.innerHeight });

  const size = event(window, `resize`, {
    lazy: true,
    process: () => generateRect(),
  });
  const pointer = event(window, `pointermove`, {
    lazy: true,
    process: (args: Event | undefined) => {
      if (args === undefined) return { x: 0, y: 0 };
      const pe = args as PointerEvent;
      return { x: pe.x, y: pe.y }
    }
  });
  const dispose = (reason = `Reactive.win.dispose`) => {
    size.dispose(reason);
    pointer.dispose(reason);
  }
  return { dispose, size, pointer };
}


type RxNodeBase = {
  type: `primitive` | `rx` | `object`
}

type RxNodeRx = RxNodeBase & {
  type: `rx`,
  value: Reactive<any>
}

type RxNodePrimitive = RxNodeBase & {
  type: `primitive`,
  value: any
}

type RxNode = RxNodeRx | RxNodePrimitive;

function isReactive(o: object): o is Reactive<any> {
  if (typeof o !== `object`) return false;
  if (`on` in o) {
    return (typeof o.on === `function`);
  }
  return false;
}

/**
 * Build a graph of reactive dependencies for `rx`
 * @param rx 
 */
export function prepare<V extends Record<string, any>>(rx: V): Reactive<V> {
  let g = DiGraph.graph();
  const nodes = new Map<string, RxNode>();
  const events = initEvent<V>();

  const process = (o: object, path: string) => {
    for (const [ key, value ] of Object.entries(o)) {
      const subPath = path + `.` + key;
      g = DiGraph.connect(g, {
        from: path,
        to: subPath
      });
      if (isReactive(value)) {
        nodes.set(subPath, { value, type: `rx` });
        value.on(v => {
          console.log(`Reactive.prepare value: ${ JSON.stringify(v) } path: ${ subPath }`);
        });
      } else {
        const valueType = typeof value;
        // eslint-disable-next-line unicorn/prefer-switch
        if (valueType === `bigint` || valueType === `boolean` || valueType === `number` || valueType === `string`) {
          nodes.set(subPath, { type: `primitive`, value });
        } else if (valueType === `object`) {
          process(value, subPath)
        } else if (valueType === `function`) {
          console.log(`Reactive.process - not handling functions`);
        }
      }
    }
  }

  // const produce = () => {
  //   Object.fromEntries(entries);
  // }

  // process(rx, `_root`);
  // console.log(DiGraph.dumpGraph(g));

  // console.log(`--- Map ---`);

  // for (const entries of nodes.entries()) {
  //   console.log(entries[ 0 ]);
  //   console.log(entries[ 1 ]);
  //   console.log(``)
  // }


  const returnValue = {
    graph: g,
    on: events.on
  }
  return returnValue;
}

