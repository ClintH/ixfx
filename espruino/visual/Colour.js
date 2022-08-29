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
exports.__esModule = true;
exports.scale = exports.interpolate = exports.getCssVariable = exports.opacity = exports.toHex = exports.toRgb = exports.randomHue = exports.goldenAngleColour = exports.toHsl = void 0;
/* eslint-disable */
var d3Colour = __importStar(require("d3-color"));
var d3Interpolate = __importStar(require("d3-interpolate"));
var Random_js_1 = require("../Random.js");
var Guards_js_1 = require("../Guards.js");
/**
 * Parses colour to `{ h, s, l }`. `opacity` field is added if it exists on source.
 * @param colour
 * @returns
 */
var toHsl = function (colour) {
    var rgb = (0, exports.toRgb)(colour);
    var hsl = rgbToHsl(rgb.r, rgb.b, rgb.g);
    if (rgb.opacity)
        return __assign(__assign({}, hsl), { opacity: rgb.opacity });
    else
        return hsl;
};
exports.toHsl = toHsl;
/**
 * Returns a full HSL colour string (eg `hsl(20,50%,75%)`) based on a index.
 * It's useful for generating perceptually different shades as the index increments.
 *
 * ```
 * el.style.backgroundColor = goldenAgeColour(10);
 * ```
 *
 * Saturation and lightness can be specified, as numeric ranges of 0-1.
 *
 * @param saturation Saturation (0-1), defaults to 0.5
 * @param lightness Lightness (0-1), defaults to 0.75
 * @param alpha Opacity (0-1), defaults to 1.0
 * @returns HSL colour string eg `hsl(20,50%,75%)`
 */
var goldenAngleColour = function (index, saturation, lightness, alpha) {
    if (saturation === void 0) { saturation = 0.5; }
    if (lightness === void 0) { lightness = 0.75; }
    if (alpha === void 0) { alpha = 1.0; }
    (0, Guards_js_1.number)(index, "positive", "index");
    (0, Guards_js_1.number)(saturation, "percentage", "saturation");
    (0, Guards_js_1.number)(lightness, "percentage", "lightness");
    (0, Guards_js_1.number)(alpha, "percentage", "alpha");
    // Via Stackoverflow
    var hue = index * 137.508; // use golden angle approximation
    if (alpha === 1)
        return "hsl(".concat(hue, ",").concat(saturation * 100, "%,").concat(lightness * 100, "%)");
    else
        "hsl(".concat(hue, ",").concat(saturation * 100, "%,").concat(lightness * 100, "%,").concat(alpha * 100, "%)");
};
exports.goldenAngleColour = goldenAngleColour;
/**
 * Returns a random hue component
 * ```
 * // Generate hue
 * const h =randomHue(); // 0-359
 *
 * // Generate hue and assign as part of a HSL string
 * el.style.backgroundColor = `hsl(${randomHue(), 50%, 75%})`;
 * ```
 * @param rand
 * @returns
 */
var randomHue = function (rand) {
    if (rand === void 0) { rand = Random_js_1.defaultRandom; }
    var r = rand();
    return r * 360;
};
exports.randomHue = randomHue;
/**
 * Parses colour to `{ r, g, b }`. `opacity` field is added if it exists on source.
 * [Named colours](https://html-color-codes.info/color-names/)
 * @param colour
 * @returns
 */
var toRgb = function (colour) {
    var c = resolveColour(colour);
    var rgb = c.rgb();
    if (c.opacity < 1)
        return { r: rgb.r, g: rgb.g, b: rgb.b, opacity: c.opacity };
    else
        return { r: rgb.r, g: rgb.g, b: rgb.b };
};
exports.toRgb = toRgb;
var resolveColour = function (c) {
    if (typeof c === "string") {
        var css = d3Colour.color(c);
        if (css !== null)
            return css;
    }
    else {
        if (isHsl(c))
            return d3Colour.hsl(c.h, c.s, c.l);
        if (isRgb(c))
            return d3Colour.rgb(c.r, c.g, c.b);
    }
    throw new Error("Could not resolve colour ".concat(JSON.stringify(c)));
};
/**
 * Returns a colour in hex format `#000000`
 * @param colour
 * @returns Hex format, including #
 */
var toHex = function (colour) {
    var c = resolveColour(colour);
    return c.formatHex();
};
exports.toHex = toHex;
/**
 * Returns a variation of colour with its opacity multiplied by `amt`.
 *
 * ```js
 * // Return a colour string for blue that is 50% opaque
 * opacity(`blue`, 0.5);
 * // eg: `rgba(0,0,255,0.5)`
 *
 * // Returns a colour string that is 50% more opaque
 * opacity(`hsla(200,100%,50%,50%`, 0.5);
 * // eg: `hsla(200,100%,50%,25%)`
 * ```
 *
 * [Named colours](https://html-color-codes.info/color-names/)
 * @param colour A valid CSS colour
 * @param amt Amount to multiply opacity by
 * @returns String representation of colour
 */
var opacity = function (colour, amt) {
    var c = resolveColour(colour);
    c.opacity *= amt;
    return c.toString();
};
exports.opacity = opacity;
/**
 * Gets a CSS variable.
 * @example Fetch --accent variable, or use `yellow` if not found.
 * ```
 * getCssVariable(`accent`, `yellow`);
 * ```
 * @param name Name of variable. Omit the `--`
 * @param fallbackColour Fallback colour if not found
 * @param root  Element to search variable from
 * @returns Colour or fallback.
 */
var getCssVariable = function (name, fallbackColour, root) {
    if (fallbackColour === void 0) { fallbackColour = "black"; }
    if (root === undefined)
        root = document.body;
    var fromCss = getComputedStyle(root).getPropertyValue("--".concat(name)).trim();
    if (fromCss === undefined || fromCss.length === 0)
        return fallbackColour;
    return fromCss;
};
exports.getCssVariable = getCssVariable;
/**
 * Interpolates between two colours, returning a string in the form `rgb(r,g,b)`
 *
 * @example
 * ```js
 * // Get 50% between blue and red
 * interpolate(0.5, `blue`, `red`);
 *
 * // Get midway point, with specified colour space
 * interpolate(0.5, `hsl(200, 100%, 50%)`, `pink`, {space: `hcl`});
 * ```
 *
 * [Named colours](https://html-color-codes.info/color-names/)
 * @param amount Amount (0 = from, 0.5 halfway, 1= to)
 * @param from Starting colour
 * @param to Final colour
 * @param optsOrSpace Options for interpolation, or string name for colour space, eg `hsl`.
 * @returns String representation of colour, eg. `rgb(r,g,b)`
 */
var interpolate = function (amount, from, to, optsOrSpace) {
    (0, Guards_js_1.number)(amount, "percentage", "amount");
    if (typeof from !== "string")
        throw new Error("Expected string for 'from' param");
    if (typeof to !== "string")
        throw new Error("Expected string for 'to' param");
    var opts;
    if (typeof optsOrSpace === "undefined")
        opts = {};
    else if (typeof optsOrSpace === "string")
        opts = { space: optsOrSpace };
    else
        opts = optsOrSpace;
    var inter = getInterpolator(opts, [from, to]);
    if (inter === undefined)
        throw new Error("Could not handle colour/space");
    return inter(amount);
};
exports.interpolate = interpolate;
var getInterpolator = function (optsOrSpace, colours) {
    if (!Array.isArray(colours))
        throw new Error("Expected one or more colours as parameters");
    var opts;
    if (typeof optsOrSpace === "undefined")
        opts = {};
    else if (typeof optsOrSpace === "string")
        opts = { space: optsOrSpace };
    else
        opts = optsOrSpace;
    if (!Array.isArray(colours))
        throw new Error("Expected array for colours parameter");
    if (colours.length < 2)
        throw new Error("Interpolation expects at least two colours");
    var _a = opts.space, space = _a === void 0 ? "rgb" : _a, _b = opts.long, long = _b === void 0 ? false : _b;
    var inter;
    switch (space) {
        case "lab":
            inter = d3Interpolate.interpolateLab;
            break;
        case "hsl":
            inter = long ? d3Interpolate.interpolateHslLong : d3Interpolate.interpolateHsl;
            break;
        case "hcl":
            inter = long ? d3Interpolate.interpolateHclLong : d3Interpolate.interpolateHcl;
            break;
        case "cubehelix":
            inter = long ? d3Interpolate.interpolateCubehelixLong : d3Interpolate.interpolateCubehelix;
            break;
        case "rgb":
            inter = d3Interpolate.interpolateRgb;
        default:
            inter = d3Interpolate.interpolateRgb;
    }
    if (opts.gamma) {
        if (space === "rgb" || space === "cubehelix") {
            inter = inter.gamma(opts.gamma);
        }
    }
    if (colours.length > 2) {
        return d3Interpolate.piecewise(inter, colours);
    }
    else
        return inter(colours[0], colours[1]);
};
/**
 * Produces a scale of colours as a string array
 *
 * @example
 * ```js
 * // Yields array of 5 colour strings
 * const s = scale(5, {space:`hcl`}, `blue`, `red`);
 * // Produces scale between three colours
 * const s = scale(5, {space:`hcl`}, `blue`, `yellow`, `red`);
 * ```
 * @param steps Number of colours
 * @param opts Options for interpolation, or string colour space eg `hsl`
 * @param colours From/end colours (or more)
 * @returns
 */
var scale = function (steps, opts) {
    var colours = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        colours[_i - 2] = arguments[_i];
    }
    (0, Guards_js_1.number)(steps, "aboveZero", "steps");
    if (!Array.isArray(colours))
        throw new Error("Expected one or more colours as parameters");
    var inter = getInterpolator(opts, colours);
    if (inter === undefined)
        throw new Error("Could not handle colour/space");
    var perStep = 1 / (steps - 1);
    var r = [];
    //eslint-disable-next-line functional/no-let
    var amt = 0;
    //eslint-disable-next-line functional/no-let
    for (var i = 0; i < steps; i++) {
        //eslint-disable-next-line functional/immutable-data
        r.push(inter(amt));
        amt += perStep;
        if (amt > 1)
            amt = 1;
    }
    return r;
};
exports.scale = scale;
var isHsl = function (p) {
    if (p.h === undefined)
        return false;
    if (p.s === undefined)
        return false;
    if (p.l === undefined)
        return false;
    return true;
};
var isRgb = function (p) {
    if (p.r === undefined)
        return false;
    if (p.g === undefined)
        return false;
    if (p.b === undefined)
        return false;
    return true;
};
var rgbToHsl = function (r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    var min = Math.min(r, g, b), max = Math.max(r, g, b), delta = max - min, h, s, l;
    h = 0;
    if (max === min) {
        h = 0;
    }
    else if (r === max) {
        h = (g - b) / delta;
    }
    else if (g === max) {
        h = 2 + (b - r) / delta;
    }
    else if (b === max) {
        h = 4 + (r - g) / delta;
    }
    h = Math.min(h * 60, 360);
    if (h < 0) {
        h += 360;
    }
    l = (min + max) / 2;
    if (max === min) {
        s = 0;
    }
    else if (l <= 0.5) {
        s = delta / (max + min);
    }
    else {
        s = delta / (2 - max - min);
    }
    return { h: h, s: s, l: l };
};
//# sourceMappingURL=Colour.js.map