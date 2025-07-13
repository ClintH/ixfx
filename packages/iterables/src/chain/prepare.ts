import { runN } from "./run.js";
import type { GenFactoryNoInput, GenOrData, Links } from "./types.js";

/**
 * Prepare a chain, allowing you to provide a source at execution time.
 * ```js
 * const chain = Chains.prepare(
 *  Chains.transform<string,number>( v => Number.parseInt(v) ),
 *  Chains.filter<number>(v => v % 2 === 0)
 * );
 *
 * // Run it with provided source
 * for await (const v of chain([`1`, `2`, `3`])) {
 *
 * }
 * ```
 * @param functions
 * @returns
 */
export function prepare<In, Out>(...functions: Links<In, Out>) {
  const r = (source: GenOrData<In> | GenFactoryNoInput<In>) => {
    return runN<In, Out>(source, ...functions);
  }
  return r;
}

// const chain = combine(
//   Chains.Links.transform(v => Number.parseInt(v)),
//   Chains.Links.filter(v => v % 2 === 0)
// );
// const read = chain(Chains.From.array([ 1, 2, 3 ], 100));
