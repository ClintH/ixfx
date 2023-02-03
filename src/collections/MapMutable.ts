import { add, del, set, has } from './MapImmutable.js';
import { EitherKey, MapMutable } from "./Interfaces";

/**
 * Returns a {@link MapMutable} (which just wraps the in-built Map)
 * Use {@link map} for the immutable alternative.
 * 
 * @example Basic usage
 * ```js
 * const m = mapMutable();
 * // Add one or more entries
 * m.add(["name", "sally"]);
 * // Alternatively:
 * m.set("name", "sally");
 * // Recall
 * m.get("name");           // "sally"
 * m.delete("name");
 * m.isEmpty; // True
 * m.clear();
 * ```
 * @param data Optional initial data in the form of an array of `{ key: value }` or `[ key, value ]`
 */
export const mapMutable = <K, V>(...data:EitherKey<K, V>):MapMutable<K, V> => {
  // eslint-disable-next-line functional/no-let
  let m = add(new Map<K, V>(), ...data);
  return {
    add: (...data:EitherKey<K, V>) => {
      m = add(m, ...data);
    },
    delete: (key:K) => {
      m = del(m, key);
    },
    clear: () => {
      m = add(new Map<K, V>());
    },
    set: (key:K, value:V):void => {
      m = set(m, key, value);
    },
    get: (key:K):V | undefined => m.get(key),
    entries: () => m.entries(),
    isEmpty: () => m.size === 0,
    has: (key:K) => has(m, key)
  };
};