"use strict";
exports.__esModule = true;
exports.defined = exports.array = exports.isStringArray = exports.integer = exports.percent = exports.number = void 0;
/**
 * Throws an error if `t` is not a number or within specified range.
 * Alternatives: {@link integer} for additional integer check, {@link percent} for percentage-range.
 *
 * * positive: must be at least zero
 * * negative: must be zero or lower
 * * aboveZero: must be above zero
 * * belowZero: must be below zero
 * * percentage: must be within 0-1, inclusive
 * * nonZero: can be anything except zero
 * * bipolar: can be -1 to 1, inclusive
 * @param value Value to check
 * @param paramName Name of parameter (for more helpful exception messages)
 * @param range Range to enforce
 * @returns
 */
var number = function (value, range, paramName) {
    if (range === void 0) { range = ""; }
    if (paramName === void 0) { paramName = "?"; }
    if (Number.isNaN(value))
        throw new Error("Parameter '".concat(paramName, "' is NaN"));
    if (typeof value !== "number")
        throw new Error("Parameter '".concat(paramName, "' is not a number (").concat(value, ")"));
    switch (range) {
        case "positive":
            if (value < 0)
                throw new Error("Parameter '".concat(paramName, "' must be at least zero (").concat(value, ")"));
            break;
        case "negative":
            if (value > 0)
                throw new Error("Parameter '".concat(paramName, "' must be zero or lower (").concat(value, ")"));
            break;
        case "aboveZero":
            if (value <= 0)
                throw new Error("Parameter '".concat(paramName, "' must be above zero (").concat(value, ")"));
            break;
        case "belowZero":
            if (value >= 0)
                throw new Error("Parameter '".concat(paramName, "' must be below zero (").concat(value, ")"));
            break;
        case "percentage":
            if (value > 1 || value < 0)
                throw new Error("Parameter '".concat(paramName, "' must be in percentage range (0 to 1). (").concat(value, ")"));
            break;
        case "nonZero":
            if (value === 0)
                throw new Error("Parameter '".concat(paramName, "' must non-zero. (").concat(value, ")"));
            break;
        case "bipolar":
            if (value > 1 || value < -1)
                throw new Error("Parameter '".concat(paramName, "' must be in bipolar percentage range (-1 to 1). (").concat(value, ")"));
            break;
    }
    return true;
};
exports.number = number;
/**
 * Throws an error if `value` is not in the range of 0-1.
 * Equiv to `number(value, `percentage`);`
 *
 * This is the same as calling ```number(t, `percentage`)```
 * @param value Value to check
 * @param paramName Param name for customising exception message
 * @returns
 */
var percent = function (value, paramName) {
    if (paramName === void 0) { paramName = "?"; }
    return (0, exports.number)(value, "percentage", paramName);
};
exports.percent = percent;
/**
 * Throws an error if `value` is not an integer, or does not meet guard criteria.
 * See {@link number} for guard details, or use that if integer checking is not required.
 * @param value Value to check
 * @param paramName Param name for customising exception message
 * @param range Guard specifier.
 */
var integer = function (value, range, paramName) {
    if (range === void 0) { range = ""; }
    if (paramName === void 0) { paramName = "?"; }
    // Unit tested
    (0, exports.number)(value, range, paramName);
    if (!Number.isInteger(value))
        throw new Error("Paramter ".concat(paramName, " is not an integer"));
};
exports.integer = integer;
/**
 * Returns true if parameter is an array of strings
 * @param value
 * @returns
 */
var isStringArray = function (value) {
    if (!Array.isArray(value))
        return false;
    return value.find(function (v) { return typeof v !== "string"; }) === undefined;
};
exports.isStringArray = isStringArray;
/**
 * Throws an error if parameter is not an array
 * @param value
 * @param paramName
 */
var array = function (value, paramName) {
    if (paramName === void 0) { paramName = "?"; }
    if (!Array.isArray(value))
        throw new Error("Parameter '".concat(paramName, "' is expected to be an array'"));
};
exports.array = array;
/** Throws an error if parameter is not defined */
var defined = function (argument) { return argument !== undefined; };
exports.defined = defined;
//# sourceMappingURL=Guards.js.map