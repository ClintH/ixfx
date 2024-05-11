import { intervalToMs } from "../../flow/IntervalType.js";
import { initUpstream } from "../InitStream.js";
import type { ReactiveOrSource, Reactive } from "../Types.js";
import { isTrigger, resolveTriggerValue } from "../Util.js";
import type { TimeoutTriggerOptions } from "../sources/Types.js";

/**
 * Emits a value if `source` does not emit a value after `interval`
 * has elapsed. For example, this allows you to reset a reactive to some
 * 'zero' state if nothing is going on.
 * 
 * If `source` emits faster than the `interval`, it won't get triggered.
 * 
 * Default for 'timeout': 1000s.
 * 
 * ```js
 * // Emit 'hello' if 'source' doesn't emit a value after 1 minute
 * const r = Rx.timeoutTrigger(source, { value: 'hello', interval: { mins: 1 } });
 * ```
 * 
 * Can also emit results from a function or generator
 * ```js
 * // Emits a random number if 'source' doesn't emit a value after 500ms
 * const r = Rx.timeoutTrigger(source, { fn: Math.random, interval: 500 });
 * ```
 * 
 * If `immediate` option is _true_ (default), the timer starts from stream initialisation.
 * Otherwise it won't start until it observes the first value from `source`.
 * @param source 
 * @param options 
 */
export function timeoutTrigger<TSource, TTriggerValue>(source: ReactiveOrSource<TSource>, options: TimeoutTriggerOptions<TTriggerValue>): Reactive<TSource | TTriggerValue> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const immediate = options.immediate ?? true;
  const timeoutMs = intervalToMs(options.interval, 1000);
  if (!isTrigger(options)) {
    throw new Error(`Param 'options' does not contain trigger 'value' or 'fn' fields`);
  }
  const sendFallback = () => {
    const [ value, done ] = resolveTriggerValue(options);
    if (done) {
      events.dispose(`Trigger completed`);
    } else {
      events.set(value);
    }
  }

  const events = initUpstream<TSource, TSource | TTriggerValue>(source, {
    disposeIfSourceDone: true,
    onValue(v) {
      if (timer) clearTimeout(timer);
      timer = setTimeout(sendFallback, timeoutMs);
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
