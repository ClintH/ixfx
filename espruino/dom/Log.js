"use strict";
exports.__esModule = true;
exports.log = void 0;
var Util_js_1 = require("./Util.js");
var ShadowDom_js_1 = require("./ShadowDom.js");
/**
 * Allows writing to a DOM element in console.log style. Element grows in size, so use
 * something like `overflow-y: scroll` on its parent
 *
 * ```
 * const l = log(`#dataStream`); // Assumes HTML element with id `dataStream` exists
 * l.log(`Hi`);
 * l.log(); // Displays a horizontal rule
 *
 * const l = log(document.getElementById(`dataStream`), {
 *  timestamp: true,
 *  truncateEntries: 20
 * });
 * l.log(`Hi`);
 * l.error(`Some error`); // Adds class `error` to line
 * ```
 *
 * For logging high-throughput streams:
 * ```
 * // Silently drop log if it was less than 5ms since the last
 * const l = log(`#dataStream`, { minIntervalMs: 5 });
 *
 * // Only the last 100 entries are kept
 * const l = log(`#dataStream`, { capacity: 100 });
 * ```
 *
 * @param {(HTMLElement | string | undefined)} elOrId Element or id of element
 * @param {LogOpts} opts
 * @returns {Log}
 */
var log = function (domQueryOrEl, opts) {
    if (opts === void 0) { opts = {}; }
    // eslint-disable-next-line @typescript-eslint/naming-convention
    var _a = opts.capacity, capacity = _a === void 0 ? 0 : _a, _b = opts.monospaced, monospaced = _b === void 0 ? true : _b, _c = opts.timestamp, timestamp = _c === void 0 ? false : _c, _d = opts.collapseDuplicates, collapseDuplicates = _d === void 0 ? true : _d, _e = opts.css, css = _e === void 0 ? "" : _e;
    // eslint-disable-next-line functional/no-let
    var added = 0;
    // eslint-disable-next-line functional/no-let
    var lastLog;
    // eslint-disable-next-line functional/no-let
    var lastLogRepeats = 0;
    var parentEl = (0, Util_js_1.resolveEl)(domQueryOrEl);
    var fontFamily = monospaced ? "Consolas, \"Andale Mono WT\", \"Andale Mono\", \"Lucida Console\", \"Lucida Sans Typewriter\", \"DejaVu Sans Mono\", \"Bitstream Vera Sans Mono\", \"Liberation Mono\", Monaco, \"Courier New\", Courier, monospace" : "normal";
    var shadowRoot = (0, ShadowDom_js_1.addShadowCss)(parentEl, "\n  .log {\n    font-family: ".concat(fontFamily, ";\n    background-color: var(--code-background-color);\n    padding: var(--padding1, 0.2em);\n    overflow-y: auto;\n    height:100%;\n  }\n  .timestamp {\n    margin-right: 0.5em;\n    opacity: 0.5;\n    font-size: 70%;\n    align-self: center;\n  }\n  .line {\n    display: flex;\n    padding-bottom: 0.1em;\n    padding-top: 0.1em;\n  }\n  .line:hover {\n  \n  }\n  .error {\n    color: red;\n  }\n  .badge {\n    border: 1px solid currentColor;\n    align-self: center;\n    font-size: 70%;\n    padding-left: 0.2em;\n    padding-right: 0.2em;\n    border-radius: 1em;\n    margin-left: 0.5em;\n    margin-right: 0.5em;\n  }\n  .msg {\n    flex: 1;\n    word-break: break-word;\n  }\n  ").concat(css, "\n  "));
    var el = document.createElement("div");
    // eslint-disable-next-line functional/immutable-data
    el.className = "log";
    shadowRoot.append(el);
    var error = function (msgOrError) {
        var line = document.createElement("div");
        if (typeof msgOrError === "string") {
            // eslint-disable-next-line functional/immutable-data
            line.innerHTML = msgOrError;
        }
        else if (msgOrError instanceof Error) {
            var stack = msgOrError.stack;
            if (stack === undefined) {
                // eslint-disable-next-line functional/immutable-data
                line.innerHTML = msgOrError.toString();
            }
            else {
                // eslint-disable-next-line functional/immutable-data
                line.innerHTML = stack.toString();
            }
        }
        else {
            // eslint-disable-next-line functional/immutable-data
            line.innerHTML = msgOrError;
        }
        line.classList.add("error");
        append(line);
        lastLog = undefined;
        lastLogRepeats = 0;
    };
    //eslint-disable-next-line functional/no-let
    var lastLogTime = 0;
    var log = function (whatToLog) {
        if (whatToLog === void 0) { whatToLog = ""; }
        // eslint-disable-next-line functional/no-let
        var msg;
        var interval = window.performance.now() - lastLogTime;
        if (opts.minIntervalMs && interval < opts.minIntervalMs)
            return;
        lastLogTime = window.performance.now();
        if (typeof whatToLog === "object") {
            msg = JSON.stringify(whatToLog);
        }
        else if (whatToLog === undefined) {
            msg = "(undefined)";
        }
        else if (whatToLog === null) {
            msg = "(null)";
        }
        else if (typeof whatToLog === "number") {
            if (Number.isNaN(msg))
                msg = "(NaN)";
            msg = whatToLog.toString();
        }
        else {
            msg = whatToLog;
        }
        if (msg.length === 0) {
            var rule = document.createElement("hr");
            lastLog = undefined;
            append(rule);
        }
        else if (msg === lastLog && collapseDuplicates) {
            var lastEl = el.firstElementChild;
            // eslint-disable-next-line functional/no-let
            var lastBadge = lastEl.querySelector(".badge");
            if (lastBadge === null) {
                lastBadge = document.createElement("div");
                // eslint-disable-next-line functional/immutable-data
                lastBadge.className = "badge";
                lastEl.insertAdjacentElement("beforeend", lastBadge);
            }
            if (lastEl !== null) {
                // eslint-disable-next-line functional/immutable-data
                lastBadge.textContent = (++lastLogRepeats).toString();
            }
            return lastEl;
        }
        else {
            var line = document.createElement("div");
            // eslint-disable-next-line functional/immutable-data
            line.innerText = msg;
            append(line);
            lastLog = msg;
            return line;
        }
    };
    var append = function (line) {
        var _a;
        if (timestamp) {
            var wrapper = document.createElement("div");
            var timestamp_1 = document.createElement("div");
            // eslint-disable-next-line functional/immutable-data
            timestamp_1.className = "timestamp";
            // eslint-disable-next-line functional/immutable-data
            timestamp_1.innerText = new Date().toLocaleTimeString();
            wrapper.append(timestamp_1, line);
            line.classList.add("msg");
            wrapper.classList.add("line");
            line = wrapper;
        }
        else {
            line.classList.add("line", "msg");
        }
        if (opts.reverse) {
            el.appendChild(line);
        }
        else {
            el.insertBefore(line, el.firstChild);
        }
        if (capacity > 0 && (++added > capacity * 2)) {
            while (added > capacity) {
                (_a = el.lastChild) === null || _a === void 0 ? void 0 : _a.remove();
                added--;
            }
        }
        if (opts.reverse) {
            // Scroll to bottom
            //eslint-disable-next-line functional/immutable-data
            el.scrollTop = el.scrollHeight;
        }
        lastLogRepeats = 0;
    };
    var clear = function () {
        // eslint-disable-next-line functional/immutable-data
        el.innerHTML = "";
        lastLog = undefined;
        lastLogRepeats = 0;
        added = 0;
    };
    var dispose = function () {
        el.remove();
    };
    return {
        error: error,
        log: log,
        append: append,
        clear: clear,
        dispose: dispose,
        get isEmpty() {
            return added === 0;
        }
    };
};
exports.log = log;
//# sourceMappingURL=Log.js.map