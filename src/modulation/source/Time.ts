import { type Interval, intervalToMs } from "../../flow/IntervalType.js";
import { throwNumberTest } from "../../util/GuardNumbers.js";
import type { ModSettableOptions, ModSettable, ModSettableFeedback } from "../Types.js";

/**
 * Returns the percentage of time toward `interval`. See also: {@link bpm}, {@link hertz} which are the same but
 * using different units for time.
 * 
 * By default, it continues forever, cycling from 0..1 repeatedly for each interval. Use
 * `cycleLimit` to restrict this. A value of 1 means it won't loop. 
 * 
 * The starting 'position' is `performance.now()`. If `startAt` option is provided, this will be used instead.
 * It probably should be an offset of `performance.now()`, eg: `{ startAt: performance.now() - 500 }` to shift
 * the cycle by 500ms.
 * 
 * When using `startAtRelative`, the starting position will be set backward by the relative amount. A value
 * of 0.5, for example, will set the timer back 50% of the interval, meaning the cycle will start half way through.
 * 
 * @param interval 
 * @param options 
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
 * Counts beats based on a BPM.
 * Uses {@link elapsed} internally.
 * @param bpm 
 * @param options 
 * @returns 
 */
export function bpm(bpm: number, options: Partial<ModSettableOptions> = {}): ModSettable {
  const interval = (60 * 1000) / bpm; // milliseconds between beats.
  return elapsed(interval, options);
}

/**
 * Counts based on hertz (oscillations per second).
 * Uses {@link elapsed} internally.
 * @param hz 
 * @param options 
 * @returns 
 */
export function hertz(hz: number, options: Partial<ModSettableOptions> = {}): ModSettable {
  const interval = 1000 / hz;
  return elapsed(interval, options);
}

