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
}

export type PassedValue<V> = Passed<V> & {
  value: V
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
}

/**
 * Initialises a reactive that pipes values to listeners directly.
 * @returns 
 */
export function manual<V>(): Reactive<V> & ReactiveWritable<V> {
  const events = initEvent<V>();
  return {
    set(value: V) {
      events.notify(value);
    },
    on: events.on
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
      diffEvent.notify(diff);
      //diffEvent.notify(pd);
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

/**
 * @ignore
 * @param options 
 * @returns 
 */
export function initEvent<V>(options: Partial<InitEventOptions> = {}) {
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
      //console.log(`initEvent:dispose (${ reason }) disposed: ${ disposed }`);
      if (disposed) return;
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
   * pause: stop at last array index
   * reset: go back to 0
   * empty: continue, despite there being no listeners (default)
   */
  idle: `` | `pause` | `reset`
}

export const fromArray = <V>(array: Array<V>, options: Partial<FromArrayOptions> = {}): Reactive<V> & ReactiveFinite & ReactiveInitial<V> => {
  const lazy = options.lazy ?? false;
  const idle = options.idle ?? ``;
  const intervalMs = intervalToMs(options.intervalMs, 5);
  let index = 0;
  let lastValue = array[ 0 ];

  const s = initEvent<V>({
    onFirstSubscribe() {
      //console.log(`Rx.fromArray onFirstSubscribe. Lazy: ${ lazy } reader running: ${ c.isRunning }`);
      // Start if in lazy mode and not running
      if (lazy && !c.isRunning) c.start();
    },
    onNoSubscribers() {
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
    lastValue = array[ index ];
    index++;

    s.notify(lastValue)
    if (index === array.length) {
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
    on: s.on
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
 * Reads a set number of values from `source`, returning as an array.
 * After the limit is reached (or source completes), the source is unsubscribed from.
 * 
 * If no limit is set, it will read until `source` completes or `maximumWait` is reached.
 * `maximumWait` is 10 seconds by default.
 * 
 * Use {@link toArrayOrThrow} if want to throw if limit is not reached.
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

