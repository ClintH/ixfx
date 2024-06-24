import { shuffle } from "../../collections/arrays/Random.js";
import { initUpstream } from "../InitStream.js";
import type { ReactiveOrSource, Reactive } from "../Types.js";
import type { SingleFromArrayOptions } from "./Types.js";

/**
 * For a stream that emits arrays of values, this op will select a single value.
 * 
 * Can select based on:
 * * predicate: a function that returns _true_ for a value
 * * at: selection based on array index (can be combined with random ordering to select a random value)
 * 
 * ```js
 * // If source is Reactive<Array<number>>, picks the first even number
 * singleFromArray(source, { 
 *  predicate: v => v % 2 === 0
 * });
 * 
 * // Selects a random value from source
 * singleFromArray(source, { 
 *  order: `random`,
 *  at: 0
 * });
 * ```
 * 
 * If neither `predicate` or `at` options are given, exception is thrown.
 * @param source Source to read from
 * @param options Options for selection
 * @returns 
 */
export function singleFromArray<V>(source: ReactiveOrSource<Array<V>>, options: Partial<SingleFromArrayOptions<V>> = {}): Reactive<V> {
  const order = options.order ?? `default`;
  if (!options.at && !options.predicate) throw new Error(`Options must have 'predicate' or 'at' fields`);

  let preprocess = (values: Array<V>) => values;
  if (order === `random`) preprocess = shuffle;
  else if (typeof order === `function`) preprocess = (values) => values.toSorted(order);

  const upstream = initUpstream<Array<V>, V>(source, {
    onValue(values) {
      values = preprocess(values);
      if (options.predicate) {
        for (const v of values) {
          if (options.predicate(v)) {
            upstream.set(v);
          }
        }
      } else if (options.at) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        upstream.set(values.at(options.at)!);
      }
    },
  });
  return upstream;
}
