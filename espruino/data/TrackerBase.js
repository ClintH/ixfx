"use strict";
exports.__esModule = true;
exports.TrackerBase = void 0;
/**
 * Base tracker class
 */
var TrackerBase = /** @class */ (function () {
    function TrackerBase(id, opts) {
        if (id === void 0) { id = "TrackerBase"; }
        if (opts === void 0) { opts = {}; }
        var _a, _b;
        this.id = id;
        this.storeIntermediate = (_a = opts.storeIntermediate) !== null && _a !== void 0 ? _a : false;
        this.resetAfterSamples = (_b = opts.resetAfterSamples) !== null && _b !== void 0 ? _b : -1;
        this.seenCount = 0;
    }
    /**
     * Reset tracker
     */
    TrackerBase.prototype.reset = function () {
        this.seenCount = 0;
        this.onReset();
    };
    //eslint-disable-next-line @typescript-eslint/no-explicit-any
    TrackerBase.prototype.seen = function () {
        var p = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            p[_i] = arguments[_i];
        }
        if (this.resetAfterSamples > 0 && this.seenCount > this.resetAfterSamples) {
            this.reset();
        }
        this.seenCount += p.length;
        var t = this.seenImpl(p);
        this.onSeen(t);
    };
    /**
     * @ignore
     */
    //eslint-disable-next-line @typescript-eslint/no-empty-function
    TrackerBase.prototype.onSeen = function (_p) {
    };
    return TrackerBase;
}());
exports.TrackerBase = TrackerBase;
//# sourceMappingURL=TrackerBase.js.map