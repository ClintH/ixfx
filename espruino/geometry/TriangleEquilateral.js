"use strict";
exports.__esModule = true;
exports.incircle = exports.circumcircle = exports.area = exports.perimeter = exports.height = exports.centerFromC = exports.centerFromB = exports.centerFromA = exports.fromCenter = void 0;
var pi4over3 = Math.PI * 4 / 3;
var pi2over3 = Math.PI * 2 / 3;
var resolveLength = function (t) {
    if (typeof t === "number")
        return t;
    return t.length;
};
/**
 * Returns a positioned `Triangle` from an equilateral triangle definition.
 * By default the rotation is such that point `a` and `c` are lying on the horizontal,
 * and `b` is the upward-facing tip.
 *
 * Default is a triangle pointing upwards with b at the top, c to the left and b to right on the baseline.
 *
 * Example rotation values in radians:
 * * ▶️ 0: a and c on vertical, b at the tip
 * * ◀️ Math.PI: `c`and `a` are on vertical, with `b` at the tip.
 * * 🔽 Math.PI/2: `c` and `a` are on horizontal, `c` to the left. `b` at the bottom.
 * * 🔼 Math.PI*1.5: `c` and `a` are on horizontal, `c` to the right. `b` at the top. (default)
 * @param t
 * @param origin
 * @param rotationRad
 * @returns
 */
var fromCenter = function (t, origin, rotationRad) {
    if (origin === void 0) { origin = { x: 0, y: 0 }; }
    var r = resolveLength(t) / Math.sqrt(3);
    var rot = rotationRad !== null && rotationRad !== void 0 ? rotationRad : Math.PI * 1.5;
    var b = {
        x: r * Math.cos(rot) + origin.x,
        y: r * Math.sin(rot) + origin.y
    };
    var a = {
        x: r * Math.cos(rot + pi4over3) + origin.x,
        y: r * Math.sin(rot + pi4over3) + origin.y
    };
    var c = {
        x: r * Math.cos(rot + pi2over3) + origin.x,
        y: r * Math.sin(rot + pi2over3) + origin.y
    };
    return Object.freeze({ a: a, b: b, c: c });
};
exports.fromCenter = fromCenter;
/**
 * Calculate center from the given point A
 * @param t
 * @param ptA
 * @returns
 */
var centerFromA = function (t, ptA) {
    if (ptA === void 0) { ptA = { x: 0, y: 0 }; }
    var r = resolveLength(t);
    var radius = (0, exports.incircle)(t).radius;
    return {
        x: ptA.x + r / 2,
        y: ptA.y - radius
    };
};
exports.centerFromA = centerFromA;
/**
 * Calculate center from the given point B
 * @param t
 * @param ptB
 * @returns
 */
var centerFromB = function (t, ptB) {
    if (ptB === void 0) { ptB = { x: 0, y: 0 }; }
    var radius = (0, exports.incircle)(t).radius;
    return {
        x: ptB.x,
        y: ptB.y + (radius * 2)
    };
};
exports.centerFromB = centerFromB;
/**
 * Calculate center from the given point C
 * @param t
 * @param ptC
 * @returns
 */
var centerFromC = function (t, ptC) {
    if (ptC === void 0) { ptC = { x: 0, y: 0 }; }
    var r = resolveLength(t);
    var radius = (0, exports.incircle)(t).radius;
    return {
        x: ptC.x - r / 2,
        y: ptC.y - (radius)
    };
};
exports.centerFromC = centerFromC;
/**
 * Returns the height (or rise) of an equilateral triangle.
 * Ie. from one vertex to the perpendicular edge.
 * (line marked x in the diagram below)
 *
 * ```
 *      .
 *     .x .
 *    . x  .
 *   .  x   .
 *  ..........
 * ```
 * @param t
 */
var height = function (t) { return Math.sqrt(3) / 2 * resolveLength(t); };
exports.height = height;
var perimeter = function (t) { return resolveLength(t) * 3; };
exports.perimeter = perimeter;
var area = function (t) { return Math.pow(resolveLength(t), 2) * Math.sqrt(3) / 4; };
exports.area = area;
/**
 * Circle that encompasses all points of triangle
 * @param t
 */
var circumcircle = function (t) { return ({
    radius: Math.sqrt(3) / 3 * resolveLength(t)
}); };
exports.circumcircle = circumcircle;
/**
 * Circle that is inside the edges of the triangle
 * @param t
 * @returns
 */
var incircle = function (t) { return ({
    radius: Math.sqrt(3) / 6 * resolveLength(t)
}); };
exports.incircle = incircle;
//# sourceMappingURL=TriangleEquilateral.js.map