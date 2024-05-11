import { getErrorMessage } from "../../debug/GetErrorMessage.js";
import { continuously } from "../../flow/Continuously.js";
import { intervalToMs } from "../../flow/IntervalType.js";
import { sleep } from "../../flow/Sleep.js";
import { initLazyStream } from "../InitStream.js";
import type { FunctionFunction, FunctionOptions } from "./Types.js";


/**
 * Produces a reactive from the basis of a function. `callback` is executed, with its result emitted via the returned reactive.
 * 
 * See also {@link Rx.From.pinged} to trigger a function whenever another Reactive emits a value.
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
// eslint-disable-next-line unicorn/prevent-abbreviations
export function func<V>(callback: FunctionFunction<V>, options: Partial<FunctionOptions> = {}) {
  const maximumRepeats = options.maximumRepeats ?? Number.MAX_SAFE_INTEGER;
  const closeOnError = options.closeOnError ?? true;
  const interval = intervalToMs(options.interval, 1);
  const loop = options.interval !== undefined;
  const predelay = intervalToMs(options.predelay, 1);
  const lazy = options.lazy ?? `very`;
  const signal = options.signal;

  const internalAbort = new AbortController();
  const internalAbortCallback = (reason: string) => { internalAbort.abort(reason) };
  let sentResults = 0;
  if (options.maximumRepeats && !loop) throw new Error(`'maximumRepeats' has no purpose if 'loop' is not set to true`);



  // const events = initStream<V>({
  //   onFirstSubscribe() {
  //     if (run.runState === `idle`) run.start();
  //   },
  //   onNoSubscribers() {
  //     console.log(`Rx.fromFunction onNoSubscribers. lazy: ${ lazy }`);
  //     if (lazy === `very`) {
  //       run.cancel();
  //     }
  //   },
  // })

  const done = (reason: string) => {
    //console.log(`Rx.fromFunction done ${ reason }`);
    events.dispose(reason);
    run.cancel();
  }

  const run = continuously(async () => {
    if (predelay) await sleep(predelay);

    try {
      if (signal?.aborted) {
        done(`Signal (${ signal.aborted })`);
        return false;
      }
      const value = await callback(internalAbortCallback);
      events.set(value);
      sentResults++;

    } catch (error) {
      if (closeOnError) {
        done(`Function error: ${ getErrorMessage(error) }`);
        return false;
      } else {
        events.signal(`warn`, getErrorMessage(error));
      }
    }
    if (!loop) {
      done(`fromFunction done`);
      return false; // Stop loop
    }
    if (internalAbort.signal.aborted) {
      done(`callback function aborted (${ internalAbort.signal.reason })`);
      return false
    }
    if (sentResults >= maximumRepeats) {
      done(`Maximum repeats reached ${ maximumRepeats.toString() }`);
      return false; // Stop loop
    }

  }, interval);

  const events = initLazyStream<V>({
    lazy,
    onStart() {
      run.start();
    },
    onStop() {
      run.cancel();
    },
  });

  if (lazy === `never`) run.start();
  return events;
}