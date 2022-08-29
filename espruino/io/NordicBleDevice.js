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
exports.__esModule = true;
exports.NordicBleDevice = exports.defaultOpts = void 0;
var BleDevice_js_1 = require("./BleDevice.js");
exports.defaultOpts = {
    chunkSize: 20,
    service: "6e400001-b5a3-f393-e0a9-e50e24dcca9e",
    txGattCharacteristic: "6e400002-b5a3-f393-e0a9-e50e24dcca9e",
    rxGattCharacteristic: "6e400003-b5a3-f393-e0a9-e50e24dcca9e",
    name: "NordicDevice",
    connectAttempts: 5,
    debug: false
};
var NordicBleDevice = /** @class */ (function (_super) {
    __extends(NordicBleDevice, _super);
    function NordicBleDevice(device, opts) {
        if (opts === void 0) { opts = {}; }
        return _super.call(this, device, __assign(__assign({}, exports.defaultOpts), opts)) || this;
    }
    return NordicBleDevice;
}(BleDevice_js_1.BleDevice));
exports.NordicBleDevice = NordicBleDevice;
//# sourceMappingURL=NordicBleDevice.js.map