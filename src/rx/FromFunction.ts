import { getErrorMessage } from "../debug/GetErrorMessage.js";
import { continuously } from "../flow/Continuously.js";
import { intervalToMs } from "../flow/IntervalType.js";
import { sleep } from "../flow/Sleep.js";
import { initStream } from "./InitStream.js";
import type { FromFunctionOptions, PingedFunctionOptions, Reactive, Unsubscriber } from "./Types.js";
import { messageHasValue, messageIsDoneSignal, messageIsSignal } from "./Util.js";

/**
 * Function which returns a result. Or promised result.
 * 
 * `abort` value is a callback to exit out of looped execution.
 */
export type FromFunctionFunction<T> = ((abort: (reason: string) => void) => T) | ((abort: (reason: string) => void) => Promise<T>);
/**
 * Function which returns a result. Or promised result.
 * Takes a `value` as first parameter, and callback to signal an abort as the second.
 */
export type PingedFunctionFunction<T, TSource> = ((value: TSource, abort: (reason: string) => void) => T) | ((value: TSource, abort: (reason: string) => void) => Promise<T>);



/**
 * Creates a reactive with `callback` as a value source. This gets called whenever `source` emits a value.
 *
 * @param callback 
 * @param source 
 * @param options 
 * @returns 
 */
export function pinged<T, TSource>(source: Reactive<TSource>, callback: PingedFunctionFunction<T, TSource>, options: Partial<PingedFunctionOptions> = {}) {
  const closeOnError = options.closeOnError ?? true;
  const lazy = options.lazy ?? `initial`;

  const internalAbort = new AbortController();
  const internalAbortCallback = (reason: string) => { internalAbort.abort(reason) };

  let upstreamOff: Unsubscriber | undefined;

  if (options.signal) {
    options.signal.addEventListener(`abort`, (_) => {
      done(`Signal received (${ options.signal?.reason })`);
    })
  }

  const events = initStream<T>({
    onFirstSubscribe() {
      if (lazy !== `never` && upstreamOff === undefined) start();
    },
    onNoSubscribers() {
      // Unsubscribe from source if we're very lazy
      // Stay subscribed if we're only initially lazy or not lazy at all
      if (lazy === `very` && upstreamOff !== undefined) {
        upstreamOff();
        upstreamOff = undefined;
      }
    },
  })

  const start = () => {
    upstreamOff = source.on(message => {
      if (messageIsDoneSignal(message)) {
        done(`Upstream closed`);
      } else if (messageIsSignal(message)) {
        events.signal(message.signal);
      } else if (messageHasValue(message)) {
        void trigger(message.value);
      }
    });
  }

  const done = (reason: string) => {
    events.dispose(reason);
    if (upstreamOff) upstreamOff();
  }

  const trigger = async (value: TSource) => {
    try {
      const v = await callback(value, internalAbortCallback);
      events.set(v);
      // Feedback from callback
      if (internalAbort.signal.aborted) {
        done(`callback function aborted (${ internalAbort.signal.reason })`);
        return false
      }
    } catch (error) {
      if (closeOnError) {
        done(`Function error: ${ getErrorMessage(error) }`);
        return false;
      } else {
        events.signal(`warn`, getErrorMessage(error));
      }
    }
  }

  if (lazy === `never`) start();
  return events;
}

/**
 * Produces a reactive from the basis of a function. `callback` is executed, with its result emitted via the returned reactive.
 * 
 * See also {@link pinged} to trigger a function based on another Reactive.
 * 
 * ```js
 * // Produce a random number every second
 * const r = Rx.fromFunction(Math.random, { interval: 1000 });
 * ```
 * 
 * `callback` can be called repeatedly by providing the `interval` option to set the rate of repeat.
 * Looping can be limited with `options.maximumRepeats`, or passing a signal `options.signal`
 * and then activating it. 
 * ```js
 * fromFunction(Math.ra
 * ```
 * The third option is for `callback` to fire provided abort function.
 * ```js
 * fromFunction((abort) => {
 *  if (Math.random() > 0.5) abort('Random exit');
 *  return 1;
 * });
 * ```
 *
 * By default has 'start' laziness, meaning that `callback` is not executed until there is a subscriber,
 * but then continues even when no subscribers.
 * 
 * By default stream closes if `callback` throws an error. Use `options.closeOnError:'ignore'` to change.
 * @param callback 
 * @param options 
 * @returns 
 */
export function fromFunction<V>(callback: FromFunctionFunction<V>, options: Partial<FromFunctionOptions> = {}) {
  const maximumRepeats = options.maximumRepeats ?? Number.MAX_SAFE_INTEGER;
  const closeOnError = options.closeOnError ?? true;
  const interval = intervalToMs(options.interval, 1);
  const loop = options.interval !== undefined;
  const predelay = intervalToMs(options.predelay, 1);
  const lazy = options.lazy ?? `initial`;
  const signal = options.signal;

  const internalAbort = new AbortController();
  const internalAbortCallback = (reason: string) => { internalAbort.abort(reason) };
  let sentResults = 0;
  if (options.maximumRepeats && !loop) throw new Error(`'maximumRepeats' has no purpose if 'loop' is not set to true`);

  const events = initStream<V>({
    onFirstSubscribe() {
      if (run.runState === `idle`) run.start();
    },
    onNoSubscribers() {
      if (lazy === `very`) {
        run.cancel();
      }
    },
  })

  const done = (reason: string) => {
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

  if (lazy === `never`) run.start();
  return events;
}