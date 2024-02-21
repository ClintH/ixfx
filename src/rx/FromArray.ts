/* eslint-disable @typescript-eslint/unbound-method */
import { continuously } from "../flow/Continuously.js";
import { intervalToMs } from "../flow/IntervalType.js";
import { initStream } from "./InitStream.js";
import type { FromArrayOptions, ReactiveFinite, ReactiveInitial, Reactive } from "./Types.js";

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