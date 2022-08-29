"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
exports.__esModule = true;
exports.select = exports.button = exports.numeric = exports.checkbox = exports.textAreaKeyboard = void 0;
var Util_js_1 = require("./Util.js");
/**
 * Adds tab and shift+tab to TEXTAREA
 * @param el
 */
var textAreaKeyboard = function (el) {
    el.addEventListener("keydown", function (evt) {
        var val = el.value;
        var start = el.selectionStart;
        var end = el.selectionEnd;
        if (evt.key === "Tab" && evt.shiftKey) {
            if (el.value.substring(start - 2, start) === "  ") {
                //eslint-disable-next-line functional/immutable-data
                el.value = val.substring(0, start - 2) + val.substring(end);
            }
            //eslint-disable-next-line functional/immutable-data
            el.selectionStart = el.selectionEnd = start - 2;
            evt.preventDefault();
            return false;
        }
        else if (evt.key === "Tab") {
            //eslint-disable-next-line functional/immutable-data
            el.value = val.substring(0, start) + "  " + val.substring(end);
            //eslint-disable-next-line functional/immutable-data
            el.selectionStart = el.selectionEnd = start + 2;
            evt.preventDefault();
            return false;
        }
    });
};
exports.textAreaKeyboard = textAreaKeyboard;
/**
 * Quick access to <input type="checkbox"> value.
 * Provide a checkbox by string id or object reference. If a callback is
 * supplied, it will be called when the checkbox changes value.
 *
 * ```
 * const opt = checkbox(`#chkMate`);
 * opt.checked; // Gets/sets
 *
 * const opt = checkbox(document.getElementById(`#chkMate`), newVal => {
 *  if (newVal) ...
 * });
 * ```
 * @param {(string | HTMLInputElement)} domIdOrEl
 * @param {(currentVal:boolean) => void} [onChanged]
 * @returns
 */
var checkbox = function (domIdOrEl, onChanged) {
    var el = (0, Util_js_1.resolveEl)(domIdOrEl);
    if (onChanged) {
        el.addEventListener("change", function () {
            onChanged(el.checked);
        });
    }
    return {
        get checked() {
            return el.checked;
        },
        set checked(val) {
            // eslint-disable-next-line functional/immutable-data
            el.checked = val;
        }
    };
};
exports.checkbox = checkbox;
/**
 * Numeric INPUT
 *
 * ```
 * const el = numeric(`#num`, (currentValue) => {
 *  // Called when input changes
 * })
 * ```
 *
 * Get/set value
 * ```
 * el.value = 10;
 * ```
 * @param domIdOrEl
 * @param onChanged
 * @param live If true, event handler fires based on `input` event, rather than `change`
 * @returns
 */
var numeric = function (domIdOrEl, onChanged, live) {
    var el = (0, Util_js_1.resolveEl)(domIdOrEl);
    var evt = live ? "change" : "input";
    if (onChanged) {
        el.addEventListener(evt, function () {
            onChanged(parseInt(el.value));
        });
    }
    return {
        get value() {
            return parseInt(el.value);
        },
        set value(val) {
            // eslint-disable-next-line functional/immutable-data
            el.value = val.toString();
        }
    };
};
exports.numeric = numeric;
/**
 * Button
 *
 * ```
 * const b = button(`#myButton`, () => {
 *  console.log(`Button clicked`);
 * });
 * ```
 *
 * ```
 * b.click(); // Call the click handler
 * b.disabled = true / false;
 * ```
 * @param domQueryOrEl Query string or element instance
 * @param onClick Callback when button is clicked
 * @returns
 */
var button = function (domQueryOrEl, onClick) {
    var el = (0, Util_js_1.resolveEl)(domQueryOrEl);
    if (onClick) {
        el.addEventListener("click", function (_ev) {
            onClick();
        });
    }
    return {
        click: function () {
            if (onClick)
                onClick();
        },
        set disabled(val) {
            // eslint-disable-next-line functional/immutable-data
            el.disabled = val;
        }
    };
};
exports.button = button;
/**
 * SELECT element.
 *
 * Handle changes in value:
 * ```
 * const mySelect = select(`#mySelect`, (newValue) => {
 *  console.log(`Value is now ${newValue}`);
 * });
 * ```
 *
 * Enable/disable:
 * ```
 * mySelect.disabled = true / false;
 * ```
 *
 * Get currently selected index or value:
 * ```
 * mySelect.value / mySelect.index
 * ```
 *
 * Is the currently selected value a placeholder?
 * ```
 * mySelect.isSelectedPlaceholder
 * ```
 *
 * Set list of options
 * ```
 * // Adds options, preselecting `opt2`.
 * mySelect.setOpts([`opt1`, `opt2 ...], `opt2`);
 * ```
 *
 * Select an element
 * ```
 * mySelect.select(1); // Select second item
 * mySelect.select(1, true); // If true is added, change handler fires as well
 * ```
 * @param domQueryOrEl Query (eg `#id`) or element
 * @param onChanged Callback when a selection is made
 * @param opts Options
 * @return
 */
var select = function (domQueryOrEl, onChanged, opts) {
    if (opts === void 0) { opts = {}; }
    var el = (0, Util_js_1.resolveEl)(domQueryOrEl);
    var placeholderOpt = opts.placeholderOpt, _a = opts.shouldAddChoosePlaceholder, shouldAddChoosePlaceholder = _a === void 0 ? false : _a, _b = opts.autoSelectAfterChoice, autoSelectAfterChoice = _b === void 0 ? -1 : _b;
    var change = function () {
        if (onChanged !== undefined)
            onChanged(el.value);
        // eslint-disable-next-line functional/immutable-data
        if (autoSelectAfterChoice >= 0)
            el.selectedIndex = autoSelectAfterChoice;
    };
    if (onChanged) {
        el.addEventListener("change", function (_ev) {
            change();
        });
    }
    return {
        set disabled(val) {
            // eslint-disable-next-line functional/immutable-data
            el.disabled = val;
        },
        get value() {
            return el.value;
        },
        get index() {
            return el.selectedIndex;
        },
        get isSelectedPlaceholder() {
            return ((shouldAddChoosePlaceholder || opts.placeholderOpt !== undefined) && el.selectedIndex === 0);
        },
        setOpts: function (opts, preSelect) {
            // eslint-disable-next-line functional/immutable-data
            el.options.length = 0;
            if (shouldAddChoosePlaceholder)
                opts = __spreadArray(["-- Choose --"], opts, true);
            else if (placeholderOpt !== undefined)
                opts = __spreadArray([placeholderOpt], opts, true);
            // eslint-disable-next-line functional/no-let
            var toSelect = 0;
            opts.forEach(function (o, index) {
                var optEl = document.createElement("option");
                // eslint-disable-next-line functional/immutable-data
                optEl.value = o;
                // eslint-disable-next-line functional/immutable-data
                optEl.innerHTML = o;
                if (preSelect !== undefined && o === preSelect)
                    toSelect = index;
                el.options.add(optEl);
            });
            // eslint-disable-next-line functional/immutable-data
            el.selectedIndex = toSelect;
        },
        select: function (index, trigger) {
            if (index === void 0) { index = 0; }
            if (trigger === void 0) { trigger = false; }
            // eslint-disable-next-line functional/immutable-data
            el.selectedIndex = index;
            if (trigger && onChanged) {
                change();
            }
        }
    };
};
exports.select = select;
//# sourceMappingURL=Forms.js.map