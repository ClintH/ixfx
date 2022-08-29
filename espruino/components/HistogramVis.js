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
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.HistogramVis = void 0;
var lit_1 = require("lit");
var custom_element_js_1 = require("lit/decorators/custom-element.js");
var property_js_1 = require("lit/decorators/property.js");
var repeat_js_1 = require("lit/directives/repeat.js");
var jsonData = function (obj) {
    if (obj === null || obj === undefined || obj === "undefined")
        return;
    try {
        if (typeof obj === "string") {
            if (obj.length === 0)
                return;
            var o = JSON.parse(obj);
            if (!Array.isArray(o)) {
                console.error("Histogram innerText should be JSON array");
                return;
            }
            // eslint-disable-next-line functional/no-let
            for (var i = 0; i < o.length; i++) {
                if (!Array.isArray(o[i])) {
                    console.error("Histogram array should consist of inner arrays");
                    return;
                }
                if (o[i].length !== 2) {
                    console.error("Histogram inner arrays should consist of two elements");
                    return;
                }
                if (typeof o[i][0] !== "string") {
                    console.error("First element of inner array should be a string (index ".concat(i, ")"));
                    return;
                }
                if (typeof o[i][1] !== "number") {
                    console.error("Second element of inner array should be a number (index ".concat(i, ")"));
                    return;
                }
            }
            return o;
        }
    }
    catch (ex) {
        console.log(obj);
        console.error(ex);
    }
    return undefined;
};
/**
 * Usage in HTML:
 * ```html
 * <style>
 * histogram-vis {
 *  display: block;
 *  height: 7em;
 *  --histogram-bar-color: pink;
 * }
 * </style>
 * <histogram-vis>
 * [
 *  ["apples", 5],
 *  ["oranges", 3],
 *  ["pineapple", 0],
 *  ["limes", 9]
 * ]
 * </histogram-vis>
 * ```
 *
 * CSS colour theming:
 * --histogram-bar-color
 * --histogram-label-color
 *
 * HTML tag attributes
 * showXAxis (boolean)
 * showDataLabels (boolean)
 *
 * @export
 * @class HistogramVis
 * @extends {LitElement}
 **/
var HistogramVis = /** @class */ (function (_super) {
    __extends(HistogramVis, _super);
    function HistogramVis() {
        var _this = _super.call(this) || this;
        _this.data = [];
        _this.showDataLabels = true;
        _this.height = "100%";
        _this.showXAxis = true;
        _this.json = undefined;
        return _this;
    }
    HistogramVis.prototype.connectedCallback = function () {
        if (!this.hasAttribute("json")) {
            this.setAttribute("json", this.innerText);
        }
        _super.prototype.connectedCallback.call(this);
    };
    HistogramVis.prototype.barTemplate = function (bar, index, _totalBars) {
        var percentage = bar.percentage;
        var _a = bar.data, key = _a[0], freq = _a[1];
        // grid-area: rowStart / gridColStart / gridRowEnd / gridColEnd
        var rowStart = 1;
        var rowEnd = 2;
        var colStart = index + 1;
        var colEnd = colStart + 1;
        var dataLabel = (0, lit_1.html)(templateObject_1 || (templateObject_1 = __makeTemplateObject(["<div class=\"data\">", "</div>"], ["<div class=\"data\">", "</div>"])), freq);
        var xAxis = (0, lit_1.html)(templateObject_2 || (templateObject_2 = __makeTemplateObject(["", ""], ["", ""])), key);
        return (0, lit_1.html)(templateObject_3 || (templateObject_3 = __makeTemplateObject(["\n    <div class=\"bar\" style=\"grid-area: ", " / ", " / ", " / ", "\">\n      <div class=\"barTrack\" style=\"height: ", "%\"></div>\n      ", "\n    </div>\n    <div class=\"xAxisLabels\" style=\"grid-area: ", " / ", " / ", " / ", "\">\n      ", "\n    </div>"], ["\n    <div class=\"bar\" style=\"grid-area: ", " / ", " / ", " / ", "\">\n      <div class=\"barTrack\" style=\"height: ", "%\"></div>\n      ", "\n    </div>\n    <div class=\"xAxisLabels\" style=\"grid-area: ", " / ", " / ", " / ", "\">\n      ", "\n    </div>"])), rowStart, colStart, rowEnd, colEnd, (percentage !== null && percentage !== void 0 ? percentage : 0) * 100, this.showDataLabels ? dataLabel : "", rowStart + 2, colStart, rowEnd + 2, colEnd, this.showXAxis ? xAxis : "");
    };
    HistogramVis.prototype.render = function () {
        var _this = this;
        var _a;
        if ((this.data === undefined || this.data.length === 0) && this.json === undefined)
            return (0, lit_1.html)(templateObject_4 || (templateObject_4 = __makeTemplateObject([""], [""])));
        var d = (_a = this.data) !== null && _a !== void 0 ? _a : this.json;
        var length = d.length;
        var highestCount = Math.max.apply(Math, d.map(function (d) { return d[1]; }));
        var bars = d.map(function (kv) { return ({ data: kv, percentage: kv[1] / highestCount }); });
        var xAxis = (0, lit_1.html)(templateObject_5 || (templateObject_5 = __makeTemplateObject(["<div class=\"xAxis\" style=\"grid-area: 2 / 1 / 3 / ", "\"></div>"], ["<div class=\"xAxis\" style=\"grid-area: 2 / 1 / 3 / ", "\"></div>"])), d.length + 1);
        var height = this.height ? "height: ".concat(this.height, ";") : "";
        var h = (0, lit_1.html)(templateObject_6 || (templateObject_6 = __makeTemplateObject(["\n    <style>\n    div.chart {\n      grid-template-columns: repeat(", ", minmax(2px, 1fr));\n    }\n    </style>\n    <div class=\"container\" style=\"", "\">\n      <div class=\"chart\">\n      ", "\n        ", "\n      </div>\n    </div>"], ["\n    <style>\n    div.chart {\n      grid-template-columns: repeat(", ", minmax(2px, 1fr));\n    }\n    </style>\n    <div class=\"container\" style=\"", "\">\n      <div class=\"chart\">\n      ", "\n        ", "\n      </div>\n    </div>"])), d.length, height, (0, repeat_js_1.repeat)(bars, function (bar) { return bar.data[0]; }, function (b, index) { return _this.barTemplate(b, index, length); }), this.showXAxis ? xAxis : "");
        return h;
    };
    HistogramVis.styles = (0, lit_1.css)(templateObject_7 || (templateObject_7 = __makeTemplateObject(["\n    :host {\n    }\n    div.container {\n      display: flex;\n      flex-direction: column;\n      height: 100%;\n    }\n    div.chart {\n      display: grid;\n      flex: 1;\n      grid-template-rows: 1fr 1px min-content;\n      justify-items: center;\n    }\n    div.bar {\n      display: flex;\n      flex-direction: column-reverse;\n      align-items: center;\n      justify-self: normal;\n      padding-left: 0.3vw;\n      padding-right: 0.3vw;\n    }\n    div.bar>div.barTrack {\n      background-color: var(--histogram-bar-color, gray);\n      align-self: stretch;\n    }\n    div.xAxisLabels, div.data {\n      font-size: min(1vw, 1em);\n      color: var(--histogram-label-color, currentColor);\n    }\n    div.xAxisLabels {\n      width: 100%;\n      text-overflow: ellipsis;\n      overflow: hidden;\n      white-space: nowrap;\n      text-align: center;\n    }\n    div.xAxis {\n      background-color: var(--histogram-axis-color, silver);\n      width: 100%;\n      height: 100%;\n    }\n  "], ["\n    :host {\n    }\n    div.container {\n      display: flex;\n      flex-direction: column;\n      height: 100%;\n    }\n    div.chart {\n      display: grid;\n      flex: 1;\n      grid-template-rows: 1fr 1px min-content;\n      justify-items: center;\n    }\n    div.bar {\n      display: flex;\n      flex-direction: column-reverse;\n      align-items: center;\n      justify-self: normal;\n      padding-left: 0.3vw;\n      padding-right: 0.3vw;\n    }\n    div.bar>div.barTrack {\n      background-color: var(--histogram-bar-color, gray);\n      align-self: stretch;\n    }\n    div.xAxisLabels, div.data {\n      font-size: min(1vw, 1em);\n      color: var(--histogram-label-color, currentColor);\n    }\n    div.xAxisLabels {\n      width: 100%;\n      text-overflow: ellipsis;\n      overflow: hidden;\n      white-space: nowrap;\n      text-align: center;\n    }\n    div.xAxis {\n      background-color: var(--histogram-axis-color, silver);\n      width: 100%;\n      height: 100%;\n    }\n  "])));
    __decorate([
        (0, property_js_1.property)()
    ], HistogramVis.prototype, "data");
    __decorate([
        (0, property_js_1.property)()
    ], HistogramVis.prototype, "showDataLabels");
    __decorate([
        (0, property_js_1.property)()
    ], HistogramVis.prototype, "height");
    __decorate([
        (0, property_js_1.property)()
    ], HistogramVis.prototype, "showXAxis");
    __decorate([
        (0, property_js_1.property)({ converter: jsonData, type: Object })
    ], HistogramVis.prototype, "json");
    HistogramVis = __decorate([
        (0, custom_element_js_1.customElement)("histogram-vis")
    ], HistogramVis);
    return HistogramVis;
}(lit_1.LitElement));
exports.HistogramVis = HistogramVis;
var templateObject_1, templateObject_2, templateObject_3, templateObject_4, templateObject_5, templateObject_6, templateObject_7;
//# sourceMappingURL=HistogramVis.js.map