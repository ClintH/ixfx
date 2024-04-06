/* eslint-disable @typescript-eslint/unbound-method */
import type { Reactive, ReactiveDisposable, ReactiveInitial, ReactiveNonInitial, ReactiveOrSource, ReactiveWritable, BatchOptions, ReactiveOp, InitStreamOptions, ThrottleOptions, DebounceOptions, CacheOpts } from "./Types.js";
import { messageHasValue, messageIsDoneSignal, opify } from "./Util.js";
export * from './Ops.js';
export * from './Graph.js';
export * from './Types.js';
export * from './ToArray.js';
export * from './ToGenerator.js';
export * from './FromArray.js';
export * from './FromGenerator.js';
export * from './FromEvent.js';
export * from './Util.js';
export * from './Wrap.js';
import * as OpFns from './Ops.js';
export * from './Lit.js';
export * from './ReadFromArray.js';
export * from './FromFunction.js';
export * from './FromProxy.js';
export * from './FromObject.js';
export * from './ResolveSource.js';
export * from './Count.js';
export * as Dom from './Dom.js';
import { initStream } from "./InitStream.js";
import { type Interval, intervalToMs } from '../flow/IntervalType.js';
import { resolveSource } from './ResolveSource.js';
import { pinged } from "./FromFunction.js";


export function boolean(initialValue: boolean): ReactiveDisposable & ReactiveWritable<boolean> & ReactiveInitial<boolean>;
export function boolean(): ReactiveDisposable & ReactiveWritable<boolean> & ReactiveNonInitial<boolean>;
export function boolean(initialValue?: boolean): ReactiveDisposable & ReactiveWritable<boolean> & (ReactiveNonInitial<boolean> | ReactiveInitial<boolean>) {
  let value = initialValue;
  const events = initStream<boolean>();

  const set = (v: boolean) => {
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


/**
 * Creates a Reactive from an AsyncGenerator or Generator
 * @param gen 
 * @returns 
 */
// export function readFromGenerator<V>(gen: AsyncGenerator<V> | Generator<V>) {
//   const rx = initStream<V>();
//   // eslint-disable-next-line @typescript-eslint/no-misused-promises
//   setTimeout(async () => {
//     try {
//       for await (const value of gen) {
//         rx.set(value);
//       }
//       rx.dispose(`Source generator complete`);
//     } catch (error) {
//       console.error(error);
//       rx.dispose(`Error while iterating`);
//     }
//   }, 1);
//   return rx;
// }


export const Ops = {
  annotate: <V, TAnnotation>(transformer: (input: V) => V & TAnnotation) => opify(OpFns.annotate, transformer),
  annotateElapsed: <V>() => opify<V>(OpFns.annotateElapsed),
  cache: <V>(opts: Partial<CacheOpts<V>>): ReactiveOp<V, V> => {
    return opify<V>(OpFns.cache, opts);
  },
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
  filter: <V>(predicate: (value: V) => boolean) => opify(OpFns.filter, predicate),
  transform: <In, Out>(transformer: ((value: In) => Out)): ReactiveOp<In, Out> => {
    return (source: ReactiveOrSource<In>) => {
      return OpFns.transform(source, transformer);
    }
  },
  throttle: <V>(options: Partial<ThrottleOptions>) => opify<V>(OpFns.throttle, options)
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

// export function derived<T>(compute: () => T, dependencies) {

// }


//const isEven = derived(() => (counter.last() & 1) == 0);

