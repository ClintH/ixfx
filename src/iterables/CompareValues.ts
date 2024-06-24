import { isEqualDefault, type IsEqual } from "../util/IsEqual.js";

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
export const min = <V>(iterable: Iterable<V>, scorer: (v: V) => number): V | undefined => {
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
 * hasEqualValues(a, b); // True
 * ```
 *
 * @example Custom equality checking
 * ```js
 * const a = [ { name: 'John' }];
 * const b = [ { name: 'John' }];
 * // False, since object identies are different
 * hasEqualValues(a, b); 
 * // True, since now we're comparing by value
 * hasEqualValues(a, b, (aa,bb) => aa.name === bb.name);
 * ```
 * @param arrays
 * @param eq
 */
export const hasEqualValuesShallow = <V>(
  iterableA: Iterable<V>,
  iterableB: Iterable<V>,
  eq?: IsEqual<V>
): boolean => {
  const returnValue = compareValuesShallow(iterableA, iterableB, eq);
  return returnValue.a.length === 0 && returnValue.b.length === 0;
};

/**
 * Compares the values of two iterables, returning a list
 * of items they have in common and those unique in `a` or `b`.
 * Ignores ordering of values, and is NOT recursive.
 *
 * ```js
 * const a = ['apples', 'oranges', 'pears' ]
 * const b = ['pears', 'kiwis', 'bananas' ];
 *
 * const r = compareValuesShallow(a, b);
 * r.shared;  // [ 'pears' ]
 * r.a;       // [ 'apples', 'oranges' ]
 * r.b;       // [ 'kiwis', 'bananas' ]
 * ```
 * 
 * By default uses === semantics for comparison.
 * @param a
 * @param b
 * @param eq
 * @returns
 */
export const compareValuesShallow = <V>(
  a: Iterable<V>,
  b: Iterable<V>,
  eq = isEqualDefault<V>
) => {
  const shared = [];
  const aUnique = [];
  const bUnique = [];

  for (const elementOfA of a) {
    let seenInB = false;
    // Does B contain this thing from A?
    for (const elementOfB of b) {
      if (eq(elementOfA, elementOfB)) {
        seenInB = true;
        break;
      }
    }

    if (seenInB) {
      // Common in A & B
      shared.push(elementOfA);
    } else {
      // No, it's only found in A
      aUnique.push(elementOfA);
    }
  }

  for (const elementOfB of b) {
    let seenInA = false;
    // Does A contain this thing from B?
    for (const elementOfA of a) {
      if (eq(elementOfB, elementOfA)) {
        seenInA = true;
      }
    }
    if (!seenInA) {
      // No, something unique to B
      bUnique.push(elementOfB);
    }
  }

  // Are the two iterables the same?
  const isSame = aUnique.length === 0 && bUnique.length === 0;

  return {
    shared,
    isSame,
    a: aUnique,
    b: bUnique
  };
};
