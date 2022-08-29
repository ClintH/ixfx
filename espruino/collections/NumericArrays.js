"use strict";
exports.__esModule = true;
exports.minMaxAvg = exports.minFast = exports.maxFast = exports.total = exports.max = exports.minIndex = exports.maxIndex = exports.min = exports.averageWeighted = exports.average = exports.dotProduct = exports.validNumbers = exports.weight = void 0;
var Arrays_js_1 = require("./Arrays.js");
/**
 * Applies a function `fn` to the elements of an array, weighting them based on their relative position.
 *
 * ```js
 * import { Arrays } from 'https://unpkg.com/ixfx/dist/collections.js';
 *
 * // Six items
 * Arrays.weight([1,1,1,1,1,1], Easings.gaussian());
 *
 * // Yields:
 * // [0.02, 0.244, 0.85, 0.85, 0.244, 0.02]
 * ```
 *
 * `fn` is expected to map (0..1) => (0..1), such as an {@link Modulation.Easings.EasingFn}. The input to the
 * `fn` is the relative position of an element. Thus the first element will be 0, the middle 0.5 and so on.
 * The output of `fn` is then multiplied by the original value.
 *
 * In the below example (which is also the default if `fn` is not specified), the relative position is
 * how values are weighted:
 *
 * ```js
 * Arrays.weight([1,1,1,1,1,1], (relativePos) => relativePos);
 * // Yields:
 * // [0, 0.2, 0.4, 0.6, 0.8, 1]
 * ```
 *
 * Non-numbers in `data` will be silently ignored (this filtering happens first, so relative index values are sane still).
 *
 * @param data Array of numbers
 * @param fn Returns a weighting based on the given relative position. If unspecified, `(x) => x` is used.
 */
var weight = function (data, fn) {
    var f = (fn === undefined) ? function (x) { return x; } : fn;
    return (0, exports.validNumbers)(data).map(function (v, index) { return v * f(index / (exports.validNumbers.length - 1)); });
};
exports.weight = weight;
/**
 * Returns an array of all valid numbers from `data`
 *
 * @param data
 * @returns
 */
var validNumbers = function (data) { return data.filter(function (d) { return typeof d === "number" && !Number.isNaN(d); }); };
exports.validNumbers = validNumbers;
/**
 * Returns the dot product of two arbitrary-sized arrays. Assumed they are of the same length.
 * @param a
 * @param b
 * @returns
 */
var dotProduct = function (values) {
    //eslint-disable-next-line functional/no-let
    var r = 0;
    var len = values[0].length;
    //eslint-disable-next-line functional/no-let
    for (var i = 0; i < len; i++) {
        //eslint-disable-next-line functional/no-let
        var t = 0;
        //eslint-disable-next-line functional/no-let
        for (var p = 0; p < values.length; p++) {
            if (p === 0)
                t = values[p][i];
            else {
                t *= values[p][i];
            }
        }
        r += t;
    }
    return r;
};
exports.dotProduct = dotProduct;
/**
 * Calculates the average of all numbers in an array.
 * Array items which aren't a valid number are ignored and do not factor into averaging.
 *
 * Use {@link minMaxAvg} if you want min, max and total as well.
 *
 * @example
 * ```
 * import { Arrays } from 'https://unpkg.com/ixfx/dist/collections.js';
 *
 * // Average of a list
 * const avg = Arrays.average([1, 1.4, 0.9, 0.1]);
 *
 * // Average of a variable
 * let data = [100,200];
 * Arrays.average(data);
 * ```
 *
 * See also: [Numbers.average](Numbers.average.html) which takes a list of parameters
 * @param data Data to average.
 * @returns Average of array
 */
var average = function (data) {
    // ✔ UNIT TESTED
    if (data === undefined)
        throw new Error("data parameter is undefined");
    var valid = (0, exports.validNumbers)(data);
    var total = valid.reduce(function (acc, v) { return acc + v; }, 0);
    return total / valid.length;
};
exports.average = average;
/**
 * Computes an average of an array with a set of weights applied.
 *
 * Weights can be provided as an array, expected to be on 0..1 scale, with indexes
 * matched up to input data. Ie. data at index 2 will be weighed by index 2 in the weightings array.
 *
 * ```js
 * import { Arrays } from 'https://unpkg.com/ixfx/dist/collections.js';
 * // All items weighted evenly
 * Arrays.averageWeighted([1,2,3], [1,1,1]); // 2
 *
 * // First item has full weight, second half, third quarter
 * Arrays.averageWeighted([1,2,3], [1, 0.5, 0.25]); // 1.57
 *
 * // With reversed weighting of [0.25,0.5,1] value is 2.42
 * ```
 *
 * A function can alternatively be provided to compute the weighting based on array index, via {@link weight}.
 *
 * ```js
 * Arrays.averageWeighted[1,2,3], Easings.gaussian()); // 2.0
 * ```
 *
 * This is the same as:
 *
 * ```js
 * import { Arrays } from 'https://unpkg.com/ixfx/dist/collections.js';
 * import { Easings } from 'https://unpkg.com/ixfx/dist/modulation.js';
 *
 * const data = [1,2,3];
 * const w = Arrays.weight(data, Easings.gaussian());
 * const avg = Arrays.averageWeighted(data, w); // 2.0
 * ```
 * @param data Data to average
 * @param weightings Array of weightings that match up to data array, or an easing function
 */
var averageWeighted = function (data, weightings) {
    if (typeof weightings === "function")
        weightings = (0, exports.weight)(data, weightings);
    var ww = (0, Arrays_js_1.zip)(data, weightings);
    var _a = ww.reduce(function (acc, v) { return [acc[0] + (v[0] * v[1]), acc[1] + v[1]]; }, [0, 0]), totalV = _a[0], totalW = _a[1];
    return totalV / totalW;
};
exports.averageWeighted = averageWeighted;
/**
 * Returns the minimum number out of `data`.
 * Undefined and non-numbers are silently ignored.
 *
 * ```js
 * import { Arrays } from 'https://unpkg.com/ixfx/dist/collections.js';
 * Arrays.min([10, 20, 0]); // Yields 0
 * ```
 * @param data
 * @returns Minimum number
 */
var min = function (data) { return Math.min.apply(Math, (0, exports.validNumbers)(data)); };
exports.min = min;
/**
 * Returns the index of the largest value.
 * ```js
 * import { Arrays } from 'https://unpkg.com/ixfx/dist/collections.js';
 * const v = [ 10, 40, 5 ];
 * Arrays.maxIndex(v); // Yields 1
 * ```
 * @param data Array of numbers
 * @returns Index of largest value
 */
var maxIndex = function (data) { return data.reduce(function (bestIndex, value, index, arr) { return (value > arr[bestIndex] ? index : bestIndex); }, 0); };
exports.maxIndex = maxIndex;
/**
 * Returns the index of the smallest value.
 *
 * ```js
 * import { Arrays } from 'https://unpkg.com/ixfx/dist/collections.js';
 * const v = [ 10, 40, 5 ];
 * Arrays.minIndex(v); // Yields 2
 * ```
 * @param data Array of numbers
 * @returns Index of smallest value
 */
var minIndex = function () {
    var data = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        data[_i] = arguments[_i];
    }
    return data.reduce(function (bestIndex, value, index, arr) { return (value < arr[bestIndex] ? index : bestIndex); }, 0);
};
exports.minIndex = minIndex;
/**
 * Returns the maximum number out of `data`.
 * Undefined and non-numbers are silently ignored.
 *
 * ```js
 * import { Arrays } from 'https://unpkg.com/ixfx/dist/collections.js';
 * Arrays.max(100, 200, 50); // 200
 * ```
 * @param data List of numbers
 * @returns Maximum number
 */
var max = function (data) { return Math.max.apply(Math, (0, exports.validNumbers)(data)); };
exports.max = max;
/**
 * Returns the total of `data`.
 * Undefined and non-numbers are silently ignored.
 *
 * ```js
 * import { Arrays } from 'https://unpkg.com/ixfx/dist/collections.js';
 * Arrays.total([1, 2, 3]); // 6
 * ```
 * @param data Array of numbers
 * @returns Total
 */
var total = function (data) { return data.reduce(function (prev, curr) {
    if (typeof curr !== "number")
        return prev;
    if (Number.isNaN(curr))
        return prev;
    if (Number.isFinite(curr))
        return prev;
    return prev + curr;
}, 0); };
exports.total = total;
/**
 * Returns the maximum out of `data` without pre-filtering for speed.
 *
 * For most uses, {@link max} should suffice.
 *
 * ```js
 * import { Arrays } from 'https://unpkg.com/ixfx/dist/collections.js';
 * Arrays.maxFast([ 10, 0, 4 ]); // 10
 * ```
 * @param data
 * @returns Maximum
 */
var maxFast = function (data) {
    //eslint-disable-next-line functional/no-let
    var m = Number.MIN_SAFE_INTEGER;
    //eslint-disable-next-line functional/no-let
    for (var i = 0; i < data.length; i++) {
        m = Math.max(m, data[i]);
    }
    return m;
};
exports.maxFast = maxFast;
/**
 * Returns the maximum out of `data` without pre-filtering for speed.
 *
 * For most uses, {@link max} should suffice.
 *
 * ```js
 * import { Arrays } from 'https://unpkg.com/ixfx/dist/collections.js';
 * Arrays.minFast([ 10, 0, 100 ]); // 0
 * ```
 * @param data
 * @returns Maximum
 */
var minFast = function (data) {
    //eslint-disable-next-line functional/no-let
    var m = Number.MIN_SAFE_INTEGER;
    //eslint-disable-next-line functional/no-let
    for (var i = 0; i < data.length; i++) {
        m = Math.min(m, data[i]);
    }
    return m;
};
exports.minFast = minFast;
/**
 * Returns the min, max, avg and total of the array.
 * Any values that are invalid are silently skipped over.
 *
 * ```js
 * import { Arrays } from 'https://unpkg.com/ixfx/dist/collections.js';
 *
 * const v = [10, 2, 4.2, 99];
 * const mma = Arrays.minMaxAvg(v);
 * Yields: { min: 2, max: 99, total: 115.2, avg: 28.8 }
 * ```
 *
 * Use {@link average}, {@link max}, {@link min} or {@link total} if you only need one of these.
 *
 * A start and end range can be provided if the calculation should be restricted to a part
 * of the input array. By default the whole array is used.
 *
 * @param data
 * @param startIndex If provided, starting index to do calculations (defaults full range)
 * @param endIndex If provided, the end index to do calculations (defaults full range)
 * @returns `{min, max, avg, total}`
 */
var minMaxAvg = function (data, startIndex, endIndex) {
    if (data === undefined)
        throw new Error("'data' is undefined");
    if (!Array.isArray(data))
        throw new Error("'data' parameter is not an array");
    if (data.length === 0) {
        return {
            total: 0,
            min: 0,
            max: 0,
            avg: 0
        };
    }
    if (startIndex === undefined)
        startIndex = 0;
    if (endIndex === undefined)
        endIndex = data.length - 1;
    var validNumbers = (0, Arrays_js_1.filterBetween)(data, function (d) { return typeof d === "number" && !Number.isNaN(d); }, startIndex, endIndex);
    var total = validNumbers.reduce(function (acc, v) { return acc + v; }, 0);
    return {
        total: total,
        max: Math.max.apply(Math, validNumbers),
        min: Math.min.apply(Math, validNumbers),
        avg: total / validNumbers.length
    };
};
exports.minMaxAvg = minMaxAvg;
//# sourceMappingURL=NumericArrays.js.map