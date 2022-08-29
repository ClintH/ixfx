"use strict";
// ✔ UNIT TESTED
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
exports.setMutable = void 0;
var Events_js_1 = require("../Events.js");
/**
 * Creates a {@link SetMutable}.
 * @param keyString Function that produces a key for items. If unspecified uses JSON.stringify
 * @returns
 */
var setMutable = function (keyString) {
    if (keyString === void 0) { keyString = undefined; }
    return new MutableStringSetImpl(keyString);
};
exports.setMutable = setMutable;
var MutableStringSetImpl = /** @class */ (function (_super) {
    __extends(MutableStringSetImpl, _super);
    function MutableStringSetImpl(keyString) {
        if (keyString === void 0) { keyString = undefined; }
        var _this = _super.call(this) || this;
        // ✔ UNIT TESTED
        /* eslint-disable functional/prefer-readonly-type */
        _this.store = new Map();
        if (keyString === undefined) {
            keyString = function (a) {
                if (typeof a === "string") {
                    return a;
                }
                else {
                    return JSON.stringify(a);
                }
            };
        }
        _this.keyString = keyString;
        return _this;
    }
    MutableStringSetImpl.prototype.add = function () {
        var _this = this;
        var v = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            v[_i] = arguments[_i];
        }
        v.forEach(function (i) {
            var isUpdated = _this.has(i);
            _this.store.set(_this.keyString(i), i);
            _super.prototype.fireEvent.call(_this, "add", { value: i, updated: isUpdated });
        });
    };
    MutableStringSetImpl.prototype.values = function () {
        return this.store.values();
    };
    MutableStringSetImpl.prototype.clear = function () {
        this.store.clear();
        _super.prototype.fireEvent.call(this, "clear", true);
    };
    MutableStringSetImpl.prototype["delete"] = function (v) {
        var isDeleted = this.store["delete"](this.keyString(v));
        if (isDeleted)
            _super.prototype.fireEvent.call(this, "delete", v);
        return isDeleted;
    };
    MutableStringSetImpl.prototype.has = function (v) {
        return this.store.has(this.keyString(v));
    };
    MutableStringSetImpl.prototype.toArray = function () {
        return Array.from(this.store.values());
    };
    return MutableStringSetImpl;
}(Events_js_1.SimpleEventEmitter));
//# sourceMappingURL=Set.js.map