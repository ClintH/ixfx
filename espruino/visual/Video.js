"use strict";
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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncGenerator = (this && this.__asyncGenerator) || function (thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
    function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
};
exports.__esModule = true;
exports.manualCapture = exports.capture = exports.frames = void 0;
/* eslint-disable @typescript-eslint/no-non-null-assertion,functional/immutable-data */
var index_js_1 = require("../flow/index.js");
/**
 * Generator that yields frames from a video element as [ImageData](https://developer.mozilla.org/en-US/docs/Web/API/ImageData).
 *
 * ```js
 * import {Video} from 'https://unpkg.com/ixfx/dist/visual.js'
 *
 * const ctx = canvasEl.getContext(`2d`);
 * for await (const frame of Video.frames(videoEl)) {
 *   // TODO: Some processing of pixels
 *
 *   // Draw image on to the visible canvas
 *   ctx.putImageData(frame, 0, 0);
 * }
 * ```
 *
 * Under the hood it creates a hidden canvas where frames are drawn to. This is necessary
 * to read back pixel data. An existing canvas can be used if it is passed in as an option.
 *
 * Options:
 * * `canvasEl`: CANVAS element to use as a buffer (optional)
 * * `maxIntervalMs`: Max frame rate (0 by default, ie runs as fast as possible)
 * * `showCanvas`: Whether buffer canvas will be shown (false by default)
 * @param sourceVideoEl
 * @param opts
 */
//eslint-disable-next-line func-style
function frames(sourceVideoEl, opts) {
    var _a, _b;
    if (opts === void 0) { opts = {}; }
    return __asyncGenerator(this, arguments, function frames_1() {
        var maxIntervalMs, showCanvas, canvasEl, w, h, updateSize, c, looper, looper_1, looper_1_1, _, pixels, e_1_1;
        var e_1, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    maxIntervalMs = (_a = opts.maxIntervalMs) !== null && _a !== void 0 ? _a : 0;
                    showCanvas = (_b = opts.showCanvas) !== null && _b !== void 0 ? _b : false;
                    canvasEl = opts.canvasEl;
                    w = h = 0;
                    // Create & setup canvas
                    if (canvasEl === undefined) {
                        canvasEl = document.createElement("CANVAS");
                        canvasEl.classList.add("ixfx-frames");
                        if (!showCanvas) {
                            canvasEl.style.display = "none";
                        }
                        document.body.appendChild(canvasEl);
                    }
                    updateSize = function () {
                        if (canvasEl === undefined)
                            return;
                        w = sourceVideoEl.videoWidth;
                        h = sourceVideoEl.videoHeight;
                        canvasEl.width = w;
                        canvasEl.height = h;
                    };
                    c = null;
                    looper = (0, index_js_1.delayLoop)(maxIntervalMs);
                    _d.label = 1;
                case 1:
                    _d.trys.push([1, 10, 11, 16]);
                    looper_1 = __asyncValues(looper);
                    _d.label = 2;
                case 2: return [4 /*yield*/, __await(looper_1.next())];
                case 3:
                    if (!(looper_1_1 = _d.sent(), !looper_1_1.done)) return [3 /*break*/, 9];
                    _ = looper_1_1.value;
                    // If we don't yet have the size of video, get it
                    if (w === 0 || h === 0)
                        updateSize();
                    // If there is still no dimensions (ie stream has not started), there's nothing to do yet
                    if (w === 0 || h === 0)
                        return [3 /*break*/, 8];
                    // Draw current frame from video element to hidden canvas
                    if (c === null)
                        c = canvasEl.getContext("2d");
                    if (!(c === null)) return [3 /*break*/, 5];
                    return [4 /*yield*/, __await(void 0)];
                case 4: return [2 /*return*/, _d.sent()];
                case 5:
                    c.drawImage(sourceVideoEl, 0, 0, w, h);
                    pixels = c.getImageData(0, 0, w, h);
                    return [4 /*yield*/, __await(pixels)];
                case 6: return [4 /*yield*/, _d.sent()];
                case 7:
                    _d.sent();
                    _d.label = 8;
                case 8: return [3 /*break*/, 2];
                case 9: return [3 /*break*/, 16];
                case 10:
                    e_1_1 = _d.sent();
                    e_1 = { error: e_1_1 };
                    return [3 /*break*/, 16];
                case 11:
                    _d.trys.push([11, , 14, 15]);
                    if (!(looper_1_1 && !looper_1_1.done && (_c = looper_1["return"]))) return [3 /*break*/, 13];
                    return [4 /*yield*/, __await(_c.call(looper_1))];
                case 12:
                    _d.sent();
                    _d.label = 13;
                case 13: return [3 /*break*/, 15];
                case 14:
                    if (e_1) throw e_1.error;
                    return [7 /*endfinally*/];
                case 15: return [7 /*endfinally*/];
                case 16: return [2 /*return*/];
            }
        });
    });
}
exports.frames = frames;
/**
 * Captures frames from a video element. It can send pixel data to a function or post to a worker script.
 *
 * @example Using a function
 * ```js
 * import {Video} from 'https://unpkg.com/ixfx/dist/visual.js'
 *
 * // Capture from a VIDEO element, handling frame data
 * // imageData is ImageData type: https://developer.mozilla.org/en-US/docs/Web/API/ImageData
 * Video.capture(sourceVideoEl, {
 *  onFrame(imageData => {
 *    // Do something with pixels...
 *  });
 * });
 * ```
 *
 * @example Using a worker
 * ```js
 * import {Video} from 'https://unpkg.com/ixfx/dist/visual.js'
 *
 * Video.capture(sourceVideoEl, {
 *  workerScript: `./frameProcessor.js`
 * });
 * ```
 *
 * In frameProcessor.js:
 * ```
 * const process = (frame) => {
 *  // ...process frame
 *
 *  // Send image back?
 *  self.postMessage({frame});
 * };
 *
 * self.addEventListener(`message`, evt => {
 *   const {pixels, width, height} = evt.data;
 *   const frame = new ImageData(new Uint8ClampedArray(pixels),
 *     width, height);
 *
 *   // Process it
 *   process(frame);
 * });
 * ```
 *
 * Options:
 * * `canvasEl`: CANVAS element to use as a buffer (optional)
 * * `maxIntervalMs`: Max frame rate (0 by default, ie runs as fast as possible)
 * * `showCanvas`: Whether buffer canvas will be shown (false by default)
 * * `workerScript`: If this specified, this URL will be loaded as a Worker, and frame data will be automatically posted to it
 *
 * Implementation: frames are captured using a animation-speed loop to a hidden canvas. From there
 * the pixel data is extracted and sent to either destination. In future the intermediate drawing to a
 * canvas could be skipped if it becomes possible to get pixel data from an ImageBitmap.
 * @param sourceVideoEl Source VIDEO element
 * @param opts
 * @returns
 */
var capture = function (sourceVideoEl, opts) {
    var _a, _b;
    if (opts === void 0) { opts = {}; }
    var maxIntervalMs = (_a = opts.maxIntervalMs) !== null && _a !== void 0 ? _a : 0;
    var showCanvas = (_b = opts.showCanvas) !== null && _b !== void 0 ? _b : false;
    var onFrame = opts.onFrame;
    // Ideally use OffscreenCanvas when it has support?
    var w = sourceVideoEl.videoWidth;
    var h = sourceVideoEl.videoHeight;
    // Create canvas
    var canvasEl = document.createElement("CANVAS");
    canvasEl.classList.add("ixfx-capture");
    if (!showCanvas) {
        canvasEl.style.display = "none";
    }
    canvasEl.width = w;
    canvasEl.height = h;
    //eslint-disable-next-line functional/no-let
    var c = null;
    //eslint-disable-next-line functional/no-let
    var worker;
    if (opts.workerScript) {
        worker = new Worker(opts.workerScript);
    }
    // Should we get image data?
    var getPixels = worker || onFrame;
    if (!getPixels && !showCanvas) {
        console.warn("Video will be captured to hidden element without any processing. Is this what you want?");
    }
    var loop = (0, index_js_1.continuously)(function () {
        // Draw current frame from video element to hidden canvas
        if (c === null)
            c = canvasEl.getContext("2d");
        if (c === null)
            return;
        c.drawImage(sourceVideoEl, 0, 0, w, h);
        //eslint-disable-next-line functional/no-let
        var pixels;
        if (getPixels) {
            // ImageData necessary
            pixels = c.getImageData(0, 0, w, h);
        }
        if (worker) {
            // Send to worker
            worker.postMessage({
                pixels: pixels.data.buffer,
                width: w,
                height: h,
                channels: 4
            }, [pixels.data.buffer]);
        }
        if (onFrame) {
            // Send to callback
            try {
                onFrame(pixels);
            }
            catch (e) {
                console.error(e);
            }
        }
    }, maxIntervalMs);
    return {
        start: function () { return loop.start(); },
        cancel: function () { return loop.cancel(); },
        canvasEl: canvasEl
    };
};
exports.capture = capture;
var manualCapture = function (sourceVideoEl, opts) {
    var _a;
    if (opts === void 0) { opts = {}; }
    var showCanvas = (_a = opts.showCanvas) !== null && _a !== void 0 ? _a : false;
    // Ideally use OffscreenCanvas when it has support?
    var w = sourceVideoEl.videoWidth;
    var h = sourceVideoEl.videoHeight;
    // Create canvas if necessary
    var definedCanvasEl = opts.canvasEl !== undefined;
    //eslint-disable-next-line functional/no-let
    var canvasEl = opts.canvasEl;
    if (!canvasEl) {
        canvasEl = document.createElement("CANVAS");
        canvasEl.classList.add("ixfx-capture");
        document.body.append(canvasEl);
        if (!showCanvas)
            canvasEl.style.display = "none";
    }
    canvasEl.width = w;
    canvasEl.height = h;
    var capture = function () {
        //eslint-disable-next-line functional/no-let
        var c;
        // Draw current frame from video element to canvas
        if (!c)
            c = canvasEl === null || canvasEl === void 0 ? void 0 : canvasEl.getContext("2d");
        if (!c)
            throw new Error("Could not create graphics context");
        c.drawImage(sourceVideoEl, 0, 0, w, h);
        //eslint-disable-next-line functional/no-let
        var pixels = c.getImageData(0, 0, w, h);
        //eslint-disable-next-line @typescript-eslint/no-explicit-any
        pixels.currentTime = sourceVideoEl.currentTime;
        if (opts.postCaptureDraw)
            opts.postCaptureDraw(c, w, h);
        return pixels;
    };
    var dispose = function () {
        if (definedCanvasEl)
            return; // we didn't create it
        try {
            canvasEl === null || canvasEl === void 0 ? void 0 : canvasEl.remove();
        }
        catch (_) {
            // no-op
        }
    };
    var c = {
        canvasEl: canvasEl,
        capture: capture,
        dispose: dispose
    };
    return c;
};
exports.manualCapture = manualCapture;
//# sourceMappingURL=Video.js.map