"use strict";
exports.__esModule = true;
exports.functions = exports.gaussian = exports.getEasings = exports.get = exports.crossfade = exports.mix = exports.fromCubicBezier = exports.tick = exports.time = void 0;
// Easings from https://easings.net/
var Interpolate_js_1 = require("../data/Interpolate.js");
var index_js_1 = require("../flow/index.js");
var sqrt = Math.sqrt;
var pow = Math.pow;
var cos = Math.cos;
//eslint-disable-next-line @typescript-eslint/naming-convention
var pi = Math.PI;
var sin = Math.sin;
/**
 * Creates an easing based on clock time
 * @example Time based easing
 * ```
 * const t = time(`quintIn`, 5*1000); // Will take 5 seconds to complete
 * ...
 * t.compute(); // Get current value of easing
 * t.reset();   // Reset to 0
 * t.isDone;    // _True_ if finished
 * ```
 * @param nameOrFn Name of easing, or an easing function
 * @param durationMs Duration in milliseconds
 * @returns Easing
 */
var time = function (nameOrFn, durationMs) {
    return create(nameOrFn, durationMs, index_js_1.msElapsedTimer);
};
exports.time = time;
/**
 * Creates an easing based on ticks
 *
 * @example Tick-based easing
 * ```
 * const t = tick(`sineIn`, 1000);   // Will take 1000 ticks to complete
 * t.compute(); // Each call to `compute` progresses the tick count
 * t.reset();   // Reset to 0
 * t.isDone;    // _True_ if finished
 * ```
 * @param nameOrFn Name of easing, or an easing function
 * @param durationTicks Duration in ticks
 * @returns Easing
 */
var tick = function (nameOrFn, durationTicks) {
    return create(nameOrFn, durationTicks, index_js_1.ticksElapsedTimer);
};
exports.tick = tick;
/**
 * Creates a new easing by name
 *
 * @param nameOrFn Name of easing, or an easing function
 * @param duration Duration (meaning depends on timer source)
 * @param timerSource Timer source. Eg {@link tickRelativeTimer}, {@link msRelativeTimer}
 * @returns
 */
var create = function (nameOrFn, duration, timerSource) {
    //eslint-disable-next-line functional/no-let
    var fn;
    if (typeof nameOrFn === "function")
        fn = nameOrFn;
    else
        fn = (0, exports.get)(nameOrFn);
    if (fn === undefined)
        throw new Error("Easing function not found: ".concat(nameOrFn));
    // Get a relative version of timer
    var timer = (0, index_js_1.relativeTimer)(duration, timerSource(), true);
    return {
        get isDone() {
            return timer.isDone;
        },
        compute: function () {
            var relative = timer.elapsed;
            //eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            return fn(relative);
        },
        reset: function () {
            timer.reset();
        }
    };
};
/**
 * Creates an easing function using a simple cubic bezier defined by two points.
 *
 * Eg: https://cubic-bezier.com/#0,1.33,1,-1.25
 *  a:0, b: 1.33, c: 1, d: -1.25
 *
 * ```js
 * // Time-based easing using bezier
 * const e = Easings.time(fromCubicBezier(1.33, -1.25), 1000);
 * e.compute();
 * ```
 * @param b
 * @param d
 * @param t
 * @returns Value
 */
var fromCubicBezier = function (b, d) { return function (t) {
    var s = 1 - t;
    var s2 = s * s;
    var t2 = t * t;
    var t3 = t2 * t;
    return (3 * b * s2 * t) + (3 * d * s * t2) + (t3);
}; };
exports.fromCubicBezier = fromCubicBezier;
/**
 * Returns a mix of two easing functions.
 *
 * ```js
 * // Get a 50/50 mix of two easing functions at t=0.25
 * mix(0.5, 0.25, sineIn, sineOut);
 *
 * // 10% of sineIn, 90% of sineOut
 * mix(0.90, 0.25, sineIn, sineOut);
 * ```
 * @param amt 'Progress' value passed to the easing functions
 * @param balance Mix between a and b
 * @param easingA
 * @param easingB
 * @returns Numeric value
 */
var mix = function (amt, balance, easingA, easingB) { return (0, Interpolate_js_1.interpolate)(balance, easingA(amt), easingB(amt)); };
exports.mix = mix;
/**
 * Returns a 'crossfade' of two easing functions, synchronised with the progress through the easing. That is:
 * * 0.0 will yield 100% of easingA at its `easing(0)` value.
 * * 0.2 will yield 80% of a, 20% of b, with both at their `easing(0.2)` values
 * * 0.5 will yield 50% of both functions both at their `easing(0.5)` values
 * * 0.8 will yield 20% of a, 80% of a, with both at their `easing(0.8)` values
 * * 1.0 will yield 100% of easingB at its `easing(1)` value.
 *
 * So easingB will only ever kick in at higher `amt` values and `easingA` will only be present in lower valus.
 * @param amt
 * @param easingA
 * @param easingB
 * @returns Numeric value
 */
var crossfade = function (amt, easingA, easingB) { return (0, exports.mix)(amt, amt, easingA, easingB); };
exports.crossfade = crossfade;
/**
 * Returns an easing function by name, or _undefined_ if not found.
 * This is a manual way of working with easing functions. If you want to
 * ease over time or ticks, use `Flow.Timer.msElapsedTimer` or `Flow.Timer.ticksElapsedTimer`.
 *
 * ```js
 * const fn = Easings.get(`sineIn`);
 * // Returns 'eased' transformation of 0.5
 * fn(0.5);
 * ```
 * @param easingName eg `sineIn`
 * @returns Easing function
 */
var get = function (easingName) {
    if (easingName === null)
        throw new Error("easingName is null");
    if (easingName === undefined)
        throw new Error("easingName is undefined");
    var name = easingName.toLocaleLowerCase();
    var found = Object
        .entries(exports.functions)
        .find(function (_a) {
        var k = _a[0], _v = _a[1];
        return k.toLocaleLowerCase() === name;
    });
    if (found === undefined)
        return found;
    return found[1];
};
exports.get = get;
/**
 * @private
 * @returns Returns list of available easing names
 */
var getEasings = function () {
    return Array.from(Object.keys(exports.functions));
};
exports.getEasings = getEasings;
/**
 * Returns a roughly gaussian easing function
 * @param stdDev
 * @returns
 */
var gaussian = function (stdDev) {
    if (stdDev === void 0) { stdDev = 0.4; }
    var a = 1 / sqrt(2 * pi);
    var mean = 0.5;
    return function (t) {
        var f = a / stdDev;
        // p:-8 pinched
        //eslint-disable-next-line functional/no-let
        var p = -2.5; // -1/1.25;
        //eslint-disable-next-line functional/no-let
        var c = (t - mean) / stdDev;
        c *= c;
        p *= c;
        var v = f * pow(Math.E, p); // * (2/pi);//0.62;
        if (v > 1)
            return 1;
        if (v < 0)
            return 0;
        //if (v >1) console.log(v);
        //if (v < 0) console.log(v);
        return v;
    };
};
exports.gaussian = gaussian;
var bounceOut = function (x) {
    var n1 = 7.5625;
    var d1 = 2.75;
    if (x < 1 / d1) {
        return n1 * x * x;
    }
    else if (x < 2 / d1) {
        return n1 * (x -= 1.5 / d1) * x + 0.75;
    }
    else if (x < 2.5 / d1) {
        return n1 * (x -= 2.25 / d1) * x + 0.9375;
    }
    else {
        return n1 * (x -= 2.625 / d1) * x + 0.984375;
    }
};
var quintIn = function (x) { return x * x * x * x * x; };
var quintOut = function (x) { return 1 - pow(1 - x, 5); };
var arch = function (x) { return (x * (1 - x) * 4); };
exports.functions = {
    arch: arch,
    bell: (0, exports.gaussian)(),
    sineIn: function (x) { return 1 - cos((x * pi) / 2); },
    sineOut: function (x) { return sin((x * pi) / 2); },
    quadIn: function (x) { return x * x; },
    quadOut: function (x) { return 1 - (1 - x) * (1 - x); },
    sineInOut: function (x) { return -(cos(pi * x) - 1) / 2; },
    quadInOut: function (x) { return (x < 0.5 ? 2 * x * x : 1 - pow(-2 * x + 2, 2) / 2); },
    cubicIn: function (x) { return x * x * x; },
    cubicOut: function (x) { return 1 - pow(1 - x, 3); },
    quartIn: function (x) { return x * x * x * x; },
    quartOut: function (x) { return 1 - pow(1 - x, 4); },
    quintIn: quintIn,
    quintOut: quintOut,
    expoIn: function (x) { return (x === 0 ? 0 : pow(2, 10 * x - 10)); },
    expoOut: function (x) { return (x === 1 ? 1 : 1 - pow(2, -10 * x)); },
    quintInOut: function (x) { return (x < 0.5 ? 16 * x * x * x * x * x : 1 - pow(-2 * x + 2, 5) / 2); },
    expoInOut: function (x) { return (x === 0
        ? 0
        : x === 1
            ? 1
            : x < 0.5 ? pow(2, 20 * x - 10) / 2
                : (2 - pow(2, -20 * x + 10)) / 2); },
    circIn: function (x) { return 1 - sqrt(1 - pow(x, 2)); },
    circOut: function (x) { return sqrt(1 - pow(x - 1, 2)); },
    backIn: function (x) {
        var c1 = 1.70158;
        var c3 = c1 + 1;
        return c3 * x * x * x - c1 * x * x;
    },
    backOut: function (x) {
        var c1 = 1.70158;
        var c3 = c1 + 1;
        return 1 + c3 * pow(x - 1, 3) + c1 * pow(x - 1, 2);
    },
    circInOut: function (x) { return (x < 0.5
        ? (1 - sqrt(1 - pow(2 * x, 2))) / 2
        : (sqrt(1 - pow(-2 * x + 2, 2)) + 1) / 2); },
    backInOut: function (x) {
        var c1 = 1.70158;
        var c2 = c1 * 1.525;
        return x < 0.5
            ? (pow(2 * x, 2) * ((c2 + 1) * 2 * x - c2)) / 2
            : (pow(2 * x - 2, 2) * ((c2 + 1) * (x * 2 - 2) + c2) + 2) / 2;
    },
    elasticIn: function (x) {
        var c4 = (2 * pi) / 3;
        return x === 0
            ? 0
            : x === 1
                ? 1
                : -pow(2, 10 * x - 10) * sin((x * 10 - 10.75) * c4);
    },
    elasticOut: function (x) {
        var c4 = (2 * pi) / 3;
        return x === 0
            ? 0
            : x === 1
                ? 1
                : pow(2, -10 * x) * sin((x * 10 - 0.75) * c4) + 1;
    },
    bounceIn: function (x) { return 1 - bounceOut(1 - x); },
    bounceOut: bounceOut,
    elasticInOut: function (x) {
        var c5 = (2 * pi) / 4.5;
        return x === 0
            ? 0
            : x === 1
                ? 1
                : x < 0.5
                    ? -(pow(2, 20 * x - 10) * sin((20 * x - 11.125) * c5)) / 2
                    : (pow(2, -20 * x + 10) * sin((20 * x - 11.125) * c5)) / 2 + 1;
    },
    bounceInOut: function (x) { return (x < 0.5
        ? (1 - bounceOut(1 - 2 * x)) / 2
        : (1 + bounceOut(2 * x - 1)) / 2); }
};
//# sourceMappingURL=Easing.js.map