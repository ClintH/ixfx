import { intervalToMs } from "../../flow/IntervalType.js";
import { sleep } from "../../flow/Sleep.js";
import { Elapsed } from "../../flow/index.js";
import type { GenFactoryNoInput, TickOptions } from "./Types.js";

/**
 * Generate timestamp values at `interval` rate. By default it runs forever. 
 * Use `loops` or `elapsed` to set upper limit on how long it should run.
 * 
 * Options:
 * - `asClockTime`: If _true_, yielded value will be clock time rather than elapsed milliseconds
 * @param options 
 * @returns 
 */
export function tick(options: TickOptions): GenFactoryNoInput<number> {
  const intervalMs = intervalToMs(options.interval, 0);
  const asClockTime = options.asClockTime ?? false;
  const loops = options.loops ?? Number.MAX_SAFE_INTEGER;
  let looped = 0;
  const durationTime = intervalToMs(options.elapsed, Number.MAX_SAFE_INTEGER);

  async function* ts(): AsyncGenerator<number> {
    const elapsed = Elapsed.since();
    while (looped < loops && elapsed() < durationTime) {
      yield asClockTime ? Date.now() : elapsed();

      // Adjust sleep period so timing errors don't accumulate
      const expectedTimeDiff = (looped * intervalMs) - elapsed();
      await sleep(Math.max(0, intervalMs + expectedTimeDiff));
      looped++;
    }
  }
  ts._name = `timestamp`;
  /* eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion */
  ts._type = `GenFactoryNoInput` as const;
  return ts;
}