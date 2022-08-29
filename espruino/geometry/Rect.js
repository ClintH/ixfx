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
exports.area = exports.perimeter = exports.edges = exports.lengths = exports.center = exports.multiply = exports.normaliseByRect = exports.getEdgeY = exports.getEdgeX = exports.corners = exports.fromTopLeft = exports.guard = exports.maxFromCorners = exports.distanceFromCenter = exports.distanceFromExterior = exports.fromCenter = exports.intersectsPoint = exports.sum = exports.subtract = exports.isEqual = exports.toArray = exports.fromNumbers = exports.isEqualSize = exports.fromElement = exports.isRectPositioned = exports.isRect = exports.isPositioned = exports.isPlaceholder = exports.isEmpty = exports.placeholderPositioned = exports.placeholder = exports.emptyPositioned = exports.empty = void 0;
var index_js_1 = require("./index.js");
exports.empty = Object.freeze({ width: 0, height: 0 });
exports.emptyPositioned = Object.freeze({ x: 0, y: 0, width: 0, height: 0 });
exports.placeholder = Object.freeze({ width: Number.NaN, height: Number.NaN });
exports.placeholderPositioned = Object.freeze({ x: Number.NaN, y: Number.NaN, width: Number.NaN, height: Number.NaN });
var isEmpty = function (rect) { return rect.width === 0 && rect.height === 0; };
exports.isEmpty = isEmpty;
var isPlaceholder = function (rect) { return Number.isNaN(rect.width) && Number.isNaN(rect.height); };
exports.isPlaceholder = isPlaceholder;
/**
 * Returns _true_ if `p` has a position (x,y)
 * @param p Point, Rect or RectPositiond
 * @returns
 */
var isPositioned = function (p) { return p.x !== undefined && p.y !== undefined; };
exports.isPositioned = isPositioned;
/**
 * Returns _true_ if `p` has width and height.
 * @param p
 * @returns
 */
var isRect = function (p) {
    if (p === undefined)
        return false;
    if (p.width === undefined)
        return false;
    if (p.height === undefined)
        return false;
    return true;
};
exports.isRect = isRect;
/**
 * Returns _true_ if `p` is a positioned rectangle
 * Having width, height, x and y properties.
 * @param p
 * @returns
 */
//eslint-disable-next-line @typescript-eslint/no-explicit-any
var isRectPositioned = function (p) { return (0, exports.isRect)(p) && (0, exports.isPositioned)(p); };
exports.isRectPositioned = isRectPositioned;
/**
 * Initialise a rectangle based on the width and height of a HTML element.
 *
 * ```js
 * import { Rects } from "https://unpkg.com/ixfx/dist/geometry.js"
 * Rects.fromElement(document.querySelector(`body`));
 * ```
 * @param el
 * @returns
 */
var fromElement = function (el) { return ({ width: el.clientWidth, height: el.clientHeight }); };
exports.fromElement = fromElement;
/**
 * Returns _true_ if the width & height of the two rectangles is the same.
 *
 * ```js
 * import { Rects } from "https://unpkg.com/ixfx/dist/geometry.js";
 * const rectA = { width: 10, height: 10, x: 10, y: 10 };
 * const rectB = { width: 10, height: 10, x: 20, y: 20 };
 *
 * // True, even though x,y are different
 * Rects.isEqualSize(rectA, rectB);
 *
 * // False, because coordinates are different
 * Rects.isEqual(rectA, rectB)
 * ```
 * @param a
 * @param b
 * @returns
 */
var isEqualSize = function (a, b) {
    if (a === undefined)
        throw new Error("a undefined");
    if (b === undefined)
        throw new Error("b undefined");
    return a.width === b.width && a.height === b.height;
};
exports.isEqualSize = isEqualSize;
/**
 * Returns a rectangle from a series of numbers: x, y, width, height OR width, height
 *
 * ```js
 * import { Rects } from "https://unpkg.com/ixfx/dist/geometry.js";
 * const r1 = Rects.fromNumbers(100, 200);
 * // {width: 100, height: 200}
 *
 * const r2 = Rects.fromNumbers(10, 20, 100, 200);
 * // {x: 10, y: 20, width: 100, height: 200}
 * ```
 * Use the spread operator (...) if the source is an array:
 *
 * ```js
 * const r3 = Rects.fromNumbers(...[10, 20, 100, 200]);
 * ```
 *
 * Use {@link toArray} for the opposite conversion.
 *
 * @see toArray
 * @param xOrWidth
 * @param yOrHeight
 * @param width
 * @param height
 * @returns
 */
//eslint-disable-next-line func-style
function fromNumbers(xOrWidth, yOrHeight, width, height) {
    if (width === undefined || height === undefined) {
        if (typeof xOrWidth !== "number")
            throw new Error("width is not an number");
        if (typeof yOrHeight !== "number")
            throw new Error("height is not an number");
        return Object.freeze({ width: xOrWidth, height: yOrHeight });
    }
    if (typeof xOrWidth !== "number")
        throw new Error("x is not an number");
    if (typeof yOrHeight !== "number")
        throw new Error("y is not an number");
    if (typeof width !== "number")
        throw new Error("width is not an number");
    if (typeof height !== "number")
        throw new Error("height is not an number");
    return Object.freeze({ x: xOrWidth, y: yOrHeight, width: width, height: height });
}
exports.fromNumbers = fromNumbers;
/**
 * Converts a rectangle to an array of numbers. See {@link fromNumbers} for the opposite conversion.
 *
 * ```js
 * import { Rects } from "https://unpkg.com/ixfx/dist/geometry.js";
 * const r1 = Rects.toArray({ x: 10, y:20, width: 100, height: 200 });
 * // [10, 20, 100, 200]
 * const r2 = Rects.toArray({ width: 100, height: 200 });
 * // [100, 200]
 * ```
 * @param rect
 * @see fromNumbers
 */
// eslint-disable-next-line func-style
function toArray(rect) {
    if ((0, exports.isPositioned)(rect)) {
        return [rect.x, rect.y, rect.width, rect.height];
    }
    else if ((0, exports.isRect)(rect)) {
        return [rect.width, rect.height];
    }
    else
        throw new Error("rect param is not a rectangle. Got: ".concat(JSON.stringify(rect)));
}
exports.toArray = toArray;
/**
 * Returns _true_ if two rectangles have identical values.
 * Both rectangles must be positioned or not.
 *
 * ```js
 * import { Rects } from "https://unpkg.com/ixfx/dist/geometry.js";
 * const rectA = { width: 10, height: 10, x: 10, y: 10 };
 * const rectB = { width: 10, height: 10, x: 20, y: 20 };
 *
 * // False, because coordinates are different
 * Rects.isEqual(rectA, rectB)
 *
 * // True, even though x,y are different
 * Rects.isEqualSize(rectA, rectB);
 * ```
 * @param a
 * @param b
 * @returns
 */
var isEqual = function (a, b) {
    if ((0, exports.isPositioned)(a) && (0, exports.isPositioned)(b)) {
        if (!index_js_1.Points.isEqual(a, b))
            return false;
        return a.width === b.width && a.height === b.height;
    }
    else if (!(0, exports.isPositioned)(a) && !(0, exports.isPositioned)(b)) {
        return a.width === b.width && a.height === b.height;
    }
    else {
        // One param is positioned, the other is not
        return false;
    }
};
exports.isEqual = isEqual;
/**
 * Subtracts width/height from `a`.
 *
 * ```js
 * import { Rects } from "https://unpkg.com/ixfx/dist/geometry.js";
 * const rectA = { width: 100, height: 100 };
 * const rectB = { width: 200, height: 200 };
 *
 * // Yields: { width: -100, height: -100 }
 * Rects.subtract(rectA, rectB);
 * Rects.subtract(rectA, 200, 200);
 * ```
 * @param a
 * @param b
 * @param c
 * @returns
 */
//eslint-disable-next-line func-style
function subtract(a, b, c) {
    if (a === undefined)
        throw new Error("First parameter undefined");
    if (typeof b === "number") {
        var height = c === undefined ? 0 : c;
        return Object.freeze(__assign(__assign({}, a), { width: a.width - b, height: a.height - height }));
    }
    else {
        return Object.freeze(__assign(__assign({}, a), { width: a.width - b.width, height: a.height - b.height }));
    }
}
exports.subtract = subtract;
/**
  * Sums width/height of `b` with `a` (ie: a + b), returning result.
  *
  * ```js
  * import { Rects } from "https://unpkg.com/ixfx/dist/geometry.js";
  * const rectA = { width: 100, height: 100 };
  * const rectB = { width: 200, height: 200 };
  *
  * // Yields: { width: 300, height: 300 }
  * Rects.sum(rectA, rectB);
  * Rects.sum(rectA, 200, 200);
  * ```
  * @param a
  * @param b
  * @param c
  * @returns
  */
//eslint-disable-next-line func-style
function sum(a, b, c) {
    if (a === undefined)
        throw new Error("First parameter undefined");
    if (typeof b === "number") {
        var height = c === undefined ? 0 : c;
        return Object.freeze(__assign(__assign({}, a), { width: a.width + b, height: a.height + height }));
    }
    else {
        return Object.freeze(__assign(__assign({}, a), { width: a.width + b.width, height: a.height + b.height }));
    }
}
exports.sum = sum;
/**
 * Returns true if point is within or on boundary of `rect`.
 *
 * ```js
 * import { Rects } from "https://unpkg.com/ixfx/dist/geometry.js";
 * Rects.intersectsPoint(rect, { x: 100, y: 100});
 * Rects.intersectsPoint(rect, 100, 100);
 * ```
 * @param rect
 * @param a
 * @param b
 * @returns
 */
//eslint-disable-next-line func-style
function intersectsPoint(rect, a, b) {
    (0, exports.guard)(rect, "rect");
    //eslint-disable-next-line functional/no-let
    var x = 0;
    //eslint-disable-next-line functional/no-let
    var y = 0;
    if (typeof a === "number") {
        if (b === undefined)
            throw new Error("x and y coordinate needed");
        x = a;
        y = b;
    }
    else {
        x = a.x;
        y = a.y;
    }
    if ((0, exports.isPositioned)(rect)) {
        if (x - rect.x > rect.width || x < rect.x)
            return false;
        if (y - rect.y > rect.height || y < rect.y)
            return false;
    }
    else {
        // Assume 0,0
        if (x > rect.width || x < 0)
            return false;
        if (y > rect.height || y < 0)
            return false;
    }
    return true;
}
exports.intersectsPoint = intersectsPoint;
/**
 * Initialises a rectangle based on its center, a width and height
 *
 * ```js
 * import { Rects } from "https://unpkg.com/ixfx/dist/geometry.js";
 *
 * // Rectangle with center at 50,50, width 100 height 200
 * Rects.fromCenter({x: 50, y:50}, 100, 200);
 * ```
 * @param origin
 * @param width
 * @param height
 * @returns
 */
var fromCenter = function (origin, width, height) {
    index_js_1.Points.guard(origin, "origin");
    guardDim(width, "width");
    guardDim(height, "height");
    var halfW = width / 2;
    var halfH = height / 2;
    return { x: origin.x - halfW, y: origin.y - halfH, width: width, height: height };
};
exports.fromCenter = fromCenter;
/**
 * Returns the distance from the perimeter of `rect` to `pt`.
 * If the point is within the rectangle, 0 is returned.
 *
 * If `rect` does not have an x,y it's assumed to be 0,0
 *
 * ```js
 * import { Rects } from "https://unpkg.com/ixfx/dist/geometry.js";
 * const rect = { width: 100, height: 100, x: 0, y: 0 };
 * Rects.distanceFromExterior(rect, { x: 20, y: 20 });
 * ```
 * @param rect Rectangle
 * @param pt Point
 * @returns Distance
 */
var distanceFromExterior = function (rect, pt) {
    guardPositioned(rect, "rect");
    index_js_1.Points.guard(pt, "pt");
    if (intersectsPoint(rect, pt))
        return 0;
    var dx = Math.max(rect.x - pt.x, 0, pt.x - rect.x + rect.width);
    var dy = Math.max(rect.y - pt.y, 0, pt.y - rect.y + rect.height);
    return Math.sqrt(dx * dx + dy * dy);
};
exports.distanceFromExterior = distanceFromExterior;
/**
 * Return the distance of `pt` to the center of `rect`.
 *
 * ```js
 * import { Rects } from "https://unpkg.com/ixfx/dist/geometry.js";
 * const rect = { width: 100, height: 100, x: 0, y: 0 };
 * Rects.distanceFromCenter(rect, { x: 20, y: 20 });
 * ```
 * @param rect
 * @param pt
 * @returns
 */
var distanceFromCenter = function (rect, pt) { return index_js_1.Points.distance((0, exports.center)(rect), pt); };
exports.distanceFromCenter = distanceFromCenter;
/**
 * Returns a rectangle based on provided four corners.
 *
 * To create a rectangle that contains an arbitary set of points, use {@link Geometry.Points.bbox | Geometry.Points.bbox}.
 *
 * Does some sanity checking such as:
 *  - x will be smallest of topLeft/bottomLeft
 *  - y will be smallest of topRight/topLeft
 *  - width will be largest between top/bottom left and right
 *  - height will be largest between left and right top/bottom
 *
 */
var maxFromCorners = function (topLeft, topRight, bottomRight, bottomLeft) {
    if (topLeft.y > bottomRight.y)
        throw new Error("topLeft.y greater than bottomRight.y");
    if (topLeft.y > bottomLeft.y)
        throw new Error("topLeft.y greater than bottomLeft.y");
    var w1 = topRight.x - topLeft.x;
    var w2 = bottomRight.x - bottomLeft.x;
    var h1 = Math.abs(bottomLeft.y - topLeft.y);
    var h2 = Math.abs(bottomRight.y - topRight.y);
    return {
        x: Math.min(topLeft.x, bottomLeft.x),
        y: Math.min(topRight.y, topLeft.y),
        width: Math.max(w1, w2),
        height: Math.max(h1, h2)
    };
};
exports.maxFromCorners = maxFromCorners;
var guardDim = function (d, name) {
    if (name === void 0) { name = "Dimension"; }
    if (d === undefined)
        throw Error("".concat(name, " is undefined"));
    if (isNaN(d))
        throw Error("".concat(name, " is NaN"));
    if (d < 0)
        throw Error("".concat(name, " cannot be negative"));
};
/**
 * Throws an error if rectangle is missing fields or they
 * are not valid.
 * @param rect
 * @param name
 */
var guard = function (rect, name) {
    if (name === void 0) { name = "rect"; }
    if (rect === undefined)
        throw Error("{$name} undefined");
    if ((0, exports.isPositioned)(rect))
        index_js_1.Points.guard(rect, name);
    guardDim(rect.width, name + ".width");
    guardDim(rect.height, name + ".height");
};
exports.guard = guard;
var guardPositioned = function (rect, name) {
    if (name === void 0) { name = "rect"; }
    if (!(0, exports.isPositioned)(rect))
        throw new Error("Expected ".concat(name, " to have x,y"));
    (0, exports.guard)(rect, name);
};
/**
 * Creates a rectangle from its top-left coordinate, a width and height.
 *
 * ```js
 * import { Rects } from "https://unpkg.com/ixfx/dist/geometry.js";
 *
 * // Rectangle at 50,50 with width of 100, height of 200.
 * const rect = Rects.fromTopLeft({ x: 50, y:50 }, 100, 200);
 * ```
 * @param origin
 * @param width
 * @param height
 * @returns
 */
var fromTopLeft = function (origin, width, height) {
    guardDim(width, "width");
    guardDim(height, "height");
    index_js_1.Points.guard(origin, "origin");
    return { x: origin.x, y: origin.y, width: width, height: height };
};
exports.fromTopLeft = fromTopLeft;
/**
 * Returns the four corners of a rectangle as an array of Points.
 *
 * ```js
 * import { Rects } from "https://unpkg.com/ixfx/dist/geometry.js";
 * const rect = { width: 100, height: 100, x: 0, y: 0};
 * const pts = Rects.corners(rect);
 * ```
 *
 * If the rectangle is not positioned, is origin can be provided.
 * @param rect
 * @param origin
 * @returns
 */
var corners = function (rect, origin) {
    (0, exports.guard)(rect);
    if (origin === undefined && index_js_1.Points.isPoint(rect))
        origin = rect;
    else if (origin === undefined)
        throw new Error("Unpositioned rect needs origin param");
    return [
        { x: origin.x, y: origin.y },
        { x: origin.x + rect.width, y: origin.y },
        { x: origin.x + rect.width, y: origin.y + rect.height },
        { x: origin.x, y: origin.y + rect.height }
    ];
};
exports.corners = corners;
/**
 * Returns a point on the edge of rectangle
 * ```js
 * import { Rects } from "https://unpkg.com/ixfx/dist/geometry.js";
 *
 * const r1 = {x: 10, y: 10, width: 100, height: 50};
 * Rects.getEdgeX(r1, `right`);  // Yields: 110
 * Rects.getEdgeX(r1, `bottom`); // Yields: 10
 *
 * const r2 = {width: 100, height: 50};
 * Rects.getEdgeX(r2, `right`);  // Yields: 100
 * Rects.getEdgeX(r2, `bottom`); // Yields: 0
 * ```
 * @param rect
 * @param edge Which edge: right, left, bottom, top
 * @returns
 */
var getEdgeX = function (rect, edge) {
    (0, exports.guard)(rect);
    switch (edge) {
        case "top":
            return (index_js_1.Points.isPoint(rect)) ? rect.x : 0;
        case "bottom":
            return (index_js_1.Points.isPoint(rect)) ? rect.x : 0;
        case "left":
            return (index_js_1.Points.isPoint(rect)) ? rect.y : 0;
        case "right":
            return (index_js_1.Points.isPoint(rect)) ? rect.x + rect.width : rect.width;
    }
};
exports.getEdgeX = getEdgeX;
/**
 * Returns a point on the edge of rectangle
 *
 * ```js
 * import { Rects } from "https://unpkg.com/ixfx/dist/geometry.js";
 *
 * const r1 = {x: 10, y: 10, width: 100, height: 50};
 * Rects.getEdgeY(r1, `right`);  // Yields: 10
 * Rects.getEdgeY(r1, `bottom`); // Yields: 60
 *
 * const r2 = {width: 100, height: 50};
 * Rects.getEdgeY(r2, `right`);  // Yields: 0
 * Rects.getEdgeY(r2, `bottom`); // Yields: 50
 * ```
 * @param rect
 * @param edge Which edge: right, left, bottom, top
 * @returns
 */
var getEdgeY = function (rect, edge) {
    (0, exports.guard)(rect);
    switch (edge) {
        case "top":
            return (index_js_1.Points.isPoint(rect)) ? rect.y : 0;
        case "bottom":
            return (index_js_1.Points.isPoint(rect)) ? rect.y + rect.height : rect.height;
        case "left":
            return (index_js_1.Points.isPoint(rect)) ? rect.y : 0;
        case "right":
            return (index_js_1.Points.isPoint(rect)) ? rect.y : 0;
    }
};
exports.getEdgeY = getEdgeY;
/**
 * Returns `rect` divided by the width,height of `normaliseBy`.
 * This can be useful for normalising based on camera frame.
 *
 * ```js
 * import { Rects } from "https://unpkg.com/ixfx/dist/geometry.js";
 *
 * const frameSize = {width: 640, height: 320};
 * const object = { x: 320, y: 160, width: 64, height: 32};
 *
 * const n = Rects.normaliseByRect(object, frameSize);
 * // Yields: {x: 0.5, y: 0.5, width: 0.1, height: 0.1}
 * ```
 *
 * Height and width can be supplied instead of a rectangle too:
 * ```js
 * const n = Rects.normaliseByRect(object, 640, 320);
 * ```
 * @param rect
 * @param normaliseBy
 * @returns
 */
var normaliseByRect = function (rect, normaliseByOrWidth, height) {
    //eslint-disable-next-line functional/no-let
    var width;
    if (height === undefined) {
        if ((0, exports.isRect)(normaliseByOrWidth)) {
            height = normaliseByOrWidth.height;
            width = normaliseByOrWidth.width;
        }
        else {
            throw new Error("Expects rectangle or width and height parameters for normaliseBy");
        }
    }
    else {
        if (typeof normaliseByOrWidth === "number") {
            width = normaliseByOrWidth;
        }
        else {
            throw new Error("Expects rectangle or width and height parameters for normaliseBy");
        }
    }
    if ((0, exports.isPositioned)(rect)) {
        return Object.freeze({
            x: rect.x / width,
            y: rect.y / height,
            width: rect.width / width,
            height: rect.height / height
        });
    }
    else {
        return Object.freeze({
            width: rect.width / width,
            height: rect.height / height
        });
    }
};
exports.normaliseByRect = normaliseByRect;
/**
 * Multiplies `a` by rectangle or width/height. Useful for denormalising a value.
 *
 * ```js
 * import { Rects } from "https://unpkg.com/ixfx/dist/geometry.js";
 *
 * // Normalised rectangle of width 50%, height 50%
 * const r = {width: 0.5, height: 0.5};
 *
 * // Map to window:
 * const rr = Rects.multiply(r, window.innerWidth, window.innerHeight);
 * ```
 *
 * ```js
 * // Returns {width: someRect.width * someOtherRect.width ...}
 * Rects.multiply(someRect, someOtherRect);
 *
 * // Returns {width: someRect.width * 100, height: someRect.height * 200}
 * Rects.multiply(someRect, 100, 200);
 * ```
 *
 * Multiplication applies to the first parameter's x/y fields, if present.
 */
//eslint-disable-next-line func-style
function multiply(a, b, c) {
    (0, exports.guard)(a, "a");
    if ((0, exports.isRect)(b)) {
        if ((0, exports.isRectPositioned)(a)) {
            return __assign(__assign({}, a), { x: a.x * b.width, y: a.y * b.height, width: a.width * b.width, height: a.width * b.height });
        }
        else {
            return __assign(__assign({}, a), { width: a.width * b.width, height: a.width * b.height });
        }
    }
    else {
        if (typeof b !== "number")
            throw new Error("Expected second parameter of type Rect or number. Got ".concat(JSON.stringify(b)));
        if (c === undefined)
            c = b;
        if ((0, exports.isRectPositioned)(a)) {
            return __assign(__assign({}, a), { x: a.x * b, y: a.y * c, width: a.width * b, height: a.width * c });
        }
        else {
            return __assign(__assign({}, a), { width: a.width * b, height: a.width * c });
        }
    }
}
exports.multiply = multiply;
/**
 * Returns the center of a rectangle as a {@link Geometry.Points.Point}.
 *  If the rectangle lacks a position and `origin` parameter is not provided, 0,0 is used instead.
 *
 * ```js
 * import { Rects } from "https://unpkg.com/ixfx/dist/geometry.js";
 *
 * const p = Rects.center({x:10, y:20, width:100, height:50});
 * const p2 = Rects.center({width: 100, height: 50}); // Assumes 0,0 for rect x,y
 * ```
 * @param rect Rectangle
 * @param origin Optional origin. Overrides `rect` position if available. If no position is available 0,0 is used by default.
 * @returns
 */
var center = function (rect, origin) {
    (0, exports.guard)(rect);
    if (origin === undefined && index_js_1.Points.isPoint(rect))
        origin = rect;
    else if (origin === undefined)
        origin = { x: 0, y: 0 }; // throw new Error(`Unpositioned rect needs origin param`);
    return Object.freeze({
        x: origin.x + rect.width / 2,
        y: origin.y + rect.height / 2
    });
};
exports.center = center;
/**
 * Returns the length of each side of the rectangle (top, right, bottom, left)
 *
 * ```js
 * import { Rects } from "https://unpkg.com/ixfx/dist/geometry.js";
 * const rect = { width: 100, height: 100, x: 100, y: 100 };
 * // Yields: array of length four
 * const lengths = Rects.lengths(rect);
 * ```
 * @param rect
 * @returns
 */
var lengths = function (rect) {
    guardPositioned(rect, "rect");
    return (0, exports.edges)(rect).map(function (l) { return index_js_1.Lines.length(l); });
};
exports.lengths = lengths;
/**
 * Returns four lines based on each corner.
 * Lines are given in order: top, right, bottom, left
 *
 * ```js
 * import { Rects } from "https://unpkg.com/ixfx/dist/geometry.js";
 * const rect = { width: 100, height: 100, x: 100, y: 100 };
 * // Yields: array of length four
 * const lines = Rects.lines(rect);
 * ```
 *
 * @param {(RectPositioned|Rect)} rect
 * @param {Points.Point} [origin]
 * @returns {Lines.Line[]}
 */
var edges = function (rect, origin) {
    var c = (0, exports.corners)(rect, origin);
    // Connect all the corners, back to first corner again
    return index_js_1.Lines.joinPointsToLines.apply(index_js_1.Lines, __spreadArray(__spreadArray([], c, false), [c[0]], false));
};
exports.edges = edges;
/**
 * Returns the perimeter of `rect` (ie. sum of all edges)
 *  * ```js
 * import { Rects } from "https://unpkg.com/ixfx/dist/geometry.js";
 * const rect = { width: 100, height: 100, x: 100, y: 100 };
 * Rects.perimeter(rect);
 * ```
 * @param rect
 * @returns
 */
var perimeter = function (rect) {
    (0, exports.guard)(rect);
    return rect.height + rect.height + rect.width + rect.width;
};
exports.perimeter = perimeter;
/**
 * Returns the area of `rect`
 *
 * ```js
 * import { Rects } from "https://unpkg.com/ixfx/dist/geometry.js";
 * const rect = { width: 100, height: 100, x: 100, y: 100 };
 * Rects.area(rect);
 * ```
 * @param rect
 * @returns
 */
var area = function (rect) {
    (0, exports.guard)(rect);
    return rect.height * rect.width;
};
exports.area = area;
//# sourceMappingURL=Rect.js.map