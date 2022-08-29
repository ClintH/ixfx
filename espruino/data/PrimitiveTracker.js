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
exports.PrimitiveTracker = void 0;
var index_js_1 = require("../flow/index.js");
var TrackerBase_js_1 = require("./TrackerBase.js");
var PrimitiveTracker = /** @class */ (function (_super) {
    __extends(PrimitiveTracker, _super);
    function PrimitiveTracker(id, opts) {
        var _this = _super.call(this, id, opts) || this;
        _this.values = [];
        _this.timestamps = [];
        return _this;
    }
    Object.defineProperty(PrimitiveTracker.prototype, "last", {
        get: function () {
            return this.values.at(-1);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PrimitiveTracker.prototype, "initial", {
        get: function () {
            return this.values.at(0);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PrimitiveTracker.prototype, "size", {
        /**
       * Returns number of recorded values (this can include the initial value)
       */
        get: function () {
            return this.values.length;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PrimitiveTracker.prototype, "elapsed", {
        /**
         * Returns the elapsed time, in milliseconds since the instance was created
         */
        get: function () {
            if (this.values.length < 0)
                throw new Error("No values seen yet");
            return Date.now() - this.timestamps[0];
        },
        enumerable: false,
        configurable: true
    });
    PrimitiveTracker.prototype.onReset = function () {
        this.values = [];
        this.timestamps = [];
    };
    /**
     * Tracks a value
     */
    //eslint-disable-next-line @typescript-eslint/no-explicit-any
    PrimitiveTracker.prototype.seenImpl = function (p) {
        var _a, _b;
        var last = p.at(-1);
        var now = Date.now();
        if (this.storeIntermediate) {
            (_a = this.values).push.apply(_a, p);
            (_b = this.timestamps).push.apply(_b, (0, index_js_1.repeat)(p.length, function () { return now; }));
        }
        else if (this.values.length === 0) {
            // Add as initial value
            this.values.push(last);
            this.timestamps.push(now);
        }
        else if (this.values.length === 2) {
            // Replace last value
            this.values[1] = last;
            this.timestamps[1] = now;
        }
        else if (this.values.length === 1) {
            // Add last value
            this.values.push(last);
            this.timestamps.push(now);
        }
        return p;
    };
    return PrimitiveTracker;
}(TrackerBase_js_1.TrackerBase));
exports.PrimitiveTracker = PrimitiveTracker;
//# sourceMappingURL=PrimitiveTracker.js.map