import { throwIntegerTest } from "../../util/GuardNumbers.js";
import type { ModSettable, ModSettableFeedback, ModSettableOptions } from "../Types.js";

export type TicksModSettableOptions = ModSettableOptions & {
  exclusiveStart: boolean
  exclusiveEnd: boolean
}
/**
 * Returns a function which cycles between 0..1 (inclusive of 0 and 1).
 * `totalTicks` is how many ticks it takes to get to 1. Since we want an inclusive 0 & 1,
 * the total ticks is actually +1.
 *
 * Ie. if totalTicks = 10, we get: 0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0
 * 
 * Use 'exclusiveStart' or 'exclusiveEnd' to shift range. Eg 'exclusiveStart' will begin at 0.1 and
 * include 1.0, while 'exclusiveEnd' will start at 0 and run up to and including 0.9.
 * 
 * Other examples:
 * * totalTicks: 20, value goes up by 0.05
 * * totalTicks: 1, value goes up by 1
 * @param totalTicks Positive, integer value. How many ticks to complete a cycle
 * @param options
 * @returns 
 */
export function ticks(totalTicks: number, options: Partial<TicksModSettableOptions> = {}): ModSettable {
  throwIntegerTest(totalTicks, `aboveZero`, `totalTicks`);
  const exclusiveStart = options.exclusiveStart ?? false;
  const exclusiveEnd = options.exclusiveEnd ?? false;
  const cycleLimit = options.cycleLimit ?? Number.MAX_SAFE_INTEGER;

  const startPoint = exclusiveStart ? 1 : 0;
  const endPoint = exclusiveEnd ? totalTicks - 1 : totalTicks;

  let cycleCount = 0;
  let v = options.startAt ?? startPoint;
  if (options.startAtRelative) {
    let totalTicksForReal = totalTicks;
    if (exclusiveStart) totalTicksForReal--;
    if (exclusiveEnd) totalTicksForReal--;
    v = Math.round(options.startAtRelative * totalTicksForReal);
  }

  return (feedback?: Partial<ModSettableFeedback>) => {
    if (feedback) {
      if (feedback.resetAt !== undefined) {
        v = feedback.resetAt;
      }
      if (feedback.resetAtRelative !== undefined) {
        v = Math.floor(feedback.resetAtRelative * totalTicks);
      }
    }
    if (cycleCount >= cycleLimit) return 1;

    let current = v / totalTicks;
    v++;
    if (v > endPoint) {
      cycleCount++;
      v = startPoint;
    }
    return current;
  }
}
