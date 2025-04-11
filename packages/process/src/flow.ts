import { CancelError } from "./cancel-error.js";
import type { Process, Processors } from "./types.js";
export function flow<T1, T2>(...processors: [ Process<T1, T2> ]): (value: T1) => T2;
export function flow<T1, T2, T3>(...processors: [ Process<T1, T2>, Process<T2, T3> ]): (value: T1) => T3;
export function flow<T1, T2, T3, T4>(...processors: [ Process<T1, T2>, Process<T2, T3>, Process<T3, T4> ]): (value: T1) => T4;
export function flow<T1, T2, T3, T4, T5>(...processors: [ Process<T1, T2>, Process<T2, T3>, Process<T3, T4>, Process<T4, T5> ]): (value: T1) => T5;
export function flow<T1, T2, T3, T4, T5, T6>(...processors: [ Process<T1, T2>, Process<T2, T3>, Process<T3, T4>, Process<T4, T5>, Process<T5, T6> ]): (value: T1) => T6;

/**
 * Creates a flow of data processors (up to 5 are supported).
 * The flow is encapsulated in a function that accepts an input value an returns an output.
 * 
 * ```js
 * const p = flow(
 *  (value:string) => value.toUpperCase(), // Convert to uppercase
 *  (value:string) => value.at(0) === 'A') // If first letter is an A, return true
 * );
 * p('apple'); // True
 * ```
 * 
 * Each processing function is expected to take in one input value and return one value.
 * @param processors 
 * @returns 
 */
export function flow<T1, T2, T3, T4, T5, T6>(...processors: Processors<T1, T2, T3, T4, T5, T6>): (value: T1) => T2 | T3 | T4 | T5 | T6 {
  return (value: T1) => {
    let v = value;
    for (const p of processors) {
      try {
        // @ts-expect-error
        v = p(v) as T1;
      } catch (err) {
        if (err instanceof CancelError) {
          break;
        } else {
          throw err;
        }
      }
    }
    return v as T2 | T3 | T4 | T5 | T6;
  }
}
