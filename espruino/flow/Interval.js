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
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncGenerator = (this && this.__asyncGenerator) || function (thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
    function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
};
exports.__esModule = true;
exports.interval = void 0;
var Sleep_js_1 = require("./Sleep.js");
/**
 * Generates values from `produce` with `intervalMs` time delay.
 * `produce` can be a simple function that returns a value, an async function, or a generator.
 *
 * @example Produce a random number every 500ms:
 * ```
 * const randomGenerator = interval(() => Math.random(), 1000);
 * for await (const r of randomGenerator) {
 *  // Random value every 1 second
 *  // Warning: does not end by itself, a `break` statement is needed
 * }
 * ```
 *
 * @example Return values from a generator every 500ms:
 * ```js
 * // Make a generator that counts to 10
 * const counter = count(10);
 * for await (const v of interval(counter, 1000)) {
 *  // Do something with `v`
 * }
 * ```
 *
 * If you just want to loop at a certain speed, consider using {@link continuously} instead.
 * @template V Returns value of `produce` function
 * @param intervalMs Interval between execution
 * @param produce Function to call
 * @template V Data type
 * @returns
 */
var interval = function (produce, intervalMs) {
    return __asyncGenerator(this, arguments, function () {
        var cancelled, result, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    cancelled = false;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, , 20, 21]);
                    _a.label = 2;
                case 2:
                    if (!!cancelled) return [3 /*break*/, 19];
                    return [4 /*yield*/, __await((0, Sleep_js_1.sleep)(intervalMs))];
                case 3:
                    _a.sent();
                    if (!cancelled) return [3 /*break*/, 5];
                    return [4 /*yield*/, __await(void 0)];
                case 4: return [2 /*return*/, _a.sent()];
                case 5:
                    if (!(typeof produce === "function")) return [3 /*break*/, 9];
                    return [4 /*yield*/, __await(produce())];
                case 6:
                    result = _a.sent();
                    return [4 /*yield*/, __await(result)];
                case 7: return [4 /*yield*/, _a.sent()];
                case 8:
                    _a.sent();
                    return [3 /*break*/, 18];
                case 9:
                    if (!(typeof produce === "object")) return [3 /*break*/, 17];
                    if (!("next" in produce && "return" in produce && "throw" in produce)) return [3 /*break*/, 15];
                    return [4 /*yield*/, __await(produce.next())];
                case 10:
                    result = _a.sent();
                    if (!result.done) return [3 /*break*/, 12];
                    return [4 /*yield*/, __await(void 0)];
                case 11: return [2 /*return*/, _a.sent()];
                case 12: return [4 /*yield*/, __await(result.value)];
                case 13: return [4 /*yield*/, _a.sent()];
                case 14:
                    _a.sent();
                    return [3 /*break*/, 16];
                case 15: throw new Error("interval: produce param does not seem to be a generator?");
                case 16: return [3 /*break*/, 18];
                case 17: throw new Error("produce param does not seem to return a value/Promise and is not a generator?");
                case 18: return [3 /*break*/, 2];
                case 19: return [3 /*break*/, 21];
                case 20:
                    cancelled = true;
                    return [7 /*endfinally*/];
                case 21: return [2 /*return*/];
            }
        });
    });
};
exports.interval = interval;
//# sourceMappingURL=Interval.js.map