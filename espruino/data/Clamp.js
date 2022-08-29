"use strict";
exports.__esModule = true;
exports.clampIndex = exports.clamp = void 0;
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
 * For clamping `{ x, y }` points, consider {@link Geometry.Points.clamp | Geometry.Points.clamp}.
 *
 * @param v Value to clamp
 * @param Minimum value (inclusive)
 * @param Maximum value (inclusive)
 * @returns Clamped value
 */
var clamp = function (v, min, max) {
    if (min === void 0) { min = 0; }
    if (max === void 0) { max = 1; }
    // ✔ UNIT TESTED
    if (Number.isNaN(v))
        throw new Error("v parameter is NaN");
    if (Number.isNaN(min))
        throw new Error("min parameter is NaN");
    if (Number.isNaN(max))
        throw new Error("max parameter is NaN");
    if (v < min)
        return min;
    if (v > max)
        return max;
    return v;
};
exports.clamp = clamp;
/**
 * Clamps integer `v` between 0 (inclusive) and array length or length (exclusive).
 * Returns value then will always be at least zero, and a valid array index.
 *
 * @example Usage
 * ```js
 * // Array of length 4
 * const myArray = [`a`, `b`, `c`, `d`];
 * clampIndex(0, myArray);    // 0
 * clampIndex(4, myArray);    // 3
 * clampIndex(-1, myArray);   // 0
 *
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
//eslint-disable-next-line @typescript-eslint/no-explicit-any
var clampIndex = function (v, arrayOrLength) {
    // ✔ UNIT TESTED
    if (!Number.isInteger(v))
        throw new Error("v parameter must be an integer (".concat(v, ")"));
    var length = (Array.isArray(arrayOrLength)) ? arrayOrLength.length : arrayOrLength;
    if (!Number.isInteger(length))
        throw new Error("length parameter must be an integer (".concat(length, ", ").concat(typeof length, ")"));
    v = Math.round(v);
    if (v < 0)
        return 0;
    if (v >= length)
        return length - 1;
    return v;
};
exports.clampIndex = clampIndex;
//# sourceMappingURL=Clamp.js.map