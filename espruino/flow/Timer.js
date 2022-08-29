"use strict";
exports.__esModule = true;
exports.ticksElapsedTimer = exports.msElapsedTimer = exports.frequencyTimer = exports.relativeTimer = exports.frequencyTimerSource = void 0;
var Clamp_js_1 = require("../data/Clamp.js");
var frequencyTimerSource = function (frequency) { return function () { return (0, exports.frequencyTimer)(frequency, (0, exports.msElapsedTimer)()); }; };
exports.frequencyTimerSource = frequencyTimerSource;
/**
 * Wraps a timer, returning a relative elapsed value.
 *
 * ```js
 * let t = relativeTimer(1000, msElapsedTimer());
 * ```
 *
 * @private
 * @param total
 * @param timer
 * @param clampValue If true, returned value never exceeds 1.0
 * @returns
 */
var relativeTimer = function (total, timer, clampValue) {
    if (clampValue === void 0) { clampValue = true; }
    //eslint-disable-next-line functional/no-let
    var done = false;
    //eslint-disable-next-line functional/no-let
    var modAmt = 1;
    return {
        mod: function (amt) {
            modAmt = amt;
        },
        get isDone() {
            return done;
        },
        reset: function () {
            done = false;
            timer.reset();
        },
        get elapsed() {
            //eslint-disable-next-line functional/no-let
            var v = timer.elapsed / (total * modAmt);
            if (clampValue)
                v = (0, Clamp_js_1.clamp)(v);
            if (v >= 1)
                done = true;
            return v;
        }
    };
};
exports.relativeTimer = relativeTimer;
var frequencyTimer = function (frequency, timer) {
    if (timer === void 0) { timer = (0, exports.msElapsedTimer)(); }
    var cyclesPerSecond = frequency / 1000;
    //eslint-disable-next-line functional/no-let
    var modAmt = 1;
    return {
        mod: function (amt) {
            modAmt = amt;
        },
        reset: function () {
            timer.reset();
        },
        get elapsed() {
            // Get position in a cycle
            var v = timer.elapsed * (cyclesPerSecond * modAmt);
            // Get fractional part
            var f = v - Math.floor(v);
            if (f < 0)
                throw new Error("Unexpected cycle fraction less than 0. Elapsed: ".concat(v, " f: ").concat(f));
            if (f > 1)
                throw new Error("Unexpected cycle fraction more than 1. Elapsed: ".concat(v, " f: ").concat(f));
            return f;
        }
    };
};
exports.frequencyTimer = frequencyTimer;
/**
 * A timer that uses clock time
 * @private
 * @returns {Timer}
 */
var msElapsedTimer = function () {
    // eslint-disable-next-line functional/no-let
    var start = performance.now();
    return {
        reset: function () {
            start = performance.now();
        },
        get elapsed() {
            return performance.now() - start;
        }
    };
};
exports.msElapsedTimer = msElapsedTimer;
/**
 * A timer that progresses with each call
 * @private
 * @returns {Timer}
 */
var ticksElapsedTimer = function () {
    // eslint-disable-next-line functional/no-let
    var start = 0;
    return {
        reset: function () {
            start = 0;
        },
        get elapsed() { return start++; }
    };
};
exports.ticksElapsedTimer = ticksElapsedTimer;
//# sourceMappingURL=Timer.js.map