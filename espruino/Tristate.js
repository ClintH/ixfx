"use strict";
exports.__esModule = true;
exports.comparer = void 0;
/**
 * Returns true if a is more sure than b
 * @param a
 * @param b
 * @returns
 */
var comparer = function (a, b) {
    if (a === b)
        return 0;
    if (a === "yes")
        return -1; // a before b
    if (b === "yes")
        return 1; // b before a
    if (a === "maybe")
        return -1; // a before b
    return -1;
};
exports.comparer = comparer;
//# sourceMappingURL=Tristate.js.map