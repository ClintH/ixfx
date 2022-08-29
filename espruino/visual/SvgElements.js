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
exports.grid = exports.text = exports.textUpdate = exports.textPath = exports.textPathUpdate = exports.lineUpdate = exports.line = exports.circle = exports.circleUpdate = exports.pathUpdate = exports.path = void 0;
var Lines = __importStar(require("../geometry/Line.js"));
var Svg = __importStar(require("./Svg.js"));
var Colour_js_1 = require("./Colour.js");
//import {Palette} from ".";
var numOrPercentage = function (v) {
    if (v >= 0 && v <= 1)
        return (v * 100) + "%";
    return v.toString();
};
/**
 * Creates and adds an SVG path element
 * @example
 * ```js
 * const paths = [
 *  `M300,200`,
 *  `a25,25 -30 0,1 50, -25 l 50,-25`
 * ]
 * const pathEl = path(paths, parentEl);
 * ```
 * @param svgOrArray Path syntax, or array of paths. Can be empty if path data will be added later
 * @param parent SVG parent element
 * @param opts Options Drawing options
 * @returns
 */
var path = function (svgOrArray, parent, opts, queryOrExisting) {
    var elem = Svg.createOrResolve(parent, "path", queryOrExisting);
    var svg = typeof svgOrArray === "string" ? svgOrArray : svgOrArray.join("\n");
    elem.setAttributeNS(null, "d", svg);
    parent.appendChild(elem);
    return (0, exports.pathUpdate)(elem, opts);
};
exports.path = path;
var pathUpdate = function (elem, opts) {
    if (opts)
        Svg.applyOpts(elem, opts);
    if (opts)
        Svg.applyStrokeOpts(elem, opts);
    return elem;
};
exports.pathUpdate = pathUpdate;
/**
 * Updates an existing `SVGCircleElement` with potentially updated circle data and drawing options
 * @param elem Element
 * @param circle Circle
 * @param opts Drawing options
 * @returns SVGCircleElement
 */
var circleUpdate = function (elem, circle, opts) {
    elem.setAttributeNS(null, "cx", circle.x.toString());
    elem.setAttributeNS(null, "cy", circle.y.toString());
    elem.setAttributeNS(null, "r", circle.radius.toString());
    if (opts)
        Svg.applyOpts(elem, opts);
    if (opts)
        Svg.applyStrokeOpts(elem, opts);
    return elem;
};
exports.circleUpdate = circleUpdate;
/**
 * Creates or reuses a `SVGCircleElement`.
 *
 * To update an existing element, use `circleUpdate`
 * @param circle
 * @param parent
 * @param opts
 * @param queryOrExisting
 * @returns
 */
var circle = function (circle, parent, opts, queryOrExisting) {
    var p = Svg.createOrResolve(parent, "circle", queryOrExisting);
    return (0, exports.circleUpdate)(p, circle, opts);
};
exports.circle = circle;
/**
 * Creates or reuses a SVGLineElement.
 *
 * @param line
 * @param parent
 * @param opts
 * @param queryOrExisting
 * @returns
 */
var line = function (line, parent, opts, queryOrExisting) {
    var lineEl = Svg.createOrResolve(parent, "line", queryOrExisting);
    return (0, exports.lineUpdate)(lineEl, line, opts);
};
exports.line = line;
/**
 * Updates a SVGLineElement instance with potentially changed line and drawing data
 * @param lineEl
 * @param line
 * @param opts
 * @returns
 */
var lineUpdate = function (lineEl, line, opts) {
    lineEl.setAttributeNS(null, "x1", line.a.x.toString());
    lineEl.setAttributeNS(null, "y1", line.a.y.toString());
    lineEl.setAttributeNS(null, "x2", line.b.x.toString());
    lineEl.setAttributeNS(null, "y2", line.b.y.toString());
    if (opts)
        Svg.applyOpts(lineEl, opts);
    if (opts)
        Svg.applyPathOpts(lineEl, opts);
    if (opts)
        Svg.applyStrokeOpts(lineEl, opts);
    return lineEl;
};
exports.lineUpdate = lineUpdate;
/**
 * Updates an existing SVGTextPathElement instance with text and drawing options
 * @param el
 * @param text
 * @param opts
 * @returns
 */
var textPathUpdate = function (el, text, opts) {
    if (opts === null || opts === void 0 ? void 0 : opts.method)
        el.setAttributeNS(null, "method", opts.method);
    if (opts === null || opts === void 0 ? void 0 : opts.side)
        el.setAttributeNS(null, "side", opts.side);
    if (opts === null || opts === void 0 ? void 0 : opts.spacing)
        el.setAttributeNS(null, "spacing", opts.spacing);
    if (opts === null || opts === void 0 ? void 0 : opts.startOffset) {
        el.setAttributeNS(null, "startOffset", numOrPercentage(opts.startOffset));
    }
    if (opts === null || opts === void 0 ? void 0 : opts.textLength)
        el.setAttributeNS(null, "textLength", numOrPercentage(opts.textLength));
    if (text) {
        //eslint-disable-next-line functional/immutable-data
        el.textContent = text;
    }
    if (opts)
        Svg.applyOpts(el, opts);
    if (opts)
        Svg.applyStrokeOpts(el, opts);
    return el;
};
exports.textPathUpdate = textPathUpdate;
/**
 * Creates or reuses a SVGTextPathElement.
 * @param pathRef
 * @param text
 * @param parent
 * @param opts
 * @param queryOrExisting
 * @returns
 */
var textPath = function (pathRef, text, parent, opts, queryOrExisting) {
    var textEl = Svg.createOrResolve(parent, "text", queryOrExisting + "-text");
    // Update text properties, but don't pass in position or text
    (0, exports.textUpdate)(textEl, undefined, undefined, opts);
    var p = Svg.createOrResolve(textEl, "textPath", queryOrExisting);
    p.setAttributeNS(null, "href", pathRef);
    return (0, exports.textPathUpdate)(p, text, opts);
};
exports.textPath = textPath;
/**
 * Updates an existing SVGTextElement instance with position, text and drawing options
 * @param el
 * @param pos
 * @param text
 * @param opts
 * @returns
 */
var textUpdate = function (el, pos, text, opts) {
    if (pos) {
        el.setAttributeNS(null, "x", pos.x.toString());
        el.setAttributeNS(null, "y", pos.y.toString());
    }
    if (text) {
        //eslint-disable-next-line functional/immutable-data
        el.textContent = text;
    }
    if (opts) {
        Svg.applyOpts(el, opts);
        if (opts)
            Svg.applyStrokeOpts(el, opts);
        if (opts.anchor)
            el.setAttributeNS(null, "text-anchor", opts.anchor);
        if (opts.align)
            el.setAttributeNS(null, "alignment-baseline", opts.align);
    }
    return el;
};
exports.textUpdate = textUpdate;
/**
 * Creates or reuses a SVGTextElement
 * @param pos Position of text
 * @param text Text
 * @param parent
 * @param opts
 * @param queryOrExisting
 * @returns
 */
var text = function (text, parent, pos, opts, queryOrExisting) {
    var p = Svg.createOrResolve(parent, "text", queryOrExisting);
    return (0, exports.textUpdate)(p, pos, text, opts);
};
exports.text = text;
/**
 * Creates a square grid based at a center point, with cells having `spacing` height and width.
 *
 * It fits in as many cells as it can within `width` and `height`.
 *
 * Returns a SVG group, consisting of horizontal and vertical lines
 * @param parent Parent element
 * @param center Center point of grid
 * @param spacing Width/height of cells
 * @param width How wide grid should be
 * @param height How high grid should be
 * @param opts
 */
var grid = function (parent, center, spacing, width, height, opts) {
    if (opts === void 0) { opts = {}; }
    if (!opts.strokeStyle)
        opts = __assign(__assign({}, opts), { strokeStyle: (0, Colour_js_1.getCssVariable)("bg-dim", "silver") });
    if (!opts.strokeWidth)
        opts = __assign(__assign({}, opts), { strokeWidth: 1 });
    var g = Svg.createEl("g");
    Svg.applyOpts(g, opts);
    Svg.applyPathOpts(g, opts);
    Svg.applyStrokeOpts(g, opts);
    // Horizontals
    //eslint-disable-next-line functional/no-let
    var y = 0;
    while (y < height) {
        var horiz = Lines.fromNumbers(0, y, width, y);
        (0, exports.line)(horiz, g);
        y += spacing;
    }
    // Verticals
    //eslint-disable-next-line functional/no-let
    var x = 0;
    while (x < width) {
        var vert = Lines.fromNumbers(x, 0, x, height);
        (0, exports.line)(vert, g);
        x += spacing;
    }
    parent.appendChild(g);
    return g;
};
exports.grid = grid;
//# sourceMappingURL=SvgElements.js.map