import { isEqualDefault } from "./is-equal.js";

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
export const compareIterableValuesShallow = <V>(
  a: Iterable<V>,
  b: Iterable<V>,
  eq: (a: V, b: V) => boolean = isEqualDefault<V>
): { shared: V[]; isSame: boolean; a: V[]; b: V[]; } => {
  const shared: V[] = [];
  const aUnique: V[] = [];
  const bUnique: V[] = [];

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
