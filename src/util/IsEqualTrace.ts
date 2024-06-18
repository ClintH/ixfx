import { toStringAbbreviate } from "../Text.js";
import type { IsEqual } from "./IsEqual.js";


/**
 * Wraps the `eq` function, tracing the input data result
 * ```js
 * // Init trace
 * const traceEq = isEqualTrace(isEqualValueDefault); 
 * // Use it in some function that takes IsEqual<T>
 * compare(a, b, eq);
 * ```
 * @param eq 
 * @returns 
 */
export const isEqualTrace = <T>(eq: IsEqual<T>): IsEqual<T> => {
  return (a, b) => {
    const result = eq(a, b);
    console.log(`isEqualTrace eq: ${ result } a: ${ toStringAbbreviate(a) } b: ${ toStringAbbreviate(b) }`);
    return result;
  }
}