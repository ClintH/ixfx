"use strict";
exports.__esModule = true;
exports.movingAverage = exports.movingAverageTimed = exports.movingAverageLight = void 0;
var index_js_1 = require("../collections/index.js");
var Guards_js_1 = require("../Guards.js");
/**
 * A moving average calculator (exponential weighted moving average) which does not keep track of
 * previous samples. Less accurate, but uses less system resources.
 *
 * The `scaling` parameter determines smoothing. A value of `1` means that
 * the latest value is used as the average - that is, no smoothing. Higher numbers
 * introduce progressively more smoothing by weighting the accumulated prior average more heavily.
 *
 * `add()` adds a new value and returns the calculated average.
 *
 * ```
 * const ma = movingAverageLight(); // default scaling of 3
 * ma.add(50);  // 50
 * ma.add(100); // 75
 * ma.add(75);  // 75
 * ma.add(0);   // 50
 * ```
 *
 * Note that the final average of 50 is pretty far from the last value of 0. To make it more responsive,
 * we could use a lower scaling factor: `movingAverageLight(2)`. This yields a final average of `37.5` instead.
 *
 * Use `clear()` to reset the moving average, or `compute()` to get the current value without adding.
 * @param scaling Scaling factor. 1 is no smoothing. Default: 3
 * @returns {@link MovingAverage}
 */
var movingAverageLight = function (scaling) {
    if (scaling === void 0) { scaling = 3; }
    (0, Guards_js_1.integer)(scaling, "aboveZero", "scaling");
    //eslint-disable-next-line functional/no-let
    var average = 0;
    //eslint-disable-next-line functional/no-let
    var count = 0;
    //eslint-disable-next-line functional/no-let
    var disposed = false;
    var ma = {
        dispose: function () {
            disposed = true;
        },
        get isDisposed() {
            return disposed;
        },
        add: function (v) {
            if (disposed)
                throw new Error("MovingAverage disposed, cannot add");
            count++;
            average = average + (v - average) / Math.min(count, scaling);
            return average;
        },
        clear: function () {
            if (disposed)
                throw new Error("MovingAverage disposed, cannot clear");
            average = 0;
            count = 0;
        },
        compute: function () {
            return average;
        }
    };
    return ma;
};
exports.movingAverageLight = movingAverageLight;
/**
 * Uses the same algorithm as {@link movingAverageLight}, but adds values automatically if
 * nothing has been manually added.
 *
 * This is useful if you are averaging something based on events. For example calculating the
 * average speed of the pointer. If there is no speed, there is no pointer move event. Using
 * this function, `value` is added at a rate of `updateRateMs`. This timer is reset
 * every time a value is added, a bit like the `debounce` function.
 * @param updateRateMs
 * @param value
 * @param scaling
 * @returns
 */
var movingAverageTimed = function (updateRateMs, value, scaling) {
    if (updateRateMs === void 0) { updateRateMs = 200; }
    if (value === void 0) { value = 0; }
    if (scaling === void 0) { scaling = 3; }
    (0, Guards_js_1.integer)(scaling, "aboveZero", "scaling");
    (0, Guards_js_1.integer)(updateRateMs, "aboveZero", "decayRateMs");
    var mal = (0, exports.movingAverageLight)(scaling);
    //eslint-disable-next-line functional/no-let
    var timer = 0;
    var reschedule = function () {
        if (timer !== 0)
            clearTimeout(timer);
        // @ts-ignore
        timer = setTimeout(decay, updateRateMs);
    };
    var decay = function () {
        mal.add(value);
        if (!mal.isDisposed)
            setTimeout(decay, updateRateMs);
    };
    var ma = {
        add: function (v) {
            reschedule();
            return mal.add(v);
        },
        dispose: function () {
            mal.dispose();
        },
        clear: function () {
            mal.clear();
        },
        compute: function () {
            return mal.compute();
        },
        isDisposed: false
    };
    return ma;
};
exports.movingAverageTimed = movingAverageTimed;
/**
 * Creates a moving average for a set number of `samples`.
 *
 * Moving average are useful for computing the average over a recent set of numbers.
 * A lower number of samples produces a computed value that is lower-latency yet more jittery.
 * A higher number of samples produces a smoother computed value which takes longer to respond to
 * changes in data.
 *
 * Sample size is considered with respect to the level of latency/smoothness trade-off, and also
 * the rate at which new data is added to the moving average.
 *
* `add` adds a number and returns the computed average. Call `compute` to
 * get the average without adding a new value.
 *
 * ```js
 * import { movingAverage } from 'https://unpkg.com/ixfx/dist/data.js';
 *
 * const ma = movingAverage(10);
 * ma.add(10); // 10
 * ma.add(5);  // 7.5
 * ```
 *
 * `clear` clears the average.
 *
 * A weighting function can be provided to shape how the average is
 * calculated - eg privileging the most recent data over older data.
 * It uses `Arrays.averageWeighted` under the hood.
 *
 * ```js
 * import { movingAverage } from 'https://unpkg.com/ixfx/dist/data.js';
 *
 * // Give more weight to data in middle of sampling window
 * const ma = movingAverage(100, Easings.gaussian());
 * ```
 *
 * Because it keeps track of `samples` previous data, there is a memory impact. A lighter version is {@link movingAverageLight} which does not keep a buffer of prior data, but can't be as easily fine-tuned.
 * @param samples Number of samples to compute average from
 * @param weightingFn Optional weighting function
 * @returns
 */
var movingAverage = function (samples, weightingFn) {
    if (samples === void 0) { samples = 100; }
    //eslint-disable-next-line functional/no-let
    var disposed = false;
    //eslint-disable-next-line functional/no-let
    var q = (0, index_js_1.queueMutable)({
        capacity: samples,
        discardPolicy: "older"
    });
    var clear = function () {
        q = (0, index_js_1.queueMutable)({
            capacity: samples,
            discardPolicy: "older"
        });
    };
    var compute = function () {
        if (weightingFn === undefined) {
            return index_js_1.Arrays.average(q.data);
        }
        else {
            return index_js_1.Arrays.averageWeighted(q.data, weightingFn);
        }
    };
    var add = function (v) {
        q.enqueue(v);
        return compute();
    };
    var dispose = function () {
        disposed = true;
    };
    return { add: add, compute: compute, clear: clear, dispose: dispose, isDisposed: disposed };
};
exports.movingAverage = movingAverage;
//# sourceMappingURL=MovingAverage.js.map