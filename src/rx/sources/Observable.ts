/* eslint-disable @typescript-eslint/unbound-method */
import type { Reactive, ReactiveWritable } from "../Types.js";
import { messageHasValue } from "../Util.js";
import { manual } from "../index.js";

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
