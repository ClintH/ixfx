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
exports.__esModule = true;
exports.ObjectTracker = void 0;
var TrackerBase_1 = require("./TrackerBase");
/**
 * A tracked value of type `V`.
 */
var ObjectTracker = /** @class */ (function (_super) {
    __extends(ObjectTracker, _super);
    function ObjectTracker(id, opts) {
        if (opts === void 0) { opts = {}; }
        var _this = _super.call(this, id, opts) || this;
        _this.values = [];
        return _this;
    }
    /**
     * Allows sub-classes to be notified when a reset happens
     * @ignore
     */
    ObjectTracker.prototype.onReset = function () {
        this.values = []; //this.values.slice(1);
    };
    /**
     * Tracks a value
     * @ignore
     */
    //eslint-disable-next-line @typescript-eslint/no-explicit-any
    ObjectTracker.prototype.seenImpl = function (p) {
        var _a;
        // Make sure values have a timestamp
        var ts = p.map(function (v) { return (("at" in v) ? v : __assign(__assign({}, v), { at: Date.now() })); });
        var last = ts.at(-1);
        if (this.storeIntermediate)
            (_a = this.values).push.apply(_a, ts);
        else if (this.values.length === 0) {
            // Add as initial value
            this.values.push(last);
        }
        else if (this.values.length === 2) {
            // Replace last value
            this.values[1] = last;
        }
        else if (this.values.length === 1) {
            // Add last value
            this.values.push(last);
        }
        return ts;
    };
    Object.defineProperty(ObjectTracker.prototype, "last", {
        /**
         * Last seen value. If no values have been added, it will return the initial value
         */
        get: function () {
            if (this.values.length === 1)
                return this.values[0];
            //eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            return this.values.at(-1);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ObjectTracker.prototype, "initial", {
        /**
         * Returns the initial value
         */
        get: function () {
            return this.values.at(0);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ObjectTracker.prototype, "size", {
        /**
         * Returns number of recorded values (includes the initial value in the count)
         */
        get: function () {
            return this.values.length;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ObjectTracker.prototype, "elapsed", {
        /**
         * Returns the elapsed time, in milliseconds since the initial value
         */
        get: function () {
            return Date.now() - this.values[0].at;
        },
        enumerable: false,
        configurable: true
    });
    return ObjectTracker;
}(TrackerBase_1.TrackerBase));
exports.ObjectTracker = ObjectTracker;
//# sourceMappingURL=ObjectTracker.js.map