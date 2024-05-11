import { getErrorMessage } from "../../debug/GetErrorMessage.js";
import { initLazyStream, initStream } from "../InitStream.js";
import type { Reactive, Unsubscriber } from "../Types.js";
import { messageHasValue, messageIsDoneSignal, messageIsSignal } from "../Util.js";
import type { PingedFunctionOptions, PingedFunctionFunction } from "./Types.js";


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