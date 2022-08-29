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
exports.filter = exports.tracker = exports.isValid = exports.total = exports.max = exports.min = exports.averageWeighted = exports.average = void 0;
var NumericArrays = __importStar(require("./collections/NumericArrays.js"));
var NumberTracker_js_1 = require("./data/NumberTracker.js");
/**
 * Calculates the average of all numbers in an array.
 * Array items which aren't a valid number are ignored and do not factor into averaging.

 * @example
 * ```
 * import * as Numbers from 'https://unpkg.com/ixfx/dist/numbers.js';
 *
 * // Average of a list
 * const avg = Numbers.average(1, 1.4, 0.9, 0.1);
 *
 * // Average of a variable
 * let data = [100,200];
 * Numbers.average(...data);
 * ```
 *
 * See also: [Arrays.average](Collections.Arrays.average.html) which takes an array.
 * @param data Data to average.
 * @returns Average of array
 */
var average = function () {
    var numbers = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        numbers[_i] = arguments[_i];
    }
    return NumericArrays.average(numbers);
};
exports.average = average;
/**
 * See [Arrays.averageWeighted](Collections.Arrays.averageWeighted.html)
 * @param weightings
 * @param numbers
 * @returns
 */
var averageWeighted = function (weightings) {
    var numbers = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        numbers[_i - 1] = arguments[_i];
    }
    return NumericArrays.averageWeighted(numbers, weightings);
};
exports.averageWeighted = averageWeighted;
/**
 * Returns the minimum number out of `data`.
 * Undefined and non-numbers are silently ignored.
 *
 * ```js
 * import * as Numbers from 'https://unpkg.com/ixfx/dist/numbers.js';
 * Numbers.min(10, 20, 0); // Yields 0
 * ```
 * @param data
 * @returns Minimum number
 */
var min = function () {
    var data = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        data[_i] = arguments[_i];
    }
    return NumericArrays.min(data);
};
exports.min = min;
/**
 * Returns the maximum number out of `data`.
 * Undefined and non-numbers are silently ignored.
 *
 * ```js
 * import * as Numbers from 'https://unpkg.com/ixfx/dist/numbers.js';
 * Numbers.max(10, 20, 0); // Yields 20
 * ```
 * @param data
 * @returns Maximum number
 */
var max = function () {
    var data = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        data[_i] = arguments[_i];
    }
    return NumericArrays.max(data);
};
exports.max = max;
/**
 * Returns the total of `data`.
 * Undefined and non-numbers are silently ignored.
 *
 * ```js
 * import * as Numbers from 'https://unpkg.com/ixfx/dist/numbers.js';
 * Numbers.total(10, 20, 0); // Yields 30
 * ```
 * @param data
 * @returns Total
 */
var total = function () {
    var data = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        data[_i] = arguments[_i];
    }
    return NumericArrays.total(data);
};
exports.total = total;
/**
 * Returns true if `possibleNumber` is a number and not NaN
 * @param possibleNumber
 * @returns
 */
var isValid = function (possibleNumber) {
    if (typeof possibleNumber !== "number")
        return false;
    if (Number.isNaN(possibleNumber))
        return false;
    return true;
};
exports.isValid = isValid;
/**
 * Alias for [Data.numberTracker](Data.numberTracker.html)
 */
var tracker = function (id, opts) { return (0, NumberTracker_js_1.numberTracker)(id, opts); };
exports.tracker = tracker;
/**
 * Filters an iterator of values, only yielding
 * those that are valid numbers
 *
 * ```js
 * import * as Numbers from 'https://unpkg.com/ixfx/dist/numbers.js';
 *
 * const data = [true, 10, '5', { x: 5 }];
 * for (const n of Numbers.filter(data)) {
 *  // 5
 * }
 * ```
 * @param it
 */
//eslint-disable-next-line func-style
function filter(it) {
    var _i, it_1, v;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _i = 0, it_1 = it;
                _a.label = 1;
            case 1:
                if (!(_i < it_1.length)) return [3 /*break*/, 4];
                v = it_1[_i];
                if (!(0, exports.isValid)(v)) return [3 /*break*/, 3];
                return [4 /*yield*/, v];
            case 2:
                _a.sent();
                _a.label = 3;
            case 3:
                _i++;
                return [3 /*break*/, 1];
            case 4: return [2 /*return*/];
        }
    });
}
exports.filter = filter;
//# sourceMappingURL=Numbers.js.map