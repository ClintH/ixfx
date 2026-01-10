import { arrayTest, functionTest, resultThrow } from "@ixfx/guards";
import { isEqualDefault } from "./util/is-equal.js";
import { toStringDefault } from "./util/to-string.js";


/**
 * Returns _true_ if all value in `needles` is contained in `haystack`, 
 * by default using === semantics. 
 * 
 * ```js
 * const a = ['apples','oranges','pears','mandarins'];
 * const b = ['pears', 'apples'];
 * contains(a, b); // True
 *
 * const c = ['pears', 'bananas'];
 * contains(a, b); // False ('bananas' does not exist in a)
 * ```
 * 
 * If `needles` is empty, `contains` will return true.
 * 
 * Compare by value using ixfx's {@link isEqualValueDefault}, or a custom function of your own
 * ```js
 * contains(a, b, isEqualValueDefault);
 * contains(a, b, (valueA, valueV) => {
 *  return valueA.name === valueB.name
 * })
 * ```
 * @throws {TypeError} If parameters are not valid
 * @param haystack Array to search
 * @param needles Things to look for
 * @param eq Optional function to compare equality. By default uses === semantics
 */
export const contains = <V>(
  haystack: V[],
  needles: V[],
  eq: (a: V, b: V) => boolean = isEqualDefault<V>
): boolean => {
  resultThrow(
    arrayTest(haystack, `haystack`),
    arrayTest(needles, `needles`),
    functionTest(eq, `eq`)
  );

  for (const needle of needles) {
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
 * * {@link unique}: Get unique set of values in an array
 * * {@link containsDuplicateInstances}: Compare based on reference, rather than value
 * * {@link containsDuplicateValues}: Returns _true_ if every item in array is the same
 * @param data Array to examine
 * @param keyFunction Function to generate key string for object, uses JSON.stringify by default.
 * @returns
 */
export const containsDuplicateValues = <V>(
  data: Iterable<V>,
  keyFunction: (itemToMakeStringFor: V) => string = toStringDefault<V>
): boolean => {
  if (typeof data !== `object`) throw new Error(`Param 'data' is expected to be an Iterable. Got type: ${ typeof data }`);
  const set = new Set<string>();
  for (const v of data) {
    const string_ = keyFunction(v);
    if (set.has(string_)) return true;
    set.add(string_);
  }
  return false;
};

/**
 * Returns _true_ if array contains duplicate instances based on `===` equality checking.
 * 
 * ```js
 * const o1 = { hello: `there` };
 * const o2 = { hello: `there` };
 * containsDuplicateInstances([ o1, o2 ]); // False
 * containsDuplicateInstances([ o1, o1 ]); // True
 * ```
 * 
 * Primitive values are compared by value:
 * ```js
 * containsDuplicateInstances([ 1, 2, 1 ]); // True
 * containsDuplicateInstances([ `a`, `b`, `a` ]); // True
 * ```
 * 
 * Use {@link containsDuplicateValues} if you'd rather compare by value.
 * @param array 
 * @throws {TypeError} If `array` parameter is not an array
 * @returns 
 */
export const containsDuplicateInstances = <V>(array: V[] | readonly V[]): boolean => {
  resultThrow(
    arrayTest(array, `array`),
  );
  for (let index = 0; index < array.length; index++) {
    for (let x = 0; x < array.length; x++) {
      if (index === x) continue;
      if (array[ index ] === array[ x ]) return true;
    }
  }
  return false;
}