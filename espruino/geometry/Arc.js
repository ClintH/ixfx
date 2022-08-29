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
exports.isEqual = exports.distanceCenter = exports.toSvg = exports.bbox = exports.length = exports.toPath = exports.interpolate = exports.guard = exports.point = exports.toLine = exports.fromDegrees = exports.isPositioned = exports.isArc = void 0;
var index_js_1 = require("./index.js");
var Point_js_1 = require("./Point.js");
var index_js_2 = require("./index.js");
/**
 * Returns true if parameter is an arc
 * @param p Arc or number
 * @returns
 */
var isArc = function (p) { return p.startRadian !== undefined && p.endRadian !== undefined; };
exports.isArc = isArc;
/**
 * Returns true if parameter has a positioned (x,y)
 * @param p Point, Arc or ArcPositiond
 * @returns
 */
var isPositioned = function (p) { return p.x !== undefined && p.y !== undefined; };
exports.isPositioned = isPositioned;
var piPi = Math.PI * 2;
//eslint-disable-next-line func-style
function fromDegrees(radius, startDegrees, endDegrees, origin) {
    var a = {
        radius: radius,
        startRadian: (0, index_js_1.degreeToRadian)(startDegrees),
        endRadian: (0, index_js_1.degreeToRadian)(endDegrees)
    };
    if ((0, Point_js_1.isPoint)(origin)) {
        (0, Point_js_1.guard)(origin);
        var ap = __assign(__assign({}, a), { x: origin.x, y: origin.y });
        return Object.freeze(ap);
    }
    else {
        return Object.freeze(a);
    }
}
exports.fromDegrees = fromDegrees;
/**
 * Returns a {@link Geometry.Lines.Line} linking the start and end points of an {@link ArcPositioned}.
 *
 * @param arc
 * @returns Line from start to end of arc
 */
var toLine = function (arc) { return index_js_2.Lines.fromPoints((0, exports.point)(arc, arc.startRadian), (0, exports.point)(arc, arc.endRadian)); };
exports.toLine = toLine;
/**
 * Calculates a coordinate on an arc, based on an angle
 * @param arc Arc
 * @param angleRadian Angle of desired coordinate
 * @param origin Origin of arc (0,0 used by default)
 * @returns Coordinate
 */
var point = function (arc, angleRadian, origin) {
    if (angleRadian > arc.endRadian)
        throw new Error("angleRadian beyond end angle of arc");
    if (angleRadian < arc.startRadian)
        throw new Error("angleRadian beyond start angle of arc");
    if (origin === undefined) {
        if ((0, exports.isPositioned)(arc)) {
            origin = arc;
        }
        else {
            origin = { x: 0, y: 0 };
        }
    }
    return {
        x: (Math.cos(angleRadian) * arc.radius) + origin.x,
        y: (Math.sin(angleRadian) * arc.radius) + origin.y
    };
};
exports.point = point;
/**
 * Throws an error if arc instance is invalid
 * @param arc
 */
var guard = function (arc) {
    if (arc === undefined)
        throw new Error("Arc is undefined");
    if ((0, exports.isPositioned)(arc)) {
        (0, Point_js_1.guard)(arc, "arc");
    }
    if (arc.radius === undefined)
        throw new Error("Arc radius is undefined (".concat(JSON.stringify(arc), ")"));
    if (typeof arc.radius !== "number")
        throw new Error("Radius must be a number");
    if (Number.isNaN(arc.radius))
        throw new Error("Radius is NaN");
    if (arc.radius <= 0)
        throw new Error("Radius must be greater than zero");
    if (arc.startRadian === undefined)
        throw new Error("Arc is missing 'startRadian' field");
    if (arc.endRadian === undefined)
        throw new Error("Arc is missing 'startRadian' field");
    if (Number.isNaN(arc.endRadian))
        throw new Error("Arc endRadian is NaN");
    if (Number.isNaN(arc.startRadian))
        throw new Error("Arc endRadian is NaN");
    if (arc.startRadian >= arc.endRadian)
        throw new Error("startRadian is expected to be les than endRadian");
};
exports.guard = guard;
/**
 * Compute relative position on arc
 * @param arc Arc
 * @param amount Relative position 0-1
 * @param origin If arc is not positioned, pass in an origin
 * @returns
 */
var interpolate = function (amount, arc, origin) {
    (0, exports.guard)(arc);
    return (0, exports.point)(arc, arc.startRadian + ((arc.endRadian - arc.startRadian) * amount), origin);
};
exports.interpolate = interpolate;
/**
 * Creates a {@link Geometry.Paths.Path} instance from the arc. This wraps up some functions for convienence.
 * @param arc
 * @returns Path
 */
var toPath = function (arc) {
    (0, exports.guard)(arc);
    return Object.freeze(__assign(__assign({}, arc), { interpolate: function (amount) { return (0, exports.interpolate)(amount, arc); }, bbox: function () { return (0, exports.bbox)(arc); }, length: function () { return (0, exports.length)(arc); }, toSvgString: function () { return (0, exports.toSvg)(arc); }, kind: "arc" }));
};
exports.toPath = toPath;
/**
 * Calculates the length of the arc
 * @param arc
 * @returns Length
 */
var length = function (arc) { return piPi * arc.radius * ((arc.startRadian - arc.endRadian) / piPi); };
exports.length = length;
/**
 * Calculates a {@link Geometry.Rects.Rect | Rect} bounding box for arc.
 * @param arc
 * @returns Rectangle encompassing arc.
 */
var bbox = function (arc) {
    if ((0, exports.isPositioned)(arc)) {
        var middle = (0, exports.interpolate)(0.5, arc);
        var asLine = (0, exports.toLine)(arc);
        return index_js_2.Points.bbox(middle, asLine.a, asLine.b);
    }
    else {
        return {
            width: arc.radius * 2,
            height: arc.radius * 2
        };
    }
};
exports.bbox = bbox;
/**
 * Creates an SV path snippet for arc
 * @returns
 */
var toSvg = function (a, b, c, d, e) {
    if ((0, exports.isArc)(a)) {
        if ((0, exports.isPositioned)(a)) {
            return toSvgFull(a, a.radius, a.startRadian, a.endRadian, b);
        }
        else {
            if ((0, Point_js_1.isPoint)(b)) {
                return toSvgFull(b, a.radius, a.startRadian, a.endRadian, c);
            }
            else {
                return toSvgFull({ x: 0, y: 0 }, a.radius, a.startRadian, a.endRadian);
            }
        }
    }
    else {
        if (c === undefined)
            throw new Error("startAngle undefined");
        if (d === undefined)
            throw new Error("endAngle undefined");
        if ((0, Point_js_1.isPoint)(a)) {
            if (typeof b === "number" && typeof c === "number" && typeof d === "number") {
                return toSvgFull(a, b, c, d, e);
            }
            else {
                throw new Error("Expected (point, number, number, number). Missing a number param.");
            }
        }
        else {
            throw new Error("Expected (point, number, number, number). Missing first point.");
        }
    }
};
exports.toSvg = toSvg;
var toSvgFull = function (origin, radius, startRadian, endRadian, opts) {
    // https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths
    // A rx ry x-axis-rotation large-arc-flag sweep-flag x y
    // a rx ry x-axis-rotation large-arc-flag sweep-flag dx dy
    if (opts === undefined || typeof opts !== "object")
        opts = {};
    var isFullCircle = endRadian - startRadian === 360;
    var start = index_js_1.Polar.toCartesian(radius, endRadian - 0.01, origin);
    var end = index_js_1.Polar.toCartesian(radius, startRadian, origin);
    var _a = opts.largeArc, largeArc = _a === void 0 ? false : _a, _b = opts.sweep, sweep = _b === void 0 ? false : _b;
    var d = ["\n    M ".concat(start.x, " ").concat(start.y, "\n    A ").concat(radius, " ").concat(radius, " 0 ").concat(largeArc ? "1" : "0", " ").concat(sweep ? "1" : "0", " ").concat(end.x, " ").concat(end.y, ",\n  ")];
    //eslint-disable-next-line functional/immutable-data
    if (isFullCircle)
        d.push("z");
    return d;
};
/**
 * Calculates the distance between the centers of two arcs
 * @param a
 * @param b
 * @returns Distance
 */
var distanceCenter = function (a, b) { return index_js_2.Points.distance(a, b); };
exports.distanceCenter = distanceCenter;
/**
 * Returns true if the two arcs have the same values
 *
 * ```js
 * const arcA = { radius: 5, endRadian: 0, startRadian: 1 };
 * const arcA = { radius: 5, endRadian: 0, startRadian: 1 };
 * arcA === arcB; // false, because object identities are different
 * Arcs.isEqual(arcA, arcB); // true, because values are identical
 * ```
 * @param a
 * @param b
 * @returns {boolean}
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
    if (a.endRadian !== b.endRadian)
        return false;
    if (a.startRadian !== b.startRadian)
        return false;
    return true;
};
exports.isEqual = isEqual;
//# sourceMappingURL=Arc.js.map