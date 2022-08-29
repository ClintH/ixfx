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
exports.rotate = exports.toPath = exports.bbox = exports.fromPointsToPath = exports.joinPointsToLines = exports.fromPoints = exports.fromFlatArray = exports.toSvgString = exports.asPoints = exports.toFlatArray = exports.fromNumbers = exports.toString = exports.interpolate = exports.distance = exports.pointsOf = exports.extendFromA = exports.pointAtX = exports.scaleFromMidpoint = exports.parallel = exports.perpendicularPoint = exports.slope = exports.nearest = exports.getPointsParam = exports.midpoint = exports.length = exports.withinRange = exports.normaliseByRect = exports.subtract = exports.sum = exports.divide = exports.multiply = exports.angleRadian = exports.guard = exports.apply = exports.isEqual = exports.isPolyLine = exports.isLine = void 0;
var index_js_1 = require("../collections/index.js");
var NumericArrays_js_1 = require("../collections/NumericArrays.js");
var Guards_js_1 = require("../Guards.js");
var index_js_2 = require("./index.js");
var Point_js_1 = require("./Point.js");
/**
 * Returns true if `p` is a valid line, containing `a` and `b` Points.
 * ```js
 * import { Lines } from 'https://unpkg.com/ixfx/dist/geometry.js'
 * Lines.isLine(l);
 * ```
 * @param p Value to check
 * @returns True if a valid line.
 */
var isLine = function (p) {
    if (p === undefined)
        return false;
    if (p.a === undefined)
        return false;
    if (p.b === undefined)
        return false;
    if (!index_js_2.Points.isPoint(p.a))
        return false;
    if (!index_js_2.Points.isPoint(p.b))
        return false;
    return true;
};
exports.isLine = isLine;
/**
 * Returns true if `p` is a {@link PolyLine}, ie. an array of {@link Line}s.
 * Validates all items in array.
 * @param p
 * @returns
 */
//eslint-disable-next-line @typescript-eslint/no-explicit-any
var isPolyLine = function (p) {
    if (!Array.isArray(p))
        return false;
    var valid = !p.some(function (v) { return !(0, exports.isLine)(v); });
    return valid;
};
exports.isPolyLine = isPolyLine;
/**
 * Returns true if the lines have the same value. Note that only
 * the line start and end points are compared. So the lines might
 * be different in other properties, and `isEqual` will still return
 * true.
 *
 * ```js
 * import { Lines } from 'https://unpkg.com/ixfx/dist/geometry.js'
 * const a = { a: {x:0,  y: 10 }, b: { x: 20, y: 20 }};
 * const b = { a: {x:0,  y: 10 }, b: { x: 20, y: 20 }};
 * a === b; // false, because they are different objects
 * Lines.isEqual(a, b); // true, because they have the same value
 * ```
 * @param {Line} a
 * @param {Line} b
 * @returns {boolean}
 */
var isEqual = function (a, b) { return index_js_2.Points.isEqual(a.a, b.a) && index_js_2.Points.isEqual(a.b, b.b); };
exports.isEqual = isEqual;
/**
 * Applies `fn` to both start and end points.
 *
 * ```js
 * import { Lines } from 'https://unpkg.com/ixfx/dist/geometry.js'
 * // Line 10,10 -> 20,20
 * const line = Lines.fromNumbers(10,10, 20,20);
 *
 * // Applies randomisation to both x and y.
 * const rand = (p) => ({
 *  x: p.x * Math.random(),
 *  y: p.y * Math.random()
 * });
 *
 * // Applies our randomisation function
 * const line2 = apply(line, rand);
 * ```
 * @param line Line
 * @param fn Function that takes a point and returns a point
 * @returns
 */
var apply = function (line, fn) { return Object.freeze(__assign(__assign({}, line), { a: fn(line.a), b: fn(line.b) })); };
exports.apply = apply;
/**
 * Throws an exception if:
 * * line is undefined
 * * a or b parameters are missing
 *
 * Does not validate points
 * @param line
 * @param paramName
 */
var guard = function (line, paramName) {
    if (paramName === void 0) { paramName = "line"; }
    if (line === undefined)
        throw new Error("".concat(paramName, " undefined"));
    if (line.a === undefined)
        throw new Error("".concat(paramName, ".a undefined. Expected {a:Point, b:Point}"));
    if (line.b === undefined)
        throw new Error("".concat(paramName, ".b undefined. Expected {a:Point, b:Point}"));
};
exports.guard = guard;
/**
 * Returns the angle in radians of a line, or two points
 * ```js
 * import { Lines } from 'https://unpkg.com/ixfx/dist/geometry.js'
 * Lines.angleRadian(line);
 * Lines.angleRadian(ptA, ptB);
 * ```
 * @param lineOrPoint
 * @param b
 * @returns
 */
var angleRadian = function (lineOrPoint, b) {
    //eslint-disable-next-line functional/no-let
    var a;
    if ((0, exports.isLine)(lineOrPoint)) {
        a = lineOrPoint.a;
        b = lineOrPoint.b;
    }
    else {
        a = lineOrPoint;
        if (b === undefined)
            throw new Error("b point must be provided");
    }
    return Math.atan2(b.y - a.y, b.x - a.x);
};
exports.angleRadian = angleRadian;
/**
 * Multiplies start and end of line by point.x, point.y.
 *
 * ```js
 * import { Lines } from 'https://unpkg.com/ixfx/dist/geometry.js'
 *
 * // Line 1,1 -> 10,10
 * const l = Lines.fromNumbers(1, 1, 10, 10);
 * const ll = Lines.multiply(l, {x:2, y:3});
 * // Yields: 2,20 -> 3,30
 * ```
 * @param line
 * @param point
 * @returns
 */
var multiply = function (line, point) { return (Object.freeze(__assign(__assign({}, line), { a: index_js_2.Points.multiply(line.a, point), b: index_js_2.Points.multiply(line.b, point) }))); };
exports.multiply = multiply;
/**
 * Divides both start and end points by given x,y
 * ```js
 * import { Lines } from 'https://unpkg.com/ixfx/dist/geometry.js'
 *
 * // Line 1,1 -> 10,10
 * const l = Lines.fromNumbers(1,1,10,10);
 * const ll = Lines.divide(l, {x:2, y:4});
 * // Yields: 0.5,0.25 -> 5,2.5
 * ```
 * @param line
 * @param point
 * @returns
 */
var divide = function (line, point) { return Object.freeze(__assign(__assign({}, line), { a: index_js_2.Points.divide(line.a, point), b: index_js_2.Points.divide(line.b, point) })); };
exports.divide = divide;
/**
 * Adds both start and end points by given x,y
 * ```js
 * import { Lines } from 'https://unpkg.com/ixfx/dist/geometry.js'
 * // Line 1,1 -> 10,10
 * const l = Lines.fromNumbers(1,1,10,10);
 * const ll = Lines.sum(l, {x:2, y:4});
 * // Yields: 3,5 -> 12,14
 * ```
 * @param line
 * @param point
 * @returns
 */
var sum = function (line, point) { return Object.freeze(__assign(__assign({}, line), { a: index_js_2.Points.sum(line.a, point), b: index_js_2.Points.sum(line.b, point) })); };
exports.sum = sum;
/**
 * Subtracts both start and end points by given x,y
 * ```js
 * import { Lines } from 'https://unpkg.com/ixfx/dist/geometry.js'
 *
 * // Line 1,1 -> 10,10
 * const l = Lines.fromNumbers(1,1,10,10);
 * const ll = Lines.subtract(l, {x:2, y:4});
 * // Yields: -1,-3 -> 8,6
 * ```
 * @param line
 * @param point
 * @returns
 */
var subtract = function (line, point) { return Object.freeze(__assign(__assign({}, line), { a: index_js_2.Points.subtract(line.a, point), b: index_js_2.Points.subtract(line.b, point) })); };
exports.subtract = subtract;
/**
 * Normalises start and end points by given width and height. Useful
 * for converting an absolutely-defined line to a relative one.
 *
 * ```js
 * import { Lines } from 'https://unpkg.com/ixfx/dist/geometry.js'
 *
 * // Line 1,1 -> 10,10
 * const l = Lines.fromNumbers(1,1,10,10);
 * const ll = Lines.normaliseByRect(l, 10, 10);
 * // Yields: 0.1,0.1 -> 1,1
 * ```
 * @param line
 * @param width
 * @param height
 * @returns
 */
var normaliseByRect = function (line, width, height) { return Object.freeze(__assign(__assign({}, line), { a: index_js_2.Points.normaliseByRect(line.a, width, height), b: index_js_2.Points.normaliseByRect(line.b, width, height) })); };
exports.normaliseByRect = normaliseByRect;
/**
 * Returns true if `point` is within `maxRange` of `line`.
 *
 * ```js
 * import { Lines } from 'https://unpkg.com/ixfx/dist/geometry.js'
 * const line = Lines.fromNumbers(0,20,20,20);
 * Lines.withinRange(line, {x:0,y:21}, 1); // True
 * ```
 * @param line
 * @param point
 * @param maxRange
 * @returns True if point is within range
 */
var withinRange = function (line, point, maxRange) {
    var dist = (0, exports.distance)(line, point);
    return dist <= maxRange;
};
exports.withinRange = withinRange;
/**
 * Returns length of line, polyline or between two points
 *
 * @param aOrLine Point A, line or polyline (array of lines)
 * @param pointB Point B, if first parameter is a point
 * @returns Length (total accumulated length for arrays)
 */
//eslint-disable-next-line func-style
function length(aOrLine, pointB) {
    if ((0, exports.isPolyLine)(aOrLine)) {
        var sum_1 = aOrLine.reduce(function (acc, v) { return length(v) + acc; }, 0);
        return sum_1;
    }
    var _a = (0, exports.getPointsParam)(aOrLine, pointB), a = _a[0], b = _a[1];
    var x = b.x - a.x;
    var y = b.y - a.y;
    if (a.z !== undefined && b.z !== undefined) {
        var z = b.z - a.z;
        return Math.hypot(x, y, z);
    }
    else {
        return Math.hypot(x, y);
    }
}
exports.length = length;
/**
 * Returns the mid-point of a line (same as `interpolate` with an amount of 0.5)
 *
 * ```js
 * import { Lines } from 'https://unpkg.com/ixfx/dist/geometry.js'
 * Lines.midpoint(line); // Returns {x, y}
 * ```
 * @param aOrLine
 * @param pointB
 * @returns
 */
var midpoint = function (aOrLine, pointB) {
    var _a = (0, exports.getPointsParam)(aOrLine, pointB), a = _a[0], b = _a[1];
    return interpolate(0.5, a, b);
};
exports.midpoint = midpoint;
/**
 * Returns [a,b] points from either a line parameter, or two points.
 * It additionally applies the guardPoint function to ensure validity.
 * This supports function overloading.
 * @ignore
 * @param aOrLine
 * @param b
 * @returns
 */
var getPointsParam = function (aOrLine, b) {
    //eslint-disable-next-line functional/no-let
    var a;
    if ((0, exports.isLine)(aOrLine)) {
        b = aOrLine.b;
        a = aOrLine.a;
    }
    else {
        a = aOrLine;
        if (b === undefined)
            throw new Error("Since first parameter is not a line, two points are expected. Got a: ".concat(JSON.stringify(a), " b: ").concat(JSON.stringify(b)));
    }
    (0, Point_js_1.guard)(a, "a");
    (0, Point_js_1.guard)(a, "b");
    return [a, b];
};
exports.getPointsParam = getPointsParam;
/**
 * Returns the nearest point on `line` closest to `point`.
 *
 * ```js
 * import { Lines } from 'https://unpkg.com/ixfx/dist/geometry.js'
 * const pt = Linesnearest(line, {x:10,y:10});
 * ```
 *
 * If an array of lines is provided, it will be the closest point amongst all the lines
 * @param line Line or array of lines
 * @param point
 * @returns Point `{ x, y }`
 */
var nearest = function (line, point) {
    var n = function (line) {
        var a = line.a, b = line.b;
        var atob = { x: b.x - a.x, y: b.y - a.y };
        var atop = { x: point.x - a.x, y: point.y - a.y };
        var len = atob.x * atob.x + atob.y * atob.y;
        //eslint-disable-next-line functional/no-let
        var dot = atop.x * atob.x + atop.y * atob.y;
        var t = Math.min(1, Math.max(0, dot / len));
        dot = (b.x - a.x) * (point.y - a.y) - (b.y - a.y) * (point.x - a.x);
        return { x: a.x + atob.x * t, y: a.y + atob.y * t };
    };
    if (Array.isArray(line)) {
        var pts = line.map(function (l) { return n(l); });
        var dists = pts.map(function (p) { return index_js_2.Points.distance(p, point); });
        return Object.freeze(pts[index_js_1.Arrays.minIndex.apply(index_js_1.Arrays, dists)]);
    }
    else {
        return Object.freeze(n(line));
    }
};
exports.nearest = nearest;
/**
 * Calculates [slope](https://en.wikipedia.org/wiki/Slope) of line.
 *
 * @example
 * ```js
 * import { Lines } from 'https://unpkg.com/ixfx/dist/geometry.js'
 * Lines.slope(line);
 * Lines.slope(ptA, ptB)
 * ```
 * @param lineOrPoint Line or point. If point is provided, second point must be given too
 * @param b Second point if needed
 * @returns
 */
var slope = function (lineOrPoint, b) {
    //eslint-disable-next-line functional/no-let
    var a;
    if ((0, exports.isLine)(lineOrPoint)) {
        //eslint-disable-next-line functional/no-let
        a = lineOrPoint.a;
        b = lineOrPoint.b;
    }
    else {
        a = lineOrPoint;
        if (b === undefined)
            throw new Error("b parameter required");
    }
    if (b !== undefined) {
        return (b.y - a.y) / (b.x - a.x);
    }
    else
        throw Error("Second point missing");
};
exports.slope = slope;
var directionVector = function (line) { return ({
    x: line.b.x - line.a.x,
    y: line.b.y - line.a.y
}); };
var directionVectorNormalised = function (line) {
    var l = length(line);
    var v = directionVector(line);
    return {
        x: v.x / l,
        y: v.y / l
    };
};
/**
 * Returns a point perpendicular to `line` at a specified `distance`. Use negative
 * distances for the other side of line.
 * ```
 * import { Lines } from 'https://unpkg.com/ixfx/dist/geometry.js'
 * // Project a point 100 units away from line, at its midpoint.
 * const pt = Lines.perpendicularPoint(line, 100, 0.5);
 * ```
 * @param line Line
 * @param distance Distance from line. Use negatives to flip side
 * @param amount Relative place on line to project point from. 0 projects from A, 0.5 from the middle, 1 from B.
 */
var perpendicularPoint = function (line, distance, amount) {
    if (amount === void 0) { amount = 0; }
    var origin = interpolate(amount, line);
    var dvn = directionVectorNormalised(line);
    return {
        x: origin.x - dvn.y * distance,
        y: origin.y + dvn.x * distance
    };
};
exports.perpendicularPoint = perpendicularPoint;
/**
 * Returns a parallel line to `line` at `distance`.
 *
 * ```js
 * import { Lines } from 'https://unpkg.com/ixfx/dist/geometry.js'
 * const l = Lines.parallel(line, 10);
 * ```
 * @param line
 * @param distance
 */
var parallel = function (line, distance) {
    var dv = directionVector(line);
    var dvn = directionVectorNormalised(line);
    var a = {
        x: line.a.x - dvn.y * distance,
        y: line.a.y + dvn.x * distance
    };
    return {
        a: a,
        b: {
            x: a.x + dv.x,
            y: a.y + dv.y
        }
    };
};
exports.parallel = parallel;
/**
 * Scales a line from its midpoint
 *
 * @example Shorten by 50%, anchored at the midpoint
 * ```js
 * import { Lines } from 'https://unpkg.com/ixfx/dist/geometry.js'
 * const l = {
 *  a: {x:50, y:50}, b: {x: 100, y: 90}
 * }
 * const l2 = Lines.scaleFromMidpoint(l, 0.5);
 * ```
 * @param line
 * @param factor
 */
var scaleFromMidpoint = function (line, factor) {
    var a = interpolate(factor / 2, line);
    var b = interpolate(0.5 + factor / 2, line);
    return { a: a, b: b };
};
exports.scaleFromMidpoint = scaleFromMidpoint;
/**
 * Calculates `y` where `line` intersects `x`.
 * @param line Line to extend
 * @param x Intersection of x-axis.
 */
var pointAtX = function (line, x) {
    var y = line.a.y + (x - line.a.x) * (0, exports.slope)(line);
    return Object.freeze({ x: x, y: y });
};
exports.pointAtX = pointAtX;
/**
 * Returns a line extended from its `a` point by a specified distance
 *
 * ```js
 * import { Lines } from 'https://unpkg.com/ixfx/dist/geometry.js'
 * const line = {a: {x: 0, y:0}, b: {x:10, y:10} }
 * const extended = Lines.extendFromA(line, 2);
 * ```
 * @param line
 * @param distance
 * @return Newly extended line
 */
var extendFromA = function (line, distance) {
    var len = length(line);
    return Object.freeze(__assign(__assign({}, line), { a: line.a, b: Object.freeze({
            x: line.b.x + (line.b.x - line.a.x) / len * distance,
            y: line.b.y + (line.b.y - line.a.y) / len * distance
        }) }));
};
exports.extendFromA = extendFromA;
/**
 * Yields every integer point along `line`.
 *
 * @example Basic usage
 * ```js
 * import { Lines } from 'https://unpkg.com/ixfx/dist/geometry.js'
 * const l = { a: {x: 0, y: 0}, b: {x: 100, y: 100} };
 * for (const p of Lines.pointsOf(l)) {
 *  // Do something with point `p`...
 * }
 * ```
 *
 * Some precision is lost as start and end
 * point is also returned as an integer.
 *
 * Uses [Bresenham's line algorithm](https://en.wikipedia.org/wiki/Bresenham%27s_line_algorithm)
 * @param line Line
 */
//eslint-disable-next-line func-style
function pointsOf(line) {
    var a, b, x0, y0, x1, y1, dx, dy, sx, sy, err, e2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                a = line.a, b = line.b;
                x0 = Math.floor(a.x);
                y0 = Math.floor(a.y);
                x1 = Math.floor(b.x);
                y1 = Math.floor(b.y);
                dx = Math.abs(x1 - x0);
                dy = -Math.abs(y1 - y0);
                sx = x0 < x1 ? 1 : -1;
                sy = y0 < y1 ? 1 : -1;
                err = dx + dy;
                _a.label = 1;
            case 1:
                if (!true) return [3 /*break*/, 3];
                return [4 /*yield*/, { x: x0, y: y0 }];
            case 2:
                _a.sent();
                if (x0 === x1 && y0 === y1)
                    return [3 /*break*/, 3];
                e2 = 2 * err;
                if (e2 >= dy) {
                    err += dy;
                    x0 += sx;
                }
                if (e2 <= dx) {
                    err += dx;
                    y0 += sy;
                }
                return [3 /*break*/, 1];
            case 3: return [2 /*return*/];
        }
    });
}
exports.pointsOf = pointsOf;
/**
 * Returns the distance of `point` to the
 * nearest point on `line`.
 *
 * ```js
 * import { Lines } from 'https://unpkg.com/ixfx/dist/geometry.js'
 * const d = Lines.distance(line, {x:10,y:10});
 * ```
 *
 * If an array of lines is provided, the shortest distance is returned.
 * @param line Line (or array of lines)
 * @param point Point to check against
 * @returns Distance
 */
var distance = function (line, point) {
    if (Array.isArray(line)) {
        var distances = line.map(function (l) { return distanceSingleLine(l, point); });
        return (0, NumericArrays_js_1.minFast)(distances);
    }
    else {
        return distanceSingleLine(line, point);
    }
};
exports.distance = distance;
/**
 * Returns the distance of `point` to the nearest point on `line`
 *
 * ```js
 * import { Lines } from 'https://unpkg.com/ixfx/dist/geometry.js'
 * const distance = Lines.distanceSingleLine(line, pt);
 * ```
 * @param line Line
 * @param point Target point
 * @returns
 */
var distanceSingleLine = function (line, point) {
    (0, exports.guard)(line, "line");
    (0, Point_js_1.guard)(point, "point");
    if (length(line) === 0) {
        // Line is really a point
        return length(line.a, point);
    }
    var near = (0, exports.nearest)(line, point);
    return length(near, point);
};
/**
 * Calculates a point in-between a line's start and end points.
 *
 * @param amount Interpolation amount
 * @param aOrLine Line, or first point
 * @param pointBOrAllowOverflow Second point (if needed) or allowOverflow.
 * @param allowOverflow If true, interpolation amount is permitted to exceed 0..1, extending the line.
 * @returns
 */
//eslint-disable-next-line func-style
function interpolate(amount, aOrLine, pointBOrAllowOverflow, allowOverflow) {
    if (typeof pointBOrAllowOverflow === "boolean") {
        allowOverflow = pointBOrAllowOverflow;
        pointBOrAllowOverflow = undefined;
    }
    if (!allowOverflow)
        (0, Guards_js_1.percent)(amount, "amount");
    else
        (0, Guards_js_1.number)(amount, "", "amount");
    var _a = (0, exports.getPointsParam)(aOrLine, pointBOrAllowOverflow), a = _a[0], b = _a[1];
    var d = length(a, b);
    var d2 = d * (1 - amount);
    // Points are identical, return a copy of b
    if (d === 0 && d2 === 0)
        return Object.freeze(__assign({}, b));
    var x = b.x - (d2 * (b.x - a.x) / d);
    var y = b.y - (d2 * (b.y - a.y) / d);
    return Object.freeze(__assign(__assign({}, b), { x: x, y: y }));
}
exports.interpolate = interpolate;
/**
 * Returns a string representation of a line or two points.
 * @param a
 * @param b
 * @returns
 */
//eslint-disable-next-line func-style
function toString(a, b) {
    if ((0, exports.isLine)(a)) {
        (0, exports.guard)(a, "a");
        b = a.b;
        a = a.a;
    }
    else if (b === undefined)
        throw new Error("Expect second point if first is a point");
    return index_js_2.Points.toString(a) + "-" + index_js_2.Points.toString(b);
}
exports.toString = toString;
/**
 * Returns a line from a basis of coordinates (x1, y1, x2, y2)
 *
 * ```js
 * import { Lines } from 'https://unpkg.com/ixfx/dist/geometry.js'
 * // Line from 0,1 -> 10,15
 * Lines.fromNumbers(0, 1, 10, 15);
 * ```
 * @param x1
 * @param y1
 * @param x2
 * @param y2
 * @returns
 */
var fromNumbers = function (x1, y1, x2, y2) {
    if (Number.isNaN(x1))
        throw new Error("x1 is NaN");
    if (Number.isNaN(x2))
        throw new Error("x2 is NaN");
    if (Number.isNaN(y1))
        throw new Error("y1 is NaN");
    if (Number.isNaN(y2))
        throw new Error("y2 is NaN");
    var a = { x: x1, y: y1 };
    var b = { x: x2, y: y2 };
    return (0, exports.fromPoints)(a, b);
};
exports.fromNumbers = fromNumbers;
/**
 * Returns an array representation of line: [a.x, a.y, b.x, b.y]
 *
 * See {@link fromFlatArray} to create a line _from_ this representation.
 *
 * ```js
 * import { Lines } from 'https://unpkg.com/ixfx/dist/geometry.js'
 * Lines.toFlatArray(line);
 * Lines.toFlatArray(pointA, pointB);
 * ```
 * @export
 * @param {Point} a
 * @param {Point} b
 * @returns {number[]}
 */
var toFlatArray = function (a, b) {
    if ((0, exports.isLine)(a)) {
        return [a.a.x, a.a.y, a.b.x, a.b.y];
    }
    else if (index_js_2.Points.isPoint(a) && index_js_2.Points.isPoint(b)) {
        return [a.x, a.y, b.x, b.y];
    }
    else {
        throw new Error("Expected single line parameter, or a and b points");
    }
};
exports.toFlatArray = toFlatArray;
/**
 * Yields all the points of all the lines.
 *
 * ```js
 * const lines = [ ..some array of lines.. ];
 * for (const pt of Lines.asPoints(lines)) {
 *  // Yields a and then b of each point sequentially
 * }
 * ```
 * @param lines
 */
//eslint-disable-next-line func-style
function asPoints(lines) {
    var _i, lines_1, l;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _i = 0, lines_1 = lines;
                _a.label = 1;
            case 1:
                if (!(_i < lines_1.length)) return [3 /*break*/, 5];
                l = lines_1[_i];
                return [4 /*yield*/, l.a];
            case 2:
                _a.sent();
                return [4 /*yield*/, l.b];
            case 3:
                _a.sent();
                _a.label = 4;
            case 4:
                _i++;
                return [3 /*break*/, 1];
            case 5: return [2 /*return*/];
        }
    });
}
exports.asPoints = asPoints;
/**
 * Returns an SVG description of line
 * ```
 * import { Lines } from 'https://unpkg.com/ixfx/dist/geometry.js';
 * Lines.toSvgString(ptA, ptB);
 * ```
 * @param a
 * @param b
 * @returns
 */
var toSvgString = function (a, b) { return ["M".concat(a.x, " ").concat(a.y, " L ").concat(b.x, " ").concat(b.y)]; };
exports.toSvgString = toSvgString;
/**
 * Returns a line from four numbers [x1,y1,x2,y2].
 *
 * See {@link toFlatArray} to create an array from a line.
 *
 * ```js
 * import { Lines } from 'https://unpkg.com/ixfx/dist/geometry.js'
 * const line = Lines.fromFlatArray(...[0, 0, 100, 100]);
 * // line is {a: { x:0, y:0 }, b: { x: 100, y: 100 } }
 * ```
 * @param arr Array in the form [x1,y1,x2,y2]
 * @returns Line
 */
var fromFlatArray = function (arr) {
    if (!Array.isArray(arr))
        throw new Error("arr parameter is not an array");
    if (arr.length !== 4)
        throw new Error("array is expected to have length four");
    return (0, exports.fromNumbers)(arr[0], arr[1], arr[2], arr[3]);
};
exports.fromFlatArray = fromFlatArray;
/**
 * Returns a line from two points
 *
 * ```js
 * import { Lines } from 'https://unpkg.com/ixfx/dist/geometry.js'
 * // Line from 0,1 to 10,15
 * const line = Lines.fromPoints( { x:0, y:1 }, { x:10, y:15 });
 * // line is: { a: { x: 0, y: 1}, b: { x: 10, y: 15 } };
 * ```
 * @param a Start point
 * @param b End point
 * @returns
 */
var fromPoints = function (a, b) {
    (0, Point_js_1.guard)(a, "a");
    (0, Point_js_1.guard)(b, "b");
    a = Object.freeze(__assign({}, a));
    b = Object.freeze(__assign({}, b));
    return Object.freeze({
        a: a,
        b: b
    });
};
exports.fromPoints = fromPoints;
/**
 * Returns an array of lines that connects provided points. Note that line is not closed.
 *
 * Eg, if points a,b,c are provided, two lines are provided: a->b and b->c.
 *
 * ```js
 * import { Lines } from 'https://unpkg.com/ixfx/dist/geometry.js'
 * const lines = Lines.joinPointsToLines(ptA, ptB, ptC);
 * // lines is an array of, well, lines
 * ```
 * @param points
 * @returns
 */
var joinPointsToLines = function () {
    var points = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        points[_i] = arguments[_i];
    }
    var lines = [];
    //eslint-disable-next-line functional/no-let
    var start = points[0];
    //eslint-disable-next-line functional/no-let
    for (var i = 1; i < points.length; i++) {
        //eslint-disable-next-line functional/immutable-data
        lines.push((0, exports.fromPoints)(start, points[i]));
        start = points[i];
    }
    return lines;
};
exports.joinPointsToLines = joinPointsToLines;
/**
 * Returns a {@link LinePath} from two points
 *
 * ```js
 * import { Lines } from 'https://unpkg.com/ixfx/dist/geometry.js'
 * const path = Lines.fromPointsToPath(ptA, ptB);
 * ```
 * @param a
 * @param b
 * @returns
 */
var fromPointsToPath = function (a, b) { return (0, exports.toPath)((0, exports.fromPoints)(a, b)); };
exports.fromPointsToPath = fromPointsToPath;
/**
 * Returns a rectangle that encompasses dimension of line
 *
 * ```js
 * import { Lines } from 'https://unpkg.com/ixfx/dist/geometry.js';
 * const rect = Lines.bbox(line);
 * ```
 */
var bbox = function (line) { return index_js_2.Points.bbox(line.a, line.b); };
exports.bbox = bbox;
/**
 * Returns a path wrapper around a line instance. This is useful if there are a series
 * of operations you want to do with the same line because you don't have to pass it
 * in as an argument to each function.
 *
 * Note that the line is immutable, so a function like `sum` returns a new LinePath,
 * wrapping the result of `sum`.
 *
 * ```js
 * import { Lines } from 'https://unpkg.com/ixfx/dist/geometry.js'
 * // Create a path
 * const l = Lines.toPath(fromNumbers(0,0,10,10));
 *
 * // Now we can use it...
 * l.length();
 *
 * // Mutate functions return a new path
 * const ll = l.sum({x:10,y:10});
 * ll.length();
 * ```
 * @param line
 * @returns
 */
var toPath = function (line) {
    var a = line.a, b = line.b;
    return Object.freeze(__assign(__assign({}, line), { length: function () { return length(a, b); }, interpolate: function (amount) { return interpolate(amount, a, b); }, bbox: function () { return (0, exports.bbox)(line); }, toString: function () { return toString(a, b); }, toFlatArray: function () { return (0, exports.toFlatArray)(a, b); }, toSvgString: function () { return (0, exports.toSvgString)(a, b); }, toPoints: function () { return [a, b]; }, rotate: function (amountRadian, origin) { return (0, exports.toPath)((0, exports.rotate)(line, amountRadian, origin)); }, sum: function (point) { return (0, exports.toPath)((0, exports.sum)(line, point)); }, divide: function (point) { return (0, exports.toPath)((0, exports.divide)(line, point)); }, multiply: function (point) { return (0, exports.toPath)((0, exports.multiply)(line, point)); }, subtract: function (point) { return (0, exports.toPath)((0, exports.subtract)(line, point)); }, midpoint: function () { return (0, exports.midpoint)(a, b); }, distance: function (point) { return distanceSingleLine(line, point); }, parallel: function (distance) { return (0, exports.parallel)(line, distance); }, perpendicularPoint: function (distance, amount) { return (0, exports.perpendicularPoint)(line, distance, amount); }, slope: function () { return (0, exports.slope)(line); }, withinRange: function (point, maxRange) { return (0, exports.withinRange)(line, point, maxRange); }, isEqual: function (otherLine) { return (0, exports.isEqual)(line, otherLine); }, apply: function (fn) { return (0, exports.toPath)((0, exports.apply)(line, fn)); }, kind: "line" }));
};
exports.toPath = toPath;
/**
 * Returns a line that is rotated by `angleRad`. By default it rotates
 * around its center, but an arbitrary `origin` point can be provided.
 * If `origin` is a number, it's presumed to be a 0..1 percentage of the line.
 *
 * ```js
 * import { Lines } from 'https://unpkg.com/ixfx/dist/geometry.js'
 *
 * // Rotates line by 0.1 radians around point 10,10
 * const r = Lines.rotate(line, 0.1, {x:10,y:10});
 *
 * // Rotate line by 5 degrees around its center
 * const r = Lines.rotate(line, degreeToRadian(5));
 *
 * // Rotate line by 5 degres around its end point
 * const r = Lines.rotate(line, degreeToRadian(5), line.b);
 *
 * // Rotate by 90 degrees at the 80% position
 * const r = Lines.rotated = rotate(line, Math.PI / 2, 0.8);
 * ```
 * @param line Line to rotate
 * @param amountRadian Angle in radians to rotate by
 * @param origin Point to rotate around. If undefined, middle of line will be used
 * @returns
 */
var rotate = function (line, amountRadian, origin) {
    if (amountRadian === undefined || amountRadian === 0)
        return line;
    if (origin === undefined)
        origin = 0.5;
    if (typeof origin === "number") {
        origin = interpolate(origin, line.a, line.b);
    }
    return Object.freeze(__assign(__assign({}, line), { a: index_js_2.Points.rotate(line.a, amountRadian, origin), b: index_js_2.Points.rotate(line.b, amountRadian, origin) }));
};
exports.rotate = rotate;
//# sourceMappingURL=Line.js.map