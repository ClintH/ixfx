import { type Interval, intervalToMs } from "../../flow/IntervalType.js";
import { throwNumberTest } from "../../util/GuardNumbers.js";
import type { ModSettableOptions, ModSettable, ModSettableFeedback } from "../Types.js";

/**
 * Returns an elapsed number of milliseconds up to `interval`.
 * If `oneShot` is _false_ (default), it will loop, resetting to 0 when `interval` is reached.
 * If `oneShot` is _true_, once `interval` is reached, this value will be returned.
 * 
 * The starting 'position' is `performance.now()`. If `startAt` option is provided, this will be used instead.
 * It probably should be an offset of `performance.now()`, eg: `{ startAt: performance.now() - 500 }` to shift
 * the cycle by 500ms.
 * 
 * When using `startAtRelative`, the starting position will be set backward by the relative amount. A value
 * of 0.5, for example, will set the timer back 50% of the interval, meaning the cycle will start half way through.
 * @param interval 
 * @param oneShot 
 * @returns 
 */
export function elapsed(interval: Interval, options: Partial<ModSettableOptions> = {}): ModSettable {
  const cycleLimit = options.cycleLimit ?? Number.MAX_SAFE_INTEGER;
  const limitValue = 1;
  let start = options.startAt ?? performance.now();
  let cycleCount = 0;
  const intervalMs = intervalToMs(interval, 1000);
  if (options.startAtRelative) {
    throwNumberTest(options.startAtRelative, `percentage`, `startAtRelative`);
    start = performance.now() - (intervalMs * options.startAtRelative);
  }
  //let stopAt = cycleLimit > 0 ? (intervalMs + start) : Number.MAX_SAFE_INTEGER;
  return (feedback?: Partial<ModSettableFeedback>) => {
    if (feedback) {
      if (feedback.resetAt !== undefined) {
        start = feedback.resetAt;
        if (start === 0) start = performance.now();
      }
      if (feedback.resetAtRelative !== undefined) {
        throwNumberTest(feedback.resetAtRelative, `percentage`, `resetAtRelative`);
        start = performance.now() - (intervalMs * feedback.resetAtRelative);
      }
    }
    if (cycleCount >= cycleLimit) return limitValue;
    const now = performance.now();
    const elapsedCycle = now - start;
    if (elapsedCycle >= intervalMs) {
      cycleCount += Math.floor(elapsedCycle / intervalMs);
      start = now;
      if (cycleCount >= cycleLimit) return limitValue;
    }
    return (elapsedCycle % intervalMs) / intervalMs;
  }

  // } else {
  //   return () => ((performance.now() - start) % intervalMs) / intervalMs;
  // }
}

/**
 * Counts beats based on a BPM
 * @param bpm 
 * @param oneShot 
 * @returns 
 */
export function bpm(bpm: number, options: Partial<ModSettableOptions>): ModSettable {
  const interval = (60 * 1000) / bpm; // milliseconds between beats.
  return elapsed(interval, options);
}

/**
 * Counts based on hertz (oscillations per second)
 * @param hz 
 * @param oneShot 
 * @returns 
 */
export function hertz(hz: number, options: Partial<ModSettableOptions>): ModSettable {
  const interval = 1000 / hz;
  return elapsed(interval, options);
}

