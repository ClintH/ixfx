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
exports.pointTracker = exports.pointsTracker = exports.TrackedPointMap = exports.PointTracker = void 0;
var Points = __importStar(require("../geometry/Point.js"));
var Line = __importStar(require("../geometry/Line.js"));
var TrackedValue_js_1 = require("./TrackedValue.js");
var ObjectTracker_js_1 = require("./ObjectTracker.js");
var PointTracker = /** @class */ (function (_super) {
    __extends(PointTracker, _super);
    function PointTracker(id, opts) {
        if (opts === void 0) { opts = {}; }
        var _this = _super.call(this, id, opts) || this;
        _this.id = id;
        return _this;
    }
    Object.defineProperty(PointTracker.prototype, "x", {
        /**
         * Returns the last x coord
         */
        get: function () {
            return this.last.x;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PointTracker.prototype, "y", {
        /**
         * Returns the last y coord
         */
        get: function () {
            return this.last.y;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * @ignore
     */
    PointTracker.prototype.onReset = function () {
        _super.prototype.onReset.call(this);
        this.lastResult = undefined;
        this.initialRelation = undefined;
    };
    /**
     * Tracks a point, returning data on its relation to the
     * initial point and the last received point.
     * @param p Point
     */
    PointTracker.prototype.seen = function () {
        var p = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            p[_i] = arguments[_i];
        }
        var currentLast = this.last;
        _super.prototype.seen.apply(this, p);
        var newLast = this.last;
        // Don't yet have an initial relation function
        if (this.initialRelation === undefined && this.initial) {
            this.initialRelation = Points.relation(this.initial);
        }
        else if (this.initialRelation === undefined) {
            throw new Error("Bug: No initialRelation, and this.inital is undefined?");
        }
        var lastRelation = Points.relation(currentLast);
        // Get basic geometric relation from start to the last provided point
        var initialRel = __assign({}, this.initialRelation(newLast));
        var lastRel = __assign(__assign({}, lastRelation(newLast)), { speed: this.values.length < 2 ? 0 : Line.length(currentLast, newLast) / (newLast.at - currentLast.at) });
        var r = {
            fromInitial: initialRel,
            fromLast: lastRel,
            values: __spreadArray([], this.values, true)
        };
        this.lastResult = r;
        return r;
    };
    Object.defineProperty(PointTracker.prototype, "line", {
        /**
         * Returns a polyline representation of stored points.
         * Returns an empty array if points were not saved, or there's only one.
         */
        get: function () {
            if (this.values.length === 1)
                return [];
            return Line.joinPointsToLines.apply(Line, this.values);
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Returns distance from latest point to initial point.
     * If there are less than two points, zero is returned.
     *
     * This is the direct distance, not the accumulated length.
     * @returns Distance
     */
    PointTracker.prototype.distanceFromStart = function () {
        var initial = this.initial;
        if (this.values.length >= 2 && initial !== undefined) {
            return Points.distance(initial, this.last);
        }
        else {
            return 0;
        }
    };
    /**
     * Difference between last point and the initial point, calculated
     * as a simple subtraction of x & y.
     *
     * `Points.Placeholder` is returned if there's only one point so far.
     */
    PointTracker.prototype.difference = function () {
        var initial = this.initial;
        if (this.values.length >= 2 && initial !== undefined) {
            return Points.subtract(this.last, initial);
        }
        else {
            return Points.Placeholder;
        }
    };
    /**
     * Returns angle (in radians) from latest point to the initial point
     * If there are less than two points, undefined is return.
     * @returns Angle in radians
     */
    PointTracker.prototype.angleFromStart = function () {
        var initial = this.initial;
        if (initial !== undefined && this.values.length > 2) {
            return Points.angle(initial, this.last);
        }
    };
    Object.defineProperty(PointTracker.prototype, "length", {
        /**
         * Returns the total length of accumulated points.
         * Returns 0 if points were not saved, or there's only one
         */
        get: function () {
            if (this.values.length === 1)
                return 0;
            var l = this.line;
            return Line.length(l);
        },
        enumerable: false,
        configurable: true
    });
    return PointTracker;
}(ObjectTracker_js_1.ObjectTracker));
exports.PointTracker = PointTracker;
/**
 * A {@link TrackedValueMap} for points. Uses {@link PointTracker} to
 * track added values.
 */
var TrackedPointMap = /** @class */ (function (_super) {
    __extends(TrackedPointMap, _super);
    function TrackedPointMap(opts) {
        if (opts === void 0) { opts = {}; }
        return _super.call(this, function (key, start) {
            if (start === undefined)
                throw new Error("Requires start point");
            var p = new PointTracker(key, opts);
            p.seen(start);
            return p;
        }) || this;
    }
    return TrackedPointMap;
}(TrackedValue_js_1.TrackedValueMap));
exports.TrackedPointMap = TrackedPointMap;
/**
 * Track several named points. Call `seen()` to track a point. Mutable.
 *
 * Basic usage
 * ```js
 * import { pointsTracker } from 'https://unpkg.com/ixfx/dist/data.js';
 *
 * const pt = pointsTracker();
 *
 * // Track a point under a given id
 * document.addEventListener(`pointermove`, e => {
 *  const info = await pt.seen(e.pointerId, { x: e.x, y: e.y });
 *  // Yields some info on relation of the point to initial value
 * });
 * ```
 *
 * Do something with last values for all points
 * ```js
 * const c = Points.centroid(...Array.from(pt.last()));
 * ```
 *
 * More functions...
 * ```js
 * pt.size; // How many named points are being tracked
 * pt.delete(id);  // Delete named point
 * pt.reset();
 * ```
 *
 * Accessing data:
 *
 * ```js
 * pt.get(id);  // Get named point (or _undefined_)
 * pt.has(id); // Returns true if id exists
 * pt.trackedByAge(); // Iterates over tracked points, sorted by age (oldest first)
 *
 * ```
 
* Iterators:
 *
 * ```js
 * pt.tracked(); // Tracked values
 * pt.ids(); // Iterator over ids
 *
 * // Last received value for each named point
 * pt.last();
 *
 * pt.initialValues(); // Iterator over initial values for each point
 * ```
 *
 * You can work with 'most recently updated' points:
 *
 * ```js
 * // Iterates over points, sorted by age (oldest first)
 * pt.valuesByAge();
 * ```
 *
 * Options:
 * * `storeIntermediate`: if true, all points are stored internally
 * * `resetAfterSamples`: If set above 0, it will automatically reset after the given number of samples have been seen
 * @param opts
 * @returns
 */
var pointsTracker = function (opts) {
    if (opts === void 0) { opts = {}; }
    return new TrackedPointMap(opts);
};
exports.pointsTracker = pointsTracker;
/**
 * A tracked point. Create via {@link pointTracker}. Mutable. Useful for monitoring how
 * it changes over time. Eg. when a pointerdown event happens, to record the start position and then
 * track the pointer as it moves until pointerup.
 *
 * [See the point tracker playground](https://clinth.github.io/ixfx-demos/playgrounds/data/point-tracker/)
 *
 * ```js
* import { pointTracker } from 'https://unpkg.com/ixfx/dist/data.js';
 *
 * // Create a tracker
 * const t = pointTracker(`pointer-0`);
 *
 * // ...and later, tell it when a point is seen
 * const nfo = t.seen({x: evt.x, y:evt.y});
 * // nfo gives us some details on the relation between the seen point, the start, and points in-between
 * // nfo.angle, nfo.centroid, nfo.speed etc.
 * ```
 *
 * Compute based on last seen point
 * ```js
 * t.angleFromStart();
 * t.distanceFromStart();
 * t.x / t.y
 * t.length; // Total length of accumulated points
 * t.elapsed; // Total duration since start
 * t.lastResult; // The PointSeenInfo for last seen point
 * ```
 *
 * Housekeeping
 * ```js
 * t.reset(); // Reset tracker
 * ```
 */
var pointTracker = function (id, opts) {
    if (opts === void 0) { opts = {}; }
    return new PointTracker(id !== null && id !== void 0 ? id : "", opts);
};
exports.pointTracker = pointTracker;
//# sourceMappingURL=PointTracker.js.map