"use strict";
exports.__esModule = true;
exports.proportion = void 0;
var Guards_js_1 = require("../Guards.js");
/**
 * Scales a percentage-scale number, ie: `v * t`.
 * The utility of this function is that it sanity-checks that
 *  both parameters are in the 0..1 scale.
 * @param v Value
 * @param t Scale amount
 * @returns Scaled value
 */
var proportion = function (v, t) {
    if (typeof v === "function")
        v = v();
    if (typeof t === "function")
        t = t();
    (0, Guards_js_1.number)(v, "percentage", "v");
    (0, Guards_js_1.number)(t, "percentage", "t");
    return v * t;
};
exports.proportion = proportion;
//# sourceMappingURL=Proportion.js.map