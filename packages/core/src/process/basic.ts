import type { Process } from "./types.js";
import type { RankFunction, RankOptions } from "../types.js";

/**
 * Outputs the current largest-seen value
 * @returns 
 */
export const max = (): Process<number | Array<number>, number> => {
  let max = Number.MIN_SAFE_INTEGER;
  const compute = (value: number | Array<number>) => {
    const valueArray = Array.isArray(value) ? value : [ value ];
    for (const subValue of valueArray) {
      if (typeof subValue !== `number`) break;
      max = Math.max(subValue, max);
    }
    return max;
  }
  return compute;
}

/**
 * Outputs the current smallest-seen value
 * @returns
 */
export const min = (): Process<number | Array<number>, number> => {
  let min = Number.MAX_SAFE_INTEGER;
  const compute = (value: number | Array<number>) => {
    const valueArray = Array.isArray(value) ? value : [ value ];
    for (const subValue of valueArray) {
      if (typeof subValue !== `number`) break;
      min = Math.min(subValue, min);
    }
    return min;
  }
  return compute;
}

/**
 * Returns a sum of values
 * @returns 
 */
export const sum = (): Process<number | Array<number>, number> => {
  let t = 0;
  const compute = (value: number | Array<number>) => {
    const valueArray = Array.isArray(value) ? value : [ value ];
    for (const subValue of valueArray) {
      if (typeof subValue !== `number`) continue;
      t += subValue;
    }
    return t;
  }
  return compute;
}

/**
 * Returns the current average of input values
 * @returns 
 */
export const average = (): Process<number | Array<number>, number> => {
  let total = 0;
  let tally = 0;
  const compute = (value: number | Array<number>) => {
    const valueArray = Array.isArray(value) ? value : [ value ];
    for (const subValue of valueArray) {
      if (typeof subValue !== `number`) continue;
      tally++;
      total += subValue;
    }
    return total / tally;
  }
  return compute;
}

/**
 * Returns the tally (ie number of) values
 * @param countArrayItems 
 * @returns 
 */
export const tally = (countArrayItems: boolean): Process<any, number> => {
  let t = 0;
  const compute = (value: number | Array<number>) => {
    if (countArrayItems) {
      if (Array.isArray(value)) t += value.length;
      else t++;
    } else {
      t++;
    }
    return t;
  }
  return compute;
}



/**
 * Returns the 'best' value seen so far as determined by a ranking function.
 * This is similar to min/max but usable for objects.
 * @param r 
 * @param options 
 * @returns 
 */
export function rank<In>(r: RankFunction<In>, options: Partial<RankOptions> = {}) {
  const includeType = options.includeType;
  const emitEqualRanked = options.emitEqualRanked ?? false;
  const emitRepeatHighest = options.emitRepeatHighest ?? false;
  let best: In | undefined;
  return (value: In) => {
    if (includeType && typeof value !== includeType) return;
    if (best === undefined) {
      best = value;
      return best;
    } else {
      const result = r(value, best);
      //console.log(`result: ${ result } value: ${ JSON.stringify(value) } best: ${ JSON.stringify(best) }`);
      if (result == `a`) {
        // New value is the current best
        best = value;
        return best;
      } else if (result === `eq` && emitEqualRanked) {
        // New value is same rank as previous, but we have flag on
        return best;
      } else if (emitRepeatHighest) {
        // Emit current highest due to flag
        return best;
      }
    }
  }
}


