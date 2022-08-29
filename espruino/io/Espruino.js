"use strict";
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
exports.deviceEval = exports.connectBle = exports.serial = exports.puck = exports.EspruinoSerialDevice = exports.EspruinoBleDevice = void 0;
var EspruinoBleDevice_1 = require("./EspruinoBleDevice");
exports.EspruinoBleDevice = EspruinoBleDevice_1.EspruinoBleDevice;
var NordicBleDevice_js_1 = require("./NordicBleDevice.js");
var Random_js_1 = require("../Random.js");
var WaitFor_js_1 = require("../flow/WaitFor.js");
var EspruinoSerialDevice_js_1 = require("./EspruinoSerialDevice.js");
exports.EspruinoSerialDevice = EspruinoSerialDevice_js_1.EspruinoSerialDevice;
/**
 * Instantiates a Puck.js. See {@link EspruinoBleDevice} for more info.
 * [Online demos](https://clinth.github.io/ixfx-demos/io/)
 *
 * If `opts.name` is specified, this will the the Bluetooth device sought.
 *
 * ```js
 * import { Espruino } from 'https://unpkg.com/ixfx/dist/io.js'
 * const e = await Espruino.puck({ name:`Puck.js a123` });
 * ```
 *
 * If no name is specified, a list of all devices starting with `Puck.js` are shown.
 *
 * To get more control over filtering, pass in `opts.filter`. `opts.name` is not used as a filter in this scenario.
 *
 * ```js
 * import { Espruino } from 'https://unpkg.com/ixfx/dist/io.js'
 * const filters = [
 *  { namePrefix: `Puck.js` },
 *  { namePrefix: `Pixl.js` },
 *  {services: [NordicDefaults.service] }
 * ]
 * const e = await Espruino.puck({ filters });
 * ```
 *
 * @returns Returns a connected instance, or throws exception if user cancelled or could not connect.
 */
var puck = function (opts) {
    if (opts === void 0) { opts = {}; }
    return __awaiter(void 0, void 0, void 0, function () {
        var name, debug, device, d;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    name = (_a = opts.name) !== null && _a !== void 0 ? _a : "Puck";
                    debug = (_b = opts.debug) !== null && _b !== void 0 ? _b : false;
                    return [4 /*yield*/, navigator.bluetooth.requestDevice({
                            filters: getFilters(opts),
                            optionalServices: [NordicBleDevice_js_1.defaultOpts.service]
                        })];
                case 1:
                    device = _c.sent();
                    console.log(device.name);
                    d = new EspruinoBleDevice_1.EspruinoBleDevice(device, { name: name, debug: debug });
                    return [4 /*yield*/, d.connect()];
                case 2:
                    _c.sent();
                    return [2 /*return*/, d];
            }
        });
    });
};
exports.puck = puck;
/**
 * Create a serial-connected Espruino device.
 *
 * ```js
 * import { Espruino } from 'https://unpkg.com/ixfx/dist/io.js'
 * const e = await Espruio.serial();
 * e.connect();
 * ```
 *
 * Options:
 * ```js
 * import { Espruino } from 'https://unpkg.com/ixfx/dist/io.js'
 * const e = await Espruino.serial({ debug: true, evalTimeoutMs: 1000, name: `My Pico` });
 * e.connect();
 * ```
 *
 * Listen for events:
 * ```js
 * e.addEventListener(`change`, evt => {
 *  console.log(`State change ${evt.priorState} -> ${evt.newState}`);
 *  if (evt.newState === `connected`) {
 *    // Do something when connected...
 *  }
 * });
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
 * @param opts
 * @returns Returns a connected instance, or throws exception if user cancelled or could not connect.
 */
var serial = function (opts) {
    if (opts === void 0) { opts = {}; }
    return __awaiter(void 0, void 0, void 0, function () {
        var d;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    d = new EspruinoSerialDevice_js_1.EspruinoSerialDevice(opts);
                    return [4 /*yield*/, d.connect()];
                case 1:
                    _a.sent();
                    return [2 /*return*/, d];
            }
        });
    });
};
exports.serial = serial;
/**
 * Returns a list of BLE scan filters, given the
 * connect options.
 * @param opts
 * @returns
 */
var getFilters = function (opts) {
    //eslint-disable-next-line functional/no-let
    var filters = [];
    if (opts.filters) {
        //eslint-disable-next-line functional/immutable-data
        filters.push.apply(filters, opts.filters);
    }
    else if (opts.name) {
        // Name filter
        //eslint-disable-next-line functional/immutable-data
        filters.push({ name: opts.name });
        console.info("Filtering Bluetooth devices by name '".concat(opts.name, "'"));
    }
    else {
        // Default filter
        //eslint-disable-next-line functional/immutable-data
        filters.push({ namePrefix: "Puck.js" });
    }
    // {namePrefix: 'Pixl.js'},
    // {namePrefix: 'MDBT42Q'},
    // {namePrefix: 'RuuviTag'},
    // {namePrefix: 'iTracker'},
    // {namePrefix: 'Thingy'},
    // {namePrefix: 'Espruino'},
    //{services: [NordicDefaults.service]}
    return filters;
};
/**
 * Connects to a generic Espruino BLE device. See  {@link EspruinoBleDevice} for more info.
 * Use {@link puck} if you're connecting to a Puck.js
 *
 * If `opts.name` is specified, only this BLE device will be shown.
 * ```js
 * const e = await connectBle({ name: `Puck.js a123` });
 * ```
 *
 * `opts.filters` overrides and sets arbitary filters.
 *
 * ```js
 * import { Espruino } from 'https://unpkg.com/ixfx/dist/io.js'
 * const filters = [
 *  { namePrefix: `Puck.js` },
 *  { namePrefix: `Pixl.js` },
 *  {services: [NordicDefaults.service] }
 * ]
 * const e = await Espruino.connectBle({ filters });
 * ```
 *
 * @returns Returns a connected instance, or throws exception if user cancelled or could not connect.
 */
var connectBle = function (opts) {
    if (opts === void 0) { opts = {}; }
    return __awaiter(void 0, void 0, void 0, function () {
        var device, d;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, navigator.bluetooth.requestDevice({
                        filters: getFilters(opts),
                        optionalServices: [NordicBleDevice_js_1.defaultOpts.service]
                    })];
                case 1:
                    device = _a.sent();
                    d = new EspruinoBleDevice_1.EspruinoBleDevice(device, { name: "Espruino" });
                    return [4 /*yield*/, d.connect()];
                case 2:
                    _a.sent();
                    return [2 /*return*/, d];
            }
        });
    });
};
exports.connectBle = connectBle;
var deviceEval = function (code, opts, device, evalReplyPrefix, debug, warn) {
    if (opts === void 0) { opts = {}; }
    return __awaiter(void 0, void 0, void 0, function () {
        var timeoutMs, assumeExclusive;
        var _a, _b;
        return __generator(this, function (_c) {
            timeoutMs = (_a = opts.timeoutMs) !== null && _a !== void 0 ? _a : device.evalTimeoutMs;
            assumeExclusive = (_b = opts.assumeExclusive) !== null && _b !== void 0 ? _b : true;
            if (typeof code !== "string")
                throw new Error("code parameter should be a string");
            return [2 /*return*/, new Promise(function (resolve, reject) {
                    // Generate a random id so reply can be matched up with this request
                    var id = (0, Random_js_1.string)(5);
                    var onData = function (d) {
                        try {
                            // Parse reply, expecting JSON.
                            var dd = JSON.parse(d.data);
                            // Check for reply field, and that it matches
                            if ("reply" in dd) {
                                if (dd.reply === id) {
                                    done(); // Stop waiting for result
                                    if ("result" in dd) {
                                        resolve(dd.result);
                                    }
                                }
                                else {
                                    warn("Expected reply ".concat(id, ", got ").concat(dd.reply));
                                }
                            }
                        }
                        catch (ex) {
                            // If there was a syntax error, response won't be JSON
                            if (assumeExclusive) {
                                // Fail with unexpected reply as the message
                                done(d.data);
                            }
                            else {
                                // Unexpected reply, but we cannot be sure if it's in response to eval or
                                // some other code running on board. So just warn and eventually timeout
                                warn(ex);
                            }
                        }
                    };
                    var onStateChange = function (e) {
                        if (e.newState !== "connected")
                            done("State changed to '".concat(e.newState, "', aborting"));
                    };
                    device.addEventListener("data", onData);
                    device.addEventListener("change", onStateChange);
                    // Init waitFor
                    var done = (0, WaitFor_js_1.waitFor)(timeoutMs, function (reason) {
                        reject(reason);
                    }, function () {
                        // If we got a response or there was a timeout, remove event listeners
                        device.removeEventListener("data", onData);
                        device.removeEventListener("change", onStateChange);
                    });
                    var src = "\u0010".concat(evalReplyPrefix, "(JSON.stringify({reply:\"").concat(id, "\", result:JSON.stringify(").concat(code, ")}))\n");
                    if (debug)
                        warn(src);
                    device.write(src);
                })];
        });
    });
};
exports.deviceEval = deviceEval;
//# sourceMappingURL=Espruino.js.map