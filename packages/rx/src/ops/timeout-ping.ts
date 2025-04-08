import { intervalToMs } from "@ixfxfun/core";
import { initUpstream } from "../init-stream.js";
import { resolveSource } from "../resolve-source.js";
import type { ReactiveOrSource, Reactive, ReactivePingable } from "../types.js";
import { isPingable, isTrigger, messageHasValue, messageIsDoneSignal, resolveTriggerValue } from "../util.js";
import type { TimeoutPingOptions, TimeoutValueOptions } from "../from/types.js";

/**
 * Pings a reactive if no value is emitted at after `interval`.
 * Returns `source`.
 * 
 * ```js
 * // Ping `source` if no value is emitted after one minute
 * const r = Rx.timeoutPing(source, { mins: 1 });
 * ```
 * 
 * Behavior can be stopped using an abort signal.
 * @see {@link ReactivePingable}
 * @param source 
 * @param options 
 */
export function timeoutPing<TSource>(source: ReactiveOrSource<TSource>, options: TimeoutPingOptions): Reactive<TSource> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const rx = resolveSource(source);
  const abort = options.abort;
  const timeoutMs = intervalToMs(options, 1000);

  // Send ping
  const sendPing = () => {
    if (abort?.aborted || rx.isDisposed()) {
      off();
      return;
    }
    if (isPingable(rx)) rx.ping(); // ignore if not pingable
    timer = setTimeout(sendPing, timeoutMs);
  }

  const cancel = () => {
    if (timer) clearTimeout(timer);
  }

  const off = rx.on(message => {
    if (messageHasValue(message)) {
      // Reset timeout
      cancel();
      timer = setTimeout(sendPing, timeoutMs);
    } else if (messageIsDoneSignal(message)) {
      off();
      cancel();
    }
  });

  timer = setTimeout(sendPing, timeoutMs);
  return rx;
}
