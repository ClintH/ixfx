// Source: https://stackoverflow.com/questions/49682569/typescript-merge-object-types
// jcalz 2021-09-09

export type OptionalPropertyNames<T> =
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  { [ K in keyof T ]-?: ({} extends Record<K, T[ K ]> ? K : never) }[ keyof T ];

export type SpreadProperties<L, R, K extends keyof L & keyof R> =
  { [ P in K ]: L[ P ] | Exclude<R[ P ], undefined> };

export type Id<T> = T extends infer U ? { [ K in keyof U ]: U[ K ] } : never

export type SpreadTwo<L, R> = Id<
  & Pick<L, Exclude<keyof L, keyof R>>
  & Pick<R, Exclude<keyof R, OptionalPropertyNames<R>>>
  & Pick<R, Exclude<OptionalPropertyNames<R>, keyof L>>
  & SpreadProperties<L, R, OptionalPropertyNames<R> & keyof L>
>;

export type Spread<A extends readonly [ ...any ]> = A extends [ infer L, ...infer R ] ?
  SpreadTwo<L, Spread<R>> : unknown

/**
 * Merges objects together, the rightmost objects overriding properties of earlier objects.
 * 
 * The return type is the intersection of all properties
 * ```js
 * const a = { name: `jane`, age: 30 };
 * const b = { name: `fred`, age: 31, colour: `blue` };
 * const c = merge(a, b);
 * // Yields:
 * // { name: `fred`, age: 31, colour: `blue` } 
 * ```
 * 
 * Alternatively, use {@link mergeSameShape} if the return shape
 * should be based on the first object.
 * @param a 
 * @returns Merged object
 */
export function merge<A extends object[]>(...a: [ ...A ]): Spread<A> {
  return Object.assign({}, ...a) as Spread<A>;
}
// const a = { name: `jane`, age: 30 };
// const b = { name: `fred`,  colour: `blue` };
// const c = merge(a, b);


/**
 * Merges objects together, conforming to the shape of the first object.
 * Properties contained on later objects are ignored if they aren't part of the first.
 * 
 * If a single object is passed in, a copy is returned.
 * 
 * Use {@link merge} for object shape to be a union
 * @param a Object arrays to merge
 * @returns 
 */
export function mergeSameShape<T extends object>(...a: [T, ...Partial<T>[]]):T {
  const aEntries = Object.entries(a[0]);

  // For each subsequent object
  for (let index = 1; index < a.length; index++) {
    // Get its entries
    const bEntries = Object.entries(a[ index ]);
    for (const [ key, value ] of bEntries) {
      // Copy the value if it was in the first
      const aEntry = aEntries.find(([ aKey ]) => aKey === key);
      if (aEntry) aEntry[ 1 ] = value;
    }
  }
  return Object.fromEntries(aEntries) as T; 
}