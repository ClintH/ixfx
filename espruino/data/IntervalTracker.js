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
exports.__esModule = true;
exports.intervalTracker = exports.IntervalTracker = void 0;
var NumberTracker_js_1 = require("./NumberTracker.js");
/**
 * A `Tracker` that tracks interval between calls to `mark()`
 *
 * @export
 * @class IntervalTracker
 * @extends {ValueTracker}
 */
var IntervalTracker = /** @class */ (function (_super) {
    __extends(IntervalTracker, _super);
    function IntervalTracker() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.lastMark = 0;
        return _this;
    }
    IntervalTracker.prototype.mark = function () {
        if (this.lastMark > 0) {
            this.seen(window.performance.now() - this.lastMark);
        }
        this.lastMark = window.performance.now();
    };
    return IntervalTracker;
}(NumberTracker_js_1.NumberTracker));
exports.IntervalTracker = IntervalTracker;
/**
 * Returns a new {@link IntervalTracker} instance. IntervalTracker
 * records the interval between each call to `mark`.
 *
 * ```js
 * import { intervalTracker } from 'https://unpkg.com/ixfx/dist/data.js';
 *
 * const t = intervalTracker();
 *
 * // Call `mark` to record an interval
 * t.mark();
 * ...
 * t.mark();
 *
 * // Get average time in milliseconds between calls to `mark`
 * t.avg;
 *
 * // Longest and shortest times are available too...
 * t.min / t.max
 * ```
 *
 * Interval tracker can automatically reset after a given number of samples:
 *
 * ```
 * // Reset after 100 samples
 * const t = intervalTracker(`tracker`, { resetAfterSamples: 100} );
 * ```
 * @param id Optional id of instance
 * @returns New interval tracker
 */
var intervalTracker = function (id, opts) { return new IntervalTracker(id, opts); };
exports.intervalTracker = intervalTracker;
//# sourceMappingURL=IntervalTracker.js.map