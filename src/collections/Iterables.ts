import { isEqualDefault } from '../IsEqual.js'

export const max = <V>(iterable: Iterable<V>, scorer: (v: V) => number): V | undefined => {
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
 * @example Default equality checking
 * ```js
 * const a = ['apples','oranges','pears'];
 * const b = ['pears','oranges','apples'];
 * compareValuesEqual(a, b); // True
 * ```
 *
 * @example Custom equality checking
 * ```js
 * const a = [ { name: 'John' }];
 * const b = [ { name: 'John' }];
 * // False, since object identies are different
 * compareValuesEqual(a, b); 
 * // True, since now we're comparing by value
 * compareValuesEqual(a, b, (aa,bb) => aa.name === bb.name);
 * ```
 * @param arrays
 * @param eq
 */
export const compareValuesEqual = <V>(
  //eslint-disable-next-line functional/prefer-readonly-type
  iterableA: Iterable<V>,
  iterableB: Iterable<V>,
  eq = isEqualDefault<V>
): boolean => {
  const returnValue = compareValues(iterableA, iterableB, eq);
  return returnValue.a.length === 0 && returnValue.b.length === 0;
};


/**
 * Compares the values of two iterables, returning a list
 * of items they have in common, and those unique in `a` or `b`.
 * Ignores ordering of values.
 *
 * ```js
 * const a = ['apples', 'oranges', 'pears' ]
 * const b = ['pears', 'kiwis', 'bananas' ];
 *
 * const r = compareValues(a, b);
 * r.shared;  // [ 'pears' ]
 * r.a;       // [ 'apples', 'oranges' ]
 * r.b;       // [ 'kiwis', 'bananas' ]
 * ```
 * @param a
 * @param b
 * @param eq
 * @returns
 */
export const compareValues = <V>(
  a: Iterable<V>,
  b: Iterable<V>,
  eq = isEqualDefault<V>
) => {
  const shared = [];
  const aUnique = [];
  const bUnique = [];

  for (const element of a) {
    //eslint-disable-next-line functional/no-let
    let seenInB = false;
    for (const element_ of b) {
      if (eq(element, element_)) {
        seenInB = true;
        break;
      }
    }
    if (seenInB) {
      //eslint-disable-next-line functional/immutable-data
      shared.push(element);
    } else {
      //eslint-disable-next-line functional/immutable-data
      aUnique.push(element);
    }
  }

  for (const element of b) {
    //eslint-disable-next-line functional/no-let
    let seenInA = false;
    for (const element_ of a) {
      if (eq(element, element_)) {
        seenInA = true;
      }
    }
    if (!seenInA) {
      //eslint-disable-next-line functional/immutable-data
      bUnique.push(element);
    }
  }

  return {
    shared,
    a: aUnique,
    b: bUnique,
  };
};
