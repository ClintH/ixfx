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
exports.CanvasBox = exports.CanvasMeasureState = exports.Box = exports.MeasureState = void 0;
/* eslint-disable */
var index_js_1 = require("../collections/index.js");
var index_js_2 = require("../geometry/index.js");
var Rects = __importStar(require("../geometry/Rect.js"));
var Random_js_1 = require("../Random.js");
var unitIsEqual = function (a, b) {
    if (a.type === "px" && b.type === "px") {
        return (a.value === b.value);
    }
    return false;
};
var boxRectIsEqual = function (a, b) {
    if (a === undefined && b === undefined)
        return true;
    if (a === undefined)
        return false;
    if (b === undefined)
        return false;
    if (a.x && b.x) {
        if (!unitIsEqual(a.x, b.x))
            return false;
    }
    if (a.y && b.y) {
        if (!unitIsEqual(a.y, b.y))
            return false;
    }
    if (a.width && b.width) {
        if (!unitIsEqual(a.width, b.width))
            return false;
    }
    if (a.height && b.height) {
        if (!unitIsEqual(a.height, b.height))
            return false;
    }
    return true;
};
var MeasureState = /** @class */ (function () {
    function MeasureState(bounds) {
        this.bounds = bounds;
        this.pass = 0;
        this.measurements = new Map();
    }
    MeasureState.prototype.getSize = function (id) {
        var s = this.measurements.get(id);
        if (s === undefined)
            return;
        if (Rects.isPlaceholder(s.size))
            return;
        return s.size;
    };
    MeasureState.prototype.resolveToPx = function (u, defaultValue) {
        if (u === undefined)
            return defaultValue; //throw new Error(`unit undefined`);
        if (u.type === "px")
            return u.value;
        throw new Error("Unknown unit type ".concat(u.type));
    };
    return MeasureState;
}());
exports.MeasureState = MeasureState;
var Box = /** @class */ (function () {
    function Box(parent, id) {
        this.visual = Rects.placeholderPositioned;
        this.children = [];
        this._idMap = new Map();
        this.debugLayout = false;
        this._visible = true;
        this._ready = true;
        this.takesSpaceWhenInvisible = false;
        this.needsDrawing = true;
        this._needsLayout = true;
        this.debugHue = (0, Random_js_1.hue)();
        this.id = id;
        this._parent = parent;
        parent === null || parent === void 0 ? void 0 : parent.onChildAdded(this);
    }
    Box.prototype.hasChild = function (box) {
        var byRef = this.children.find(function (c) { return c === box; });
        var byId = this.children.find(function (c) { return c.id === box.id; });
        return byRef !== undefined || byId !== undefined;
    };
    Box.prototype.notify = function (msg, source) {
        this.onNotify(msg, source);
        this.children.forEach(function (c) { return c.notify(msg, source); });
    };
    Box.prototype.onNotify = function (msg, source) {
    };
    Box.prototype.onChildAdded = function (child) {
        if (child.hasChild(this))
            throw new Error("Recursive");
        if (child === this)
            throw new Error("Cannot add self as child");
        if (this.hasChild(child))
            throw new Error("Child already present");
        this.children.push(child);
        this._idMap.set(child.id, child);
    };
    Box.prototype.setReady = function (ready, includeChildren) {
        if (includeChildren === void 0) { includeChildren = false; }
        this._ready = ready;
        if (includeChildren) {
            this.children.forEach(function (c) { return c.setReady(ready, includeChildren); });
        }
    };
    Object.defineProperty(Box.prototype, "visible", {
        get: function () {
            return this._visible;
        },
        set: function (v) {
            if (this._visible === v)
                return;
            this._visible = v;
            this.onLayoutNeeded();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Box.prototype, "desiredSize", {
        get: function () {
            return this._desiredSize;
        },
        set: function (v) {
            if (boxRectIsEqual(v, this._desiredSize))
                return;
            this._desiredSize = v;
            this.onLayoutNeeded();
        },
        enumerable: false,
        configurable: true
    });
    Box.prototype.onLayoutNeeded = function () {
        this.notifyChildLayoutNeeded();
    };
    Box.prototype.notifyChildLayoutNeeded = function () {
        this._needsLayout = true;
        this.needsDrawing = true;
        if (this._parent !== undefined) {
            this._parent.notifyChildLayoutNeeded();
        }
        else {
            this.update();
        }
    };
    Object.defineProperty(Box.prototype, "root", {
        get: function () {
            if (this._parent === undefined)
                return this;
            return this._parent.root;
        },
        enumerable: false,
        configurable: true
    });
    Box.prototype.measurePreflight = function () { };
    /**
     * Applies measurement, returning true if size is different than before
     * @param size
     * @returns
     */
    Box.prototype.measureApply = function (m, force) {
        var different = true;
        this._needsLayout = false;
        if (Rects.isEqual(m.size, this.visual))
            different = false;
        if (Rects.isPositioned(m.size)) {
            this.visual = m.size;
        }
        else {
            this.visual = {
                x: 0, y: 0,
                width: m.size.width,
                height: m.size.height
            };
        }
        m.children.forEach(function (c) {
            if (c !== undefined)
                c.ref.measureApply(c, force);
        });
        if (different || force) {
            this.needsDrawing = true;
            this.root.notify("measureApplied", this);
        }
        return different;
    };
    Box.prototype.debugLog = function (m) {
        console.log(this.id, m);
    };
    Box.prototype.measureStart = function (opts, force, parent) {
        this.measurePreflight();
        var m = {
            ref: this,
            size: Rects.placeholder,
            children: []
        };
        opts.measurements.set(this.id, m);
        if (!this._visible && !this.takesSpaceWhenInvisible) {
            m.size = Rects.emptyPositioned;
        }
        else {
            var size = this._lastMeasure;
            if (this._needsLayout || this._lastMeasure === undefined) {
                size = this.measureSelf(opts, parent);
                this.root.notify("measured", this);
            }
            if (size === undefined)
                return;
            m.size = size;
            this._lastMeasure = size;
        }
        m.children = this.children.map(function (c) { return c.measureStart(opts, force, m); });
        if (index_js_1.Arrays.without(m.children, undefined).length < this.children.length) {
            return undefined; // One of the children did not resolve
        }
        return m;
    };
    Box.prototype.measureSelf = function (opts, parent) {
        var size = Rects.placeholderPositioned;
        if (parent) {
            // Use parent size
            if (parent.size) {
                size = {
                    x: 0, y: 0,
                    width: parent.size.width,
                    height: parent.size.height
                };
            }
        }
        else {
            // Use canvas size
            size = {
                x: 0, y: 0,
                width: opts.bounds.width,
                height: opts.bounds.height
            };
        }
        if (Rects.isPlaceholder(size))
            return;
        return size;
    };
    Box.prototype.updateDone = function (state, force) {
        this.onUpdateDone(state, force);
        this.children.forEach(function (c) { return c.updateDone(state, force); });
    };
    Box.prototype.update = function (force) {
        if (force === void 0) { force = false; }
        var state = this.updateBegin(force);
        var attempts = 5;
        var applied = false;
        while (attempts--) {
            var m = this.measureStart(state, force);
            if (m !== undefined) {
                // Apply measurements
                this.measureApply(m, force);
                if (!this._ready)
                    return;
                applied = true;
                //this.onMeasurementApplied(sizeChanged, force;
                //return;
            }
        }
        this.updateDone(state, force);
        if (!applied)
            console.warn("Ran out of measurement attempts");
    };
    return Box;
}());
exports.Box = Box;
var CanvasMeasureState = /** @class */ (function (_super) {
    __extends(CanvasMeasureState, _super);
    function CanvasMeasureState(bounds, ctx) {
        var _this = _super.call(this, bounds) || this;
        _this.ctx = ctx;
        return _this;
    }
    return CanvasMeasureState;
}(MeasureState));
exports.CanvasMeasureState = CanvasMeasureState;
var CanvasBox = /** @class */ (function (_super) {
    __extends(CanvasBox, _super);
    function CanvasBox(parent, canvasEl, id) {
        var _this = _super.call(this, parent, id) || this;
        if (canvasEl === undefined)
            throw new Error("canvasEl undefined");
        if (canvasEl === null)
            throw new Error("canvasEl null");
        _this.canvasEl = canvasEl;
        if (parent === undefined)
            _this.designateRoot();
        return _this;
    }
    CanvasBox.prototype.designateRoot = function () {
        var _this = this;
        this.canvasEl.addEventListener("pointermove", function (evt) {
            var p = { x: evt.offsetX, y: evt.offsetY };
            _this.notifyPointerMove(p);
        });
        this.canvasEl.addEventListener("pointerleave", function (evt) {
            _this.notifyPointerLeave();
        });
        this.canvasEl.addEventListener("click", function (evt) {
            var p = { x: evt.offsetX, y: evt.offsetY };
            _this.notifyClick(p);
        });
    };
    CanvasBox.prototype.onClick = function (p) { };
    CanvasBox.prototype.notifyClick = function (p) {
        if (Rects.isPlaceholder(this.visual))
            return;
        if (Rects.intersectsPoint(this.visual, p)) {
            var pp_1 = index_js_2.Points.subtract(p, this.visual.x, this.visual.y);
            this.onClick(pp_1);
            this.children.forEach(function (c) { return c.notifyClick(pp_1); });
        }
    };
    CanvasBox.prototype.notifyPointerLeave = function () {
        this.onPointerLeave();
        this.children.forEach(function (c) { return c.notifyPointerLeave(); });
    };
    CanvasBox.prototype.notifyPointerMove = function (p) {
        if (Rects.isPlaceholder(this.visual))
            return;
        if (Rects.intersectsPoint(this.visual, p)) {
            var pp_2 = index_js_2.Points.subtract(p, this.visual.x, this.visual.y);
            this.onPointerMove(pp_2);
            this.children.forEach(function (c) { return c.notifyPointerMove(pp_2); });
        }
    };
    ;
    CanvasBox.prototype.onPointerLeave = function () {
    };
    CanvasBox.prototype.onPointerMove = function (p) {
    };
    CanvasBox.prototype.updateBegin = function () {
        var ctx = this.canvasEl.getContext("2d");
        if (ctx === null)
            throw new Error("Context unavailable");
        var s = this.canvasEl.getBoundingClientRect();
        return new CanvasMeasureState({
            width: s.width,
            height: s.height
        }, ctx);
    };
    CanvasBox.prototype.onUpdateDone = function (state, force) {
        if (!this.needsDrawing && !force)
            return;
        var ctx = this.canvasEl.getContext("2d");
        if (ctx === null)
            throw new Error("Context unavailable");
        ctx.save();
        ctx.translate(this.visual.x, this.visual.y);
        var v = this.visual;
        if (this.debugLayout) {
            //ctx.clearRect(0,0,v.width,v.height);
            ctx.lineWidth = 1;
            ctx.strokeStyle = "hsl(".concat(this.debugHue, ", 100%, 50%)");
            //ctx.fillStyle = ctx.strokeStyle;
            //ctx.fillRect(0,0,v.width,v.height);
            ctx.strokeRect(0, 0, v.width, v.height);
            ctx.fillStyle = ctx.strokeStyle;
            ctx.fillText(this.id, 10, 10, v.width);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(v.width, v.height);
            ctx.stroke();
        }
        this.drawSelf(ctx);
        this.needsDrawing = false;
        ctx.restore();
    };
    CanvasBox.prototype.drawSelf = function (ctx) {
    };
    return CanvasBox;
}(Box));
exports.CanvasBox = CanvasBox;
//# sourceMappingURL=SceneGraph.js.map