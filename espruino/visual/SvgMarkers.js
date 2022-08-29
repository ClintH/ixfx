"use strict";
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
exports.markerPrebuilt = exports.createMarker = void 0;
var Svg_js_1 = require("./Svg.js");
var createMarker = function (id, opts, childCreator) {
    var _a, _b;
    var m = (0, Svg_js_1.createEl)("marker", id);
    if (opts.markerWidth)
        m.setAttribute("markerWidth", (_a = opts.markerWidth) === null || _a === void 0 ? void 0 : _a.toString());
    if (opts.markerHeight)
        m.setAttribute("markerHeight", (_b = opts.markerHeight) === null || _b === void 0 ? void 0 : _b.toString());
    if (opts.orient)
        m.setAttribute("orient", opts.orient.toString());
    else
        m.setAttribute("orient", "auto-start-reverse");
    if (opts.viewBox)
        m.setAttribute("viewBox", opts.viewBox.toString());
    if (opts.refX)
        m.setAttribute("refX", opts.refX.toString());
    if (opts.refY)
        m.setAttribute("refY", opts.refY.toString());
    if (childCreator) {
        var c = childCreator();
        m.appendChild(c);
    }
    return m;
};
exports.createMarker = createMarker;
var markerPrebuilt = function (elem, opts, _context) {
    if (elem === null)
        return "(elem null)";
    var parent = elem.ownerSVGElement;
    if (parent === null)
        throw new Error("parent for elem is null");
    var defsEl = (0, Svg_js_1.createOrResolve)(parent, "defs", "defs");
    //eslint-disable-next-line functional/no-let
    var defEl = defsEl.querySelector("#".concat(opts.id));
    if (defEl !== null) {
        return "url(#".concat(opts.id, ")");
    }
    if (opts.id === "triangle") {
        opts = __assign(__assign({}, opts), { strokeStyle: "transparent" });
        if (!opts.markerHeight)
            opts = __assign(__assign({}, opts), { markerHeight: 6 });
        if (!opts.markerWidth)
            opts = __assign(__assign({}, opts), { markerWidth: 6 });
        if (!opts.refX)
            opts = __assign(__assign({}, opts), { refX: opts.markerWidth });
        if (!opts.refY)
            opts = __assign(__assign({}, opts), { refY: opts.markerHeight });
        if (!opts.fillStyle || opts.fillStyle === "none")
            opts = __assign(__assign({}, opts), { fillStyle: "black" });
        if (!opts.viewBox)
            opts = __assign(__assign({}, opts), { viewBox: "0 0 10 10" });
        defEl = (0, exports.createMarker)(opts.id, opts, function () {
            var tri = (0, Svg_js_1.createEl)("path");
            tri.setAttribute("d", "M 0 0 L 10 5 L 0 10 z");
            if (opts)
                (0, Svg_js_1.applyOpts)(tri, opts);
            return tri;
        });
    }
    else
        throw new Error("Do not know how to make ".concat(opts.id));
    //eslint-disable-next-line functional/immutable-data
    defEl.id = opts.id;
    defsEl.appendChild(defEl);
    return "url(#".concat(opts.id, ")");
};
exports.markerPrebuilt = markerPrebuilt;
//# sourceMappingURL=SvgMarkers.js.map