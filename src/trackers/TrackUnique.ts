import { toStringDefault, type ToString } from "../util/index.js";

export type TrackUnique<T> = (value: T) => boolean

/**
 * Tracks unique values. Returns _true_ if value is unique.
 * Alternatively: {@link uniqueInstances}
 * 
 * ```js
 * const t = unique();
 * t(`hello`); // true
 * t(`hello`); // false
 * ```
 * 
 * Uses JSON.stringify to compare anything which is not a string.
 * 
 * Provide a custom function to convert to string to track uniqueness
 * for more complicated objects.
 * 
 * ```js
 * const t = unique(p => p.name);
 * t({ name:`John`, level:2 }); // true
 * 
 * // Since we're judging uniques by name only
 * t({ name:`John`, level:3 }); // false
 * ```
 * 
 * Return function throws an error if `value` is null or undefined.
 * @returns 
 */
export const unique = <T>(toString: ToString<T> = toStringDefault): TrackUnique<T> => {
  const set = new Set<string>();

  return (value: T) => {
    if (value === null) throw new TypeError(`Param 'value' cannot be null`);
    if (value === undefined) throw new TypeError(`Param 'value' cannot be undefined`);

    const asString = (typeof value === `string`) ? value : toString(value);
    if (set.has(asString)) return false;
    set.add(asString);
    return true;
  }
}

/**
 * Tracks unique object instances. Returns _true_ if value is unique.
 * Alternatively: {@link unique} to track by value.
 */
export const uniqueInstances = <T>(): TrackUnique<T> => {

  const set = new Set<T>();
  return (value: T) => {
    if (value === null) throw new TypeError(`Param 'value' cannot be null`);
    if (value === undefined) throw new TypeError(`Param 'value' cannot be undefined`);

    if (set.has(value)) return false;
    set.add(value);
    return true;
  }
}