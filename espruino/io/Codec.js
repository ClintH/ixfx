"use strict";
exports.__esModule = true;
exports.Codec = void 0;
/**
 * Handles utf-8 text encoding/decoding
 */
var Codec = /** @class */ (function () {
    function Codec() {
        this.enc = new TextEncoder();
        this.dec = new TextDecoder("utf-8");
    }
    /**
     * Convert string to Uint8Array buffer
     * @param str
     * @returns
     */
    Codec.prototype.toBuffer = function (str) {
        return this.enc.encode(str);
    };
    /**
     * Returns a string from a provided buffer
     * @param buffer
     * @returns
     */
    Codec.prototype.fromBuffer = function (buffer) {
        return this.dec.decode(buffer);
    };
    return Codec;
}());
exports.Codec = Codec;
//# sourceMappingURL=Codec.js.map