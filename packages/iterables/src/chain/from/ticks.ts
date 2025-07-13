import { elapsedSince, intervalToMs, sleep } from "@ixfx/core";
import type { GenFactoryNoInput, TickOptions } from "../types.js";

/**
 * Generate timestamp values at `interval` rate. By default it runs forever. 
 * Use `loops` or `elapsed` to set upper limit on how long it should run.
 * 
 * ```js
 * const c = Chains.From.timestamp({ interval: 1000 });
 * ```
 * Options:
 * - `asClockTime`: If _true_, yielded value will be clock time rather than elapsed milliseconds
 * @param options 
 * @returns 
 */
export function timestamp(options: TickOptions): GenFactoryNoInput<number> {
  const intervalMs = intervalToMs(options.interval, 0);
  const asClockTime = options.asClockTime ?? false;
  const loops = options.loops ?? Number.MAX_SAFE_INTEGER;
  let looped = 0;
  const durationTime = intervalToMs(options.elapsed, Number.MAX_SAFE_INTEGER);

  async function* ts(): AsyncGenerator<number> {
    const elapsed = elapsedSince();
    while (looped < loops && elapsed() < durationTime) {
      yield asClockTime ? Date.now() : elapsed();

      // Adjust sleep period so timing errors don't accumulate
      const expectedTimeDiff = (looped * intervalMs) - elapsed();
      await sleep(Math.max(0, intervalMs + expectedTimeDiff));
      looped++;
    }
  }
  ts._name = `timestamp`;

  ts._type = `GenFactoryNoInput` as const;
  return ts;
}