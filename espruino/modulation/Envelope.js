"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
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
var _AdsrBase_sm, _AdsrBase_timeSource, _AdsrBase_timer, _AdsrBase_holding, _AdsrBase_holdingInitial;
exports.__esModule = true;
exports.adsrSample = exports.adsr = exports.defaultAdsrOpts = void 0;
var Events_js_1 = require("../Events.js");
var index_js_1 = require("../flow/index.js");
var StateMachine_js_1 = require("../flow/StateMachine.js");
var Bezier = __importStar(require("../geometry/Bezier.js"));
var Scale_js_1 = require("../data/Scale.js");
/**
 * @returns Returns a full set of default ADSR options
 */
var defaultAdsrOpts = function () { return ({
    attackBend: -1,
    decayBend: -.3,
    releaseBend: -.3,
    peakLevel: 1,
    initialLevel: 0,
    sustainLevel: 0.6,
    releaseLevel: 0,
    attackDuration: 600,
    decayDuration: 200,
    releaseDuration: 800,
    shouldLoop: false
}); };
exports.defaultAdsrOpts = defaultAdsrOpts;
var AdsrBase = /** @class */ (function (_super) {
    __extends(AdsrBase, _super);
    function AdsrBase(opts) {
        var _this = this;
        var _a, _b, _c, _d;
        _this = _super.call(this) || this;
        _AdsrBase_sm.set(_this, void 0);
        _AdsrBase_timeSource.set(_this, void 0);
        _AdsrBase_timer.set(_this, void 0);
        _AdsrBase_holding.set(_this, void 0);
        _AdsrBase_holdingInitial.set(_this, void 0);
        _this.attackDuration = (_a = opts.attackDuration) !== null && _a !== void 0 ? _a : 300;
        _this.decayDuration = (_b = opts.decayDuration) !== null && _b !== void 0 ? _b : 500;
        _this.releaseDuration = (_c = opts.releaseDuration) !== null && _c !== void 0 ? _c : 1000;
        _this.shouldLoop = (_d = opts.shouldLoop) !== null && _d !== void 0 ? _d : false;
        var descr = {
            attack: ["decay", "release"],
            decay: ["sustain", "release"],
            sustain: ["release"],
            release: ["complete"],
            complete: null
        };
        __classPrivateFieldSet(_this, _AdsrBase_sm, new StateMachine_js_1.StateMachine("attack", descr), "f");
        __classPrivateFieldGet(_this, _AdsrBase_sm, "f").addEventListener("change", (function (ev) {
            var _a;
            // Reset timer on release
            if (ev.newState === "release" && __classPrivateFieldGet(_this, _AdsrBase_holdingInitial, "f")) {
                (_a = __classPrivateFieldGet(_this, _AdsrBase_timer, "f")) === null || _a === void 0 ? void 0 : _a.reset();
            }
            _super.prototype.fireEvent.call(_this, "change", ev);
        }));
        __classPrivateFieldGet(_this, _AdsrBase_sm, "f").addEventListener("stop", (function (ev) {
            _super.prototype.fireEvent.call(_this, "complete", ev);
        }));
        __classPrivateFieldSet(_this, _AdsrBase_timeSource, index_js_1.msElapsedTimer, "f");
        __classPrivateFieldSet(_this, _AdsrBase_holding, __classPrivateFieldSet(_this, _AdsrBase_holdingInitial, false, "f"), "f");
        _this.decayDurationTotal = _this.attackDuration + _this.decayDuration;
        return _this;
    }
    AdsrBase.prototype.switchState = function () {
        var _a;
        if (__classPrivateFieldGet(this, _AdsrBase_timer, "f") === undefined)
            return false;
        // eslint-disable-next-line functional/no-let
        var elapsed = __classPrivateFieldGet(this, _AdsrBase_timer, "f").elapsed;
        var wasHeld = __classPrivateFieldGet(this, _AdsrBase_holdingInitial, "f") && !__classPrivateFieldGet(this, _AdsrBase_holding, "f");
        // Change through states for as long as needed
        // eslint-disable-next-line functional/no-let
        var hasChanged = false;
        do {
            hasChanged = false;
            switch (__classPrivateFieldGet(this, _AdsrBase_sm, "f").state) {
                case "attack":
                    if (elapsed > this.attackDuration || wasHeld) {
                        __classPrivateFieldGet(this, _AdsrBase_sm, "f").next();
                        hasChanged = true;
                    }
                    break;
                case "decay":
                    if (elapsed > this.decayDurationTotal || wasHeld) {
                        __classPrivateFieldGet(this, _AdsrBase_sm, "f").next();
                        hasChanged = true;
                    }
                    break;
                case "sustain":
                    if (!__classPrivateFieldGet(this, _AdsrBase_holding, "f") || wasHeld) {
                        elapsed = 0;
                        __classPrivateFieldGet(this, _AdsrBase_sm, "f").next();
                        (_a = __classPrivateFieldGet(this, _AdsrBase_timer, "f")) === null || _a === void 0 ? void 0 : _a.reset();
                        hasChanged = true;
                    }
                    break;
                case "release":
                    if (elapsed > this.releaseDuration) {
                        __classPrivateFieldGet(this, _AdsrBase_sm, "f").next();
                        hasChanged = true;
                    }
                    break;
                case "complete":
                    if (this.shouldLoop) {
                        this.trigger(__classPrivateFieldGet(this, _AdsrBase_holdingInitial, "f"));
                    }
            }
        } while (hasChanged);
        return hasChanged;
    };
    /**
     * Computes a stage progress from 0-1
     * @param allowStateChange
     * @returns
     */
    AdsrBase.prototype.computeRaw = function (allowStateChange) {
        if (allowStateChange === void 0) { allowStateChange = true; }
        if (__classPrivateFieldGet(this, _AdsrBase_timer, "f") === undefined)
            return [undefined, 0, __classPrivateFieldGet(this, _AdsrBase_sm, "f").state];
        // Change state if necessary based on elapsed time
        if (allowStateChange)
            this.switchState();
        var prevStage = __classPrivateFieldGet(this, _AdsrBase_sm, "f").state;
        var elapsed = __classPrivateFieldGet(this, _AdsrBase_timer, "f").elapsed;
        // eslint-disable-next-line functional/no-let
        var relative = 0;
        var state = __classPrivateFieldGet(this, _AdsrBase_sm, "f").state;
        switch (state) {
            case "attack":
                relative = elapsed / this.attackDuration;
                break;
            case "decay":
                relative = (elapsed - this.attackDuration) / this.decayDuration;
                break;
            case "sustain":
                relative = 1;
                break;
            case "release":
                relative = Math.min(elapsed / this.releaseDuration, 1);
                break;
            case "complete":
                return [undefined, 1, prevStage];
            default:
                throw new Error("State machine in unknown state: ".concat(state));
        }
        return [state, relative, prevStage];
    };
    Object.defineProperty(AdsrBase.prototype, "isDone", {
        get: function () {
            return __classPrivateFieldGet(this, _AdsrBase_sm, "f").isDone;
        },
        enumerable: false,
        configurable: true
    });
    AdsrBase.prototype.onTrigger = function () {
        /* no op */
    };
    AdsrBase.prototype.trigger = function (hold) {
        if (hold === void 0) { hold = false; }
        this.onTrigger();
        __classPrivateFieldGet(this, _AdsrBase_sm, "f").reset();
        __classPrivateFieldSet(this, _AdsrBase_timer, __classPrivateFieldGet(this, _AdsrBase_timeSource, "f").call(this), "f");
        __classPrivateFieldSet(this, _AdsrBase_holding, hold, "f");
        __classPrivateFieldSet(this, _AdsrBase_holdingInitial, hold, "f");
    };
    AdsrBase.prototype.compute = function () {
        /* no-op */
    };
    AdsrBase.prototype.release = function () {
        if (this.isDone || !__classPrivateFieldGet(this, _AdsrBase_holdingInitial, "f"))
            return; // Was never holding or done
        // Setting holding flag to false, computeRaw will change state
        __classPrivateFieldSet(this, _AdsrBase_holding, false, "f");
        this.compute();
    };
    return AdsrBase;
}(Events_js_1.SimpleEventEmitter));
_AdsrBase_sm = new WeakMap(), _AdsrBase_timeSource = new WeakMap(), _AdsrBase_timer = new WeakMap(), _AdsrBase_holding = new WeakMap(), _AdsrBase_holdingInitial = new WeakMap();
var AdsrImpl = /** @class */ (function (_super) {
    __extends(AdsrImpl, _super);
    function AdsrImpl(opts) {
        var _this = this;
        var _a, _b, _c, _d, _e, _f, _g, _h;
        _this = _super.call(this, opts) || this;
        _this.initialLevel = (_a = opts.initialLevel) !== null && _a !== void 0 ? _a : 0;
        _this.peakLevel = (_b = opts.peakLevel) !== null && _b !== void 0 ? _b : 1;
        _this.releaseLevel = (_c = opts.releaseLevel) !== null && _c !== void 0 ? _c : 0;
        _this.sustainLevel = (_d = opts.sustainLevel) !== null && _d !== void 0 ? _d : 0.75;
        _this.retrigger = (_e = opts.retrigger) !== null && _e !== void 0 ? _e : true;
        _this.attackBend = (_f = opts.attackBend) !== null && _f !== void 0 ? _f : 0;
        _this.releaseBend = (_g = opts.releaseBend) !== null && _g !== void 0 ? _g : 0;
        _this.decayBend = (_h = opts.decayBend) !== null && _h !== void 0 ? _h : 0;
        var max = 1;
        _this.attackPath = Bezier.toPath(Bezier.quadraticSimple({ x: 0, y: _this.initialLevel }, { x: max, y: _this.peakLevel }, -_this.attackBend));
        _this.decayPath = Bezier.toPath(Bezier.quadraticSimple({ x: 0, y: _this.peakLevel }, { x: max, y: _this.sustainLevel }, -_this.decayBend));
        _this.releasePath = Bezier.toPath(Bezier.quadraticSimple({ x: 0, y: _this.sustainLevel }, { x: max, y: _this.releaseLevel }, -_this.releaseBend));
        return _this;
    }
    AdsrImpl.prototype.onTrigger = function () {
        this.initialLevelOverride = undefined;
        if (!this.retrigger) {
            var _a = this.compute(), _stage = _a[0], scaled = _a[1], _raw = _a[2];
            if (!Number.isNaN(scaled) && scaled > 0) {
                //console.log(`Retrigger. Last value was: ${scaled}`);
                this.initialLevelOverride = scaled;
            }
        }
    };
    Object.defineProperty(AdsrImpl.prototype, "value", {
        get: function () {
            return this.compute(true)[1];
        },
        enumerable: false,
        configurable: true
    });
    AdsrImpl.prototype.compute = function (allowStateChange) {
        if (allowStateChange === void 0) { allowStateChange = true; }
        var _a = _super.prototype.computeRaw.call(this, allowStateChange), stage = _a[0], amt = _a[1];
        if (stage === undefined)
            return [undefined, NaN, NaN];
        // eslint-disable-next-line functional/no-let
        var v;
        switch (stage) {
            case "attack":
                v = this.attackPath.interpolate(amt).y;
                if (this.initialLevelOverride !== undefined) {
                    v = (0, Scale_js_1.scale)(v, 0, 1, this.initialLevelOverride, 1);
                }
                this.releasedAt = v;
                break;
            case "decay":
                v = this.decayPath.interpolate(amt).y;
                this.releasedAt = v;
                break;
            case "sustain":
                v = this.sustainLevel;
                this.releasedAt = v;
                break;
            case "release":
                v = this.releasePath.interpolate(amt).y;
                // Bound release level to the amp level that we released at.
                // ie. when release happens before a stage completes
                if (this.releasedAt !== undefined)
                    v = (0, Scale_js_1.scale)(v, 0, this.sustainLevel, 0, this.releasedAt);
                break;
            case "complete":
                v = this.releaseLevel;
                this.releasedAt = undefined;
                break;
            default:
                throw new Error("Unknown state: ".concat(stage));
        }
        return [stage, v, amt];
    };
    return AdsrImpl;
}(AdsrBase));
/**
 * Creates an {@link Adsr} envelope.
 * @param opts
 * @returns New {@link Adsr} Envelope
 */
var adsr = function (opts) { return new AdsrImpl(opts); };
exports.adsr = adsr;
/**
 * Creates and runs an envelope, sampling its values at `sampleRateMs`.
 *
 * ```
 * import {adsrSample, defaultAdsrOpts} from 'https://unpkg.com/ixfx/dist/modulation.js';
 * import {IterableAsync} from  'https://unpkg.com/ixfx/dist/util.js';
 *
 * const opts = {
 *  ...defaultAdsrOpts(),
 *  attackDuration: 1000,
 *  releaseDuration: 1000,
 *  sustainLevel: 1,
 *  attackBend: 1,
 *  decayBend: -1
 * };
 *
 * // Sample an envelope every 5ms into an array
 * const data = await IterableAsync.toArray(adsrSample(opts, 20));
 *
 * // Work with values as sampled
 * for await (const v of adsrSample(opts, 5)) {
 *  // Work with envelope value `v`...
 * }
 * ```
 * @param opts Envelope options
 * @param sampleRateMs Sample rate
 * @returns
 */
//eslint-disable-next-line func-style
function adsrSample(opts, sampleRateMs) {
    return __asyncGenerator(this, arguments, function adsrSample_1() {
        var env, v;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (opts.shouldLoop)
                        throw new Error("Cannot sample a looping envelope");
                    env = (0, exports.adsr)(opts);
                    env.trigger();
                    _a.label = 1;
                case 1:
                    if (!true) return [3 /*break*/, 7];
                    return [4 /*yield*/, __await((0, index_js_1.sleep)(sampleRateMs))];
                case 2:
                    _a.sent();
                    v = env.value;
                    if (!env.isDone) return [3 /*break*/, 4];
                    return [4 /*yield*/, __await(void 0)];
                case 3: return [2 /*return*/, _a.sent()];
                case 4: return [4 /*yield*/, __await(v)];
                case 5: return [4 /*yield*/, _a.sent()];
                case 6:
                    _a.sent();
                    return [3 /*break*/, 1];
                case 7: return [2 /*return*/];
            }
        });
    });
}
exports.adsrSample = adsrSample;
// export function* adsrSample (opts:EnvelopeOpts, sampleRateMs:number) {
//   if (opts.shouldLoop) throw new Error(`Cannot sample a looping envelope`);
//   const env = adsr(opts);
//   //const data:number[] = [];
//   //eslint-disable-next-line functional/no-let
//   let started = false;
//   return new Promise<number[]>((resolve, _reject) => {
//     continuously(() => {
//       if (!started) {
//         started = true;
//         env.trigger();
//       }
//       const v = env.value;
//       //eslint-disable-next-line functional/immutable-data
//       if (!Number.isNaN(v)) yield env.value;// data.push(env.value);
//       if (env.isDone) {
//         resolve(data);
//         return false;
//       }
//     }, sampleRateMs).start();
//   });
// };
//# sourceMappingURL=Envelope.js.map