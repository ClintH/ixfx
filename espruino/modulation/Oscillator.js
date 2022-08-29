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
exports.square = exports.saw = exports.triangle = exports.sineBipolar = exports.sine = exports.spring = void 0;
var Timers = __importStar(require("../flow/Timer.js"));
var piPi = Math.PI * 2;
var springRaw = function (opts, from, to) {
    var _a, _b, _c, _d, _e;
    if (opts === void 0) { opts = {}; }
    if (from === void 0) { from = 0; }
    if (to === void 0) { to = 1; }
    /** MIT License github.com/pushkine/ */
    var mass = (_a = opts.mass) !== null && _a !== void 0 ? _a : 1;
    var stiffness = (_b = opts.stiffness) !== null && _b !== void 0 ? _b : 100;
    var soft = (_c = opts.soft) !== null && _c !== void 0 ? _c : false;
    var damping = (_d = opts.damping) !== null && _d !== void 0 ? _d : 10;
    var velocity = (_e = opts.velocity) !== null && _e !== void 0 ? _e : 0.1;
    var delta = to - from;
    if (true === soft || 1.0 <= damping / (2.0 * Math.sqrt(stiffness * mass))) {
        var angularFrequency_1 = -Math.sqrt(stiffness / mass);
        var leftover_1 = -angularFrequency_1 * delta - velocity;
        return function (t) { return to - (delta + t * leftover_1) * Math.pow(Math.E, (t * angularFrequency_1)); };
    }
    else {
        var dampingFrequency = Math.sqrt(4.0 * mass * stiffness - Math.pow(damping, 2.0));
        var leftover_2 = (damping * delta - 2.0 * mass * velocity) / dampingFrequency;
        var dfm_1 = (0.5 * dampingFrequency) / mass;
        var dm_1 = -(0.5 * damping) / mass;
        return function (t) { return to - (Math.cos(t * dfm_1) * delta + Math.sin(t * dfm_1) * leftover_2) * Math.pow(Math.E, (t * dm_1)); };
    }
};
/**
 * Spring-style oscillation
 *
 * ```js
 * import { Oscillators } from "https://unpkg.com/ixfx/dist/modulation.js"
 * const spring = Oscillators.spring();
 *
 * continuously(() => {
 *  const v = spring.next().value;
 *  // Yields values 0...1
 *  //  undefined is yielded when spring is estimated to have stopped
 * });
 * ```
 *
 * Parameters to the spring can be provided.
 * ```js
 * const spring = Oscillators.spring({
 *  mass: 5,
 *  damping: 10
 *  stiffness: 100
 * });
 * ```
 * @param opts
 * @param timerOrFreq
 */
//eslint-disable-next-line func-style
function spring(opts, timerOrFreq) {
    var fn, doneCountdown, s;
    var _a;
    if (opts === void 0) { opts = {}; }
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                if (timerOrFreq === undefined)
                    timerOrFreq = Timers.msElapsedTimer();
                fn = springRaw(opts, 0, 1);
                doneCountdown = (_a = opts.countdown) !== null && _a !== void 0 ? _a : 10;
                _b.label = 1;
            case 1:
                if (!(doneCountdown > 0)) return [3 /*break*/, 3];
                s = fn(timerOrFreq.elapsed / 1000);
                return [4 /*yield*/, s];
            case 2:
                _b.sent();
                if (s === 1) {
                    doneCountdown--;
                }
                else {
                    doneCountdown = 100;
                }
                return [3 /*break*/, 1];
            case 3: return [2 /*return*/];
        }
    });
}
exports.spring = spring;
/**
 * Sine oscillator.
 *
 * ```js
 * import { Oscillators } from "https://unpkg.com/ixfx/dist/modulation.js"
 *
 * // Setup
 * const osc = Oscillators.sine(Timers.frequencyTimer(10));
 * const osc = Oscillators.sine(0.1);
 *
 * // Call whenever a value is needed
 * const v = osc.next().value;
 * ```
 *
 * @example Saw/tri pinch
 * ```js
 * const v = Math.pow(osc.value, 2);
 * ```
 *
 * @example Saw/tri bulge
 * ```js
 * const v = Math.pow(osc.value, 0.5);
 * ```
 *
 */
//eslint-disable-next-line func-style
function sine(timerOrFreq) {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (typeof timerOrFreq === "number")
                    timerOrFreq = Timers.frequencyTimer(timerOrFreq);
                _a.label = 1;
            case 1:
                if (!true) return [3 /*break*/, 3];
                // Rather than -1 to 1, we want 0 to 1
                return [4 /*yield*/, (Math.sin(timerOrFreq.elapsed * piPi) + 1) / 2];
            case 2:
                // Rather than -1 to 1, we want 0 to 1
                _a.sent();
                return [3 /*break*/, 1];
            case 3: return [2 /*return*/];
        }
    });
}
exports.sine = sine;
/**
 * Bipolar sine (-1 to 1)
 * @param timerOrFreq
 */
//eslint-disable-next-line func-style
function sineBipolar(timerOrFreq) {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (typeof timerOrFreq === "number")
                    timerOrFreq = Timers.frequencyTimer(timerOrFreq);
                _a.label = 1;
            case 1:
                if (!true) return [3 /*break*/, 3];
                return [4 /*yield*/, Math.sin(timerOrFreq.elapsed * piPi)];
            case 2:
                _a.sent();
                return [3 /*break*/, 1];
            case 3: return [2 /*return*/];
        }
    });
}
exports.sineBipolar = sineBipolar;
/**
 * Triangle oscillator
 *
 * ```js
 * // Setup
 * const osc = triangle(Timers.frequencyTimer(0.1));
 * const osc = triangle(0.1);
 *
 * // Call whenver a value is needed
 * const v = osc.next().value;
 * ```
 */
//eslint-disable-next-line func-style
function triangle(timerOrFreq) {
    var v;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (typeof timerOrFreq === "number")
                    timerOrFreq = Timers.frequencyTimer(timerOrFreq);
                _a.label = 1;
            case 1:
                if (!true) return [3 /*break*/, 3];
                v = timerOrFreq.elapsed;
                // /2 = 0->0.5
                if (v < 0.5) {
                    // Upward
                    v *= 2;
                }
                else {
                    // Downward
                    v = 2 - v * 2;
                }
                return [4 /*yield*/, v];
            case 2:
                _a.sent();
                return [3 /*break*/, 1];
            case 3: return [2 /*return*/];
        }
    });
}
exports.triangle = triangle;
/**
 * Saw oscillator
 *
 * ```js
 * import { Oscillators } from "https://unpkg.com/ixfx/dist/modulation.js"
 *
 * // Setup
 * const osc = Oscillators.saw(Timers.frequencyTimer(0.1));
 *
 * // Or
 * const osc = Oscillators.saw(0.1);
 *
 * // Call whenever a value is needed
 * const v = osc.next().value;
 * ```
 */
//eslint-disable-next-line func-style
function saw(timerOrFreq) {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (typeof timerOrFreq === "number")
                    timerOrFreq = Timers.frequencyTimer(timerOrFreq);
                _a.label = 1;
            case 1:
                if (!true) return [3 /*break*/, 3];
                return [4 /*yield*/, timerOrFreq.elapsed];
            case 2:
                _a.sent();
                return [3 /*break*/, 1];
            case 3: return [2 /*return*/];
        }
    });
}
exports.saw = saw;
/**
 * Square oscillator
 *
 * ```js
 * import { Oscillators } from "https://unpkg.com/ixfx/dist/modulation.js"
 *
 * // Setup
 * const osc = Oscillators.square(Timers.frequencyTimer(0.1));
 * const osc = Oscillators.square(0.1);
 *
 * // Call whenever a value is needed
 * osc.next().value;
 * ```
 */
//eslint-disable-next-line func-style
function square(timerOrFreq) {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (typeof timerOrFreq === "number")
                    timerOrFreq = Timers.frequencyTimer(timerOrFreq);
                _a.label = 1;
            case 1:
                if (!true) return [3 /*break*/, 3];
                return [4 /*yield*/, (timerOrFreq.elapsed < 0.5) ? 0 : 1];
            case 2:
                _a.sent();
                return [3 /*break*/, 1];
            case 3: return [2 /*return*/];
        }
    });
}
exports.square = square;
//# sourceMappingURL=Oscillator.js.map