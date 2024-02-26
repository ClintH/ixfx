/* eslint-disable @typescript-eslint/unbound-method */
import * as Immutable from '../Immutable.js';
import type { Passed, EventOptions, ObjectOptions, Optional, Reactive, ReactiveDiff, ReactiveDisposable, ReactiveInitial, ReactiveNonInitial, ReactiveOrSource, ReactiveWritable, BatchOptions, ReactiveOp, InitStreamOptions, ThrottleOptions, DebounceOptions } from "./Types.js";
import { symbol } from './Types.js';
import { messageHasValue, opify } from "./Util.js";
export * from './Ops.js';
export * from './Graph.js';
export * from './Types.js';
export * from './ToArray.js';
export * from './ToGenerator.js';
export * from './FromArray.js';
export * from './FromGenerator.js';
export * from './Util.js';
export * from './Wrap.js';
import * as OpFns from './Ops.js';
export * as Dom from './Dom.js';
import { initStream } from "./InitStream.js";

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

export function fromEvent<V extends Record<string, any>>(target: EventTarget | null, name: string, options: EventOptions<V>): ReactiveInitial<V> & ReactiveDisposable;

export function fromEvent<V extends Record<string, any>>(target: EventTarget | null, name: string, options?: Optional<EventOptions<V>, `process`>): ReactiveNonInitial<V> & ReactiveDisposable;

/**
 * Subscribes to an event, emitting data
 * @param target Event emitter
 * @param name Event name
 * @param options Options
 * @returns 
 */
export function fromEvent<V extends Record<string, any>>(target: EventTarget | null, name: string, options: Partial<EventOptions<V>> = {}): (ReactiveInitial<V> | ReactiveNonInitial<V>) & ReactiveDisposable {
  if (target === null) throw new Error(`Param 'target' is null`);
  const process = options.process;
  const initialValue = process ? process() : undefined;
  const debugLifecycle = options.debugLifecycle ?? false;
  const debugFiring = options.debugFiring ?? false;
  const rxObject = initialValue ? fromObject<V>(initialValue, { deepEntries: true }) : fromObject<V>(undefined, { deepEntries: true });
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
 * Reactive stream of array of elements that match `query`.
 * @param query 
 * @returns 
 */
export function fromQuery(query: string) {
  const elements = [ ...document.querySelectorAll(query) ] as Array<HTMLElement>;

  return fromObject(elements);
  /// TODO: MutationObserver to update element list
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

export function fromObject<V extends Record<string, any>>(initialValue: V, options?: Partial<ObjectOptions<V>>): ReactiveDiff<V> & ReactiveInitial<V>;

export function fromObject<V extends Record<string, any>>(initialValue: undefined, options?: Partial<ObjectOptions<V>>): ReactiveDiff<V> & ReactiveNonInitial<V>;


/**
 * Creates a Reactive wrapper with the shape of the input object.
 * 
 * Changing the wrapped object directly does not update the Reactive. 
 * Instead, to update values use:
 * * `set()`, 'resets' the whole object
 * * `update()` changes a particular field
 * 
 * Consider using {@link fromProxy} to return a object with properties that can be
 * set in the usual way yet is also Reactive.
 * 
 * ```js
 * const o = fromObject({ name: `bob`, level: 2 });
 * o.on(value => {
 *  const changed = value.value;
 * });
 * o.set({ name: `mary`, level: 3 });
 * 
 * // `on` will get called, with `changed` having a value of:
 * // { name: `mary`, level: 3 }
 * ```
 * 
 * Use `last()` to get the most recently set value.
 * 
 * `onDiff` subscribes to a rough diff of the object.
 * 
 * ```js
 * const o = fromObject({ name: `bob`, level: 2 });
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
export function fromObject<V extends Record<string, any>>(initialValue?: V, options: Partial<ObjectOptions<V>> = {}): ReactiveDisposable & ReactiveDiff<V> & (ReactiveInitial<V> | ReactiveNonInitial<V>) {
  const eq = options.eq ?? Immutable.isEqualContextString;
  const setEvent = initStream<V>();
  const diffEvent = initStream<Array<Immutable.Change<any>>>();

  let value: V | undefined = initialValue;
  let disposed = false;

  const set = (v: V) => {
    if (value !== undefined) {
      const diff = Immutable.compareData(value, v, { ...options, includeMissingFromA: true });
      console.log(`Rx.fromObject.set diff`, diff);
      if (diff.length === 0) return;
      diffEvent.set(diff);
    }

    value = v;
    setEvent.set(v);
  }

  const update = (toMerge: Partial<V>) => {
    // eslint-disable-next-line unicorn/prefer-ternary
    if (value === undefined) {
      value = toMerge as V;
    } else {
      const diff = Immutable.compareData(toMerge, value);
      // console.log(`Rx.fromObject.update value: ${ JSON.stringify(value) }`);
      // console.log(`Rx.fromObject.update  diff: ${ JSON.stringify(diff) }`);
      if (diff.length === 0) return; // No changes
      value = {
        ...value,
        ...toMerge
      }
      diffEvent.set(diff);
    }
    setEvent.set(value);
  }

  const updateField = (path: string, valueForField: any) => {
    if (value === undefined) throw new Error(`Cannot update value when it has not already been set`);
    //console.log(`Rx.fromObject.updateField path: ${ path } value: ${ JSON.stringify(valueForField) }`);

    const existing = Immutable.getField<any>(value, path);
    //console.log(`Rx.fromObject.updateField path: ${ path } existing: ${ JSON.stringify(existing) }`);
    if (eq(existing, valueForField, path)) {
      //console.log(`Rx.object.updateField identical existing: ${ existing } value: ${ valueForField } path: ${ path }`);
      return;
    }
    let diff = Immutable.compareData(existing, valueForField, { ...options, includeMissingFromA: true });
    diff = diff.map(d => {
      if (d.path.length > 0) return { ...d, path: path + `.` + d.path };
      return { ...d, path };
    })

    //console.log(`Rx.fromObject.updateField diff`, diff);
    const o = Immutable.updateByPath(value, path, valueForField);
    value = o;
    //diffEvent.set([ { path, value: valueForField, previous: existing } ]);

    diffEvent.set(diff);
    setEvent.set(o);
    //console.log(`Rx.fromObject.updateField: path: '${ path }' value: '${ JSON.stringify(valueForField) }' o: ${ JSON.stringify(o) }`);
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

/**
 * Creates a Reactive from an AsyncGenerator or Generator
 * @param gen 
 * @returns 
 */
export function fromGenerator<V>(gen: AsyncGenerator<V> | Generator<V>) {
  const rx = initStream<V>();
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  setTimeout(async () => {
    try {
      for await (const value of gen) {
        rx.set(value);
      }
      rx.dispose(`Source generator complete`);
    } catch (error) {
      console.error(error);
      rx.dispose(`Error while iterating`);
    }
  }, 1);
  return rx;
}

export const Ops = {
  batch: <V>(options: Partial<BatchOptions>): ReactiveOp<V, Array<V>> => {
    return (source: ReactiveOrSource<V>) => {
      return OpFns.batch(source, options);
    }
  },
  debounce: <V>(options: Partial<DebounceOptions>): ReactiveOp<V, V> => {
    return (source: ReactiveOrSource<V>) => {
      return OpFns.debounce(source, options);
    }
  },
  transform: <In, Out>(transformer: ((value: In) => Out)): ReactiveOp<In, Out> => {
    return (source: ReactiveOrSource<In>) => {
      return OpFns.transform(source, transformer);
    }
  },
  throttle: <V>(options: Partial<ThrottleOptions>) => opify<V>(OpFns.throttle, options)
} as const;

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



export type ReactiveProxied<V> = V & {
  [ symbol ]: ReactiveDiff<V> & ReactiveInitial<V>
}
/**
 * Creates a proxy of `target`, so that regular property setting will be intercepted and output
 * on a {@link Reactive} object as well.
 * 
 * ```js
 * const { proxy, rx } = fromProxy({ colour: `red`, x: 10, y: 20 });
 * 
 * rx.value(v => {
 *  // Get notified when proxy is changed
 * });
 * 
 * // Get and set properties as usual
 * console.log(proxy.x);
 * proxy.x = 20; // Triggers Reactive
 * ```
 * 
 * Keep in mind that changing `target` directly won't affect the proxied object or Reactive. Thus,
 * only update the proxied object after calling `fromProxy`.
 * 
 * The benefit of `fromProxy` instead of {@link fromObject} is because the proxied object can be passed to other code that doesn't need
 * to know anything about Reactive objects.
 * 
 * You can assign the return values to more meaningful names using
 * JS syntax.
 * ```js
 * const { proxy:colour, rx:colourRx } = fromProxy({ colour: `red` });
 * ```
 * 
 * See also:
 * * {@link fromProxySymbol}: Instead of {proxy,rx} return result, puts the `rx` under a symbol on the proxy.
 * @param target 
 * @returns 
 */
export const fromProxy = <V extends object>(target: V): { proxy: V, rx: ReactiveDiff<V> & ReactiveInitial<V> } => {
  const rx = fromObject(target);

  const proxy = new Proxy(target, {
    set(target, p, newValue, _receiver) {
      if (typeof p === `string`) {
        //console.log(`Rx.fromProxy set: ${ JSON.stringify(p) } to: ${ JSON.stringify(newValue) }`);
        rx.updateField(p, newValue);
      }

      (target as any)[ p ] = newValue;
      return true;
    },
  });
  return { proxy, rx }
}

/**
 * Same as {@link fromProxy}, but the return value is the proxied object along with 
 * the Reactive wrapped as symbol property.
 * 
 * ```js
 * const person = Rx.fromProxySymbol({name: `marie` });
 * person.name = `blah`;
 * person[Rx.symbol].on(msg => {
 *  // Value changed...
 * });
 * ```
 * 
 * This means of access can be useful as the return result is a bit neater, being a single object instead of two. 
 * @param target 
 * @returns 
 */
export const fromProxySymbol = <V extends object>(target: V): ReactiveProxied<V> => {
  const { proxy, rx } = fromProxy(target);

  const p = proxy as ReactiveProxied<V>;
  p[ symbol ] = rx;
  return p;
}

// wrap(event<{ x: number, y: number }>(document.body, `pointerup`))
//   .batch({ elapsed: 200 })
//   .transform(v => v.length)
//   .value(v => { console.log(v) });