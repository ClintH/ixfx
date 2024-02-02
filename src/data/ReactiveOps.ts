import { type Interval, intervalToMs } from "../flow/IntervalType.js";
import { type Reactive, type ReactiveWritable, messageHasValue, messageIsSignal, isDisposable, initEvent, type InitEventOptions, type ReactiveOrSource, initUpstream, messageIsDoneSignal } from "./Reactive.js";
import { QueueMutable } from "../collections/index.js";
import { continuously } from "../flow/Continuously.js";

export type TransformOpts = InitEventOptions;

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

export type FieldOptions<V> = InitEventOptions & {

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
      if (!messageIsSignal(valueChanged)) {
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
      if (messageIsSignal(valueChanged)) {
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
  const event = initEvent<V>({
    onFirstSubscribe() {
      if (lazy && !c.isRunning) c.start();
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
      event.notify(value);
    } else {
      event.notify(callbackOrValue);
    }
    remaining--;
    if (remaining === 0) return false; // Stop loop
  }, intervalMs);


  if (!lazy) c.start();

  const r: Reactive<V> = {
    on: event.on
  }
  return r;
}

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
      let t = (value)[ field ];
      if (t === undefined && options.missingFieldDefault !== undefined) {
        // @ts-expect-error
        t = options.missingFieldDefault as Out;
      }
      upstream.notify(t as Out);
    },
  })

  return {
    on: upstream.on
  }
}


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

