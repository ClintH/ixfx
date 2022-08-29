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
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var _FrequencyHistogramPlot_sorter;
exports.__esModule = true;
exports.FrequencyHistogramPlot = void 0;
var KeyValueUtil = __importStar(require("../KeyValue.js"));
/**
 * Creates and drives a HistogramVis instance.
 * Data should be an outer array containing two-element arrays for each
 * data point. The first element of the inner array is expected to be the key, the second the frequency.
 * For example,  `[`apples`, 2]` means the key `apples` was counted twice.
 *
 * Usage:
 * .sortBy() automatically sorts prior to visualisation. By default off.
 * .update(data) full set of data to plot
 * .clear() empties plot - same as calling `update([])`
 * .el - The `HistogramVis` instance, or undefined if not created/disposed
 *
 * ```
 * const plot = new FrequencyHistogramPlot(document.getElementById('histogram'));
 * plot.sortBy('key'); // Automatically sort by key
 * ...
 * plot.update([[`apples`, 2], [`oranges', 0], [`bananas`, 5]])
 * ```
 *
 * @export
 * @class FrequencyHistogramPlot
 */
var FrequencyHistogramPlot = /** @class */ (function () {
    function FrequencyHistogramPlot(el) {
        // eslint-disable-next-line functional/prefer-readonly-type
        _FrequencyHistogramPlot_sorter.set(this, void 0);
        this.el = el;
    }
    FrequencyHistogramPlot.prototype.setAutoSort = function (sortStyle) {
        // eslint-disable-next-line functional/immutable-data
        __classPrivateFieldSet(this, _FrequencyHistogramPlot_sorter, KeyValueUtil.getSorter(sortStyle), "f");
    };
    FrequencyHistogramPlot.prototype.clear = function () {
        if (this.el === undefined)
            return;
        // eslint-disable-next-line functional/immutable-data
        this.el.data = [];
    };
    // init() {
    //   if (this.el !== undefined) return; // already inited
    //   // eslint-disable-next-line functional/immutable-data
    //   this.el = document.createElement(`histogram-vis`);
    //   this.parentEl.appendChild(this.el);
    // }
    FrequencyHistogramPlot.prototype.dispose = function () {
        var el = this.el;
        if (el === undefined)
            return; // already disposed
        el.remove();
    };
    FrequencyHistogramPlot.prototype.update = function (data) {
        if (this.el === undefined) {
            console.warn("FrequencyHistogramPlot this.el undefined");
            return;
        }
        if (__classPrivateFieldGet(this, _FrequencyHistogramPlot_sorter, "f") !== undefined) {
            // eslint-disable-next-line functional/immutable-data, functional/prefer-readonly-type
            this.el.data = __classPrivateFieldGet(this, _FrequencyHistogramPlot_sorter, "f").call(this, data);
        }
        else {
            // eslint-disable-next-line functional/immutable-data
            this.el.data = __spreadArray([], data, true);
        }
    };
    return FrequencyHistogramPlot;
}());
exports.FrequencyHistogramPlot = FrequencyHistogramPlot;
_FrequencyHistogramPlot_sorter = new WeakMap();
//# sourceMappingURL=FrequencyHistogramPlot.js.map