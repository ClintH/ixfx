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
exports.rotate = exports.intersectsPoint = exports.barycentricToCartestian = exports.barycentricCoord = exports.bbox = exports.fromPoints = exports.fromFlatArray = exports.toFlatArray = exports.equilateralFromVertex = exports.rotateByVertex = exports.fromRadius = exports.outerCircle = exports.innerCircle = exports.area = exports.perimeter = exports.centroid = exports.isObtuse = exports.isAcute = exports.isOblique = exports.isRightAngle = exports.isIsoceles = exports.isEquilateral = exports.anglesDegrees = exports.angles = exports.lengths = exports.edges = exports.corners = exports.isEqual = exports.isTriangle = exports.guard = exports.apply = exports.isPlaceholder = exports.isEmpty = exports.Placeholder = exports.Empty = exports.Isosceles = exports.Right = exports.Equilateral = void 0;
var index_js_1 = require("./index.js");
var Points = __importStar(require("./Point.js"));
var Guards_js_1 = require("../Guards.js");
/**
 * Functions for working with equilateral triangles, defined by length
 */
exports.Equilateral = __importStar(require("./TriangleEquilateral.js"));
/**
 * Functions for working with right-angled triangles, defined by two of three edges
 */
exports.Right = __importStar(require("./TriangleRight.js"));
exports.Isosceles = __importStar(require("./TriangleIsosceles.js"));
var piPi = Math.PI * 2;
/**
 * A triangle consisting of three empty points (Points.Empty)
 */
//eslint-disable-next-line @typescript-eslint/naming-convention
exports.Empty = Object.freeze({ a: { x: 0, y: 0 }, b: { x: 0, y: 0 }, c: { x: 0, y: 0 } });
/**
 * A triangle consisting of three placeholder points (Points.Placeholder)
 */
//eslint-disable-next-line @typescript-eslint/naming-convention
exports.Placeholder = Object.freeze({ a: { x: NaN, y: NaN }, b: { x: NaN, y: NaN }, c: { x: NaN, y: NaN } });
/**
 * Returns true if triangle is empty
 * @param t
 * @returns
 */
var isEmpty = function (t) { return Points.isEmpty(t.a) && Points.isEmpty(t.b) && Points.isEmpty(t.c); };
exports.isEmpty = isEmpty;
/**
 * Returns true if triangle is a placeholder
 * @param t
 * @returns
 */
var isPlaceholder = function (t) { return Points.isPlaceholder(t.a) && Points.isPlaceholder(t.b) && Points.isPlaceholder(t.c); };
exports.isPlaceholder = isPlaceholder;
/**
 * Applies `fn` to each of a triangle's corner points, returning the result.
 *
 * @example Add some random to the x of each corner
 * ```
 * const t = apply(tri, p => {
 *  const r = 10;
 *  return {
 *    x: p.x + (Math.random()*r*2) - r,
 *    y: p.y
 *  }
 * });
 * ```
 * @param t
 * @param fn
 * @returns
 */
var apply = function (t, fn) { return Object.freeze(__assign(__assign({}, t), { a: fn(t.a, "a"), b: fn(t.b, "b"), c: fn(t.c, "c") })); };
exports.apply = apply;
/**
 * Throws an exception if the triangle is invalid
 * @param t
 * @param name
 */
var guard = function (t, name) {
    if (name === void 0) { name = "t"; }
    if (t === undefined)
        throw Error("{$name} undefined");
    Points.guard(t.a, name + ".a");
    Points.guard(t.b, name + ".b");
    Points.guard(t.c, name + ".c");
};
exports.guard = guard;
/**
 * Returns true if the parameter appears to be a valid triangle
 * @param p
 * @returns
 */
var isTriangle = function (p) {
    if (p === undefined)
        return false;
    var tri = p;
    if (!Points.isPoint(tri.a))
        return false;
    if (!Points.isPoint(tri.b))
        return false;
    if (!Points.isPoint(tri.c))
        return false;
    return true;
};
exports.isTriangle = isTriangle;
/**
 * Returns true if the two parameters have equal values
 * @param a
 * @param b
 * @returns
 */
var isEqual = function (a, b) { return Points.isEqual(a.a, b.a) && Points.isEqual(a.b, b.b) && Points.isEqual(a.c, b.c); };
exports.isEqual = isEqual;
/**
 * Returns the corners (vertices) of the triangle as an array of points
 * @param t
 * @returns Array of length three
 */
var corners = function (t) {
    (0, exports.guard)(t);
    return [t.a, t.b, t.c];
};
exports.corners = corners;
/**
 * Returns the edges (ie sides) of the triangle as an array of lines
 * @param t
 * @returns Array of length three
 */
var edges = function (t) {
    (0, exports.guard)(t);
    return index_js_1.Lines.joinPointsToLines(t.a, t.b, t.c, t.a);
};
exports.edges = edges;
/**
 * Returns the lengths of the triangle sides
 * @param t
 * @returns Array of length three
 */
var lengths = function (t) {
    (0, exports.guard)(t);
    return [
        Points.distance(t.a, t.b),
        Points.distance(t.b, t.c),
        Points.distance(t.c, t.a)
    ];
};
exports.lengths = lengths;
/**
 * Return the three interior angles of the triangle, in radians.
 * @param t
 * @returns
 */
var angles = function (t) {
    (0, exports.guard)(t);
    return [
        Points.angle(t.a, t.b),
        Points.angle(t.b, t.c),
        Points.angle(t.c, t.a)
    ];
};
exports.angles = angles;
/**
 * Returns the three interior angles of the triangle, in degrees
 * @param t
 * @returns
 */
var anglesDegrees = function (t) {
    (0, exports.guard)(t);
    return (0, index_js_1.radianToDegree)((0, exports.angles)(t));
};
exports.anglesDegrees = anglesDegrees;
/**
 * Returns true if it is an equilateral triangle
 * @param t
 * @returns
 */
var isEquilateral = function (t) {
    (0, exports.guard)(t);
    var _a = (0, exports.lengths)(t), a = _a[0], b = _a[1], c = _a[2];
    return a === b && b === c;
};
exports.isEquilateral = isEquilateral;
/**
 * Returns true if it is an isoceles triangle
 * @param t
 * @returns
 */
var isIsoceles = function (t) {
    var _a = (0, exports.lengths)(t), a = _a[0], b = _a[1], c = _a[2];
    if (a === b)
        return true;
    if (b === c)
        return true;
    if (c === a)
        return true;
    return false;
};
exports.isIsoceles = isIsoceles;
/**
 * Returns true if at least one interior angle is 90 degrees
 * @param t
 * @returns
 */
var isRightAngle = function (t) { return ((0, exports.angles)(t).some(function (v) { return v === Math.PI / 2; })); };
exports.isRightAngle = isRightAngle;
/**
 * Returns true if triangle is oblique: No interior angle is 90 degrees
 * @param t
 * @returns
 */
var isOblique = function (t) { return !(0, exports.isRightAngle)(t); };
exports.isOblique = isOblique;
/**
 * Returns true if triangle is actue: all interior angles less than 90 degrees
 * @param t
 * @returns
 */
var isAcute = function (t) { return (!(0, exports.angles)(t).some(function (v) { return v >= Math.PI / 2; })); };
exports.isAcute = isAcute;
/**
 * Returns true if triangle is obtuse: at least one interior angle is greater than 90 degrees
 * @param t
 * @returns
 */
var isObtuse = function (t) { return ((0, exports.angles)(t).some(function (v) { return v > Math.PI / 2; })); };
exports.isObtuse = isObtuse;
/**
 * Returns simple centroid of triangle
 * @param t
 * @returns
 */
var centroid = function (t) {
    (0, exports.guard)(t);
    var total = Points.reduce([t.a, t.b, t.c], function (p, acc) { return ({
        x: p.x + acc.x,
        y: p.y + acc.y
    }); });
    var div = {
        x: total.x / 3,
        y: total.y / 3
    };
    return div;
};
exports.centroid = centroid;
/**
 * Calculates perimeter of a triangle
 * @param t
 * @returns
 */
var perimeter = function (t) {
    (0, exports.guard)(t);
    return (0, exports.edges)(t).reduce(function (acc, v) { return acc + index_js_1.Lines.length(v); }, 0);
};
exports.perimeter = perimeter;
/**
 * Calculates the area of a triangle
 * @param t
 * @returns
 */
var area = function (t) {
    (0, exports.guard)(t, "t");
    // Get length of edges
    var e = (0, exports.edges)(t).map(function (l) { return index_js_1.Lines.length(l); });
    // Add up length of edges, halve
    var p = (e[0] + e[1] + e[2]) / 2;
    return Math.sqrt(p * (p - e[0]) * (p - e[1]) * (p - e[2]));
};
exports.area = area;
/**
 * Returns the largest circle enclosed by triangle `t`.
 * @param t
 */
var innerCircle = function (t) {
    var c = (0, exports.centroid)(t);
    var p = (0, exports.perimeter)(t) / 2;
    var a = (0, exports.area)(t);
    var radius = a / p;
    return __assign({ radius: radius }, c);
};
exports.innerCircle = innerCircle;
/**
 * Returns the largest circle touching the corners of triangle `t`.
 * @param t
 * @returns
 */
var outerCircle = function (t) {
    var _a = (0, exports.edges)(t).map(function (l) { return index_js_1.Lines.length(l); }), a = _a[0], b = _a[1], c = _a[2];
    var cent = (0, exports.centroid)(t);
    var radius = a * b * c / Math.sqrt((a + b + c) * (-a + b + c) * (a - b + c) * (a + b - c));
    return __assign({ radius: radius }, cent);
};
exports.outerCircle = outerCircle;
/**
 * Returns an equilateral triangle centered at the origin.
 *
 * ```js
 * // Create a triangle at 100,100 with radius of 60
 * const tri = fromRadius({x:100,y:100}, 60);
 *
 * // Triangle with point A upwards, B to the right, C to the left
 * constr tri2 = fromRadius({x:100,y:100}, 60, {initialAngleRadian: -Math.PI / 2});
 * ```
 *
 *
 * @param origin
 * @param length
 */
var fromRadius = function (origin, radius, opts) {
    var _a;
    if (opts === void 0) { opts = {}; }
    (0, Guards_js_1.number)(radius, "positive", "radius");
    Points.guard(origin, "origin");
    var initialAngleRadian = (_a = opts.initialAngleRadian) !== null && _a !== void 0 ? _a : 0;
    var angles = [initialAngleRadian, initialAngleRadian + piPi * 1 / 3, initialAngleRadian + piPi * 2 / 3];
    var points = angles.map(function (a) { return index_js_1.Polar.toCartesian(radius, a, origin); });
    return (0, exports.fromPoints)(points);
};
exports.fromRadius = fromRadius;
/**
 * Rotates the vertices of the triangle around one point (by default, `b`).
 * @param triangle Triangle
 * @param vertex Name of vertex: a, b or c.
 */
var rotateByVertex = function (triangle, amountRadian, vertex) {
    if (vertex === void 0) { vertex = "b"; }
    var origin = vertex === "a" ? triangle.a : vertex === "b" ? triangle.b : triangle.c;
    return Object.freeze({
        a: Points.rotate(triangle.a, amountRadian, origin),
        b: Points.rotate(triangle.b, amountRadian, origin),
        c: Points.rotate(triangle.c, amountRadian, origin)
    });
};
exports.rotateByVertex = rotateByVertex;
/**
 * Returns a triangle anchored at `origin` with a given `length` and `angleRadian`.
 * The origin will be point `b` of the triangle, and the angle will be the angle for b.
 * @param origin Origin
 * @param length Length
 * @param angleRadian Angle
 * @returns
 */
var equilateralFromVertex = function (origin, length, angleRadian) {
    if (origin === void 0) { origin = { x: 0, y: 0 }; }
    if (length === void 0) { length = 10; }
    if (angleRadian === void 0) { angleRadian = Math.PI / 2; }
    var a = Points.project(origin, length, (Math.PI - (-angleRadian / 2)));
    var c = Points.project(origin, length, (Math.PI - (angleRadian / 2)));
    return { a: a, b: origin, c: c };
};
exports.equilateralFromVertex = equilateralFromVertex;
/**
 * Returns the coordinates of triangle in a flat array form:
 * [xA, yA, xB, yB, xC, yC]
 * @param t
 * @returns
 */
var toFlatArray = function (t) {
    (0, exports.guard)(t);
    return [
        t.a.x, t.a.y,
        t.b.x, t.b.y,
        t.c.x, t.c.y
    ];
};
exports.toFlatArray = toFlatArray;
/**
 * Returns a triangle from a set of coordinates in a flat array form:
 * [xA, yA, xB, yB, xC, yC]
 * @param coords
 * @returns
 */
var fromFlatArray = function (coords) {
    if (!Array.isArray(coords))
        throw new Error("coords expected as array");
    if (coords.length !== 6)
        throw new Error("coords array expected with 6 elements. Got ".concat(coords.length));
    return (0, exports.fromPoints)(Points.fromNumbers.apply(Points, coords));
};
exports.fromFlatArray = fromFlatArray;
/**
 * Returns a triangle from an array of three points
 * @param points
 * @returns
 */
var fromPoints = function (points) {
    if (!Array.isArray(points))
        throw new Error("points expected as array");
    if (points.length !== 3)
        throw new Error("points array expected with 3 elements. Got ".concat(points.length));
    var t = {
        a: points[0],
        b: points[1],
        c: points[2]
    };
    return t;
};
exports.fromPoints = fromPoints;
/**
 * Returns the bounding box that encloses the triangle.
 * @param t
 * @param inflation If specified, box will be inflated by this much. Default: 0.
 * @returns
 */
var bbox = function (t, inflation) {
    if (inflation === void 0) { inflation = 0; }
    var a = t.a, b = t.b, c = t.c;
    var xMin = Math.min(a.x, b.x, c.x) - inflation;
    var xMax = Math.max(a.x, b.x, c.x) + inflation;
    var yMin = Math.min(a.y, b.y, c.y) - inflation;
    var yMax = Math.max(a.y, b.y, c.y) + inflation;
    var r = {
        x: xMin,
        y: yMin,
        width: xMax - xMin,
        height: yMax - yMin
    };
    return r;
};
exports.bbox = bbox;
/**
 * Returns the [Barycentric coordinate](https://en.wikipedia.org/wiki/Barycentric_coordinate_system) of a point within a triangle
 *
 * @param t
 * @param a
 * @param b
 * @returns
 */
var barycentricCoord = function (t, a, b) {
    var pt = Points.getPointParam(a, b);
    var ab = function (x, y, pa, pb) { return (pa.y - pb.y) * x + (pb.x - pa.x) * y + pa.x * pb.y - pb.x * pa.y; };
    var alpha = ab(pt.x, pt.y, t.b, t.c) / ab(t.a.x, t.a.y, t.b, t.c);
    var theta = ab(pt.x, pt.y, t.c, t.a) / ab(t.b.x, t.b.y, t.c, t.a);
    var gamma = ab(pt.x, pt.y, t.a, t.b) / ab(t.c.x, t.c.y, t.a, t.b);
    return {
        a: alpha,
        b: theta,
        c: gamma
    };
};
exports.barycentricCoord = barycentricCoord;
/**
 * Convert Barycentric coordinate to Cartesian
 * @param t
 * @param bc
 * @returns
 */
var barycentricToCartestian = function (t, bc) {
    (0, exports.guard)(t);
    var a = t.a, b = t.b, c = t.c;
    var x = a.x * bc.a + b.x * bc.b + c.x * bc.c;
    var y = a.y * bc.a + b.y * bc.b + c.y * bc.c;
    if (a.z && b.z && c.z) {
        var z = a.z * bc.a + b.z * bc.b + c.z * bc.c;
        return Object.freeze({ x: x, y: y, z: z });
    }
    else {
        return Object.freeze({ x: x, y: y });
    }
};
exports.barycentricToCartestian = barycentricToCartestian;
/**
 * Returns true if point is within or on the boundary of triangle
 * @param t
 * @param a
 * @param b
 */
var intersectsPoint = function (t, a, b) {
    var box = (0, exports.bbox)(t);
    var pt = Points.getPointParam(a, b);
    // If it's not in the bounding box, can return false straight away
    if (!index_js_1.Rects.intersectsPoint(box, pt))
        return false;
    var bc = (0, exports.barycentricCoord)(t, pt);
    return 0 <= bc.a && bc.a <= 1 && 0 <= bc.b && bc.b <= 1 && 0 <= bc.c && bc.c <= 1;
};
exports.intersectsPoint = intersectsPoint;
/**
 * Returns a triangle that is rotated by `angleRad`. By default it rotates
 * around its center but an arbitrary `origin` point can be provided.
 *
 * ```js
 * // Rotate triangle by 5 degrees
 * rotate(triangle, degreeToRadian(5));
 *
 * // Rotate by 90 degrees
 * rotate(triangle, Math.PI / 2);
 * ```
 * @param line Line to rotate
 * @param amountRadian Angle in radians to rotate by
 * @param origin Point to rotate around. If undefined, middle of line will be used
 * @returns
 */
var rotate = function (t, amountRadian, origin) {
    if (amountRadian === undefined || amountRadian === 0)
        return t;
    if (origin === undefined)
        origin = (0, exports.centroid)(t);
    return Object.freeze(__assign(__assign({}, t), { a: Points.rotate(t.a, amountRadian, origin), b: Points.rotate(t.b, amountRadian, origin), c: Points.rotate(t.c, amountRadian, origin) }));
};
exports.rotate = rotate;
//# sourceMappingURL=Triangle.js.map