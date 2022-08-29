"use strict";
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _AudioAnalyser_isPaused, _AudioAnalyser_initInProgress;
exports.__esModule = true;
exports.AudioAnalyser = exports.peakLevel = exports.freq = exports.basic = void 0;
var index_js_1 = require("../collections/index.js");
var AudioVisualiser_js_1 = __importDefault(require("./AudioVisualiser.js"));
var Guards_js_1 = require("../Guards.js");
var Util_js_1 = require("../Util.js");
/**
 * Basic audio analyser. Returns back waveform and FFT analysis. Use {@link peakLevel} if you want sound level, or {@link freq} if you just want FFT results.
 *
 * ```js
 * const onData = (freq, wave, analyser) => {
 *  // Demo: Get FFT results just for 100Hz-1KHz.
 *  const freqSlice = analyser.sliceByFrequency(100,1000,freq);
 *
 *  // Demo: Get FFT value for a particular frequency (1KHz)
 *  const amt = freq[analyser.getIndexForFrequency(1000)];
 * }
 * basic(onData, {fftSize: 512});
 * ```
 *
 * An `Analyser` instance is returned and can be controlled:
 * ```js
 * const analyser = basic(onData);
 * analyser.paused = true;
 * ```
 *
 * Note: Browers won't allow microphone access unless the call has come from a user-interaction, eg pointerup event handler.
 *
 * @param onData Handler for data
 * @param opts Options
 * @returns Analyser instance
 */
var basic = function (onData, opts) {
    if (opts === void 0) { opts = {}; }
    return new AudioAnalyser(function (node, analyser) {
        // Get frequency and amplitude data
        var freq = new Float32Array(node.frequencyBinCount);
        var wave = new Float32Array(node.fftSize);
        // Load arrays with data
        node.getFloatFrequencyData(freq);
        node.getFloatTimeDomainData(wave);
        // Send back
        onData(freq, wave, analyser);
    }, opts);
};
exports.basic = basic;
/**
 * Basic audio analyser. Returns FFT analysis. Use {@link peakLevel} if you want the sound level, or {@link basic} if you also want the waveform.
 *
 * ```js
 * const onData = (freq, analyser) => {
 *  // Demo: Print out each sound frequency (Hz) and amount of energy in that band
 *  for (let i=0;i<freq.length;i++) {
 *    const f = analyser.getFrequencyAtIndex(0);
 *    console.log(`${i}. frequency: ${f} amount: ${freq[i]}`);
 *  }
 * }
 * freq(onData, {fftSize:512});
 * ```
 *
 * Note: Browers won't allow microphone access unless the call has come from a user-interaction, eg pointerup event handler.
 *
 * @param onData
 * @param opts
 * @returns
 */
var freq = function (onData, opts) {
    if (opts === void 0) { opts = {}; }
    return new AudioAnalyser(function (node, analyser) {
        var freq = new Float32Array(node.frequencyBinCount);
        node.getFloatFrequencyData(freq);
        onData(freq, analyser);
    }, opts);
};
exports.freq = freq;
/**
 * Basic audio analyser which reports the peak sound level.
 *
 * ```js
 * peakLevel(level => {
 *  console.log(level);
 * });
 * ```
 *
 * Note: Browers won't allow microphone access unless the call has come from a user-interaction, eg pointerup event handler.
 * @param onData
 * @param opts
 * @returns
 */
var peakLevel = function (onData, opts) {
    if (opts === void 0) { opts = {}; }
    return new AudioAnalyser(function (node, analyser) {
        var wave = new Float32Array(node.fftSize);
        node.getFloatTimeDomainData(wave);
        onData(index_js_1.Arrays.maxFast(wave), analyser);
    }, opts);
};
exports.peakLevel = peakLevel;
/**
 * Helper for doing audio analysis. It takes case of connecting the audio stream, running in a loop and pause capability.
 *
 * Provide a function which works with an [AnalyserNode](https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode), and does something with the result.
 * ```js
 * const myAnalysis = (node, analyser) => {
 *  const freq = new Float32Array(node.frequencyBinCount);
 *  node.getFloatFrequencyData(freq);
 *  // Do something with frequency data...
 * }
 * const a = new Analyser(myAnalysis);
 * ```
 *
 * Two helper functions provide ready-to-use Analysers:
 * * {@link peakLevel} peak decibel reading
 * * {@link freq} FFT results
 * * {@link basic} FFT results and waveform
 *
 * Note: Browers won't allow microphone access unless the call has come from a user-interaction, eg pointerup event handler.
 *
 */
var AudioAnalyser = /** @class */ (function () {
    function AudioAnalyser(analyse, opts) {
        if (opts === void 0) { opts = {}; }
        var _a, _b, _c, _d;
        _AudioAnalyser_isPaused.set(this, false);
        _AudioAnalyser_initInProgress.set(this, false);
        this.showVis = (_a = opts.showVis) !== null && _a !== void 0 ? _a : false;
        this.fftSize = (_b = opts.fftSize) !== null && _b !== void 0 ? _b : 1024;
        this.debug = (_c = opts.debug) !== null && _c !== void 0 ? _c : false;
        this.smoothingTimeConstant = (_d = opts.smoothingTimeConstant) !== null && _d !== void 0 ? _d : 0.8;
        (0, Guards_js_1.integer)(this.fftSize, "positive", "opts.fftSize");
        (0, Guards_js_1.number)(this.smoothingTimeConstant, "percentage", "opts.smoothingTimeConstant");
        if (!(0, Util_js_1.isPowerOfTwo)(this.fftSize))
            throw new Error("fftSize must be a power of two from 32 to 32768 (".concat(this.fftSize, ")"));
        if (this.fftSize < 32)
            throw new Error("fftSize must be at least 32");
        if (this.fftSize > 32768)
            throw new Error("fftSize must be no greater than 32768");
        this.analyse = analyse;
        this.paused = false;
        this.init();
        var visualiserEl = document.getElementById("audio-visualiser");
        if (visualiserEl) {
            var visualiser = new AudioVisualiser_js_1["default"](visualiserEl, this);
            visualiser.setExpanded(this.showVis);
            this.visualiser = visualiser;
        }
    }
    AudioAnalyser.prototype.init = function () {
        var _this = this;
        if (__classPrivateFieldGet(this, _AudioAnalyser_initInProgress, "f")) {
            if (this.debug)
                console.debug("Init already in progress");
            return;
        }
        __classPrivateFieldSet(this, _AudioAnalyser_initInProgress, true, "f");
        // Initalise microphone
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(function (stream) {
            _this.onMicSuccess(stream);
        })["catch"](function (err) {
            __classPrivateFieldSet(_this, _AudioAnalyser_initInProgress, false, "f");
            console.error(err);
        });
    };
    Object.defineProperty(AudioAnalyser.prototype, "paused", {
        get: function () {
            return __classPrivateFieldGet(this, _AudioAnalyser_isPaused, "f");
        },
        set: function (v) {
            if (v === __classPrivateFieldGet(this, _AudioAnalyser_isPaused, "f"))
                return;
            __classPrivateFieldSet(this, _AudioAnalyser_isPaused, v, "f");
            if (!v) {
                if (this.debug)
                    console.log("Unpaused");
                window.requestAnimationFrame(this.analyseLoop.bind(this));
            }
            else {
                if (this.debug)
                    console.log("Paused");
            }
        },
        enumerable: false,
        configurable: true
    });
    AudioAnalyser.prototype.setup = function (audioCtx, stream) {
        var analyser = audioCtx.createAnalyser();
        // fftSize must be a power of 2. Higher values slower, more detailed
        // Range is 32-32768
        analyser.fftSize = this.fftSize;
        // smoothingTimeConstant ranges from 0.0 to 1.0
        // 0 = no averaging. Fast response, jittery
        // 1 = maximum averaging. Slow response, smooth
        analyser.smoothingTimeConstant = this.smoothingTimeConstant;
        // Microphone -> analyser
        var micSource = audioCtx.createMediaStreamSource(stream);
        micSource.connect(analyser);
        return analyser;
    };
    // Microphone successfully initalised, now have access to audio data
    AudioAnalyser.prototype.onMicSuccess = function (stream) {
        var _this = this;
        try {
            var audioCtx_1 = new AudioContext();
            audioCtx_1.addEventListener("statechange", function () {
                if (_this.debug)
                    console.log("Audio context state: ".concat(audioCtx_1.state));
            });
            this.audioCtx = audioCtx_1;
            this.analyserNode = this.setup(audioCtx_1, stream);
            // Start loop
            window.requestAnimationFrame(this.analyseLoop.bind(this));
        }
        catch (ex) {
            __classPrivateFieldSet(this, _AudioAnalyser_initInProgress, false, "f");
            console.error(ex);
        }
    };
    AudioAnalyser.prototype.analyseLoop = function () {
        if (this.paused) {
            if (this.debug)
                console.log("Paused");
            return;
        }
        var a = this.analyserNode;
        if (a === undefined) {
            console.warn("Analyser undefined");
            return;
        }
        try {
            // Perform analysis
            this.analyse(a, this);
        }
        catch (e) {
            console.error(e);
        }
        // Run again
        window.requestAnimationFrame(this.analyseLoop.bind(this));
    };
    // visualise(wave, freq) {
    //   if (!this.visualiser) return;
    //   this.visualiser.renderWave(wave, true);
    //   this.visualiser.renderFreq(freq);
    // }
    /**
     * Returns the maximum FFT value within the given frequency range
     */
    AudioAnalyser.prototype.getFrequencyRangeMax = function (lowFreq, highFreq, freqData) {
        var samples = this.sliceByFrequency(lowFreq, highFreq, freqData);
        return index_js_1.Arrays.max(samples);
    };
    /**
     * Returns a sub-sampling of frequency analysis data that falls between
     * `lowFreq` and `highFreq`.
     * @param lowFreq Low frequency
     * @param highFreq High frequency
     * @param freqData Full-spectrum frequency data
     * @returns Sub-sampling of analysis
     */
    AudioAnalyser.prototype.sliceByFrequency = function (lowFreq, highFreq, freqData) {
        var lowIndex = this.getIndexForFrequency(lowFreq);
        var highIndex = this.getIndexForFrequency(highFreq);
        // Grab a 'slice' of the array between these indexes
        var samples = freqData.slice(lowIndex, highIndex);
        return samples;
    };
    /**
     * Returns the starting frequency for a given binned frequency index.
     * @param index Array index
     * @returns Sound frequency
     */
    AudioAnalyser.prototype.getFrequencyAtIndex = function (index) {
        var a = this.analyserNode;
        var ctx = this.audioCtx;
        if (a === undefined)
            throw new Error("Analyser not available");
        if (ctx === undefined)
            throw new Error("Audio context not available");
        (0, Guards_js_1.integer)(index, "positive", "index");
        if (index > a.frequencyBinCount)
            throw new Error("Index ".concat(index, " exceeds frequency bin count ").concat(a.frequencyBinCount));
        return index * ctx.sampleRate / (a.frequencyBinCount * 2);
    };
    /**
     * Returns a binned array index for a given frequency
     * @param freq Sound frequency
     * @returns Array index into frequency bins
     */
    AudioAnalyser.prototype.getIndexForFrequency = function (freq) {
        var a = this.analyserNode;
        if (a === undefined)
            throw new Error("Analyser not available");
        var nyquist = a.context.sampleRate / 2.0;
        var index = Math.round(freq / nyquist * a.frequencyBinCount);
        if (index < 0)
            return 0;
        if (index >= a.frequencyBinCount)
            return a.frequencyBinCount - 1;
        return index;
    };
    return AudioAnalyser;
}());
exports.AudioAnalyser = AudioAnalyser;
_AudioAnalyser_isPaused = new WeakMap(), _AudioAnalyser_initInProgress = new WeakMap();
//# sourceMappingURL=AudioAnalyser.js.map