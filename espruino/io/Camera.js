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
exports.start = exports.dumpDevices = void 0;
var WaitFor_js_1 = require("~/flow/WaitFor.js");
/**
 * Print available media devices to console
 * @param filterKind Defaults `videoinput`
 */
var dumpDevices = function (filterKind) {
    if (filterKind === void 0) { filterKind = "videoinput"; }
    return __awaiter(void 0, void 0, void 0, function () {
        var devices;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, navigator.mediaDevices.enumerateDevices()];
                case 1:
                    devices = _a.sent();
                    devices.forEach(function (d) {
                        if (d.kind !== filterKind)
                            return;
                        console.log(d.label);
                        console.log(" Kind: ".concat(d.kind));
                        console.log(" Device id: ".concat(d.deviceId));
                    });
                    return [2 /*return*/];
            }
        });
    });
};
exports.dumpDevices = dumpDevices;
var startTimeoutMs = 10000;
/**
 * Attempts to start a video-only stream from a camera into a hidden
 * VIDEO element for frame capture. The VIDEO element is created automatically.
 *
 *
 * ```js
 * import {Camera} from 'https://unpkg.com/ixfx/dist/visual.js'
 * try
 *  const { videoEl, dispose } = await Camera.start();
 *  for await (const frame of frames(videoEl)) {
 *   // Do something with pixels...
 *  }
 * } catch (ex) {
 *  console.error(`Video could not be started`);
 * }
 * ```
 *
 * Be sure to call the dispose() function to stop the video stream and remov
 * the created VIDEO element.
 *
 * _Constraints_ can be specified to select a camera and resolution:
 * ```js
 * import {Camera} from 'https://unpkg.com/ixfx/dist/visual.js'
 * try
 *  const { videoEl, dispose } = await Camera.start({
 *    facingMode: `environment`,
 *    max: { width: 640, height: 480 }
 *  });
 *  for await (const frame of frames(videoEl)) {
 *   // Do something with pixels...
 *  }
 * } catch (ex) {
 *  console.error(`Video could not be started`);
 * }
 * ```
 * @param constraints
 * @returns Returns `{ videoEl, dispose }`, where `videoEl` is the created VIDEO element, and `dispose` is a function for removing the element and stopping the video.
 */
var start = function (constraints) {
    if (constraints === void 0) { constraints = {}; }
    return __awaiter(void 0, void 0, void 0, function () {
        var videoEl, stopVideo, dispose, r, ex_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    videoEl = document.createElement("VIDEO");
                    //eslint-disable-next-line functional/immutable-data
                    videoEl.style.display = "none";
                    videoEl.classList.add("ixfx-camera");
                    document.body.appendChild(videoEl);
                    stopVideo = function () { };
                    dispose = function () {
                        try {
                            // Stop source
                            stopVideo();
                        }
                        catch (_a) {
                            /* no-op */
                        }
                        // Remove the element we created
                        videoEl.remove();
                    };
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, startWithVideoEl(videoEl, constraints)];
                case 2:
                    r = _a.sent();
                    stopVideo = r.dispose;
                    return [2 /*return*/, { videoEl: videoEl, dispose: dispose }];
                case 3:
                    ex_1 = _a.sent();
                    // If it didn't work, delete the created element 
                    console.error(ex_1);
                    dispose();
                    throw ex_1;
                case 4: return [2 /*return*/];
            }
        });
    });
};
exports.start = start;
/**
 * Attempts to start a video-only stream from a camera into the designated VIDEO element.
 * @param videoEl
 * @param constraints
 * @returns Result contains videoEl and dispose function
 */
var startWithVideoEl = function (videoEl, constraints) {
    if (constraints === void 0) { constraints = {}; }
    return __awaiter(void 0, void 0, void 0, function () {
        var maxRes, minRes, idealRes, c, done, stream_1, dispose, ret_1, p, ex_2;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (videoEl === undefined)
                        throw new Error("videoEl undefined");
                    if (videoEl === null)
                        throw new Error("videoEl null");
                    maxRes = constraints.max;
                    minRes = constraints.min;
                    idealRes = constraints.ideal;
                    c = {
                        audio: false,
                        video: {
                            width: {},
                            height: {}
                        }
                    };
                    // Just in case some intuitive values are passed in...
                    //eslint-disable-next-line @typescript-eslint/no-explicit-any
                    if (constraints.facingMode === "front")
                        constraints = __assign(__assign({}, constraints), { facingMode: "user" });
                    //eslint-disable-next-line @typescript-eslint/no-explicit-any
                    if (constraints.facingMode === "back")
                        constraints = __assign(__assign({}, constraints), { facingMode: "environment" });
                    if (constraints.facingMode) {
                        //eslint-disable-next-line functional/immutable-data,@typescript-eslint/no-explicit-any
                        c.video.facingMode = constraints.facingMode;
                    }
                    if (constraints.deviceId) {
                        //eslint-disable-next-line functional/immutable-data,@typescript-eslint/no-explicit-any
                        c.video.deviceId = constraints.deviceId;
                    }
                    if (idealRes) {
                        //eslint-disable-next-line functional/immutable-data
                        c.video.width = __assign(__assign({}, c.video.width), { ideal: idealRes.width });
                        //eslint-disable-next-line functional/immutable-data
                        c.video.height = __assign(__assign({}, c.video.height), { ideal: idealRes.height });
                    }
                    if (maxRes) {
                        //eslint-disable-next-line functional/immutable-data
                        c.video.width = __assign(__assign({}, c.video.width), { max: maxRes.width });
                        //eslint-disable-next-line functional/immutable-data
                        c.video.height = __assign(__assign({}, c.video.height), { max: maxRes.height });
                    }
                    if (minRes) {
                        //eslint-disable-next-line functional/immutable-data
                        c.video.width = __assign(__assign({}, c.video.width), { min: minRes.width });
                        //eslint-disable-next-line functional/immutable-data
                        c.video.height = __assign(__assign({}, c.video.height), { min: minRes.height });
                    }
                    done = (0, WaitFor_js_1.waitFor)((_a = constraints.startTimeoutMs) !== null && _a !== void 0 ? _a : startTimeoutMs, function (reason) {
                        throw new Error("Camera getUserMedia failed: ".concat(reason));
                    });
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, navigator.mediaDevices.getUserMedia(c)];
                case 2:
                    stream_1 = _b.sent();
                    dispose = function () {
                        videoEl.pause();
                        var t = stream_1.getTracks();
                        t.forEach(function (track) { return track.stop(); });
                    };
                    // Assign to VIDEO element
                    //eslint-disable-next-line functional/immutable-data
                    videoEl.srcObject = stream_1;
                    done();
                    ret_1 = { videoEl: videoEl, dispose: dispose };
                    p = new Promise(function (resolve, reject) {
                        videoEl.addEventListener("loadedmetadata", function () {
                            videoEl.play().then(function () {
                                resolve(ret_1);
                            })["catch"](function (ex) {
                                reject(ex);
                            });
                        });
                    });
                    return [2 /*return*/, p];
                case 3:
                    ex_2 = _b.sent();
                    //eslint-disable-next-line @typescript-eslint/no-explicit-any
                    done(ex_2.toString());
                    throw ex_2;
                case 4: return [2 /*return*/];
            }
        });
    });
};
//# sourceMappingURL=Camera.js.map