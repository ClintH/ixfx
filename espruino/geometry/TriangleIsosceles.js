"use strict";
exports.__esModule = true;
exports.fromC = exports.fromB = exports.fromA = exports.fromCenter = exports.medians = exports.incircle = exports.circumcircle = exports.area = exports.perimeter = exports.legHeights = exports.height = exports.apexAngle = exports.baseAngle = void 0;
var baseAngle = function (t) { return Math.acos(t.base / (2 * t.legs)); };
exports.baseAngle = baseAngle;
var apexAngle = function (t) {
    var aa = t.legs * t.legs;
    var cc = t.base * t.base;
    return Math.acos((2 * aa - cc) / (2 * aa));
};
exports.apexAngle = apexAngle;
var height = function (t) {
    var aa = t.legs * t.legs;
    var cc = t.base * t.base;
    return Math.sqrt((4 * aa - cc) / 4);
};
exports.height = height;
var legHeights = function (t) {
    var b = (0, exports.baseAngle)(t);
    return t.base * Math.sin(b);
};
exports.legHeights = legHeights;
var perimeter = function (t) { return 2 * t.legs + t.base; };
exports.perimeter = perimeter;
var area = function (t) {
    var h = (0, exports.height)(t);
    return h * t.base / 2;
};
exports.area = area;
var circumcircle = function (t) {
    var h = (0, exports.height)(t);
    var hh = h * h;
    var cc = t.base * t.base;
    return { radius: (4 * hh + cc) / (8 * h) };
};
exports.circumcircle = circumcircle;
var incircle = function (t) {
    var h = (0, exports.height)(t);
    return { radius: t.base * h / (2 * t.legs + t.base) };
};
exports.incircle = incircle;
var medians = function (t) {
    var aa = t.legs * t.legs;
    var cc = t.base * t.base;
    var medianAB = Math.sqrt(aa + 2 * cc) / 2;
    var medianC = Math.sqrt(4 * aa - cc) / 2;
    return [medianAB, medianAB, medianC];
};
exports.medians = medians;
/**
 * Returns a positioned `Triangle` based on a center origin.
 * Center is determined by the intesecting of the medians.
 *
 * See: https://rechneronline.de/pi/isosceles-triangle.php
 * @param t
 * @param origin
 * @returns
 */
var fromCenter = function (t, origin) {
    if (origin === void 0) { origin = { x: 0, y: 0 }; }
    var h = (0, exports.height)(t);
    var incircleR = (0, exports.incircle)(t).radius;
    var verticalToApex = h - incircleR;
    var a = { x: origin.x - t.base / 2, y: origin.y + incircleR };
    var b = { x: origin.x + t.base / 2, y: origin.y + incircleR };
    var c = { x: origin.x, y: origin.y - verticalToApex };
    return { a: a, b: b, c: c };
};
exports.fromCenter = fromCenter;
var fromA = function (t, origin) {
    if (origin === void 0) { origin = { x: 0, y: 0 }; }
    var h = (0, exports.height)(t);
    var a = { x: origin.x, y: origin.y };
    var b = { x: origin.x + t.base, y: origin.y };
    var c = { x: origin.x + t.base / 2, y: origin.y - h };
    return { a: a, b: b, c: c };
};
exports.fromA = fromA;
var fromB = function (t, origin) {
    if (origin === void 0) { origin = { x: 0, y: 0 }; }
    var h = (0, exports.height)(t);
    var b = { x: origin.x, y: origin.y };
    var a = { x: origin.x - t.base, y: origin.y };
    var c = { x: origin.x - t.base / 2, y: origin.y - h };
    return { a: a, b: b, c: c };
};
exports.fromB = fromB;
var fromC = function (t, origin) {
    if (origin === void 0) { origin = { x: 0, y: 0 }; }
    var h = (0, exports.height)(t);
    var c = { x: origin.x, y: origin.y };
    var a = { x: origin.x - t.base / 2, y: origin.y + h };
    var b = { x: origin.x + t.base / 2, y: origin.y + h };
    return { a: a, b: b, c: c };
};
exports.fromC = fromC;
//# sourceMappingURL=TriangleIsosceles.js.map