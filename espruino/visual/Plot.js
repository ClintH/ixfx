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
exports.plot = exports.draw = exports.drawValue = exports.add = exports.calcScale = exports.defaultAxis = void 0;
/* eslint-disable */
var NumericArrays_js_1 = require("../collections/NumericArrays.js");
var MapMultiMutable_js_1 = require("../collections/MapMultiMutable.js");
var Util_js_1 = require("../dom/Util.js");
var index_js_1 = require("./index.js");
var piPi = Math.PI * 2;
var defaultAxis = function (name) { return ({
    endWith: "none",
    lineWidth: 1,
    namePosition: 'none',
    name: name,
    showLabels: name === "y",
    showLine: true,
    // For y axis, it's the width, for x axis it's the text height
    textSize: name === "y" ? 20 : 10
}); };
exports.defaultAxis = defaultAxis;
var calcScale = function (buffer, drawingOpts, seriesColours) {
    var seriesNames = buffer.keys();
    var scales = [];
    seriesNames.forEach(function (s) {
        var series = buffer.get(s);
        if (series === undefined)
            return;
        var _a = (0, NumericArrays_js_1.minMaxAvg)(series), min = _a.min, max = _a.max;
        var range = max - min;
        var colour;
        if (seriesColours !== undefined) {
            colour = seriesColours[s];
        }
        if (colour == undefined) {
            if (drawingOpts.defaultSeriesVariable)
                colour = index_js_1.Colour.getCssVariable("accent", drawingOpts.defaultSeriesColour);
            else
                colour = drawingOpts.defaultSeriesColour;
        }
        if (range === 0) {
            range = min;
            min = min - range / 2;
            max = max + range / 2;
        }
        scales.push({
            min: min,
            max: max,
            range: range,
            name: s,
            colour: colour
        });
    });
    return scales;
};
exports.calcScale = calcScale;
var add = function (buffer, value, series) {
    if (series === void 0) { series = ""; }
    buffer.addKeyedValues(series, value);
};
exports.add = add;
var drawValue = function (index, buffer, drawing) {
    var c = __assign(__assign({}, drawing), { translucentPlot: true, leadingEdgeDot: false });
    (0, exports.draw)(buffer, c);
    drawing = __assign(__assign({}, drawing), { highlightIndex: index, leadingEdgeDot: true, translucentPlot: false, style: "none", clearCanvas: false });
    (0, exports.draw)(buffer, drawing);
};
exports.drawValue = drawValue;
var scaleWithFixedRange = function (buffer, range, drawing) { return (0, exports.calcScale)(buffer, drawing, drawing.seriesColours).map(function (s) { return (__assign(__assign({}, s), { range: range[1] - range[0], min: range[0], max: range[1] })); }); };
/**
 * Draws a `buffer` of data with `drawing` options.
 *
 * @param buffer
 * @param drawing
 */
var draw = function (buffer, drawing) {
    var _a;
    var xAxis = drawing.x, yAxis = drawing.y, ctx = drawing.ctx, canvasSize = drawing.canvasSize;
    var margin = drawing.margin;
    // const cap = drawing.capacity === 0 ? buffer.lengthMax : drawing.capacity;
    var series = drawing.y.scaleRange ? scaleWithFixedRange(buffer, drawing.y.scaleRange, drawing) : (0, exports.calcScale)(buffer, drawing, drawing.seriesColours);
    if (drawing.clearCanvas)
        ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);
    if (drawing.debug) {
        ctx.strokeStyle = "orange";
        ctx.strokeRect(0, 0, canvasSize.width, canvasSize.height);
    }
    // Move in for margin
    ctx.translate(margin, margin);
    // Calculate/use plot area
    var plotSize = (_a = drawing.plotSize) !== null && _a !== void 0 ? _a : plotSizeFromBounds(canvasSize, drawing);
    // Draw vertical axes
    var axisSize = { height: plotSize.height + margin + margin, width: plotSize.width };
    if (yAxis.showLabels || yAxis.showLine) {
        // Draw the labels for each series
        series.forEach(function (s) {
            if (yAxis.allowedSeries !== undefined) {
                if (!yAxis.allowedSeries.includes(s.name))
                    return;
            }
            drawYSeriesScale(s, axisSize, drawing);
        });
        // Draw vertical line
        if (series.length > 0 && yAxis.showLine)
            drawYLine(axisSize, series[0], drawing);
    }
    // Draw x/horizontal axis if needed
    if ((xAxis.showLabels || xAxis.showLine) && series.length > 0) {
        var yPos = yAxis.labelRange ? yAxis.labelRange[0] : series[0].min;
        drawXAxis(plotSize.width, calcYForValue(yPos, series[0], plotSize.height) + margin + xAxis.lineWidth, drawing);
    }
    var plotDrawing = __assign(__assign({}, drawing), { plotSize: plotSize });
    var ptr = index_js_1.Drawing.translatePoint(ctx, drawing.pointer);
    //console.log(ptr);
    // Draw data for each series
    series.forEach(function (s) {
        var data = buffer.getSource(s.name);
        if (data === undefined)
            return;
        var leadingEdgeIndex = (buffer.typeName === "circular") ? data.pointer - 1 : data.length - 1;
        if (drawing.highlightIndex !== undefined)
            leadingEdgeIndex = drawing.highlightIndex;
        ctx.save();
        ctx.translate(0, margin + margin);
        drawSeriesData(s, data, plotSize, plotDrawing, leadingEdgeIndex);
        ctx.restore();
    });
    if (drawing.showLegend) {
        ctx.save();
        ctx.translate(0, plotSize.height + margin + margin + margin);
        var legendSize = { width: plotSize.width, height: drawing.x.textSize + margin + margin };
        drawLegend(series, drawing, legendSize);
        ctx.restore();
    }
    ctx.resetTransform();
};
exports.draw = draw;
/**
 * Draw vertical axis
 * @param series
 * @param height
 * @param drawing
 */
var drawYSeriesScale = function (series, plotSize, drawing) {
    var ctx = drawing.ctx, y = drawing.y, digitsPrecision = drawing.digitsPrecision, margin = drawing.margin;
    var height = plotSize.height;
    if (drawing.debug) {
        ctx.strokeStyle = "purple";
        ctx.strokeRect(0, 0, y.textSize, height + margin);
    }
    ctx.fillStyle = series.colour.length > 0 ? series.colour : "white";
    // Override colour with axis-defined colour
    if (y.colour)
        ctx.fillStyle = y.colour;
    // Draw labels
    var min = y.labelRange ? y.labelRange[0] : series.min;
    var max = y.labelRange ? y.labelRange[1] : series.max;
    var range = y.labelRange ? max - min : series.range;
    var mid = min + (range / 2);
    var halfHeight = drawing.textHeight / 2;
    ctx.textBaseline = "top";
    ctx.fillText(min.toFixed(digitsPrecision), 0, calcYForValue(min, series, height) - halfHeight);
    ctx.fillText(mid.toFixed(digitsPrecision), 0, calcYForValue(mid, series, height) - halfHeight);
    ctx.fillText(max.toFixed(digitsPrecision), 0, calcYForValue(max, series, height) - margin);
    ctx.translate(y.textSize + margin, 0);
};
var drawYLine = function (plotSize, series, drawing) {
    if (series === undefined)
        throw new Error("series undefined");
    var ctx = drawing.ctx, y = drawing.y;
    var height = plotSize.height;
    var min = y.labelRange ? y.labelRange[0] : series.min;
    var max = y.labelRange ? y.labelRange[1] : series.max;
    var minPos = calcYForValue(min, series, height);
    var maxPos = calcYForValue(max, series, height);
    // Draw line
    ctx.translate(y.lineWidth, 0);
    ctx.lineWidth = y.lineWidth;
    ctx.beginPath();
    ctx.moveTo(0, minPos);
    ctx.lineTo(0, maxPos);
    ctx.strokeStyle = series.colour;
    if (y.colour)
        ctx.strokeStyle = y.colour;
    ctx.stroke();
    ctx.translate(y.lineWidth, 0);
};
var drawLegend = function (series, drawing, size) {
    var ctx = drawing.ctx;
    var lineSampleWidth = 10;
    var x = 0;
    var lineY = drawing.margin * 3;
    var textY = drawing.margin;
    ctx.lineWidth = drawing.lineWidth;
    series.forEach(function (s) {
        ctx.moveTo(x, lineY);
        ctx.strokeStyle = s.colour;
        ctx.lineTo(x + lineSampleWidth, lineY);
        ctx.stroke();
        x += lineSampleWidth + drawing.margin;
        var label = s.name;
        if (s.lastValue)
            label += ' ' + s.lastValue.toFixed(drawing.digitsPrecision);
        var labelSize = ctx.measureText(label);
        ctx.fillStyle = s.colour;
        ctx.fillText(label, x, textY);
        x += labelSize.width;
    });
};
var drawXAxis = function (width, yPos, drawing) {
    var ctx = drawing.ctx, x = drawing.x, y = drawing.y;
    if (!x.showLine)
        return;
    if (x.colour)
        ctx.strokeStyle = x.colour;
    ctx.lineWidth = x.lineWidth;
    ctx.beginPath();
    // Assumes ctx is translated after drawing Y axis
    ctx.moveTo(0, yPos);
    ctx.lineTo(width, yPos);
    ctx.stroke();
};
/**
 * Draw series data
 * @param series
 * @param values
 * @param plotSize
 * @param drawing
 */
var drawSeriesData = function (series, values, plotSize, drawing, leadingEdgeIndex) {
    var _a;
    var ctx = drawing.ctx, lineWidth = drawing.lineWidth, _b = drawing.translucentPlot, translucentPlot = _b === void 0 ? false : _b, margin = drawing.margin, xAxis = drawing.x;
    var style = (_a = drawing.style) !== null && _a !== void 0 ? _a : "connected";
    var height = plotSize.height - margin;
    var dataXScale = 1;
    if (xAxis.scaleRange) {
        var xAxisRange = xAxis.scaleRange[1] - xAxis.scaleRange[0];
        dataXScale = plotSize.width / xAxisRange;
    }
    else {
        if (drawing.capacity === 0)
            dataXScale = plotSize.width / values.length;
        else
            dataXScale = plotSize.width / drawing.capacity;
    }
    // Step through data faster if per-pixel density is above one
    var incrementBy = drawing.coalesce ?
        dataXScale < 0 ? Math.floor((1 / dataXScale)) : 1
        : 1;
    var x = 0;
    var leadingEdge;
    if (drawing.debug) {
        ctx.strokeStyle = "green";
        ctx.strokeRect(0, 0, plotSize.width, plotSize.height);
    }
    var colourTransform = function (c) {
        if (translucentPlot)
            return index_js_1.Colour.opacity(c, 0.2);
        return c;
    };
    if (style === "dots") {
        ctx.fillStyle = colourTransform(series.colour);
    }
    else if (style === "none") {
    }
    else {
        ctx.beginPath();
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = colourTransform(series.colour);
    }
    for (var i = 0; i < values.length; i += incrementBy) {
        var y = calcYForValue(values[i], series, height) - 1;
        if (style === "dots") {
            ctx.beginPath();
            ctx.arc(x, y, lineWidth, 0, piPi);
            ctx.fill();
        }
        else if (style === "none") {
        }
        else {
            if (i == 0)
                ctx.moveTo(x, y);
            ctx.lineTo(x, y);
        }
        if (i === leadingEdgeIndex) {
            leadingEdge = { x: x, y: y };
            series.lastValue = values[i];
        }
        x += dataXScale;
    }
    if (style === "connected") {
        ctx.stroke();
    }
    // Draw a circle at latest data point
    if (leadingEdge !== undefined && drawing.leadingEdgeDot) {
        ctx.beginPath();
        ctx.fillStyle = colourTransform(series.colour); // drawing.palette.getOrAdd(`series${series.name}`));
        ctx.arc(leadingEdge.x, leadingEdge.y, 3, 0, 2 * Math.PI);
        ctx.fill();
    }
};
var calcYForValue = function (v, series, height) { return (1 - (v - series.min) / series.range) * height; };
/**
 * Calculates lost area, given a margin value, axis settings.
 * @param margin
 * @param x
 * @param y
 * @param showLegend
 * @returns
 */
var calcSizing = function (margin, x, y, showLegend) {
    var fromLeft = margin;
    if (y.showLabels)
        fromLeft += y.textSize;
    if (y.showLine)
        fromLeft += y.lineWidth;
    if (y.showLabels || y.showLine)
        fromLeft += margin + margin;
    var fromRight = margin;
    var fromTop = margin + margin;
    var fromBottom = margin + margin;
    if (x.showLabels)
        fromBottom += x.textSize;
    else
        fromBottom += margin;
    if (x.showLine)
        fromBottom += x.lineWidth;
    if (x.showLabels || x.showLine)
        fromBottom += margin;
    if (showLegend)
        fromBottom += x.textSize;
    return {
        left: fromLeft,
        right: fromRight,
        top: fromTop,
        bottom: fromBottom
    };
};
var plotSizeFromBounds = function (bounds, opts) {
    var width = bounds.width, height = bounds.height;
    var sizing = calcSizing(opts.margin, opts.x, opts.y, opts.showLegend);
    return {
        width: width - sizing.left - sizing.right,
        height: height - sizing.top - sizing.bottom
    };
};
var canvasSizeFromPlot = function (plot, opts) {
    var width = plot.width, height = plot.height;
    var sizing = calcSizing(opts.margin, opts.x, opts.y, opts.showLegend);
    return {
        width: width + sizing.left + sizing.right,
        height: height + sizing.top + sizing.bottom
    };
};
/**
 * Creates a simple horizontal data plot within a DIV.
 *
 * ```
 * const p = plot(`#parentDiv`);
 * p.add(10);
 * p.clear();
 *
 * // Plot data using series
 * p.add(-1, `temp`);
 * p.add(0.4, `humidty`);
 * ```
 *
 * Options can be specified to customise plot
 * ```
 * const p = plot(`#parentDiv`, {
 *  capacity: 100,     // How many data points to store (default: 10)
 *  showYAxis: false,  // Toggle whether y axis is shown (default: true)
 *  lineWidth: 2,      // Width of plot line (default: 2)
 *  yAxes:  [`temp`],  // Only show these y axes (by default all are shown)
 *  coalesce: true,    // If true, sub-pixel data points are skipped, improving performance for dense plots at the expense of plot precision
 * });
 * ```
 *
 * For all `capacity` values other than `0`, a circular array is used to track data. Otherwise an array is used that will
 * grow infinitely.
 *
 * By default, will attempt to use CSS variable `--series[seriesName]` for axis colours.
 *  `--series[name]-axis` for titles. Eg `--seriesX`. For data added without a named series,
 * it will use `--series` and `--series-axis`.
 * @param parentElOrQuery
 * @param opts
 * @return Plotter instance
 */
var plot = function (parentElOrQuery, opts) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    if (parentElOrQuery === null)
        throw new Error("parentElOrQuery is null. Expected string or element");
    var parentEl = (0, Util_js_1.resolveEl)(parentElOrQuery);
    var canvasEl;
    var destroyCanvasEl = true;
    var plotSize = opts.plotSize;
    var canvasSize;
    if (parentEl.nodeName === "CANVAS") {
        // Use provided canvas
        canvasEl = parentEl;
        destroyCanvasEl = false;
        canvasSize = { width: canvasEl.width, height: canvasEl.height };
    }
    else {
        // Create a CANVAS that fills parent
        canvasEl = document.createElement("CANVAS");
        parentEl.append(canvasEl);
        plotSize = opts.plotSize;
        canvasSize = { width: canvasEl.width, height: canvasEl.height };
    }
    var pointer = { x: 0, y: 0 };
    var onPointerMove = function (evt) {
        pointer.x = evt.offsetX;
        pointer.y = evt.offsetY;
    };
    canvasEl.addEventListener("pointermove", onPointerMove);
    var ctx = canvasEl.getContext("2d");
    var capacity = (_a = opts.capacity) !== null && _a !== void 0 ? _a : 10;
    var buffer = capacity > 0 ? (0, MapMultiMutable_js_1.mapCircularMutable)({ capacity: capacity }) : (0, MapMultiMutable_js_1.mapArray)();
    var metrics = ctx.measureText('Xy');
    var coalesce = (_b = opts.coalesce) !== null && _b !== void 0 ? _b : true;
    // Sanity-check
    if (ctx === null)
        throw new Error("Drawing context not available");
    var xAxis = (0, exports.defaultAxis)("x");
    if (opts.x)
        xAxis = __assign(__assign({}, xAxis), opts.x);
    var yAxis = (0, exports.defaultAxis)("y");
    if (opts.y)
        yAxis = __assign(__assign({}, yAxis), opts.y);
    var drawingOpts = __assign(__assign({}, opts), { y: yAxis, x: xAxis, pointer: pointer, capacity: capacity, coalesce: coalesce, plotSize: plotSize, canvasSize: canvasSize, ctx: ctx, textHeight: (_c = opts.textHeight) !== null && _c !== void 0 ? _c : metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent, style: (_d = opts.style) !== null && _d !== void 0 ? _d : "connected", defaultSeriesColour: (_e = opts.defaultSeriesColour) !== null && _e !== void 0 ? _e : "yellow", margin: 3, clearCanvas: true, leadingEdgeDot: true, debug: (_f = opts.debug) !== null && _f !== void 0 ? _f : false, digitsPrecision: (_g = opts.digitsPrecision) !== null && _g !== void 0 ? _g : 2, lineWidth: (_h = opts.lineWidth) !== null && _h !== void 0 ? _h : 2, showLegend: (_j = opts.showLegend) !== null && _j !== void 0 ? _j : false });
    if (plotSize) {
        // Size canvas based on given plot size
        var canvasSize_1 = canvasSizeFromPlot(plotSize, drawingOpts);
        canvasEl.width = canvasSize_1.width;
        canvasEl.height = canvasSize_1.height;
        drawingOpts.canvasSize = canvasSize_1;
    }
    if (opts.autoSizeCanvas) {
        (0, Util_js_1.parentSizeCanvas)(canvasEl, function (args) {
            var bounds = args.bounds;
            drawingOpts = __assign(__assign({}, drawingOpts), { plotSize: plotSizeFromBounds(bounds, drawingOpts), canvasSize: bounds });
            (0, exports.draw)(buffer, drawingOpts);
        });
    }
    return {
        drawValue: function (index) {
            (0, exports.drawValue)(index, buffer, drawingOpts);
        },
        dispose: function () {
            canvasEl.removeEventListener("pointermove", onPointerMove);
            if (destroyCanvasEl)
                canvasEl.remove();
        },
        add: function (value, series, skipDrawing) {
            if (series === void 0) { series = ""; }
            if (skipDrawing === void 0) { skipDrawing = false; }
            (0, exports.add)(buffer, value, series);
            if (skipDrawing)
                return;
            (0, exports.draw)(buffer, drawingOpts);
        },
        draw: function () {
            (0, exports.draw)(buffer, drawingOpts);
        },
        clear: function () {
            buffer.clear();
        }
    };
};
exports.plot = plot;
//# sourceMappingURL=Plot.js.map