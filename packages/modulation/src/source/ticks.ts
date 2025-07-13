import { resultThrow, integerTest } from "@ixfx/guards";
import type { ModSettable as ModuleSettable, ModSettableFeedback as ModuleSettableFeedback, ModSettableOptions as ModuleSettableOptions } from "../types.js";

// eslint-disable-next-line unicorn/prevent-abbreviations
export type TicksModSettableOptions = ModuleSettableOptions & {
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
 * Use 'exclusiveStart' and 'exclusiveEnd' flags to shift range. Eg, with `totalTicks` of 10: 
 * * 'exclusiveStart:true': first value is 0.1, last value is 1.0 (10 values total)
 * * 'exclusiveEnd:true': first value is 0, last value is 0.9 (10 values total)
 * * If both are true, first value is 0.1, last value is 0.9 (9 values total)
 * * If both are false (or not set), we get the case described earlier, first value is 0, last value is 1 (11 values total)
 * 
 * Other examples:
 * * totalTicks: 20, value goes up by 0.05
 * * totalTicks: 1, value goes up by 1
 * @param totalTicks Positive, integer value. How many ticks to complete a cycle
 * @param options
 * @returns 
 */
export function ticks(totalTicks: number, options: Partial<TicksModSettableOptions> = {}): ModuleSettable {
  resultThrow(integerTest(totalTicks, `aboveZero`, `totalTicks`));
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

  return (feedback?: Partial<ModuleSettableFeedback>) => {
    if (feedback) {
      if (feedback.resetAt !== undefined) {
        v = feedback.resetAt;
      }
      if (feedback.resetAtRelative !== undefined) {
        v = Math.floor(feedback.resetAtRelative * totalTicks);
      }
    }
    if (cycleCount >= cycleLimit) return 1;

    const current = v / totalTicks;
    v++;
    if (v > endPoint) {
      cycleCount++;
      v = startPoint;
    }
    return current;
  }
}
