import type { IMappish } from './IMappish.js';
export type GetOrGenerate<K, V, Z> = (key: K, args?: Z) => Promise<V>;

/**
 * @inheritDoc getOrGenerate
 * @param map
 * @param fn
 * @returns
 */
//eslint-disable-next-line functional/prefer-readonly-type
export const getOrGenerateSync =
  <K, V, Z>(map: IMappish<K, V>, fn: (key: K, args?: Z) => V) =>
    (key: K, args?: Z): V => {
      //eslint-disable-next-line functional/no-let
      let value = map.get(key);
      if (value !== undefined) return value;
      value = fn(key, args);
      map.set(key, value);
      return value;
    };

/**
 * Returns a function that fetches a value from a map, or generates and sets it if not present.
 * Undefined is never returned, because if `fn` yields that, an error is thrown.
 *
 * See {@link getOrGenerateSync} for a synchronous version.
 *
 * ```
 * const m = getOrGenerate(new Map(), (key) => {
 *  return key.toUppercase();
 * });
 *
 * // Not contained in map, so it will run the uppercase function,
 * // setting the value to the key 'hello'.
 * const v = await m(`hello`);  // Yields 'HELLO'
 * const v1 = await m(`hello`); // Value exists, so it is returned ('HELLO')
 * ```
 *
 */
//eslint-disable-next-line functional/prefer-readonly-type
export const getOrGenerate =
  <K, V, Z>(
    map: IMappish<K, V>,
    fn: (key: K, args?: Z) => Promise<V> | V
  ): GetOrGenerate<K, V, Z> =>
    async (key: K, args?: Z): Promise<V> => {
      //eslint-disable-next-line functional/no-let
      let value = map.get(key);
      if (value !== undefined) return value; //Promise.resolve(value);
      value = await fn(key, args);
      if (value === undefined) throw new Error(`fn returned undefined`);
      map.set(key, value);
      return value;
    };