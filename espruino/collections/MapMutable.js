"use strict";
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
exports.mapMutable = void 0;
var MapImmutable_js_1 = require("./MapImmutable.js");
/**
 * Returns a {@link MapMutable} (which just wraps the in-built Map)
 * Use {@link map} for the immutable alternative.
 *
 * @example Basic usage
 * ```js
 * const m = mapMutable();
 * // Add one or more entries
 * m.add(["name", "sally"]);
 * // Alternatively:
 * m.set("name", "sally");
 * // Recall
 * m.get("name");           // "sally"
 * m.delete("name");
 * m.isEmpty; // True
 * m.clear();
 * ```
 * @param data Optional initial data in the form of an array of `{ key: value }` or `[ key, value ]`
 */
var mapMutable = function () {
    var data = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        data[_i] = arguments[_i];
    }
    // eslint-disable-next-line functional/no-let
    var m = MapImmutable_js_1.add.apply(void 0, __spreadArray([new Map()], data, false));
    return {
        add: function () {
            var data = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                data[_i] = arguments[_i];
            }
            m = MapImmutable_js_1.add.apply(void 0, __spreadArray([m], data, false));
        },
        "delete": function (key) {
            m = (0, MapImmutable_js_1.del)(m, key);
        },
        clear: function () {
            m = (0, MapImmutable_js_1.add)(new Map());
        },
        set: function (key, value) {
            m = (0, MapImmutable_js_1.set)(m, key, value);
        },
        get: function (key) { return m.get(key); },
        entries: function () { return m.entries(); },
        isEmpty: function () { return m.size === 0; },
        has: function (key) { return (0, MapImmutable_js_1.has)(m, key); }
    };
};
exports.mapMutable = mapMutable;
//# sourceMappingURL=MapMutable.js.map