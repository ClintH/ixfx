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
exports.orientationForce = exports.computePositionFromAngle = exports.computePositionFromVelocity = exports.computeAccelerationToTarget = exports.computeVelocity = exports.pendulumForce = exports.springForce = exports.angleFromVelocityForce = exports.angleFromAccelerationForce = exports.angularForce = exports.velocityForce = exports.nullForce = exports.magnitudeForce = exports.accelerationForce = exports.apply = exports.targetForce = exports.computeAttractionForce = exports.attractionForce = exports.constrainBounce = exports.guard = void 0;
/**
 * Acknowledgements: much of the work here is an adapation from Daniel Shiffman's excellent _The Nature of Code_ website.
 */
var index_js_1 = require("../geometry/index.js");
var Clamp_js_1 = require("../data/Clamp.js");
var Interpolate_js_1 = require("../data/Interpolate.js");
var Rect_js_1 = require("../geometry/Rect.js");
/**
 * Throws an error if `t` is not of the `ForceAffected` shape.
 * @param t
 * @param name
 */
var guard = function (t, name) {
    if (name === void 0) { name = "t"; }
    if (t === undefined)
        throw new Error("Parameter ".concat(name, " is undefined. Expected ForceAffected"));
    if (t === null)
        throw new Error("Parameter ".concat(name, " is null. Expected ForceAffected"));
    if (typeof t !== "object")
        throw new Error("Parameter ".concat(name, " is type ").concat(typeof t, ". Expected object of shape ForceAffected"));
};
exports.guard = guard;
/**
 * `constrainBounce` yields a function that affects `t`'s position and velocity such that it
 * bounces within bounds.
 *
 * ```js
 * // Setup bounce with area constraints
 * // Reduce velocity by 10% with each impact
 * const b = constrainBounce({ width:200, height:500 }, 0.9);
 *
 * // Thing
 * const t = {
 *  position: { x: 50,  y: 50 },
 *  velocity: { x: 0.3, y: 0.01 }
 * };
 *
 * // `b` returns an altereted version of `t`, with the
 * // bounce logic applied.
 * const bounced = b(t);
 * ```
 *
 * `dampen` parameter allows velocity to be dampened with each bounce. A value
 * of 0.9 for example reduces velocity by 10%. A value of 1.1 will increase velocity by
 * 10% with each bounce.
 * @param bounds Constraints of area
 * @params dampen How much to dampen velocity by. Defaults to 1 meaning there is no damping.
 * @returns A function that can perform bounce logic
 */
var constrainBounce = function (bounds, dampen) {
    if (bounds === void 0) { bounds = { width: 1, height: 1 }; }
    if (dampen === void 0) { dampen = 1; }
    var minX = (0, Rect_js_1.getEdgeX)(bounds, "left");
    var maxX = (0, Rect_js_1.getEdgeX)(bounds, "right");
    var minY = (0, Rect_js_1.getEdgeY)(bounds, "top");
    var maxY = (0, Rect_js_1.getEdgeY)(bounds, "bottom");
    return function (t) {
        var _a, _b, _c;
        var position = (0, exports.computePositionFromVelocity)((_a = t.position) !== null && _a !== void 0 ? _a : index_js_1.Points.Empty, (_b = t.velocity) !== null && _b !== void 0 ? _b : index_js_1.Points.Empty);
        //eslint-disable-next-line functional/no-let
        var velocity = (_c = t.velocity) !== null && _c !== void 0 ? _c : index_js_1.Points.Empty;
        //eslint-disable-next-line functional/no-let
        var x = position.x, y = position.y;
        if (x > maxX) {
            x = maxX;
            velocity = index_js_1.Points.invert(index_js_1.Points.multiply(velocity, dampen), "x");
        }
        else if (x < minX) {
            x = minX;
            velocity = index_js_1.Points.invert(index_js_1.Points.multiply(velocity, dampen), "x");
        }
        if (y > maxY) {
            y = maxY;
            velocity = index_js_1.Points.multiply(index_js_1.Points.invert(velocity, "y"), dampen);
        }
        else if (position.y < minY) {
            y = minY;
            velocity = index_js_1.Points.invert(index_js_1.Points.multiply(velocity, dampen), "y");
        }
        return Object.freeze(__assign(__assign({}, t), { position: { x: x, y: y }, velocity: velocity }));
    };
};
exports.constrainBounce = constrainBounce;
/**
 * For a given set of attractors, returns a function that a sets acceleration of attractee.
 * Keep note though that this bakes-in the values of the attractor, it won't reflect changes to their state. For dynamic
 * attractors, it might be easier to use `computeAttractionForce`.
 *
 * @example Force
 * ```js
 * const f = Forces.attractionForce(sun, gravity);
 * earth = Forces.apply(earth, f);
 * ```
 *
 * @example Everything mutually attracted
 * ```js
 * // Create a force with all things as attractors.
 * const f = Forces.attractionForce(things, gravity);
 * // Apply force to all things.
 * // The function returned by attractionForce will automatically ignore self-attraction
 * things = things.map(a => Forces.apply(a, f));
 * ```
 * @param attractors
 * @param gravity
 * @param distanceRange
 * @returns
 */
var attractionForce = function (attractors, gravity, distanceRange) {
    if (distanceRange === void 0) { distanceRange = {}; }
    return function (attractee) {
        var _a;
        //eslint-disable-next-line functional/no-let
        var accel = (_a = attractee.acceleration) !== null && _a !== void 0 ? _a : index_js_1.Points.Empty;
        attractors.forEach(function (a) {
            if (a === attractee)
                return;
            var f = (0, exports.computeAttractionForce)(a, attractee, gravity, distanceRange);
            accel = index_js_1.Points.sum(accel, f);
        });
        return __assign(__assign({}, attractee), { acceleration: accel });
    };
};
exports.attractionForce = attractionForce;
/**
 * Computes the attraction force between two things.
 * Value for `gravity` will depend on what range is used for `mass`. It's probably a good idea
 * to keep mass to mean something relative - ie 1 is 'full' mass, and adjust the `gravity`
 * value until it behaves as you like. Keeping mass in 0..1 range makes it easier to apply to
 * visual properties later.
 *
 * @example Attractee and attractor, gravity 0.005
 * ```js
 * const attractor = { position: { x:0.5, y:0.5 }, mass: 1 };
 * const attractee = { position: Points.random(), mass: 0.01 };
 * attractee = Forces.apply(attractee, Forces.computeAttractionForce(attractor, attractee, 0.005));
 * ```
 *
 * @example Many attractees for one attractor, gravity 0.005
 * ```js
 * attractor =  { position: { x:0.5, y:0.5 }, mass: 1 };
 * attractees = attractees.map(a => Forces.apply(a, Forces.computeAttractionForce(attractor, a, 0.005)));
 * ```
 *
 * @example Everything mutually attracted
 * ```js
 * // Create a force with all things as attractors.
 * const f = Forces.attractionForce(things, gravity);
 * // Apply force to all things.
 * // The function returned by attractionForce will automatically ignore self-attraction
 * things = things.map(a => Forces.apply(a, f));
 * ```
 *
 * `attractor` thing attracting (eg, earth)
 * `attractee` thing being attracted (eg. satellite)
 *
 *
 * `gravity` will have to be tweaked to taste.
 * `distanceRange` clamps the computed distance. This affects how tightly the particles will orbit and can also determine speed. By default it is 0.001-0.7
 * @param attractor Attractor (eg earth)
 * @param attractee Attractee (eg satellite)
 * @param gravity Gravity constant
 * @param distanceRange Min/max that distance is clamped to.
 * @returns
 */
var computeAttractionForce = function (attractor, attractee, gravity, distanceRange) {
    var _a, _b, _c, _d;
    if (distanceRange === void 0) { distanceRange = {}; }
    if (attractor.position === undefined)
        throw new Error("attractor.position not set");
    if (attractee.position === undefined)
        throw new Error("attractee.position not set");
    var distRangeMin = (_a = distanceRange.min) !== null && _a !== void 0 ? _a : 0.01;
    var distRangeMax = (_b = distanceRange.max) !== null && _b !== void 0 ? _b : 0.7;
    // Vector between objects
    var f = index_js_1.Points.normalise(index_js_1.Points.subtract(attractor.position, attractee.position));
    // Distance
    var d = (0, Clamp_js_1.clamp)(index_js_1.Points.distance(f), distRangeMin, distRangeMax);
    // Multiply vector by gravity, scaled by mass of things and distance
    return index_js_1.Points.multiply(f, (gravity * ((_c = attractor.mass) !== null && _c !== void 0 ? _c : 1) * ((_d = attractee.mass) !== null && _d !== void 0 ? _d : 1)) / (d * d));
};
exports.computeAttractionForce = computeAttractionForce;
/**
 * A force that moves a thing toward `targetPos`.
 *
 * ```js
 * const t = Forces.apply(t, Forces.targetForce(targetPos));
 * ```
 * @param targetPos
 * @param diminishBy Scales acceleration. Defaults to 0.001.
 * @returns
 */
var targetForce = function (targetPos, opts) {
    if (opts === void 0) { opts = {}; }
    var fn = function (t) {
        var _a, _b;
        var accel = (0, exports.computeAccelerationToTarget)(targetPos, (_a = t.position) !== null && _a !== void 0 ? _a : { x: 0.5, y: 0.5 }, opts);
        return __assign(__assign({}, t), { acceleration: index_js_1.Points.sum((_b = t.acceleration) !== null && _b !== void 0 ? _b : index_js_1.Points.Empty, accel) });
    };
    return fn;
};
exports.targetForce = targetForce;
/**
 * Returns `pt` with x and y set to `setpoint` if either's absolute value is below `v`
 * @param pt
 * @param v
 * @returns
 */
var roundTo = function (pt, v, setpoint) {
    var x = Math.abs(pt.x);
    var y = Math.abs(pt.y);
    if (x < v && y < v)
        return { x: setpoint, y: setpoint };
    if (x < v)
        return { x: setpoint, y: pt.y };
    if (y < v)
        return { x: pt.x, y: setpoint };
    return pt;
};
/**
 * Apply a series of force functions or forces to `t`. Null/undefined entries are skipped silently.
 * It also updates the velocity and position of the returned version of `t`.
 *
 * ```js
 * // Wind adds acceleration. Force is dampened by mass
 * const wind = Forces.accelerationForce({ x: 0.00001, y: 0 }, `dampen`);
 *
 * // Gravity adds acceleration. Force is magnified by mass
 * const gravity = Forces.accelerationForce({ x: 0, y: 0.0001 }, `multiply`);
 *
 * // Friction is calculated based on velocity. Force is magnified by mass
 * const friction = Forces.velocityForce(0.00001, `multiply`);
 *
 *  // Flip movement velocity if we hit a wall. And dampen it by 10%
 * const bouncer = Forces.constrainBounce({ width: 1, height: 1 }, 0.9);
 *
 * let t = {
 *  position: Points.random(),
 *  mass: 0.1
 * };
 *
 * // Apply list of forces, returning a new version of the thing
 * t = Forces.apply(t,
 *   gravity,
 *   wind,
 *   friction,
 *   bouncer
 * );
 * ```
 */
var apply = function (t) {
    var _a, _b, _c;
    var accelForces = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        accelForces[_i - 1] = arguments[_i];
    }
    if (t === undefined)
        throw new Error("t parameter is undefined");
    accelForces.forEach(function (f) {
        var _a;
        if (f === null || f === undefined)
            return;
        if (typeof f === "function") {
            t = f(t);
        }
        else {
            t = __assign(__assign({}, t), { acceleration: index_js_1.Points.sum((_a = t.acceleration) !== null && _a !== void 0 ? _a : index_js_1.Points.Empty, f) });
        }
    });
    // Integate velocity from acceleration
    var velo = (0, exports.computeVelocity)((_a = t.acceleration) !== null && _a !== void 0 ? _a : index_js_1.Points.Empty, (_b = t.velocity) !== null && _b !== void 0 ? _b : index_js_1.Points.Empty);
    // Compute position
    var pos = (0, exports.computePositionFromVelocity)((_c = t.position) !== null && _c !== void 0 ? _c : index_js_1.Points.Empty, velo);
    var ff = __assign(__assign({}, t), { position: pos, velocity: velo, 
        // Clear accel, because it has been integrated into velocity
        acceleration: index_js_1.Points.Empty });
    return ff;
};
exports.apply = apply;
/**
 * Apples `vector` to acceleration, scaling according to mass, based on the `mass` option.
 * It returns a function which can later be applied to a thing.
 *
 * ```js
 * import { Forces } from "https://unpkg.com/ixfx/dist/modulation.js"
 * // Acceleration vector of (0.1, 0), ie moving straight on horizontal axis
 * const f = Forces.accelerationForce({ x:0.1, y:0 }, `dampen`);
 *
 * // Thing to move
 * let t = { position: ..., acceleration: ... }
 *
 * // Apply force
 * t = f(t);
 * ```
 * @param vector
 * @returns Force function
 */
var accelerationForce = function (vector, mass) {
    if (mass === void 0) { mass = "ignored"; }
    return function (t) { return Object.freeze(__assign(__assign({}, t), { acceleration: massApplyAccel(vector, t, mass) //Points.sum(t.acceleration ?? Points.Empty, op(t.mass ?? 1))
     })); };
};
exports.accelerationForce = accelerationForce;
/**
 * Returns an acceleration vector with mass either dampening or multiplying it.
 * The passed-in `thing` is not modified.
 *
 * ```js
 * // Initial acceleration vector
 * const accel = { x: 0.1, y: 0};
 *
 * // Thing being moved
 * const thing = { mass: 0.5, position: ..., acceleration: ... }
 *
 * // New acceleration vector, affected by mass of `thing`
 * const accelWithMass = massApplyAccel(accel, thing, `dampen`);
 * ```
 * Mass of thing can be factored in, according to `mass` setting. Use `dampen`
 * to reduce acceleration with greater mass of thing. Use `multiply` to increase
 * the effect of acceleration with a greater mass of thing. `ignored` means
 * mass is not taken into account.
 *
 * If `t` has no mass, the `mass` setting is ignored.
 *
 * This function is used internally by the predefined forces.
 *
 * @param vector Vector force
 * @param thing Thing being affected
 * @param mass How to factor in mass of thing (default ignored)
 * @returns Acceleration vector
 */
var massApplyAccel = function (vector, thing, mass) {
    var _a, _b;
    if (mass === void 0) { mass = "ignored"; }
    //eslint-disable-next-line functional/no-let
    var op;
    if (mass === "dampen")
        op = function (mass) { return index_js_1.Points.divide(vector, mass, mass); };
    else if (mass === "multiply")
        op = function (mass) { return index_js_1.Points.multiply(vector, mass, mass); };
    else if (mass === "ignored") {
        op = function (_mass) { return vector; };
    }
    else {
        throw new Error("Unknown 'mass' parameter '".concat(mass, ". Expected 'dampen', 'multiply' or 'ignored'"));
    }
    return index_js_1.Points.sum((_a = thing.acceleration) !== null && _a !== void 0 ? _a : index_js_1.Points.Empty, op((_b = thing.mass) !== null && _b !== void 0 ? _b : 1));
    // if (t.mass) {
    //   if (dampen) return Points.sum(t.acceleration ?? Points.Empty, Points.divide(v, t.mass ?? 1));
    //   else return Points.sum(t.acceleration ?? Points.Empty, Points.multiply(v, t.mass ?? 1));
    // }
    // return v;
};
/**
 * A force based on the square of the thing's velocity.
 * It's like {@link velocityForce}, but here the velocity has a bigger impact.
 *
 * ```js
 * const thing = {
 *  position: { x: 0.5, y:0.5 },
 *  velocity: { x: 0.001, y:0 }
 * };
 * const drag = magnitudeForce(0.1);
 *
 * // Apply drag force to thing, returning result
 * const t = Forces.apply(thing, drag);
 * ```
 * @param force Force value
 * @param mass How to factor in mass
 * @returns Function that computes force
 */
var magnitudeForce = function (force, mass) {
    if (mass === void 0) { mass = "ignored"; }
    return function (t) {
        if (t.velocity === undefined)
            return t;
        var mag = index_js_1.Points.distance(index_js_1.Points.normalise(t.velocity));
        var magSq = force * mag * mag;
        var vv = index_js_1.Points.multiply(index_js_1.Points.invert(t.velocity), magSq);
        return Object.freeze(__assign(__assign({}, t), { acceleration: massApplyAccel(vv, t, mass) }));
    };
};
exports.magnitudeForce = magnitudeForce;
/**
 * Null force does nothing
 * @returns A force that does nothing
 */
var nullForce = function (t) { return t; };
exports.nullForce = nullForce;
/**
 * Force calculated from velocity of object. Reads velocity and influences acceleration.
 *
 * ```js
 * let t = { position: Points.random(), mass: 0.1 };
 * const friction = velocityForce(0.1, `dampen`);
 *
 * // Apply force, updating position and velocity
 * t = Forces.apply(t, friction);
 * ```
 * @param force Force
 * @param mass How to factor in mass
 * @returns Function that computes force
 */
var velocityForce = function (force, mass) {
    // Invert velocity and then multiply by force
    var pipeline = index_js_1.Points.pipeline(
    // Points.normalise, 
    index_js_1.Points.invert, function (v) { return index_js_1.Points.multiply(v, force); });
    return function (t) {
        if (t.velocity === undefined)
            return t;
        // Apply pipeline
        var v = pipeline(t.velocity);
        return Object.freeze(__assign(__assign({}, t), { acceleration: massApplyAccel(v, t, mass) }));
    };
};
exports.velocityForce = velocityForce;
/**
 * Sets angle, angularVelocity and angularAcceleration based on
 *  angularAcceleration, angularVelocity, angle
 * @returns
 */
var angularForce = function () { return function (t) {
    var _a, _b, _c;
    var acc = (_a = t.angularAcceleration) !== null && _a !== void 0 ? _a : 0;
    var vel = (_b = t.angularVelocity) !== null && _b !== void 0 ? _b : 0;
    var angle = (_c = t.angle) !== null && _c !== void 0 ? _c : 0;
    var v = vel + acc;
    var a = angle + v;
    return Object.freeze(__assign(__assign({}, t), { angle: a, angularVelocity: v, angularAcceleration: 0 }));
}; };
exports.angularForce = angularForce;
// export const positionFromAngleForce = () => (t:ForceAffected) => {
//   return Object.freeze({
//     ...t,
//     position: computePositionFromAngle()
//   });
// };
/**
 * Yields a force function that applies the thing's acceleration.x to its angular acceleration.
 * @param scaling Use this to scale the accel.x value. Defaults to 20 (ie accel.x*20). Adjust if rotation is too much or too little
 * @returns
 */
var angleFromAccelerationForce = function (scaling) {
    if (scaling === void 0) { scaling = 20; }
    return function (t) {
        var _a;
        var accel = (_a = t.acceleration) !== null && _a !== void 0 ? _a : index_js_1.Points.Empty;
        return Object.freeze(__assign(__assign({}, t), { angularAcceleration: accel.x * scaling }));
    };
};
exports.angleFromAccelerationForce = angleFromAccelerationForce;
/**
 * Yields a force function that applies the thing's velocity to its angular acceleration.
 * This will mean it points in the direction of travel.
 * @param interpolateAmt If provided, the angle will be interpolated toward by this amount. Defaults to 1, no interpolation
 * @returns
 */
var angleFromVelocityForce = function (interpolateAmt) {
    if (interpolateAmt === void 0) { interpolateAmt = 1; }
    return function (t) {
        var _a, _b;
        var a = index_js_1.Points.angle((_a = t.velocity) !== null && _a !== void 0 ? _a : index_js_1.Points.Empty);
        return Object.freeze(__assign(__assign({}, t), { angle: interpolateAmt < 1 ? (0, Interpolate_js_1.interpolateAngle)(interpolateAmt, (_b = t.angle) !== null && _b !== void 0 ? _b : 0, a) : a }));
    };
};
exports.angleFromVelocityForce = angleFromVelocityForce;
/**
 * Spring force
 *
 *  * ```js
 * // End of spring that moves
 * let thing = {
 *   position: { x: 1, y: 0.5 },
 *   mass: 0.1
 * };
 *
 * // Anchored other end of spring
 * const pinnedAt = {x: 0.5, y: 0.5};
 *
 * // Create force: length of 0.4
 * const springForce = Forces.springForce(pinnedAt, 0.4);
 *
 * continuously(() => {
 *  // Apply force
 *  thing = Forces.apply(thing, springForce);
 * }).start();
 * ```
 * [Read more](https://www.joshwcomeau.com/animation/a-friendly-introduction-to-spring-physics/)
 *
 * @param pinnedAt Anchored end of the spring
 * @param restingLength Length of spring-at-rest (default: 0.5)
 * @param k Spring stiffness (default: 0.0002)
 * @param damping Damping factor to apply, so spring slows over time. (default: 0.995)
 * @returns
 */
var springForce = function (pinnedAt, restingLength, k, damping) {
    if (restingLength === void 0) { restingLength = 0.5; }
    if (k === void 0) { k = 0.0002; }
    if (damping === void 0) { damping = 0.999; }
    return function (t) {
        var _a, _b;
        var dir = index_js_1.Points.subtract((_a = t.position) !== null && _a !== void 0 ? _a : index_js_1.Points.Empty, pinnedAt);
        var mag = index_js_1.Points.distance(dir);
        var stretch = Math.abs(restingLength - mag);
        //console.log(`mag: ${mag.toPrecision(3)} stretch: ${stretch.toPrecision(3)} resting: ${restingLength} dir: ${dir.x.toPrecision(3)}, ${dir.y.toPrecision(3)}`);
        //console.log(`pinnedAt: ${pinnedAt.x}, ${pinnedAt.y} pos: ${t.position?.x}, ${t.position?.y}`);
        //console.log(t.velocity);
        var f = index_js_1.Points.pipelineApply(dir, index_js_1.Points.normalise, function (p) { return index_js_1.Points.multiply(p, -k * stretch); });
        var accel = massApplyAccel(f, t, "dampen");
        var velo = (0, exports.computeVelocity)(accel !== null && accel !== void 0 ? accel : index_js_1.Points.Empty, (_b = t.velocity) !== null && _b !== void 0 ? _b : index_js_1.Points.Empty);
        var veloDamped = index_js_1.Points.multiply(velo, damping, damping);
        return __assign(__assign({}, t), { velocity: veloDamped, acceleration: index_js_1.Points.Empty });
    };
};
exports.springForce = springForce;
/**
 * The pendulum force swings something back and forth.
 *
 * ```js
 * // Swinger
 * let thing = {
 *   position: { x: 1, y: 0.5 },
 *   mass: 0.1
 * };
 *
 * // Position thing swings from (middle of screen)
 * const pinnedAt = {x: 0.5, y: 0.5};
 *
 * // Create force: length of 0.4
 * const pendulumForce = Forces.pendulumForce(pinnedAt, { length: 0.4 });
 *
 * continuously(() => {
 *  // Apply force
 *  // Returns a new thing with recalculated angularVelocity, angle and position.
 *  thing = Forces.apply(thing, pendulumForce);
 * }).start();
 * ```
 *
 * [Read more](https://natureofcode.com/book/chapter-3-oscillation/)
 *
 * @param pinnedAt Location to swing from (x:0.5, y:0.5 default)
 * @param opts Options
 * @returns
 */
var pendulumForce = function (pinnedAt, opts) {
    if (pinnedAt === void 0) { pinnedAt = { x: 0.5, y: 0 }; }
    if (opts === void 0) { opts = {}; }
    return function (t) {
        var _a, _b, _c, _d, _e;
        var length = (_a = opts.length) !== null && _a !== void 0 ? _a : index_js_1.Points.distance(pinnedAt, (_b = t.position) !== null && _b !== void 0 ? _b : index_js_1.Points.Empty);
        var speed = (_c = opts.speed) !== null && _c !== void 0 ? _c : 0.001;
        var damping = (_d = opts.damping) !== null && _d !== void 0 ? _d : 0.995;
        //eslint-disable-next-line functional/no-let
        var angle = t.angle;
        if (angle === undefined) {
            if (t.position) {
                angle = index_js_1.Points.angle(pinnedAt, t.position) - Math.PI / 2;
            }
            else {
                angle = 0; // Position wherever
            }
        }
        var accel = (-1 * speed / length) * Math.sin(angle);
        var v = ((_e = t.angularVelocity) !== null && _e !== void 0 ? _e : 0) + accel;
        angle += v;
        return Object.freeze({
            angularVelocity: v * damping,
            angle: angle,
            position: (0, exports.computePositionFromAngle)(length, angle + Math.PI / 2, pinnedAt)
        });
    };
};
exports.pendulumForce = pendulumForce;
/**
 * Compute velocity based on acceleration and current velocity
 * @param acceleration Acceleration
 * @param velocity Velocity
 * @param velocityMax If specified, velocity will be capped at this value
 * @returns
 */
var computeVelocity = function (acceleration, velocity, velocityMax) {
    var p = index_js_1.Points.sum(velocity, acceleration);
    if (velocityMax !== undefined)
        return index_js_1.Points.clampMagnitude(p, velocityMax);
    else
        return p;
};
exports.computeVelocity = computeVelocity;
/**
 * Returns the acceleration to get from `currentPos` to `targetPos`.
 *
 * @example Barebones usage:
 * ```js
 * const accel = Forces.computeAccelerationToTarget(targetPos, currentPos);
 * const vel = Forces.computeVelocity(accel, currentVelocity);
 *
 * // New position:
 * const pos = Points.sum(currentPos, vel);
 * ```
 *
 * @example Implementation:
 * ```js
 * const direction = Points.subtract(targetPos, currentPos);
 * const accel = Points.multiply(direction, diminishBy);
 * ```
 * @param currentPos Current position
 * @param targetPos Target position
 * @param opts Options
 * @returns
 */
var computeAccelerationToTarget = function (targetPos, currentPos, opts) {
    var _a;
    if (opts === void 0) { opts = {}; }
    var diminishBy = (_a = opts.diminishBy) !== null && _a !== void 0 ? _a : 0.001;
    // Compare to current position of thing to get vector direction
    var direction = index_js_1.Points.subtract(targetPos, currentPos);
    if (opts.range) {
        // If direction is less than range, return { x: 0, y: 0}
        if (index_js_1.Points.compare(index_js_1.Points.abs(direction), opts.range) === -2)
            return index_js_1.Points.Empty;
    }
    // Diminish vector to make a meaningful acceleration
    return index_js_1.Points.multiply(direction, diminishBy);
};
exports.computeAccelerationToTarget = computeAccelerationToTarget;
/**
 * Compute a new position based on existing position and velocity vector
 * @param position Position Current position
 * @param velocity Velocity vector
 * @returns Point
 */
var computePositionFromVelocity = function (position, velocity) { return index_js_1.Points.sum(position, velocity); };
exports.computePositionFromVelocity = computePositionFromVelocity;
/**
 * Compute a position based on distance and angle from origin
 * @param distance Distance from origin
 * @param angleRadians Angle, in radians from origin
 * @param origin Origin point
 * @returns Point
 */
var computePositionFromAngle = function (distance, angleRadians, origin) { return index_js_1.Polar.toCartesian(distance, angleRadians, origin); };
exports.computePositionFromAngle = computePositionFromAngle;
var _angularForce = (0, exports.angularForce)();
var _angleFromAccelerationForce = (0, exports.angleFromAccelerationForce)();
/**
 * A force that orients things according to direction of travel.
 *
 * Under the hood, it applies:
 * * angularForce,
 * * angleFromAccelerationForce, and
 * * angleFromVelocityForce
 * @param interpolationAmt
 * @returns
 */
var orientationForce = function (interpolationAmt) {
    if (interpolationAmt === void 0) { interpolationAmt = 0.5; }
    var angleFromVel = (0, exports.angleFromVelocityForce)(interpolationAmt);
    return function (t) {
        t = _angularForce(t);
        t = _angleFromAccelerationForce(t);
        t = angleFromVel(t);
        return t;
    };
};
exports.orientationForce = orientationForce;
//# sourceMappingURL=Forces.js.map