import { toStringDefault } from "../util/ToString.js";
import { isEqualDefault } from "../util/IsEqual.js";
export { average, max, min, tally, sum, rank } from './BasicProcessors.js';

export type Process<TIn, TOut> = (value: TIn) => TOut;
export type ProcessFactory<TIn, TOut> = () => Process<TIn, TOut>;

export type Processors1<T1, T2> = [
  Process<T1, T2>
]

export type Processors2<T1, T2, T3> = [
  Process<T1, T2>,
  Process<T2, T3>
]

export type Processors3<T1, T2, T3, T4> = [
  Process<T1, T2>,
  Process<T2, T3>,
  Process<T3, T4>
]

export type Processors4<T1, T2, T3, T4, T5> = [
  Process<T1, T2>,
  Process<T2, T3>,
  Process<T3, T4>,
  Process<T4, T5>
]

export type Processors5<T1, T2, T3, T4, T5, T6> = [
  Process<T1, T2>,
  Process<T2, T3>,
  Process<T3, T4>,
  Process<T4, T5>,
  Process<T5, T6>
]
export type Processors<T1, T2, T3, T4, T5, T6> = Processors1<T1, T2> | Processors2<T1, T2, T3> | Processors3<T1, T2, T3, T4> | Processors4<T1, T2, T3, T4, T5> | Processors5<T1, T2, T3, T4, T5, T6>;

export function chain<T1, T2>(...processors: [ Process<T1, T2> ]): (value: T1) => T2;
export function chain<T1, T2, T3>(...processors: [ Process<T1, T2>, Process<T2, T3> ]): (value: T1) => T3;
export function chain<T1, T2, T3, T4>(...processors: [ Process<T1, T2>, Process<T2, T3>, Process<T3, T4> ]): (value: T1) => T4;
export function chain<T1, T2, T3, T4, T5>(...processors: [ Process<T1, T2>, Process<T2, T3>, Process<T3, T4>, Process<T4, T5> ]): (value: T1) => T5;
export function chain<T1, T2, T3, T4, T5, T6>(...processors: [ Process<T1, T2>, Process<T2, T3>, Process<T3, T4>, Process<T4, T5>, Process<T5, T6> ]): (value: T1) => T6;

/**
 * Creates a chain of data processors (up to 5 are supported).
 * The chain is encapsulated in a function that accepts an input value an returns an output.
 * 
 * ```js
 * const p = chain(
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
export function chain<T1, T2, T3, T4, T5, T6>(...processors: Processors<T1, T2, T3, T4, T5, T6>): (value: T1) => T2 | T3 | T4 | T5 | T6 {
  return (value: T1) => {
    let v = value;
    for (const p of processors) {
      try {
        // @ts-expect-error
        v = p(v);
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

/**
 * If a value is same as the previous value, _undefined_ is emitted instead.
 * @param eq Equality function. If not specified, === semantics are used.
 * @returns 
 */
export function seenLastToUndefined<TIn>(eq?: (a: TIn, b: TIn) => boolean): Process<TIn, TIn | undefined> {
  if (eq === undefined) eq = isEqualDefault;
  let lastValue: TIn | undefined;
  return (value: TIn) => {
    if (value !== lastValue) {
      lastValue = value;
      return value;
    }
    return undefined;
  }
}

/**
 * If a value is same as any previously-seen value, _undefined_ is emitted instead.
 * It stores all previous values and compares against them for each new value. 
 * This would likely be not very efficient compared to {@link seenToUndefinedByKey} which uses a one-time computed
 * key and efficient storage of only the keys (using a Set).
 *  
 * @param eq Equality function. If not specified, === semantics are used.
 * @returns 
 */
export function seenToUndefined<TIn>(eq?: (a: TIn, b: TIn) => boolean): Process<TIn, TIn | undefined> {
  let seen: TIn[] = [];
  if (eq === undefined) eq = isEqualDefault;
  return (value: TIn) => {
    if (value === undefined) return;
    for (const s of seen) {
      if (eq(s, value)) return;
    }
    seen.push(value);
    return value;
  }
}

/**
 * If a value is the same as any previously-seen value, _undefined_ is emitted instead.
 * This version uses a function to create a string key of the object, by default JSON.stringify.
 * Thus we don't need to store all previously seen objects, just their keys.
 * 
 * Alternatively, if a key function doesn't make sense for the value, use
 * {@link seenToUndefined}, which stores the values (less efficient).
 * 
 * @param toString 
 * @returns 
 */
export function seenToUndefinedByKey<TIn>(toString?: (value: TIn) => string): Process<TIn, TIn | undefined> {
  let seen = new Set<string>();
  if (toString === undefined) toString = toStringDefault;
  return (value: TIn) => {
    if (value === undefined) return;
    const key = toString(value);
    if (seen.has(key)) return;
    seen.add(key);
    return value;
  }
}
/**
 * Calls a function if the input value is not undefined.
 * Return value from function is passed to next function in chain.
 * 
 * ```js
 * const chain = Process.chain(
 *  Process.max(),
 *  Process.seenLastToUndefined(),
 *  Process.ifNotUndefined(v => {
 *    console.log(`v:`, v);
 *  })
 * );
 * chain(100); // Prints 'v:100'
 * chain(90);  // Nothing happens max value has not changed
 * chain(110); // Prints 'v:110'
 * ```
 * @param fn 
 * @returns 
 */
export function ifNotUndefined<TIn, TOut>(fn: (value: Exclude<TIn, undefined>) => TOut) {
  return (value: TIn) => {
    if (value === undefined) return value;
    const v = fn(value as Exclude<TIn, undefined>);
    return v;
  }
}

export class CancelError extends Error {
  constructor(message: any) {
    super(message);
    this.name = `CancelError`;
  }
}

/**
 * Cancels the remaining chain operations if _undefined_ is an input.
 * See also {@link ifUndefined} or {@link ifNotUndefined}.
 * 
 * ```js
 * const c3 = Process.chain(
 *  Basic.max(),
 *  Process.seenLastToUndefined(),
 *  Process.cancelIfUndefined(),
 *  (v => {
 *   console.log(v);
 *  })
 * );
 * c3(100); // Prints '100'
 * c3(90);  // Doesn't print anything since max does not change
 * c3(110); // Prints '110'
 * ```
 * @returns 
 */
export function cancelIfUndefined<TIn>() {
  return (value: TIn | undefined) => {
    if (value === undefined) throw new CancelError(`cancel`);
    return value as TIn;
  }
}
/**
 * Returns the output of `fn` if the input value is _undefined_.
 * See also: {@link ifNotUndefined} and {@link cancelIfUndefined}.
 * @param fn 
 * @returns 
 */
export function ifUndefined<TIn, TOut>(fn: () => TOut) {
  return (value: TIn) => {
    if (value === undefined) return fn();
    else return value;
  }
}