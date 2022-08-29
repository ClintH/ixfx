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
exports.hypotenuseFromAdjacent = exports.hypotenuseFromOpposite = exports.adjacentFromOpposite = exports.adjacentFromHypotenuse = exports.oppositeFromHypotenuse = exports.oppositeFromAdjacent = exports.incircle = exports.circumcircle = exports.medians = exports.angleAtPointB = exports.angleAtPointA = exports.area = exports.perimeter = exports.hypotenuseSegments = exports.height = exports.resolveLengths = exports.fromC = exports.fromB = exports.fromA = void 0;
/**
 * Returns a positioned triangle from a point for A.
 *
 * ```
 *             c (90 deg)
 *             .
 *          .   .
 *       .       .
 *    .           .
 * a .............. b
 * ```
 * @param t
 * @param origin
 * @returns
 */
var fromA = function (t, origin) {
    if (origin === void 0) { origin = { x: 0, y: 0 }; }
    var tt = (0, exports.resolveLengths)(t);
    var seg = (0, exports.hypotenuseSegments)(t);
    var h = (0, exports.height)(t);
    var a = { x: origin.x, y: origin.y };
    var b = { x: origin.x + tt.hypotenuse, y: origin.y };
    var c = { x: origin.x + seg[1], y: origin.y - h };
    return { a: a, b: b, c: c };
};
exports.fromA = fromA;
/**
 * Returns a positioned triangle from a point for B.
 *
 * ```
 *             c (90 deg)
 *             .
 *          .   .
 *       .       .
 *    .           .
 * a .............. b
 * ```
 * @param t
 * @param origin
 * @returns
 */
var fromB = function (t, origin) {
    if (origin === void 0) { origin = { x: 0, y: 0 }; }
    var tt = (0, exports.resolveLengths)(t);
    var seg = (0, exports.hypotenuseSegments)(t);
    var h = (0, exports.height)(t);
    var b = { x: origin.x, y: origin.y };
    var a = { x: origin.x - tt.hypotenuse, y: origin.y };
    var c = { x: origin.x - seg[0], y: origin.y - h };
    return { a: a, b: b, c: c };
};
exports.fromB = fromB;
/**
 * Returns a positioned triangle from a point for C.
 *
 * ```
 *             c (90 deg)
 *             .
 *          .   .
 *       .       .
 *    .           .
 * a .............. b
 * ```
 * @param t
 * @param origin
 * @returns
 */
var fromC = function (t, origin) {
    if (origin === void 0) { origin = { x: 0, y: 0 }; }
    var seg = (0, exports.hypotenuseSegments)(t);
    var h = (0, exports.height)(t);
    var c = { x: origin.x, y: origin.y };
    var a = { x: origin.x - seg[1], y: origin.y + h };
    var b = { x: origin.x + seg[0], y: origin.y + h };
    return { a: a, b: b, c: c };
};
exports.fromC = fromC;
/**
 * Returns a right triangle with all lengths defined.
 * At least two lengths must already exist
 * @param t
 * @returns
 */
var resolveLengths = function (t) {
    var a = t.adjacent;
    var o = t.opposite;
    var h = t.hypotenuse;
    if (a !== undefined && o !== undefined) {
        return __assign(__assign({}, t), { adjacent: a, opposite: o, hypotenuse: Math.sqrt(a * a + o * o) });
    }
    else if (a && h) {
        return __assign(__assign({}, t), { adjacent: a, hypotenuse: h, opposite: h * h - a * a });
    }
    else if (o && h) {
        return __assign(__assign({}, t), { hypotenuse: h, opposite: o, adjacent: h * h - o * o });
    }
    else if (t.opposite && t.hypotenuse && t.adjacent) {
        return t;
    }
    throw new Error("Missing at least two edges");
};
exports.resolveLengths = resolveLengths;
/**
 * Height of right-triangle
 * @param t
 * @returns
 */
var height = function (t) {
    var tt = (0, exports.resolveLengths)(t);
    var p = tt.opposite * tt.opposite / tt.hypotenuse;
    var q = tt.adjacent * tt.adjacent / tt.hypotenuse;
    return Math.sqrt(p * q);
};
exports.height = height;
/**
 * Returns the lengths of the hypotenuse split into p and q segments.
 * In other words, if one makes a line from the right-angle vertex down to hypotenuse.
 *
 * [See here](https://rechneronline.de/pi/right-triangle.php)
 * @param t
 * @returns
 */
var hypotenuseSegments = function (t) {
    var tt = (0, exports.resolveLengths)(t);
    var p = tt.opposite * tt.opposite / tt.hypotenuse;
    var q = tt.adjacent * tt.adjacent / tt.hypotenuse;
    return [p, q];
};
exports.hypotenuseSegments = hypotenuseSegments;
var perimeter = function (t) {
    var tt = (0, exports.resolveLengths)(t);
    return tt.adjacent + tt.hypotenuse + tt.opposite;
};
exports.perimeter = perimeter;
var area = function (t) {
    var tt = (0, exports.resolveLengths)(t);
    return tt.opposite * tt.adjacent / 2;
};
exports.area = area;
/**
 * Angle (in radians) between hypotenuse and adjacent edge
 * @param t
 * @returns
 */
var angleAtPointA = function (t) {
    var tt = (0, exports.resolveLengths)(t);
    return Math.acos((tt.adjacent * tt.adjacent + tt.hypotenuse * tt.hypotenuse - tt.opposite * tt.opposite)
        /
            (2 * tt.adjacent * tt.hypotenuse));
};
exports.angleAtPointA = angleAtPointA;
/**
 * Angle (in radians) between opposite edge and hypotenuse
 * @param t
 * @returns
 */
var angleAtPointB = function (t) {
    var tt = (0, exports.resolveLengths)(t);
    console.log(tt);
    return Math.acos((tt.opposite * tt.opposite + tt.hypotenuse * tt.hypotenuse - tt.adjacent * tt.adjacent)
        /
            (2 * tt.opposite * tt.hypotenuse));
};
exports.angleAtPointB = angleAtPointB;
/**
 * Returns the median line lengths a, b and c in an array.
 *
 * The median lines are the lines from each vertex to the center.
 *
 * @param t
 * @returns
 */
var medians = function (t) {
    var tt = (0, exports.resolveLengths)(t);
    var b = tt.adjacent * tt.adjacent;
    var c = tt.hypotenuse * tt.hypotenuse;
    var a = tt.opposite * tt.opposite;
    return [
        Math.sqrt(2 * (b + c) - a) / 2,
        Math.sqrt(2 * (c + a) - b) / 2,
        Math.sqrt(2 * (a + b) - c) / 2
    ];
};
exports.medians = medians;
/**
 * The circle which passes through the points of the triangle
 * @param t
 * @returns
 */
var circumcircle = function (t) {
    var tt = (0, exports.resolveLengths)(t);
    return { radius: tt.hypotenuse / 2 };
};
exports.circumcircle = circumcircle;
/**
 * Circle enclosed by triangle
 * @param t
 * @returns
 */
var incircle = function (t) {
    var tt = (0, exports.resolveLengths)(t);
    return {
        radius: (tt.adjacent + tt.opposite - tt.hypotenuse) / 2
    };
};
exports.incircle = incircle;
/**
 * Returns the opposite length of a right-angle triangle,
 * marked here
 *
 * ```
 *    .  <
 *   ..  <
 * ....  <
 * ```
 *
 * This is just:
 * ```js
 * opposite = Math.tan(angle) * adjacent
 * ```
 * @param angleRad
 * @param adjacent
 * @returns
 */
var oppositeFromAdjacent = function (angleRad, adjacent) { return Math.tan(angleRad) * adjacent; };
exports.oppositeFromAdjacent = oppositeFromAdjacent;
/**
 * Returns the opposite length of a right-angle triangle,
 * marked here
 *
 * ```
 *    .  <
 *   ..  <
 * ....  <
 * ```
 *
 * This is just:
 * ```js
 * opposite = Math.tan(angle) * adjacent
 * ```
 * @param angleRad
 * @param hypotenuse
 * @returns
 */
var oppositeFromHypotenuse = function (angleRad, hypotenuse) { return Math.sin(angleRad) * hypotenuse; };
exports.oppositeFromHypotenuse = oppositeFromHypotenuse;
/**
 * Returns the adjecent length of a right-angle triangle,
 * marked here
 * ```
 *    .
 *   ..  o
 * ....
 * ^^^^
 * ```
 * This is just:
 * ```js
 * opposite = Math.tan(angle) * adjacent
 * ```
 * @param angleRad
 * @param adjacent
 * @returns
 */
var adjacentFromHypotenuse = function (angleRad, hypotenuse) { return Math.cos(angleRad) * hypotenuse; };
exports.adjacentFromHypotenuse = adjacentFromHypotenuse;
/**
 * Returns the adjecent length of a right-angle triangle,
 * marked here
 * ```
 *    .
 *   ..  o
 * ....
 * ^^^^
 * ```
 * This is just:
 * ```js
 * opposite = Math.tan(angle) * adjacent
 * ```
 * @param angleRad
 * @param opposite
 * @returns
 */
var adjacentFromOpposite = function (angleRad, opposite) { return opposite / Math.tan(angleRad); };
exports.adjacentFromOpposite = adjacentFromOpposite;
/**
 * Returns the hypotenuse length of a right-angle triangle,
 * marked here
 * ```
 *      .
 * >   ..
 * >  ...
 * > ....  opp
 *  .....
 *   adj
 * ```
 * This is just:
 * ```js
 * opposite = Math.tan(angle) * adjacent
 * ```
 * @param angleRad
 * @param adjacent
 * @returns
 */
var hypotenuseFromOpposite = function (angleRad, opposite) { return opposite / Math.sin(angleRad); };
exports.hypotenuseFromOpposite = hypotenuseFromOpposite;
/**
 * Returns the hypotenuse length of a right-angle triangle,
 * marked here
 * ```
 *      .
 * >   ..
 * >  ...
 * > ....  opp
 *  .....
 *   adj
 * ```
 * This is just:
 * ```js
 * opposite = Math.tan(angle) * adjacent
 * ```
 * @param angleRad
 * @param adjacent
 * @returns
 */
var hypotenuseFromAdjacent = function (angleRad, adjacent) { return adjacent / Math.cos(angleRad); };
exports.hypotenuseFromAdjacent = hypotenuseFromAdjacent;
//# sourceMappingURL=TriangleRight.js.map