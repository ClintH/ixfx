
import { type Interval, intervalToMs, sleep, type RankFunction, type RankOptions, type RankArrayOptions, elapsedSince } from "@ixfx/core";
import { integerTest, resultThrow } from "@ixfx/guards";
import type { Link, GenOrData, DelayOptions } from "./types.js";
import { resolveToGen } from "./utility.js";
import * as BasicProcessors from "@ixfx/process/basic";

/**
 * Transform values from one type to another. Just like a map function.
 * @param transformer 
 * @returns 
 */
export function transform<In, Out>(transformer: (v: In) => Out): Link<In, Out> {
  async function* transform(input: GenOrData<In>): AsyncGenerator<Out> {
    input = resolveToGen(input);
    for await (const value of input) {
      yield transformer(value);
    }
  }
  transform._name = `transform`;
  return transform;
}

/**
 * Take `limit` number of results from the stream, before closing
 * @param limit 
 * @returns 
 */
export function take<In>(limit: number): Link<In, In> {
  async function* take(input: GenOrData<In>): AsyncGenerator<In> {
    input = resolveToGen(input);
    let yielded = 0;
    for await (const value of input) {
      if (++yielded > limit) break;
      yield value;
    }
  }
  take._name = `take`;
  return take;
}

/**
 * Takes an array of values, flattening to a single one
 * using the provided `reducer` function.
 * 
 * ```js
 * // Create a chain that flattens values
 * const reduce = Chains.reduce(values => Math.max(...values));
 * // Feed it a single input (an array), get a single output back:
 * const result = await Chains.single(reduce, [ 1, 2, 3]); // 3
 * ```
 * @param reducer Function to reduce array of values to a single value
 * @returns 
 */
export function reduce<In, Out>(reducer: (v: In[]) => Out): Link<In[], Out> {
  async function* reduce(input: GenOrData<In[]>): AsyncGenerator<Out> {
    input = resolveToGen(input);
    for await (const value of input) {
      yield reducer(value);
    }
  }
  reduce._name = `reduce`;
  return reduce;
}

/**
 * Allow values through until a duration has elapsed. After
 * that, the chain stops.
 * @param elapsed 
 * @returns 
 */
export function duration<In>(elapsed: Interval): Link<In, In> {
  const durationMs = intervalToMs(elapsed, 0);

  async function* duration(input: GenOrData<In>): AsyncGenerator<In> {
    input = resolveToGen(input);
    const elapsed = elapsedSince();
    for await (const value of input) {
      if (elapsed() > durationMs) break;
      yield value;
    }
  }
  duration._name = `duration`;
  return duration;
}

/**
 * Add delay before/after values are emitted from the input stream.
 * @param options 
 * @returns 
 */
export function delay<In>(options: DelayOptions): Link<In, In> {
  const before = intervalToMs(options.before, 0);
  const after = intervalToMs(options.after, 0);

  async function* delay(input: GenOrData<In>): AsyncGenerator<In> {
    input = resolveToGen(input);
    for await (const value of input) {
      if (before > 0) {
        await sleep(before);
      }
      yield value;
      if (after > 0) {
        await sleep(after);
      }
    }
  }
  delay._name = `delay`;
  return delay;
}

/**
 * Ensure a minimum length of time between values.
 * Values being produced too quickly are dropped.
 * 
 * In the following example, only three values will be let through.
 * ```js
 * const chain = Chains.run(
 *  // Produce values every 10ms for 350ms
 *  Chains.From.timestamp({ interval: 10, elapsed: 350 }),
 *  // Only let a value through every 100ms
 *  Chains.Links.debounce(100)
 * );
 * ```
 * @param rate 
 * @returns 
 */
export function debounce<In>(rate: Interval): Link<In, In> {
  const rateMs = intervalToMs(rate, 0);

  async function* debounce(input: GenOrData<In>): AsyncGenerator<In> {
    input = resolveToGen(input);
    let elapsed = elapsedSince();
    for await (const value of input) {
      if (elapsed() < rateMs) continue;
      yield value;
      elapsed = elapsedSince();
    }
  }
  debounce._name = `debounce`;
  return debounce;
}


/**
 * Returns a running tally of how many items have been
 * emitted from the input source.
 * ```js
 * const ch = Chains.run(
 *  Chains.From.timestamp({ interval: 100 }),
 *  Chains.Links.tally()
 * );
 * 
 * for await (const v of ch) {
 *   // Produces: 1, 2, 3 ... every 100ms
 * }
 * ```
 * This is different than {@link sum} which adds up numeric values.
 * By default it adds up individual array items
 * @returns 
 */
export function tally<In>(countArrayItems = true): Link<In, number> {
  async function* tally(input: GenOrData<In>): AsyncGenerator<number> {
    input = resolveToGen(input);
    const p = BasicProcessors.tally(countArrayItems);
    for await (const v of input) {
      yield p(v);
    }
  }
  tally._name = `tally`;
  return tally;
}

/**
 * Returns the smallest value from the input.
 * Can work with numbers or number[] as input.
 * Non-numeric data is filtered out.
 * @returns 
 */
export function min(): Link<number | number[], number> {
  async function* min(input: GenOrData<number | number[]>): AsyncGenerator<number> {
    input = resolveToGen(input);
    const p = BasicProcessors.min();
    for await (const value of input) {
      const x = p(value);
      if (x === undefined) continue;
      yield x;
    }
  }
  min._name = `min`;
  return min;
}

/**
 * Returns the largest value from the input.
 * - Non-numeric data is filtered out.
 * - Looks inside of numeric arrays.
 * @returns 
 */
export function max(): Link<number | number[], number> {
  async function* max(input: GenOrData<number | number[]>): AsyncGenerator<number> {
    input = resolveToGen(input);
    const p = BasicProcessors.max();
    for await (const value of input) {
      const x = p(value);
      if (x === undefined) continue;
      yield x;
    }
  }
  max._name = `max`;
  return max;
}
// export function max(): Link<number | Array<number>, number> {
//   async function* max(input: GenOrData<number | Array<number>>): AsyncGenerator<number> {
//     input = resolveToGen(input);
//     let max = Number.MIN_SAFE_INTEGER;
//     for await (const value of input) {
//       const valueArray = Array.isArray(value) ? value : [ value ];
//       for (const subValue of valueArray) {
//         if (typeof subValue !== `number`) break;
//         max = Math.max(subValue, max);
//         yield max;
//       }
//     }
//   }
//   max._name = `max`;
//   return max;
// }



/**
 * Emits the currently ranked 'highest' value from a stream. Only
 * values exceeding the current highest are emitted.
 * 
 * eg, if we are ranking on numerical value, an input stream of:
 * ```
 * 4, 1, 6, 10, 2, 4
 * ```
 * 
 * Results in the output stream of:
 * ```
 * 4, 6, 10
 * ```
 * 
 * @example 
 * ```js
 * // Rank based on a field
 * Chains.Links.rank((a,b) => {
 *  if (a.size > b.size) return `a`; // Signals the first param is highest
 *  if (a.size < b.size) return `b`; // Signals the second param is highest
 *  return `eq`;
 * });
 * ```
 * @param options 
 * @returns 
 */
export function rank<In>(r: RankFunction<In>, options: Partial<RankOptions> = {}): Link<In, In> {
  async function* rank(input: GenOrData<In>): AsyncGenerator<In> {
    input = resolveToGen(input);
    //let best: In | undefined;
    const p = BasicProcessors.rank(r, options);
    for await (const value of input) {
      const x = p(value);
      if (x === undefined) continue;
      yield x;
    }
  }
  rank._name = `rank`;
  return rank;
}

/**
 * Emits the highest-ranked value from amongst an array of values.
 * 
 * By default, it tracks the highest-ranked _between_ arrays.
 * 
 * For example:
 * ```js
 * // Input
 * [ [4,5,6], [1,2,3] ]
 * // Outputs:
 * [ 6 ]
 * ```
 * 
 * This behaviour can be modified with an option to only compare _within_ arrays.
 * ```
 * // Input
 * [ [4,5,6], [1,2,3] ]
 * // Output:
 * [ 6, 3 ]
 * ```
 * 
 * Uses the `rank` option to determine which is more highly ranked.
 * ```js
 * Chains.Links.rankArray(
 *  (a, b) => {
 *    if (a > b) return `a`; // a is higher
 *    else if (b > a) return `b`; // b is higher
 *    return `eq`; // same
 *  }
 * )
 * ```
 * @param options 
 * @returns 
 */
export function rankArray<In>(r: RankFunction<In>, options: Partial<RankArrayOptions> = {}): Link<In[], In> {
  const includeType = options.includeType;
  const emitEqualRanked = options.emitEqualRanked ?? false;
  const emitRepeatHighest = options.emitRepeatHighest ?? false;
  const withinArrays = options.withinArrays ?? false;

  async function* rankArray(input: GenOrData<In[]>): AsyncGenerator<In> {
    input = resolveToGen(input);
    let best: In | undefined;
    for await (const value of input) {
      let emit = false;
      if (withinArrays) best = undefined; // Reset
      for (const subValue of value) {
        if (includeType && typeof subValue !== includeType) continue;
        if (best === undefined) {
          best = subValue;
          emit = true;
        } else {
          const result = r(subValue, best);
          if (result == `a`) {
            // New value is the current best
            best = subValue;
            emit = true;
          } else if (result === `eq` && emitEqualRanked) {
            // New value is same rank as previous, but we have flag on
            emit = true;
          } else if (emitRepeatHighest) {
            // Emit current highest due to flag
            emit = true;
          }
        }
      }

      if (emit && best) yield best;
    }
  }
  rankArray._name = `rankArray`;
  return rankArray;
}

/**
 * Returns the average from the input.
 * Non-numeric values are filtered out.
 * @returns 
 */
export function average(): Link<number, number> {
  async function* average(input: GenOrData<number>): AsyncGenerator<number> {
    input = resolveToGen(input);
    const p = BasicProcessors.average();
    for await (const value of input) {
      const x = p(value);
      if (x === undefined) continue;
      yield x;
    }
  }
  average._name = `average`;
  return average;
}

/**
 * Returns the total of the numeric values.
 * Non-numeric values are filtered out.
 * @returns 
 */
export function sum(): Link<number, number> {
  async function* total(input: GenOrData<number>): AsyncGenerator<number> {
    input = resolveToGen(input);
    const p = BasicProcessors.sum();
    for await (const value of input) {
      const x = p(value);
      if (x === undefined) continue;
      yield x;
    }
  }
  total._name = `total`;
  return total;
}

/**
 * Chunks an input stream into `size` chunks.
 * 
 * Eg, with a chunk size of 3, the input stream of:
 *  1, 2, 3, 4, 5, 6
 * Yields:
 *  [ 1, 2, 3 ], [ 4, 5, 6 ]
 * 
 * If `returnRemainders` is _true_ (default), any left over values are returned even if
 * it's less than `size`.
 * @param size 
 * @param returnRemainders If true (default) left over data that didn't make a full chunk is also returned
 * @returns 
 */
export function chunk<In>(size: number, returnRemainders = true): Link<In, In[]> {
  resultThrow(integerTest(size, `aboveZero`, `size`));
  async function* chunk(input: GenOrData<In>): AsyncGenerator<In[]> {
    input = resolveToGen(input);
    let buffer: In[] = [];
    for await (const value of input) {
      buffer.push(value);
      if (buffer.length >= size) {
        yield buffer;
        buffer = []
      }
    }
    if (returnRemainders && buffer.length > 0) yield buffer;
  }
  chunk._name = `chunk`;
  return chunk;
}

/**
 * Filters the input source, only allowing through
 * data for which `predicate` returns _true_
 * 
 * {@link drop}, on the other hand excludes values for which predicate is _true_
 * @param predicate 
 * @returns 
 */
export function filter<In>(predicate: (v: In) => boolean): Link<In, In> {
  async function* filter(input: GenOrData<In>): AsyncGenerator<In> {
    input = resolveToGen(input);
    for await (const value of input) {
      if (predicate(value)) {
        yield value;
      }
    }
  }
  filter._name = `filter`;
  return filter;
}



/**
 * Drops all values from input stream for which `predicate` returns _true_
 * 
 * {@link filter}, on the other hand includes values where the predicate is _true_
 * @param predicate 
 * @returns 
 */
export function drop<In>(predicate: (v: In) => boolean): Link<In, In> {
  async function* drop(input: GenOrData<In>): AsyncGenerator<In> {
    input = resolveToGen(input);
    for await (const value of input) {
      if (!predicate(value)) {
        yield value;
      }
    }
  }
  drop._name = `drop`;
  return drop;
}
