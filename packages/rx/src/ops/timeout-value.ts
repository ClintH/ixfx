import { intervalToMs } from "@ixfx/core";
import { initUpstream } from "../init-stream.js";
import type { ReactiveOrSource, Reactive } from "../types.js";
import { isTrigger, resolveTriggerValue } from "../util.js";
import type { TimeoutValueOptions } from "../from/types.js";

/**
 * Emits a value if `source` does not emit a value after `interval`
 * has elapsed. This can be useful to reset a reactive to some
 * 'zero' state if nothing is going on.
 * 
 * If `source` emits faster than the `interval`, it won't get triggered.
 * 
 * Default for 'timeout': 1000s.
 * 
 * ```js
 * // Emit 'hello' if 'source' doesn't emit a value after 1 minute
 * const r = Rx.timeoutValue(source, { value: 'hello', interval: { mins: 1 } });
 * ```
 * 
 * Can also emit results from a function or generator
 * ```js
 * // Emits a random number if 'source' doesn't emit a value after 500ms
 * const r = Rx.timeoutValue(source, { fn: Math.random, interval: 500 });
 * ```
 * 
 * If `immediate` option is _true_ (default), the timer starts from stream initialisation.
 * Otherwise it won't start until it observes the first value from `source`.
 * @param source 
 * @param options 
 */
export function timeoutValue<TSource, TTriggerValue>(source: ReactiveOrSource<TSource>, options: TimeoutValueOptions<TTriggerValue>): Reactive<TSource | TTriggerValue> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const immediate = options.immediate ?? true;
  const repeat = options.repeat ?? false;
  const timeoutMs = intervalToMs(options.interval, 1000);
  if (!isTrigger(options)) {
    throw new Error(`Param 'options' does not contain trigger 'value' or 'fn' fields`);
  }

  // Send value from trigger
  const sendFallback = () => {
    const [ value, done ] = resolveTriggerValue(options);
    if (done) {
      events.dispose(`Trigger completed`);
    } else {
      if (events.isDisposed()) return;
      events.set(value);
      if (repeat) {
        timer = setTimeout(sendFallback, timeoutMs);
      }
    }
  }

  const events = initUpstream<TSource, TSource | TTriggerValue>(source, {
    disposeIfSourceDone: true,
    // Received a value from upstream source
    onValue(v) {
      // Reset timeout
      if (timer) clearTimeout(timer);
      timer = setTimeout(sendFallback, timeoutMs);
      // Emit value
      events.set(v);
    },
    onDispose() {
      if (timer) clearTimeout(timer);
    },
  });

  if (immediate && !timer) {
    timer = setTimeout(sendFallback, timeoutMs);
  }
  return events;
}
