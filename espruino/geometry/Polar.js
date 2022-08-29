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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.spiralRaw = exports.rotateDegrees = exports.rotate = exports.spiral = exports.toCartesian = exports.fromCartesian = exports.isCoord = void 0;
var index_js_1 = require("./index.js");
var Points = __importStar(require("./Point.js"));
/**
 * Returns true if `p` seems to be a {@link Coord} (ie has both distance & angleRadian fields)
 * @param p
 * @returns True if `p` seems to be a Coord
 */
var isCoord = function (p) {
    if (p.distance === undefined)
        return false;
    if (p.angleRadian === undefined)
        return false;
    return true;
};
exports.isCoord = isCoord;
/**
 * Converts a Cartesian coordinate to polar
 *
 * ```js
 * import { Polar } from 'https://unpkg.com/ixfx/dist/geometry.js';
 *
 * // Yields: { angleRadian, distance }
 * const polar = Polar.fromCartesian({x: 50, y: 50}, origin);
 * ```
 *
 * Any additional properties of `point` are copied to object.
 * @param point Point
 * @param origin Origin
 * @returns
 */
var fromCartesian = function (point, origin) {
    point = Points.subtract(point, origin);
    //eslint-disable-next-line functional/no-let
    //let a =  Math.atan2(point.y, point.x);
    //if (a < 0) a = Math.abs(a);
    //else a = Math.PI + (Math.PI - a);
    var angle = Math.atan2(point.y, point.x);
    //if (point.x < 0 && point.y > 0) angle += 180;
    //if (point.x > 0 && point.y < 0) angle += 360;
    //if (point.x < 0 && point.y < 0) angle += 180;
    return Object.freeze(__assign(__assign({}, point), { angleRadian: angle, distance: Math.sqrt(point.x * point.x + point.y * point.y) }));
};
exports.fromCartesian = fromCartesian;
/**
 * Converts to Cartesian coordinate from polar.
 *
 * ```js
 * import { Polar } from 'https://unpkg.com/ixfx/dist/geometry.js';
 *
 * const origin = { x: 50, y: 50}; // Polar origin
 * // Yields: { x, y }
 * const polar = Polar.toCartesian({ distance: 10, angleRadian: 0 }, origin);
 * ```
 *
 * Distance and angle can be provided as numbers intead:
 *
 * ```
 * // Yields: { x, y }
 * const polar = Polar.toCartesian(10, 0, origin);
 * ```
 *
 * @param a
 * @param b
 * @param c
 * @returns
 */
var toCartesian = function (a, b, c) {
    if ((0, exports.isCoord)(a)) {
        if (b === undefined)
            b = Points.Empty;
        if (!Points.isPoint(b))
            throw new Error("Expecting (Coord, Point). Point param wrong type.");
        return polarToCartesian(a.distance, a.angleRadian, b);
    }
    else {
        if (typeof a === "number" && typeof b === "number") {
            if (c === undefined)
                c = Points.Empty;
            if (!Points.isPoint(c))
                throw new Error("Expecting (number, number, Point). Point param wrong type");
            return polarToCartesian(a, b, c);
        }
        else {
            throw new Error("Expecting parameters of (number, number). Got: (".concat(typeof (a), ", ").concat(typeof (b), ", ").concat(typeof (c), "). a: ").concat(JSON.stringify(a)));
        }
    }
};
exports.toCartesian = toCartesian;
/**
 * Produces an Archimedean spiral. It's a generator.
 *
 * ```js
 * const s = spiral(0.1, 1);
 * for (const coord of s) {
 *  // Use Polar coord...
 *  if (coord.step === 1000) break; // Stop after 1000 iterations
 * }
 * ```
 *
 * @param smoothness 0.1 pretty rounded, at around 5 it starts breaking down
 * @param zoom At smoothness 0.1, zoom starting at 1 is OK
 */
//eslint-disable-next-line func-style
function spiral(smoothness, zoom) {
    var step, a;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                step = 0;
                _a.label = 1;
            case 1:
                if (!true) return [3 /*break*/, 3];
                a = smoothness * step++;
                return [4 /*yield*/, {
                        distance: zoom * a,
                        angleRadian: a,
                        step: step
                    }];
            case 2:
                _a.sent();
                return [3 /*break*/, 1];
            case 3: return [2 /*return*/];
        }
    });
}
exports.spiral = spiral;
/**
 * Returns a rotated coordiante
 * @param c Coordinate
 * @param amountRadian Amount to rotate, in radians
 * @returns
 */
var rotate = function (c, amountRadian) { return Object.freeze(__assign(__assign({}, c), { angleRadian: c.angleRadian + amountRadian })); };
exports.rotate = rotate;
/**
 * Returns a rotated coordinate
 * @param c Coordinate
 * @param amountDeg Amount to rotate, in degrees
 * @returns
 */
var rotateDegrees = function (c, amountDeg) { return Object.freeze(__assign(__assign({}, c), { angleRadian: c.angleRadian + (0, index_js_1.degreeToRadian)(amountDeg) })); };
exports.rotateDegrees = rotateDegrees;
/**
 * Produces an Archimedian spiral with manual stepping.
 * @param step Step number. Typically 0, 1, 2 ...
 * @param smoothness 0.1 pretty rounded, at around 5 it starts breaking down
 * @param zoom At smoothness 0.1, zoom starting at 1 is OK
 * @returns
 */
var spiralRaw = function (step, smoothness, zoom) {
    var a = smoothness * step;
    return Object.freeze({
        distance: zoom * a,
        angleRadian: a
    });
};
exports.spiralRaw = spiralRaw;
/**
 * Converts a polar coordiante to Cartesian
 * @param distance Distance
 * @param angleRadians Angle in radians
 * @param origin Origin
 * @returns
 */
var polarToCartesian = function (distance, angleRadians, origin) {
    Points.guard(origin);
    return Object.freeze({
        x: origin.x + (distance * Math.cos(angleRadians)),
        y: origin.y + (distance * Math.sin(angleRadians))
    });
};
//# sourceMappingURL=Polar.js.map