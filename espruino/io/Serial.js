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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
exports.__esModule = true;
exports.Device = void 0;
var JsonDevice_js_1 = require("./JsonDevice.js");
/**
 * Serial device. Assumes data is sent with new line characters (\r\n) between messages.
 *
 * ```
 * const s = new Device();
 * s.addEventListener(`change`, evt => {
 *  console.log(`State change ${evt.priorState} -> ${evt.newState}`);
 *  if (evt.newState === `connected`) {
 *    // Do something when connected...
 *  }
 * });
 *
 * // In a UI event handler...
 * s.connect();
 * ```
 *
 * Reading incoming data:
 * ```
 * // Parse incoming data as JSON
 * s.addEventListener(`data`, evt => {
 *  try {
 *    const o = JSON.parse(evt.data);
 *    // If we get this far, JSON is legit
 *  } catch (ex) {
 *  }
 * });
 * ```
 *
 * Writing to the microcontroller
 * ```
 * s.write(JSON.stringify({msg:"hello"}));
 * ```
 */
var Device = /** @class */ (function (_super) {
    __extends(Device, _super);
    function Device(config) {
        if (config === void 0) { config = {}; }
        var _this = this;
        var _a, _b;
        _this = _super.call(this, config) || this;
        _this.config = config;
        var eol = (_a = config.eol) !== null && _a !== void 0 ? _a : "\r\n";
        _this.baudRate = (_b = config.baudRate) !== null && _b !== void 0 ? _b : 9600;
        if (config.name === undefined)
            _super.prototype.name = "Serial.Device";
        // Serial.println on microcontroller == \r\n
        _this.rxBuffer.separator = eol;
        return _this;
    }
    /**
     * Writes text collected in buffer
     * @param txt
     */
    Device.prototype.writeInternal = function (txt) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (this.tx === undefined)
                    throw new Error("tx not ready");
                try {
                    this.tx.write(txt);
                }
                catch (ex) {
                    this.warn(ex);
                }
                return [2 /*return*/];
            });
        });
    };
    Device.prototype.onClosed = function () {
        var _a;
        try {
            (_a = this.port) === null || _a === void 0 ? void 0 : _a.close();
        }
        catch (ex) {
            this.warn(ex);
        }
        this.states.state = "closed";
    };
    Device.prototype.onPreConnect = function () {
        return Promise.resolve();
    };
    Device.prototype.onConnectAttempt = function () {
        return __awaiter(this, void 0, void 0, function () {
            var reqOpts, openOpts, _a, txW, txText, rxR, rxText;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        reqOpts = {};
                        openOpts = {
                            baudRate: this.baudRate
                        };
                        if (this.config.filters)
                            reqOpts = { filters: __spreadArray([], this.config.filters, true) };
                        _a = this;
                        return [4 /*yield*/, navigator.serial.requestPort(reqOpts)];
                    case 1:
                        _a.port = _b.sent();
                        this.port.addEventListener("disconnect", function (_) {
                            _this.close();
                        });
                        return [4 /*yield*/, this.port.open(openOpts)];
                    case 2:
                        _b.sent();
                        txW = this.port.writable;
                        txText = new TextEncoderStream();
                        if (txW !== null) {
                            txText.readable.pipeTo(txW);
                            this.tx = txText.writable.getWriter();
                        }
                        rxR = this.port.readable;
                        rxText = new TextDecoderStream();
                        if (rxR !== null) {
                            rxR.pipeTo(rxText.writable);
                            rxText.readable.pipeTo(this.rxBuffer.writable());
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    return Device;
}(JsonDevice_js_1.JsonDevice));
exports.Device = Device;
//# sourceMappingURL=Serial.js.map