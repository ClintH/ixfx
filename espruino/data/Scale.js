"use strict";
exports.__esModule = true;
exports.scalePercent = exports.scalePercentages = exports.scaleClamped = exports.scale = void 0;
var Clamp_js_1 = require("./Clamp.js");
var Guards_js_1 = require("../Guards.js");
/**
 * Scales `v` from an input range to an output range (aka `map`)
 *
 * For example, if a sensor's useful range is 100-500, scale it to a percentage:
 *
 * ```js
 * import { scale } from 'https://unpkg.com/ixfx/dist/data.js';
 *
 * scale(sensorReading, 100, 500, 0, 1);
 * ```
 *
 * `scale` defaults to a percentage-range output, so you can get away with:
 * ```js
 * scale(sensorReading, 100, 500);
 * ```
 *
 * If `v` is outside of the input range, it will likewise be outside of the output range.
 * Use {@link scaleClamped} to clip value to range.
 *
 * If inMin and inMax are equal, outMax will be returned.
 *
 * An easing function can be provided for non-linear scaling. In this case
 * the input value is 'pre scaled' using the function before it is applied to the
 * output range.
 *
 * ```js
 * scale(sensorReading, 100, 500, 0, 1, Easings.gaussian());
 * ```
 * @param v Value to scale
 * @param inMin Input minimum
 * @param inMax Input maximum
 * @param outMin Output minimum. If not specified, 0
 * @param outMax Output maximum. If not specified, 1
 * @param easing Easing function
 * @returns Scaled value
 */
var scale = function (v, inMin, inMax, outMin, outMax, easing) {
    if (outMax === undefined)
        outMax = 1;
    if (outMin === undefined)
        outMin = 0;
    if (inMin === inMax)
        return outMax;
    //eslint-disable-next-line functional/no-let
    var a = (v - inMin) / (inMax - inMin);
    if (easing !== undefined)
        a = easing(a);
    return a * (outMax - outMin) + outMin;
};
exports.scale = scale;
/**
 * As {@link scale}, but result is clamped to be
 * within `outMin` and `outMax`.
 * @param v
 * @param inMin
 * @param inMax
 * @param outMin
 * @param outMax
 * @param easing
 * @returns
 */
var scaleClamped = function (v, inMin, inMax, outMin, outMax, easing) {
    if (outMax === undefined)
        outMax = 1;
    if (outMin === undefined)
        outMin = 0;
    if (inMin === inMax)
        return outMax;
    var x = (0, exports.scale)(v, inMin, inMax, outMin, outMax, easing);
    return (0, Clamp_js_1.clamp)(x, outMin, outMax);
};
exports.scaleClamped = scaleClamped;
/**
 * Scales an input percentage to a new percentage range.
 *
 * If you have an input percentage (0-1), `scalePercentageOutput` maps it to an
 * _output_ percentage of `outMin`-`outMax`.
 *
 * ```js
 * import { scalePercentages } from 'https://unpkg.com/ixfx/dist/data.js';
 *
 * // Scales 50% to a range of 0-10%
 * scalePercentages(0.5, 0, 0.10); // 0.05 - 5%
 * ```
 *
 * An error is thrown if any parameter is outside of percentage range. This added
 * safety is useful for catching bugs. Otherwise, you could just as well call
 * `scale(percentage, 0, 1, outMin, outMax)`.
 *
 * If you want to scale some input range to percentage output range, just use `scale`:
 * ```js
 * import { scale } from 'https://unpkg.com/ixfx/dist/data.js';
 *
 * // Yields 0.5
 * scale(2.5, 0, 5);
 * ```
 * @param percentage Input value, within percentage range
 * @param outMin Output minimum, between 0-1
 * @param outMax Output maximum, between 0-1
 * @returns Scaled value between outMin-outMax.
 */
var scalePercentages = function (percentage, outMin, outMax) {
    if (outMax === void 0) { outMax = 1; }
    (0, Guards_js_1.number)(percentage, "percentage", "v");
    (0, Guards_js_1.number)(outMin, "percentage", "outMin");
    (0, Guards_js_1.number)(outMax, "percentage", "outMax");
    return (0, exports.scale)(percentage, 0, 1, outMin, outMax);
};
exports.scalePercentages = scalePercentages;
/**
 * Scales an input percentage value to an output range
 * If you have an input percentage (0-1), `scalePercent` maps it to an output range of `outMin`-`outMax`.
 * ```js
 * import { scalePercent } from 'https://unpkg.com/ixfx/dist/data.js';
 * scalePercent(0.5, 10, 20); // 15
 * ```
 *
 * @param v Value to scale
 * @param outMin Minimum for output
 * @param outMax Maximum for output
 * @returns
 */
var scalePercent = function (v, outMin, outMax) {
    (0, Guards_js_1.number)(v, "percentage", "v");
    return (0, exports.scale)(v, 0, 1, outMin, outMax);
};
exports.scalePercent = scalePercent;
//# sourceMappingURL=Scale.js.map