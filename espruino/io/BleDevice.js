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
exports.BleDevice = void 0;
var Events_js_1 = require("../Events.js");
var StateMachine_js_1 = require("../flow/StateMachine.js");
var Text_js_1 = require("../Text.js");
var Codec_js_1 = require("./Codec.js");
var StringReceiveBuffer_js_1 = require("./StringReceiveBuffer.js");
var StringWriteBuffer_js_1 = require("./StringWriteBuffer.js");
var Retry_js_1 = require("../flow/Retry.js");
var reconnect = function () { return __awaiter(void 0, void 0, void 0, function () {
    var devices, _loop_1, _i, devices_1, device;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log("Connect?");
                if (!("bluetooth" in navigator))
                    return [2 /*return*/, false];
                if (!("getDevices" in navigator.bluetooth))
                    return [2 /*return*/, false];
                return [4 /*yield*/, navigator.bluetooth.getDevices()];
            case 1:
                devices = _a.sent();
                console.log(devices);
                _loop_1 = function (device) {
                    var abortController;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                console.log(device);
                                abortController = new AbortController();
                                return [4 /*yield*/, device.watchAdvertisements({ signal: abortController.signal })];
                            case 1:
                                _b.sent();
                                device.addEventListener("advertisementreceived", function (evt) { return __awaiter(void 0, void 0, void 0, function () {
                                    var _a;
                                    return __generator(this, function (_b) {
                                        switch (_b.label) {
                                            case 0:
                                                console.log(evt);
                                                // Stop the scan to conserve power on mobile devices.
                                                abortController.abort();
                                                // At this point, we know that the device is in range, and we can attempt
                                                // to connect to it.
                                                return [4 /*yield*/, ((_a = evt.device.gatt) === null || _a === void 0 ? void 0 : _a.connect())];
                                            case 1:
                                                // At this point, we know that the device is in range, and we can attempt
                                                // to connect to it.
                                                _b.sent();
                                                console.log("Connected!");
                                                return [2 /*return*/];
                                        }
                                    });
                                }); });
                                return [2 /*return*/];
                        }
                    });
                };
                _i = 0, devices_1 = devices;
                _a.label = 2;
            case 2:
                if (!(_i < devices_1.length)) return [3 /*break*/, 5];
                device = devices_1[_i];
                return [5 /*yield**/, _loop_1(device)];
            case 3:
                _a.sent();
                _a.label = 4;
            case 4:
                _i++;
                return [3 /*break*/, 2];
            case 5: return [2 /*return*/];
        }
    });
}); };
var BleDevice = /** @class */ (function (_super) {
    __extends(BleDevice, _super);
    function BleDevice(device, config) {
        var _this = _super.call(this) || this;
        _this.device = device;
        _this.config = config;
        _this.verboseLogging = false;
        _this.verboseLogging = config.debug;
        _this.txBuffer = new StringWriteBuffer_js_1.StringWriteBuffer(function (data) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.writeInternal(data)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); }, config.chunkSize);
        _this.rxBuffer = new StringReceiveBuffer_js_1.StringReceiveBuffer(function (line) {
            _this.fireEvent("data", { data: line });
        });
        _this.codec = new Codec_js_1.Codec();
        _this.states = new StateMachine_js_1.StateMachine("ready", {
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
        device.addEventListener("gattserverdisconnected", function () {
            if (_this.isClosed)
                return;
            _this.verbose("GATT server disconnected");
            _this.states.state = "closed";
        });
        _this.verbose("ctor ".concat(device.name, " ").concat(device.id));
        return _this;
    }
    Object.defineProperty(BleDevice.prototype, "isConnected", {
        get: function () {
            return this.states.state === "connected";
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BleDevice.prototype, "isClosed", {
        get: function () {
            return this.states.state === "closed";
        },
        enumerable: false,
        configurable: true
    });
    BleDevice.prototype.write = function (txt) {
        if (this.states.state !== "connected")
            throw new Error("Cannot write while state is ".concat(this.states.state));
        this.txBuffer.add(txt);
    };
    BleDevice.prototype.writeInternal = function (txt) {
        return __awaiter(this, void 0, void 0, function () {
            var tx, ex_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.verbose("writeInternal ".concat(txt));
                        tx = this.tx;
                        if (tx === undefined)
                            throw new Error("Unexpectedly without tx characteristic");
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, tx.writeValue(this.codec.toBuffer(txt))];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        ex_1 = _a.sent();
                        this.warn(ex_1);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    BleDevice.prototype.disconnect = function () {
        var _a;
        if (this.states.state !== "connected")
            return;
        (_a = this.gatt) === null || _a === void 0 ? void 0 : _a.disconnect();
    };
    BleDevice.prototype.connect = function () {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var attempts, gatt;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        attempts = (_a = this.config.connectAttempts) !== null && _a !== void 0 ? _a : 3;
                        this.states.state = "connecting";
                        this.verbose("connect");
                        gatt = this.device.gatt;
                        if (gatt === undefined)
                            throw new Error("Gatt not available on device");
                        return [4 /*yield*/, (0, Retry_js_1.retry)(function () { return __awaiter(_this, void 0, void 0, function () {
                                var server, service, rx, tx;
                                var _this = this;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, gatt.connect()];
                                        case 1:
                                            server = _a.sent();
                                            this.verbose("Getting primary service");
                                            return [4 /*yield*/, server.getPrimaryService(this.config.service)];
                                        case 2:
                                            service = _a.sent();
                                            this.verbose("Getting characteristics");
                                            return [4 /*yield*/, service.getCharacteristic(this.config.rxGattCharacteristic)];
                                        case 3:
                                            rx = _a.sent();
                                            return [4 /*yield*/, service.getCharacteristic(this.config.txGattCharacteristic)];
                                        case 4:
                                            tx = _a.sent();
                                            rx.addEventListener("characteristicvaluechanged", function (evt) { return _this.onRx(evt); });
                                            this.rx = rx;
                                            this.tx = tx;
                                            this.gatt = gatt;
                                            this.states.state = "connected";
                                            return [4 /*yield*/, rx.startNotifications()];
                                        case 5:
                                            _a.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }); }, attempts, 200)];
                    case 1:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    BleDevice.prototype.onRx = function (evt) {
        var rx = this.rx;
        if (rx === undefined)
            return;
        //eslint-disable-next-line @typescript-eslint/no-explicit-any
        var view = evt.target.value;
        if (view === undefined)
            return;
        //eslint-disable-next-line functional/no-let
        var str = this.codec.fromBuffer(view.buffer);
        // Check for flow control chars
        var plzStop = (0, Text_js_1.indexOfCharCode)(str, 19);
        var plzStart = (0, Text_js_1.indexOfCharCode)(str, 17);
        // Remove if found
        if (plzStart && plzStop < plzStart) {
            this.verbose("Tx plz start");
            str = (0, Text_js_1.omitChars)(str, plzStart, 1);
            this.txBuffer.paused = false;
        }
        if (plzStop && plzStop > plzStart) {
            this.verbose("Tx plz stop");
            str = (0, Text_js_1.omitChars)(str, plzStop, 1);
            this.txBuffer.paused = true;
        }
        this.rxBuffer.add(str);
    };
    BleDevice.prototype.verbose = function (m) {
        if (this.verboseLogging)
            console.info("".concat(this.config.name, " "), m);
    };
    BleDevice.prototype.log = function (m) {
        console.log("".concat(this.config.name, " "), m);
    };
    BleDevice.prototype.warn = function (m) {
        console.warn("".concat(this.config.name, " "), m);
    };
    return BleDevice;
}(Events_js_1.SimpleEventEmitter));
exports.BleDevice = BleDevice;
//# sourceMappingURL=BleDevice.js.map