import { intervalToMs } from "@ixfxfun/core";
import { continuously } from "@ixfxfun/flow";
import type { CountOptions } from "./types.js";
import { initLazyStream } from "../init-stream.js";

/**
 * Produces an incrementing value. By default starts at 0 and counts
 * forever, incrementing every second.
 * 
 * ```js
 * const r = Rx.From.count();
 * r.onValue(c => {
 *  // 0, 1, 2, 3 ... every second
 * });
 * ```
 * 
 * The `limit` is exclusive
 * ```js
 * const r = Rx.From.count({limit:5});
 * // Yields 0,1,2,3,4
 * ```
 * 
 * If limit is less than start, it will count down instead.
 * ```js
 * const r = Rx.count({start:5, limit: 0});
 * // Yie:ds 5,4,3,2,1
 * ```
 * 
 * ```js
 * // Count 10, 12, 14 ... every 500ms
 * const r = Rx.From.count({ start: 10, amount: 2, interval: 500 });
 * ```
 * 
 * In addition to setting `limit` (which is exclusive), you can stop with an abort signal
 * ```js
 * const ac = new AbortController();
 * const r = Rx.From.count({signal:ac.signal});
 * ...
 * ac.abort(`stop`);
 * ```
 * @param options 
 */
export function count(options: Partial<CountOptions> = {}) {

  const lazy = options.lazy ?? `initial`;
  const interval = intervalToMs(options.interval, 1000);
  const amount = options.amount ?? 1;
  const offset = options.offset ?? 0;

  let produced = 0;
  let value = offset;

  const done = (reason: string) => {
    events.dispose(reason);
  }

  const timer = continuously(() => {
    if (options.signal?.aborted) {
      done(`Aborted (${ options.signal.reason })`);
      return false;
    }
    events.set(value);
    value += 1;
    produced++;
    if (produced >= amount) {
      done(`Limit reached`);
      return false;
    }
  }, interval);

  const events = initLazyStream<number>({
    onStart() {
      timer.start();
    },
    onStop() {
      timer.cancel();
    },
    onDispose() {
      timer.cancel();
    },
    lazy
  });
  return events;
}
