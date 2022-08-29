"use strict";
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
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
var _SimpleMapArrayMutableImpl_map;
exports.__esModule = true;
exports.simpleMapArrayMutable = void 0;
var SimpleMapArrayMutableImpl = /** @class */ (function () {
    function SimpleMapArrayMutableImpl() {
        /* eslint-disable-next-line functional/prefer-readonly-type */
        _SimpleMapArrayMutableImpl_map.set(this, new Map());
    }
    SimpleMapArrayMutableImpl.prototype.add = function (key) {
        var values = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            values[_i - 1] = arguments[_i];
        }
        var existing = __classPrivateFieldGet(this, _SimpleMapArrayMutableImpl_map, "f").get(key);
        if (existing === undefined) {
            __classPrivateFieldGet(this, _SimpleMapArrayMutableImpl_map, "f").set(key, values);
        }
        else {
            __classPrivateFieldGet(this, _SimpleMapArrayMutableImpl_map, "f").set(key, __spreadArray(__spreadArray([], existing, true), values, true));
        }
    };
    SimpleMapArrayMutableImpl.prototype.keys = function () {
        return __classPrivateFieldGet(this, _SimpleMapArrayMutableImpl_map, "f").keys();
    };
    SimpleMapArrayMutableImpl.prototype.debugString = function () {
        var _this = this;
        // eslint-disable-next-line functional/no-let
        var r = "";
        var keys = Array.from(__classPrivateFieldGet(this, _SimpleMapArrayMutableImpl_map, "f").keys());
        keys.every(function (k) {
            var v = __classPrivateFieldGet(_this, _SimpleMapArrayMutableImpl_map, "f").get(k);
            if (v === undefined)
                return;
            r += k + " (".concat(v.length, ") = ").concat(JSON.stringify(v), "\r\n");
        });
        return r;
    };
    SimpleMapArrayMutableImpl.prototype.get = function (key) {
        return __classPrivateFieldGet(this, _SimpleMapArrayMutableImpl_map, "f").get(key);
    };
    SimpleMapArrayMutableImpl.prototype["delete"] = function (key, v) {
        var existing = __classPrivateFieldGet(this, _SimpleMapArrayMutableImpl_map, "f").get(key);
        if (existing === undefined)
            return false;
        var without = existing.filter(function (i) { return i !== v; });
        __classPrivateFieldGet(this, _SimpleMapArrayMutableImpl_map, "f").set(key, without);
        return without.length < existing.length;
    };
    SimpleMapArrayMutableImpl.prototype.clear = function () {
        __classPrivateFieldGet(this, _SimpleMapArrayMutableImpl_map, "f").clear();
    };
    return SimpleMapArrayMutableImpl;
}());
_SimpleMapArrayMutableImpl_map = new WeakMap();
/**
 * A simple mutable map of arrays, without events. It can store multiple values
 * under the same key.
 *
 * For a fancier approaches, consider {@link mapArray}, {@link mapCircularMutable} or {@link mapSet}.
 *
 * @example
 * ```js
 * const m = simpleMapArrayMutable();
 * m.add(`hello`, 1, 2, 3); // Adds numbers under key `hello`
 * m.delete(`hello`);       // Deletes everything under `hello`
 *
 * const hellos = m.get(`hello`); // Get list of items under `hello`
 * ```
 *
 * @template V Type of items
 * @returns New instance
 */
var simpleMapArrayMutable = function () { return new SimpleMapArrayMutableImpl(); };
exports.simpleMapArrayMutable = simpleMapArrayMutable;
//# sourceMappingURL=SimpleMapArray.js.map