"use strict";
exports.__esModule = true;
exports.StringReceiveBuffer = void 0;
/**
 * Receives text
 */
var StringReceiveBuffer = /** @class */ (function () {
    function StringReceiveBuffer(onData, separator) {
        if (separator === void 0) { separator = "\n"; }
        this.onData = onData;
        this.separator = separator;
        this.buffer = "";
    }
    StringReceiveBuffer.prototype.clear = function () {
        this.buffer = "";
    };
    StringReceiveBuffer.prototype.writable = function () {
        if (this.stream === undefined)
            this.stream = this.createWritable();
        return this.stream;
    };
    StringReceiveBuffer.prototype.createWritable = function () {
        //eslint-disable-next-line @typescript-eslint/no-this-alias
        var b = this;
        return new WritableStream({
            write: function (chunk) {
                b.add(chunk);
            },
            close: function () {
                b.clear();
            }
        });
    };
    StringReceiveBuffer.prototype.addImpl = function (str) {
        // Look for separator in new string
        var pos = str.indexOf(this.separator);
        if (pos < 0) {
            // Not found, just add to buffer and return
            this.buffer += str;
            return "";
        }
        // Found! Trigger callback for existing buffer and part of new string
        var part = str.substring(0, pos);
        try {
            this.onData(this.buffer + part);
            str = str.substring(part.length + this.separator.length);
        }
        catch (ex) {
            console.warn(ex);
        }
        this.buffer = "";
        return str;
    };
    StringReceiveBuffer.prototype.add = function (str) {
        while (str.length > 0) {
            str = this.addImpl(str);
        }
    };
    return StringReceiveBuffer;
}());
exports.StringReceiveBuffer = StringReceiveBuffer;
//# sourceMappingURL=StringReceiveBuffer.js.map