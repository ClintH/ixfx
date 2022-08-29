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
exports.numberTracker = exports.NumberTracker = void 0;
var PrimitiveTracker_js_1 = require("./PrimitiveTracker.js");
var NumberTracker = /** @class */ (function (_super) {
    __extends(NumberTracker, _super);
    function NumberTracker() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        //samples = 0;
        _this.total = 0;
        _this.min = Number.MAX_SAFE_INTEGER;
        _this.max = Number.MIN_SAFE_INTEGER;
        return _this;
    }
    Object.defineProperty(NumberTracker.prototype, "avg", {
        get: function () {
            return this.total / this.seenCount;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Difference between last value and initial.
     * Eg. if last value was 10 and initial value was 5, 5 is returned (10 - 5)
     * If either of those is missing, undefined is returned
     */
    NumberTracker.prototype.difference = function () {
        if (this.last === undefined)
            return;
        if (this.initial === undefined)
            return;
        return this.last - this.initial;
    };
    /**
     * Relative difference between last value and initial.
     * Eg if last value was 10 and initial value was 5, 2 is returned (200%)
     */
    NumberTracker.prototype.relativeDifference = function () {
        if (this.last === undefined)
            return;
        if (this.initial === undefined)
            return;
        return this.last / this.initial;
    };
    NumberTracker.prototype.onReset = function () {
        this.min = Number.MAX_SAFE_INTEGER;
        this.max = Number.MIN_SAFE_INTEGER;
        this.total = 0;
        _super.prototype.onReset.call(this);
    };
    NumberTracker.prototype.onSeen = function (values) {
        if (values.some(function (v) { return Number.isNaN(v); }))
            throw Error("Cannot add NaN");
        this.total = values.reduce(function (acc, v) { return acc + v; }, this.total);
        this.min = Math.min.apply(Math, __spreadArray(__spreadArray([], values, false), [this.min], false));
        this.max = Math.max.apply(Math, __spreadArray(__spreadArray([], values, false), [this.max], false));
    };
    NumberTracker.prototype.getMinMaxAvg = function () {
        return {
            min: this.min,
            max: this.max,
            avg: this.avg
        };
    };
    return NumberTracker;
}(PrimitiveTracker_js_1.PrimitiveTracker));
exports.NumberTracker = NumberTracker;
/**
 * Keeps track of the total, min, max and avg in a stream of values. By default values
 * are not stored.
 *
 * Usage:
 *
 * ```js
 * import { numberTracker } from 'https://unpkg.com/ixfx/dist/data.js';
 *
 * const t = numberTracker();
 * t.seen(10);
 *
 * t.avg / t.min/ t.max
 * t.initial; // initial value
 * t.size;    // number of seen values
 * t.elapsed; // milliseconds since intialisation
 * t.last;    // last value
 * ```
 *
 * To get `{ avg, min, max, total }`
 * ```
 * t.getMinMax()
 * ```
 *
 * Use `t.reset()` to clear everything.
 *
 * Trackers can automatically reset after a given number of samples
 * ```
 * // reset after 100 samples
 * const t = numberTracker(`something`, { resetAfterSamples: 100 });
 * ```
 *
 * To store values, use the `storeIntermediate` option:
 *
 * ```js
 * const t = numberTracker(`something`, { storeIntermediate: true });
 * ```
 *
 * Difference between last value and initial value:
 * ```js
 * t.relativeDifference();
 * ```
 *
 * Get raw data (if it is being stored):
 * ```js
 * t.values; // array of numbers
 * t.timestampes; // array of millisecond times, indexes correspond to t.values
 * ```
 * @class NumberTracker
 */
var numberTracker = function (id, opts) { return new NumberTracker(id !== null && id !== void 0 ? id : "", opts !== null && opts !== void 0 ? opts : {}); };
exports.numberTracker = numberTracker;
//# sourceMappingURL=NumberTracker.js.map