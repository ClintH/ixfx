
/**
 * Returns a result of a merged into b.
 * B is always the 'newer' data that takes
 * precedence.
 */
export type MergeReconcile<V> = (a: V, b: V) => V;

export { type IsEqual } from "./util/is-equal.js";

export type MovingWindowOptions<T> = {
  /**
   * How many values to keep
   */
  samples: number
  /**
   * If specified, this function is called to filter values
   * before they are added to the window. If the reject function
   * returns _true_, the value is NOT added.
   * 
   * If the 'allow' function is also specified, it only gets used if
   * 'reject' returns _false_.
   * @param value 
   * @returns 
   */
  reject?: (value: T) => boolean
  /**
   * If specified, this function is called to filter values before
   * they are added to the window. If the allow function returns _true_,
   * the value IS added.
   * 
   * If 'reject' is also specified and it returns _true_, the allow function will not override it.
   * @param value 
   * @returns 
   */
  allow?: (value: T) => boolean
}