import { throwIntegerTest } from "../util/GuardNumbers.js";
import { guardArray } from "./GuardArray.js";
/**
 * Throws if `index` is an invalid array index for `array`, and if
 * `array` itself is not a valid array.
 * @param array
 * @param index
 */
export const guardIndex = <V>(
  array: ArrayLike<V>,
  index: number,
  name = `index`
) => {
  guardArray(array);
  throwIntegerTest(index, `positive`, name);
  if (index > array.length - 1) {
    throw new Error(
      `'${ name }' ${ index } beyond array max of ${ array.length - 1 }`
    );
  }
};