"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = function(target, all) {
    for(var name in all)__defProp(target, name, {
        get: all[name],
        enumerable: true
    });
};
var __copyProps = function(to, from, except, desc) {
    if (from && typeof from === "object" || typeof from === "function") {
        var _iteratorNormalCompletion = true, _didIteratorError = false, _iteratorError = undefined;
        try {
            var _loop = function() {
                var key = _step.value;
                if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
                    get: function() {
                        return from[key];
                    },
                    enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
                });
            };
            for(var _iterator = __getOwnPropNames(from)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true)_loop();
        } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
        } finally{
            try {
                if (!_iteratorNormalCompletion && _iterator.return != null) {
                    _iterator.return();
                }
            } finally{
                if (_didIteratorError) {
                    throw _iteratorError;
                }
            }
        }
    }
    return to;
};
var __toCommonJS = function(mod) {
    return __copyProps(__defProp({}, "__esModule", {
        value: true
    }), mod);
};
// src/data/Scale.ts
var Scale_exports = {};
__export(Scale_exports, {
    scale: function() {
        return scale;
    },
    scaleClamped: function() {
        return scaleClamped;
    },
    scalePercent: function() {
        return scalePercent;
    },
    scalePercentages: function() {
        return scalePercentages;
    }
});
module.exports = __toCommonJS(Scale_exports);
// src/data/Clamp.ts
var clamp = function(v) {
    var min = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0, max = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 1;
    if (Number.isNaN(v)) throw new Error("v parameter is NaN");
    if (Number.isNaN(min)) throw new Error("min parameter is NaN");
    if (Number.isNaN(max)) throw new Error("max parameter is NaN");
    if (v < min) return min;
    if (v > max) return max;
    return v;
};
// src/Guards.ts
var number = function(value) {
    var range = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", paramName = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : "?";
    if (Number.isNaN(value)) throw new Error("Parameter '".concat(paramName, "' is NaN"));
    if (typeof value !== "number") throw new Error("Parameter '".concat(paramName, "' is not a number (").concat(value, ")"));
    switch(range){
        case "positive":
            if (value < 0) throw new Error("Parameter '".concat(paramName, "' must be at least zero (").concat(value, ")"));
            break;
        case "negative":
            if (value > 0) throw new Error("Parameter '".concat(paramName, "' must be zero or lower (").concat(value, ")"));
            break;
        case "aboveZero":
            if (value <= 0) throw new Error("Parameter '".concat(paramName, "' must be above zero (").concat(value, ")"));
            break;
        case "belowZero":
            if (value >= 0) throw new Error("Parameter '".concat(paramName, "' must be below zero (").concat(value, ")"));
            break;
        case "percentage":
            if (value > 1 || value < 0) throw new Error("Parameter '".concat(paramName, "' must be in percentage range (0 to 1). (").concat(value, ")"));
            break;
        case "nonZero":
            if (value === 0) throw new Error("Parameter '".concat(paramName, "' must non-zero. (").concat(value, ")"));
            break;
        case "bipolar":
            if (value > 1 || value < -1) throw new Error("Parameter '".concat(paramName, "' must be in bipolar percentage range (-1 to 1). (").concat(value, ")"));
            break;
    }
    return true;
};
// src/data/Scale.ts
var scale = function(v, inMin, inMax, outMin, outMax, easing) {
    if (outMax === void 0) outMax = 1;
    if (outMin === void 0) outMin = 0;
    if (inMin === inMax) return outMax;
    var a = (v - inMin) / (inMax - inMin);
    if (easing !== void 0) a = easing(a);
    return a * (outMax - outMin) + outMin;
};
var scaleClamped = function(v, inMin, inMax, outMin, outMax, easing) {
    if (outMax === void 0) outMax = 1;
    if (outMin === void 0) outMin = 0;
    if (inMin === inMax) return outMax;
    var x = scale(v, inMin, inMax, outMin, outMax, easing);
    return clamp(x, outMin, outMax);
};
var scalePercentages = function(percentage, outMin) {
    var outMax = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 1;
    number(percentage, "percentage", "v");
    number(outMin, "percentage", "outMin");
    number(outMax, "percentage", "outMax");
    return scale(percentage, 0, 1, outMin, outMax);
};
var scalePercent = function(v, outMin, outMax) {
    number(v, "percentage", "v");
    return scale(v, 0, 1, outMin, outMax);
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
    scale: scale,
    scaleClamped: scaleClamped,
    scalePercent: scalePercent,
    scalePercentages: scalePercentages
});
