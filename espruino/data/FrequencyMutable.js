"use strict";
/// ✔ Unit tested!
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
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _FrequencyMutable_store, _FrequencyMutable_keyString;
exports.__esModule = true;
exports.frequencyMutable = exports.FrequencyMutable = void 0;
var Events_js_1 = require("../Events.js");
var KeyValueUtil = __importStar(require("../KeyValue.js"));
var index_js_1 = require("../index.js");
var FrequencyMutable = /** @class */ (function (_super) {
    __extends(FrequencyMutable, _super);
    /**
     * Constructor
     * @param keyString Function to key items. Uses JSON.stringify by default
     */
    function FrequencyMutable(keyString) {
        if (keyString === void 0) { keyString = undefined; }
        var _this = _super.call(this) || this;
        _FrequencyMutable_store.set(_this, void 0);
        _FrequencyMutable_keyString.set(_this, void 0);
        __classPrivateFieldSet(_this, _FrequencyMutable_store, new Map(), "f");
        if (keyString === undefined) {
            keyString = function (a) {
                if (a === undefined)
                    throw new Error("Cannot create key for undefined");
                if (typeof a === "string") {
                    return a;
                }
                else {
                    return JSON.stringify(a);
                }
            };
        }
        __classPrivateFieldSet(_this, _FrequencyMutable_keyString, keyString, "f");
        return _this;
    }
    /**
     * Clear data. Fires `change` event
     */
    FrequencyMutable.prototype.clear = function () {
        __classPrivateFieldGet(this, _FrequencyMutable_store, "f").clear();
        this.fireEvent("change", undefined);
    };
    /**
     * @returns Iterator over keys (ie. groups)
     */
    FrequencyMutable.prototype.keys = function () {
        return __classPrivateFieldGet(this, _FrequencyMutable_store, "f").keys();
    };
    /**
     * @returns Iterator over frequency counts
     */
    FrequencyMutable.prototype.values = function () {
        return __classPrivateFieldGet(this, _FrequencyMutable_store, "f").values();
    };
    /**
     * @returns Copy of entries as an array of `[key, count]`
     */
    FrequencyMutable.prototype.toArray = function () {
        return Array.from(__classPrivateFieldGet(this, _FrequencyMutable_store, "f").entries());
    };
    /**
     * Returns a string with keys and counts, useful for debugging.
     * @returns
     */
    FrequencyMutable.prototype.debugString = function () {
        //eslint-disable-next-line functional/no-let
        var t = "";
        for (var _i = 0, _a = __classPrivateFieldGet(this, _FrequencyMutable_store, "f").entries(); _i < _a.length; _i++) {
            var _b = _a[_i], key = _b[0], count = _b[1];
            t += "".concat(key, ": ").concat(count, ", ");
        }
        if (t.endsWith(", "))
            return t.substring(0, t.length - 2);
        return t;
    };
    /**
     *
     * @param value Value to count
     * @returns Frequency of value, or _undefined_ if it does not exist
     */
    FrequencyMutable.prototype.frequencyOf = function (value) {
        if (typeof value === "string")
            return __classPrivateFieldGet(this, _FrequencyMutable_store, "f").get(value);
        var key = __classPrivateFieldGet(this, _FrequencyMutable_keyString, "f").call(this, value);
        return __classPrivateFieldGet(this, _FrequencyMutable_store, "f").get(key);
    };
    /**
     *
     * @param value Value to count
     * @returns Relative frequency of `value`, or _undefined_ if it does not exist
     */
    FrequencyMutable.prototype.relativeFrequencyOf = function (value) {
        //eslint-disable-next-line functional/no-let
        var freq;
        if (typeof value === "string")
            freq = __classPrivateFieldGet(this, _FrequencyMutable_store, "f").get(value);
        else {
            var key = __classPrivateFieldGet(this, _FrequencyMutable_keyString, "f").call(this, value);
            freq = __classPrivateFieldGet(this, _FrequencyMutable_store, "f").get(key);
        }
        if (freq === undefined)
            return;
        var mma = this.minMaxAvg();
        return freq / mma.total;
    };
    /**
     * @returns Copy of entries as an array
     */
    FrequencyMutable.prototype.entries = function () {
        return Array.from(__classPrivateFieldGet(this, _FrequencyMutable_store, "f").entries());
    };
    /**
     *
     * @returns Returns `{min,max,avg,total}`
     */
    FrequencyMutable.prototype.minMaxAvg = function () {
        return index_js_1.KeyValues.minMaxAvg(this.entries());
    };
    /**
     *
     * @param sortStyle Sorting style (default: _value_, ie. count)
     * @returns Sorted array of [key,frequency]
     */
    FrequencyMutable.prototype.entriesSorted = function (sortStyle) {
        if (sortStyle === void 0) { sortStyle = "value"; }
        var s = KeyValueUtil.getSorter(sortStyle);
        return s(this.entries());
    };
    /**
     *
     * @param values Values to add. Fires _change_ event after adding item(s)
     */
    FrequencyMutable.prototype.add = function () {
        var _this = this;
        var values = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            values[_i] = arguments[_i];
        }
        if (values === undefined)
            throw new Error("value parameter is undefined");
        var keys = values.map(__classPrivateFieldGet(this, _FrequencyMutable_keyString, "f"));
        //const key = this.#keyString(value);
        keys.forEach(function (key) {
            var _a;
            var score = (_a = __classPrivateFieldGet(_this, _FrequencyMutable_store, "f").get(key)) !== null && _a !== void 0 ? _a : 0;
            __classPrivateFieldGet(_this, _FrequencyMutable_store, "f").set(key, score + 1);
        });
        this.fireEvent("change", undefined);
    };
    return FrequencyMutable;
}(Events_js_1.SimpleEventEmitter));
exports.FrequencyMutable = FrequencyMutable;
_FrequencyMutable_store = new WeakMap(), _FrequencyMutable_keyString = new WeakMap();
/**
 * Frequency keeps track of how many times a particular value is seen, but
 * unlike a Map it does not store the data. By default compares
 * items by value (via JSON.stringify).
 *
 * Create with {@link frequencyMutable}.
 *
 * Fires `change` event when items are added or it is cleared.
 *
 * Overview
 * ```
 * const fh = frequencyMutable();
 * fh.add(value); // adds a value
 * fh.clear();    // clears all data
 * fh.keys() / .values() // returns an iterator for keys and values
 * fh.toArray();  //  returns an array of data in the shape [[key,freq],[key,freq]...]
 * ```
 *
 * Usage
 * ```
 * const fh = frequencyMutable();
 * fh.add(`apples`); // Count an occurence of `apples`
 * fh.add(`oranges)`;
 * fh.add(`apples`);
 *
 * const fhData = fh.toArray(); // Expect result [[`apples`, 2], [`oranges`, 1]]
 * fhData.forEach((d) => {
 *  const [key,freq] = d;
 *  console.log(`Key '${key}' occurred ${freq} time(s).`);
 * })
 * ```
 *
 * Custom key string
 * ```
 * const fh = frequencyMutable( person => person.name);
 * // All people with name `Samantha` will be counted in same group
 * fh.add({name:`Samantha`, city:`Brisbane`});
 * ```
 * @template V Type of items
 */
var frequencyMutable = function (keyString) { return new FrequencyMutable(keyString); };
exports.frequencyMutable = frequencyMutable;
//# sourceMappingURL=FrequencyMutable.js.map