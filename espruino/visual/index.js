"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.SceneGraph = exports.Plot2 = exports.Plot = exports.Svg = exports.Drawing = exports.Palette = exports.Video = exports.Colour = void 0;
var Drawing = __importStar(require("./Drawing.js"));
exports.Drawing = Drawing;
var Svg = __importStar(require("./Svg.js"));
exports.Svg = Svg;
var Plot = __importStar(require("./Plot.js"));
exports.Plot = Plot;
var Plot2 = __importStar(require("./Plot2.js"));
exports.Plot2 = Plot2;
var Palette = __importStar(require("./Palette"));
exports.Palette = Palette;
var Colour = __importStar(require("./Colour.js"));
exports.Colour = Colour;
var SceneGraph = __importStar(require("./SceneGraph.js"));
exports.SceneGraph = SceneGraph;
var Video = __importStar(require("./Video.js"));
exports.Video = Video;
try {
    if (typeof window !== "undefined") {
        //eslint-disable-next-line functional/immutable-data,@typescript-eslint/no-explicit-any
        window.ixfx = __assign(__assign({}, window.ixfx), { Visuals: { SceneGraph: SceneGraph, Plot2: Plot2, Drawing: Drawing, Svg: Svg, Plot: Plot, Palette: Palette, Colour: Colour, Video: Video } });
    }
}
catch ( /* no-op */_a) { /* no-op */ }
//# sourceMappingURL=index.js.map