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
exports.__esModule = true;
exports.Serial = exports.FrameProcessor = exports.Camera = exports.Espruino = exports.Codec = exports.StringWriteBuffer = exports.StringReceiveBuffer = exports.AudioVisualisers = exports.AudioAnalysers = exports.Bluetooth = void 0;
/**
 * Generic support for Bluetooth LE devices
 */
exports.Bluetooth = __importStar(require("./NordicBleDevice.js"));
exports.AudioAnalysers = __importStar(require("./AudioAnalyser.js"));
exports.AudioVisualisers = __importStar(require("./AudioVisualiser.js"));
var StringReceiveBuffer_js_1 = require("./StringReceiveBuffer.js");
__createBinding(exports, StringReceiveBuffer_js_1, "StringReceiveBuffer");
var StringWriteBuffer_js_1 = require("./StringWriteBuffer.js");
__createBinding(exports, StringWriteBuffer_js_1, "StringWriteBuffer");
var Codec_js_1 = require("./Codec.js");
__createBinding(exports, Codec_js_1, "Codec");
/**
 * Espruino-based devices connected via Bluetooth LE
 *
 * See [demos](https://clinth.github.io/ixfx-demos/io/)
 *
 * Overview:
 * * {@link puck}: Connects a [Espruino BLE Device](../classes/Io.Espruino.EspruinoBleDevice.html).
 * * {@link Espruino.connectBle}: Connect to a generic Espruino via BLE
 */
exports.Espruino = __importStar(require("./Espruino.js"));
exports.Camera = __importStar(require("./Camera.js"));
var FrameProcessor_1 = require("./FrameProcessor");
__createBinding(exports, FrameProcessor_1, "FrameProcessor");
/**
 * Microcontrollers such as Arduinos connected via USB serial
 *
 * Overview
 * * {@link Serial.Device}
 *
 */
exports.Serial = __importStar(require("./Serial.js"));
//# sourceMappingURL=index.js.map