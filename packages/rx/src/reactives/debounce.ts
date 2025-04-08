import { type Reactive, intervalToMs } from "@ixfxfun/core";
import { timeout } from "@ixfxfun/flow";
import { initUpstream } from "../init-stream.js";
import type { DebounceOptions } from "../ops/types.js";
import { toReadable } from "../to-readable.js";
import type { ReactiveOrSource } from "../types.js";

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
