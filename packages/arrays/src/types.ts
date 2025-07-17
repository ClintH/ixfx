
/**
 * Returns a result of a merged into b.
 * B is always the 'newer' data that takes
 * precedence.
 */
export type MergeReconcile<V> = (a: V, b: V) => V;

export { type IsEqual } from "./util/is-equal.js";
