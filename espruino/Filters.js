"use strict";
exports.__esModule = true;
exports.filter = exports.rangeInclusive = exports.threshold = void 0;
var threshold = function (threshold) {
    return function (v) {
        return v >= threshold;
    };
};
exports.threshold = threshold;
var rangeInclusive = function (min, max) {
    return function (v) {
        return v >= min && v <= max;
    };
};
exports.rangeInclusive = rangeInclusive;
var filter = function (v, fn, skipValue) {
    if (fn(v))
        return v;
    return skipValue;
};
exports.filter = filter;
//# sourceMappingURL=Filters.js.map