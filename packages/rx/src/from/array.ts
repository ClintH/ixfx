
import { continuously } from "@ixfx/core";
import { intervalToMs } from "@ixfx/core";
import { initLazyStream } from "../init-stream.js";
import type { Reactive, ReactiveFinite, ReactiveInitial } from "../types.js";
import type { ArrayOptions } from "./types.js";

export const of = <V>(source: V[] | Iterable<V>, options: Partial<ArrayOptions> = {}) => {
  if (Array.isArray(source)) {
    return array(source, options);
  } else {}
}

/**
 * Reads the contents of `array` into a Reactive, with optional time interval
 * between values. A copy of the array is used, so changes will not
 * affect the reactive.
 * 
 * See also {@link arrayObject} which monitors changes to array values.
 *
 * Reads items from an array with a given interval, by default 5ms
 * 
 * ```js
 * const data = [`apples`, `oranges`, `pears` ];
 * const rx = Rx.From.array(data);
 * rx.onValue(v => {
 *  // v will be each fruit in turn
 * })
 * ```
 * 
 * Note that there is the possibility of missing values since there is delay between subscribing and when items start getting emitted.
 * If a new subscriber connects to the reactive, they won't get values already emitted.
 * @param sourceArray 
 * @param options 
 * @returns 
 */
export const array = <V>(sourceArray: V[], options: Partial<ArrayOptions> = {}): Reactive<V> & ReactiveFinite & ReactiveInitial<V> => {
  const lazy = options.lazy ?? `initial`;
  const signal = options.signal;
  const whenStopped = options.whenStopped ?? `continue`;
  const debugLifecycle = options.debugLifecycle ?? false;
  const array = [ ...sourceArray ];

  if (lazy !== `very` && whenStopped === `reset`) throw new Error(`whenStopped:'reset' has no effect with 'lazy:${ lazy }'. Use lazy:'very' instead.`);

  const intervalMs = intervalToMs(options.interval, 5);
  let index = 0;
  let lastValue = array[ 0 ];

  const s = initLazyStream<V>({
    ...options,
    lazy,
    onStart() {
      if (debugLifecycle) console.log(`Rx.readFromArray:onStart`);
      c.start();
    },
    onStop() {
      if (debugLifecycle) console.log(`Rx.readFromArray:onStop. whenStopped: ${ whenStopped } index: ${ index }`);

      c.cancel();
      if (whenStopped === `reset`) index = 0;
    },
    // onFirstSubscribe() {
    //   if (debugLifecycle) console.log(`Rx.readFromArray:onFirstSubscribe lazy: ${ lazy } runState: '${ c.runState }'`);
    //   // Start if in lazy mode and not running
    //   if (lazy !== `never` && c.runState === `idle`) c.start();
    // },
    // onNoSubscribers() {
    //   if (debugLifecycle) console.log(`Rx.readFromArray:onNoSubscribers lazy: ${ lazy } runState: '${ c.runState }' whenStopped: '${ whenStopped }'`);
    //   if (lazy === `very`) {
    //     c.cancel();
    //     if (whenStopped === `reset`) {
    //       index = 0;
    //     }
    //   }
    // }
  });

  const c = continuously(() => {
    if (signal?.aborted) {
      s.dispose(`Signalled (${ signal.reason })`);
      return false; // stop looping
    }
    lastValue = array[ index ];
    index++;

    s.set(lastValue)
    if (index === array.length) {
      s.dispose(`Source array complete`);
      return false; // stop loop
    }
  }, intervalMs);

  if (!lazy) c.start();

  return {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    dispose: s.dispose,
    // eslint-disable-next-line @typescript-eslint/unbound-method
    isDisposed: s.isDisposed,
    isDone() {
      return index === array.length;
    },
    last() {
      return lastValue;
    },
    // eslint-disable-next-line @typescript-eslint/unbound-method
    on: s.on,
    // eslint-disable-next-line @typescript-eslint/unbound-method
    onValue: s.onValue
  }
}