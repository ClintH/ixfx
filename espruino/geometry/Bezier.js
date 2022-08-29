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
exports.quadratic = exports.cubic = exports.toPath = exports.quadraticToSvgString = exports.computeQuadraticSimple = exports.quadraticSimple = exports.quadraticBend = exports.isCubicBezier = exports.isQuadraticBezier = void 0;
var bezier_js_1 = require("bezier-js");
var index_js_1 = require("./index.js");
var isQuadraticBezier = function (path) { return path.quadratic !== undefined; };
exports.isQuadraticBezier = isQuadraticBezier;
var isCubicBezier = function (path) { return path.cubic1 !== undefined && path.cubic2 !== undefined; };
exports.isCubicBezier = isCubicBezier;
/**
 * Returns a new quadratic bezier with specified bend amount
 *
 * @param {QuadraticBezier} b Curve
 * @param {number} [bend=0] Bend amount, from -1 to 1
 * @returns {QuadraticBezier}
 */
var quadraticBend = function (a, b, bend) {
    if (bend === void 0) { bend = 0; }
    return (0, exports.quadraticSimple)(a, b, bend);
};
exports.quadraticBend = quadraticBend;
/**
 * Creates a simple quadratic bezier with a specified amount of 'bend'.
 * Bend of -1 will pull curve down, 1 will pull curve up. 0 is no curve
 * @param {Points.Point} start Start of curve
 * @param {Points.Point} end End of curve
 * @param {number} [bend=0] Bend amount, -1 to 1
 * @returns {QuadraticBezier}
 */
var quadraticSimple = function (start, end, bend) {
    if (bend === void 0) { bend = 0; }
    if (isNaN(bend))
        throw Error("bend is NaN");
    if (bend < -1 || bend > 1)
        throw Error("Expects bend range of -1 to 1");
    var middle = index_js_1.Lines.interpolate(0.5, start, end);
    // eslint-disable-next-line functional/no-let
    var target = middle;
    if (end.y < start.y) {
        // Upward slope
        target = bend > 0 ? { x: Math.min(start.x, end.x), y: Math.min(start.y, end.y) } :
            { x: Math.max(start.x, end.x), y: Math.max(start.y, end.y) };
    }
    else {
        // Downward slope
        target = bend > 0 ? { x: Math.max(start.x, end.x), y: Math.min(start.y, end.y) } :
            { x: Math.min(start.x, end.x), y: Math.max(start.y, end.y) };
    }
    var handle = index_js_1.Lines.interpolate(Math.abs(bend), middle, target);
    return (0, exports.quadratic)(start, end, handle);
};
exports.quadraticSimple = quadraticSimple;
/**
 * Returns a relative point on a simple quadratic
 * @param start Start
 * @param end  End
 * @param bend Bend (-1 to 1)
 * @param amt Amount
 * @returns Point
 */
var computeQuadraticSimple = function (start, end, bend, amt) {
    var q = (0, exports.quadraticSimple)(start, end, bend);
    var bzr = new bezier_js_1.Bezier(q.a, q.quadratic, q.b);
    return bzr.compute(amt);
};
exports.computeQuadraticSimple = computeQuadraticSimple;
//https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths
var quadraticToSvgString = function (start, end, handle) { return ["M ".concat(start.x, " ").concat(start.y, " Q ").concat(handle.x, " ").concat(handle.y, " ").concat(end.x, " ").concat(end.y)]; };
exports.quadraticToSvgString = quadraticToSvgString;
var toPath = function (cubicOrQuadratic) {
    if ((0, exports.isCubicBezier)(cubicOrQuadratic)) {
        return cubicToPath(cubicOrQuadratic);
    }
    else if ((0, exports.isQuadraticBezier)(cubicOrQuadratic)) {
        return quadratictoPath(cubicOrQuadratic);
    }
    else {
        throw new Error("Unknown bezier type");
    }
};
exports.toPath = toPath;
var cubic = function (start, end, cubic1, cubic2) { return ({
    a: Object.freeze(start),
    b: Object.freeze(end),
    cubic1: Object.freeze(cubic1),
    cubic2: Object.freeze(cubic2)
}); };
exports.cubic = cubic;
var cubicToPath = function (cubic) {
    var a = cubic.a, cubic1 = cubic.cubic1, cubic2 = cubic.cubic2, b = cubic.b;
    var bzr = new bezier_js_1.Bezier(a, cubic1, cubic2, b);
    return Object.freeze(__assign(__assign({}, cubic), { length: function () { return bzr.length(); }, interpolate: function (t) { return bzr.compute(t); }, bbox: function () {
            var _a = bzr.bbox(), x = _a.x, y = _a.y;
            var xSize = x.size;
            var ySize = y.size;
            if (xSize === undefined)
                throw new Error("x.size not present on calculated bbox");
            if (ySize === undefined)
                throw new Error("x.size not present on calculated bbox");
            return index_js_1.Rects.fromTopLeft({ x: x.min, y: y.min }, xSize, ySize);
        }, toString: function () { return bzr.toString(); }, toSvgString: function () { return ["brrup"]; }, kind: "bezier/cubic" }));
};
var quadratic = function (start, end, handle) { return ({
    a: Object.freeze(start),
    b: Object.freeze(end),
    quadratic: Object.freeze(handle)
}); };
exports.quadratic = quadratic;
var quadratictoPath = function (quadraticBezier) {
    var a = quadraticBezier.a, b = quadraticBezier.b, quadratic = quadraticBezier.quadratic;
    var bzr = new bezier_js_1.Bezier(a, quadratic, b);
    return Object.freeze(__assign(__assign({}, quadraticBezier), { length: function () { return bzr.length(); }, interpolate: function (t) { return bzr.compute(t); }, bbox: function () {
            var _a = bzr.bbox(), x = _a.x, y = _a.y;
            var xSize = x.size;
            var ySize = y.size;
            if (xSize === undefined)
                throw new Error("x.size not present on calculated bbox");
            if (ySize === undefined)
                throw new Error("x.size not present on calculated bbox");
            return index_js_1.Rects.fromTopLeft({ x: x.min, y: y.min }, xSize, ySize);
        }, toString: function () { return bzr.toString(); }, toSvgString: function () { return (0, exports.quadraticToSvgString)(a, b, quadratic); }, kind: "bezier/quadratic" }));
};
//# sourceMappingURL=Bezier.js.map