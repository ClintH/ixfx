import type { Process } from "./Process.js";

export const max = (): Process<number | Array<number>, number | undefined> => {
  let max = Number.MIN_SAFE_INTEGER;
  const compute = (value: number | Array<number>) => {
    const valueArray = Array.isArray(value) ? value : [ value ];
    for (const subValue of valueArray) {
      if (typeof subValue !== `number`) break;
      max = Math.max(subValue, max);
      return max;
    }
  }
  return compute;
}

export const min = (): Process<number | Array<number>, number | undefined> => {
  let min = Number.MAX_SAFE_INTEGER;
  const compute = (value: number | Array<number>) => {
    const valueArray = Array.isArray(value) ? value : [ value ];
    for (const subValue of valueArray) {
      if (typeof subValue !== `number`) break;
      min = Math.min(subValue, min);
      return min;
    }
  }
  return compute;
}

export const sum = (): Process<number | Array<number>, number | undefined> => {
  let t = 0;
  const compute = (value: number | Array<number>) => {
    const valueArray = Array.isArray(value) ? value : [ value ];
    for (const subValue of valueArray) {
      if (typeof subValue !== `number`) break;
      t += subValue;
      return t;
    }
  }
  return compute;
}

export const average = (): Process<number | Array<number>, number | undefined> => {
  let total = 0;
  let tally = 0;
  const compute = (value: number | Array<number>) => {
    const valueArray = Array.isArray(value) ? value : [ value ];
    for (const subValue of valueArray) {
      if (typeof subValue !== `number`) break;
      tally++;
      total += subValue;
      return total / tally;
    }
  }
  return compute;
}

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
 * A rank function that compares A and B.
 * Returns the highest value, 'a' or 'b'. 
 * Returns 'eq' if values are equal
 */
export type RankFunction<T> = (a: T, b: T) => `a` | `b` | `eq`

export type RankOptions = {
  /**
   * If set, only values with this JS type are included
   */
  includeType?: `string` | `number` | `object` | `boolean`
  /**
   * If _true_, also emits values when they rank equal with current highest.
   * _false_ by default
   */
  emitEqualRanked?: boolean
  /**
   * If _true_, emits the current highest value even if it hasn't changed.
   * This means it will match the tempo of the incoming stream.
   */
  emitRepeatHighest?: boolean
}

export type RankArrayOptions = RankOptions & {
  /**
   * If _true_, it's only the highest _within_ an array that is considered,
   * rather than tracking the higest between arrays
   * Default: _false_
   */
  withinArrays?: boolean
}

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


