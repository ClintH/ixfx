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
exports.JsonDevice = void 0;
var Events_js_1 = require("../Events.js");
var StateMachine_1 = require("../flow/StateMachine");
var Text_1 = require("../Text");
var Codec_1 = require("./Codec");
var StringReceiveBuffer_1 = require("./StringReceiveBuffer");
var StringWriteBuffer_1 = require("./StringWriteBuffer");
var Retry_js_1 = require("../flow/Retry.js");
var JsonDevice = /** @class */ (function (_super) {
    __extends(JsonDevice, _super);
    function JsonDevice(config) {
        if (config === void 0) { config = {}; }
        var _this = this;
        var _a, _b, _c, _d;
        _this = _super.call(this) || this;
        _this.verboseLogging = false;
        // Init
        _this.verboseLogging = (_a = config.debug) !== null && _a !== void 0 ? _a : false;
        _this.chunkSize = (_b = config.chunkSize) !== null && _b !== void 0 ? _b : 1024;
        _this.connectAttempts = (_c = config.connectAttempts) !== null && _c !== void 0 ? _c : 3;
        _this.name = (_d = config.name) !== null && _d !== void 0 ? _d : "JsonDevice";
        // Transmit buffer
        _this.txBuffer = new StringWriteBuffer_1.StringWriteBuffer(function (data) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: 
                    // When we have data to actually write to device
                    return [4 /*yield*/, this.writeInternal(data)];
                    case 1:
                        // When we have data to actually write to device
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); }, config.chunkSize);
        // Receive buffer
        _this.rxBuffer = new StringReceiveBuffer_1.StringReceiveBuffer(function (line) {
            _this.fireEvent("data", { data: line });
        });
        _this.codec = new Codec_1.Codec();
        _this.states = new StateMachine_1.StateMachine("ready", {
            ready: "connecting",
            connecting: ["connected", "closed"],
            connected: ["closed"],
            closed: "connecting"
        });
        _this.states.addEventListener("change", function (evt) {
            _this.fireEvent("change", evt);
            _this.verbose("".concat(evt.priorState, " -> ").concat(evt.newState));
            if (evt.priorState === "connected") {
                // Clear out buffers
                _this.rxBuffer.clear();
                _this.txBuffer.clear();
            }
        });
        return _this;
    }
    Object.defineProperty(JsonDevice.prototype, "isConnected", {
        get: function () {
            return this.states.state === "connected";
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(JsonDevice.prototype, "isClosed", {
        get: function () {
            return this.states.state === "closed";
        },
        enumerable: false,
        configurable: true
    });
    JsonDevice.prototype.write = function (txt) {
        if (this.states.state !== "connected")
            throw new Error("Cannot write while state is ".concat(this.states.state));
        this.txBuffer.add(txt);
    };
    JsonDevice.prototype.close = function () {
        if (this.states.state !== "connected")
            return;
        this.onClosed();
    };
    JsonDevice.prototype.connect = function () {
        return __awaiter(this, void 0, void 0, function () {
            var attempts;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        attempts = this.connectAttempts;
                        this.states.state = "connecting";
                        return [4 /*yield*/, this.onPreConnect()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, (0, Retry_js_1.retry)(function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, this.onConnectAttempt()];
                                        case 1:
                                            _a.sent();
                                            this.states.state = "connected";
                                            return [2 /*return*/];
                                    }
                                });
                            }); }, attempts, 200)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    JsonDevice.prototype.onRx = function (evt) {
        //const rx = this.rx;
        //if (rx === undefined) return;
        //eslint-disable-next-line @typescript-eslint/no-explicit-any
        var view = evt.target.value;
        if (view === undefined)
            return;
        //eslint-disable-next-line functional/no-let
        var str = this.codec.fromBuffer(view.buffer);
        // Check for flow control chars
        var plzStop = (0, Text_1.indexOfCharCode)(str, 19);
        var plzStart = (0, Text_1.indexOfCharCode)(str, 17);
        // Remove if found
        if (plzStart && plzStop < plzStart) {
            this.verbose("Tx plz start");
            str = (0, Text_1.omitChars)(str, plzStart, 1);
            this.txBuffer.paused = false;
        }
        if (plzStop && plzStop > plzStart) {
            this.verbose("Tx plz stop");
            str = (0, Text_1.omitChars)(str, plzStop, 1);
            this.txBuffer.paused = true;
        }
        this.rxBuffer.add(str);
    };
    JsonDevice.prototype.verbose = function (m) {
        if (this.verboseLogging)
            console.info("".concat(this.name, " "), m);
    };
    JsonDevice.prototype.log = function (m) {
        console.log("".concat(this.name, " "), m);
    };
    JsonDevice.prototype.warn = function (m) {
        console.warn("".concat(this.name, " "), m);
    };
    return JsonDevice;
}(Events_js_1.SimpleEventEmitter));
exports.JsonDevice = JsonDevice;
//# sourceMappingURL=JsonDevice.js.map