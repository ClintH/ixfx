import { continuously } from "../flow/Continuously.js";
import { intervalToMs } from "../flow/IntervalType.js";
import { initStream } from "./InitStream.js";
import type { ReadFromArrayOptions, Reactive, ReactiveFinite, ReactiveInitial } from "./Types.js";

/**
 * Reads the contents of `array` into a Reactive, with optional time interval
 * between values. A copy of the array is used, so changes will not
 * affect the reactive.
 * 
 * See also {@link fromArray} which monitors changes to array values.
 *
 * @param array 
 * @param options 
 * @returns 
 */
export const readFromArray = <V>(sourceArray: Array<V>, options: Partial<ReadFromArrayOptions> = {}): Reactive<V> & ReactiveFinite & ReactiveInitial<V> => {
  const lazy = options.lazy ?? `initial`;
  const signal = options.signal;
  const whenStopped = options.whenStopped ?? `continue`;
  const debugLifecycle = options.debugLifecycle ?? false;
  const array = [ ...sourceArray ];

  const intervalMs = intervalToMs(options.interval, 5);
  let index = 0;
  let lastValue = array[ 0 ];

  const s = initStream<V>({
    onFirstSubscribe() {
      if (debugLifecycle) console.log(`Rx.readFromArray:onFirstSubscribe lazy: ${ lazy } runState: '${ c.runState }'`);
      // Start if in lazy mode and not running
      if (lazy !== `never` && c.runState === `idle`) c.start();
    },
    onNoSubscribers() {
      if (debugLifecycle) console.log(`Rx.readFromArray:onNoSubscribers lazy: ${ lazy } runState: '${ c.runState }' whenStopped: '${ whenStopped }'`);
      if (lazy === `very`) {
        c.cancel();
        if (whenStopped === `reset`) {
          index = 0;
        }
      }
    }
  });

  const c = continuously(() => {
    //console.log(`Rx.fromArray loop index ${ index } lazy: ${ lazy }`);
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
    isDone() {
      return index === array.length;
    },
    last() {
      return lastValue;
    },
    // eslint-disable-next-line @typescript-eslint/unbound-method
    on: s.on,
    // eslint-disable-next-line @typescript-eslint/unbound-method
    value: s.value
  }
}