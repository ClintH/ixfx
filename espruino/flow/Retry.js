"use strict";
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
exports.__esModule = true;
exports.retry = void 0;
var Guards_js_1 = require("../Guards.js");
var Sleep_js_1 = require("./Sleep.js");
/**
 * Keeps executing `calback` until it runs without an exception being thrown.
 *
 * ```
 * // Retry up to five times, starting at 200ms delay
 * await retry(async () => {
 *  // Do something, sometimes throwing an error
 * }, 5, 200);
 * ```
 *
 * Each loop will run at twice the duration of the last, beginning at `startingTimeoutMs`.
 *
 * @param callback Async code to run
 * @param attempts Number of times to try
 * @param startingTimeoutMs Time to sleep for first iteration
 * @param cancelToken If provided, this is checked before and after each sleep to see if retry should continue. If cancelled, promise will be rejected
 * @returns
 */
var retry = function (callback, attempts, startingTimeoutMs, cancelToken) {
    if (attempts === void 0) { attempts = 5; }
    if (startingTimeoutMs === void 0) { startingTimeoutMs = 200; }
    return __awaiter(void 0, void 0, void 0, function () {
        var timeout, totalSlept, ex_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    (0, Guards_js_1.integer)(attempts, "positive", "attempts");
                    (0, Guards_js_1.integer)(startingTimeoutMs, "positive", "startingTimeoutMs");
                    timeout = startingTimeoutMs;
                    totalSlept = 0;
                    _a.label = 1;
                case 1:
                    if (!(attempts > 0)) return [3 /*break*/, 7];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, callback()];
                case 3: return [2 /*return*/, _a.sent()];
                case 4:
                    ex_1 = _a.sent();
                    attempts--;
                    return [3 /*break*/, 5];
                case 5:
                    totalSlept += timeout;
                    if (cancelToken && cancelToken.cancel)
                        throw new Error("Cancelled");
                    return [4 /*yield*/, (0, Sleep_js_1.sleep)(timeout)];
                case 6:
                    _a.sent();
                    if (cancelToken && cancelToken.cancel)
                        throw new Error("Cancelled");
                    timeout *= 2;
                    return [3 /*break*/, 1];
                case 7: throw new Error("Retry failed after ".concat(attempts, " attempts over ").concat(totalSlept, " ms."));
            }
        });
    });
};
exports.retry = retry;
//# sourceMappingURL=Retry.js.map