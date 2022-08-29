"use strict";
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
exports.__esModule = true;
exports.filter = void 0;
var Filters = __importStar(require("./Filters.js"));
var Producers = __importStar(require("./Generators.js"));
/**
 * Returns a function that returns true if values match filter(s)
 *
 * @template V
 * @param {MatchFunction<V>[]} filters
 * @param {{allValuesMustMatch?: boolean, allFiltersMustMatch?: boolean, mismatchThrow?: boolean}} [opts={}]
 * @returns {ManyValueMatch<V>}
 */
var matches = function (filters, opts) {
    var _a, _b, _c, _d;
    if (opts === void 0) { opts = {}; }
    var allValues = (_a = opts.allValuesMustMatch) !== null && _a !== void 0 ? _a : false;
    var allFilters = (_b = opts.allFiltersMustMatch) !== null && _b !== void 0 ? _b : false;
    var mismatchThrow = (_c = opts.mismatchThrow) !== null && _c !== void 0 ? _c : false;
    var debug = (_d = opts.debug) !== null && _d !== void 0 ? _d : false;
    if (debug)
        console.log("matches. allFilters: ".concat(allFilters, " allValues: ").concat(allValues));
    return function (vArray) {
        var someMatch = false;
        for (var _i = 0, vArray_1 = vArray; _i < vArray_1.length; _i++) {
            var v = vArray_1[_i];
            if (debug)
                console.log(" v: ".concat(v));
            var valueBasedFind = false;
            var filterCount = 0;
            for (var _a = 0, filters_1 = filters; _a < filters_1.length; _a++) {
                var f = filters_1[_a];
                filterCount++;
                var filterBasedFind = f(v);
                if (debug)
                    console.log("  filter #".concat(filterCount, " result = ").concat(filterBasedFind));
                if (!filterBasedFind && (allValues && allFilters)) {
                    if (mismatchThrow)
                        throw Error("Filter #".concat(filterCount, " failed for value: ").concat(v));
                    return false;
                }
                if (filterBasedFind && !allFilters) {
                    // No need to apply all filters
                    valueBasedFind = true;
                    break;
                }
                if (filterBasedFind)
                    valueBasedFind = true;
            }
            if (debug)
                console.log("  result after all filters = ".concat(valueBasedFind));
            // Some filter matched, and we don't need to match all values = true
            if (valueBasedFind && !allValues)
                return true;
            // No filter matched this value, and we need all values to match = false
            if (!valueBasedFind && allValues) {
                if (mismatchThrow)
                    throw Error("Some filter(s) failed for value: ".concat(v));
                return false;
            }
            // No filters matched, but we need all filters or all values = false
            if (!valueBasedFind && (allFilters && allValues)) {
                if (mismatchThrow)
                    throw Error("All filter(s) failed for value: ".concat(v));
                return false;
            }
            if (valueBasedFind)
                someMatch = true;
        }
        return someMatch;
    };
};
/**
 * Returns a function that filters a set of items by a set of filters
 *
 * @template V
 * @param {Iterable<MatchFunction<V>>} filters If filter returns true, item is included
 * @param {{allFiltersMustMatch?: boolean}} [opts={}]
 * @returns
 */
var filter = function (filters, opts) {
    var _a;
    if (opts === void 0) { opts = {}; }
    var allFilters = (_a = opts.allFiltersMustMatch) !== null && _a !== void 0 ? _a : false;
    var r = function (vArray) {
        var _i, vArray_2, v, matched, _a, filters_2, f, matchedFilter;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _i = 0, vArray_2 = vArray;
                    _b.label = 1;
                case 1:
                    if (!(_i < vArray_2.length)) return [3 /*break*/, 4];
                    v = vArray_2[_i];
                    matched = false;
                    for (_a = 0, filters_2 = filters; _a < filters_2.length; _a++) {
                        f = filters_2[_a];
                        matchedFilter = f(v);
                        if (matchedFilter && !allFilters) {
                            // Don't need all filters to match
                            matched = true;
                            break;
                        }
                        else if (!matchedFilter && allFilters) {
                            // Do need all filters, and we missed a match, so that's a fail
                            matched = false;
                            break;
                        }
                        else if (matchedFilter) {
                            matched = true;
                        }
                    }
                    if (!matched) return [3 /*break*/, 3];
                    return [4 /*yield*/, v];
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
    return r;
};
exports.filter = filter;
/**
 * Tests that all-value-match and all-filter-match works
 *
 */
var testAllMatches = function () {
    var dataSet = Producers.numericRange(0.05, 0, 1);
    var opts = { allValuesMustMatch: true, allFiltersMustMatch: true, mismatchThrow: false };
    console.log("testAllMatches. dataSet: ".concat(dataSet));
    var shouldNotMatch = matches([Filters.threshold(0.5), Filters.rangeInclusive(0.7, 1)], opts);
    if (shouldNotMatch(dataSet))
        throw Error("Unexpected match (1)");
    shouldNotMatch = matches([Filters.rangeInclusive(0.21, 0.41)], opts);
    if (shouldNotMatch(dataSet))
        throw Error("Unexpected match (2)");
    opts.mismatchThrow = true;
    var shouldMatch = matches([Filters.rangeInclusive(0, 1)], opts);
    if (!shouldMatch(dataSet))
        throw Error("Unexpected mismatch");
    console.log("testAllMatches OK");
};
/**
 * Tests that all-value-match and some-filter-match works
 *
 */
var testSomeFilterMatches = function () {
    var dataSet = Producers.numericRange(0.05, 0, 1);
    var opts = { debug: false, allValuesMustMatch: true, allFiltersMustMatch: false, mismatchThrow: false };
    console.log("testSomeFilterMatches. dataSet: ".concat(dataSet));
    var shouldNotMatch = matches([Filters.threshold(0.5), Filters.rangeInclusive(0.7, 1)], opts);
    if (shouldNotMatch(dataSet))
        throw Error("Unexpected match (1)");
    shouldNotMatch = matches([Filters.rangeInclusive(0.21, 0.41)], opts);
    if (shouldNotMatch(dataSet))
        throw Error("Unexpected match (2)");
    opts.mismatchThrow = true;
    var shouldMatch = matches([Filters.rangeInclusive(0, 1)], opts);
    if (!shouldMatch(dataSet))
        throw Error("Unexpected mismatch");
    console.log("testSomeFilterMatches OK");
};
/**
 * Tests that some-value-match and all-filter-match works
 *
 */
var testSomeValueMatches = function () {
    var dataSet = Producers.numericRange(0.05, 0, 1);
    var opts = { allValuesMustMatch: false, allFiltersMustMatch: true, mismatchThrow: false, debug: false };
    console.log("testSomeValueMatches. dataSet: ".concat(dataSet));
    var shouldMatch = matches([Filters.threshold(0.5), Filters.rangeInclusive(0.7, 1)], opts);
    if (!shouldMatch(dataSet))
        throw Error("Unexpected mismatch (1)");
    shouldMatch = matches([Filters.rangeInclusive(0.21, 0.41)], opts);
    if (!shouldMatch(dataSet))
        throw Error("Unexpected mismatch (2)");
    var shouldNotMatch = matches([Filters.rangeInclusive(2, 3)], opts);
    if (shouldNotMatch(dataSet))
        throw Error("Unexpected match");
    console.log("testSomeValueMatches OK");
};
var testFind = function () {
    var dataSet = Producers.numericRange(0.05, 0, 1);
    var f = (0, exports.filter)([Filters.rangeInclusive(0, 0.1), Filters.rangeInclusive(0.9, 1)], { allFiltersMustMatch: true });
    var fArray = Array.from(f(dataSet));
    if (fArray.length !== 0)
        throw Error("Expected 0 matched items, got ".concat(fArray.length));
    f = (0, exports.filter)([Filters.rangeInclusive(0, 0.1), Filters.rangeInclusive(0.9, 1)], { allFiltersMustMatch: false });
    fArray = Array.from(f(dataSet));
    if (fArray.length !== 6)
        throw Error("Expected 6 matched items, got ".concat(fArray.length));
    console.log("testFind OK");
};
testAllMatches();
testSomeFilterMatches();
testSomeValueMatches();
testFind();
//# sourceMappingURL=Match.js.map