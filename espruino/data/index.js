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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
exports.__esModule = true;
exports.piPi = exports.Normalise = void 0;
exports.Normalise = __importStar(require("./Normalise.js"));
__exportStar(require("./FrequencyMutable.js"), exports);
__exportStar(require("./MovingAverage.js"), exports);
__exportStar(require("./NumberTracker.js"), exports);
__exportStar(require("./IntervalTracker.js"), exports);
__exportStar(require("./PointTracker.js"), exports);
__exportStar(require("./TrackedValue.js"), exports);
__exportStar(require("./TrackerBase.js"), exports);
__exportStar(require("./Clamp.js"), exports);
__exportStar(require("./Scale.js"), exports);
__exportStar(require("./Flip.js"), exports);
__exportStar(require("./Interpolate.js"), exports);
__exportStar(require("./Wrap.js"), exports);
exports.piPi = Math.PI * 2;
//# sourceMappingURL=index.js.map