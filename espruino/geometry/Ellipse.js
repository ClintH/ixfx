"use strict";
exports.__esModule = true;
exports.fromDegrees = void 0;
var index_js_1 = require("./index.js");
var fromDegrees = function (radiusX, radiusY, rotationDeg, startAngleDeg, endAngleDeg) {
    if (rotationDeg === void 0) { rotationDeg = 0; }
    if (startAngleDeg === void 0) { startAngleDeg = 0; }
    if (endAngleDeg === void 0) { endAngleDeg = 360; }
    return ({
        radiusX: radiusX,
        radiusY: radiusY,
        rotation: (0, index_js_1.degreeToRadian)(rotationDeg),
        startAngle: (0, index_js_1.degreeToRadian)(startAngleDeg),
        endAngle: (0, index_js_1.degreeToRadian)(endAngleDeg)
    });
};
exports.fromDegrees = fromDegrees;
//# sourceMappingURL=Ellipse.js.map