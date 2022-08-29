"use strict";
exports.__esModule = true;
exports.getEnd = exports.getStart = void 0;
var index_js_1 = require("./index.js");
/**
 * Return the start point of a path
 *
 * @param path
 * @return Point
 */
var getStart = function (path) {
    if (index_js_1.Beziers.isQuadraticBezier(path))
        return path.a;
    else if (index_js_1.Lines.isLine(path))
        return path.a;
    else
        throw new Error("Unknown path type ".concat(JSON.stringify(path)));
};
exports.getStart = getStart;
/**
 * Return the end point of a path
 *
 * @param path
 * @return Point
 */
var getEnd = function (path) {
    if (index_js_1.Beziers.isQuadraticBezier(path))
        return path.b;
    else if (index_js_1.Lines.isLine(path))
        return path.b;
    else
        throw new Error("Unknown path type ".concat(JSON.stringify(path)));
};
exports.getEnd = getEnd;
//# sourceMappingURL=Path.js.map