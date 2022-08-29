"use strict";
exports.__esModule = true;
exports.logger = exports.logSet = void 0;
var Map_1 = require("./collections/Map");
var Colour_1 = require("./visual/Colour");
//eslint-disable-next-line functional/no-let
var logColourCount = 0;
var logColours = (0, Map_1.getOrGenerateSync)(new Map(), function () { return (0, Colour_1.goldenAngleColour)(++logColourCount); });
/**
 * Returns a bundled collection of {@link logger}s
 *
 * ```
 * const con = logSet(`a`);
 * con.log(`Hello`);  // console.log(`a Hello`);
 * con.warn(`Uh-oh`); // console.warn(`a Uh-oh`);
 * con.error(`Eek!`); // console.error(`a Eek!`);
 * ```
 * @param prefix
 * @returns
 */
var logSet = function (prefix) { return ({
    log: (0, exports.logger)(prefix, "log"),
    warn: (0, exports.logger)(prefix, "warn"),
    error: (0, exports.logger)(prefix, "error")
}); };
exports.logSet = logSet;
/**
 * Returns a console logging function which prefixes messages. This is
 * useful for tracing messages from different components. Each prefix
 * is assigned a colour, further helping to distinguish messages.
 *
 * Use {@link logSet} to get a bundled set.
 *
 * ```
 * // Initialise once
 * const log = logger(`a`);
 * const error = logger(`a`, `error`);
 * const warn = logger(`a`, `warn);
 *
 * // And then use
 * log(`Hello`);    // console.log(`a Hello`);
 * error(`Uh-oh`);  // console.error(`a Uh-oh`);
 * warn(`Eek!`);    // console.warn(`a Eeek!`);
 * ```
 * @param prefix
 * @param kind
 * @returns
 */
//eslint-disable-next-line @typescript-eslint/no-explicit-any
var logger = function (prefix, kind) {
    if (kind === void 0) { kind = "log"; }
    return function (m) {
        if (m === undefined) {
            m = "(undefined)";
        }
        else if (typeof m === "object") {
            m = JSON.stringify(m);
        }
        switch (kind) {
            case "log":
                console.log("%c".concat(prefix, " ").concat(m), "color: ".concat(logColours(prefix)));
                break;
            case "warn":
                console.warn(prefix, m);
                break;
            case "error":
                console.error(prefix, m);
                break;
        }
    };
};
exports.logger = logger;
//# sourceMappingURL=Debug.js.map