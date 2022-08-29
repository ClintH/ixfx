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
exports.FrameProcessor = void 0;
var Camera = __importStar(require("./Camera.js"));
var Video = __importStar(require("../visual/Video.js"));
var FrameProcessor = /** @class */ (function () {
    function FrameProcessor(opts) {
        if (opts === void 0) { opts = {}; }
        var _a, _b, _c, _d;
        this._teardownNeeded = false;
        this._state = "ready";
        this._source = "";
        this._timer = performance.now();
        this._showCanvas = (_a = opts.showCanvas) !== null && _a !== void 0 ? _a : false;
        this._showPreview = (_b = opts.showPreview) !== null && _b !== void 0 ? _b : false;
        this._cameraConstraints = (_c = opts.cameraConstraints) !== null && _c !== void 0 ? _c : undefined;
        this._captureCanvasEl = (_d = opts.captureCanvasEl) !== null && _d !== void 0 ? _d : undefined;
        this._postCaptureDraw = opts.postCaptureDraw;
    }
    FrameProcessor.prototype.showPreview = function (enabled) {
        var _a;
        if (this._state === "disposed")
            throw new Error("Disposed");
        //eslint-disable-next-line functional/no-let
        var el;
        switch (this._source) {
            case "camera":
                el = (_a = this._cameraStartResult) === null || _a === void 0 ? void 0 : _a.videoEl;
                if (el !== undefined)
                    el.style.display = enabled ? "block" : "none";
                break;
        }
        this._showPreview = enabled;
    };
    FrameProcessor.prototype.showCanvas = function (enabled) {
        var _a;
        if (this._state === "disposed")
            throw new Error("Disposed");
        //eslint-disable-next-line functional/no-let
        var el;
        switch (this._source) {
            case "camera":
                el = (_a = this._cameraCapture) === null || _a === void 0 ? void 0 : _a.canvasEl;
                if (el !== undefined)
                    el.style.display = enabled ? "block" : "none";
                break;
        }
        this._showCanvas = enabled;
    };
    FrameProcessor.prototype.getCapturer = function () {
        if (this._state === "disposed")
            throw new Error("Disposed");
        switch (this._source) {
            case "camera":
                return this._cameraCapture;
        }
    };
    FrameProcessor.prototype.useCamera = function (constraints) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this._state === "disposed")
                            throw new Error("Disposed");
                        this._source = "camera";
                        if (this._teardownNeeded)
                            this.teardown();
                        if (constraints)
                            this._cameraConstraints;
                        return [4 /*yield*/, this.init()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    FrameProcessor.prototype.initCamera = function () {
        return __awaiter(this, void 0, void 0, function () {
            var r;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Camera.start(this._cameraConstraints)];
                    case 1:
                        r = _a.sent();
                        if (r === undefined)
                            throw new Error("Could not start camera");
                        if (this._showPreview)
                            r.videoEl.style.display = "block";
                        // Set up manual capturer
                        this._cameraCapture = Video.manualCapture(r.videoEl, {
                            postCaptureDraw: this._postCaptureDraw,
                            showCanvas: this._showCanvas,
                            canvasEl: this._captureCanvasEl
                        });
                        this._cameraStartResult = r;
                        this._teardownNeeded = true;
                        this._cameraStartResult = r;
                        return [2 /*return*/];
                }
            });
        });
    };
    FrameProcessor.prototype.dispose = function () {
        if (this._state === "disposed")
            return;
        this.teardown();
        this._state = "disposed";
    };
    FrameProcessor.prototype.init = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this._timer = performance.now();
                        _a = this._source;
                        switch (_a) {
                            case "camera": return [3 /*break*/, 1];
                        }
                        return [3 /*break*/, 3];
                    case 1: return [4 /*yield*/, this.initCamera()];
                    case 2:
                        _b.sent();
                        return [3 /*break*/, 3];
                    case 3:
                        this._state = "initialised";
                        return [2 /*return*/];
                }
            });
        });
    };
    FrameProcessor.prototype.teardown = function () {
        var _a, _b;
        if (!this._teardownNeeded)
            return;
        switch (this._source) {
            case "camera":
                (_a = this._cameraCapture) === null || _a === void 0 ? void 0 : _a.dispose();
                (_b = this._cameraStartResult) === null || _b === void 0 ? void 0 : _b.dispose();
                break;
        }
        this._teardownNeeded = false;
    };
    FrameProcessor.prototype.getFrame = function () {
        if (this._state === "disposed")
            throw new Error("Disposed");
        switch (this._source) {
            case "camera":
                return this.getFrameCamera();
        }
    };
    FrameProcessor.prototype.getTimestamp = function () {
        return performance.now() - this._timer;
    };
    FrameProcessor.prototype.getFrameCamera = function () {
        var _a;
        return (_a = this._cameraCapture) === null || _a === void 0 ? void 0 : _a.capture();
    };
    return FrameProcessor;
}());
exports.FrameProcessor = FrameProcessor;
//# sourceMappingURL=FrameProcessor.js.map