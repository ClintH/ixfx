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
exports.__esModule = true;
exports.jitter = exports.Oscillators = exports.Forces = exports.Easings = void 0;
var Random_js_1 = require("../Random.js");
var Clamp_js_1 = require("../data/Clamp.js");
var Guards_js_1 = require("../Guards.js");
var Easings = __importStar(require("./Easing.js"));
exports.Easings = Easings;
var Envelopes = __importStar(require("./Envelope.js"));
var Forces = __importStar(require("./Forces.js"));
exports.Forces = Forces;
var Oscillators = __importStar(require("./Oscillator.js"));
exports.Oscillators = Oscillators;
__exportStar(require("./PingPong.js"), exports);
/**
 * Envelope
 */
__exportStar(require("./Envelope.js"), exports);
/**
 * Jitters `value` by the absolute `jitter` amount.
 * All values should be on a 0..1 scale, and the return value is by default clamped to 0..1.
 * Pass `clamped:false` as an option
 * to allow for arbitary ranges.
 *
 * ```js
 * import { jitter } from 'https://unpkg.com/ixfx/dist/modulation.js';
 *
 * // Jitter 0.5 by 10% (absolute)
 * // yields range of 0.4-0.6
 * jitter(0.5, 0.1);
 *
 * // Jitter 0.5 by 10% (relative, 10% of 0.5)
 * // yields range of 0.45-0.55
 * jitter(0.5, 0.1, { type:`rel` });
 * ```
 *
 * You can also opt not to clamp values:
 * ```js
 * // Yields range of -1.5 - 1.5
 * jitter(0.5, 1, { clamped:false });
 * ```
 *
 * A custom source for random numbers can be provided. Eg, use a weighted
 * random number generator:
 *
 * ```js
 * import { weighted } from 'https://unpkg.com/ixfx/dist/random.js';
 * jitter(0.5, 0.1, { random: weighted };
 * ```
 *
 * Options
 * * clamped: If false, `value`s out of percentage range can be used and return value may
 *    beyond percentage range. True by default
 * * type: if `rel`, `jitter` is considered to be a percentage relative to `value`
 *         if `abs`, `jitter` is considered to be an absolute value (default)
 * @param value Value to jitter
 * @param jitter Absolute amount to jitter by
 * @param opts Jitter options
 * @returns Jittered value
 */
var jitter = function (value, jitter, opts) {
    var _a, _b, _c;
    if (opts === void 0) { opts = {}; }
    var type = (_a = opts.type) !== null && _a !== void 0 ? _a : "abs";
    var clamped = (_b = opts.clamped) !== null && _b !== void 0 ? _b : true;
    var rand = (_c = opts.random) !== null && _c !== void 0 ? _c : Random_js_1.defaultRandom;
    (0, Guards_js_1.number)(value, clamped ? "percentage" : "bipolar", "value");
    (0, Guards_js_1.number)(jitter, clamped ? "percentage" : "bipolar", "jitter");
    //eslint-disable-next-line functional/no-let
    var v;
    if (type === "rel") {
        jitter = value * jitter;
        var j = jitter * 2 * rand();
        v = value - jitter + j;
    }
    else if (type === "abs") {
        var j = jitter * 2 * rand();
        v = value - jitter + j;
    }
    else {
        throw new Error("Unknown jitter type: ".concat(type, "."));
    }
    if (clamped)
        return (0, Clamp_js_1.clamp)(v);
    return v;
};
exports.jitter = jitter;
try {
    if (typeof window !== "undefined") {
        //eslint-disable-next-line functional/immutable-data,@typescript-eslint/no-explicit-any
        window.ixfx = __assign(__assign({}, window.ixfx), { Modulation: { Forces: Forces, jitter: exports.jitter, Envelopes: Envelopes, Oscillators: Oscillators, Easings: Easings } });
    }
}
catch ( /* no-op */_a) { /* no-op */ }
//# sourceMappingURL=index.js.map