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
exports.textBlockAligned = exports.textBlock = exports.textWidth = exports.rect = exports.triangle = exports.line = exports.bezier = exports.dot = exports.copyToImg = exports.translatePoint = exports.pointLabels = exports.connectedPoints = exports.paths = exports.ellipse = exports.circle = exports.lineThroughPoints = exports.drawingStack = exports.arc = exports.makeHelper = exports.getCtx = void 0;
var Points = __importStar(require("../geometry/Point.js"));
var Lines = __importStar(require("../geometry/Line.js"));
var Triangles = __importStar(require("../geometry/Triangle.js"));
var Guards_js_1 = require("../Guards.js");
var Beziers = __importStar(require("../geometry/Bezier.js"));
var Rects = __importStar(require("../geometry/Rect.js"));
var Colours = __importStar(require("../visual/Colour.js"));
//import * as color2k from 'color2k';
var index_js_1 = require("../collections/index.js");
var Util_js_1 = require("../dom/Util.js");
var Util_js_2 = require("../Util.js");
// eslint-disable-next-line @typescript-eslint/naming-convention
var PIPI = Math.PI * 2;
/**
 * Gets a 2d drawing context from canvas element or query, or throws an error
 * @param canvasElCtxOrQuery Canvas element reference or DOM query
 * @returns Drawing context.
 */
var getCtx = function (canvasElCtxOrQuery) {
    if (canvasElCtxOrQuery === null)
        throw Error("canvasElCtxOrQuery null. Must be a 2d drawing context or Canvas element");
    if (canvasElCtxOrQuery === undefined)
        throw Error("canvasElCtxOrQuery undefined. Must be a 2d drawing context or Canvas element");
    var ctx = (canvasElCtxOrQuery instanceof CanvasRenderingContext2D) ?
        canvasElCtxOrQuery : (canvasElCtxOrQuery instanceof HTMLCanvasElement) ?
        canvasElCtxOrQuery.getContext("2d") : (typeof canvasElCtxOrQuery === "string") ?
        (0, Util_js_1.resolveEl)(canvasElCtxOrQuery).getContext("2d") : canvasElCtxOrQuery;
    if (ctx === null)
        throw new Error("Could not create 2d context for canvas");
    return ctx;
};
exports.getCtx = getCtx;
/**
 * Makes a helper object that wraps together a bunch of drawing functions that all use the same drawing context
 * @param ctxOrCanvasEl Drawing context or canvs element reference
 * @param canvasBounds Bounds of drawing (optional). Used for limiting `textBlock`
 * @returns
 */
var makeHelper = function (ctxOrCanvasEl, canvasBounds) {
    // TODO: Is there a way of automagically defining makeHelper to avoid repetition and keep typesafety and JSDoc?
    var ctx = (0, exports.getCtx)(ctxOrCanvasEl);
    return {
        paths: function (pathsToDraw, opts) {
            (0, exports.paths)(ctx, pathsToDraw, opts);
        },
        line: function (lineToDraw, opts) {
            (0, exports.line)(ctx, lineToDraw, opts);
        },
        rect: function (rectsToDraw, opts) {
            (0, exports.rect)(ctx, rectsToDraw, opts);
        },
        bezier: function (bezierToDraw, opts) {
            (0, exports.bezier)(ctx, bezierToDraw, opts);
        },
        connectedPoints: function (pointsToDraw, opts) {
            (0, exports.connectedPoints)(ctx, pointsToDraw, opts);
        },
        pointLabels: function (pointsToDraw, opts) {
            (0, exports.pointLabels)(ctx, pointsToDraw, opts);
        },
        dot: function (dotPosition, opts) {
            (0, exports.dot)(ctx, dotPosition, opts);
        },
        circle: function (circlesToDraw, opts) {
            (0, exports.circle)(ctx, circlesToDraw, opts);
        },
        arc: function (arcsToDraw, opts) {
            (0, exports.arc)(ctx, arcsToDraw, opts);
        },
        textBlock: function (lines, opts) {
            if (opts.bounds === undefined && canvasBounds !== undefined)
                opts = __assign(__assign({}, opts), { bounds: __assign(__assign({}, canvasBounds), { x: 0, y: 0 }) });
            (0, exports.textBlock)(ctx, lines, opts);
        }
    };
};
exports.makeHelper = makeHelper;
/**
 * Creates a drawing op to apply provided options
 * @param opts Drawing options that apply
 * @returns Stack
 */
var optsOp = function (opts) { return coloringOp(opts.strokeStyle, opts.fillStyle); };
/**
 * Applies drawing options to `ctx`, returning a {@link DrawingStack}
 * @param ctx Context
 * @param opts Options
 * @returns
 */
var applyOpts = function (ctx, opts) {
    var _a;
    if (opts === void 0) { opts = {}; }
    var additionalOps = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        additionalOps[_i - 2] = arguments[_i];
    }
    if (ctx === undefined)
        throw Error("ctx undefined");
    // Create a drawing stack, pushing an op generated from drawing options
    var stack = (_a = (0, exports.drawingStack)(ctx)).push.apply(_a, __spreadArray([optsOp(opts)], additionalOps, false));
    // Apply stack to context
    stack.apply();
    return stack;
};
/**
 * Draws one or more arcs.
 * @param ctx
 * @param arcs
 * @param opts
 */
var arc = function (ctx, arcs, opts) {
    if (opts === void 0) { opts = {}; }
    applyOpts(ctx, opts);
    var draw = function (arc) {
        ctx.beginPath();
        ctx.arc(arc.x, arc.y, arc.radius, arc.startRadian, arc.endRadian);
        ctx.stroke();
    };
    if (Array.isArray(arcs)) {
        arcs.forEach(draw);
    }
    else
        draw(arcs);
};
exports.arc = arc;
/**
 * Colouring drawing op. Applies `fillStyle` and `strokeStyle`
 * @param strokeStyle
 * @param fillStyle
 * @returns
 */
var coloringOp = function (strokeStyle, fillStyle) {
    var apply = function (ctx) {
        // eslint-disable-next-line functional/immutable-data
        if (fillStyle)
            ctx.fillStyle = fillStyle;
        // eslint-disable-next-line functional/immutable-data
        if (strokeStyle)
            ctx.strokeStyle = strokeStyle;
    };
    return apply;
};
var lineOp = function (lineWidth, lineJoin, lineCap) {
    var apply = function (ctx) {
        // eslint-disable-next-line functional/immutable-data
        if (lineWidth)
            ctx.lineWidth = lineWidth;
        // eslint-disable-next-line functional/immutable-data
        if (lineJoin)
            ctx.lineJoin = lineJoin;
        // eslint-disable-next-line functional/immutable-data
        if (lineCap)
            ctx.lineCap = lineCap;
    };
    return apply;
};
/**
 * Creates and returns an immutable drawing stack for a context
 * @param ctx Context
 * @param stk Initial stack operations
 * @returns
 */
var drawingStack = function (ctx, stk) {
    if (stk === undefined)
        stk = (0, index_js_1.stack)();
    var push = function () {
        var ops = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            ops[_i] = arguments[_i];
        }
        if (stk === undefined)
            stk = (0, index_js_1.stack)();
        var s = stk.push.apply(stk, ops);
        ops.forEach(function (o) { return o(ctx); });
        return (0, exports.drawingStack)(ctx, s);
    };
    var pop = function () {
        var s = stk === null || stk === void 0 ? void 0 : stk.pop();
        return (0, exports.drawingStack)(ctx, s);
    };
    var apply = function () {
        if (stk === undefined)
            return (0, exports.drawingStack)(ctx);
        stk.forEach(function (op) { return op(ctx); });
        return (0, exports.drawingStack)(ctx, stk);
    };
    return { push: push, pop: pop, apply: apply };
};
exports.drawingStack = drawingStack;
var lineThroughPoints = function (ctx, points, opts) {
    applyOpts(ctx, opts);
    // https://stackoverflow.com/questions/7054272/how-to-draw-smooth-curve-through-n-points-using-javascript-html5-canvas
    ctx.moveTo((points[0].x), points[0].y);
    points.forEach(function (p, index) {
        if (index + 2 >= points.length)
            return;
        var pNext = points[index + 1];
        var mid = {
            x: (p.x + pNext.x) / 2,
            y: (p.y + pNext.y) / 2
        };
        var cpX1 = (mid.x + p.x) / 2;
        var cpX2 = (mid.x + pNext.x) / 2;
        ctx.quadraticCurveTo(cpX1, pNext.y, mid.x, mid.y);
        ctx.quadraticCurveTo(cpX2, pNext.y, pNext.x, pNext.y);
    });
};
exports.lineThroughPoints = lineThroughPoints;
/**
 * Draws one or more circles. Will draw outline/fill depending on
 * whether `strokeStyle` or `fillStyle` params are present in the drawing options.
 *
 * ```js
 * // Draw a circle with radius of 10 at 0,0
 * circle(ctx, {radius:10});
 *
 * // Draw a circle of radius 10 at 100,100
 * circle(ctx, {radius: 10, x: 100, y: 100});
 *
 * // Draw two blue outlined circles
 * circle(ctx, [ {radius: 5}, {radius: 10} ], {strokeStyle:`blue`});
 * ```
 * @param ctx Drawing context
 * @param circlesToDraw Circle(s) to draw
 * @param opts Drawing options
 */
var circle = function (ctx, circlesToDraw, opts) {
    if (opts === void 0) { opts = {}; }
    applyOpts(ctx, opts);
    var draw = function (c) {
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.radius, 0, PIPI);
        if (opts.strokeStyle)
            ctx.stroke();
        if (opts.fillStyle)
            ctx.fill();
    };
    if (Array.isArray(circlesToDraw))
        circlesToDraw.forEach(draw);
    else
        draw(circlesToDraw);
};
exports.circle = circle;
/**
 * Draws one or more ellipses. Will draw outline/fill depending on
 * whether `strokeStyle` or `fillStyle` params are present in the drawing options.
 * @param ctx
 * @param ellipsesToDraw
 * @param opts
 */
var ellipse = function (ctx, ellipsesToDraw, opts) {
    if (opts === void 0) { opts = {}; }
    applyOpts(ctx, opts);
    var draw = function (e) {
        var _a, _b, _c;
        ctx.beginPath();
        var rotation = (_a = e.rotation) !== null && _a !== void 0 ? _a : 0;
        var startAngle = (_b = e.startAngle) !== null && _b !== void 0 ? _b : 0;
        var endAngle = (_c = e.endAngle) !== null && _c !== void 0 ? _c : PIPI;
        ctx.ellipse(e.x, e.y, e.radiusX, e.radiusY, rotation, startAngle, endAngle);
        if (opts.strokeStyle)
            ctx.stroke();
        if (opts.fillStyle)
            ctx.fill();
    };
    if (Array.isArray(ellipsesToDraw))
        ellipsesToDraw.forEach(draw);
    else
        draw(ellipsesToDraw);
};
exports.ellipse = ellipse;
/**
 * Draws one or more paths.
 * supported paths are quadratic beziers and lines.
 * @param ctx
 * @param pathsToDraw
 * @param opts
 */
var paths = function (ctx, pathsToDraw, opts) {
    if (opts === void 0) { opts = {}; }
    applyOpts(ctx, opts);
    var draw = function (path) {
        // Call appropriate drawing function depending on the type of path
        if (Beziers.isQuadraticBezier(path))
            quadraticBezier(ctx, path, opts);
        else if (Lines.isLine(path))
            (0, exports.line)(ctx, path, opts);
        else
            throw new Error("Unknown path type ".concat(JSON.stringify(path)));
    };
    if (Array.isArray(pathsToDraw))
        pathsToDraw.forEach(draw);
    else
        draw(pathsToDraw);
};
exports.paths = paths;
/**
 * Draws a line between all the given points.
 * If a fillStyle is specified, it will be filled.
 *
 * See also:
 * * {@link line}: Draw one or more lines
 *
 * @param ctx
 * @param pts
 */
var connectedPoints = function (ctx, pts, opts) {
    var _a;
    if (opts === void 0) { opts = {}; }
    var shouldLoop = (_a = opts.loop) !== null && _a !== void 0 ? _a : false;
    (0, Guards_js_1.array)(pts);
    if (pts.length === 0)
        return;
    // Throw an error if any point is invalid
    pts.forEach(function (pt, i) { return Points.guard(pt, "Index ".concat(i)); });
    applyOpts(ctx, opts);
    // Draw points
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    pts.forEach(function (pt) { return ctx.lineTo(pt.x, pt.y); });
    if (shouldLoop)
        ctx.lineTo(pts[0].x, pts[0].y);
    // if (opts.strokeStyle) ctx.strokeStyle = opts.strokeStyle;
    if (opts.strokeStyle || (opts.strokeStyle === undefined && opts.fillStyle === undefined)) {
        ctx.stroke();
    }
    if (opts.fillStyle) {
        ctx.fill();
    }
};
exports.connectedPoints = connectedPoints;
/**
 * Draws labels for a set of points
 * @param ctx
 * @param pts Points to draw
 * @param opts
 * @param labels Labels for points
 */
var pointLabels = function (ctx, pts, opts, labels) {
    if (opts === void 0) { opts = {}; }
    if (pts.length === 0)
        return;
    // Throw an error if any point is invalid
    pts.forEach(function (pt, i) { return Points.guard(pt, "Index ".concat(i)); });
    applyOpts(ctx, opts);
    pts.forEach(function (pt, i) {
        var label = (labels !== undefined && i < labels.length) ? labels[i] : i.toString();
        ctx.fillText(label.toString(), pt.x, pt.y);
    });
};
exports.pointLabels = pointLabels;
/**
 * Returns `point` with the canvas's translation matrix applied
 * @param ctx
 * @param point
 * @returns
 */
var translatePoint = function (ctx, point) {
    var m = ctx.getTransform();
    return {
        x: point.x * m.a + point.y * m.c + m.e,
        y: point.x * m.b + point.y * m.d + m.f
    };
};
exports.translatePoint = translatePoint;
/**
 * Creates a new HTML IMG element with a snapshot of the
 * canvas. Element will need to be inserted into the document.
 *
 * ```
 * const myCanvas = document.getElementById('someCanvas');
 * const el = copyToImg(myCanvas);
 * document.getElementById('images').appendChild(el);
 * ```
 * @param canvasEl
 * @returns
 */
var copyToImg = function (canvasEl) {
    var img = document.createElement("img");
    //eslint-disable-next-line functional/immutable-data
    img.src = canvasEl.toDataURL("image/jpeg");
    return img;
};
exports.copyToImg = copyToImg;
/**
 * Draws filled circle(s) at provided point(s)
 * @param ctx
 * @param pos
 * @param opts
 */
var dot = function (ctx, pos, opts) {
    var _a;
    if (opts === undefined)
        opts = {};
    var radius = (_a = opts.radius) !== null && _a !== void 0 ? _a : 10;
    applyOpts(ctx, opts);
    ctx.beginPath();
    // x&y for arc is the center of circle
    if (Array.isArray(pos)) {
        pos.forEach(function (p) {
            ctx.arc(p.x, p.y, radius, 0, 2 * Math.PI);
        });
    }
    else {
        var p = pos;
        ctx.arc(p.x, p.y, radius, 0, 2 * Math.PI);
    }
    if (opts.filled || !opts.outlined)
        ctx.fill();
    if (opts.outlined)
        ctx.stroke();
};
exports.dot = dot;
/**
 * Draws a cubic or quadratic bezier
 * @param ctx
 * @param bezierToDraw
 * @param opts
 */
var bezier = function (ctx, bezierToDraw, opts) {
    if (Beziers.isQuadraticBezier(bezierToDraw)) {
        quadraticBezier(ctx, bezierToDraw, opts);
    }
    else if (Beziers.isCubicBezier(bezierToDraw)) {
        cubicBezier(ctx, bezierToDraw, opts);
    }
};
exports.bezier = bezier;
var cubicBezier = function (ctx, bezierToDraw, opts) {
    var _a, _b, _c;
    if (opts === void 0) { opts = {}; }
    // eslint-disable-next-line functional/no-let
    var stack = applyOpts(ctx, opts);
    var a = bezierToDraw.a, b = bezierToDraw.b, cubic1 = bezierToDraw.cubic1, cubic2 = bezierToDraw.cubic2;
    var isDebug = (_a = opts.debug) !== null && _a !== void 0 ? _a : false;
    if (isDebug) {
        /*
         * const ss = ctx.strokeStyle;
         * ctx.strokeStyle = ss;
         */
    }
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.bezierCurveTo(cubic1.x, cubic1.y, cubic2.x, cubic2.y, b.x, b.y);
    ctx.stroke();
    if (isDebug) {
        stack = stack.push(optsOp(__assign(__assign({}, opts), { strokeStyle: Colours.opacity((_b = opts.strokeStyle) !== null && _b !== void 0 ? _b : "silver", 0.6), fillStyle: Colours.opacity((_c = opts.fillStyle) !== null && _c !== void 0 ? _c : "yellow", 0.4) })));
        stack.apply();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(cubic1.x, cubic1.y);
        ctx.stroke();
        ctx.moveTo(b.x, b.y);
        ctx.lineTo(cubic2.x, cubic2.y);
        ctx.stroke();
        ctx.fillText("a", a.x + 5, a.y);
        ctx.fillText("b", b.x + 5, b.y);
        ctx.fillText("c1", cubic1.x + 5, cubic1.y);
        ctx.fillText("c2", cubic2.x + 5, cubic2.y);
        (0, exports.dot)(ctx, cubic1, { radius: 3 });
        (0, exports.dot)(ctx, cubic2, { radius: 3 });
        (0, exports.dot)(ctx, a, { radius: 3 });
        (0, exports.dot)(ctx, b, { radius: 3 });
        stack = stack.pop();
        stack.apply();
    }
};
var quadraticBezier = function (ctx, bezierToDraw, opts) {
    var _a, _b, _c;
    if (opts === void 0) { opts = {}; }
    var a = bezierToDraw.a, b = bezierToDraw.b, quadratic = bezierToDraw.quadratic;
    var isDebug = (_a = opts.debug) !== null && _a !== void 0 ? _a : false;
    // eslint-disable-next-line functional/no-let
    var stack = applyOpts(ctx, opts);
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.quadraticCurveTo(quadratic.x, quadratic.y, b.x, b.y);
    ctx.stroke();
    if (isDebug) {
        /*
         * const fs = ctx.fillStyle;
         * const ss = ctx.strokeStyle;
         * ctx.fillStyle = opts.strokeStyle ?? `gray`;
         * ctx.strokeStyle = opts.strokeStyle ?? `gray`;
         */
        stack = stack.push(optsOp(__assign(__assign({}, opts), { strokeStyle: Colours.opacity((_b = opts.strokeStyle) !== null && _b !== void 0 ? _b : "silver", 0.6), fillStyle: Colours.opacity((_c = opts.fillStyle) !== null && _c !== void 0 ? _c : "yellow", 0.4) })));
        (0, exports.connectedPoints)(ctx, [a, quadratic, b]);
        ctx.fillText("a", a.x + 5, a.y);
        ctx.fillText("b", b.x + 5, b.y);
        ctx.fillText("h", quadratic.x + 5, quadratic.y);
        (0, exports.dot)(ctx, quadratic, { radius: 3 });
        (0, exports.dot)(ctx, a, { radius: 3 });
        (0, exports.dot)(ctx, b, { radius: 3 });
        /*
         * ctx.fillStyle = fs;
         * ctx.strokeStyle = ss;
         */
        stack = stack.pop();
        stack.apply();
    }
};
/**
 * Draws one or more lines.
 *
 * Each line is drawn independently, ie it's not assumed lines are connected.
 *
 * See also:
 * * {@link connectedPoints}: Draw a series of connected points
 * @param ctx
 * @param toDraw
 * @param opts
 */
var line = function (ctx, toDraw, opts) {
    var _a;
    if (opts === void 0) { opts = {}; }
    var isDebug = (_a = opts.debug) !== null && _a !== void 0 ? _a : false;
    var o = lineOp(opts.lineWidth, opts.lineJoin, opts.lineCap);
    applyOpts(ctx, opts, o);
    var draw = function (d) {
        var a = d.a, b = d.b;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        if (isDebug) {
            ctx.fillText("a", a.x, a.y);
            ctx.fillText("b", b.x, b.y);
            (0, exports.dot)(ctx, a, { radius: 5, strokeStyle: "black" });
            (0, exports.dot)(ctx, b, { radius: 5, strokeStyle: "black" });
        }
        ctx.stroke();
    };
    if (Array.isArray(toDraw))
        toDraw.forEach(draw);
    else
        draw(toDraw);
};
exports.line = line;
/**
 * Draws one or more triangles
 * @param ctx
 * @param toDraw
 * @param opts
 */
var triangle = function (ctx, toDraw, opts) {
    if (opts === void 0) { opts = {}; }
    applyOpts(ctx, opts);
    var draw = function (t) {
        (0, exports.connectedPoints)(ctx, Triangles.corners(t), __assign(__assign({}, opts), { loop: true }));
        if (opts.debug) {
            (0, exports.pointLabels)(ctx, Triangles.corners(t), undefined, ["a", "b", "c"]);
        }
    };
    if (Array.isArray(toDraw))
        toDraw.forEach(draw);
    else
        draw(toDraw);
};
exports.triangle = triangle;
// export const arrowFromTip = (ctx:CanvasRenderingContext2D, tipPos: Points.Point, tailLength:number, opts:DrawingOpts) => {
//   if (opts.fillStyle) ctx.fillStyle = opts.fillStyle;
//   if (opts.strokeStyle) ctx.strokeStyle = opts.strokeStyle;
//   ctx.save();
//   ctx.translate 
//   ctx.restore();
// }
/**
 * Draws one or more rectangles
 * @param ctx
 * @param toDraw
 * @param opts
 */
var rect = function (ctx, toDraw, opts) {
    if (opts === void 0) { opts = {}; }
    applyOpts(ctx, opts);
    var draw = function (d) {
        if (opts.filled)
            ctx.fillRect(d.x, d.y, d.width, d.height);
        ctx.strokeRect(d.x, d.y, d.width, d.height);
        if (opts.debug) {
            (0, exports.pointLabels)(ctx, Rects.corners(d), undefined, ["NW", "NE", "SE", "SW"]);
        }
    };
    if (Array.isArray(toDraw))
        toDraw.forEach(draw);
    else
        draw(toDraw);
};
exports.rect = rect;
/**
 * Returns the width of `text`. Rounds number up to nearest multiple if provided. If
 * text is empty or undefined, 0 is returned.
 * @param ctx
 * @param text
 * @param widthMultiple
 * @returns
 */
var textWidth = function (ctx, text, padding, widthMultiple) {
    if (padding === void 0) { padding = 0; }
    if (text === undefined || text === null || text.length === 0)
        return 0;
    var m = ctx.measureText(text);
    if (widthMultiple)
        return (0, Util_js_2.roundUpToMultiple)(m.width, widthMultiple) + padding;
    return m.width + padding;
};
exports.textWidth = textWidth;
/**
 * Draws a block of text. Each array item is considered a line.
 * @param ctx
 * @param lines
 * @param opts
 */
var textBlock = function (ctx, lines, opts) {
    var _a, _b;
    applyOpts(ctx, opts);
    var anchorPadding = (_a = opts.anchorPadding) !== null && _a !== void 0 ? _a : 0;
    var anchor = opts.anchor;
    var bounds = (_b = opts.bounds) !== null && _b !== void 0 ? _b : { x: 0, y: 0, width: 1000000, height: 1000000 };
    // Measure each line
    var blocks = lines.map(function (l) { return ctx.measureText(l); });
    // Get width and height
    var widths = blocks.map(function (tm) { return tm.width; });
    var heights = blocks.map(function (tm) { return tm.actualBoundingBoxAscent + tm.actualBoundingBoxDescent; });
    // Find extremes
    var maxWidth = Math.max.apply(Math, widths);
    var totalHeight = heights.reduce(function (acc, val) { return acc + val; }, 0);
    // eslint-disable-next-line functional/no-let
    var x = anchor.x, y = anchor.y;
    if (anchor.x + maxWidth > bounds.width)
        x = bounds.width - (maxWidth + anchorPadding);
    else
        x -= anchorPadding;
    if (x < bounds.x)
        x = bounds.x + anchorPadding;
    if (anchor.y + totalHeight > bounds.height)
        y = bounds.height - (totalHeight + anchorPadding);
    else
        y -= anchorPadding;
    if (y < bounds.y)
        y = bounds.y + anchorPadding;
    lines.forEach(function (line, i) {
        ctx.fillText(line, x, y);
        y += heights[i];
    });
};
exports.textBlock = textBlock;
/**
 * Draws an aligned text block
 */
var textBlockAligned = function (ctx, text, opts) {
    var bounds = opts.bounds;
    var _a = opts.horiz, horiz = _a === void 0 ? "left" : _a, _b = opts.vert, vert = _b === void 0 ? "top" : _b;
    //eslint-disable-next-line functional/no-let
    var lines;
    if (typeof text === "string")
        lines = [text];
    else
        lines = text;
    applyOpts(ctx, opts);
    ctx.save();
    ctx.translate(bounds.x, bounds.y);
    //eslint-disable-next-line functional/immutable-data
    ctx.textAlign = "left";
    //eslint-disable-next-line functional/immutable-data
    ctx.textBaseline = "top";
    var middleX = bounds.width / 2;
    var middleY = bounds.height / 2;
    // Measure each line
    var blocks = lines.map(function (l) { return ctx.measureText(l); });
    var heights = blocks.map(function (tm) { return tm.actualBoundingBoxAscent + tm.actualBoundingBoxDescent; });
    var totalHeight = heights.reduce(function (acc, val) { return acc + val; }, 0);
    //eslint-disable-next-line functional/no-let
    var y = 0;
    if (vert === "center")
        y = middleY - totalHeight / 2;
    else if (vert === "bottom") {
        y = bounds.height - totalHeight;
    }
    lines.forEach(function (line, i) {
        //eslint-disable-next-line functional/no-let
        var x = 0;
        if (horiz === "center")
            x = middleX - blocks[i].width / 2;
        else if (horiz === "right")
            x = bounds.width - blocks[i].width;
        ctx.fillText(lines[i], x, y);
        y += heights[i];
    });
    ctx.restore();
};
exports.textBlockAligned = textBlockAligned;
//# sourceMappingURL=Drawing.js.map