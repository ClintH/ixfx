"use strict";
exports.__esModule = true;
exports.sleep = void 0;
var Guards_js_1 = require("../Guards.js");
/**
 * Returns after `timeoutMs`.
 *
 * @example In an async function
 * ```js
 * console.log(`Hello`);
 * await sleep(1000);
 * console.log(`There`); // Prints one second after
 * ```
 *
 * @example As a promise
 * ```js
 * console.log(`Hello`);
 * sleep(1000)
 *  .then(() => console.log(`There`)); // Prints one second after
 * ```
 *
 * If a timeout of 0 is given, `requestAnimationFrame` is used instead of `setTimeout`.
 *
 * {@link delay} and {@link sleep} are similar. `delay()` takes a parameter of what code to execute after the timeout, while `sleep()` just resolves after the timeout.
 *
 * @param timeoutMs
 * @return
 */
var sleep = function (timeoutMs, value) {
    (0, Guards_js_1.integer)(timeoutMs, "positive", "timeoutMs");
    if (timeoutMs === 0) {
        return new Promise(function (resolve) { return requestAnimationFrame(function (_) {
            resolve(value);
        }); });
    }
    else {
        return new Promise(function (resolve) { return setTimeout(function () { return resolve(value); }, timeoutMs); });
    }
};
exports.sleep = sleep;
//# sourceMappingURL=Sleep.js.map