import { continuously, intervalToMs } from "@ixfxfun/core";
import { getErrorMessage } from "@ixfxfun/debug";

import { sleep } from "@ixfxfun/core";
import { initLazyStream } from "../init-stream.js";
import type { ReactivePingable } from "../types.js";
import type { FunctionFunction, FunctionOptions } from "./types.js";


/**
 * Produces a reactive from the basis of a function. `callback` is executed, with its result emitted via the returned reactive.
 * 
 * ```js
 * // Produce a random number every second
 * const r = Rx.From.func(Math.random, { interval: 1000 });
 * ```
 * 
 * `callback` can be called repeatedly by providing the `interval` option to set the rate of repeat.
 * Looping can be limited with `options.maximumRepeats`, or passing a signal `options.signal`
 * and then activating it. 
 * ```js
 * // Reactive that emits a random number every second, five times
 * const r1 = Rx.From.func(Math.random, { interval: 1000, maximumRepeats: 5 }
 * ```
 * 
 * ```js
 * // Generate a random number every second until ac.abort() is called
 * const ac = new AbortController();
 * const r2 = Rx.From.func(Math.random, { interval: 1000, signal: ac.signal });
 * ```
 * 
 * The third option is for `callback` to fire the provided abort function.
 * ```js
 * Rx.From.func((abort) => {
 *  if (Math.random() > 0.5) abort('Random exit');
 *  return 1;
 * });
 * ```
 *
 * By default has a laziness of 'very' meaning that `callback` is run only when there's a subscriber 
 * By default stream closes if `callback` throws an error. Use `options.closeOnError:'ignore'` to change.
 * @param callback 
 * @param options 
 * @returns 
 */

export function func<V>(callback: FunctionFunction<V>, options: Partial<FunctionOptions> = {}): ReactivePingable<V> {
  const maximumRepeats = options.maximumRepeats ?? Number.MAX_SAFE_INTEGER;
  const closeOnError = options.closeOnError ?? true;
  const intervalMs = options.interval ? intervalToMs(options.interval) : -1;
  let manual = options.manual ?? false;

  // If niether interval or manual is set, assume manual
  if (options.interval === undefined && options.manual === undefined) manual = true;

  if (manual && options.interval) throw new Error(`If option 'manual' is set, option 'interval' cannot be used`);
  const predelay = intervalToMs(options.predelay, 0);
  const lazy = options.lazy ?? `very`;
  const signal = options.signal;

  const internalAbort = new AbortController();
  const internalAbortCallback = (reason: string) => { internalAbort.abort(reason) };
  let sentResults = 0;
  let enabled = false;

  const done = (reason: string) => {
    events.dispose(reason);
    enabled = false;
    if (run) run.cancel();
  }

  const ping = async () => {
    if (!enabled) return false;
    if (predelay) await sleep(predelay);
    if (sentResults >= maximumRepeats) {
      done(`Maximum repeats reached ${ maximumRepeats.toString() }`);
      return false;
    }
    //console.log(`sent: ${ sentResults } max: ${ maximumRepeats }`);
    try {
      if (signal?.aborted) {
        done(`Signal (${ signal.aborted })`);
        return false;
      }
      const value = await callback(internalAbortCallback);
      sentResults++;
      events.set(value);
      return true;
    } catch (error) {
      if (closeOnError) {
        done(`Function error: ${ getErrorMessage(error) }`);
        return false;
      } else {
        events.signal(`warn`, getErrorMessage(error));
        return true;
      }
    }
  }

  const run = manual ? undefined : continuously(async () => {
    const pingResult = await ping();
    if (!pingResult) return false;

    // if (!loop) {
    //   done(`fromFunction done`);
    //   return false; // Stop loop
    // }
    if (internalAbort.signal.aborted) {
      done(`callback function aborted (${ internalAbort.signal.reason })`);
      return false
    }

  }, intervalMs);

  const events = initLazyStream<V>({
    lazy,
    onStart() {
      enabled = true;
      if (run) run.start();
    },
    onStop() {

      enabled = false;
      if (run) run.cancel();
    },
  });

  if (lazy === `never` && run) run.start();
  return { ...events, ping };
}

