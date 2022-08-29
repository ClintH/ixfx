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
exports.__esModule = true;
exports.minMaxAvg = exports.getSorter = exports.sortByValueNumber = exports.sortByValueString = exports.sortByKey = exports.byValueString = void 0;
var Array_1 = require("fp-ts/Array");
var function_1 = require("fp-ts/function");
var S = __importStar(require("fp-ts/string"));
var N = __importStar(require("fp-ts/number"));
var Ord_1 = require("fp-ts/Ord");
var Arrays_js_1 = require("./collections/Arrays.js");
var byKey = function (reverse) {
    if (reverse === void 0) { reverse = false; }
    return (0, function_1.pipe)(reverse ? (0, Ord_1.reverse)(S.Ord) : S.Ord, (0, Ord_1.contramap)(function (v) { return v[0]; }));
};
var byValueString = function (reverse) {
    if (reverse === void 0) { reverse = false; }
    return (0, function_1.pipe)(reverse ? (0, Ord_1.reverse)(S.Ord) : S.Ord, (0, Ord_1.contramap)(function (v) { return v[1]; }));
};
exports.byValueString = byValueString;
var byValueNumber = function (reverse) {
    if (reverse === void 0) { reverse = false; }
    return (0, function_1.pipe)(reverse ? (0, Ord_1.reverse)(N.Ord) : N.Ord, (0, Ord_1.contramap)(function (v) { return v[1]; }));
};
var sortByKey = function (reverse) {
    if (reverse === void 0) { reverse = false; }
    return (0, Array_1.sort)(byKey(reverse));
};
exports.sortByKey = sortByKey;
var sortByValueString = function (reverse) {
    if (reverse === void 0) { reverse = false; }
    return (0, Array_1.sort)((0, exports.byValueString)(reverse));
};
exports.sortByValueString = sortByValueString;
var sortByValueNumber = function (reverse) {
    if (reverse === void 0) { reverse = false; }
    return (0, Array_1.sort)(byValueNumber(reverse));
};
exports.sortByValueNumber = sortByValueNumber;
var getSorter = function (sortStyle) {
    switch (sortStyle) {
        case "value":
            return (0, exports.sortByValueNumber)(false);
        case "valueReverse":
            return (0, exports.sortByValueNumber)(true);
        case "key":
            return (0, exports.sortByKey)(false);
        case "keyReverse":
            return (0, exports.sortByKey)(true);
        default:
            throw new Error("Unknown sorting value '".concat(sortStyle, "'. Expecting: value, valueReverse, key or keyReverse"));
    }
};
exports.getSorter = getSorter;
var minMaxAvg = function (entries, conversionFn) {
    if (conversionFn === undefined)
        conversionFn = function (v) { return v[1]; };
    var values = entries.map(conversionFn);
    return (0, Arrays_js_1.minMaxAvg)(values);
};
exports.minMaxAvg = minMaxAvg;
//# sourceMappingURL=KeyValue.js.map