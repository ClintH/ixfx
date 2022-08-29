"use strict";
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.pingPong = exports.pingPongPercent = void 0;
var Guards_js_1 = require("../Guards.js");
/**
 * Continually loops up and down between 0 and 1 by a specified interval.
 * Looping returns start value, and is inclusive of 0 and 1.
 *
 * @example Usage
 * ```js
 * import {percentPingPong} from 'https://unpkg.com/ixfx/dist/modulation.js';
 * for (const v of percentPingPong(0.1)) {
 *  // v will go up and down. Make sure you have a break somewhere because it is infinite
 * }
 * ```
 *
 * @example Alternative:
 * ```js
 * const pp = pingPongPercent(0.1, 0.5); // Setup generator one time
 * const v = pp.next().value; // Call .next().value whenever a new value is needed
 * ```
 *
 * Because limits are capped to -1 to 1, using large intervals can produce uneven distribution. Eg an interval of 0.8 yields 0, 0.8, 1
 *
 * `upper` and `lower` define the percentage range. Eg to ping pong between 40-60%:
 * ```
 * const pp = pingPongPercent(0.1, 0.4, 0.6);
 * ```
 * @param interval Amount to increment by. Defaults to 10%
 * @param start Starting point within range. Defaults to 0 using a positive interval or 1 for negative intervals
 * @param rounding Rounding to apply. This avoids floating-point rounding errors.
 */
var pingPongPercent = function (interval, lower, upper, start, rounding) {
    if (interval === void 0) { interval = 0.1; }
    if (lower === undefined)
        lower = 0;
    if (upper === undefined)
        upper = 1;
    if (start === undefined)
        start = lower;
    (0, Guards_js_1.number)(interval, "bipolar", "interval");
    (0, Guards_js_1.number)(upper, "bipolar", "end");
    (0, Guards_js_1.number)(start, "bipolar", "offset");
    (0, Guards_js_1.number)(lower, "bipolar", "start");
    return (0, exports.pingPong)(interval, lower, upper, start, rounding);
};
exports.pingPongPercent = pingPongPercent;
/**
 * Ping-pongs continually back and forth `start` and `end` with a given `interval`. Use `pingPongPercent` for 0-1 ping-ponging
 *
 * In a loop:
 * ```
 * for (const c of pingPong(10, 0, 100)) {
 *  // 0, 10, 20 .. 100, 90, 80, 70 ...
 * }
 * ```
 *
 * Manual:
 * ```
 * const pp = pingPong(10, 0, 100);
 * let v = pp.next().value; // Call .next().value whenever a new value is needed
 * ```
 * @param interval Amount to increment by. Use negative numbers to start counting down
 * @param lower Lower bound (inclusive)
 * @param upper Upper bound (inclusive, must be greater than start)
 * @param start Starting point within bounds (defaults to `lower`)
 * @param rounding Rounding is off by default. Use say 1000 if interval is a fractional amount to avoid rounding errors.
 */
var pingPong = function (interval, lower, upper, start, rounding) {
    var distance, incrementing, v, firstLoop;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (lower === undefined)
                    throw new Error("Parameter 'lower' is undefined");
                if (interval === undefined)
                    throw new Error("Parameter 'interval' is undefined");
                if (upper === undefined)
                    throw new Error("Parameter 'upper' is undefined");
                if (rounding === undefined && (interval <= 1 && interval >= 0))
                    rounding = 10 / interval;
                else if (rounding === undefined)
                    rounding = 1234;
                if (Number.isNaN(interval))
                    throw new Error("interval parameter is NaN");
                if (Number.isNaN(lower))
                    throw new Error("lower parameter is NaN");
                if (Number.isNaN(upper))
                    throw new Error("upper parameter is NaN");
                if (Number.isNaN(start))
                    throw new Error("upper parameter is NaN");
                if (lower >= upper)
                    throw new Error("lower must be less than upper");
                if (interval === 0)
                    throw new Error("Interval cannot be zero");
                distance = upper - lower;
                if (Math.abs(interval) >= distance)
                    throw new Error("Interval should be between -".concat(distance, " and ").concat(distance));
                incrementing = interval > 0;
                // Scale up values by rounding factor
                upper = Math.floor(upper * rounding);
                lower = Math.floor(lower * rounding);
                interval = Math.floor(Math.abs(interval * rounding));
                if (interval === 0)
                    throw new Error("Interval is zero (rounding: ".concat(rounding, ")"));
                if (start === undefined)
                    start = lower;
                else
                    start = Math.floor(start * rounding);
                if (start > upper || start < lower)
                    throw new Error("Start (".concat(start / rounding, ") must be within lower (").concat(lower / rounding, ") and upper (").concat(upper / rounding, ")"));
                v = start;
                return [4 /*yield*/, v / rounding];
            case 1:
                _a.sent();
                firstLoop = true;
                _a.label = 2;
            case 2:
                if (!true) return [3 /*break*/, 4];
                //console.log(`v: ${v} incrementing: ${incrementing} interval: ${interval}`);
                v = v + (incrementing ? interval : -interval);
                if (incrementing && v >= upper) {
                    incrementing = false;
                    v = upper;
                    if (v === upper && firstLoop) {
                        // Edge case where we start at upper bound and increment
                        v = lower;
                        incrementing = true;
                    }
                }
                else if (!incrementing && v <= lower) {
                    incrementing = true;
                    v = lower;
                    if (v === lower && firstLoop) {
                        // Edge case where we start at lower bound and decrement
                        v = upper;
                        incrementing = false;
                    }
                }
                return [4 /*yield*/, v / rounding];
            case 3:
                _a.sent();
                firstLoop = false;
                return [3 /*break*/, 2];
            case 4: return [2 /*return*/];
        }
    });
};
exports.pingPong = pingPong;
//# sourceMappingURL=PingPong.js.map