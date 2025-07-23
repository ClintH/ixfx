import type { Process } from "./types.js";
import { isEqualDefault, toStringDefault } from "./util.js";

/**
 * If a value is same as the previous value, _undefined_ is emitted instead.
 * 
 * @param eq Equality function. If not specified, === semantics are used.
 * @returns 
 */
export function seenLastToUndefined<TIn>(eq?: (a: TIn, b: TIn) => boolean): Process<TIn, TIn | undefined> {
  if (typeof eq === `undefined`) eq = isEqualDefault;
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
 * 
 * It stores all previous values and compares against them for each new value. 
 * This would likely be not very efficient compared to {@link seenToUndefinedByKey} which uses a one-time computed
 * key and efficient storage of only the keys (using a Set).
 *  
 * @param eq Equality function. If not specified, === semantics are used.
 * @returns 
 */
export function seenToUndefined<TIn>(eq?: (a: TIn, b: TIn) => boolean): Process<TIn, TIn | undefined> {
  const seen: TIn[] = [];
  if (typeof eq === `undefined`) eq = isEqualDefault;
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
 * 
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
  const seen = new Set<string>();
  if (typeof toString === `undefined`) toString = toStringDefault;
  return (value: TIn) => {
    if (value === undefined) return;
    const key = toString(value);
    if (seen.has(key)) return;
    seen.add(key);
    return value;
  }
}