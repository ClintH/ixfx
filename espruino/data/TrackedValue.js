"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
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
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
exports.__esModule = true;
exports.TrackedValueMap = void 0;
var Map_js_1 = require("../collections/Map.js");
/**
 * Keeps track of keyed values of type `V` (eg Point) It stores occurences in type `T`, which
 * must extend from `TrackerBase<V>`, eg `PointTracker`.
 *
 * The `creator` function passed in to the constructor is responsible for instantiating
 * the appropriate `TrackerBase` sub-class.
 *
 * @example Sub-class
 * ```js
 * export class TrackedPointMap extends TrackedValueMap<Points.Point> {
 *  constructor(opts:TrackOpts = {}) {
 *   super((key, start) => {
 *    if (start === undefined) throw new Error(`Requires start point`);
 *    const p = new PointTracker(key, opts);
 *    p.seen(start);
 *    return p;
 *   });
 *  }
 * }
 * ```
 *
 */
var TrackedValueMap = /** @class */ (function () {
    function TrackedValueMap(creator) {
        this.store = new Map();
        this.gog = (0, Map_js_1.getOrGenerate)(this.store, creator);
    }
    Object.defineProperty(TrackedValueMap.prototype, "size", {
        /**
         * Number of named values being tracked
         */
        get: function () {
            return this.store.size;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Returns _true_ if `id` is stored
     * @param id
     * @returns
     */
    TrackedValueMap.prototype.has = function (id) {
        return this.store.has(id);
    };
    /**
     * For a given id, note that we have seen one or more values.
     * @param id Id
     * @param values Values(s)
     * @returns Information about start to last value
     */
    //eslint-disable-next-line @typescript-eslint/no-explicit-any
    TrackedValueMap.prototype.seen = function (id) {
        var values = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            values[_i - 1] = arguments[_i];
        }
        return __awaiter(this, void 0, void 0, function () {
            var trackedValue;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getTrackedValue.apply(this, __spreadArray([id], values, false))];
                    case 1:
                        trackedValue = _a.sent();
                        // Pass it over to the TrackedValue
                        return [2 /*return*/, trackedValue.seen.apply(trackedValue, values)];
                }
            });
        });
    };
    /**
     * Creates or returns a TrackedValue instance for `id`.
     * @param id
     * @param values
     * @returns
     */
    TrackedValueMap.prototype.getTrackedValue = function (id) {
        var values = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            values[_i - 1] = arguments[_i];
        }
        return __awaiter(this, void 0, void 0, function () {
            var trackedValue;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (id === null)
                            throw new Error("id parameter cannot be null");
                        if (id === undefined)
                            throw new Error("id parameter cannot be undefined");
                        return [4 /*yield*/, this.gog(id, values[0])];
                    case 1:
                        trackedValue = _a.sent();
                        return [2 /*return*/, trackedValue];
                }
            });
        });
    };
    /**
     * Remove a tracked value by id.
     * Use {@link reset} to clear them all.
     * @param id
     */
    TrackedValueMap.prototype["delete"] = function (id) {
        this.store["delete"](id);
    };
    /**
     * Remove all tracked values.
     * Use {@link delete} to remove a single value by id.
     */
    TrackedValueMap.prototype.reset = function () {
        this.store = new Map();
    };
    /**
     * Enumerate ids
     */
    TrackedValueMap.prototype.ids = function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [5 /*yield**/, __values(this.store.keys())];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    };
    /**
     * Enumerate tracked values
     */
    TrackedValueMap.prototype.tracked = function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [5 /*yield**/, __values(this.store.values())];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    };
    /**
     * Iterates TrackedValues ordered with oldest first
     * @returns
     */
    TrackedValueMap.prototype.trackedByAge = function () {
        var tp, _i, tp_1, t;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    tp = Array.from(this.store.values());
                    tp.sort(function (a, b) {
                        var aa = a.elapsed;
                        var bb = b.elapsed;
                        if (aa === bb)
                            return 0;
                        if (aa > bb)
                            return -1;
                        return 1;
                    });
                    _i = 0, tp_1 = tp;
                    _a.label = 1;
                case 1:
                    if (!(_i < tp_1.length)) return [3 /*break*/, 4];
                    t = tp_1[_i];
                    return [4 /*yield*/, t];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/];
            }
        });
    };
    /**
     * Iterates underlying values, ordered by age (oldest first)
     * First the named values are sorted by their `elapsed` value, and then
     * we return the last value for that group.
     */
    TrackedValueMap.prototype.valuesByAge = function () {
        var _i, _a, tb;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _i = 0, _a = this.trackedByAge();
                    _b.label = 1;
                case 1:
                    if (!(_i < _a.length)) return [3 /*break*/, 4];
                    tb = _a[_i];
                    return [4 /*yield*/, tb.last];
                case 2:
                    _b.sent();
                    _b.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/];
            }
        });
    };
    /**
     * Enumerate last received values
     *
     * @example Calculate centroid of latest-received values
     * ```js
     * const pointers = pointTracker();
     * const c = Points.centroid(...Array.from(pointers.lastPoints()));
     * ```
     */
    TrackedValueMap.prototype.last = function () {
        var _i, _a, p;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _i = 0, _a = this.store.values();
                    _b.label = 1;
                case 1:
                    if (!(_i < _a.length)) return [3 /*break*/, 4];
                    p = _a[_i];
                    return [4 /*yield*/, p.last];
                case 2:
                    _b.sent();
                    _b.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/];
            }
        });
    };
    /**
     * Enumerate starting values
     */
    TrackedValueMap.prototype.initialValues = function () {
        var _i, _a, p;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _i = 0, _a = this.store.values();
                    _b.label = 1;
                case 1:
                    if (!(_i < _a.length)) return [3 /*break*/, 4];
                    p = _a[_i];
                    return [4 /*yield*/, p.initial];
                case 2:
                    _b.sent();
                    _b.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/];
            }
        });
    };
    /**
     * Returns a tracked value by id, or undefined if not found
     * @param id
     * @returns
     */
    TrackedValueMap.prototype.get = function (id) {
        return this.store.get(id);
    };
    return TrackedValueMap;
}());
exports.TrackedValueMap = TrackedValueMap;
//# sourceMappingURL=TrackedValue.js.map