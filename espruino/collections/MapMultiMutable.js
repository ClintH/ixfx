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
var _MapOfMutableImpl_map;
exports.__esModule = true;
exports.mapCircularMutable = exports.mapSet = exports.mapArray = exports.MapOfMutableImpl = void 0;
// ✔ UNIT TESTED
var Events_js_1 = require("../Events.js");
var Util_js_1 = require("../Util.js");
var Map_js_1 = require("./Map.js");
var Arrays_js_1 = require("./Arrays.js");
var CircularArray_js_1 = require("./CircularArray.js");
/**
 * @internal
 */
var MapOfMutableImpl = /** @class */ (function (_super) {
    __extends(MapOfMutableImpl, _super);
    function MapOfMutableImpl(type, opts) {
        if (opts === void 0) { opts = {}; }
        var _this = this;
        var _a;
        _this = _super.call(this) || this;
        /* eslint-disable-next-line functional/prefer-readonly-type */
        _MapOfMutableImpl_map.set(_this, new Map());
        _this.type = type;
        _this.groupBy = (_a = opts.groupBy) !== null && _a !== void 0 ? _a : Util_js_1.toStringDefault;
        return _this;
    }
    Object.defineProperty(MapOfMutableImpl.prototype, "typeName", {
        /**
         * Returns the type name. For in-built implementations, it will be one of: array, set or circular
         */
        get: function () {
            return this.type.name;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MapOfMutableImpl.prototype, "lengthMax", {
        /**
         * Returns the length of the longest child list
         */
        get: function () {
            //eslint-disable-next-line functional/no-let
            var m = 0;
            for (var _i = 0, _a = __classPrivateFieldGet(this, _MapOfMutableImpl_map, "f").values(); _i < _a.length; _i++) {
                var v = _a[_i];
                m = Math.max(m, this.type.count(v));
            }
            return m;
        },
        enumerable: false,
        configurable: true
    });
    MapOfMutableImpl.prototype.debugString = function () {
        var _this = this;
        var keys = Array.from(__classPrivateFieldGet(this, _MapOfMutableImpl_map, "f").keys());
        // eslint-disable-next-line functional/no-let
        var r = "Keys: ".concat(keys.join(", "), "\r\n");
        keys.forEach(function (k) {
            var v = __classPrivateFieldGet(_this, _MapOfMutableImpl_map, "f").get(k);
            if (v !== undefined) {
                var asArray = _this.type.toArray(v);
                if (asArray !== undefined) {
                    r += " - ".concat(k, " (").concat(_this.type.count(v), ") = ").concat(JSON.stringify(asArray), "\r\n");
                }
            }
            else
                r += " - ".concat(k, " (undefined)\r\n");
        });
        return r;
    };
    Object.defineProperty(MapOfMutableImpl.prototype, "isEmpty", {
        get: function () {
            return (__classPrivateFieldGet(this, _MapOfMutableImpl_map, "f").size === 0);
        },
        enumerable: false,
        configurable: true
    });
    MapOfMutableImpl.prototype.clear = function () {
        __classPrivateFieldGet(this, _MapOfMutableImpl_map, "f").clear();
        _super.prototype.fireEvent.call(this, "clear", true);
    };
    MapOfMutableImpl.prototype.addKeyedValues = function (key) {
        var values = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            values[_i - 1] = arguments[_i];
        }
        var set = __classPrivateFieldGet(this, _MapOfMutableImpl_map, "f").get(key);
        //console.log(`addKeyedValues: key: ${key} values: ${JSON.stringify(values)}`);
        if (set === undefined) {
            __classPrivateFieldGet(this, _MapOfMutableImpl_map, "f").set(key, this.type.add(undefined, values));
            _super.prototype.fireEvent.call(this, "addedKey", { key: key });
            _super.prototype.fireEvent.call(this, "addedValues", { values: values });
        }
        else {
            // eslint-disable-next-line functional/immutable-data
            __classPrivateFieldGet(this, _MapOfMutableImpl_map, "f").set(key, this.type.add(set, values));
            _super.prototype.fireEvent.call(this, "addedValues", { values: values });
        }
    };
    MapOfMutableImpl.prototype.addValue = function () {
        var _this = this;
        var values = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            values[_i] = arguments[_i];
        }
        values.forEach(function (v) { return _this.addKeyedValues(_this.groupBy(v), v); });
    };
    MapOfMutableImpl.prototype.hasKeyValue = function (key, value) {
        var m = __classPrivateFieldGet(this, _MapOfMutableImpl_map, "f").get(key);
        if (m === undefined)
            return false;
        return this.type.has(m, value);
    };
    MapOfMutableImpl.prototype.has = function (key) {
        return __classPrivateFieldGet(this, _MapOfMutableImpl_map, "f").has(key);
    };
    MapOfMutableImpl.prototype.deleteKeyValue = function (key, value) {
        var a = __classPrivateFieldGet(this, _MapOfMutableImpl_map, "f").get(key);
        if (a === undefined)
            return false;
        var preCount = this.type.count(a);
        var filtered = this.type.without(a, value); // this.type.filter(a, v => !this.valueComparer(v, value));
        var postCount = filtered.length;
        __classPrivateFieldGet(this, _MapOfMutableImpl_map, "f").set(key, this.type.add(undefined, filtered));
        return preCount > postCount;
    };
    MapOfMutableImpl.prototype["delete"] = function (key) {
        var a = __classPrivateFieldGet(this, _MapOfMutableImpl_map, "f").get(key);
        if (a === undefined)
            return false;
        __classPrivateFieldGet(this, _MapOfMutableImpl_map, "f")["delete"](key);
        this.fireEvent("deleteKey", { key: key });
        return true;
    };
    MapOfMutableImpl.prototype.findKeyForValue = function (value) {
        var _this = this;
        var keys = Array.from(__classPrivateFieldGet(this, _MapOfMutableImpl_map, "f").keys());
        var found = keys.find(function (key) {
            var a = __classPrivateFieldGet(_this, _MapOfMutableImpl_map, "f").get(key);
            if (a === undefined)
                throw Error("Bug: map could not be accessed");
            if (_this.type.has(a, value))
                return true;
            return false;
        });
        return found;
    };
    MapOfMutableImpl.prototype.count = function (key) {
        var e = __classPrivateFieldGet(this, _MapOfMutableImpl_map, "f").get(key);
        if (e === undefined)
            return 0;
        return this.type.count(e);
    };
    /**
     * Returns the array of values stored under `key`
     * or undefined if key does not exist
     */
    MapOfMutableImpl.prototype.get = function (key) {
        var m = __classPrivateFieldGet(this, _MapOfMutableImpl_map, "f").get(key);
        if (m === undefined)
            return undefined;
        return this.type.toArray(m);
    };
    MapOfMutableImpl.prototype.getSource = function (key) {
        return __classPrivateFieldGet(this, _MapOfMutableImpl_map, "f").get(key);
    };
    /* eslint-disable-next-line functional/prefer-readonly-type */
    MapOfMutableImpl.prototype.keys = function () {
        return Array.from(__classPrivateFieldGet(this, _MapOfMutableImpl_map, "f").keys());
    };
    /* eslint-disable-next-line functional/prefer-readonly-type */
    MapOfMutableImpl.prototype.keysAndCounts = function () {
        var _this = this;
        var keys = this.keys();
        /* eslint-disable-next-line functional/prefer-readonly-type */
        var r = keys.map(function (k) { return [k, _this.count(k)]; });
        return r;
    };
    MapOfMutableImpl.prototype.merge = function (other) {
        var _this = this;
        var keys = other.keys();
        keys.forEach(function (key) {
            var data = other.get(key);
            if (data !== undefined)
                _this.addKeyedValues.apply(_this, __spreadArray([key], data, false));
        });
    };
    return MapOfMutableImpl;
}(Events_js_1.SimpleEventEmitter));
exports.MapOfMutableImpl = MapOfMutableImpl;
_MapOfMutableImpl_map = new WeakMap();
// ✔ UNIT TESTED
/**
 * Returns a {@link MapOfMutable} to allow storing multiple values under a key, unlike a regular Map.
 * @example
 * ```js
 * const map = mapArray();
 * map.add(`hello`, [1,2,3,4]); // Adds series of numbers under key `hello`
 *
 * const hello = map.get(`hello`); // Get back values
 * ```
 *
 * Takes options:
 * * `comparer`: {@link Util.IsEqual}
 * * `toString`: {@link Util.ToString}
 *
 * A custom {@link Util.ToString} function can be provided which is used when checking value equality (`has`, `without`)
 * ```js
 * const map = mapArray({toString:(v) => v.name}); // Compare values based on their `name` field;
 * ```
 *
 * Alternatively, a {@link Util.IsEqual} function can be used:
 * ```js
 * const map = mapArray({comparer: (a, b) => a.name === b.name });
 * ```
 * @param opts
 * @template V Data type of items
 * @returns {@link MapOfMutable}
 */
var mapArray = function (opts) {
    if (opts === void 0) { opts = {}; }
    var comparer = opts.comparer === undefined ?
        opts.toString === undefined ? function (a, b) { return opts.toString(a) === opts.toString(b); } :
            Util_js_1.isEqualDefault
        : opts.comparer;
    var t = {
        get name() {
            return "array";
        },
        add: function (dest, values) {
            if (dest === undefined)
                return __spreadArray([], values, true);
            return __spreadArray(__spreadArray([], dest, true), values, true);
        },
        count: function (source) { return source.length; },
        find: function (source, predicate) { return source.find(predicate); },
        filter: function (source, predicate) { return source.filter(predicate); },
        toArray: function (source) { return source; },
        has: function (source, value) { return source.find(function (v) { return comparer(v, value); }) !== undefined; },
        without: function (source, value) { return source.filter(function (v) { return !comparer(v, value); }); }
    };
    var m = new MapOfMutableImpl(t, opts);
    return m;
};
exports.mapArray = mapArray;
/**
 * Returns a {@link MapOfMutable} that uses a set to hold values.
 * This means that only unique values are stored under each key. By default it
 * uses the JSON representation to compare items.
 *
 * Options: `{ hash: toStringFn } }`
 *
 * `hash` is a {@link Util.ToString} function: `(object) => string`. By default it uses
 * `JSON.stringify`.
 *
 * @example Only storing the newest three items per key
 * ```js
 * const map = mapSetMutable();
 * map.add(`hello`, [1, 2, 3, 1, 2, 3]);
 * const hello = map.get(`hello`); // [1, 2, 3]
 * ```
 *
 * @example
 * ```js
 * const hash = (v) => v.name; // Use name as the key
 * const map = mapSetMutable(hash);
 * map.add(`hello`, {age:40, name: `Mary`});
 * map.add(`hello`, {age:29, name: `Mary`}); // Value ignored as same name exists
 * ```
 * @param opts
 * @returns
 */
var mapSet = function (opts) {
    var _a;
    var hash = (_a = opts === null || opts === void 0 ? void 0 : opts.hash) !== null && _a !== void 0 ? _a : Util_js_1.toStringDefault;
    var comparer = function (a, b) { return hash(a) === hash(b); };
    var t = {
        get name() {
            return "set";
        },
        add: function (dest, values) { return Map_js_1.addUniqueByHash.apply(void 0, __spreadArray([dest, hash], values, false)); },
        count: function (source) { return source.size; },
        find: function (source, predicate) { return (0, Map_js_1.find)(source, predicate); },
        filter: function (source, predicate) { return (0, Map_js_1.filter)(source, predicate); },
        toArray: function (source) { return (0, Map_js_1.toArray)(source); },
        has: function (source, value) { return (0, Map_js_1.hasAnyValue)(source, value, comparer); },
        without: function (source, value) { return (0, Arrays_js_1.without)((0, Map_js_1.toArray)(source), value, comparer); }
    };
    var m = new MapOfMutableImpl(t, opts);
    return m;
};
exports.mapSet = mapSet;
/**
 * Returns a {@link MapOfMutable} that uses a {@link CircularArray} to hold values. Mutable.
 * This means that the number of values stored under each key will be limited to the defined
 * capacity.
 *
 * Required option:
 * * `capacity`: how many items to hold
 *
 * @example Only store the most recent three items per key
 * ```js
 * const map = mapCircularMutable({capacity: 3});
 * map.add(`hello`, [1, 2, 3, 4, 5]);
 * const hello = map.get(`hello`); // [3, 4, 5]
 * ```
 *
 *
 * @param opts
 * @returns
 */
var mapCircularMutable = function (opts) {
    var comparer = Util_js_1.isEqualDefault;
    var t = {
        get name() {
            return "circular";
        },
        add: function (dest, values) {
            if (dest === undefined)
                dest = (0, CircularArray_js_1.circularArray)(opts.capacity);
            values.forEach(function (v) { return dest = dest === null || dest === void 0 ? void 0 : dest.add(v); });
            return dest;
        },
        count: function (source) { return source.length; },
        find: function (source, predicate) { return source.find(predicate); },
        filter: function (source, predicate) { return source.filter(predicate); },
        toArray: function (source) { return source; },
        has: function (source, value) { return source.find(function (v) { return comparer(v, value); }) !== undefined; },
        without: function (source, value) { return source.filter(function (v) { return !comparer(v, value); }); }
    };
    return new MapOfMutableImpl(t, opts);
};
exports.mapCircularMutable = mapCircularMutable;
//# sourceMappingURL=MapMultiMutable.js.map