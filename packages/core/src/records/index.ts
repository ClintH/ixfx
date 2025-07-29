export * from './compare.js';
export * from './clone-from-fields.js';
export * from './map-object.js';
export * from './traverse.js';
export * from './merge.js';
export * from './keys-to-numbers.js';
export type * from '../types-compare.js';

/**
 * A set of functions to work with plain objects using string paths to traverse
 * the structure of an object
 */
export * as Pathed from './pathed.js';

/**
 * Maps the keys of an object, returning a transformed object.
 * ```js
 * const input = {
 *  hello: `there`,
 *  chap: `chappie`
 * }
 * 
 * mapObjectKeys(input, key => key.toUppercase());
 * 
 * // Yields: { HELLO: `there`, CHAP: `chappie` }
 * ```
 * @param object 
 * @param mapFunction 
 * @returns 
 */
export const mapObjectKeys = <TKeySource extends string | number | symbol, TKeyDestination extends string | number | symbol>(object: Record<TKeySource, unknown>, mapFunction: (key: TKeySource) => TKeyDestination) => {
  const destinationObject = {};
  for (const entries of Object.entries(object)) {
    const key = mapFunction(entries[ 0 ] as TKeySource);
    (destinationObject as Record<TKeyDestination, unknown>)[ key ] = entries[ 1 ];
  }
  return destinationObject as Record<TKeyDestination, unknown>;
}
