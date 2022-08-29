"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
exports.Plot = exports.AxisY = exports.AxisX = exports.Legend = exports.PlotArea = exports.Series = void 0;
/* eslint-disable */
var NumericArrays_js_1 = require("../collections/NumericArrays.js");
var index_js_1 = require("../collections/index.js");
var index_js_2 = require("../geometry/index.js");
var index_js_3 = require("../data/index.js");
var Util_js_1 = require("../dom/Util.js");
var Sg = __importStar(require("./SceneGraph.js"));
var Drawing_js_1 = require("./Drawing.js");
var Util_js_2 = require("../Util.js");
var Guards_js_1 = require("~/Guards.js");
var ArrayDataSource = /** @class */ (function () {
    function ArrayDataSource(series) {
        this.dirty = false;
        this.type = "array";
        this.series = series;
        this.data = [];
        this.dirty = true;
    }
    ArrayDataSource.prototype.clear = function () {
        this.set([]);
        this._range = undefined;
    };
    ArrayDataSource.prototype.set = function (data) {
        this.data = data;
        this.dirty = true;
    };
    Object.defineProperty(ArrayDataSource.prototype, "length", {
        get: function () {
            return this.data.length;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ArrayDataSource.prototype, "range", {
        get: function () {
            if (!this.dirty && this._range !== undefined)
                return this._range;
            this.dirty = false;
            this._range = index_js_1.Arrays.minMaxAvg(this.data);
            return __assign(__assign({}, this._range), { changed: true });
        },
        enumerable: false,
        configurable: true
    });
    ArrayDataSource.prototype.add = function (value) {
        this.data = __spreadArray(__spreadArray([], this.data, true), [value], false);
        this.dirty = true;
    };
    return ArrayDataSource;
}());
var StreamingDataSource = /** @class */ (function (_super) {
    __extends(StreamingDataSource, _super);
    function StreamingDataSource(series) {
        var _this = _super.call(this, series) || this;
        _this.desiredDataPointMinWidth = 5;
        return _this;
    }
    StreamingDataSource.prototype.add = function (value) {
        var lastWidth = this.series.lastPxPerPt;
        if (lastWidth > -1 && lastWidth < this.desiredDataPointMinWidth) {
            // Remove older data
            var pts = Math.floor(this.desiredDataPointMinWidth / lastWidth);
            var d = __spreadArray(__spreadArray([], this.data.slice(pts), true), [value], false);
            _super.prototype.set.call(this, d);
        }
        else
            _super.prototype.add.call(this, value);
    };
    return StreamingDataSource;
}(ArrayDataSource));
var Series = /** @class */ (function () {
    function Series(name, sourceType, plot, opts) {
        var _a, _b, _c, _d;
        this.plot = plot;
        this.width = 3;
        this.precision = 2;
        // How many pixels wide per data point on last draw
        this.lastPxPerPt = -1;
        this.name = name;
        this.drawingStyle = (_a = opts.drawingStyle) !== null && _a !== void 0 ? _a : "line";
        this.colour = opts.colour;
        this.width = (_b = opts.width) !== null && _b !== void 0 ? _b : 3;
        this.axisRange = (_c = opts.axisRange) !== null && _c !== void 0 ? _c : { min: Number.NaN, max: Number.NaN };
        this._visualRange = __assign({}, this.axisRange);
        this._visualRangeStretch = (_d = opts.visualRangeStretch) !== null && _d !== void 0 ? _d : true;
        if (sourceType === "array") {
            this.source = new ArrayDataSource(this);
        }
        else if (sourceType === "stream") {
            this.source = new StreamingDataSource(this);
        }
        else
            throw new Error("Unknown sourceType. Expected array|stream");
    }
    Series.prototype.formatValue = function (v) {
        return v.toFixed(this.precision);
    };
    Object.defineProperty(Series.prototype, "visualRange", {
        get: function () {
            var vr = this._visualRange;
            var sourceRange = this.source.range;
            var changed = false;
            if (sourceRange.changed) {
                if (this._visualRangeStretch) {
                    // Stretch range to lowest/highest-seen min/max
                    var rmin = Math.min((0, Util_js_2.ifNaN)(vr.min, sourceRange.min), sourceRange.min);
                    var rmax = Math.max((0, Util_js_2.ifNaN)(vr.max, sourceRange.max), sourceRange.max);
                    if (rmin !== vr.min || rmax !== vr.max) {
                        // Changed
                        vr = { min: rmin, max: rmax };
                        changed = true;
                    }
                }
                else {
                    // Use actual range of data
                    if (!isRangeEqual(sourceRange, vr)) {
                        vr = sourceRange;
                        changed = true;
                    }
                }
            }
            this._visualRange = vr;
            return __assign(__assign({}, vr), { changed: changed });
        },
        enumerable: false,
        configurable: true
    });
    Series.prototype.scaleValue = function (value) {
        if (this.source === undefined)
            return value;
        var r = this.visualRange;
        if (r.min == r.max) {
            // No real scale - only received the same value for this series
            return 0.5;
        }
        return (0, index_js_3.scale)(value, r.min, r.max);
    };
    Series.prototype.add = function (value) {
        (0, Guards_js_1.number)(value, "", "value");
        this.source.add(value);
        this.plot.plotArea.needsDrawing = true;
    };
    /**
     * Clears the underlying source
     * and sets a flag that the plot area needs redrawing
     */
    Series.prototype.clear = function () {
        this.source.clear();
        this._visualRange = __assign({}, this.axisRange);
        this.plot.plotArea.needsDrawing = true;
    };
    return Series;
}());
exports.Series = Series;
var PlotArea = /** @class */ (function (_super) {
    __extends(PlotArea, _super);
    function PlotArea(plot) {
        var _this = _super.call(this, plot, plot.canvasEl, "PlotArea") || this;
        _this.plot = plot;
        _this.paddingPx = 3;
        _this.piPi = Math.PI * 2;
        // If pointer is more than this distance away from a data point, it's ignored
        _this.pointerDistanceThreshold = 20;
        _this.lastRangeChange = 0;
        return _this;
    }
    PlotArea.prototype.clear = function () {
        this.lastRangeChange = 0;
        this.pointer = undefined;
    };
    PlotArea.prototype.measureSelf = function (opts, parent) {
        var axisY = opts.getSize("AxisY");
        if (axisY === undefined)
            return;
        var legend = opts.getSize("Legend");
        if (legend === undefined)
            return;
        var axisX = opts.getSize("AxisX");
        if (axisX === undefined)
            return;
        return {
            x: axisY.width,
            y: 0,
            width: opts.bounds.width - axisY.width,
            height: opts.bounds.height - legend.height - axisX.height
        };
    };
    PlotArea.prototype.onNotify = function (msg, source) {
        if (msg === "measureApplied" && source === this.plot.axisY)
            this._needsLayout = true;
        if (msg === "measureApplied" && source === this.plot.legend)
            this._needsLayout = true;
    };
    // protected onClick(p: Points.Point): void {
    //   this.plot.frozen = !this.plot.frozen;    
    // }
    PlotArea.prototype.onPointerLeave = function () {
        var series = __spreadArray([], this.plot.series.values(), true);
        series.forEach(function (series) {
            series.tooltip = undefined;
        });
        this.pointer = undefined;
        this.plot.legend.onLayoutNeeded();
    };
    PlotArea.prototype.onPointerMove = function (p) {
        this.pointer = p;
        this.plot.legend.onLayoutNeeded();
    };
    PlotArea.prototype.measurePreflight = function () {
        this.updateTooltip();
    };
    PlotArea.prototype.updateTooltip = function () {
        var _this = this;
        var p = this.pointer;
        if (p === undefined)
            return;
        var series = __spreadArray([], this.plot.series.values(), true);
        series.forEach(function (series) {
            if (p === undefined) {
                series.tooltip = undefined;
                return;
            }
            if (series.dataHitPoint === undefined)
                return;
            var v = series.dataHitPoint(p);
            if (v[0] === undefined)
                return;
            if (v[1] > _this.pointerDistanceThreshold)
                return; // too far away
            series.tooltip = series.formatValue(v[0].value);
            //this.plot.legend.onLayoutNeeded();
        });
        this.plot.legend.needsDrawing = true;
    };
    PlotArea.prototype.drawSelf = function (ctx) {
        var _this = this;
        if (this.plot.frozen)
            return;
        var series = this.plot.seriesArray(); // [...this.plot.series.values()];
        ctx.clearRect(0, 0, this.visual.width, this.visual.height);
        series.forEach(function (series) {
            if (series.source.type === "array" || series.source.type === "stream") {
                var arraySeries = series.source;
                if (arraySeries.data === undefined)
                    return;
                var d = __spreadArray([], arraySeries.data, true);
                _this.drawDataSet(series, d, ctx);
            }
            else
                console.warn("Unknown data source type ".concat(series.source.type));
        });
    };
    PlotArea.prototype.computeY = function (series, rawValue) {
        var s = series.scaleValue(rawValue);
        return ((0, index_js_3.flip)(s) * this.visual.height) + this.paddingPx;
    };
    PlotArea.prototype.drawDataSet = function (series, d, ctx) {
        var padding = this.paddingPx + series.width;
        var v = index_js_2.Rects.subtract(this.visual, padding * 2, padding * 3.5);
        var pxPerPt = v.width / d.length;
        series.lastPxPerPt = pxPerPt;
        var x = padding;
        ctx.strokeStyle = series.colour;
        ctx.lineWidth = series.width;
        var shapes = [];
        series.dataHitPoint = function (pt) {
            var distances = shapes.map(function (v) { return index_js_2.Points.distanceToExterior(pt, v); });
            var i = NumericArrays_js_1.minIndex.apply(void 0, distances);
            var closest = shapes[i];
            if (closest === undefined)
                [undefined, 0];
            return [closest, distances[i]];
        };
        if (series.drawingStyle === "line") {
            var y = 0;
            ctx.beginPath();
            for (var i = 0; i < d.length; i++) {
                var scaled = (0, index_js_3.clamp)(series.scaleValue(d[i]));
                y = padding + this.paddingPx + (v.height * (0, index_js_3.flip)(scaled));
                shapes.push({ x: x, y: y, index: i, value: d[i] });
                if (i == 0)
                    ctx.moveTo(x + pxPerPt / 2, y);
                else
                    ctx.lineTo(x + pxPerPt / 2, y);
                if (y > this.visual.height)
                    console.warn(y + ' h: ' + this.visual.height);
                x += pxPerPt;
            }
            ctx.strokeStyle = series.colour;
            ctx.stroke();
        }
        else if (series.drawingStyle === "dotted") {
            var y = 0;
            ctx.fillStyle = series.colour;
            for (var i = 0; i < d.length; i++) {
                var scaled = series.scaleValue(d[i]);
                y = padding + (v.height * (0, index_js_3.flip)(scaled));
                ctx.beginPath();
                ctx.arc(x + pxPerPt / 2, y, series.width, 0, this.piPi);
                ctx.fill();
                shapes.push({ radius: series.width, x: x, y: y, index: i, value: d[i] });
                x += pxPerPt;
            }
        }
        else if (series.drawingStyle === "bar") {
            ctx.fillStyle = series.colour;
            var interBarPadding = Math.ceil(pxPerPt * 0.1);
            for (var i = 0; i < d.length; i++) {
                var scaled = series.scaleValue(d[i]);
                var h = (v.height) * scaled;
                var r = {
                    x: x + interBarPadding,
                    y: v.height - h + padding,
                    width: pxPerPt - interBarPadding,
                    height: h,
                    index: i,
                    value: d[i]
                };
                ctx.fillRect(r.x, r.y, r.width, r.height);
                shapes.push(r);
                x += pxPerPt;
            }
        }
    };
    return PlotArea;
}(Sg.CanvasBox));
exports.PlotArea = PlotArea;
var Legend = /** @class */ (function (_super) {
    __extends(Legend, _super);
    function Legend(plot) {
        var _this = _super.call(this, plot, plot.canvasEl, "Legend") || this;
        _this.plot = plot;
        _this.sampleSize = { width: 10, height: 10 };
        _this.padding = 3;
        _this.widthSnapping = 20;
        return _this;
    }
    Legend.prototype.clear = function () {
    };
    Legend.prototype.measureSelf = function (opts, parent) {
        var yAxis = opts.measurements.get("AxisY");
        var sample = this.sampleSize;
        var widthSnapping = this.widthSnapping;
        var padding = this.padding;
        var ctx = opts.ctx;
        if (yAxis === undefined)
            return;
        var usableWidth = opts.bounds.width - yAxis.size.width;
        var series = this.plot.seriesArray();
        var width = padding;
        for (var i = 0; i < series.length; i++) {
            width += sample.width + padding;
            width += (0, Drawing_js_1.textWidth)(ctx, series[i].name, padding, widthSnapping);
            width += (0, Drawing_js_1.textWidth)(ctx, series[i].tooltip, padding, widthSnapping);
        }
        var rows = Math.max(1, Math.ceil(width / usableWidth));
        var h = rows * (this.sampleSize.height + this.padding + this.padding);
        return {
            x: yAxis.size.width,
            y: opts.bounds.height - h,
            width: usableWidth,
            height: h
        };
    };
    Legend.prototype.drawSelf = function (ctx) {
        var series = this.plot.seriesArray();
        var sample = this.sampleSize;
        var padding = this.padding;
        var widthSnapping = this.widthSnapping;
        var x = padding;
        var y = padding;
        ctx.clearRect(0, 0, this.visual.width, this.visual.height);
        for (var i = 0; i < series.length; i++) {
            var s = series[i];
            ctx.fillStyle = s.colour;
            ctx.fillRect(x, y, sample.width, sample.height);
            x += sample.width + padding;
            ctx.textBaseline = "middle";
            ctx.fillText(s.name, x, y + (sample.height / 2));
            x += (0, Drawing_js_1.textWidth)(ctx, s.name, padding, widthSnapping);
            if (s.tooltip) {
                ctx.fillStyle = this.plot.axisColour;
                ctx.fillText(s.tooltip, x, y + (sample.height / 2));
                x += (0, Drawing_js_1.textWidth)(ctx, s.tooltip, padding, widthSnapping);
            }
            x += padding;
            if (x > this.visual.width - 100) {
                x = padding;
                y += sample.height + padding + padding;
            }
        }
    };
    Legend.prototype.onNotify = function (msg, source) {
        if (msg === "measureApplied" && source === this._parent.axisY)
            this._needsLayout = true;
    };
    return Legend;
}(Sg.CanvasBox));
exports.Legend = Legend;
var AxisX = /** @class */ (function (_super) {
    __extends(AxisX, _super);
    function AxisX(plot) {
        var _this = _super.call(this, plot, plot.canvasEl, "AxisX") || this;
        _this.plot = plot;
        _this.paddingPx = 2;
        return _this;
    }
    AxisX.prototype.clear = function () {
    };
    AxisX.prototype.onNotify = function (msg, source) {
        if (msg === "measureApplied" && source === this.plot.axisY)
            this._needsLayout = true;
        if (msg === "measureApplied" && source === this.plot.legend) {
            this.onLayoutNeeded();
        }
    };
    AxisX.prototype.drawSelf = function (ctx) {
        var _a;
        var plot = this.plot;
        var v = this.visual;
        var width = plot.axisWidth;
        var colour = (_a = this.colour) !== null && _a !== void 0 ? _a : plot.axisColour;
        ctx.strokeStyle = colour;
        ctx.clearRect(0, 0, v.width, v.height);
        ctx.beginPath();
        ctx.lineWidth = width;
        ctx.moveTo(0, width / 2);
        ctx.lineTo(v.width, width / 2);
        ctx.stroke();
    };
    AxisX.prototype.measureSelf = function (opts, parent) {
        var plot = this.plot;
        var yAxis = opts.measurements.get("AxisY");
        if (yAxis === undefined)
            return;
        var legend = opts.measurements.get("Legend");
        if (legend === undefined)
            return;
        var h = plot.axisWidth + this.paddingPx;
        return {
            x: yAxis.size.width,
            y: opts.bounds.height - h - legend.size.height,
            width: opts.bounds.width - yAxis.size.width,
            height: h
        };
    };
    return AxisX;
}(Sg.CanvasBox));
exports.AxisX = AxisX;
var isRangeEqual = function (a, b) { return a.max === b.max && a.min === b.min; };
var isRangeSinglePoint = function (a) { return a.max === a.min; };
var AxisY = /** @class */ (function (_super) {
    __extends(AxisY, _super);
    function AxisY(plot) {
        var _this = _super.call(this, plot, plot.canvasEl, "AxisY") || this;
        _this.plot = plot;
        // Number of digits axis will be expected to show as a data legend
        _this._maxDigits = 1;
        _this.paddingPx = 2;
        _this.lastPlotAreaHeight = 0;
        _this.lastRange = { min: 0, max: 0 };
        return _this;
    }
    AxisY.prototype.clear = function () {
        this.lastRange = { min: 0, max: 0 };
        this.lastPlotAreaHeight = 0;
    };
    AxisY.prototype.measurePreflight = function () {
        var series = this.getSeries();
        if (series !== undefined && !isRangeEqual(series.visualRange, this.lastRange)) {
            this._needsLayout = true;
            this.needsDrawing = true;
        }
    };
    AxisY.prototype.onNotify = function (msg, source) {
        var pa = this.plot.plotArea;
        if (msg === "measureApplied" && source === pa) {
            if (pa.visual.height !== this.lastPlotAreaHeight) {
                this.lastPlotAreaHeight = pa.visual.height;
                this.needsDrawing = true;
            }
        }
    };
    AxisY.prototype.measureSelf = function (opts) {
        //this.debugLog(`measureSelf. needsLayout: ${this._needsLayout} needsDrawing: ${this.needsDrawing}`);
        var _a;
        var copts = opts;
        var paddingPx = this.paddingPx;
        var width = this.plot.axisWidth + paddingPx;
        var series = this.getSeries();
        if (series !== undefined) {
            var r = series.visualRange;
            this._maxDigits = Math.ceil(r.max).toString().length + series.precision + 1;
            var textToMeasure = "9".repeat(this._maxDigits);
            width += (0, Drawing_js_1.textWidth)(copts.ctx, textToMeasure, paddingPx * 2);
        }
        var w = opts.resolveToPx((_a = this.desiredSize) === null || _a === void 0 ? void 0 : _a.width, width);
        return {
            x: 0,
            y: 0,
            width: w,
            height: opts.bounds.height
        };
    };
    AxisY.prototype.drawSelf = function (ctx) {
        var s = this.getSeries();
        if (s !== undefined)
            this.seriesAxis(s, ctx);
        else {
            if (this.seriesToShow === undefined)
                return;
            console.warn("Plot AxisY series '".concat(this.seriesToShow, "' is missing."));
        }
    };
    AxisY.prototype.getSeries = function () {
        if (this.seriesToShow === undefined) {
            // Pick first series
            return this.plot.seriesArray()[0];
        }
        else {
            // Try designated series name
            return this.plot.series.get(this.seriesToShow);
        }
    };
    AxisY.prototype.seriesAxis = function (series, ctx) {
        var _a;
        var plot = this.plot;
        var plotArea = plot.plotArea;
        var v = this.visual;
        var paddingPx = this.paddingPx;
        var r = series.visualRange;
        var width = plot.axisWidth;
        var colour = (_a = this.colour) !== null && _a !== void 0 ? _a : plot.axisColour;
        ctx.strokeStyle = colour;
        ctx.fillStyle = colour;
        if (Number.isNaN(r.min) && Number.isNaN(r.max))
            return; // Empty
        this.lastRange = r;
        ctx.clearRect(0, 0, v.width, v.height);
        ctx.beginPath();
        ctx.lineWidth = width;
        var lineX = v.width - width / 2;
        ctx.moveTo(lineX, plotArea.paddingPx + (width));
        ctx.lineTo(lineX, plotArea.visual.height + width);
        ctx.stroke();
        ctx.textBaseline = "top";
        var fromRight = v.width - (paddingPx * 4);
        if (isRangeSinglePoint(r)) {
            drawText(ctx, series.formatValue(r.max), function (size) { return [
                fromRight - size.width,
                plotArea.computeY(series, r.max) - (paddingPx * 4)
            ]; });
        }
        else {
            // Draw min/max data labels
            drawText(ctx, series.formatValue(r.max), function (size) { return [
                fromRight - size.width,
                plotArea.computeY(series, r.max) + (width / 2)
            ]; });
            drawText(ctx, series.formatValue(r.min), function (size) { return [
                fromRight - size.width,
                plotArea.computeY(series, r.min) - 5
            ]; });
        }
    };
    return AxisY;
}(Sg.CanvasBox));
exports.AxisY = AxisY;
var drawText = function (ctx, text, position) {
    var size = ctx.measureText(text);
    var xy = position(size);
    ctx.fillText(text, xy[0], xy[1]);
};
/**
 * Canvas-based data plotter.
 *
 * ```
 * const p = new Plot(document.getElementById(`myCanvas`), opts);
 *
 * // Plot 1-5 as series  test'
 * p.createSeries(`test`, `array`, [1,2,3,4,5]);
 *
 * // Create a streaming series, add a random number
 * const s = p.createSeries(`test2`, `stream`);
 * s.add(Math.random());
 * ```
 *
 *
 * `createSeries` returns the {@link Series} instance with properties for fine-tuning
 */
var Plot = /** @class */ (function (_super) {
    __extends(Plot, _super);
    function Plot(canvasEl, opts) {
        if (opts === void 0) { opts = {}; }
        var _this = this;
        var _a, _b;
        if (canvasEl === undefined)
            throw new Error("canvasEl undefined");
        _this = _super.call(this, undefined, canvasEl, "Plot") || this;
        _this._frozen = false;
        if (opts.autoSize) {
            (0, Util_js_1.parentSizeCanvas)(canvasEl, function (evt) {
                _this.update(true);
            });
        }
        _this.axisColour = (_a = opts.axisColour) !== null && _a !== void 0 ? _a : "black";
        _this.axisWidth = (_b = opts.axisWidth) !== null && _b !== void 0 ? _b : 3;
        _this.series = new Map();
        _this.plotArea = new PlotArea(_this);
        _this.legend = new Legend(_this);
        _this.axisX = new AxisX(_this);
        _this.axisY = new AxisY(_this);
        return _this;
    }
    /**
     * Calls 'clear()' on each of the series
     */
    Plot.prototype.clearSeries = function () {
        for (var _i = 0, _a = this.series.values(); _i < _a.length; _i++) {
            var series = _a[_i];
            series.clear();
        }
    };
    /**
     * Removes all series, plot, legend
     * and axis data.
     */
    Plot.prototype.clear = function () {
        this.series = new Map();
        this.plotArea.clear();
        this.legend.clear();
        this.axisX.clear();
        this.axisY.clear();
        this.update(true);
    };
    Object.defineProperty(Plot.prototype, "frozen", {
        get: function () {
            return this._frozen;
        },
        set: function (v) {
            this._frozen = v;
            if (v) {
                this.canvasEl.classList.add("frozen");
                this.canvasEl.title = "Plot frozen. Tap to unfreeze";
            }
            else {
                this.canvasEl.title = "";
                this.canvasEl.classList.remove("frozen");
            }
        },
        enumerable: false,
        configurable: true
    });
    Plot.prototype.seriesArray = function () {
        return __spreadArray([], this.series.values(), true);
    };
    Object.defineProperty(Plot.prototype, "seriesLength", {
        get: function () {
            return this.series.size;
        },
        enumerable: false,
        configurable: true
    });
    Plot.prototype.plot = function (o) {
        var _this = this;
        var paths = (0, Util_js_2.getFieldPaths)(o);
        paths.forEach(function (p) {
            var s = _this.series.get(p);
            if (s === undefined) {
                s = _this.createSeries(p, "stream");
                s.drawingStyle = "line";
            }
            s.add((0, Util_js_2.getFieldByPath)(o, p));
        });
    };
    Plot.prototype.createSeriesFromObject = function (o, prefix) {
        var _this = this;
        if (prefix === void 0) { prefix = ""; }
        var keys = Object.keys(o);
        var create = function (key) {
            var v = o[key];
            if (typeof v === "object") {
                return _this.createSeriesFromObject(v, prefix + key + '.');
            }
            else if (typeof v === "number") {
                return [_this.createSeries(key, "stream")];
            }
            else {
                return [];
            }
        };
        return keys.flatMap(create);
    };
    Plot.prototype.createSeries = function (name, type, seriesOpts) {
        if (type === void 0) { type = "array"; }
        var len = this.seriesLength;
        if (name === undefined)
            name = "series-".concat(len);
        if (this.series.has(name))
            throw new Error("Series name '".concat(name, "' already in use"));
        var opts = __assign({ colour: "hsl(".concat(len * 25 % 360, ", 70%,50%)") }, seriesOpts);
        if (this.defaultSeriesOpts)
            opts = __assign(__assign({}, this.defaultSeriesOpts), opts);
        var s = new Series(name, type, this, opts);
        // if (type === `array` && initialData !== undefined) {
        //   (s.source as ArrayDataSource).set(initialData);
        // }
        this.series.set(name, s);
        this.setReady(true, true);
        this.plotArea.needsDrawing = true;
        return s;
    };
    return Plot;
}(Sg.CanvasBox));
exports.Plot = Plot;
//# sourceMappingURL=Plot2.js.map