import { toStringDefault, type ToString } from "../Util.js";

export type TrackUnique<T> = (value: T) => boolean

/**
 * Tracks unique values
 * 
 * ```js
 * const t = trackUnique();
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
 * const t = trackUnique(p => p.name);
 * t({ name:`John`, level:2 }); // true
 * 
 * // Since we're judging uniques by name only
 * t({ name:`John`, level:3 }); // false
 * ```
 * @returns 
 */
export const trackUnique = <T>(toString: ToString<T> = toStringDefault): TrackUnique<T> => {
  const set = new Set<string>();

  return (value: T) => {
    const asString = (typeof value === `string`) ? value : toString(value);
    if (set.has(asString)) return false;
    set.add(asString);
    return true;
  }
}