"use strict";
exports.__esModule = true;
exports.flip = void 0;
var Guards_js_1 = require("../Guards.js");
/**
 * Flips a percentage-scale number: `1 - v`.
 *
 * The utility of this function is that it sanity-checks
 * that `v` is in 0..1 scale.
 *
 * ```js
 * flip(1);   // 0
 * flip(0.5); // 0.5
 * flip(0);   // 1
 * ```
 * @param v
 * @returns
 */
var flip = function (v) {
    if (typeof v === "function")
        v = v();
    (0, Guards_js_1.number)(v, "percentage", "v");
    return 1 - v;
};
exports.flip = flip;
//# sourceMappingURL=Flip.js.map