import { compareIterableValuesShallow, isEqualDefault, type IsEqual } from "@ixfx/core";

/**
 * Returns the 'max' of some iterable using the provided scoring function.
 * It only yields a value when iterator finishes.
 * @param iterable
 * @param scorer 
 * @returns 
 */
export const maxScore = <V>(iterable: Iterable<V>, scorer: (v: V) => number): V | undefined => {
  let highestValue: V | undefined;
  let highestScore = Number.MIN_SAFE_INTEGER;
  for (const value of iterable) {
    const score = scorer(value);
    if (score >= highestScore) {
      highestScore = score;
      highestValue = value;
    }
  }
  return highestValue;
}

/**
 * Returns the 'min' of some iterable using the provided scoring function.
 * It only yields a value when iterator finishes.
 * @param iterable 
 * @param scorer 
 * @returns 
 */
export const minScore = <V>(iterable: Iterable<V>, scorer: (v: V) => number): V | undefined => {
  let lowestValue: V | undefined;
  let lowestScore
    = Number.MAX_SAFE_INTEGER;
  for (const value of iterable) {
    const score = scorer(value);
    if (score <= lowestScore) {
      lowestScore = score;
      lowestValue = value;
    }
  }
  return lowestValue;
}


/**
 * Returns _true_ if all values in iterables are equal, regardless
 * of their position. Uses === equality semantics by default.
 * 
 * Is NOT recursive.
 * 
 * @example Default equality checking
 * ```js
 * const a = ['apples','oranges','pears'];
 * const b = ['pears','oranges','apples'];
 * hasEqualValuesShallow(a, b); // True
 * ```
 *
 * @example Custom equality checking
 * ```js
 * const a = [ { name: 'John' }];
 * const b = [ { name: 'John' }];
 * // False, since object identies are different
 * hasEqualValuesShallow(a, b); 
 * // True, since now we're comparing by value
 * hasEqualValuesShallow(a, b, (aa,bb) => aa.name === bb.name);
 * ```
 * @param iterableA First iterable to check
 * @param iterableB Iterable to compare against
 * @param eq Equality function, uses === by default
 */
export const hasEqualValuesShallow = <V>(
  iterableA: Iterable<V>,
  iterableB: Iterable<V>,
  eq?: IsEqual<V>
): boolean => {
  const returnValue = compareIterableValuesShallow(iterableA, iterableB, eq);
  return returnValue.a.length === 0 && returnValue.b.length === 0;
};

