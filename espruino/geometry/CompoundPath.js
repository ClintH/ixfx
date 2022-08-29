"use strict";
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
exports.fromPaths = exports.toSvgString = exports.guardContinuous = exports.toString = exports.bbox = exports.computeDimensions = exports.interpolate = exports.setSegment = void 0;
var index_js_1 = require("./index.js");
/**
 * Returns a new compoundpath, replacing a path at a given index
 *
 * @param {CompoundPath} compoundPath Existing compoundpath
 * @param {number} index Index to replace at
 * @param {Paths.Path} path Path to substitute in
 * @returns {CompoundPath} New compoundpath
 */
var setSegment = function (compoundPath, index, path) {
    var existing = __spreadArray([], compoundPath.segments, true);
    //eslint-disable-next-line functional/prefer-readonly-type,functional/immutable-data
    existing[index] = path;
    return exports.fromPaths.apply(void 0, existing);
};
exports.setSegment = setSegment;
/**
 * Computes x,y point at a relative position along compoundpath
 *
 * @param {Paths.Path[]} paths Combined paths (assumes contiguous)
 * @param {number} t Position (given as a percentage from 0 to 1)
 * @param {boolean} [useWidth] If true, widths are used for calulcating. If false, lengths are used
 * @param {Dimensions} [dimensions] Precalculated dimensions of paths, will be computed if omitted
 * @returns
 */
var interpolate = function (paths, t, useWidth, dimensions) {
    if (dimensions === undefined) {
        dimensions = (0, exports.computeDimensions)(paths);
    }
    // Expected value to land on
    var expected = t * (useWidth ? dimensions.totalWidth : dimensions.totalLength);
    //eslint-disable-next-line functional/no-let
    var soFar = 0;
    // Use widths or lengths?
    var l = useWidth ? dimensions.widths : dimensions.lengths;
    //eslint-disable-next-line functional/no-let
    for (var i = 0; i < l.length; i++) {
        if (soFar + l[i] >= expected) {
            var relative = expected - soFar;
            //eslint-disable-next-line functional/no-let
            var amt = relative / l[i];
            //eslint-disable-next-line functional/no-let
            if (amt > 1)
                amt = 1;
            return paths[i].interpolate(amt);
        }
        else
            soFar += l[i];
    }
    return { x: 0, y: 0 };
};
exports.interpolate = interpolate;
/**
 * Computes the widths and lengths of all paths, adding them up as well
 *
 * @param {Paths.Path[]} paths
 * @returns {Dimensions}
 */
var computeDimensions = function (paths) {
    var widths = paths.map(function (l) { return l.bbox().width; });
    var lengths = paths.map(function (l) { return l.length(); });
    //eslint-disable-next-line functional/no-let
    var totalLength = 0;
    //eslint-disable-next-line functional/no-let
    var totalWidth = 0;
    //eslint-disable-next-line functional/no-let
    for (var i = 0; i < lengths.length; i++)
        totalLength += lengths[i];
    //eslint-disable-next-line functional/no-let
    for (var i = 0; i < widths.length; i++)
        totalWidth += widths[i];
    return { totalLength: totalLength, totalWidth: totalWidth, widths: widths, lengths: lengths };
};
exports.computeDimensions = computeDimensions;
/**
 * Computes the bounding box that encloses entire compoundpath
 *
 * @param {Paths.Path[]} paths
 *
 * @returns {Rects.Rect}
 */
var bbox = function (paths) {
    var boxes = paths.map(function (p) { return p.bbox(); });
    var corners = boxes.map(function (b) { return index_js_1.Rects.corners(b); }).flat();
    return index_js_1.Points.bbox.apply(index_js_1.Points, corners);
};
exports.bbox = bbox;
/**
 * Produce a human-friendly representation of paths
 *
 * @param {Paths.Path[]} paths
 * @returns {string}
 */
var toString = function (paths) { return paths.map(function (p) { return p.toString(); }).join(", "); };
exports.toString = toString;
/**
 * Throws an error if paths are not connected together, in order
 *
 * @param {Paths.Path[]} paths
 */
var guardContinuous = function (paths) {
    //eslint-disable-next-line functional/no-let
    var lastPos = index_js_1.Paths.getEnd(paths[0]);
    //eslint-disable-next-line functional/no-let
    for (var i = 1; i < paths.length; i++) {
        var start = index_js_1.Paths.getStart(paths[i]);
        if (!index_js_1.Points.isEqual(start, lastPos))
            throw new Error("Path index " + i + " does not start at prior path end. Start: " + start.x + "," + start.y + " expected: " + lastPos.x + "," + lastPos.y + "");
        lastPos = index_js_1.Paths.getEnd(paths[i]);
    }
};
exports.guardContinuous = guardContinuous;
var toSvgString = function (paths) { return paths.flatMap(function (p) { return p.toSvgString(); }); };
exports.toSvgString = toSvgString;
/**
 * Create a compoundpath from an array of paths.
 * All this does is verify they are connected, and precomputes dimensions
 *
 * @param {...Paths.Path[]} paths
 * @returns {CompoundPath}
 */
var fromPaths = function () {
    var paths = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        paths[_i] = arguments[_i];
    }
    (0, exports.guardContinuous)(paths); // Throws an error if paths are not connected
    var dims = (0, exports.computeDimensions)(paths);
    return Object.freeze({
        segments: paths,
        length: function () { return dims.totalLength; },
        interpolate: function (t, useWidth) {
            if (useWidth === void 0) { useWidth = false; }
            return (0, exports.interpolate)(paths, t, useWidth, dims);
        },
        bbox: function () { return (0, exports.bbox)(paths); },
        toString: function () { return (0, exports.toString)(paths); },
        toSvgString: function () { return (0, exports.toSvgString)(paths); },
        kind: "compound"
    });
};
exports.fromPaths = fromPaths;
//# sourceMappingURL=CompoundPath.js.map