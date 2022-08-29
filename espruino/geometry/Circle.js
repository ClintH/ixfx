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
exports.__esModule = true;
exports.intersectionLine = exports.toPath = exports.toSvg = exports.distanceFromExterior = exports.distanceCenter = exports.isEqual = exports.intersections = exports.isIntersecting = exports.isContainedBy = exports.bbox = exports.area = exports.circumference = exports.length = exports.interpolate = exports.center = exports.point = exports.isCirclePositioned = exports.isCircle = exports.isPositioned = void 0;
var Point_js_1 = require("./Point.js");
var index_js_1 = require("./index.js");
var piPi = Math.PI * 2;
/**
 * Returns true if parameter has x,y. Does not verify if parameter is a circle or not
 *
 * ```js
 * import { Circles } from "https://unpkg.com/ixfx/dist/geometry.js"
 *
 * const circleA = { radius: 5 };
 * Circles.isPositioned(circle); // false
 *
 * const circleB = { radius: 5, x: 10, y: 10 }
 * Circles.isPositioned(circle); // true
 * ```
 * @param p Circle
 * @returns
 */
var isPositioned = function (p) { return p.x !== undefined && p.y !== undefined; };
exports.isPositioned = isPositioned;
//eslint-disable-next-line @typescript-eslint/no-explicit-any
var isCircle = function (p) { return p.radius !== undefined; };
exports.isCircle = isCircle;
//eslint-disable-next-line @typescript-eslint/no-explicit-any
var isCirclePositioned = function (p) { return (0, exports.isCircle)(p) && (0, exports.isPositioned)(p); };
exports.isCirclePositioned = isCirclePositioned;
/**
 * Returns a point on a circle at a specified angle in radians
 *
 * ```js
 * import { Circles } from "https://unpkg.com/ixfx/dist/geometry.js"
 *
 * // Circle without position
 * const circleA = { radius: 5 };
 *
 * // Get point at angle Math.PI, passing in a origin coordinate
 * const ptA = Circles.point(circleA, Math.PI, {x: 10, y: 10 });
 *
 * // Point on circle with position
 * const circleB = { radius: 5, x: 10, y: 10};
 * const ptB = Circles.point(circleB, Math.PI);
 * ```
 * @param circle
 * @param angleRadian Angle in radians
 * @param Origin or offset of calculated point. By default uses center of circle or 0,0 if undefined
 * @returns Point oo circle
 */
var point = function (circle, angleRadian, origin) {
    if (origin === undefined) {
        if ((0, exports.isPositioned)(circle)) {
            origin = circle;
        }
        else {
            origin = { x: 0, y: 0 };
        }
    }
    return {
        x: (Math.cos(-angleRadian) * circle.radius) + origin.x,
        y: (Math.sin(-angleRadian) * circle.radius) + origin.y
    };
};
exports.point = point;
/**
 * Throws if radius is out of range. If x,y is present, these will be validated too.
 * @param circle
 * @param paramName
 */
var guard = function (circle, paramName) {
    if (paramName === void 0) { paramName = "circle"; }
    if ((0, exports.isPositioned)(circle)) {
        (0, Point_js_1.guard)(circle, "circle");
    }
    if (Number.isNaN(circle.radius))
        throw new Error("".concat(paramName, ".radius is NaN"));
    if (circle.radius <= 0)
        throw new Error("".concat(paramName, ".radius must be greater than zero"));
};
/**
 * Throws if `circle` is not positioned or has dodgy fields
 * @param circle
 * @param paramName
 * @returns
 */
var guardPositioned = function (circle, paramName) {
    if (paramName === void 0) { paramName = "circle"; }
    if (!(0, exports.isPositioned)(circle))
        throw new Error("Expected a positioned circle with x,y");
    return guard(circle, paramName);
};
/**
 * Returns the center of a circle
 *
 * If the circle has an x,y, that is the center.
 * If not, `radius` is used as the x and y.
 *
 * ```js
 * import { Circles } from "https://unpkg.com/ixfx/dist/geometry.js"
 * const circle = { radius: 5, x: 10, y: 10};
 *
 * // Yields: { x: 5, y: 10 }
 * Circles.center(circle);
 * ```
 *
 * It's a trivial function, but can make for more understandable code
 * @param circle
 * @returns Center of circle
 */
var center = function (circle) {
    if ((0, exports.isPositioned)(circle))
        return Object.freeze({ x: circle.x, y: circle.y });
    else
        return Object.freeze({ x: circle.radius, y: circle.radius });
};
exports.center = center;
/**
 * Computes relative position along circle
 *
 * ```js
 * import { Circles } from "https://unpkg.com/ixfx/dist/geometry.js"
 * const circle = { radius: 100, x: 100, y: 100 };
 *
 * // Get a point halfway around circle
 * // Yields { x, y }
 * const pt = Circles.interpolate(circle, 0.5);
 * ```
 * @param circle
 * @param t Position, 0-1
 * @returns
 */
var interpolate = function (circle, t) { return (0, exports.point)(circle, t * piPi); };
exports.interpolate = interpolate;
/**
 * Returns circumference of `circle` (alias of {@link circumference})
 * @param circle
 * @returns
 */
var length = function (circle) { return (0, exports.circumference)(circle); };
exports.length = length;
/**
 * Returns circumference of `circle` (alias of {@link length})
 * @param circle
 * @returns
 */
var circumference = function (circle) {
    guard(circle);
    return piPi * circle.radius;
};
exports.circumference = circumference;
/**
 * Returns the area of `circle`.
 * @param circle
 * @returns
 */
var area = function (circle) {
    guard(circle);
    return Math.PI * circle.radius * circle.radius;
};
exports.area = area;
/**
 * Computes a bounding box that encloses circle
 * @param circle
 * @returns
 */
var bbox = function (circle) {
    if ((0, exports.isPositioned)(circle)) {
        return index_js_1.Rects.fromCenter(circle, circle.radius * 2, circle.radius * 2);
    }
    else {
        return { width: circle.radius * 2, height: circle.radius * 2 };
    }
};
exports.bbox = bbox;
/**
 * Returns true if `b` is completely contained by `a`
 *
 * @param a
 * @param b
 * @returns
 */
var isContainedBy = function (a, b) {
    var d = (0, exports.distanceCenter)(a, b);
    return (d < Math.abs(a.radius - b.radius));
};
exports.isContainedBy = isContainedBy;
/**
 * Returns true if a or b overlap or are equal
 *
 * Use `intersections` to find the points of intersection
 *
 * @param a
 * @param b
 * @returns True if circle overlap
 */
var isIntersecting = function (a, b) {
    if ((0, exports.isEqual)(a, b))
        return true;
    if ((0, exports.isContainedBy)(a, b))
        return true;
    return (0, exports.intersections)(a, b).length === 2;
};
exports.isIntersecting = isIntersecting;
/**
 * Returns the points of intersection betweeen `a` and `b`.
 *
 * Returns an empty array if circles are equal, one contains the other or if they don't touch at all.
 *
 * @param a Circle
 * @param b Circle
 * @returns Points of intersection, or an empty list if there are none
 */
var intersections = function (a, b) {
    var vector = index_js_1.Points.subtract(b, a);
    var centerD = Math.sqrt((vector.y * vector.y) + (vector.x * vector.x));
    // Do not intersect
    if (centerD > a.radius + b.radius)
        return [];
    // Circle contains another
    if (centerD < Math.abs(a.radius - b.radius))
        return [];
    // Circles are the same
    if ((0, exports.isEqual)(a, b))
        return [];
    var centroidD = ((a.radius * a.radius) - (b.radius * b.radius) + (centerD * centerD)) / (2.0 * centerD);
    var centroid = {
        x: a.x + (vector.x * centroidD / centerD),
        y: a.y + (vector.y * centroidD / centerD)
    };
    var centroidIntersectionD = Math.sqrt((a.radius * a.radius) - (centroidD * centroidD));
    var intersection = {
        x: -vector.y * (centroidIntersectionD / centerD),
        y: vector.x * (centroidIntersectionD / centerD)
    };
    return [
        index_js_1.Points.sum(centroid, intersection),
        index_js_1.Points.subtract(centroid, intersection)
    ];
};
exports.intersections = intersections;
/**
 * Returns true if the two objects have the same values
 *
 * ```js
 * const circleA = { radius: 10, x: 5, y: 5 };
 * const circleB = { radius: 10, x: 5, y: 5 };
 *
 * circleA === circleB; // false, because identity of objects is different
 * Circles.isEqual(circleA, circleB); // true, because values are the same
 * ```
 *
 * Circles must both be positioned or not.
 * @param a
 * @param b
 * @returns
 */
var isEqual = function (a, b) {
    if (a.radius !== b.radius)
        return false;
    if ((0, exports.isPositioned)(a) && (0, exports.isPositioned)(b)) {
        if (a.x !== b.x)
            return false;
        if (a.y !== b.y)
            return false;
        if (a.z !== b.z)
            return false;
        return true;
    }
    else if (!(0, exports.isPositioned)(a) && !(0, exports.isPositioned)(b)) {
        // no-op
    }
    else
        return false; // one is positioned one not
    return false;
};
exports.isEqual = isEqual;
/**
 * Returns the distance between two circle centers.
 *
 * ```js
 * import { Circles } from "https://unpkg.com/ixfx/dist/geometry.js"
 * const circleA = { radius: 5, x: 5, y: 5 }
 * const circleB = { radius: 10, x: 20, y: 20 }
 * const distance = Circles.distanceCenter(circleA, circleB);
 * ```
 * Throws an error if either is lacking position.
 * @param a
 * @param b
 * @returns Distance
 */
var distanceCenter = function (a, b) {
    guardPositioned(a, "a");
    guardPositioned(a, "b");
    return index_js_1.Points.distance(a, b);
};
exports.distanceCenter = distanceCenter;
/**
 * Returns the distance between the exterior of two circles, or between the exterior of a circle and point.
 * If `b` overlaps or is enclosed by `a`, distance is 0.
 *
 * ```js
 * import { Circles } from "https://unpkg.com/ixfx/dist/geometry.js"
 * const circleA = { radius: 5, x: 5, y: 5 }
 * const circleB = { radius: 10, x: 20, y: 20 }
 * const distance = Circles.distanceCenter(circleA, circleB);
 * ```
 * @param a
 * @param b
 */
var distanceFromExterior = function (a, b) {
    guardPositioned(a, "a");
    if ((0, exports.isCirclePositioned)(b)) {
        return Math.max(0, (0, exports.distanceCenter)(a, b) - a.radius - b.radius);
    }
    else if (index_js_1.Points.isPoint(b)) {
        return Math.max(0, index_js_1.Points.distance(a, b));
    }
    else
        throw new Error("Second parameter invalid type");
};
exports.distanceFromExterior = distanceFromExterior;
/**
 * Creates a SVG path segment.
 * @param a Circle or radius
 * @param sweep If true, path is 'outward'
 * @param origin Origin of path. Required if first parameter is just a radius or circle is non-positioned
 * @returns
 */
var toSvg = function (a, sweep, origin) {
    if ((0, exports.isCircle)(a)) {
        if (origin !== undefined) {
            return toSvgFull(a.radius, origin, sweep);
        }
        if ((0, exports.isPositioned)(a)) {
            return toSvgFull(a.radius, a, sweep);
        }
        else
            throw new Error("origin parameter needed for non-positioned circle");
    }
    else {
        if (origin !== undefined) {
            return toSvgFull(a, origin, sweep);
        }
        else
            throw new Error("origin parameter needed");
    }
};
exports.toSvg = toSvg;
var toSvgFull = function (radius, origin, sweep) {
    // https://stackoverflow.com/questions/5737975/circle-drawing-with-svgs-arc-path
    var x = origin.x, y = origin.y;
    var s = sweep ? "1" : "0";
    return "\n    M ".concat(x, ", ").concat(y, "\n    m -").concat(radius, ", 0\n    a ").concat(radius, ",").concat(radius, " 0 1,").concat(s, " ").concat(radius * 2, ",0\n    a ").concat(radius, ",").concat(radius, " 0 1,").concat(s, " -").concat(radius * 2, ",0\n  ").split("\n");
};
/**
 * Returns a `CircularPath` representation of a circle
 *
 * @param {CirclePositioned} circle
 * @returns {CircularPath}
 */
var toPath = function (circle) {
    guard(circle);
    return Object.freeze(__assign(__assign({}, circle), { 
        /**
         * Returns a relative (0.0-1.0) point on a circle. 0=3 o'clock, 0.25=6 o'clock, 0.5=9 o'clock, 0.75=12 o'clock etc.
         * @param {t} Relative (0.0-1.0) point
         * @returns {Point} X,y
         */
        interpolate: function (t) { return (0, exports.interpolate)(circle, t); }, bbox: function () { return (0, exports.bbox)(circle); }, length: function () { return (0, exports.length)(circle); }, toSvgString: function (sweep) {
            if (sweep === void 0) { sweep = true; }
            return (0, exports.toSvg)(circle, sweep);
        }, kind: "circular" }));
};
exports.toPath = toPath;
/**
 * Returns the point(s) of intersection between a circle and line.
 *
 * ```js
 * import { Circles } from "https://unpkg.com/ixfx/dist/geometry.js"
 * const circle = { radius: 5, x: 5, y: 5 };
 * const line = { a: { x: 0, y: 0 }, b: { x: 10, y: 10 } };
 * const pts = Circles.intersectionLine(circle, line);
 * ```
 * @param circle
 * @param line
 * @returns Point(s) of intersection, or empty array
 */
var intersectionLine = function (circle, line) {
    var v1 = {
        x: line.b.x - line.a.x,
        y: line.b.y - line.a.y
    };
    var v2 = {
        x: line.a.x - circle.x,
        y: line.a.y - circle.y
    };
    var b = (v1.x * v2.x + v1.y * v2.y) * -2;
    var c = 2 * (v1.x * v1.x + v1.y * v1.y);
    var d = Math.sqrt(b * b - 2 * c * (v2.x * v2.x + v2.y * v2.y - circle.radius * circle.radius));
    if (isNaN(d))
        return []; // no intercept
    var u1 = (b - d) / c; // these represent the unit distance of point one and two on the line
    var u2 = (b + d) / c;
    var ret = [];
    if (u1 <= 1 && u1 >= 0) { // add point if on the line segment
        //eslint-disable-next-line functional/immutable-data
        ret.push({
            x: line.a.x + v1.x * u1,
            y: line.a.y + v1.y * u1
        });
    }
    if (u2 <= 1 && u2 >= 0) { // second add point if on the line segment
        //eslint-disable-next-line functional/immutable-data
        ret.push({
            x: line.a.x + v1.x * u2,
            y: line.a.y + v1.y * u2
        });
    }
    return ret;
};
exports.intersectionLine = intersectionLine;
//# sourceMappingURL=Circle.js.map