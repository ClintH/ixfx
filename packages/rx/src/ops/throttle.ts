import { intervalToMs } from "@ixfx/core";
import { initUpstream } from "../init-stream.js";
import type { ReactiveOrSource, Reactive } from "../types.js";
import { toReadable } from "../to-readable.js";
import type { ThrottleOptions } from "./types.js";

/**
 * Only allow a value through if a minimum amount of time has elapsed.
 * since the last value. This effectively slows down a source to a given number
 * of values/ms. Values emitted by the source which are too fast are discarded.
 * 
 * Throttle will fire on the first value received.
 * 
 * In more detail:
 * Every time throttle passes a value, it records the time it allowed something through. For every
 * value received, it checks the elapsed time against this timestamp, throwing away values if
 * the period hasn't elapsed.
 * 
 * With this logic, a fury of values of the source might be discarded if they fall within the elapsed time
 * window. But then if there is not a new value for a while, the actual duration between values can be longer
 * than expected. This is in contrast to {@link debounce}, which will emit the last value received after a duration, 
 * even if the source stops sending.
 * @param options 
 * @returns 
 */
export function throttle<V>(throttleSource: ReactiveOrSource<V>, options: Partial<ThrottleOptions> = {}): Reactive<V> {
  const elapsed = intervalToMs(options.elapsed, 0);
  let lastFire = performance.now();
  let lastValue: V | undefined;

  const upstream = initUpstream<V, V>(throttleSource, {
    ...options,
    onValue(value) {
      lastValue = value;
      trigger();
    },
  });

  const trigger = () => {
    const now = performance.now();
    if (elapsed > 0 && (now - lastFire > elapsed)) {
      lastFire = now;
      if (lastValue !== undefined) {
        upstream.set(lastValue);
      }
    }
  }


  return toReadable(upstream);

}
