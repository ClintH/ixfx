/**
 * Clamps a value between min and max (both inclusive)
 * Defaults to a 0-1 range, useful for percentages.
 *
 * @example Usage
 * ```js
 * // 0.5 - just fine, within default of 0 to 1
 * clamp(0.5);
 * // 1 - above default max of 1
 * clamp(1.5);
 * // 0 - below range
 * clamp(-50, 0, 100);
 * // 50 - within range
 * clamp(50, 0, 50);
 * ```
 *
 * For clamping integer ranges, consider {@link clampIndex }
 * For clamping `{ x, y }` points, consider {@link @ixfx/geometry.Points.clamp}.
 * For clamping bipolar values: {@link Bipolar.clamp}
 * @param value Value to clamp
 * @param min value (inclusive)
 * @param max value (inclusive)
 * @returns Clamped value
 */
export const clamp = (value: number, min = 0, max = 1) => {
  // ✔ UNIT TESTED
  if (Number.isNaN(value)) throw new Error(`Param 'value' is NaN`);
  if (Number.isNaN(min)) throw new Error(`Param 'min' is NaN`);
  if (Number.isNaN(max)) throw new Error(`Param 'max' is NaN`);

  if (value < min) return min;
  if (value > max) return max;
  return value;
};

/**
 * Returns a function that clamps values.
 * 
 * ```js
 * const c = clamper(0,100);
 * c(50);   // 50
 * c(101); // 100
 * c(-5);  // 0
 * ```
 * @param min Minimum value. Default: 0
 * @param max Maximum value. Default: 1
 */
export const clamper = (min = 0, max = 1) => {
  if (Number.isNaN(min)) throw new Error(`Param 'min' is NaN`);
  if (Number.isNaN(max)) throw new Error(`Param 'max' is NaN`);
  return (v: number) => {
    if (v > max) return max;
    if (v < min) return min;
    return v;
  }
}

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
export const clampIndex = (
  v: number,
  arrayOrLength: number | readonly any[]
): number => {
  // ✔ UNIT TESTED
  if (!Number.isInteger(v)) {
    throw new TypeError(`v parameter must be an integer (${ v })`);
  }
  const length = Array.isArray(arrayOrLength)
    ? arrayOrLength.length
    : (arrayOrLength as number);

  if (!Number.isInteger(length)) {
    throw new TypeError(
      `length parameter must be an integer (${ length }, ${ typeof length })`
    );
  }
  v = Math.round(v);
  if (v < 0) return 0;
  if (v >= length) return length - 1;
  return v;
};


/**
 * Returns the largest value, ignoring the sign of numbers
 * 
 * ```js
 * maxAbs(1, 5);    // 5
 * maxAbs(-10, 5);  // -10 (since sign is ignored)
 * ```
 * @param values 
 * @returns 
 */
export const maxAbs = (...values: number[]) => {
  let index = -1;
  let maxA = Number.MIN_SAFE_INTEGER;
  for (let index_ = 0; index_ < values.length; index_++) {
    const vA = Math.abs(values[ index_ ]);
    if (vA > maxA) {
      maxA = vA;
      index = index_;
    }
  }
  return values[ index ];
}