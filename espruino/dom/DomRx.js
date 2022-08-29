"use strict";
exports.__esModule = true;
exports.rx = void 0;
var rxjs_1 = require("rxjs");
var operators_1 = require("rxjs/operators");
var Util_js_1 = require("./Util.js");
/**
 * Keeps track of last event data
 *
 * ```js
 * const pointer = rx(`#myDiv`, `pointermove`).value;
 *
 * if (pointer.clientX > ...)
 * ```
 *
 * Pluck a field:
 * ```js
 * const pointerX = rx(`#myDiv`, `pointermove`, {pluck: `clientX`}).value;
 *
 * if (pointerX > ...)
 * ```
 * @template V Event type
 * @param opts
 * @return
 */
var rx = function (elOrQuery, event, opts) {
    var el = (0, Util_js_1.resolveEl)(elOrQuery);
    var ev = (0, rxjs_1.fromEvent)(el, event);
    // @ts-ignore
    var value = {};
    var clear = function () {
        var keys = Object.keys(value);
        keys.forEach(function (key) {
            // eslint-disable-next-line functional/immutable-data, @typescript-eslint/no-explicit-any
            delete value[key];
        });
    };
    var setup = function (sub) {
        sub.subscribe({
            next: function (newValue) {
                // eslint-disable-next-line functional/immutable-data, @typescript-eslint/no-explicit-any
                Object.assign(value, newValue);
            }
        });
        return {
            value: value,
            clear: clear
        };
    };
    if (opts === undefined)
        return setup(ev);
    if (opts.pluck) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return setup(ev.pipe((0, operators_1.map)(function (x) { return x[opts.pluck]; })));
    }
    else if (opts.transform) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return setup(ev.pipe((0, operators_1.map)(function (x) { return opts.transform(x); })));
    }
    return setup(ev);
};
exports.rx = rx;
//# sourceMappingURL=DomRx.js.map