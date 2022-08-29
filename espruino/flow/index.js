"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
exports.__esModule = true;
exports.repeat = exports.forEachAsync = exports.forEach = exports.StateMachine = void 0;
var Guards_js_1 = require("../Guards.js");
var Sleep_js_1 = require("./Sleep.js");
var StateMachine = __importStar(require("./StateMachine.js"));
exports.StateMachine = StateMachine;
var Timer = __importStar(require("./Timer.js"));
__exportStar(require("./Timer.js"), exports);
__exportStar(require("./Interval.js"), exports);
__exportStar(require("./Timeout.js"), exports);
__exportStar(require("./UpdateOutdated.js"), exports);
__exportStar(require("./Continuously.js"), exports);
__exportStar(require("./Debounce.js"), exports);
__exportStar(require("./Throttle.js"), exports);
__exportStar(require("./Sleep.js"), exports);
__exportStar(require("./WaitFor.js"), exports);
__exportStar(require("./Delay.js"), exports);
/**
 * Iterates over `iterator` (iterable/array), calling `fn` for each value.
 * If `fn` returns _false_, iterator cancels.
 *
 * Over the default JS `forEach` function, this one allows you to exit the
 * iteration early.
 *
 * @example
 * ```js
 * forEach(count(5), () => console.log(`Hi`));  // Prints `Hi` 5x
 * forEach(count(5), i => console.log(i));      // Prints 0 1 2 3 4
 * forEach([0,1,2,3,4], i => console.log(i));   // Prints 0 1 2 3 4
 * ```
 *
 * Use {@link forEachAsync} if you want to use an async `iterator` and async `fn`.
 * @param iterator Iterable or array
 * @typeParam V Type of iterable
 * @param fn Function to call for each item. If function returns _false_, iteration cancels
 */
var forEach = function (iterator, fn) {
    for (var _i = 0, iterator_1 = iterator; _i < iterator_1.length; _i++) {
        var x = iterator_1[_i];
        var r = fn(x);
        if (typeof r === "boolean" && !r)
            break;
    }
};
exports.forEach = forEach;
/**
 * Iterates over an async iterable or array, calling `fn` for each value, with optional
 * interval between each loop. If the async `fn` returns _false_, iterator cancels.
 *
 * Use {@link forEach} for a synchronous version.
 *
 * ```
 * // Prints items from array every second
 * await forEachAsync([0,1,2,3], i => console.log(i), 1000);
 * ```
 *
 * @example Retry `doSomething` up to five times, with 5 seconds between each attempt
 * ```
 * await forEachAsync(count(5), i=> {
 *  try {
 *    await doSomething();
 *    return false; // Succeeded, exit early
 *  } catch (ex) {
 *    console.log(ex);
 *    return true; // Keep trying
 *  }
 * }, 5000);
 * ```
 * @param iterator Iterable thing to loop over
 * @param fn Function to invoke on each item. If it returns _false_ loop ends.
 * @typeParam V Type of iterable
 */
var forEachAsync = function (iterator, fn, intervalMs) {
    var iterator_2, iterator_2_1;
    var e_1, _a;
    return __awaiter(this, void 0, void 0, function () {
        var _i, iterator_3, x, r, x, r, e_1_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!Array.isArray(iterator)) return [3 /*break*/, 7];
                    _i = 0, iterator_3 = iterator;
                    _b.label = 1;
                case 1:
                    if (!(_i < iterator_3.length)) return [3 /*break*/, 6];
                    x = iterator_3[_i];
                    return [4 /*yield*/, fn(x)];
                case 2:
                    r = _b.sent();
                    if (!intervalMs) return [3 /*break*/, 4];
                    return [4 /*yield*/, (0, Sleep_js_1.sleep)(intervalMs)];
                case 3:
                    _b.sent();
                    _b.label = 4;
                case 4:
                    if (typeof r === "boolean" && !r)
                        return [3 /*break*/, 6];
                    _b.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 1];
                case 6: return [3 /*break*/, 21];
                case 7:
                    _b.trys.push([7, 15, 16, 21]);
                    iterator_2 = __asyncValues(iterator);
                    _b.label = 8;
                case 8: return [4 /*yield*/, iterator_2.next()];
                case 9:
                    if (!(iterator_2_1 = _b.sent(), !iterator_2_1.done)) return [3 /*break*/, 14];
                    x = iterator_2_1.value;
                    return [4 /*yield*/, fn(x)];
                case 10:
                    r = _b.sent();
                    if (!intervalMs) return [3 /*break*/, 12];
                    return [4 /*yield*/, (0, Sleep_js_1.sleep)(intervalMs)];
                case 11:
                    _b.sent();
                    _b.label = 12;
                case 12:
                    if (typeof r === "boolean" && !r)
                        return [3 /*break*/, 14];
                    _b.label = 13;
                case 13: return [3 /*break*/, 8];
                case 14: return [3 /*break*/, 21];
                case 15:
                    e_1_1 = _b.sent();
                    e_1 = { error: e_1_1 };
                    return [3 /*break*/, 21];
                case 16:
                    _b.trys.push([16, , 19, 20]);
                    if (!(iterator_2_1 && !iterator_2_1.done && (_a = iterator_2["return"]))) return [3 /*break*/, 18];
                    return [4 /*yield*/, _a.call(iterator_2)];
                case 17:
                    _b.sent();
                    _b.label = 18;
                case 18: return [3 /*break*/, 20];
                case 19:
                    if (e_1) throw e_1.error;
                    return [7 /*endfinally*/];
                case 20: return [7 /*endfinally*/];
                case 21: return [2 /*return*/];
            }
        });
    });
};
exports.forEachAsync = forEachAsync;
/**
 * Runs `fn` a certain number of times, accumulating result into an array.
 * If `fn` returns undefined, the result is ignored.
 *
 * ```js
 * // Results will be an array with five random numbers
 * const results = repeat(5, () => Math.random());
 * ```
 *
 * Repeats can be specified as an integer (eg. 5 for five repeats), or a function
 * that gives _false_ when repeating should stop.
 *
 * ```js
 * // Keep running `fn` until we've accumulated 10 values
 * // Useful if `fn` sometimes returns _undefined_
 * const results = repeat((repeats, valuesProduced) => valuesProduced < 10, fn);
 * ```
 *
 * If you don't need to accumulate return values, consider {@link Generators.count | Generators.count} with {@link Flow.forEach | Flow.forEach}.
 *
 * @param countOrPredicate Number of repeats or function returning false when to stop
 * @param fn Function to run, must return a value to accumulate into array or _undefined_
 * @returns Array of accumulated results
 */
var repeat = function (countOrPredicate, fn) {
    // Unit tested: expected return array length
    //eslint-disable-next-line functional/no-let
    var repeats, valuesProduced;
    repeats = valuesProduced = 0;
    var ret = [];
    if (typeof countOrPredicate === "number") {
        (0, Guards_js_1.number)(countOrPredicate, "positive", "countOrPredicate");
        while (countOrPredicate-- > 0) {
            repeats++;
            var v = fn();
            if (v === undefined)
                continue;
            //eslint-disable-next-line functional/immutable-data
            ret.push(v);
            valuesProduced++;
        }
    }
    else {
        while (countOrPredicate(repeats, valuesProduced)) {
            repeats++;
            var v = fn();
            if (v === undefined)
                continue;
            //eslint-disable-next-line functional/immutable-data
            ret.push(v);
            valuesProduced++;
        }
    }
    return ret;
};
exports.repeat = repeat;
try {
    if (typeof window !== "undefined") {
        //eslint-disable-next-line functional/immutable-data,@typescript-eslint/no-explicit-any
        window.ixfx = __assign(__assign({}, window.ixfx), { Flow: { StateMachine: StateMachine, Timer: Timer, forEach: exports.forEach, forEachAsync: exports.forEachAsync, repeat: exports.repeat } });
    }
}
catch ( /* no-op */_a) { /* no-op */ }
//# sourceMappingURL=index.js.map