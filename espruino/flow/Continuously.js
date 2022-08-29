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
exports.continuously = void 0;
var Guards_js_1 = require("../Guards.js");
var raf = typeof window !== "undefined" ? function (cb) { return window.requestAnimationFrame(cb); } : function (cb) { return setTimeout(cb, 1); };
/**
 * Returns a {@link Continuously} that continuously executes `callback`.
 * If callback returns _false_, loop exits.
 *
 * Call `start` to begin/reset loop. `cancel` stops loop.
 *
 * @example Animation loop
 * ```js
 * const draw = () => {
 *  // Draw on canvas
 * }
 *
 * // Run draw() synchronised with monitor refresh rate via `window.requestAnimationFrame`
 * continuously(draw).start();
 * ```
 *
 * @example With delay
 * ```js
 * const fn = () => {
 *  console.log(`1 minute`);
 * }
 * const c = continuously(fn, 60*1000);
 * c.start(); // Runs `fn` every minute
 * ```
 *
 * @example Control a 'continuously'
 * ```js
 * c.cancel();   // Stop the loop, cancelling any up-coming calls to `fn`
 * c.elapsedMs;  // How many milliseconds have elapsed since start
 * c.ticks;      // How many iterations of loop since start
 * ```
 *
 * Asynchronous callback functions are supported too:
 * ```js
 * continuously(async () => { ..});
 * ```
 *
 * The `callback` function can receive a few arguments:
 * ```js
 * continuously( (ticks, elapsedMs) => {
 *  // ticks: how many times loop has run
 *  // elapsedMs:  how long since last loop
 * }).start();
 * ```
 *
 * And if `callback` explicitly returns _false_, the loop will exit:
 * ```js
 * continuously((ticks) => {
 *  // Stop after 100 iterations
 *  if (ticks > 100) return false;
 * }).start();
 * ```
 * @param callback Function to run. If it returns false, loop exits.
 * @param resetCallback Callback when/if loop is reset. If it returns false, loop exits
 * @param intervalMs
 * @returns
 */
var continuously = function (callback, intervalMs, resetCallback) {
    if (intervalMs !== undefined)
        (0, Guards_js_1.integer)(intervalMs, "positive", "intervalMs");
    //eslint-disable-next-line functional/no-let
    var running = false;
    //eslint-disable-next-line functional/no-let
    var ticks = 0;
    //eslint-disable-next-line functional/no-let
    var startedAt = performance.now();
    //eslint-disable-next-line functional/no-let
    var iMs = (intervalMs === undefined) ? 0 : intervalMs;
    var schedule = (iMs === 0) ? raf : function (cb) { return setTimeout(cb, iMs); };
    var cancel = function () {
        if (!running)
            return;
        running = false;
        ticks = 0;
    };
    var loop = function () { return __awaiter(void 0, void 0, void 0, function () {
        var valOrPromise, val;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!running)
                        return [2 /*return*/];
                    valOrPromise = callback(ticks++, performance.now() - startedAt);
                    if (!(typeof valOrPromise === "object")) return [3 /*break*/, 2];
                    return [4 /*yield*/, valOrPromise];
                case 1:
                    val = _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    val = valOrPromise;
                    _a.label = 3;
                case 3:
                    if (val !== undefined && !val) {
                        cancel();
                        return [2 /*return*/];
                    }
                    schedule(loop);
                    return [2 /*return*/];
            }
        });
    }); };
    var start = function () {
        // Already running, but theres a resetCallback to check if we should keep going
        if (running && resetCallback !== undefined) {
            var r = resetCallback(ticks, performance.now() - startedAt);
            startedAt = performance.now();
            if (r !== undefined && !r) {
                // Reset callback tells us to stop
                cancel();
                return; // Skip starting again
            }
        }
        else if (running) {
            return; // already running
        }
        // Start running
        running = true;
        schedule(loop);
    };
    return {
        start: start,
        get intervalMs() {
            return iMs;
        },
        set intervalMs(ms) {
            (0, Guards_js_1.integer)(ms, "positive", "ms");
            iMs = ms;
        },
        get isDone() {
            return !running;
        },
        get ticks() {
            return ticks;
        },
        get elapsedMs() {
            return performance.now() - startedAt;
        },
        cancel: cancel
    };
};
exports.continuously = continuously;
//# sourceMappingURL=Continuously.js.map