import { toStringAbbreviate } from "./text.js";
import type { IsEqual } from "./is-equal.js";


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
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    console.log(`isEqualTrace eq: ${ result } a: ${ toStringAbbreviate(a) } b: ${ toStringAbbreviate(b) }`);
    return result;
  }
}