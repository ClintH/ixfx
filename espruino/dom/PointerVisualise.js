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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.pointerVisualise = void 0;
/* eslint-disable functional/immutable-data */
var PointTracker_js_1 = require("../data/PointTracker.js");
var Util_js_1 = require("./Util.js");
var Svg = __importStar(require("../visual/Svg.js"));
/**
 * Visualises pointer events within a given element.
 *
 * ```js
 * // Show pointer events for whole document
 * pointerVis(document);
 * ```
 *
 * Note you may need to set the following CSS properties on the target element:
 *
 * ```css
 * touch-action: none;
 * user-select: none;
 * overscroll-behavior: none;
 * ```
 *
 * Options
 * * touchRadius/mouseRadius: size of circle for these kinds of pointer events
 * * trace: if true, intermediate events are captured and displayed
 * @param elOrQuery
 * @param opts
 */
var pointerVisualise = function (elOrQuery, opts) {
    var _a, _b, _c, _d;
    if (opts === void 0) { opts = {}; }
    var touchRadius = (_a = opts.touchRadius) !== null && _a !== void 0 ? _a : 45;
    var mouseRadius = (_b = opts.touchRadius) !== null && _b !== void 0 ? _b : 20;
    var trace = (_c = opts.trace) !== null && _c !== void 0 ? _c : false;
    var hue = (_d = opts.hue) !== null && _d !== void 0 ? _d : 100;
    var startFillStyle = "hsla(".concat(hue, ", 100%, 10%, 10%)");
    //eslint-disable-next-line functional/no-let
    var currentHue = hue;
    var el = (0, Util_js_1.resolveEl)(elOrQuery);
    var tracker = (0, PointTracker_js_1.pointsTracker)({
        storeIntermediate: trace
    });
    //eslint-disable-next-line @typescript-eslint/no-explicit-any
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.id = "pointerVis";
    svg.style.zIndex = "-1000";
    svg.style.position = "fixed";
    svg.style.top = "0";
    svg.style.left = "0";
    svg.style.width = "100%";
    svg.style.height = "100%";
    svg.style.boxSizing = "border-box";
    svg.style.border = "3px solid red";
    svg.style.pointerEvents = "none";
    svg.style.touchAction = "none";
    (0, Util_js_1.fullSizeElement)(svg);
    //eslint-disable-next-line functional/no-let
    var pointerCount = 0;
    var lostPointer = function (ev) { return __awaiter(void 0, void 0, void 0, function () {
        var id, i;
        var _a, _b;
        return __generator(this, function (_c) {
            id = ev.pointerId.toString();
            tracker["delete"](id);
            currentHue = hue;
            (_a = svg.querySelector("#pv-start-".concat(id))) === null || _a === void 0 ? void 0 : _a.remove();
            //eslint-disable-next-line functional/no-let
            for (i = 0; i < pointerCount + 10; i++) {
                (_b = svg.querySelector("#pv-progress-".concat(id, "-").concat(i))) === null || _b === void 0 ? void 0 : _b.remove();
            }
            pointerCount = 0;
            return [2 /*return*/];
        });
    }); };
    var trackPointer = function (ev) { return __awaiter(void 0, void 0, void 0, function () {
        var id, pt, type, info, el_1, progressFillStyle, el2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    id = ev.pointerId.toString();
                    pt = { x: ev.x, y: ev.y };
                    type = ev.pointerType;
                    if (ev.type === "pointermove" && !tracker.has(id)) {
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, tracker.seen(id, pt)];
                case 1:
                    info = _a.sent();
                    if (info.values.length === 1) {
                        el_1 = Svg.Elements.circle(__assign(__assign({}, info.values[0]), { radius: (type === "touch" ? touchRadius : mouseRadius) }), svg, {
                            fillStyle: startFillStyle
                        }, "#pv-start-".concat(id));
                        el_1.style.pointerEvents = "none";
                        el_1.style.touchAction = "none";
                    }
                    progressFillStyle = "hsla(".concat(currentHue, ", 100%, 50%, 50%)");
                    el2 = Svg.Elements.circle(__assign(__assign({}, pt), { radius: (type === "touch" ? touchRadius : mouseRadius) }), svg, {
                        fillStyle: progressFillStyle
                    }, "#pv-progress-".concat(id, "-").concat(info.values.length));
                    el2.style.pointerEvents = "none";
                    el2.style.touchAction = "none";
                    currentHue += 1;
                    pointerCount = info.values.length;
                    return [2 /*return*/, true];
            }
        });
    }); };
    document.body.appendChild(svg);
    el.addEventListener("pointerdown", trackPointer);
    el.addEventListener("pointermove", trackPointer);
    el.addEventListener("pointerup", lostPointer);
    el.addEventListener("pointerleave", lostPointer);
    el.addEventListener("contextmenu", function (ev) {
        ev.preventDefault();
    });
};
exports.pointerVisualise = pointerVisualise;
//# sourceMappingURL=PointerVisualise.js.map