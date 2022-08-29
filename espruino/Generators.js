"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.numericPercent = exports.count = exports.numericRange = exports.numericRangeRaw = exports.delayLoop = exports.interval = exports.Sync = exports.Async = exports.pingPongPercent = exports.pingPong = void 0;
var Guards_js_1 = require("./Guards.js");
var PingPong_js_1 = require("./modulation/PingPong.js");
__createBinding(exports, PingPong_js_1, "pingPong");
__createBinding(exports, PingPong_js_1, "pingPongPercent");
exports.Async = __importStar(require("./IterableAsync.js"));
exports.Sync = __importStar(require("./IterableSync.js"));
var Interval_js_1 = require("./flow/Interval.js");
__createBinding(exports, Interval_js_1, "interval");
var Delay_js_1 = require("./flow/Delay.js");
__createBinding(exports, Delay_js_1, "delayLoop");
/**
 * Generates a range of numbers, starting from `start` and counting by `interval`.
 * If `end` is provided, generator stops when reached.
 *
 * Unlike {@link numericRange}, numbers might contain rounding errors
 *
 * ```js
 * for (const c of numericRangeRaw(10, 100)) {
 *  // 100, 110, 120 ...
 * }
 * ```
 * @param interval Interval between numbers
 * @param start Start
 * @param end End (if undefined, range never ends)
 */
var numericRangeRaw = function (interval, start, end, repeating) {
    var v;
    if (start === void 0) { start = 0; }
    if (repeating === void 0) { repeating = false; }
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (interval <= 0)
                    throw new Error("Interval is expected to be above zero");
                if (end === undefined)
                    end = Number.MAX_SAFE_INTEGER;
                v = start;
                _a.label = 1;
            case 1:
                if (!(v < end)) return [3 /*break*/, 3];
                return [4 /*yield*/, v];
            case 2:
                _a.sent();
                v += interval;
                return [3 /*break*/, 1];
            case 3:
                if (repeating) return [3 /*break*/, 1];
                _a.label = 4;
            case 4: return [2 /*return*/];
        }
    });
};
exports.numericRangeRaw = numericRangeRaw;
/**
 * Generates a range of numbers, with a given interval.
 *
 * @example For-loop
 * ```
 * let loopForever = numericRange(0.1); // By default starts at 0 and counts upwards forever
 * for (v of loopForever) {
 *  console.log(v);
 * }
 * ```
 *
 * @example If you want more control over when/where incrementing happens...
 * ```js
 * let percent = numericRange(0.1, 0, 1);
 *
 * let percentResult = percent.next().value;
 * ```
 *
 * Note that computations are internally rounded to avoid floating point math issues. So if the `interval` is very small (eg thousandths), specify a higher rounding
 * number.
 *
 * @param interval Interval between numbers
 * @param start Start. Defaults to 0
 * @param end End (if undefined, range never ends)
 * @param repeating Range loops from start indefinately. Default _false_
 * @param rounding A rounding that matches the interval avoids floating-point math hikinks. Eg if the interval is 0.1, use a rounding of 10
 */
var numericRange = function (interval, start, end, repeating, rounding) {
    var negativeInterval, v;
    if (start === void 0) { start = 0; }
    if (repeating === void 0) { repeating = false; }
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                (0, Guards_js_1.number)(interval, "nonZero");
                negativeInterval = interval < 0;
                if (end === undefined) {
                    /* no op */
                }
                else {
                    if (negativeInterval && start < end)
                        throw new Error("Interval of ".concat(interval, " will never go from ").concat(start, " to ").concat(end));
                    if (!negativeInterval && start > end)
                        throw new Error("Interval of ".concat(interval, " will never go from ").concat(start, " to ").concat(end));
                }
                rounding = rounding !== null && rounding !== void 0 ? rounding : 1000;
                if (end === undefined)
                    end = Number.MAX_SAFE_INTEGER;
                else
                    end *= rounding;
                interval = interval * rounding;
                _a.label = 1;
            case 1:
                v = start * rounding;
                _a.label = 2;
            case 2:
                if (!((!negativeInterval && v <= end) || (negativeInterval && v >= end))) return [3 /*break*/, 4];
                return [4 /*yield*/, v / rounding];
            case 3:
                _a.sent();
                v += interval;
                return [3 /*break*/, 2];
            case 4:
                if (repeating) return [3 /*break*/, 1];
                _a.label = 5;
            case 5: return [2 /*return*/];
        }
    });
};
exports.numericRange = numericRange;
/**
 * Yields `amount` integers, counting by one from zero. If a negative amount is used,
 * count decreases. If `offset` is provided, this is added to the return result.
 * @example
 * ```js
 * const a = [...count(5)]; // Yields five numbers: [0,1,2,3,4]
 * const b = [...count(-5)]; // Yields five numbers: [0,-1,-2,-3,-4]
 * for (const v of count(5, 5)) {
 *  // Yields: 5, 6, 7, 8, 9
 * }
 * const c = [...count(5,1)]; // Yields [1,2,3,4,5]
 * ```
 *
 * @example Used with forEach
 * ```js
 * // Prints `Hi` 5x
 * forEach(count(5), () => console.log(`Hi`));
 * ```
 *
 * If you want to accumulate return values, consider using
 * {@link Flow.repeat}.
 * @param amount Number of integers to yield
 * @param offset Added to result
 */
var count = function (amount, offset) {
    var i;
    if (offset === void 0) { offset = 0; }
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                // Unit tested.
                (0, Guards_js_1.integer)(amount, "", "amount");
                (0, Guards_js_1.integer)(offset, "", "offset");
                if (amount === 0)
                    return [2 /*return*/];
                i = 0;
                _a.label = 1;
            case 1:
                if (!(amount < 0)) return [3 /*break*/, 3];
                return [4 /*yield*/, -i + offset];
            case 2:
                _a.sent();
                return [3 /*break*/, 5];
            case 3: return [4 /*yield*/, i + offset];
            case 4:
                _a.sent();
                _a.label = 5;
            case 5:
                if (i++ < Math.abs(amount) - 1) return [3 /*break*/, 1];
                _a.label = 6;
            case 6: return [2 /*return*/];
        }
    });
};
exports.count = count;
/**
 * Returns a number range between 0.0-1.0.
 *
 * ```
 * // Yields: [0, 0.2, 0.4, 0.6, 0.8, 1]
 * const a = [...numericPercent(0.2)];
 *
 * // Repeating flag set to true:
 * for (const v of numericPercent(0.2, true)) {
 *  // Infinite loop. V loops back to 0 after hitting 1
 * }
 * ```
 *
 * If `repeating` is true, it loops back to 0 after reaching 1
 * @param interval Interval (default: 0.01, ie. 1%)
 * @param repeating Whether generator should loop (default: false)
 * @param start Start (default: 0)
 * @param end End (default: 1)
 * @returns
 */
var numericPercent = function (interval, repeating, start, end) {
    if (interval === void 0) { interval = 0.01; }
    if (repeating === void 0) { repeating = false; }
    if (start === void 0) { start = 0; }
    if (end === void 0) { end = 1; }
    (0, Guards_js_1.number)(interval, "percentage", "interval");
    (0, Guards_js_1.number)(start, "percentage", "start");
    (0, Guards_js_1.number)(end, "percentage", "end");
    return (0, exports.numericRange)(interval, start, end, repeating);
};
exports.numericPercent = numericPercent;
//# sourceMappingURL=Generators.js.map