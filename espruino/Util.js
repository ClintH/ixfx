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
exports.__esModule = true;
exports.runningiOS = exports.toStringDefault = exports.isEqualValueDefault = exports.isEqualDefault = exports.roundUpToMultiple = exports.getFieldPaths = exports.getFieldByPath = exports.relativeDifference = exports.isPowerOfTwo = exports.ifNaN = exports.IterableAsync = void 0;
var Guards_js_1 = require("./Guards.js");
var Text_js_1 = require("./Text.js");
exports.IterableAsync = __importStar(require("./IterableAsync.js"));
//export { KeyValue } from './KeyValue.js';
/**
 * Returns `fallback` if `v` is NaN, otherwise returns `v`
 * @param v
 * @param fallback
 * @returns
 */
var ifNaN = function (v, fallback) {
    if (Number.isNaN(v))
        return fallback;
    return v;
};
exports.ifNaN = ifNaN;
/**
 * Returns true if `x` is a power of two
 * @param x
 * @returns True if `x` is a power of two
 */
var isPowerOfTwo = function (x) { return Math.log2(x) % 1 === 0; };
exports.isPowerOfTwo = isPowerOfTwo;
/**
 * Returns the relative difference from the `initial` value
 * ```js
 * const rel = relativeDifference(100);
 * rel(100); // 1
 * rel(150); // 1.5
 * rel(50);  // 0.5
 * ```
 *
 * The code for this is simple:
 * ```js
 * const relativeDifference = (initial) => (v) => v/initial
 * ```
 * @param {number} initial
 * @returns
 */
var relativeDifference = function (initial) { return function (v) { return v / initial; }; };
exports.relativeDifference = relativeDifference;
// try {
//   if (typeof window !== `undefined`) {
//     //eslint-disable-next-line functional/immutable-data,@typescript-eslint/no-explicit-any
//     (window as any).ixfx = {...(window as any).ixfx, clamp, clampIndex, flip, interpolate, interpolateAngle, proportion, relativeDifference, scale, scalePercent, wrap, wrapInteger, wrapRange};
//   }
// } catch { /* no-op */ }
/**
 * Returns a field on object `o` by a dotted path.
 * ```
 * const d = {
 *  accel: {x: 1, y: 2, z: 3},
 *  gyro:  {x: 4, y: 5, z: 6}
 * };
 * getFieldByPath(d, `accel.x`); // 1
 * getFieldByPath(d, `gyro.z`);  // 6
 * getFieldByPath(d, `gyro`);    // {x:4, y:5, z:6}
 * getFieldByPath(d, ``);        // Returns original object
 * ```
 *
 * If a field does not exist, `undefined` is returned.
 * Use {@link getFieldPaths} to get a list of paths.
 * @param o
 * @param path
 * @returns
 */
//eslint-disable-next-line @typescript-eslint/no-explicit-any
var getFieldByPath = function (o, path) {
    if (path === void 0) { path = ""; }
    if (path.length === 0)
        return o;
    if (path in o) {
        return o[path];
    }
    else {
        var start = (0, Text_js_1.untilMatch)(path, ".");
        if (start in o) {
            return (0, exports.getFieldByPath)(o[start], path.substring(start.length + 1));
        }
        else {
            return undefined;
        }
    }
};
exports.getFieldByPath = getFieldByPath;
/**
 * Returns a list of paths for all the fields on `o`
 * ```
 * const d = {
 *  accel: {x: 1, y: 2, z: 3},
 *  gyro:  {x: 4, y: 5, z: 6}
 * };
 * const paths = getFieldPaths(d);
 * // Yields [ `accel.x`, `accel.y`,`accel.z`,`gyro.x`,`gyro.y`,`gyro.z` ]
 * ```
 *
 * Use {@link getFieldByPath} to fetch data by this 'path' string.
 * @param o
 * @returns
 */
//eslint-disable-next-line @typescript-eslint/no-explicit-any
var getFieldPaths = function (o) {
    var paths = [];
    //eslint-disable-next-line @typescript-eslint/no-explicit-any
    var probe = function (o, prefix) {
        if (prefix === void 0) { prefix = ""; }
        if (typeof o === "object") {
            var keys = Object.keys(o);
            if (prefix.length > 0)
                prefix += ".";
            keys.forEach(function (k) { return probe(o[k], prefix + k); });
        }
        else {
            //eslint-disable-next-line functional/immutable-data
            paths.push(prefix);
        }
    };
    probe(o);
    return paths;
};
exports.getFieldPaths = getFieldPaths;
/**
 * Rounds `v` up to the nearest multiple of `multiple`
 * ```
 * roundMultiple(19, 20); // 20
 * roundMultiple(21, 20); // 40
 * ```
 * @param v
 * @param multiple
 * @returns
 */
var roundUpToMultiple = function (v, multiple) {
    (0, Guards_js_1.number)(v, "nonZero", "v");
    (0, Guards_js_1.number)(multiple, "nonZero", "muliple");
    return Math.ceil(v / multiple) * multiple;
};
exports.roundUpToMultiple = roundUpToMultiple;
/**
 * Default comparer function is equiv to checking `a === b`
 */
var isEqualDefault = function (a, b) { return a === b; };
exports.isEqualDefault = isEqualDefault;
/**
 * Comparer returns true if string representation of `a` and `b` are equal.
 * Uses `toStringDefault` to generate a string representation (`JSON.stringify`)
 * @returns True if the contents of `a` and `b` are equal
 */
var isEqualValueDefault = function (a, b) {
    // ✔ UNIT TESTED
    if (a === b)
        return true; // Object references are the same, or string values are the same
    return (0, exports.toStringDefault)(a) === (0, exports.toStringDefault)(b); // String representations are the same
};
exports.isEqualValueDefault = isEqualValueDefault;
/**
 * A default converter to string that uses JSON.stringify if its an object, or the thing itself if it's a string
 */
var toStringDefault = function (itemToMakeStringFor) { return ((typeof itemToMakeStringFor === "string") ? itemToMakeStringFor : JSON.stringify(itemToMakeStringFor)); };
exports.toStringDefault = toStringDefault;
var runningiOS = function () { return [
    "iPad Simulator",
    "iPhone Simulator",
    "iPod Simulator",
    "iPad",
    "iPhone",
    "iPod"
].includes(navigator.platform)
    // iPad on iOS 13 detection
    || (navigator.userAgent.includes("Mac") && "ontouchend" in document); };
exports.runningiOS = runningiOS;
try {
    if (typeof window !== "undefined") {
        //eslint-disable-next-line functional/immutable-data,@typescript-eslint/no-explicit-any
        window.ixfx = __assign(__assign({}, window.ixfx), { getFieldByPath: exports.getFieldByPath, getFieldPaths: exports.getFieldPaths });
    }
}
catch ( /* no-op */_a) { /* no-op */ }
//# sourceMappingURL=Util.js.map