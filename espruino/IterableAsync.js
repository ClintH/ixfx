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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncGenerator = (this && this.__asyncGenerator) || function (thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
    function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
};
var __asyncDelegator = (this && this.__asyncDelegator) || function (o) {
    var i, p;
    return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
    function verb(n, f) { i[n] = o[n] ? function (v) { return (p = !p) ? { value: __await(o[n](v)), done: n === "return" } : f ? f(v) : v; } : f; }
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
exports.zip = exports.unique = exports.toArray = exports.takeWhile = exports.some = exports.slice = exports.reduce = exports.range = exports.min = exports.max = exports.map = exports.forEach = exports.flatten = exports.find = exports.filter = exports.fill = exports.every = exports.equals = exports.dropWhile = exports.concat = exports.chunks = void 0;
/**
 * Breaks an iterable into array chunks
 * ```js
 * chunks([1,2,3,4,5,6,7,8,9,10], 3);
 * // Yields [[1, 2, 3], [4, 5, 6], [7, 8, 9], [10]]
 * ```
 * @param it
 * @param size
 */
//eslint-disable-next-line func-style
function chunks(it, size) {
    return __asyncGenerator(this, arguments, function chunks_1() {
        var buffer, it_1, it_1_1, v, e_1_1;
        var e_1, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    buffer = [];
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 8, 9, 14]);
                    it_1 = __asyncValues(it);
                    _b.label = 2;
                case 2: return [4 /*yield*/, __await(it_1.next())];
                case 3:
                    if (!(it_1_1 = _b.sent(), !it_1_1.done)) return [3 /*break*/, 7];
                    v = it_1_1.value;
                    //eslint-disable-next-line functional/immutable-data
                    buffer.push(v);
                    if (!(buffer.length === size)) return [3 /*break*/, 6];
                    return [4 /*yield*/, __await(buffer)];
                case 4: return [4 /*yield*/, _b.sent()];
                case 5:
                    _b.sent();
                    buffer = [];
                    _b.label = 6;
                case 6: return [3 /*break*/, 2];
                case 7: return [3 /*break*/, 14];
                case 8:
                    e_1_1 = _b.sent();
                    e_1 = { error: e_1_1 };
                    return [3 /*break*/, 14];
                case 9:
                    _b.trys.push([9, , 12, 13]);
                    if (!(it_1_1 && !it_1_1.done && (_a = it_1["return"]))) return [3 /*break*/, 11];
                    return [4 /*yield*/, __await(_a.call(it_1))];
                case 10:
                    _b.sent();
                    _b.label = 11;
                case 11: return [3 /*break*/, 13];
                case 12:
                    if (e_1) throw e_1.error;
                    return [7 /*endfinally*/];
                case 13: return [7 /*endfinally*/];
                case 14:
                    if (!(buffer.length > 0)) return [3 /*break*/, 17];
                    return [4 /*yield*/, __await(buffer)];
                case 15: return [4 /*yield*/, _b.sent()];
                case 16:
                    _b.sent();
                    _b.label = 17;
                case 17: return [2 /*return*/];
            }
        });
    });
}
exports.chunks = chunks;
/**
 * Return concatenation of iterators
 * @param its
 */
//eslint-disable-next-line func-style
function concat() {
    var its = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        its[_i] = arguments[_i];
    }
    return __asyncGenerator(this, arguments, function concat_1() {
        var its_1, its_1_1, it_2, e_2_1;
        var e_2, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 7, 8, 13]);
                    its_1 = __asyncValues(its);
                    _b.label = 1;
                case 1: return [4 /*yield*/, __await(its_1.next())];
                case 2:
                    if (!(its_1_1 = _b.sent(), !its_1_1.done)) return [3 /*break*/, 6];
                    it_2 = its_1_1.value;
                    return [5 /*yield**/, __values(__asyncDelegator(__asyncValues(it_2)))];
                case 3: return [4 /*yield*/, __await.apply(void 0, [_b.sent()])];
                case 4:
                    _b.sent();
                    _b.label = 5;
                case 5: return [3 /*break*/, 1];
                case 6: return [3 /*break*/, 13];
                case 7:
                    e_2_1 = _b.sent();
                    e_2 = { error: e_2_1 };
                    return [3 /*break*/, 13];
                case 8:
                    _b.trys.push([8, , 11, 12]);
                    if (!(its_1_1 && !its_1_1.done && (_a = its_1["return"]))) return [3 /*break*/, 10];
                    return [4 /*yield*/, __await(_a.call(its_1))];
                case 9:
                    _b.sent();
                    _b.label = 10;
                case 10: return [3 /*break*/, 12];
                case 11:
                    if (e_2) throw e_2.error;
                    return [7 /*endfinally*/];
                case 12: return [7 /*endfinally*/];
                case 13: return [2 /*return*/];
            }
        });
    });
}
exports.concat = concat;
/**
 * Drops elements that do not meet the predicate `f`.
 * ```js
 * dropWhile([1, 2, 3, 4], e => e < 3);
 * returns [3, 4]
 * ```
 * @param it
 * @param f
 */
//eslint-disable-next-line func-style
function dropWhile(it, f) {
    return __asyncGenerator(this, arguments, function dropWhile_1() {
        var it_3, it_3_1, v, e_3_1;
        var e_3, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 7, 8, 13]);
                    it_3 = __asyncValues(it);
                    _b.label = 1;
                case 1: return [4 /*yield*/, __await(it_3.next())];
                case 2:
                    if (!(it_3_1 = _b.sent(), !it_3_1.done)) return [3 /*break*/, 6];
                    v = it_3_1.value;
                    if (!!f(v)) return [3 /*break*/, 5];
                    return [4 /*yield*/, __await(v)];
                case 3: return [4 /*yield*/, _b.sent()];
                case 4:
                    _b.sent();
                    return [3 /*break*/, 6];
                case 5: return [3 /*break*/, 1];
                case 6: return [3 /*break*/, 13];
                case 7:
                    e_3_1 = _b.sent();
                    e_3 = { error: e_3_1 };
                    return [3 /*break*/, 13];
                case 8:
                    _b.trys.push([8, , 11, 12]);
                    if (!(it_3_1 && !it_3_1.done && (_a = it_3["return"]))) return [3 /*break*/, 10];
                    return [4 /*yield*/, __await(_a.call(it_3))];
                case 9:
                    _b.sent();
                    _b.label = 10;
                case 10: return [3 /*break*/, 12];
                case 11:
                    if (e_3) throw e_3.error;
                    return [7 /*endfinally*/];
                case 12: return [7 /*endfinally*/];
                case 13: return [5 /*yield**/, __values(__asyncDelegator(__asyncValues(it)))];
                case 14: return [4 /*yield*/, __await.apply(void 0, [_b.sent()])];
                case 15:
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.dropWhile = dropWhile;
/**
 * Returns true if items in two iterables are equal, as
 * determined by the `equality` function.
 * @param it1
 * @param it2
 * @param equality
 * @returns
 */
//eslint-disable-next-line func-style
function equals(it1, it2, equality) {
    return __awaiter(this, void 0, void 0, function () {
        var iit1, iit2, i1, i2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    iit1 = it1[Symbol.iterator]();
                    iit2 = it2[Symbol.iterator]();
                    _a.label = 1;
                case 1:
                    if (!true) return [3 /*break*/, 4];
                    return [4 /*yield*/, iit1.next()];
                case 2:
                    i1 = _a.sent();
                    return [4 /*yield*/, iit2.next()];
                case 3:
                    i2 = _a.sent();
                    if (equality !== undefined) {
                        if (!equality(i1.value, i2.value))
                            return [2 /*return*/, false];
                    }
                    else if (i1.value !== i2.value)
                        return [2 /*return*/, false];
                    if (i1.done || i2.done)
                        return [2 /*return*/, i1.done && i2.done];
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.equals = equals;
/**
 * Returns _true_ if `f` returns _true_ for
 * every item in iterable
 * @param it
 * @param f
 * @returns
 */
//eslint-disable-next-line func-style
function every(it, f) {
    var it_4, it_4_1;
    var e_4, _a;
    return __awaiter(this, void 0, void 0, function () {
        var ok, v, e_4_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    ok = true;
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 6, 7, 12]);
                    it_4 = __asyncValues(it);
                    _b.label = 2;
                case 2: return [4 /*yield*/, it_4.next()];
                case 3:
                    if (!(it_4_1 = _b.sent(), !it_4_1.done)) return [3 /*break*/, 5];
                    v = it_4_1.value;
                    ok = ok && f(v);
                    _b.label = 4;
                case 4: return [3 /*break*/, 2];
                case 5: return [3 /*break*/, 12];
                case 6:
                    e_4_1 = _b.sent();
                    e_4 = { error: e_4_1 };
                    return [3 /*break*/, 12];
                case 7:
                    _b.trys.push([7, , 10, 11]);
                    if (!(it_4_1 && !it_4_1.done && (_a = it_4["return"]))) return [3 /*break*/, 9];
                    return [4 /*yield*/, _a.call(it_4)];
                case 8:
                    _b.sent();
                    _b.label = 9;
                case 9: return [3 /*break*/, 11];
                case 10:
                    if (e_4) throw e_4.error;
                    return [7 /*endfinally*/];
                case 11: return [7 /*endfinally*/];
                case 12: return [2 /*return*/, ok];
            }
        });
    });
}
exports.every = every;
/**
 * Yields `v` for each item within `it`.
 *
 * ```js
 * fill([1, 2, 3], 0);
 * // Yields: [0, 0, 0]
 * ```
 * @param it
 * @param v
 */
//eslint-disable-next-line func-style
function fill(it, v) {
    return __asyncGenerator(this, arguments, function fill_1() {
        var it_5, it_5_1, _, e_5_1;
        var e_5, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 7, 8, 13]);
                    it_5 = __asyncValues(it);
                    _b.label = 1;
                case 1: return [4 /*yield*/, __await(it_5.next())];
                case 2:
                    if (!(it_5_1 = _b.sent(), !it_5_1.done)) return [3 /*break*/, 6];
                    _ = it_5_1.value;
                    return [4 /*yield*/, __await(v)];
                case 3: return [4 /*yield*/, _b.sent()];
                case 4:
                    _b.sent();
                    _b.label = 5;
                case 5: return [3 /*break*/, 1];
                case 6: return [3 /*break*/, 13];
                case 7:
                    e_5_1 = _b.sent();
                    e_5 = { error: e_5_1 };
                    return [3 /*break*/, 13];
                case 8:
                    _b.trys.push([8, , 11, 12]);
                    if (!(it_5_1 && !it_5_1.done && (_a = it_5["return"]))) return [3 /*break*/, 10];
                    return [4 /*yield*/, __await(_a.call(it_5))];
                case 9:
                    _b.sent();
                    _b.label = 10;
                case 10: return [3 /*break*/, 12];
                case 11:
                    if (e_5) throw e_5.error;
                    return [7 /*endfinally*/];
                case 12: return [7 /*endfinally*/];
                case 13: return [2 /*return*/];
            }
        });
    });
}
exports.fill = fill;
/**
 * Filters an iterable, returning items which match `f`.
 *
 * ```js
 * filter([1, 2, 3, 4], e => e % 2 == 0);
 * returns [2, 4]
 * ```
 * @param it
 * @param f
 */
//eslint-disable-next-line func-style
function filter(it, f) {
    return __asyncGenerator(this, arguments, function filter_1() {
        var it_6, it_6_1, v, e_6_1;
        var e_6, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 7, 8, 13]);
                    it_6 = __asyncValues(it);
                    _b.label = 1;
                case 1: return [4 /*yield*/, __await(it_6.next())];
                case 2:
                    if (!(it_6_1 = _b.sent(), !it_6_1.done)) return [3 /*break*/, 6];
                    v = it_6_1.value;
                    if (!f(v))
                        return [3 /*break*/, 5];
                    return [4 /*yield*/, __await(v)];
                case 3: return [4 /*yield*/, _b.sent()];
                case 4:
                    _b.sent();
                    _b.label = 5;
                case 5: return [3 /*break*/, 1];
                case 6: return [3 /*break*/, 13];
                case 7:
                    e_6_1 = _b.sent();
                    e_6 = { error: e_6_1 };
                    return [3 /*break*/, 13];
                case 8:
                    _b.trys.push([8, , 11, 12]);
                    if (!(it_6_1 && !it_6_1.done && (_a = it_6["return"]))) return [3 /*break*/, 10];
                    return [4 /*yield*/, __await(_a.call(it_6))];
                case 9:
                    _b.sent();
                    _b.label = 10;
                case 10: return [3 /*break*/, 12];
                case 11:
                    if (e_6) throw e_6.error;
                    return [7 /*endfinally*/];
                case 12: return [7 /*endfinally*/];
                case 13: return [2 /*return*/];
            }
        });
    });
}
exports.filter = filter;
/**
 * Returns first item from iterable `it` that matches predicate `f`
 * ```js
 * find([1, 2, 3, 4], e => e > 2);
 * // Yields: 3
 * ```
 * @param it
 * @param f
 * @returns
 */
//eslint-disable-next-line func-style
function find(it, f) {
    var it_7, it_7_1;
    var e_7, _a;
    return __awaiter(this, void 0, void 0, function () {
        var v, e_7_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 5, 6, 11]);
                    it_7 = __asyncValues(it);
                    _b.label = 1;
                case 1: return [4 /*yield*/, it_7.next()];
                case 2:
                    if (!(it_7_1 = _b.sent(), !it_7_1.done)) return [3 /*break*/, 4];
                    v = it_7_1.value;
                    if (f(v))
                        return [2 /*return*/, v];
                    _b.label = 3;
                case 3: return [3 /*break*/, 1];
                case 4: return [3 /*break*/, 11];
                case 5:
                    e_7_1 = _b.sent();
                    e_7 = { error: e_7_1 };
                    return [3 /*break*/, 11];
                case 6:
                    _b.trys.push([6, , 9, 10]);
                    if (!(it_7_1 && !it_7_1.done && (_a = it_7["return"]))) return [3 /*break*/, 8];
                    return [4 /*yield*/, _a.call(it_7)];
                case 7:
                    _b.sent();
                    _b.label = 8;
                case 8: return [3 /*break*/, 10];
                case 9:
                    if (e_7) throw e_7.error;
                    return [7 /*endfinally*/];
                case 10: return [7 /*endfinally*/];
                case 11: return [2 /*return*/];
            }
        });
    });
}
exports.find = find;
/**
 * Returns a 'flattened' copy of array, un-nesting arrays one level
 * ```js
 * flatten([1, [2, 3], [[4]]]);
 * // Yields: [1, 2, 3, [4]];
 * ```
 * @param it
 */
//eslint-disable-next-line func-style
function flatten(it) {
    return __asyncGenerator(this, arguments, function flatten_1() {
        var it_8, it_8_1, v, e_8_1;
        var e_8, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 10, 11, 16]);
                    it_8 = __asyncValues(it);
                    _b.label = 1;
                case 1: return [4 /*yield*/, __await(it_8.next())];
                case 2:
                    if (!(it_8_1 = _b.sent(), !it_8_1.done)) return [3 /*break*/, 9];
                    v = it_8_1.value;
                    if (!(Symbol.asyncIterator in v)) return [3 /*break*/, 5];
                    // @ts-ignore
                    return [5 /*yield**/, __values(__asyncDelegator(__asyncValues(v)))];
                case 3: 
                // @ts-ignore
                return [4 /*yield*/, __await.apply(void 0, [_b.sent()])];
                case 4:
                    // @ts-ignore
                    _b.sent();
                    return [3 /*break*/, 8];
                case 5: return [4 /*yield*/, __await(v)];
                case 6: return [4 /*yield*/, _b.sent()];
                case 7:
                    _b.sent();
                    _b.label = 8;
                case 8: return [3 /*break*/, 1];
                case 9: return [3 /*break*/, 16];
                case 10:
                    e_8_1 = _b.sent();
                    e_8 = { error: e_8_1 };
                    return [3 /*break*/, 16];
                case 11:
                    _b.trys.push([11, , 14, 15]);
                    if (!(it_8_1 && !it_8_1.done && (_a = it_8["return"]))) return [3 /*break*/, 13];
                    return [4 /*yield*/, __await(_a.call(it_8))];
                case 12:
                    _b.sent();
                    _b.label = 13;
                case 13: return [3 /*break*/, 15];
                case 14:
                    if (e_8) throw e_8.error;
                    return [7 /*endfinally*/];
                case 15: return [7 /*endfinally*/];
                case 16: return [2 /*return*/];
            }
        });
    });
}
exports.flatten = flatten;
/**
 * Execute function `f` for each item in iterable
 * @param it
 * @param f
 */
//eslint-disable-next-line func-style
function forEach(it, f) {
    var it_9, it_9_1;
    var e_9, _a;
    return __awaiter(this, void 0, void 0, function () {
        var v, e_9_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 5, 6, 11]);
                    it_9 = __asyncValues(it);
                    _b.label = 1;
                case 1: return [4 /*yield*/, it_9.next()];
                case 2:
                    if (!(it_9_1 = _b.sent(), !it_9_1.done)) return [3 /*break*/, 4];
                    v = it_9_1.value;
                    f(v);
                    _b.label = 3;
                case 3: return [3 /*break*/, 1];
                case 4: return [3 /*break*/, 11];
                case 5:
                    e_9_1 = _b.sent();
                    e_9 = { error: e_9_1 };
                    return [3 /*break*/, 11];
                case 6:
                    _b.trys.push([6, , 9, 10]);
                    if (!(it_9_1 && !it_9_1.done && (_a = it_9["return"]))) return [3 /*break*/, 8];
                    return [4 /*yield*/, _a.call(it_9)];
                case 7:
                    _b.sent();
                    _b.label = 8;
                case 8: return [3 /*break*/, 10];
                case 9:
                    if (e_9) throw e_9.error;
                    return [7 /*endfinally*/];
                case 10: return [7 /*endfinally*/];
                case 11: return [2 /*return*/];
            }
        });
    });
}
exports.forEach = forEach;
/**
 * Maps an iterable of type `V` to type `X`.
 * ```js
 * map([1, 2, 3], e => e*e)
 * returns [1, 4, 9]
 * ```
 * @param it
 * @param f
 */
//eslint-disable-next-line func-style
function map(it, f) {
    return __asyncGenerator(this, arguments, function map_1() {
        var it_10, it_10_1, v, e_10_1;
        var e_10, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 7, 8, 13]);
                    it_10 = __asyncValues(it);
                    _b.label = 1;
                case 1: return [4 /*yield*/, __await(it_10.next())];
                case 2:
                    if (!(it_10_1 = _b.sent(), !it_10_1.done)) return [3 /*break*/, 6];
                    v = it_10_1.value;
                    return [4 /*yield*/, __await(f(v))];
                case 3: return [4 /*yield*/, _b.sent()];
                case 4:
                    _b.sent();
                    _b.label = 5;
                case 5: return [3 /*break*/, 1];
                case 6: return [3 /*break*/, 13];
                case 7:
                    e_10_1 = _b.sent();
                    e_10 = { error: e_10_1 };
                    return [3 /*break*/, 13];
                case 8:
                    _b.trys.push([8, , 11, 12]);
                    if (!(it_10_1 && !it_10_1.done && (_a = it_10["return"]))) return [3 /*break*/, 10];
                    return [4 /*yield*/, __await(_a.call(it_10))];
                case 9:
                    _b.sent();
                    _b.label = 10;
                case 10: return [3 /*break*/, 12];
                case 11:
                    if (e_10) throw e_10.error;
                    return [7 /*endfinally*/];
                case 12: return [7 /*endfinally*/];
                case 13: return [2 /*return*/];
            }
        });
    });
}
exports.map = map;
/**
 * Returns the maximum seen of an iterable
 * ```js
 * min([
 *  {i:0,v:1},
 *  {i:1,v:9},
 *  {i:2,v:-2}
 * ], (a, b) => a.v > b.v);
 * // Yields: {i:1, v:-9}
 * ```
 * @param it Iterable
 * @param gt Should return _true_ if `a` is greater than `b`.
 * @returns
 */
//eslint-disable-next-line func-style
function max(it, gt) {
    var it_11, it_11_1;
    var e_11, _a;
    if (gt === void 0) { gt = function (a, b) { return a > b; }; }
    return __awaiter(this, void 0, void 0, function () {
        var max, v, e_11_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 5, 6, 11]);
                    it_11 = __asyncValues(it);
                    _b.label = 1;
                case 1: return [4 /*yield*/, it_11.next()];
                case 2:
                    if (!(it_11_1 = _b.sent(), !it_11_1.done)) return [3 /*break*/, 4];
                    v = it_11_1.value;
                    if (!max) {
                        max = v;
                        return [3 /*break*/, 3];
                    }
                    max = gt(max, v) ? max : v;
                    _b.label = 3;
                case 3: return [3 /*break*/, 1];
                case 4: return [3 /*break*/, 11];
                case 5:
                    e_11_1 = _b.sent();
                    e_11 = { error: e_11_1 };
                    return [3 /*break*/, 11];
                case 6:
                    _b.trys.push([6, , 9, 10]);
                    if (!(it_11_1 && !it_11_1.done && (_a = it_11["return"]))) return [3 /*break*/, 8];
                    return [4 /*yield*/, _a.call(it_11)];
                case 7:
                    _b.sent();
                    _b.label = 8;
                case 8: return [3 /*break*/, 10];
                case 9:
                    if (e_11) throw e_11.error;
                    return [7 /*endfinally*/];
                case 10: return [7 /*endfinally*/];
                case 11: return [2 /*return*/, max];
            }
        });
    });
}
exports.max = max;
/**
 * Returns the minimum seen of an iterable
 * ```js
 * min([
 *  {i:0,v:1},
 *  {i:1,v:9},
 *  {i:2,v:-2}
 * ], (a, b) => a.v > b.v);
 * // Yields: {i:2, v:-2}
 * ```
 * @param it Iterable
 * @param gt Should return _true_ if `a` is greater than `b`.
 * @returns
 */
//eslint-disable-next-line func-style
function min(it, gt) {
    var it_12, it_12_1;
    var e_12, _a;
    if (gt === void 0) { gt = function (a, b) { return a > b; }; }
    return __awaiter(this, void 0, void 0, function () {
        var min, v, e_12_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 5, 6, 11]);
                    it_12 = __asyncValues(it);
                    _b.label = 1;
                case 1: return [4 /*yield*/, it_12.next()];
                case 2:
                    if (!(it_12_1 = _b.sent(), !it_12_1.done)) return [3 /*break*/, 4];
                    v = it_12_1.value;
                    if (!min) {
                        min = v;
                        return [3 /*break*/, 3];
                    }
                    min = gt(min, v) ? v : min;
                    _b.label = 3;
                case 3: return [3 /*break*/, 1];
                case 4: return [3 /*break*/, 11];
                case 5:
                    e_12_1 = _b.sent();
                    e_12 = { error: e_12_1 };
                    return [3 /*break*/, 11];
                case 6:
                    _b.trys.push([6, , 9, 10]);
                    if (!(it_12_1 && !it_12_1.done && (_a = it_12["return"]))) return [3 /*break*/, 8];
                    return [4 /*yield*/, _a.call(it_12)];
                case 7:
                    _b.sent();
                    _b.label = 8;
                case 8: return [3 /*break*/, 10];
                case 9:
                    if (e_12) throw e_12.error;
                    return [7 /*endfinally*/];
                case 10: return [7 /*endfinally*/];
                case 11: return [2 /*return*/, min];
            }
        });
    });
}
exports.min = min;
/**
 * Returns count from `start` for a given length
 * ```js
 * range(-5, 10);
 * // Yields: [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4]
 * ```
 * @param start
 * @param len
 */
//eslint-disable-next-line func-style
function range(start, len) {
    return __asyncGenerator(this, arguments, function range_1() {
        var i;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    i = 0;
                    _a.label = 1;
                case 1:
                    if (!(i < len)) return [3 /*break*/, 5];
                    return [4 /*yield*/, __await(start++)];
                case 2: return [4 /*yield*/, _a.sent()];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4:
                    i++;
                    return [3 /*break*/, 1];
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.range = range;
/**
 * Reduce for iterables
 * ```js
 * reduce([1, 2, 3], (acc, cur) => acc + cur, 0);
 * // Yields: 6
 * ```
 * @param it Iterable
 * @param f Function
 * @param start Start value
 * @returns
 */
//eslint-disable-next-line func-style
function reduce(it, f, start) {
    var it_13, it_13_1;
    var e_13, _a;
    return __awaiter(this, void 0, void 0, function () {
        var v, e_13_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 5, 6, 11]);
                    it_13 = __asyncValues(it);
                    _b.label = 1;
                case 1: return [4 /*yield*/, it_13.next()];
                case 2:
                    if (!(it_13_1 = _b.sent(), !it_13_1.done)) return [3 /*break*/, 4];
                    v = it_13_1.value;
                    start = f(start, v);
                    _b.label = 3;
                case 3: return [3 /*break*/, 1];
                case 4: return [3 /*break*/, 11];
                case 5:
                    e_13_1 = _b.sent();
                    e_13 = { error: e_13_1 };
                    return [3 /*break*/, 11];
                case 6:
                    _b.trys.push([6, , 9, 10]);
                    if (!(it_13_1 && !it_13_1.done && (_a = it_13["return"]))) return [3 /*break*/, 8];
                    return [4 /*yield*/, _a.call(it_13)];
                case 7:
                    _b.sent();
                    _b.label = 8;
                case 8: return [3 /*break*/, 10];
                case 9:
                    if (e_13) throw e_13.error;
                    return [7 /*endfinally*/];
                case 10: return [7 /*endfinally*/];
                case 11: return [2 /*return*/, start];
            }
        });
    });
}
exports.reduce = reduce;
/**
 * Returns a section from an iterable
 * @param it Iterable
 * @param start Start index
 * @param end End index (or until completion)
 */
//eslint-disable-next-line func-style
function slice(it, start, end) {
    if (start === void 0) { start = 0; }
    if (end === void 0) { end = Number.POSITIVE_INFINITY; }
    return __asyncGenerator(this, arguments, function slice_1() {
        var iit, it_14, it_14_1, v, e_14_1;
        var e_14, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    iit = it[Symbol.asyncIterator]();
                    _b.label = 1;
                case 1:
                    if (!(start > 0)) return [3 /*break*/, 4];
                    return [4 /*yield*/, __await(iit.next())];
                case 2:
                    _b.sent();
                    _b.label = 3;
                case 3:
                    start--, end--;
                    return [3 /*break*/, 1];
                case 4:
                    _b.trys.push([4, 12, 13, 18]);
                    it_14 = __asyncValues(it);
                    _b.label = 5;
                case 5: return [4 /*yield*/, __await(it_14.next())];
                case 6:
                    if (!(it_14_1 = _b.sent(), !it_14_1.done)) return [3 /*break*/, 11];
                    v = it_14_1.value;
                    if (!(end-- > 0)) return [3 /*break*/, 9];
                    return [4 /*yield*/, __await(v)];
                case 7: return [4 /*yield*/, _b.sent()];
                case 8:
                    _b.sent();
                    return [3 /*break*/, 10];
                case 9: return [3 /*break*/, 11];
                case 10: return [3 /*break*/, 5];
                case 11: return [3 /*break*/, 18];
                case 12:
                    e_14_1 = _b.sent();
                    e_14 = { error: e_14_1 };
                    return [3 /*break*/, 18];
                case 13:
                    _b.trys.push([13, , 16, 17]);
                    if (!(it_14_1 && !it_14_1.done && (_a = it_14["return"]))) return [3 /*break*/, 15];
                    return [4 /*yield*/, __await(_a.call(it_14))];
                case 14:
                    _b.sent();
                    _b.label = 15;
                case 15: return [3 /*break*/, 17];
                case 16:
                    if (e_14) throw e_14.error;
                    return [7 /*endfinally*/];
                case 17: return [7 /*endfinally*/];
                case 18: return [2 /*return*/];
            }
        });
    });
}
exports.slice = slice;
/**
 * Returns true the first time `f` returns true. Useful for spotting any occurrence of
 * data, and exiting quickly
 * ```js
 * some([1, 2, 3, 4], e => e % 3 === 0);
 * // Yields: true
 * ```
 * @param it Iterable
 * @param f Filter function
 * @returns
 */
//eslint-disable-next-line func-style
function some(it, f) {
    var it_15, it_15_1;
    var e_15, _a;
    return __awaiter(this, void 0, void 0, function () {
        var v, e_15_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 5, 6, 11]);
                    it_15 = __asyncValues(it);
                    _b.label = 1;
                case 1: return [4 /*yield*/, it_15.next()];
                case 2:
                    if (!(it_15_1 = _b.sent(), !it_15_1.done)) return [3 /*break*/, 4];
                    v = it_15_1.value;
                    if (f(v))
                        return [2 /*return*/, true];
                    _b.label = 3;
                case 3: return [3 /*break*/, 1];
                case 4: return [3 /*break*/, 11];
                case 5:
                    e_15_1 = _b.sent();
                    e_15 = { error: e_15_1 };
                    return [3 /*break*/, 11];
                case 6:
                    _b.trys.push([6, , 9, 10]);
                    if (!(it_15_1 && !it_15_1.done && (_a = it_15["return"]))) return [3 /*break*/, 8];
                    return [4 /*yield*/, _a.call(it_15)];
                case 7:
                    _b.sent();
                    _b.label = 8;
                case 8: return [3 /*break*/, 10];
                case 9:
                    if (e_15) throw e_15.error;
                    return [7 /*endfinally*/];
                case 10: return [7 /*endfinally*/];
                case 11: return [2 /*return*/, false];
            }
        });
    });
}
exports.some = some;
/**
 * Returns items for which the filter function returns _true_
 * ```js
 * takeWhile([ 1, 2, 3, 4 ], e => e < 3);
 * // Yields: [ 1, 2 ]
 * ```
 * @param it Iterable
 * @param f Filter function
 * @returns
 */
//eslint-disable-next-line func-style
function takeWhile(it, f) {
    return __asyncGenerator(this, arguments, function takeWhile_1() {
        var it_16, it_16_1, v, e_16_1;
        var e_16, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 9, 10, 15]);
                    it_16 = __asyncValues(it);
                    _b.label = 1;
                case 1: return [4 /*yield*/, __await(it_16.next())];
                case 2:
                    if (!(it_16_1 = _b.sent(), !it_16_1.done)) return [3 /*break*/, 8];
                    v = it_16_1.value;
                    if (!!f(v)) return [3 /*break*/, 4];
                    return [4 /*yield*/, __await(void 0)];
                case 3: return [2 /*return*/, _b.sent()];
                case 4: return [4 /*yield*/, __await(v)];
                case 5: return [4 /*yield*/, _b.sent()];
                case 6:
                    _b.sent();
                    _b.label = 7;
                case 7: return [3 /*break*/, 1];
                case 8: return [3 /*break*/, 15];
                case 9:
                    e_16_1 = _b.sent();
                    e_16 = { error: e_16_1 };
                    return [3 /*break*/, 15];
                case 10:
                    _b.trys.push([10, , 13, 14]);
                    if (!(it_16_1 && !it_16_1.done && (_a = it_16["return"]))) return [3 /*break*/, 12];
                    return [4 /*yield*/, __await(_a.call(it_16))];
                case 11:
                    _b.sent();
                    _b.label = 12;
                case 12: return [3 /*break*/, 14];
                case 13:
                    if (e_16) throw e_16.error;
                    return [7 /*endfinally*/];
                case 14: return [7 /*endfinally*/];
                case 15: return [2 /*return*/];
            }
        });
    });
}
exports.takeWhile = takeWhile;
/**
 * Returns an array of values from an iterator.
 *
 * ```js
 * const data = await toArray(adsrSample(opts, 10));
 * ```
 *
 * Note: If the iterator is infinite, be sure to provide a `count` or the function
 * will never return.
 *
 * @param it Asynchronous iterable
 * @param count Number of items to return, by default all.
 * @returns
 */
//eslint-disable-next-line func-style
function toArray(it, count) {
    if (count === void 0) { count = Infinity; }
    return __awaiter(this, void 0, void 0, function () {
        var result, iterator, _a, value, done;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    result = [];
                    iterator = it[Symbol.asyncIterator]();
                    _b.label = 1;
                case 1:
                    if (!(result.length < count)) return [3 /*break*/, 3];
                    return [4 /*yield*/, iterator.next()];
                case 2:
                    _a = _b.sent(), value = _a.value, done = _a.done;
                    if (done)
                        return [3 /*break*/, 3];
                    //eslint-disable-next-line functional/immutable-data
                    result.push(value);
                    return [3 /*break*/, 1];
                case 3: return [2 /*return*/, result];
            }
        });
    });
}
exports.toArray = toArray;
/**
 * Returns unique items from iterables, given a particular key function
 * ```js
 * unique([{i:0,v:2},{i:1,v:3},{i:2,v:2}], e => e.v);
 * Yields:  [{i:0,v:2},{i:1,v:3}]
 * @param it
 * @param f
 */
//eslint-disable-next-line func-style
function unique(it, f) {
    if (f === void 0) { f = function (id) { return id; }; }
    return __asyncGenerator(this, arguments, function unique_1() {
        var buffer, it_17, it_17_1, v, fv, e_17_1;
        var e_17, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    buffer = [];
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 8, 9, 14]);
                    it_17 = __asyncValues(it);
                    _b.label = 2;
                case 2: return [4 /*yield*/, __await(it_17.next())];
                case 3:
                    if (!(it_17_1 = _b.sent(), !it_17_1.done)) return [3 /*break*/, 7];
                    v = it_17_1.value;
                    fv = f(v);
                    if (buffer.indexOf(fv) !== -1)
                        return [3 /*break*/, 6];
                    //eslint-disable-next-line functional/immutable-data
                    buffer.push(fv);
                    return [4 /*yield*/, __await(v)];
                case 4: return [4 /*yield*/, _b.sent()];
                case 5:
                    _b.sent();
                    _b.label = 6;
                case 6: return [3 /*break*/, 2];
                case 7: return [3 /*break*/, 14];
                case 8:
                    e_17_1 = _b.sent();
                    e_17 = { error: e_17_1 };
                    return [3 /*break*/, 14];
                case 9:
                    _b.trys.push([9, , 12, 13]);
                    if (!(it_17_1 && !it_17_1.done && (_a = it_17["return"]))) return [3 /*break*/, 11];
                    return [4 /*yield*/, __await(_a.call(it_17))];
                case 10:
                    _b.sent();
                    _b.label = 11;
                case 11: return [3 /*break*/, 13];
                case 12:
                    if (e_17) throw e_17.error;
                    return [7 /*endfinally*/];
                case 13: return [7 /*endfinally*/];
                case 14: return [2 /*return*/];
            }
        });
    });
}
exports.unique = unique;
/**
 * Combine same-positioned items from several iterables
 * ```js
 * zip( [1, 2, 3], [4, 5, 6], [7, 8, 9] );
 * Yields: [ [1, 4, 7], [2, 5, 8], [3, 6, 9] ]
 * ```
 * @param its
 * @returns
 */
//eslint-disable-next-line func-style
function zip() {
    var its = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        its[_i] = arguments[_i];
    }
    return __asyncGenerator(this, arguments, function zip_1() {
        var iits, vs;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    iits = its.map(function (it) { return it[Symbol.asyncIterator](); });
                    _a.label = 1;
                case 1:
                    if (!true) return [3 /*break*/, 7];
                    return [4 /*yield*/, __await(Promise.all(iits.map(function (it) { return it.next(); })))];
                case 2:
                    vs = _a.sent();
                    if (!vs.some(function (v) { return v.done; })) return [3 /*break*/, 4];
                    return [4 /*yield*/, __await(void 0)];
                case 3: return [2 /*return*/, _a.sent()];
                case 4: return [4 /*yield*/, __await(vs.map(function (v) { return v.value; }))];
                case 5: return [4 /*yield*/, _a.sent()];
                case 6:
                    _a.sent();
                    return [3 /*break*/, 1];
                case 7: return [2 /*return*/];
            }
        });
    });
}
exports.zip = zip;
//# sourceMappingURL=IterableAsync.js.map