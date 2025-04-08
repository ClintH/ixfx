import { isEqualDefault } from "./util/is-equal.js";
import { toStringDefault } from "./util/to-string.js";


/**
 * Returns _true_ if contents of `needles` is contained by `haystack`.
 * ```js
 * const a = ['apples','oranges','pears','mandarins'];
 * const b = ['pears', 'apples'];
 * contains(a, b); // True
 *
 * const c = ['pears', 'bananas'];
 * contains(a, b); // False ('bananas' does not exist in a)
 * ```
 * @param haystack
 * @param needles
 * @param eq
 */
export const contains = <V>(
  haystack: ArrayLike<V>,
  needles: ArrayLike<V>,
  eq = isEqualDefault<V>
) => {
  if (!Array.isArray(haystack)) {
    throw new TypeError(`Expects haystack parameter to be an array`);
  }
  if (!Array.isArray(needles)) {
    throw new TypeError(`Expects needles parameter to be an array`);
  }

  for (const needle of needles) {
    //eslint-disable-next-line functional/no-let
    let found = false;
    for (const element of haystack) {
      if (eq(needle, element)) {
        found = true;
        break;
      }
    }
    if (!found) {
      return false;
    }
  }
  return true;
};

/**
 * Returns _true_ if array contains duplicate values.
 *
 * ```js
 * containsDuplicateValues(['a','b','a']); // True
 * containsDuplicateValues([
 *  { name: 'Apple' },
 *  { name: 'Apple' }
 * ]); // True
 * ```
 * 
 * Uses JSON.toString() by default to compare values.
 * 
 * See also:
 * * {@link containsDuplicateInstances}: Compare based on reference, rather than value
 * * {@link unique} Get unique set of values in an array
 * @param array Array to examine
 * @param keyFunction Function to generate key string for object, uses JSON.stringify by default.
 * @returns
 */
export const containsDuplicateValues = <V>(
  data: Iterable<V>,
  keyFunction = toStringDefault<V>
): boolean => {
  if (typeof data !== `object`) throw new Error(`Param 'data' is expected to be an Iterable. Got type: ${ typeof data }`);
  const set = new Set<string>();
  for (const v of data) {
    const str = keyFunction(v);
    if (set.has(str)) return true;
    set.add(str);
  }
  return false;
};
