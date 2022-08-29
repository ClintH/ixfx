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
exports.radiansFromAxisX = exports.radianToDegree = exports.degreeToRadian = exports.Triangles = exports.Shapes = exports.Polar = exports.Ellipses = exports.Compound = exports.Beziers = exports.Grids = exports.Paths = exports.Points = exports.Rects = exports.Lines = exports.Arcs = exports.Circles = void 0;
var Arcs = __importStar(require("./Arc.js"));
exports.Arcs = Arcs;
var Beziers = __importStar(require("./Bezier.js"));
exports.Beziers = Beziers;
var Circles = __importStar(require("./Circle.js"));
exports.Circles = Circles;
var Compound = __importStar(require("./CompoundPath.js"));
exports.Compound = Compound;
var Grids = __importStar(require("./Grid.js"));
exports.Grids = Grids;
var Lines = __importStar(require("./Line.js"));
exports.Lines = Lines;
var Paths = __importStar(require("./Path.js"));
exports.Paths = Paths;
var Points = __importStar(require("./Point.js"));
exports.Points = Points;
var Rects = __importStar(require("./Rect.js"));
exports.Rects = Rects;
var Ellipses = __importStar(require("./Ellipse.js"));
exports.Ellipses = Ellipses;
var Polar = __importStar(require("./Polar.js"));
exports.Polar = Polar;
var Shapes = __importStar(require("./Shape.js"));
exports.Shapes = Shapes;
/**
 * Triangle processing.
 *
 * Helpers for creating:
 * - {@link Triangles.fromFlatArray}: Create from `[ x1, y1, x2, y2, x3, y3 ]`
 * - {@link Triangles.fromPoints}: Create from three `{ x, y }` sets
 * - {@link Triangles.fromRadius}: Equilateral triangle of a given radius and center
 *
 * There are two sub-modules for dealing with particular triangles:
 * - {@link Triangles.Equilateral}: Equilateral triangls
 * - {@link Triangles.Right}: Right-angled triangles
 */
exports.Triangles = __importStar(require("./Triangle.js"));
//eslint-disable-next-line func-style
function degreeToRadian(angleInDegrees) {
    if (Array.isArray(angleInDegrees)) {
        return angleInDegrees.map(function (v) { return v * (Math.PI / 180.0); });
    }
    else {
        return angleInDegrees * (Math.PI / 180.0);
    }
}
exports.degreeToRadian = degreeToRadian;
//eslint-disable-next-line func-style
function radianToDegree(angleInRadians) {
    if (Array.isArray(angleInRadians)) {
        return angleInRadians.map(function (v) { return v * 180 / Math.PI; });
    }
    else {
        return angleInRadians * 180 / Math.PI;
    }
}
exports.radianToDegree = radianToDegree;
/**
 * Angle from x-axis to point (ie. `Math.atan2`)
 * @param point
 * @returns
 */
var radiansFromAxisX = function (point) { return Math.atan2(point.x, point.y); };
exports.radiansFromAxisX = radiansFromAxisX;
try {
    if (typeof window !== "undefined") {
        //eslint-disable-next-line functional/immutable-data,@typescript-eslint/no-explicit-any
        window.ixfx = __assign(__assign({}, window.ixfx), { Geometry: { Circles: Circles, Arcs: Arcs, Lines: Lines, Rects: Rects, Points: Points, Paths: Paths, Grids: Grids, Beziers: Beziers, Compound: Compound, Ellipses: Ellipses, Polar: Polar, Shapes: Shapes, radiansFromAxisX: exports.radiansFromAxisX, radianToDegree: radianToDegree, degreeToRadian: degreeToRadian } });
    }
}
catch ( /* no-op */_a) { /* no-op */ }
//# sourceMappingURL=index.js.map