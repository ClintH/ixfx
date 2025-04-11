import type { Link } from "./types.js";

/**
 * Input a single value to the chain, return a single result
 * 
 * 
 * ```js
 * // Create chain link
 * const f = Chains.Links.flatten<string, string>(data => data.join(`-`));
 * // Input a single value (an array)
 * const r1 = await Chains.single(f, [ `a`, `b`, `c` ]);
 * // r1 = `a-b-c`
 * ```
 * @param f 
 * @param input 
 * @returns 
 */
export async function single<In, Out>(f: Link<In, Out>, input: In): Promise<Out | undefined> {
  const iterator = await f([ input ]).next();
  return iterator.value as Out | undefined;
}