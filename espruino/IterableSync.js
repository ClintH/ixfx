"use strict";
/**
 * Return `it` broken up into chunks of `size`
 *
 * ```js
 * chunks([1,2,3,4,5,6,7,8,9,10], 3);
 * // Yields: [[1, 2, 3], [4, 5, 6], [7, 8, 9], [10]]
 * ```
 * @param it
 * @param size
 * @returns
 */
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
exports.zip = exports.unique = exports.takeWhile = exports.some = exports.slice = exports.reduce = exports.range = exports.min = exports.max = exports.map = exports.flatten = exports.find = exports.filter = exports.forEach = exports.fill = exports.every = exports.equals = exports.dropWhile = exports.concat = exports.chunks = void 0;
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
    var buffer, _i, it_1, v;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                buffer = [];
                _i = 0, it_1 = it;
                _a.label = 1;
            case 1:
                if (!(_i < it_1.length)) return [3 /*break*/, 4];
                v = it_1[_i];
                //eslint-disable-next-line functional/immutable-data
                buffer.push(v);
                if (!(buffer.length === size)) return [3 /*break*/, 3];
                return [4 /*yield*/, buffer];
            case 2:
                _a.sent();
                buffer = [];
                _a.label = 3;
            case 3:
                _i++;
                return [3 /*break*/, 1];
            case 4:
                if (!(buffer.length > 0)) return [3 /*break*/, 6];
                return [4 /*yield*/, buffer];
            case 5:
                _a.sent();
                _a.label = 6;
            case 6: return [2 /*return*/];
        }
    });
}
exports.chunks = chunks;
/**
 * Return concatenation of iterators
 * @param its
 */
//eslint-disable-next-line func-style
function concat() {
    var _i, _a, its_1, it_2;
    var its = [];
    for (_i = 0; _i < arguments.length; _i++) {
        its[_i] = arguments[_i];
    }
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = 0, its_1 = its;
                _b.label = 1;
            case 1:
                if (!(_a < its_1.length)) return [3 /*break*/, 4];
                it_2 = its_1[_a];
                return [5 /*yield**/, __values(it_2)];
            case 2:
                _b.sent();
                _b.label = 3;
            case 3:
                _a++;
                return [3 /*break*/, 1];
            case 4: return [2 /*return*/];
        }
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
    var _i, it_3, v;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _i = 0, it_3 = it;
                _a.label = 1;
            case 1:
                if (!(_i < it_3.length)) return [3 /*break*/, 4];
                v = it_3[_i];
                if (!!f(v)) return [3 /*break*/, 3];
                return [4 /*yield*/, v];
            case 2:
                _a.sent();
                return [3 /*break*/, 4];
            case 3:
                _i++;
                return [3 /*break*/, 1];
            case 4: return [5 /*yield**/, __values(it)];
            case 5:
                _a.sent();
                return [2 /*return*/];
        }
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
    //it1 = it1[Symbol.iterator]();
    //it2 = it2[Symbol.iterator]();
    // eslint-disable-next-line no-constant-condition
    while (true) {
        var i1 = it1.next(), i2 = it2.next();
        if (equality !== undefined) {
            if (!equality(i1.value, i2.value))
                return false;
        }
        else if (i1.value !== i2.value)
            return false;
        if (i1.done || i2.done)
            return i1.done && i2.done;
    }
}
exports.equals = equals;
/**
 * Returns true if `f` returns true for
 * every item in iterable
 * @param it
 * @param f
 * @returns
 */
//eslint-disable-next-line func-style
function every(it, f) {
    // https://surma.github.io/underdash/
    //eslint-disable-next-line functional/no-let
    var ok = true;
    for (var _i = 0, it_4 = it; _i < it_4.length; _i++) {
        var v = it_4[_i];
        ok = ok && f(v);
    }
    return ok;
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
    var _i, it_5, _;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _i = 0, it_5 = it;
                _a.label = 1;
            case 1:
                if (!(_i < it_5.length)) return [3 /*break*/, 4];
                _ = it_5[_i];
                return [4 /*yield*/, v];
            case 2:
                _a.sent();
                _a.label = 3;
            case 3:
                _i++;
                return [3 /*break*/, 1];
            case 4: return [2 /*return*/];
        }
    });
}
exports.fill = fill;
/**
 * Execute function `f` for each item in iterable
 * @param it
 * @param f
 */
//eslint-disable-next-line func-style
function forEach(it, f) {
    // https://surma.github.io/underdash/
    for (var _i = 0, it_6 = it; _i < it_6.length; _i++) {
        var v = it_6[_i];
        f(v);
    }
}
exports.forEach = forEach;
/**
 * ```js
 * filter([1, 2, 3, 4], e => e % 2 == 0);
 * returns [2, 4]
 * ```
 * @param it
 * @param f
 */
//eslint-disable-next-line func-style
function filter(it, f) {
    var _i, it_7, v;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _i = 0, it_7 = it;
                _a.label = 1;
            case 1:
                if (!(_i < it_7.length)) return [3 /*break*/, 4];
                v = it_7[_i];
                if (!f(v))
                    return [3 /*break*/, 3];
                return [4 /*yield*/, v];
            case 2:
                _a.sent();
                _a.label = 3;
            case 3:
                _i++;
                return [3 /*break*/, 1];
            case 4: return [2 /*return*/];
        }
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
    // https://surma.github.io/underdash/
    for (var _i = 0, it_8 = it; _i < it_8.length; _i++) {
        var v = it_8[_i];
        if (f(v))
            return v;
    }
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
    var _i, it_9, v;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _i = 0, it_9 = it;
                _a.label = 1;
            case 1:
                if (!(_i < it_9.length)) return [3 /*break*/, 6];
                v = it_9[_i];
                if (!(Symbol.iterator in v)) return [3 /*break*/, 3];
                // @ts-ignore
                return [5 /*yield**/, __values(v)];
            case 2:
                // @ts-ignore
                _a.sent();
                return [3 /*break*/, 5];
            case 3: return [4 /*yield*/, v];
            case 4:
                _a.sent();
                _a.label = 5;
            case 5:
                _i++;
                return [3 /*break*/, 1];
            case 6: return [2 /*return*/];
        }
    });
}
exports.flatten = flatten;
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
    var _i, it_10, v;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _i = 0, it_10 = it;
                _a.label = 1;
            case 1:
                if (!(_i < it_10.length)) return [3 /*break*/, 4];
                v = it_10[_i];
                return [4 /*yield*/, f(v)];
            case 2:
                _a.sent();
                _a.label = 3;
            case 3:
                _i++;
                return [3 /*break*/, 1];
            case 4: return [2 /*return*/];
        }
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
    if (gt === void 0) { gt = function (a, b) { return a > b; }; }
    // https://surma.github.io/underdash/
    //eslint-disable-next-line functional/no-let
    var max;
    for (var _i = 0, it_11 = it; _i < it_11.length; _i++) {
        var v = it_11[_i];
        if (!max) {
            max = v;
            continue;
        }
        max = gt(max, v) ? max : v;
    }
    return max;
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
    if (gt === void 0) { gt = function (a, b) { return a > b; }; }
    // https://surma.github.io/underdash/
    //eslint-disable-next-line functional/no-let
    var min;
    for (var _i = 0, it_12 = it; _i < it_12.length; _i++) {
        var v = it_12[_i];
        if (!min) {
            min = v;
            continue;
        }
        min = gt(min, v) ? v : min;
    }
    return min;
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
    var i;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                i = 0;
                _a.label = 1;
            case 1:
                if (!(i < len)) return [3 /*break*/, 4];
                return [4 /*yield*/, start++];
            case 2:
                _a.sent();
                _a.label = 3;
            case 3:
                i++;
                return [3 /*break*/, 1];
            case 4: return [2 /*return*/];
        }
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
    // https://surma.github.io/underdash/
    for (var _i = 0, it_13 = it; _i < it_13.length; _i++) {
        var v = it_13[_i];
        start = f(start, v);
    }
    return start;
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
    var iit, _i, it_14, v;
    if (start === void 0) { start = 0; }
    if (end === void 0) { end = Number.POSITIVE_INFINITY; }
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                iit = it[Symbol.iterator]();
                for (; start > 0; start--, end--)
                    iit.next();
                _i = 0, it_14 = it;
                _a.label = 1;
            case 1:
                if (!(_i < it_14.length)) return [3 /*break*/, 5];
                v = it_14[_i];
                if (!(end-- > 0)) return [3 /*break*/, 3];
                return [4 /*yield*/, v];
            case 2:
                _a.sent();
                return [3 /*break*/, 4];
            case 3: return [3 /*break*/, 5];
            case 4:
                _i++;
                return [3 /*break*/, 1];
            case 5: return [2 /*return*/];
        }
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
    // https://surma.github.io/underdash/
    for (var _i = 0, it_15 = it; _i < it_15.length; _i++) {
        var v = it_15[_i];
        if (f(v))
            return true;
    }
    return false;
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
    var _i, it_16, v;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _i = 0, it_16 = it;
                _a.label = 1;
            case 1:
                if (!(_i < it_16.length)) return [3 /*break*/, 4];
                v = it_16[_i];
                if (!f(v))
                    return [2 /*return*/];
                return [4 /*yield*/, v];
            case 2:
                _a.sent();
                _a.label = 3;
            case 3:
                _i++;
                return [3 /*break*/, 1];
            case 4: return [2 /*return*/];
        }
    });
}
exports.takeWhile = takeWhile;
/**
 * Returns unique items from several iterables
 * ```js
 * unique([{i:0,v:2},{i:1,v:3},{i:2,v:2}], e => e.v);
 * Yields: returns [{i:0,v:2},{i:1,v:3}]
 *
 * @param it
 * @param f
 */
//eslint-disable-next-line func-style
function unique(it, f) {
    var buffer, _i, it_17, v, fv;
    if (f === void 0) { f = function (id) { return id; }; }
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                buffer = [];
                _i = 0, it_17 = it;
                _a.label = 1;
            case 1:
                if (!(_i < it_17.length)) return [3 /*break*/, 4];
                v = it_17[_i];
                fv = f(v);
                if (buffer.indexOf(fv) !== -1)
                    return [3 /*break*/, 3];
                //eslint-disable-next-line functional/immutable-data
                buffer.push(fv);
                return [4 /*yield*/, v];
            case 2:
                _a.sent();
                _a.label = 3;
            case 3:
                _i++;
                return [3 /*break*/, 1];
            case 4: return [2 /*return*/];
        }
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
    var _i, iits, vs;
    var its = [];
    for (_i = 0; _i < arguments.length; _i++) {
        its[_i] = arguments[_i];
    }
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                iits = its.map(function (it) { return it[Symbol.iterator](); });
                _a.label = 1;
            case 1:
                if (!true) return [3 /*break*/, 3];
                vs = iits.map(function (it) { return it.next(); });
                if (vs.some(function (v) { return v.done; }))
                    return [2 /*return*/];
                return [4 /*yield*/, vs.map(function (v) { return v.value; })];
            case 2:
                _a.sent();
                return [3 /*break*/, 1];
            case 3: return [2 /*return*/];
        }
    });
}
exports.zip = zip;
//# sourceMappingURL=IterableSync.js.map