import type { Link } from "./Types.js";

/**
 * Input a single value to the chain, return a single result
 * @param f 
 * @param input 
 * @returns 
 */
export async function single<In, Out>(f: Link<In, Out>, input: In): Promise<Out | undefined> {
  const iterator = await f([ input ]).next();
  return iterator.value as Out | undefined;
}