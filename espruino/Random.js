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
exports.__esModule = true;
exports.shortGuid = exports.string = exports.float = exports.integer = exports.gaussianSkewed = exports.gaussian = exports.weightedInteger = exports.weightedSkewed = exports.weighted = exports.defaultRandom = exports.hue = exports.arrayElement = exports.arrayIndex = void 0;
var Arrays_js_1 = require("./collections/Arrays.js");
exports.arrayIndex = Arrays_js_1.randomIndex;
exports.arrayElement = Arrays_js_1.randomElement;
var Guards_js_1 = require("./Guards.js");
var Easings = __importStar(require("./modulation/Easing.js"));
var Clamp_js_1 = require("./data/Clamp.js");
var Colour_js_1 = require("./visual/Colour.js");
__createBinding(exports, Colour_js_1, "randomHue", "hue");
/**
 * Default random number generator: `Math.random`.
 */
exports.defaultRandom = Math.random;
/***
 * Returns a random number, 0..1, weighted by a given easing function.
 * Default easing is `quadIn`, which skews towards zero.
 *
 * ```js
 * weighted();          // quadIn easing by default, which skews toward low values
 * weighted(`quadOut`); // quadOut favours high values
 * ```
 *
 * Use {@link weightedSkewed} for a curried version that can be used as a {@link RandomSource}:
 *
 * ```js
 * const w = weightedSkewed(`quadIn`);
 * w(); // Produce a random number
 * ```
 * @param easingName Easing name. `quadIn` by default.
 * @param rand Source random generator. `Math.random` by default.
 * @returns Random number (0-1)
 */
var weighted = function (easingName, rand) {
    if (easingName === void 0) { easingName = "quadIn"; }
    if (rand === void 0) { rand = exports.defaultRandom; }
    var r = rand();
    var easingFn = Easings.get(easingName);
    if (easingFn === undefined)
        throw new Error("Easing function '".concat(easingName, "' not found."));
    return easingFn(r);
};
exports.weighted = weighted;
/**
 * Returns a curried version of {@link weighted}.
 *
 * ```js
 * const w = weightedSkewed(`quadIn`);   // Returns a function
 * w(); // Produce a random number
 * ```
 * @param easingName
 * @param rand
 * @returns
 */
var weightedSkewed = function (easingName, rand) {
    if (easingName === void 0) { easingName = "quadIn"; }
    if (rand === void 0) { rand = exports.defaultRandom; }
    return function () { return (0, exports.weighted)(easingName, rand); };
};
exports.weightedSkewed = weightedSkewed;
/**
 * Random integer, weighted according to an easing function.
 * Number will be inclusive of `min` and below `max`.
 *
 * ```js
 * // If only one parameter is provided, it's assumed to be the max:
 * // Random number that might be 0 through to 99
 * const r = weightedInteger(100);
 *
 * // If two numbers are given, it's assumed to be min, max
 * // Random number that might be 20 through to 29
 * const r = weightedInteger(20,30);
 *
 * // One number and string. First param is assumed to be
 * // the max, second parameter the easing function
 * const r = weightedInteger(100, `quadIn`)
 * ```
 *
 * Useful for accessing a random array element:
 * ```js
 * const list = [`mango`, `kiwi`, `grape`];
 * // Yields random item from list
 * list[weightedInteger(list.length)];
 * ```
 *
 * Note: result from easing function will be clamped to
 * the min/max (by default 0-1);
 *
 * @param max Maximum (exclusive)
 * @param min Minimum number (inclusive), 0 by default
 * @param rand Source random generator. `Math.random` by default.
 * @param easing Easing to use, uses `quadIn` by default
 * @returns
 */
var weightedInteger = function (minOrMax, maxOrEasing, easing, rand) {
    // Unit tested - for ranges and params types. Haven't tested easing distribution
    if (rand === void 0) { rand = exports.defaultRandom; }
    (0, Guards_js_1.number)(minOrMax);
    //eslint-disable-next-line functional/no-let
    var min, max, easingName;
    easingName = "quadIn";
    min = 0;
    if (maxOrEasing === undefined) {
        // No second parameter
        max = minOrMax;
    }
    else {
        // There is a second parameter
        if (typeof maxOrEasing === "number") {
            min = minOrMax;
            max = maxOrEasing;
            if (easing !== undefined)
                easingName = easing;
        }
        else if (typeof maxOrEasing === "string") {
            max = minOrMax;
            easingName = maxOrEasing;
        }
        else {
            throw new Error("Unexpected value type for maxOrEasing: ".concat(maxOrEasing));
        }
    }
    if (easing !== undefined)
        easingName = easing;
    var easingFn = Easings.get(easingName);
    if (easingFn === undefined)
        throw new Error("Easing '".concat(easingName, "' not found"));
    (0, Guards_js_1.number)(min);
    if (max <= min)
        throw new Error("Max should be greater than min");
    var r = (0, Clamp_js_1.clamp)(easingFn(rand()));
    return Math.floor(r * (max - min)) + min;
};
exports.weightedInteger = weightedInteger;
/**
 * Returns a random number with gaussian (ie bell-curved) distribution
 * ```js
 * // Yields a random number between 0..1
 * // with a gaussian distribution
 * gaussian();
 * ```
 *
 * Distribution can also be skewed:
 * ```js
 * // Yields a skewed random value
 * gaussian(10);
 * ```
 *
 * Use the curried version in order to pass the random number generator elsewhere:
 * ```js
 * const g = gaussianSkewed(10);
 * // Now it can be called without parameters
 * g(); // Yields skewed random
 *
 * // Eg:
 * shuffle(gaussianSkewed(10));
 * ```
 * @param skew Skew factor. Defaults to 1, no skewing. Above 1 will skew to left, below 1 will skew to right
 * @returns
 */
var gaussian = function (skew) {
    if (skew === void 0) { skew = 1; }
    var min = 0;
    var max = 1;
    // Source: https://stackoverflow.com/questions/25582882/javascript-math-random-normal-distribution-gaussian-bell-curve
    //eslint-disable-next-line functional/no-let
    var u = 0, v = 0;
    while (u === 0)
        u = Math.random(); //Converting [0,1) to (0,1)
    while (v === 0)
        v = Math.random();
    //eslint-disable-next-line functional/no-let
    var num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    num = num / 10.0 + 0.5; // Translate to 0 -> 1
    if (num > 1 || num < 0) {
        num = (0, exports.gaussian)(skew); // resample between 0 and 1 if out of range
    }
    else {
        num = Math.pow(num, skew); // Skew
        num *= max - min; // Stretch to fill range
        num += min; // offset to min
    }
    return num;
};
exports.gaussian = gaussian;
/**
 * Returns a function of skewed gaussian values.
 *
 * This 'curried' function is useful when passing to other functions
 * ```js
 * // Curry
 * const g = gaussianSkewed(10);
 *
 * // Now it can be called without parameters
 * g(); // Returns skewed value
 *
 * // Eg:
 * shuffle(gaussianSkewed(10));
 * ```
 * @param skew Skew factor. Defaults to 1, no skewing. Above 1 will skew to left, below 1 will skew to right
 * @returns
 */
var gaussianSkewed = function (skew) {
    if (skew === void 0) { skew = 1; }
    return function () { return (0, exports.gaussian)(skew); };
};
exports.gaussianSkewed = gaussianSkewed;
/**
 * Returns a random integer between `max` (exclusive) and `min` (inclusive)
 * If `min` is not specified, 0 is used.
 *
 * ```js
 * integer(10);    // Random number 0-9
 * integer(5, 10); // Random number 5-9
 * integer(-5);       // Random number from -4 to 0
 * integer(-5, -10); // Random number from -10 to -6
 * ```
 * @param max
 * @param min
 * @returns
 */
var integer = function (max, min) {
    //eslint-disable-next-line functional/no-let
    var reverse = false;
    if (min === undefined) {
        if (max < 0) {
            max = Math.abs(max);
            reverse = true;
        }
        min = 0;
    }
    var amt = max - min;
    var r = Math.floor(Math.random() * amt) + min;
    if (reverse)
        return -r;
    return r;
};
exports.integer = integer;
/**
 * Random a random float between `max` (exclusive) and `min` (inclusive).
 * 1 and 0 are used as default max and min, respectively.
 *
 * ```js
 * // Random number between 0..1 (but not including 1)
 * // (this would be identical to Math.random())
 * const v = float();
 * // Random float between 0..100 (but not including 100)
 * const v = float(100);
 * // Random float between 20..40 (possibily including 20, but always lower than 40)
 * const v = float(20, 40);
 * ```
 * @param max
 * @param min
 * @returns
 */
var float = function (max, min) {
    if (max === void 0) { max = 1; }
    if (min === void 0) { min = 0; }
    return Math.random() * (max - min) + min;
};
exports.float = float;
/**
 * Returns a string of random letters and numbers of a given `length`.
 *
 * ```js
 * string(4); // eg. `4afd`
 * ```
 * @param length Length of random string
 * @returns Random string
 */
var string = function (length) { return Math.random().toString(36).substring(2, length + 2); };
exports.string = string;
var shortGuid = function () {
    // Via Stackoverflow...
    var firstPart = (Math.random() * 46656) | 0;
    var secondPart = (Math.random() * 46656) | 0;
    var firstPartStr = "000".concat(firstPart.toString(36)).slice(-3);
    var secondPartStr = "000".concat(secondPart.toString(36)).slice(-3);
    return firstPartStr + secondPartStr;
};
exports.shortGuid = shortGuid;
//# sourceMappingURL=Random.js.map