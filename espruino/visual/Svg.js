"use strict";
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
exports.makeHelper = exports.setBounds = exports.getBounds = exports.applyStrokeOpts = exports.applyOpts = exports.applyPathOpts = exports.createEl = exports.clear = exports.remove = exports.createOrResolve = exports.Elements = void 0;
var SvgMarkers_js_1 = require("./SvgMarkers.js");
var Elements = __importStar(require("./SvgElements.js"));
exports.Elements = Elements;
/**
 * Creates and appends a SVG element.
 *
 * ```js
 * // Create a circle
 * const circleEl = createOrResolve(parentEl, `SVGCircleElement`);
 * ```
 *
 * If `queryOrExisting` is specified, it is used as a query to find an existing element. If
 * query starts with `#`, this will be set as the element id, if created.
 *
 * ```js
 * // Creates an element with id 'myCircle' if it doesn't exist
 * const circleEl = createOrResolve(parentEl, `SVGCircleElement`, `#myCircle`);
 * ```
 * @param parent Parent element
 * @param type Type of SVG element
 * @param queryOrExisting Query, eg `#id`
 * @returns
 */
var createOrResolve = function (parent, type, queryOrExisting) {
    //eslint-disable-next-line functional/no-let
    var existing = null;
    if (queryOrExisting !== undefined) {
        if (typeof queryOrExisting === "string")
            existing = parent.querySelector(queryOrExisting);
        else
            existing = queryOrExisting;
    }
    if (existing === null) {
        var p = document.createElementNS("http://www.w3.org/2000/svg", type);
        parent.appendChild(p);
        if (queryOrExisting && typeof queryOrExisting === "string") {
            //eslint-disable-next-line functional/immutable-data
            if (queryOrExisting.startsWith("#"))
                p.id = queryOrExisting.substring(1);
        }
        return p;
    }
    return existing;
};
exports.createOrResolve = createOrResolve;
var remove = function (parent, queryOrExisting) {
    if (typeof queryOrExisting === "string") {
        var e = parent.querySelector(queryOrExisting);
        if (e === null)
            return;
        e.remove();
    }
    else {
        queryOrExisting.remove();
    }
};
exports.remove = remove;
var clear = function (parent) {
    //eslint-disable-next-line functional/no-let
    var c = parent.lastElementChild;
    while (c) {
        parent.removeChild(c);
        c = parent.lastElementChild;
    }
};
exports.clear = clear;
/**
 * Creates an element of `type` and with `id` (if specified)
 * @param type Element type, eg `circle`
 * @param id Optional id to assign to element
 * @returns Element
 */
var createEl = function (type, id) {
    var m = document.createElementNS("http://www.w3.org/2000/svg", type);
    if (id) {
        //eslint-disable-next-line functional/immutable-data
        m.id = id;
    }
    return m;
};
exports.createEl = createEl;
/**
 * Applies path drawing options to given element
 * Applies: markerEnd, markerStart, markerMid
 * @param elem Element (presumed path)
 * @param opts Options
 */
var applyPathOpts = function (elem, opts) {
    if (opts.markerEnd)
        elem.setAttribute("marker-end", (0, SvgMarkers_js_1.markerPrebuilt)(elem, opts.markerEnd, opts));
    if (opts.markerStart)
        elem.setAttribute("marker-end", (0, SvgMarkers_js_1.markerPrebuilt)(elem, opts.markerStart, opts));
    if (opts.markerMid)
        elem.setAttribute("marker-end", (0, SvgMarkers_js_1.markerPrebuilt)(elem, opts.markerMid, opts));
};
exports.applyPathOpts = applyPathOpts;
/**
 * Applies drawing options to given SVG element.
 * Applies: fillStyle
 * @param elem Element
 * @param opts Drawing options
 */
var applyOpts = function (elem, opts) {
    if (opts.fillStyle)
        elem.setAttributeNS(null, "fill", opts.fillStyle);
};
exports.applyOpts = applyOpts;
/**
 * Applies drawing options to given SVG element.
 * Applies: strokeStyle, strokeWidth, strokeDash, strokeLineCap
 * @param elem Element
 * @param opts
 */
var applyStrokeOpts = function (elem, opts) {
    if (opts.strokeStyle)
        elem.setAttributeNS(null, "stroke", opts.strokeStyle);
    if (opts.strokeWidth)
        elem.setAttributeNS(null, "stroke-width", opts.strokeWidth.toString());
    if (opts.strokeDash)
        elem.setAttribute("stroke-dasharray", opts.strokeDash);
    if (opts.strokeLineCap)
        elem.setAttribute("stroke-linecap", opts.strokeLineCap);
};
exports.applyStrokeOpts = applyStrokeOpts;
/**
 * Get the bounds of an SVG element (determined by its width/height attribs)
 * @param svg
 * @returns
 */
var getBounds = function (svg) {
    var w = svg.getAttributeNS(null, "width");
    var width = w === null ? 0 : parseFloat(w);
    var h = svg.getAttributeNS(null, "height");
    var height = h === null ? 0 : parseFloat(h);
    return { width: width, height: height };
};
exports.getBounds = getBounds;
/**
 * Set the bounds of an element, using its width/height attribs.
 * @param svg
 * @param bounds
 */
var setBounds = function (svg, bounds) {
    svg.setAttributeNS(null, "width", bounds.width.toString());
    svg.setAttributeNS(null, "height", bounds.height.toString());
};
exports.setBounds = setBounds;
/**
 * Creates a {@link SvgHelper} for the creating and management of SVG elements.
 * @param parent
 * @param parentOpts
 * @returns
 */
var makeHelper = function (parent, parentOpts) {
    if (parentOpts) {
        (0, exports.applyOpts)(parent, parentOpts);
        (0, exports.applyStrokeOpts)(parent, parentOpts);
    }
    var o = {
        remove: function (queryOrExisting) { return (0, exports.remove)(parent, queryOrExisting); },
        text: function (text, pos, opts, queryOrExisting) { return Elements.text(text, parent, pos, opts, queryOrExisting); },
        textPath: function (pathRef, text, opts, queryOrExisting) { return Elements.textPath(pathRef, text, parent, opts, queryOrExisting); },
        line: function (line, opts, queryOrExisting) { return Elements.line(line, parent, opts, queryOrExisting); },
        circle: function (circle, opts, queryOrExisting) { return Elements.circle(circle, parent, opts, queryOrExisting); },
        path: function (svgStr, opts, queryOrExisting) { return Elements.path(svgStr, parent, opts, queryOrExisting); },
        grid: function (center, spacing, width, height, opts) { return Elements.grid(parent, center, spacing, width, height, opts); },
        query: function (selectors) { return parent.querySelector(selectors); },
        get width() {
            var w = parent.getAttributeNS(null, "width");
            if (w === null)
                return 0;
            return parseFloat(w);
        },
        set width(width) {
            parent.setAttributeNS(null, "width", width.toString());
        },
        get parent() {
            return parent;
        },
        get height() {
            var w = parent.getAttributeNS(null, "height");
            if (w === null)
                return 0;
            return parseFloat(w);
        },
        set height(height) {
            parent.setAttributeNS(null, "height", height.toString());
        },
        clear: function () {
            while (parent.firstChild) {
                parent.removeChild(parent.lastChild);
            }
        }
    };
    return o;
};
exports.makeHelper = makeHelper;
//# sourceMappingURL=Svg.js.map