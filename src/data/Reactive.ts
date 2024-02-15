/* eslint-disable @typescript-eslint/unbound-method */
import { intervalToMs, type Interval } from "../flow/IntervalType.js";
import { DispatchList, type Dispatch } from "../flow/DispatchList.js"
import * as Immutable from '../Immutable.js';
import { continuously } from "../flow/Continuously.js";
export * as Dom from './ReactiveDom.js';
export * from './ReactiveOps.js';
export * from './ReactiveGraph.js';

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

export type EventOptions<V> = {
  process: (args?: Event | undefined) => V
  lazy?: boolean
  /**
   * If true, log messages are emitted
   * when event handlers are added/removed
   */
  debugLifecycle?: boolean
  /**
   * If true, log messages are emitted
   * when the source event fires
   */
  debugFiring?: boolean
}

export type PassedValue<V> = Passed<V> & {
  value: V
}

export type Reactive<V> = {
  /**
   * Subscribes to a reactive. Receives
   * data as well as signals. Use `value` if you
   * just care about values.
   * 
   * Return result unsubscribes.
   * 
   * ```js
   * const unsub = someReactive.on(msg => {
   *    // Do something with msg.value
   * });
   * 
   * unsub(); // Unsubscribe
   * ```
   * @param handler 
   */
  on(handler: (value: Passed<V>) => void): () => void
  value(handler: (value: V) => void): () => void
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

export type ReactiveFinite = {
  isDone(): boolean
}

export type ReactiveDisposable = {
  dispose(reason: string): void
  isDisposed(): boolean
}

export type ReactiveDiff<V> = ReactiveDisposable & ReactiveWritable<V> & {
  onDiff(handler: (changes: Passed<Array<Immutable.Change<any>>>) => void): () => void
  update(changedPart: Record<string, any>): void
  updateField(field: string, value: any): void
}

export type ReactiveStream<V> = Reactive<V> & ReactiveDisposable & ReactiveWritable<V> & {
  through(message: Passed<V>): void
  /**
   * Removes all the subscribers from this stream.
   */
  reset(): void
  /**
   * Dispatches a signal
   * @param signal 
   * @param context 
   */
  signal(signal: SignalKinds, context?: string): void
}


/**
 * Options when creating a reactive object.
 */
export type ObjectOptions<V> = {
  /**
   * _false_ by default.
   * If _true_, inherited fields are included. This is necessary for event args, for example.
   */
  deepEntries: boolean
  /**
   * Uses JSON.stringify() by default.
   * Fn that returns _true_ if two values are equal, given a certain path.
   */
  eq: Immutable.IsEqualContext<V>
}


export function messageIsSignal<V>(message: Passed<V> | PassedSignal): message is PassedSignal {
  if (message.value !== undefined) return false;
  if (`signal` in message && message.signal !== undefined) return true;
  return false;
}

export function messageIsDoneSignal<V>(message: Passed<V> | PassedSignal): boolean {
  if (message.value !== undefined) return false;
  if (`signal` in message && message.signal === `done`) return true;
  return false;
}

/**
 * Returns _true_ if `v` has a non-undefined value. Note that sometimes
 * _undefined_ is a legal value to pass
 * @param v 
 * @returns 
 */
export function messageHasValue<V>(v: Passed<V> | PassedSignal): v is PassedValue<V> {
  if (v.value !== undefined) return true;
  return false;
}

export const hasLast = <V>(rx: Reactive<V> | ReactiveDiff<V>): rx is ReactiveInitial<V> => {
  if (`last` in rx) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const v = (rx as any).last();
    if (v !== undefined) return true;
  }
  return false;
}

export const isDisposable = (v: object): v is ReactiveDisposable => {
  return (`isDisposed` in v && `dispose` in v);
}


export function number(initialValue: number): ReactiveDisposable & ReactiveWritable<number> & ReactiveInitial<number>;
export function number(): ReactiveDisposable & ReactiveWritable<number> & ReactiveNonInitial<number>;
export function number(initialValue?: number): ReactiveDisposable & ReactiveWritable<number> & (ReactiveNonInitial<number> | ReactiveInitial<number>) {
  let value = initialValue;
  const events = initStream<number>();

  const set = (v: number) => {
    value = v;
    events.set(v);
  }

  return {
    dispose: events.dispose,
    isDisposed: events.isDisposed,
    last: () => value,
    on: events.on,
    value: events.value,
    set
  }
}

export function fromEvent<V extends Record<string, any>>(target: EventTarget, name: string, options: EventOptions<V>): ReactiveInitial<V> & ReactiveDisposable;

export function fromEvent<V extends Record<string, any>>(target: EventTarget, name: string, options?: Optional<EventOptions<V>, `process`>): ReactiveNonInitial<V> & ReactiveDisposable;

/**
 * Subscribes to an event, emitting data
 * @param target Event emitter
 * @param name Event name
 * @param options Options
 * @returns 
 */
export function fromEvent<V extends Record<string, any>>(target: EventTarget, name: string, options: Partial<EventOptions<V>> = {}): (ReactiveInitial<V> | ReactiveNonInitial<V>) & ReactiveDisposable {
  const process = options.process;
  const initialValue = process ? process() : undefined;
  const debugLifecycle = options.debugLifecycle ?? false;
  const debugFiring = options.debugFiring ?? false;
  const rxObject = initialValue ? object<V>(initialValue, { deepEntries: true }) : object<V>(undefined, { deepEntries: true });
  const lazy = options.lazy ?? false;
  let eventAdded = false;
  let disposed = false;

  const callback = (args: any) => {
    if (debugFiring) console.log(`Reactive.event '${ name }' firing '${ JSON.stringify(args) }`)
    rxObject.set(process ? process(args) : args);
  }

  const remove = () => {
    if (!eventAdded) return;
    eventAdded = false;
    target.removeEventListener(name, callback);
    if (debugLifecycle) {
      console.log(`Reactive.event remove '${ name }'`);
    }
  }

  const add = () => {
    if (eventAdded) return;
    eventAdded = true;
    target.addEventListener(name, callback);
    if (debugLifecycle) {
      console.log(`Reactive.event add '${ name }'`);
    }
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
    },
    value: (handler: (v: V) => void) => {
      if (lazy) add();
      return rxObject.value(handler);
    }
  }
}

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

/**
 * Creates a RxJs style observable
 * ```js
 * const o = observable(stream => {
 *  // Code to run for initialisation when we go from idle to at least one subscriber
 *  // Won't run again for additional subscribers, but WILL run again if we lose
 *  // all subscribers and then get one
 * 
 *  // To send a value:
 *  stream.set(someValue);
 * 
 *   // Optional: return function to call when all subscribers are removed
 *   return () => {
 *     // Code to run when all subscribers are removed
 *   }
 * });
 * ```
 * 
 * For example:
 * ```js
 * const xy = observable<(stream => {
 *  // Send x,y coords from PointerEvent
 *  const send = (event) => {
 *    stream.set({ x: event.x, y: event.y });
 *  }
 *  window.addEventListener(`pointermove`, send);
 *  return () => {
 *    // Unsubscribe
 *    window.removeEventListener(`pointermove`, send);
 *  }
 * });
 * 
 * xy.value(value => {
 *  console.log(value);
 * });
 * ```
 * @param init 
 * @returns 
 */
export function observable<V>(init: (stream: Reactive<V> & ReactiveWritable<V>) => (() => void) | undefined) {
  const ow = observableWritable(init);
  return {
    on: ow.on,
    value: ow.value
  }
}

/**
 * As {@link observable}, but returns a Reactive that allows writing
 * @param init 
 * @returns 
 */
export function observableWritable<V>(init: (stream: Reactive<V> & ReactiveWritable<V>) => (() => void) | undefined) {
  let onCleanup: (() => void) | undefined = () => {/** no-op */ };
  const ow = manual<V>({
    onFirstSubscribe() {
      onCleanup = init(ow);
    },
    onNoSubscribers() {
      if (onCleanup) onCleanup();
    },
  });

  return {
    ...ow,
    value: (callback: (value: V) => void) => {
      return ow.on(message => {
        if (messageHasValue(message)) {
          callback(message.value);
        }
      });
    }
  };
}

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
 * @param initialValue  Initial value
 * @param options Options
 * @returns 
 */
export function object<V extends Record<string, any>>(initialValue?: V, options: Partial<ObjectOptions<V>> = {}): ReactiveDisposable & ReactiveDiff<V> & (ReactiveInitial<V> | ReactiveNonInitial<V>) {
  const eq = options.eq ?? Immutable.isEqualContextString;
  const setEvent = initStream<V>();
  const diffEvent = initStream<Array<Immutable.Change<any>>>();

  let value: V | undefined = initialValue;
  let disposed = false;

  const set = (v: V) => {
    if (value !== undefined) {
      const diff = Immutable.compareData(value, v, ``, options);
      if (diff.length === 0) return;
      diffEvent.set(diff);
    }

    value = v;
    setEvent.set(v);
  }


  const update = (toMerge: Partial<V>) => {
    //const pd = Immutable.getPathsAndData(toMerge);
    //console.log(`pd: ${ JSON.stringify(pd) }`);
    // eslint-disable-next-line unicorn/prefer-ternary
    if (value === undefined) {
      value = toMerge as V;
    } else {
      const diff = Immutable.compareData(toMerge, value);
      //console.log(`diff: ${ JSON.stringify(diff) }`);
      if (diff.length === 0) return; // No changes
      value = {
        ...value,
        ...toMerge
      }
      diffEvent.set(diff);
      //diffEvent.notify(pd);
    }
    setEvent.set(value);
  }

  const updateField = (path: string, valueForField: any) => {
    if (value === undefined) throw new Error(`Cannot update value when it has not already been set`);
    const existing = Immutable.getField<any>(value, path);
    if (eq(existing, valueForField, path)) return;
    const o = Immutable.updateByPath(value, path, valueForField);
    value = o;
    diffEvent.set([ { path, value: valueForField, previous: existing } ]);
    setEvent.set(o);
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
    value: setEvent.value,
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

export type InitStreamOptions = {
  onFirstSubscribe: () => void
  onNoSubscribers: () => void
}

/**
 * @ignore
 * @param options 
 * @returns 
 */
export function initStream<V>(options: Partial<InitStreamOptions> = {}): ReactiveStream<V> {
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

  const subscribe = (handler: Dispatch<Passed<V>>) => {
    if (disposed) throw new Error(`Disposed`);
    if (dispatcher === undefined) dispatcher = new DispatchList();
    const id = dispatcher.add(handler);
    emptySubscriptions = false;
    if (!firstSubscribe) {
      firstSubscribe = true;
      if (onFirstSubscribe) setTimeout(() => { onFirstSubscribe() }, 10);
    }
    return () => {
      dispatcher?.remove(id);
      isEmpty();
    }
  }

  return {
    dispose: (reason: string) => {
      //console.log(`initEvent:dispose (${ reason }) disposed: ${ disposed }`);
      if (disposed) return;
      dispatcher?.notify({ value: undefined, signal: `done`, context: `Disposed: ${ reason }` });
      disposed = true;
    },
    isDisposed: () => {
      return disposed
    },
    reset: () => {
      dispatcher?.clear();
      isEmpty();
    },
    set: (v: V) => {
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
    on: (handler: Dispatch<Passed<V>>) => subscribe(handler),
    value: (handler: (value: V) => void) => {
      const unsub = subscribe(message => {
        if (messageHasValue(message)) {
          handler(message.value);
        }
      });
      return unsub;
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

/**
 * @ignore
 * @param upstreamSource 
 * @param options 
 * @returns 
 */
export const initUpstream = <In, Out>(upstreamSource: ReactiveOrSource<In>, options: Partial<UpstreamOptions<In>>) => {
  const lazy = options.lazy ?? true;
  const disposeIfSourceDone = options.disposeIfSourceDone ?? true;
  const onValue = options.onValue ?? ((_v: In) => {/** no-op */ })
  const source = resolveSource(upstreamSource);
  let unsub: undefined | (() => void);

  const start = () => {
    if (unsub !== undefined) return;

    if (options.onStart) options.onStart();
    unsub = source.on(value => {
      if (messageIsSignal(value)) {
        if (value.signal === `done`) {
          stop();
          if (disposeIfSourceDone) events.dispose(`Source is completed`);
        } else {
          events.through(value);
        }
      } else if (messageHasValue(value)) {
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

  const initOpts: InitStreamOptions = {
    onFirstSubscribe() {
      if (lazy) start();
    },
    onNoSubscribers() {
      if (lazy) stop();
    },
  }
  if (!lazy) start();
  const events = initStream<Out>(initOpts);
  return events;
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

  const eventOpts: InitStreamOptions = {
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
  const events = initStream<V>(eventOpts);

  const read = async () => {
    try {
      const v = await generator.next();
      if (v.done) {
        events.dispose(`Generator complete`);
        return;
      }
      if (!reading) return;
      events.set(v.value);
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
    value: events.value,
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

export type FromArrayOptions = {
  /**
   * Interval between each item being read. 5ms by default.
   */
  intervalMs: Interval
  /**
   * If _true_, only starts after first subscriber. _False_ by default.
   */
  lazy: boolean
  /**
   * Governs behaviour if all subscribers are removed AND lazy=true. By default continues
   * iteration.
   * 
   * * pause: stop at last array index
   * * reset: go back to 0
   * * empty: continue, despite there being no listeners (default)
   */
  idle: `` | `pause` | `reset`
}

export const fromArray = <V>(array: Array<V>, options: Partial<FromArrayOptions> = {}): Reactive<V> & ReactiveFinite & ReactiveInitial<V> => {
  const lazy = options.lazy ?? false;
  const idle = options.idle ?? ``;
  const intervalMs = intervalToMs(options.intervalMs, 5);
  let index = 0;
  let lastValue = array[ 0 ];

  const s = initStream<V>({
    onFirstSubscribe() {
      //console.log(`Rx.fromArray onFirstSubscribe. Lazy: ${ lazy } reader state: ${ c.runState }`);
      // Start if in lazy mode and not running
      if (lazy && c.runState === `idle`) c.start();
    },
    onNoSubscribers() {
      //console.log(`Rx.fromArray onNoSubscribers. Lazy: ${ lazy } reader state: ${ c.runState } on idle: ${ idle }`);
      if (lazy) {
        if (idle === `pause`) {
          c.cancel();
        } else if (idle === `reset`) {
          c.cancel();
          index = 0;
        }
      }
    }
  });

  const c = continuously(() => {
    //console.log(`Rx.fromArray loop index ${ index } lazy: ${ lazy }`);

    lastValue = array[ index ];
    index++;

    s.set(lastValue)
    if (index === array.length) {
      //console.log(`Rx.fromArray exiting continuously`);
      return false;
    }
  }, intervalMs);

  if (!lazy) c.start();

  return {
    isDone() {
      return index === array.length;
    },
    last() {
      return lastValue;
    },
    on: s.on,
    value: s.value
  }
}

/**
 * Reads the values of a reactive into an array.
 * Use the `limit` or `elapsed` to limit how many
 * items to read, and/or for how long.
 * @param reactive 
 * @param options 
 * @returns 
 */
// export const toArray = async <V>(reactiveSource: ReactiveOrSource<V>, options: Partial<ToArrayOptions> = {}): Promise<Array<V>> => {
//   const source = resolveSource(reactiveSource);
//   const maxValues = options.limit ?? Number.MAX_SAFE_INTEGER;
//   const maxDuration = options.elapsed ?? Number.MAX_SAFE_INTEGER;
//   let buffer: Array<V> = [];

//   let start = -1;
//   const promise = new Promise<Array<V>>((resolve, _reject) => {
//     const done = () => {
//       off();
//       resolve(buffer);
//       buffer = []
//     }

//     const off = source.on(value => {
//       if (start === -1) start = Date.now();
//       if (messageIsSignal(value) && value.signal === `done`) {
//         done();
//       } else if (messageHasValue(value)) {
//         buffer.push(value.value);
//         if (buffer.length >= maxValues) {
//           done();
//         }
//       }
//       if (Date.now() - start > maxDuration) {
//         done();
//       }
//     });
//   })
//   return promise;
// }

export type ToArrayOptions<V> = {
  /**
   * Maximim time to wait for `limit` to be reached. 10s by default.
   */
  maximumWait: Interval
  /**
   * Number of items to read
   */
  limit: number
  /**
   * Behaviour if threshold is not reached.
   * partial: return partial results
   * throw: throw an error
   * fill: fill remaining array slots with `fillValue`
   */
  underThreshold: `partial` | `throw` | `fill`
  /**
   * Value to fill empty slots with if `underThreshold = 'fill'`.
   */
  fillValue: V
}

/**
 * By default, reads all the values from `source`, or until 5 seconds has elapsed.
 * 
 * If `limit` is provided as an option, it will exit early, or throw if that number of values was not acheived.
 * 
 * ```js
 * // Read from `source` for 5 seconds
 * const data = await toArrayOrThrow()(source);
 * // Read 5 items from `source`
 * const data = await toArrayOrThrow({ limit: 5 })(source);
 * // Read for 10s
 * const data = await toArrayOrThrow({ maximumWait: 10_1000 })(source);
 * ```
 * @param source 
 * @param options 
 * @returns 
 */
export async function toArrayOrThrow<V>(source: ReactiveOrSource<V>, options: Partial<ToArrayOptions<V>> = {}): Promise<Array<V>> {
  const limit = options.limit ?? Number.MAX_SAFE_INTEGER;
  const maximumWait = options.maximumWait ?? 5 * 1000;
  const v = await toArray(source, { limit, maximumWait, underThreshold: `partial` });

  // There was a limit, but it wasn't reached
  if (options.limit && v.length < options.limit) throw new Error(`Threshold not reached. Wanted: ${ options.limit }, got ${ v.length }`);

  // Otherwise, we may have been reading for a specified duration
  return v as Array<V>;

}

/**
 * Reads a set number of values from `source`, returning as an array. May contain
 * empty values if desired values is not reached.
 * 
 * After the limit is reached (or `source` completes), `source` is unsubscribed from.
 * 
 * If no limit is set, it will read until `source` completes or `maximumWait` is reached.
 * `maximumWait` is 10 seconds by default.
 * 
 * Use {@link toArrayOrThrow} to throw if desired limit is not reached.
 * 
 * ```js
 * // Read from `source` for 5 seconds
 * const data = await toArray()(source);
 * // Read 5 items from `source`
 * const data = await toArray({ limit: 5 })(source);
 * // Read for 10s
 * const data = await toArray({ maximumWait: 10_1000 })(source);
 * ```
 * @param source 
 * @param options 
 * @returns 
 */
export async function toArray<V>(source: ReactiveOrSource<V>, options: Partial<ToArrayOptions<V>> = {}): Promise<Array<V | undefined>> {
  const limit = options.limit ?? Number.MAX_SAFE_INTEGER;
  const maximumWait = intervalToMs(options.maximumWait, 10 * 1000);
  const underThreshold = options.underThreshold ?? `partial`
  const read: Array<V | undefined> = [];

  const rx = resolveSource(source);

  const promise = new Promise<Array<V | undefined>>((resolve, reject) => {

    const done = () => {
      clearTimeout(maxWait)
      unsub();
      if (read.length < limit && underThreshold === `throw`) {
        reject(new Error(`Threshold not reached. Wanted: ${ limit } got: ${ read.length }. Maximum wait: ${ maximumWait }`));
        return;
      }
      if (read.length < limit && underThreshold === `fill`) {
        for (let index = 0; index < limit; index++) {
          if (read[ index ] === undefined) read[ index ] = options.fillValue;
        }
      }
      resolve(read);
    }

    const maxWait = setTimeout(() => {
      done();
    }, maximumWait);

    const unsub = rx.on(message => {
      if (messageIsDoneSignal(message)) {
        done();
      } else if (messageHasValue(message)) {
        read.push(message.value);
        if (read.length === limit) {
          done();
        }
      }
    });
  });

  return promise;

}

// wrap(event<{ x: number, y: number }>(document.body, `pointerup`))
//   .batch({ elapsed: 200 })
//   .transform(v => v.length)
//   .value(v => { console.log(v) });