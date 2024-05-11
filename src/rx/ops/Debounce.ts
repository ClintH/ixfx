import { intervalToMs } from "../../flow/IntervalType.js";
import { timeout } from "../../flow/Timeout.js";
import { initUpstream } from "../InitStream.js";
import type { ReactiveOrSource, Reactive } from "../Types.js";
import { toReadable } from "../ToReadable.js";
import type { DebounceOptions } from "./Types.js";

/**
 * Debounce waits for `elapsed` time after the last received value before emitting it.
 * 
 * If a flurry of values are received that are within the interval, it won't emit anything. But then
 * as soon as there is a gap in the messages that meets the interval, the last received value is sent out.
 * 
 * `debounce` always emits with at least `elapsed` as a delay after a value received. While {@link throttle} potentially
 * sends immediately, if it's outside of the elapsed period.
 * 
 * This is a subtly different logic to {@link throttle}. `throttle` more eagerly sends the first value, potentially
 * not sending later values. `debouce` however will send later values, potentially ignoring earlier ones.
 * @param source 
 * @param options 
 * @returns 
 */
export function debounce<V>(source: ReactiveOrSource<V>, options: Partial<DebounceOptions> = {}): Reactive<V> {
  const elapsed = intervalToMs(options.elapsed, 50);
  let lastValue: V | undefined;

  const timer = timeout(() => {
    const v = lastValue;
    if (v) {
      upstream.set(v);
      lastValue = undefined;
    }
  }, elapsed);

  const upstream = initUpstream<V, V>(source, {
    ...options,
    onValue(value) {
      lastValue = value;
      timer.start();
    }
  });
  return toReadable(upstream);
}

