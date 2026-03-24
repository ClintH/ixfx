/**
 * Clamps integer `v` between 0 (inclusive) and array length or length (exclusive).
 * Returns value then will always be at least zero, and a valid array index.
 *
 * @example Usage
 * ```js
 * // Array of length 4
 * const myArray = [`a`, `b`, `c`, `d`];
 * clampIndex(0, myArray);    // 0
 * clampIndex(5, 3); // 2
 * ```
 *
 * Throws an error if `v` is not an integer.
 *
 * For some data it makes sense that data might 'wrap around' if it exceeds the
 * range. For example rotation angle. Consider using {@link wrap} for this.
 *
 * @param v Value to clamp (must be an interger)
 * @param arrayOrLength Array, or length of bounds (must be an integer)
 * @returns Clamped value, minimum will be 0, maximum will be one less than `length`.
 */
export function clampIndex(v: number, arrayOrLength: number | readonly any[]): number {
  if (!Number.isInteger(v)) {
    throw new TypeError(`v parameter must be an integer (${v})`);
  }
  const length = Array.isArray(arrayOrLength)
    ? arrayOrLength.length
    : (arrayOrLength as number);

  if (!Number.isInteger(length)) {
    throw new TypeError(
      `length parameter must be an integer (${length}, ${typeof length})`,
    );
  }
  v = Math.round(v);
  if (v < 0)
    return 0;
  if (v >= length)
    return length - 1;
  return v;
}