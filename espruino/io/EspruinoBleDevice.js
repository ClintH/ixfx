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
exports.EspruinoBleDevice = void 0;
var Espruino_js_1 = require("./Espruino.js");
var NordicBleDevice_js_1 = require("./NordicBleDevice.js");
/**
 * An Espruino BLE-connection
 *
 * See [online demos](https://clinth.github.io/ixfx-demos/io/)
 *
 * Use the `puck` function to initialise and connect to a Puck.js.
 * It must be called in a UI event handler for browser security reasons.
 *
 * ```js
 * import { Espruino } from 'https://unpkg.com/ixfx/dist/io.js'
 * const e = await Espruino.puck();
 * ```
 *
 * To connect to a particular device:
 *
 * ```js
 * import { Espruino } from 'https://unpkg.com/ixfx/dist/io.js'
 * const e = await Espruino.puck({name:`Puck.js a123`});
 * ```
 *
 * Listen for events:
 * ```js
 * // Received something
 * e.addEventListener(`data`, d => console.log(d.data));
 * // Monitor connection state
 * e.addEventListener(`change`, c => console.log(`${d.priorState} -> ${d.newState}`));
 * ```
 *
 * Write to the device (note the \n for a new line at the end of the string). This will
 * execute the code on the Espruino.
 *
 * ```js
 * e.write(`digitalPulse(LED1,1,[10,500,10,500,10]);\n`);
 * ```
 *
 * Run some code and return result:
 * ```js
 * const result = await e.eval(`2+2\n`);
 * ```
 */
var EspruinoBleDevice = /** @class */ (function (_super) {
    __extends(EspruinoBleDevice, _super);
    /**
     * Creates instance. You probably would rather use {@link puck} to create.
     * @param device
     * @param opts
     */
    function EspruinoBleDevice(device, opts) {
        if (opts === void 0) { opts = {}; }
        var _this = this;
        var _a;
        _this = _super.call(this, device, opts) || this;
        _this.evalReplyBluetooth = true;
        _this.evalTimeoutMs = (_a = opts.evalTimeoutMs) !== null && _a !== void 0 ? _a : 5 * 1000;
        return _this;
    }
    /**
     * Writes a script to Espruino.
     *
     * It will first send a CTRL+C to cancel any previous input, `reset()` to clear the board,
     * and then the provided `code` followed by a new line.
     *
     * Use {@link eval} instead to execute remote code and get the result back.
     *
     * ```js
     * // Eg from https://www.espruino.com/Web+Bluetooth
     * writeScript(`
     *  setInterval(() => Bluetooth.println(E.getTemperature()), 1000);
     *  NRF.on('disconnect',()=>reset());
     * `);
     * ```
     *
     * @param code Code to send. A new line is added automatically.
     */
    EspruinoBleDevice.prototype.writeScript = function (code) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.write("\u0003\u0010reset();\n");
                this.write("\u0010".concat(code, "\n"));
                return [2 /*return*/];
            });
        });
    };
    /**
     * Sends some code to be executed on the Espruino. The result
     * is packaged into JSON and sent back to your code. An exception is
     * thrown if code can't be executed for some reason.
     *
     * ```js
     * const sum = await e.eval(`2+2`);
     * ```
     *
     * It will wait for a period of time for a well-formed response from the
     * Espruino. This might not happen if there is a connection problem
     * or a syntax error in the code being evaled. In cases like the latter,
     * it will take up to `timeoutMs` (default 5 seconds) before we give up
     * waiting for a correct response and throw an error.
     *
     * Tweaking of the timeout may be required if `eval()` is giving up too quickly
     * or too slowly. A default timeout can be given when creating the class.
     *
     * Options:
     *  timeoutMs: Timeout for execution. 5 seconds by default
     *  assumeExclusive If true, eval assumes all replies from controller are in response to eval. True by default
     * @param code Code to run on the Espruino.
     * @param opts Options
     */
    EspruinoBleDevice.prototype.eval = function (code, opts) {
        if (opts === void 0) { opts = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, (0, Espruino_js_1.deviceEval)(code, opts, this, "Bluetooth.println", false, function (msg) {
                        _this.warn(msg);
                    })];
            });
        });
    };
    return EspruinoBleDevice;
}(NordicBleDevice_js_1.NordicBleDevice));
exports.EspruinoBleDevice = EspruinoBleDevice;
//# sourceMappingURL=EspruinoBleDevice.js.map