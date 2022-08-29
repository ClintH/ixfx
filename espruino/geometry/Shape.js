"use strict";
exports.__esModule = true;
exports.arrow = exports.starburst = exports.center = void 0;
var Polar_js_1 = require("./Polar.js");
var Guards_js_1 = require("../Guards.js");
var index_js_1 = require("./index.js");
/**
 * Returns the center of a shape
 * Shape can be: rectangle, triangle, circle
 * @param shape
 * @returns
 */
var center = function (shape) {
    if (shape === undefined) {
        return Object.freeze({ x: 0.5, y: 0.5 });
    }
    else if (index_js_1.Rects.isRect(shape)) {
        return index_js_1.Rects.center(shape);
    }
    else if (index_js_1.Triangles.isTriangle(shape)) {
        return index_js_1.Triangles.centroid(shape);
    }
    else if (index_js_1.Circles.isCircle(shape)) {
        return index_js_1.Circles.center(shape);
    }
    else {
        throw new Error("Unknown shape: ".concat(JSON.stringify(shape)));
    }
};
exports.center = center;
/**
 * Generates a starburst shape, returning an array of points. By default, initial point is top and horizontally-centred.
 *
 * ```
 * // Generate a starburst with four spikes
 * const pts = starburst(4, 100, 200);
 * ```
 *
 * `points` of two produces a lozenge shape.
 * `points` of three produces a triangle shape.
 * `points` of five is the familiar 'star' shape.
 *
 * Note that the path will need to be closed back to the first point to enclose the shape.
 *
 * @example Create starburst and draw it. Note use of 'loop' flag to close the path
 * ```
 * const points = starburst(4, 100, 200);
 * Drawing.connectedPoints(ctx, pts, {loop: true, fillStyle: `orange`, strokeStyle: `red`});
 * ```
 *
 * Options:
 * * initialAngleRadian: angle offset to begin from. This overrides the `-Math.PI/2` default.
 *
 * @param points Number of points in the starburst. Defaults to five, which produces a typical star
 * @param innerRadius Inner radius. A proportionally smaller inner radius makes for sharper spikes. If unspecified, 50% of the outer radius is used.
 * @param outerRadius Outer radius. Maximum radius of a spike to origin
 * @param opts Options
 * @param origin Origin, or `{ x:0, y:0 }` by default.
 */
var starburst = function (outerRadius, points, innerRadius, origin, opts) {
    var _a;
    if (points === void 0) { points = 5; }
    if (origin === void 0) { origin = { x: 0, y: 0 }; }
    (0, Guards_js_1.integer)(points, "positive", "points");
    var angle = Math.PI * 2 / points;
    var angleHalf = angle / 2;
    var initialAngle = (_a = opts === null || opts === void 0 ? void 0 : opts.initialAngleRadian) !== null && _a !== void 0 ? _a : -Math.PI / 2;
    if (innerRadius === undefined)
        innerRadius = outerRadius / 2;
    //eslint-disable-next-line functional/no-let
    var a = initialAngle;
    var pts = [];
    //eslint-disable-next-line functional/no-let
    for (var i = 0; i < points; i++) {
        var peak = (0, Polar_js_1.toCartesian)(outerRadius, a, origin);
        var left = (0, Polar_js_1.toCartesian)(innerRadius, a - angleHalf, origin);
        var right = (0, Polar_js_1.toCartesian)(innerRadius, a + angleHalf, origin);
        //eslint-disable-next-line functional/immutable-data
        pts.push(left, peak);
        //eslint-disable-next-line functional/immutable-data
        if (i + 1 < points)
            pts.push(right);
        a += angle;
    }
    return pts;
};
exports.starburst = starburst;
/**
 * Returns the points forming an arrow.
 *
 * @example Create an arrow anchored by its tip at 100,100
 * ```js
 * const opts = {
 *  tailLength: 10,
 *  arrowSize: 20,
 *  tailThickness: 5,
 *  angleRadian: degreeToRadian(45)
 * }
 * const arrow = Shapes.arrow({x:100, y:100}, `tip`, opts); // Yields an array of points
 *
 * // Eg: draw points
 * Drawing.connectedPoints(ctx, arrow, {strokeStyle: `red`, loop: true});
 * ```
 *
 * @param origin Origin of arrow
 * @param from Does origin describe the tip, tail or middle?
 * @param opts Options for arrow
 * @returns
 */
var arrow = function (origin, from, opts) {
    var _a, _b, _c, _d;
    if (opts === void 0) { opts = {}; }
    var tailLength = (_a = opts.tailLength) !== null && _a !== void 0 ? _a : 10;
    var tailThickness = (_b = opts.tailThickness) !== null && _b !== void 0 ? _b : Math.max(tailLength / 5, 5);
    var angleRadian = (_c = opts.angleRadian) !== null && _c !== void 0 ? _c : 0;
    var arrowSize = (_d = opts.arrowSize) !== null && _d !== void 0 ? _d : Math.max(tailLength / 5, 15);
    var triAngle = Math.PI / 2;
    //eslint-disable-next-line functional/no-let
    var tri;
    //eslint-disable-next-line functional/no-let
    var tailPoints;
    if (from === "tip") {
        tri = index_js_1.Triangles.equilateralFromVertex(origin, arrowSize, triAngle);
        tailPoints = index_js_1.Rects.corners(index_js_1.Rects.fromTopLeft({ x: tri.a.x - tailLength, y: origin.y - tailThickness / 2 }, tailLength, tailThickness));
    }
    else if (from === "middle") {
        var midX = tailLength + arrowSize / 2;
        var midY = tailThickness / 2;
        tri = index_js_1.Triangles.equilateralFromVertex({
            x: origin.x + arrowSize * 1.2,
            y: origin.y
        }, arrowSize, triAngle);
        tailPoints = index_js_1.Rects.corners(index_js_1.Rects.fromTopLeft({ x: origin.x - midX, y: origin.y - midY }, tailLength + arrowSize, tailThickness));
    }
    else {
        //const midY = origin.y - tailThickness/2;
        tailPoints = index_js_1.Rects.corners(index_js_1.Rects.fromTopLeft({ x: origin.x, y: origin.y - tailThickness / 2 }, tailLength, tailThickness));
        tri = index_js_1.Triangles.equilateralFromVertex({ x: origin.x + tailLength + arrowSize * 0.7, y: origin.y }, arrowSize, triAngle);
    }
    var arrow = index_js_1.Points.rotate([
        tailPoints[0], tailPoints[1], tri.a,
        tri.b,
        tri.c, tailPoints[2], tailPoints[3]
    ], angleRadian, origin);
    return arrow;
};
exports.arrow = arrow;
//# sourceMappingURL=Shape.js.map