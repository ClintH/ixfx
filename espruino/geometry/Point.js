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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
exports.__esModule = true;
exports.clamp = exports.clampMagnitude = exports.toIntegerValues = exports.invert = exports.wrap = exports.random = exports.normaliseByRect = exports.normalise = exports.rotatePointArray = exports.rotate = exports.project = exports.compareByX = exports.compare = exports.convexHull = exports.divide = exports.multiply = exports.sum = exports.reduce = exports.pipeline = exports.pipelineApply = exports.apply = exports.subtract = exports.fromNumbers = exports.from = exports.interpolate = exports.withinRange = exports.isEqual = exports.toString = exports.toArray = exports.isPoint3d = exports.isPoint = exports.bbox = exports.centroid = exports.angle = exports.abs = exports.guardNonZeroPoint = exports.guard = exports.distanceToCenter = exports.distanceToExterior = exports.distance = exports.rightmost = exports.leftmost = exports.findMinimum = exports.isNull = exports.isPlaceholder = exports.isEmpty = exports.Placeholder = exports.Empty = exports.dotProduct = exports.getPointParam = void 0;
exports.relation = void 0;
var index_js_1 = require("./index.js");
var Line_js_1 = require("./Line.js");
var Guards_js_1 = require("../Guards.js");
var index_js_2 = require("../data/index.js");
var index_js_3 = require("../collections/index.js");
var Random_js_1 = require("../Random.js");
/**
 *
 * @ignore
 * @param a
 * @param b
 * @returns
 */
var getPointParam = function (a, b) {
    if (a === undefined)
        return { x: 0, y: 0 };
    if (index_js_1.Points.isPoint(a)) {
        return a;
    }
    else if (typeof a !== "number" || typeof b !== "number") {
        throw new Error("Expected point or x,y as parameters. Got: a: ".concat(JSON.stringify(a), " b: ").concat(JSON.stringify(b)));
    }
    else {
        return { x: a, y: b };
    }
};
exports.getPointParam = getPointParam;
var dotProduct = function () {
    var pts = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        pts[_i] = arguments[_i];
    }
    var a = pts.map(function (p) { return index_js_1.Points.toArray(p); });
    return index_js_3.Arrays.dotProduct(a);
};
exports.dotProduct = dotProduct;
/**
 * An empty point of `{ x:0, y:0 }`.
 *
 * Use `isEmpty` to check if a point is empty.
 */
//eslint-disable-next-line @typescript-eslint/naming-convention
exports.Empty = Object.freeze({ x: 0, y: 0 });
/**
 * Placeholder point, where x and y is `NaN`.
 * Use `isPlaceholder` to check if a point is a placeholder.
 */
//eslint-disable-next-line @typescript-eslint/naming-convention
exports.Placeholder = Object.freeze({ x: NaN, y: NaN });
/**
 * Returns true if both x and y is 0.
 * Use `Points.Empty` to return an empty point.
 * @param p
 * @returns
 */
var isEmpty = function (p) { return p.x === 0 && p.y === 0; };
exports.isEmpty = isEmpty;
/**
 * Returns true if point is a placeholder, where both x and y
 * are `NaN`.
 *
 * Use Points.Placeholder to return a placeholder point.
 * @param p
 * @returns
 */
var isPlaceholder = function (p) { return Number.isNaN(p.x) && Number.isNaN(p.y); };
exports.isPlaceholder = isPlaceholder;
/**
 * Returns true if p.x and p.y === null
 * @param p
 * @returns
 */
var isNull = function (p) { return p.x === null && p.y === null; };
exports.isNull = isNull;
/**
 * Returns the 'minimum' point from an array of points, using a comparison function.
 *
 * @example Find point closest to a coordinate
 * ```js
 * const points = [...];
 * const center = {x: 100, y: 100};
 *
 * const closestToCenter = findMinimum((a, b) => {
 *  const aDist = distance(a, center);
 *  const bDist = distance(b, center);
 *  if (aDistance < bDistance) return a;
 *  return b;
 * }, points);
 * ```
 * @param compareFn Compare function returns the smallest of `a` or `b`
 * @param points
 * @returns
 */
var findMinimum = function (compareFn) {
    var points = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        points[_i - 1] = arguments[_i];
    }
    if (points.length === 0)
        throw new Error("No points provided");
    //eslint-disable-next-line functional/no-let
    var min = points[0];
    points.forEach(function (p) {
        min = compareFn(min, p);
    });
    return min;
};
exports.findMinimum = findMinimum;
/**
 * Returns the left-most of the provided points.
 *
 * Same as:
 * ```js
 * findMinimum((a, b) => {
 *  if (a.x <= b.x) return a;
 *  return b;
 *}, ...points)
 * ```
 *
 * @param points
 * @returns
 */
var leftmost = function () {
    var points = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        points[_i] = arguments[_i];
    }
    return exports.findMinimum.apply(void 0, __spreadArray([function (a, b) { return ((a.x <= b.x) ? a : b); }], points, false));
};
exports.leftmost = leftmost;
/**
 * Returns the right-most of the provided points.
 *
 * Same as:
 * ```js
 * findMinimum((a, b) => {
 *  if (a.x >= b.x) return a;
 *  return b;
 *}, ...points)
 * ```
 *
 * @param points
 * @returns
 */
var rightmost = function () {
    var points = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        points[_i] = arguments[_i];
    }
    return exports.findMinimum.apply(void 0, __spreadArray([function (a, b) { return ((a.x >= b.x) ? a : b); }], points, false));
};
exports.rightmost = rightmost;
/**
 * Calculate distance between two points
 * @param a
 * @param b
 * @returns
 */
//eslint-disable-next-line func-style
function distance(a, xOrB, y) {
    var pt = (0, exports.getPointParam)(xOrB, y);
    (0, exports.guard)(pt);
    return Math.hypot(pt.x - a.x, pt.y - a.y);
}
exports.distance = distance;
/**
 * Returns the distance from point `a` to the exterior of `shape`.
 *
 * @example Distance from point to rectangle
 * ```
 * const distance = distanceToExterior(
 *  {x: 50, y: 50},
 *  {x: 100, y: 100, width: 20, height: 20}
 * );
 * ```
 *
 * @example Find closest shape to point
 * ```
 * import {minIndex} from '../collections/arrays.js';
 * const shapes = [ some shapes... ]; // Shapes to compare against
 * const pt = { x: 10, y: 10 };       // Comparison point
 * const distances = shapes.map(v => distanceToExterior(pt, v));
 * const closest = shapes[minIndex(...distances)];
 * ```
 * @param a Point
 * @param shape Point, or a positioned Rect or Circle.
 * @returns
 */
var distanceToExterior = function (a, shape) {
    if (index_js_1.Rects.isRectPositioned(shape)) {
        return index_js_1.Rects.distanceFromExterior(shape, a);
    }
    if (index_js_1.Circles.isCirclePositioned(shape)) {
        return index_js_1.Circles.distanceFromExterior(shape, a);
    }
    if ((0, exports.isPoint)(shape))
        return distance(a, shape);
    throw new Error("Unknown shape");
};
exports.distanceToExterior = distanceToExterior;
/**
 * Returns the distance from point `a` to the center of `shape`.
 * @param a Point
 * @param shape Point, or a positioned Rect or Circle.
 * @returns
 */
var distanceToCenter = function (a, shape) {
    if (index_js_1.Rects.isRectPositioned(shape)) {
        return index_js_1.Rects.distanceFromExterior(shape, a);
    }
    if (index_js_1.Circles.isCirclePositioned(shape)) {
        return index_js_1.Circles.distanceFromExterior(shape, a);
    }
    if ((0, exports.isPoint)(shape))
        return distance(a, shape);
    throw new Error("Unknown shape");
};
exports.distanceToCenter = distanceToCenter;
/**
 * Throws an error if point is invalid
 * @param p
 * @param name
 */
var guard = function (p, name) {
    if (name === void 0) { name = "Point"; }
    if (p === undefined)
        throw new Error("'".concat(name, "' is undefined. Expected {x,y} got ").concat(JSON.stringify(p)));
    if (p === null)
        throw new Error("'".concat(name, "' is null. Expected {x,y} got ").concat(JSON.stringify(p)));
    if (p.x === undefined)
        throw new Error("'".concat(name, ".x' is undefined. Expected {x,y} got ").concat(JSON.stringify(p)));
    if (p.y === undefined)
        throw new Error("'".concat(name, ".y' is undefined. Expected {x,y} got ").concat(JSON.stringify(p)));
    if (typeof p.x !== "number")
        throw new Error("'".concat(name, ".x' must be a number. Got ").concat(p.x));
    if (typeof p.y !== "number")
        throw new Error("'".concat(name, ".y' must be a number. Got ").concat(p.y));
    if (p.x === null)
        throw new Error("'".concat(name, ".x' is null"));
    if (p.y === null)
        throw new Error("'".concat(name, ".y' is null"));
    if (Number.isNaN(p.x))
        throw new Error("'".concat(name, ".x' is NaN"));
    if (Number.isNaN(p.y))
        throw new Error("'".concat(name, ".y' is NaN"));
};
exports.guard = guard;
/**
 * Throws if parameter is not a valid point, or either x or y is 0
 * @param pt
 * @returns
 */
var guardNonZeroPoint = function (pt, name) {
    if (name === void 0) { name = "pt"; }
    (0, exports.guard)(pt, name);
    (0, Guards_js_1.number)(pt.x, "nonZero", "".concat(name, ".x"));
    (0, Guards_js_1.number)(pt.y, "nonZero", "".concat(name, ".y"));
    return true;
};
exports.guardNonZeroPoint = guardNonZeroPoint;
/**
 * Returns a point with Math.abs applied to x and y.
 * ```js
 * Points.abs({ x:1,  y:1  }); // { x: 1, y: 1 }
 * Points.abs({ x:-1, y:1  }); // { x: 1, y: 1 }
 * Points.abs({ x:-1, y:-1 }); // { x: 1, y: 1 }
 * ```
 * @param pt
 * @returns
 */
var abs = function (pt) { return (__assign(__assign({}, pt), { x: Math.abs(pt.x), y: Math.abs(pt.y) })); };
exports.abs = abs;
/**
 * Returns the angle in radians between `a` and `b`.
 *
 * Eg if `a` is the origin, and `b` is another point,
 * in degrees one would get 0 to -180 when `b` was above `a`.
 *  -180 would be `b` in line with `a`.
 * Same for under `a`.
 *
 * Providing a third point `c` gives the interior angle, where `b` is the middle point.
 * @param a
 * @param b
 * @param c
 * @returns
 */
var angle = function (a, b, c) {
    if (b === undefined) {
        return Math.atan2(a.y, a.x);
    }
    else if (c !== undefined) {
        return Math.atan2(b.y - a.y, b.x - a.x) - Math.atan2(c.y - a.y, c.x - a.x);
    }
    return Math.atan2(b.y - a.y, b.x - a.x);
};
exports.angle = angle;
/**
 * Calculates the [centroid](https://en.wikipedia.org/wiki/Centroid#Of_a_finite_set_of_points) of a set of points
 *
 * ```js
 * // Find centroid of a list of points
 * const c1 = centroid(p1, p2, p3, ...);
 *
 * // Find centroid of an array of points
 * const c2 = centroid(...pointsArray);
 * ```
 * @param points
 * @returns A single point
 */
var centroid = function () {
    var points = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        points[_i] = arguments[_i];
    }
    if (!Array.isArray(points))
        throw new Error("Expected list of points");
    var sum = points.reduce(function (prev, p) {
        if (p === undefined)
            return prev; // Ignore undefined
        if (Array.isArray(p))
            throw new Error("'points' list contains an array. Did you mean: centroid(...myPoints)?");
        if (!(0, exports.isPoint)(p))
            throw new Error("'points' contains something which is not a point: ".concat(JSON.stringify(p)));
        return {
            x: prev.x + p.x,
            y: prev.y + p.y
        };
    }, { x: 0, y: 0 });
    return Object.freeze({
        x: sum.x / points.length,
        y: sum.y / points.length
    });
};
exports.centroid = centroid;
/**
 * Returns the minimum rectangle that can enclose all provided points
 * @param points
 * @returns
 */
var bbox = function () {
    var points = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        points[_i] = arguments[_i];
    }
    var leftMost = exports.findMinimum.apply(void 0, __spreadArray([function (a, b) {
            if (a.x < b.x)
                return a;
            else
                return b;
        }], points, false));
    var rightMost = exports.findMinimum.apply(void 0, __spreadArray([function (a, b) {
            if (a.x > b.x)
                return a;
            else
                return b;
        }], points, false));
    var topMost = exports.findMinimum.apply(void 0, __spreadArray([function (a, b) {
            if (a.y < b.y)
                return a;
            else
                return b;
        }], points, false));
    var bottomMost = exports.findMinimum.apply(void 0, __spreadArray([function (a, b) {
            if (a.y > b.y)
                return a;
            else
                return b;
        }], points, false));
    var topLeft = { x: leftMost.x, y: topMost.y };
    var topRight = { x: rightMost.x, y: topMost.y };
    var bottomRight = { x: rightMost.x, y: bottomMost.y };
    var bottomLeft = { x: leftMost.x, y: bottomMost.y };
    return index_js_1.Rects.maxFromCorners(topLeft, topRight, bottomRight, bottomLeft);
};
exports.bbox = bbox;
/**
 * Returns _true_ if the parameter has x and y fields
 * @param p
 * @returns
 */
var isPoint = function (p) {
    if (p === undefined)
        return false;
    if (p === null)
        return false;
    if (p.x === undefined)
        return false;
    if (p.y === undefined)
        return false;
    return true;
};
exports.isPoint = isPoint;
var isPoint3d = function (p) {
    if (p === undefined)
        return false;
    if (p === null)
        return false;
    if (p.x === undefined)
        return false;
    if (p.y === undefined)
        return false;
    if (p.z === undefined)
        return false;
    return true;
};
exports.isPoint3d = isPoint3d;
/**
 * Returns point as an array in the form [x,y]. This can be useful for some libraries
 * that expect points in array form.
 *
 * ```
 * const p = {x: 10, y:5};
 * const p2 = toArray(p); // yields [10,5]
 * ```
 * @param p
 * @returns
 */
var toArray = function (p) { return ([p.x, p.y]); };
exports.toArray = toArray;
/**
 * Returns a human-friendly string representation `(x, y)`.
 * If `precision` is supplied, this will be the number of significant digits.
 * @param p
 * @returns
 */
var toString = function (p, digits) {
    if (p === undefined)
        return "(undefined)";
    if (p === null)
        return "(null)";
    var x = digits ? p.x.toFixed(digits) : p.x;
    var y = digits ? p.y.toFixed(digits) : p.y;
    if (p.z !== undefined) {
        var z = digits ? p.z.toFixed(digits) : p.z;
        return "(".concat(x, ",").concat(y, ",").concat(z, ")");
    }
    else {
        return "(".concat(x, ",").concat(y, ")");
    }
};
exports.toString = toString;
/**
 * Returns _true_ if the points have identical values
 *
 * ```js
 * const a = {x: 10, y: 10};
 * const b = {x: 10, y: 10;};
 * a === b        // False, because a and be are different objects
 * isEqual(a, b)   // True, because a and b are same value
 * ```
 * @param a
 * @param b
 * @returns _True_ if points are equal
 */
var isEqual = function () {
    var p = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        p[_i] = arguments[_i];
    }
    if (p === undefined)
        throw new Error("parameter 'p' is undefined");
    if (p.length < 2)
        return true;
    //eslint-disable-next-line functional/no-let
    for (var i = 1; i < p.length; i++) {
        if (p[i].x !== p[0].x)
            return false;
        if (p[i].y !== p[0].y)
            return false;
    }
    return true;
};
exports.isEqual = isEqual;
/**
 * Returns true if two points are within a specified range.
 * Provide a point for the range to set different x/y range, or pass a number
 * to use the same range for both axis.
 *
 * Note this simply compares x,y values it does not calcuate distance.
 *
 * @example
 * ```js
 * withinRange({x:100,y:100}, {x:101, y:101}, 1); // True
 * withinRange({x:100,y:100}, {x:105, y:101}, {x:5, y:1}); // True
 * withinRange({x:100,y:100}, {x:105, y:105}, {x:5, y:1}); // False - y axis too far
 * ```
 * @param a
 * @param b
 * @param maxRange
 * @returns
 */
var withinRange = function (a, b, maxRange) {
    if (typeof maxRange === "number") {
        maxRange = { x: maxRange, y: maxRange };
    }
    var x = Math.abs(b.x - a.x);
    var y = Math.abs(b.y - a.y);
    return (x <= maxRange.x && y <= maxRange.y);
};
exports.withinRange = withinRange;
/**
 * Returns a relative point between two points
 * ```js
 * interpolate(0.5, a, b); // Halfway point between a and b
 * ```
 *
 * Alias for Lines.interpolate(amount, a, b);
 *
 * @param amount Relative amount, 0-1
 * @param a
 * @param b
 * @param allowOverflow If true, length of line can be exceeded for `amount` of below 0 and above `1`.
 * @returns {@link Point}
 */
var interpolate = function (amount, a, b, allowOverflow) {
    if (allowOverflow === void 0) { allowOverflow = false; }
    return (0, Line_js_1.interpolate)(amount, a, b, allowOverflow);
}; //({x: (1-amt) * a.x + amt * b.x, y:(1-amt) * a.y + amt * b.y });
exports.interpolate = interpolate;
/**
 * Returns a point from two coordinates or an array of [x,y]
 * @example
 * ```js
 * let p = from([10, 5]); // yields {x:10, y:5}
 * let p = from(10, 5);   // yields {x:10, y:5}
 * let p = from(10);      // yields {x:10, y:0} 0 is used for default y
 * let p = from();        // yields {x:0, y:0}  0 used for default x & y
 * ```
 * @param xOrArray
 * @param [y]
 * @returns Point
 */
var from = function (xOrArray, y) {
    if (Array.isArray(xOrArray)) {
        if (xOrArray.length !== 2)
            throw new Error("Expected array of length two, got " + xOrArray.length);
        return Object.freeze({
            x: xOrArray[0],
            y: xOrArray[1]
        });
    }
    else {
        if (xOrArray === undefined)
            xOrArray = 0;
        else if (Number.isNaN(xOrArray))
            throw new Error("x is NaN");
        if (y === undefined)
            y = 0;
        else if (Number.isNaN(y))
            throw new Error("y is NaN");
        return Object.freeze({ x: xOrArray, y: y });
    }
};
exports.from = from;
/**
 * Returns an array of points from an array of numbers.
 *
 * Array can be a continuous series of x, y values:
 * ```
 * [1,2,3,4] would yield: [{x:1, y:2}, {x:3, y:4}]
 * ```
 *
 * Or it can be an array of arrays:
 * ```
 * [[1,2], [3,4]] would yield: [{x:1, y:2}, {x:3, y:4}]
 * ```
 * @param coords
 * @returns
 */
var fromNumbers = function () {
    var coords = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        coords[_i] = arguments[_i];
    }
    var pts = [];
    if (Array.isArray(coords[0])) {
        // [[x,y],[x,y]...]
        coords.forEach(function (coord) {
            if (!(coord.length % 2 === 0))
                throw new Error("coords array should be even-numbered");
            //eslint-disable-next-line  functional/immutable-data
            pts.push(Object.freeze({ x: coord[0], y: coord[1] }));
        });
    }
    else {
        // [x,y,x,y,x,y]
        if (coords.length % 2 !== 0)
            throw new Error("Expected even number of elements: [x,y,x,y...]");
        //eslint-disable-next-line functional/no-let
        for (var i = 0; i < coords.length; i += 2) {
            //eslint-disable-next-line  functional/immutable-data
            pts.push(Object.freeze({ x: coords[i], y: coords[i + 1] }));
        }
    }
    return pts;
};
exports.fromNumbers = fromNumbers;
//eslint-disable-next-line func-style
function subtract(a, b, c, d) {
    if ((0, exports.isPoint)(a)) {
        (0, exports.guard)(a, "a");
        if ((0, exports.isPoint)(b)) {
            (0, exports.guard)(b, "b");
            return Object.freeze({
                x: a.x - b.x,
                y: a.y - b.y
            });
        }
        else {
            if (c === undefined)
                c = b;
            return Object.freeze({
                x: a.x - b,
                y: a.y - c
            });
        }
    }
    else {
        (0, Guards_js_1.number)(a, "", "a");
        if (typeof b !== "number")
            throw new Error("Second parameter is expected to by y value");
        (0, Guards_js_1.number)(b, "", "b");
        if (Number.isNaN(c))
            throw new Error("Third parameter is NaN");
        if (Number.isNaN(d))
            throw new Error("Fourth parameter is NaN");
        if (c === undefined)
            c = 0;
        if (d === undefined)
            d = 0;
        return Object.freeze({
            x: a - c,
            y: b - d
        });
    }
}
exports.subtract = subtract;
/**
 * Applies `fn` on `x` and `y` fields, returning all other fields as well
 * ```js
 * const p = {x:1.234, y:4.9};
 * const p2 = apply(p, Math.round);
 * // Yields: {x:1, y:5}
 * ```
 *
 * The name of the field is provided as well. Here we only round the `x` field:
 *
 * ```js
 * const p = {x:1.234, y:4.9};
 * const p2 = apply(p, (v, field) => {
 *  if (field === `x`) return Math.round(v);
 *  return v;
 * });
 * ```
 * @param pt
 * @param fn
 * @returns
 */
var apply = function (pt, fn) { return (Object.freeze(__assign(__assign({}, pt), { x: fn(pt.x, "x"), y: fn(pt.y, "y") }))); };
exports.apply = apply;
/**
 * Runs a sequential series of functions on `pt`. The output from one feeding into the next.
 * ```js
 * const p = pipelineApply(somePoint, Points.normalise, Points.invert);
 * ```
 *
 * If you want to make a reusable pipeline of functions, consider {@link pipeline} instead.
 * @param pt
 * @param pipeline
 * @returns
 */
var pipelineApply = function (pt) {
    var pipelineFns = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        pipelineFns[_i - 1] = arguments[_i];
    }
    return exports.pipeline.apply(void 0, pipelineFns)(pt);
}; // pipeline.reduce((prev, curr) => curr(prev), pt);
exports.pipelineApply = pipelineApply;
/**
 * Returns a pipeline function that takes a point to be transformed through a series of functions
 * ```js
 * // Create pipeline
 * const p = pipeline(Points.normalise, Points.invert);
 *
 * // Now run it on `somePoint`.
 * // First we normalised, and then invert
 * const changedPoint = p(somePoint);
 * ```
 *
 * If you don't want to create a pipeline, use {@link pipelineApply}.
 * @param pipeline Pipeline of functions
 * @returns
 */
var pipeline = function () {
    var pipeline = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        pipeline[_i] = arguments[_i];
    }
    return function (pt) { return pipeline.reduce(function (prev, curr) { return curr(prev); }, pt); };
};
exports.pipeline = pipeline;
/**
 * Reduces over points, treating _x_ and _y_ separately.
 *
 * ```
 * // Sum x and y values
 * const total = reduce(points, (p, acc) => {
 *  return {x: p.x + acc.x, y: p.y + acc.y}
 * });
 * ```
 * @param pts Points to reduce
 * @param fn Reducer
 * @param initial Initial value, uses `{ x:0, y:0 }` by default
 * @returns
 */
var reduce = function (pts, fn, initial) {
    if (initial === void 0) { initial = { x: 0, y: 0 }; }
    //eslint-disable-next-line functional/no-let
    var acc = initial;
    pts.forEach(function (p) {
        acc = fn(p, acc);
    });
    return acc;
};
exports.reduce = reduce;
/**
 * Returns a Point of `a` plus `b`. ie:
 *
 * ```js
 * return {
 *   x: a.x + b.x,
 *   y: a.y + b.y
 * };
 * ```
 *
 * Usage:
 *
 * ```js
 * sum(ptA, ptB);
 * sum(x1, y1, x2, y2);
 * sum(ptA, x2, y2);
 * sum(ptA, xAndY);
 * ```
 */
var sum = function (a, b, c, d) {
    // ✔️ Unit tested
    if (a === undefined)
        throw new Error("a missing. a: ".concat(a));
    //eslint-disable-next-line functional/no-let
    var ptA;
    //eslint-disable-next-line functional/no-let
    var ptB;
    if ((0, exports.isPoint)(a)) {
        ptA = a;
        if (b === undefined)
            b = exports.Empty;
        if ((0, exports.isPoint)(b)) {
            ptB = b;
        }
        else {
            if (b === undefined)
                throw new Error("Expects x coordinate");
            ptB = { x: b, y: (c === undefined ? b : c) };
        }
    }
    else if (!(0, exports.isPoint)(b)) {
        // Neither of first two params are points
        if (b === undefined)
            throw new Error("Expected number as second param");
        ptA = { x: a, y: b };
        if (c === undefined)
            throw new Error("Expects x coordiante");
        ptB = { x: c, y: (d === undefined ? 0 : d) };
    }
    if (ptA === undefined)
        throw new Error("ptA missing. a: ".concat(a));
    if (ptB === undefined)
        throw new Error("ptB missing. b: ".concat(b));
    (0, exports.guard)(ptA, "a");
    (0, exports.guard)(ptB, "b");
    return Object.freeze({
        x: ptA.x + ptB.x,
        y: ptA.y + ptB.y
    });
};
exports.sum = sum;
/**
 * Returns `a` multiplied by `b` point, or given x and y.
 * ie.
 * ```js
 * return {
 *   x: a.x * b.x,
 *   y: a.y * b.y
 * };
 * ```
 * @param a
 * @param bOrX
 * @param y
 * @returns
 */
/* eslint-disable func-style */
function multiply(a, bOrX, y) {
    // ✔️ Unit tested
    (0, exports.guard)(a, "a");
    if (typeof bOrX === "number") {
        if (typeof y === "undefined")
            y = bOrX;
        (0, Guards_js_1.number)(y, "", "y");
        (0, Guards_js_1.number)(bOrX, "", "x");
        return Object.freeze({ x: a.x * bOrX, y: a.y * y });
    }
    else if ((0, exports.isPoint)(bOrX)) {
        (0, exports.guard)(bOrX, "b");
        return Object.freeze({
            x: a.x * bOrX.x,
            y: a.y * bOrX.y
        });
    }
    else if (index_js_1.Rects.isRect(bOrX)) {
        index_js_1.Rects.guard(bOrX, "rect");
        return Object.freeze({
            x: a.x * bOrX.width,
            y: a.y * bOrX.height
        });
    }
    else
        throw new Error("Invalid arguments. a: ".concat(JSON.stringify(a), " b: ").concat(JSON.stringify(bOrX)));
}
exports.multiply = multiply;
/**
 * Devides a from b. If a contains a zero, that axis will be returned as zero
 * @param a
 * @param b
 * @param c
 * @param d
 * @returns
 */
function divide(a, b, c, d) {
    // ✔️ Unit tested
    if ((0, exports.isPoint)(a)) {
        (0, exports.guard)(a, "a");
        if ((0, exports.isPoint)(b)) {
            (0, exports.guardNonZeroPoint)(b);
            return Object.freeze({
                x: a.x / b.x,
                y: a.y / b.y
            });
        }
        else if (index_js_1.Rects.isRect(b)) {
            index_js_1.Rects.guard(b, "rect");
            return Object.freeze({
                x: a.x / b.width,
                y: a.y / b.height
            });
        }
        else {
            if (c === undefined)
                c = b;
            (0, exports.guard)(a);
            (0, Guards_js_1.number)(b, "nonZero", "x");
            (0, Guards_js_1.number)(c, "nonZero", "y");
            return Object.freeze({
                x: a.x / b,
                y: a.y / c
            });
        }
    }
    else {
        if (typeof b !== "number")
            throw new Error("expected second parameter to be y1 coord");
        (0, Guards_js_1.number)(a, "positive", "x1");
        (0, Guards_js_1.number)(b, "positive", "y1");
        if (c === undefined)
            c = 1;
        if (d === undefined)
            d = c;
        (0, Guards_js_1.number)(c, "nonZero", "x2");
        (0, Guards_js_1.number)(d, "nonZero", "y2");
        return Object.freeze({
            x: a / c,
            y: b / d
        });
    }
}
exports.divide = divide;
/**
 * Simple convex hull impementation. Returns a set of points which
 * enclose `pts`.
 *
 * For more power, see something like [Hull.js](https://github.com/AndriiHeonia/hull)
 * @param pts
 * @returns
 */
var convexHull = function () {
    var pts = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        pts[_i] = arguments[_i];
    }
    var sorted = __spreadArray([], pts, true).sort(exports.compareByX);
    if (sorted.length === 1)
        return sorted;
    var x = function (points) {
        var v = [];
        points.forEach(function (p) {
            while (v.length >= 2) {
                var q = v[v.length - 1];
                var r = v[v.length - 2];
                if ((q.x - r.x) * (p.y - r.y) >= (q.y - r.y) * (p.x - r.x)) {
                    //eslint-disable-next-line functional/immutable-data
                    v.pop();
                }
                else
                    break;
            }
            //eslint-disable-next-line functional/immutable-data
            v.push(p);
        });
        //eslint-disable-next-line functional/immutable-data
        v.pop();
        return v;
    };
    var upper = x(sorted);
    //eslint-disable-next-line functional/immutable-data
    var lower = x(sorted.reverse());
    if (upper.length === 1 && lower.length === 1 && (0, exports.isEqual)(lower[0], upper[0]))
        return upper;
    return upper.concat(lower);
};
exports.convexHull = convexHull;
/**
 * Returns -2 if both x & y of a is less than b
 * Returns -1 if either x/y of a is less than b
 *
 * Returns 2 if both x & y of a is greater than b
 * Returns 1 if either x/y of a is greater than b's x/y
 *
 * Returns 0 if x/y of a and b are equal
 * @param a
 * @param b
 * @returns
 */
var compare = function (a, b) {
    if (a.x < b.x && a.y < b.y)
        return -2;
    if (a.x > b.x && a.y > b.y)
        return 2;
    if (a.x < b.x || a.y < b.y)
        return -1;
    if (a.x > b.x || a.y > b.y)
        return 1;
    if (a.x === b.x && a.x === b.y)
        return 0;
    return NaN;
};
exports.compare = compare;
var compareByX = function (a, b) { return a.x - b.x || a.y - b.y; };
exports.compareByX = compareByX;
/**
 * Project `origin` by `distance` and `angle` (radians).
 *
 * To figure out rotation, imagine a horizontal line running through `origin`.
 * * Rotation = 0 deg puts the point on the right of origin, on same y-axis
 * * Rotation = 90 deg/3:00 puts the point below origin, on the same x-axis
 * * Rotation = 180 deg/6:00 puts the point on the left of origin on the same y-axis
 * * Rotation = 270 deg/12:00 puts the point above the origin, on the same x-axis
 *
 * ```js
 * // Yields a point 100 units away from 10,20 with 10 degrees rotation (ie slightly down)
 * const a = Points.project({x:10, y:20}, 100, degreeToRadian(10));
 * ```
 * @param origin
 * @param distance
 * @param angle
 * @returns
 */
var project = function (origin, distance, angle) {
    var x = (Math.cos(angle) * distance) + origin.x;
    var y = (Math.sin(angle) * distance) + origin.y;
    return { x: x, y: y };
};
exports.project = project;
function rotate(pt, amountRadian, origin) {
    if (origin === undefined)
        origin = { x: 0, y: 0 };
    (0, exports.guard)(origin, "origin");
    (0, Guards_js_1.number)(amountRadian, "", "amountRadian");
    var arrayInput = Array.isArray(pt);
    // no-op
    if (amountRadian === 0)
        return pt;
    if (!arrayInput) {
        pt = [pt];
    }
    var ptAr = pt;
    ptAr.forEach(function (p, index) { return (0, exports.guard)(p, "pt[".concat(index, "]")); });
    //eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    var asPolar = ptAr.map(function (p) { return index_js_1.Polar.fromCartesian(p, origin); });
    var rotated = asPolar.map(function (p) { return index_js_1.Polar.rotate(p, amountRadian); });
    var asCartesisan = rotated.map(function (p) { return index_js_1.Polar.toCartesian(p, origin); });
    if (arrayInput)
        return asCartesisan;
    else
        return asCartesisan[0];
    //const p = Polar.fromCartesian(pt, origin);
    //const pp = Polar.rotate(p, amountRadian);
    //return Polar.toCartesian(pp, origin);
}
exports.rotate = rotate;
//eslint-disable-next-line functional/prefer-readonly-type
var rotatePointArray = function (v, amountRadian) {
    var mat = [[Math.cos(amountRadian), -Math.sin(amountRadian)], [Math.sin(amountRadian), Math.cos(amountRadian)]];
    var result = [];
    //eslint-disable-next-line functional/no-let
    for (var i = 0; i < v.length; ++i) {
        //eslint-disable-next-line functional/immutable-data
        result[i] = [mat[0][0] * v[i][0] + mat[0][1] * v[i][1], mat[1][0] * v[i][0] + mat[1][1] * v[i][1]];
    }
    return result;
};
exports.rotatePointArray = rotatePointArray;
var length = function (ptOrX, y) {
    if ((0, exports.isPoint)(ptOrX)) {
        y = ptOrX.y;
        ptOrX = ptOrX.x;
    }
    if (y === undefined)
        throw new Error("Expected y");
    return Math.sqrt(ptOrX * ptOrX + y * y);
};
/**
 * Normalise point as a unit vector.
 *
 * ```js
 * normalise({x:10, y:20});
 * normalise(10, 20);
 * ```
 * @param ptOrX Point, or x value
 * @param y y value if first param is x
 * @returns
 */
var normalise = function (ptOrX, y) {
    var pt = (0, exports.getPointParam)(ptOrX, y);
    var l = length(pt);
    if (l === 0)
        return index_js_1.Points.Empty;
    return Object.freeze({
        x: pt.x / l,
        y: pt.y / l
    });
};
exports.normalise = normalise;
/**
 * Normalises a point so it is on a 0..1 scale
 * @param a Point, or x
 * @param b y coord or width
 * @param c height or width
 * @param d height
 * @returns Point
 */
function normaliseByRect(a, b, c, d) {
    // ✔️ Unit tested
    if ((0, exports.isPoint)(a)) {
        if (typeof b === "number" && c !== undefined) {
            (0, Guards_js_1.number)(b, "positive", "width");
            (0, Guards_js_1.number)(c, "positive", "height");
        }
        else {
            if (!index_js_1.Rects.isRect(b))
                throw new Error("Expected second parameter to be a rect");
            c = b.height;
            b = b.width;
        }
        return Object.freeze({
            x: a.x / b,
            y: a.y / c
        });
    }
    else {
        (0, Guards_js_1.number)(a, "positive", "x");
        if (typeof b !== "number")
            throw new Error("Expecting second parameter to be a number (width)");
        if (typeof c !== "number")
            throw new Error("Expecting third parameter to be a number (height)");
        (0, Guards_js_1.number)(b, "positive", "y");
        (0, Guards_js_1.number)(c, "positive", "width");
        if (d === undefined)
            throw new Error("Expected height parameter");
        (0, Guards_js_1.number)(d, "positive", "height");
        return Object.freeze({
            x: a / c,
            y: b / d
        });
    }
}
exports.normaliseByRect = normaliseByRect;
/**
 * Returns a random point on a 0..1 scale.
 * ```js
 * import { Points } from "https://unpkg.com/ixfx/dist/geometry.js";
 * const pt = Points.random(); // eg {x: 0.2549012, y:0.859301}
 * ```
 *
 * A custom source of randomness can be provided:
 * ```js
 * import { Points } from "https://unpkg.com/ixfx/dist/geometry.js";
 * import { weightedSkewed } from "https://unpkg.com/ixfx/dist/random.js"
 * const pt = Points.random(weightedSkewed(`quadIn`));
 * ```
 * @param rando
 * @returns
 */
var random = function (rando) {
    if (rando === undefined)
        rando = Random_js_1.defaultRandom;
    return {
        x: rando(),
        y: rando()
    };
};
exports.random = random;
/**
 * Wraps a point to be within `ptMin` and `ptMax`.
 * Note that max values are _exclusive_, meaning the return value will always be one less.
 *
 * Eg, if a view port is 100x100 pixels, wrapping the point 150,100 yields 50,99.
 *
 * ```js
 * // Wraps 150,100 to on 0,0 -100,100 range
 * wrap({x:150,y:100}, {x:100,y:100});
 * ```
 *
 * Wrap normalised point:
 * ```js
 * wrap({x:1.2, y:1.5}); // Yields: {x:0.2, y:0.5}
 * ```
 * @param pt Point to wrap
 * @param ptMax Maximum value, or `{ x:1, y:1 }` by default
 * @param ptMin Minimum value, or `{ x:0, y:0 }` by default
 * @returns Wrapped point
 */
var wrap = function (pt, ptMax, ptMin) {
    if (ptMax === void 0) { ptMax = { x: 1, y: 1 }; }
    if (ptMin === void 0) { ptMin = { x: 0, y: 0 }; }
    // ✔️ Unit tested
    (0, exports.guard)(pt, "pt");
    (0, exports.guard)(ptMax, "ptMax");
    (0, exports.guard)(ptMin, "ptMin");
    return Object.freeze({
        x: (0, index_js_2.wrap)(pt.x, ptMin.x, ptMax.x),
        y: (0, index_js_2.wrap)(pt.y, ptMin.y, ptMax.y)
    });
};
exports.wrap = wrap;
/**
 * Inverts one or more axis of a point
 * ```js
 * invert({x:10, y:10}); // Yields: {x:-10, y:-10}
 * invert({x:10, y:10}, `x`); // Yields: {x:-10, y:10}
 * ```
 * @param pt Point to invert
 * @param what Which axis. If unspecified, both axies are inverted
 * @returns
 */
var invert = function (pt, what) {
    if (what === void 0) { what = "both"; }
    switch (what) {
        case "both":
            if ((0, exports.isPoint3d)(pt)) {
                return Object.freeze(__assign(__assign({}, pt), { x: pt.x * -1, y: pt.y * -1, z: pt.z * -1 }));
            }
            else {
                return Object.freeze(__assign(__assign({}, pt), { x: pt.x * -1, y: pt.y * -1 }));
            }
        case "x":
            return Object.freeze(__assign(__assign({}, pt), { x: pt.x * -1 }));
        case "y":
            return Object.freeze(__assign(__assign({}, pt), { y: pt.y * -1 }));
        case "z":
            if ((0, exports.isPoint3d)(pt)) {
                return Object.freeze(__assign(__assign({}, pt), { z: pt.z * -1 }));
            }
            else
                throw new Error("pt parameter is missing z");
        default:
            throw new Error("Unknown what parameter. Expecting 'both', 'x' or 'y'");
    }
};
exports.invert = invert;
/**
 * Returns a point with rounded x,y coordinates. By default uses `Math.round` to round.
 * ```js
 * toIntegerValues({x:1.234, y:5.567}); // Yields: {x:1, y:6}
 * ```
 *
 * ```js
 * toIntegerValues(pt, Math.ceil); // Use Math.ceil to round x,y of `pt`.
 * ```
 * @param pt Point to round
 * @param rounder Rounding function, or Math.round by default
 * @returns
 */
var toIntegerValues = function (pt, rounder) {
    if (rounder === void 0) { rounder = Math.round; }
    (0, exports.guard)(pt, "pt");
    return Object.freeze({
        x: rounder(pt.x),
        y: rounder(pt.y)
    });
};
exports.toIntegerValues = toIntegerValues;
/**
 * Clamps the magnitude of a point.
 * This is useful when using a Point as a vector, to limit forces.
 * @param pt
 * @param m
 * @returns
 */
var clampMagnitude = function (pt, m) {
    var length = distance(pt);
    if (length > m) {
        var ratio = m / length;
        return multiply(pt, ratio, ratio);
    }
    return pt;
};
exports.clampMagnitude = clampMagnitude;
function clamp(a, b, c, d) {
    // ✔️ Unit tested
    if ((0, exports.isPoint)(a)) {
        if (b === undefined)
            b = 0;
        if (c === undefined)
            c = 1;
        (0, Guards_js_1.number)(b, "", "min");
        (0, Guards_js_1.number)(c, "", "max");
        return Object.freeze({
            x: (0, index_js_2.clamp)(a.x, b, c),
            y: (0, index_js_2.clamp)(a.y, b, c)
        });
    }
    else {
        if (b === undefined)
            throw new Error("Expected y coordinate");
        if (c === undefined)
            c = 0;
        if (d === undefined)
            d = 1;
        (0, Guards_js_1.number)(a, "", "x");
        (0, Guards_js_1.number)(b, "", "y");
        (0, Guards_js_1.number)(c, "", "min");
        (0, Guards_js_1.number)(d, "", "max");
        return Object.freeze({
            x: (0, index_js_2.clamp)(a, c, d),
            y: (0, index_js_2.clamp)(b, c, d)
        });
    }
}
exports.clamp = clamp;
/**
 * Tracks the relation between two points
 *
 * ```js
 * import { Points } from "https://unpkg.com/ixfx/dist/geometry.js";
 *
 * // Start point: 50,50
 * const t = Points.relation({x:50,y:50});
 *
 * // Compare to a 0,0
 * const { angle, distance, average, centroid, speed } = t({x:0,y:0});
 * ```
 *
 * X,y coordinates can also be used as parameters:
 * ```js
 * const t = Points.relation(50, 50);
 * const result = t(0, 0);
 * // result.speed, result.angle ...
 * ```
 * @param start
 * @returns
 */
var relation = function (a, b) {
    var start = (0, exports.getPointParam)(a, b);
    //eslint-disable-next-line functional/no-let
    var totalX = 0;
    //eslint-disable-next-line functional/no-let
    var totalY = 0;
    //eslint-disable-next-line functional/no-let
    var count = 0;
    //eslint-disable-next-line functional/no-let
    var lastUpdate = performance.now();
    var update = function (aa, bb) {
        var p = (0, exports.getPointParam)(aa, bb);
        totalX += p.x;
        totalY += p.y;
        count++;
        var dist = distance(p, start);
        // Track speed
        var now = performance.now();
        var speed = dist / ((now - lastUpdate));
        lastUpdate = now;
        return Object.freeze({
            angle: (0, exports.angle)(p, start),
            distance: dist,
            speed: speed,
            centroid: (0, exports.centroid)(p, start),
            average: {
                x: totalX / count,
                y: totalY / count
            }
        });
    };
    return update;
};
exports.relation = relation;
//# sourceMappingURL=Point.js.map