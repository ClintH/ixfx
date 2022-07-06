/**
 * Acknowledgements: much of the work here is an adapation from Daniel Shiffman's excellent _The Nature of Code_ website.
 */
import {Points, Polar} from '../geometry/index.js';
import { Point} from '../geometry/Point.js';
import {clamp, interpolateAngle} from '../Util.js';
import {Rect, getEdgeX, getEdgeY} from '../geometry/Rect.js';

/**
 * Logic for applying mass
 */
export type MassApplication = `dampen`|`multiply`|`ignored`;


/**
 * Basic properties of a thing that can be
 * affected by forces
 */
export type ForceAffected = {
  /**
   * Position. Probably best to use relative coordinates
   */
  readonly position?:Point
  /**
   * Velocity vector. 
   * Probably don't want to assign this yourself, but rather have it computed based on acceleration and applied forces
   */
  readonly velocity?:Point
  /**
   * Acceleration vector. Most applied forces will alter the acceleration, culminating in a new velocity being set and the
   * acceleraton value zeroed
   */
  readonly acceleration?:Point
  /**
   * Mass. The unit is undefined, again best to think of this being on a 0..1 scale. Mass is particularly important
   * for the attraction/repulsion force, but other forces can incorporate mass too.
   */
  readonly mass?:number

  readonly angularAcceleration?:number;

  readonly angularVelocity?:number;

  readonly angle?:number;
};

/**
 * A function that updates values of a thing.
 * 
 * These can be created using the xxxForce functions, eg {@link attractionForce}, {@link accelerationForce}, {@link magnitudeForce}, {@link velocityForce}
 */
export type ForceFn = (t:ForceAffected) => ForceAffected;

/**
 * A vector to apply to acceleration or a force function
 */
export type ForceKind = Points.Point|ForceFn;

/**
 * Throws an error if `t` is not of the `ForceAffected` shape.
 * @param t
 * @param name 
 */
export const guard = (t:ForceAffected, name:string= `t`) => {
  if (t === undefined) throw new Error(`Parameter ${name} is undefined. Expected ForceAffected`);
  if (t === null) throw new Error(`Parameter ${name} is null. Expected ForceAffected`);
  if (typeof t !== `object`) throw new Error(`Parameter ${name} is type ${typeof t}. Expected object of shape ForceAffected`);
};


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
export const constrainBounce = (bounds:Rect = {width:1, height:1}, dampen=1) => {
  const minX = getEdgeX(bounds, `left`);
  const maxX = getEdgeX(bounds, `right`);
  const minY = getEdgeY(bounds, `top`);
  const maxY = getEdgeY(bounds, `bottom`);

  return (t:ForceAffected):ForceAffected => {
    const position = computePositionFromVelocity(t.position ?? Points.Empty, t.velocity ?? Points.Empty);
    //eslint-disable-next-line functional/no-let
    let velocity = t.velocity ?? Points.Empty;
    //eslint-disable-next-line functional/no-let
    let {x, y} = position;
  
    if (x > maxX) {
      x = maxX;
      velocity = Points.invert(Points.multiply(velocity, dampen), `x`);
    } else if (x < minX) {
      x = minX;
      velocity = Points.invert(Points.multiply(velocity, dampen), `x`);
    }

    if (y > maxY) {
      y = maxY;
      velocity = Points.multiply(Points.invert(velocity, `y`), dampen);
    } else if (position.y < minY) {
      y = minY;
      velocity = Points.invert(Points.multiply(velocity, dampen), `y`);
    }
    
    return Object.freeze({
      ...t,
      position: {x, y},
      velocity
    });
  };
};


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
export const attractionForce = (attractors:readonly ForceAffected[], gravity:number,  distanceRange:{readonly min?:number, readonly max?:number} = {}) => (attractee:ForceAffected):ForceAffected => {
  //eslint-disable-next-line functional/no-let
  let accel = attractee.acceleration ?? Points.Empty;
  attractors.forEach(a => {
    if (a === attractee) return;

    const f = computeAttractionForce(a, attractee, gravity, distanceRange);
    accel = Points.sum(accel, f);
  });
  return {
    ...attractee,
    acceleration: accel
  };
};


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
export const computeAttractionForce = (attractor:ForceAffected, attractee:ForceAffected, gravity:number, distanceRange:{readonly min?:number, readonly max?:number} = {}):Points.Point => {
  if (attractor.position === undefined) throw new Error(`attractor.position not set`);
  if (attractee.position === undefined) throw new Error(`attractee.position not set`);
  
  const distRangeMin = distanceRange.min ??  0.01;
  const distRangeMax = distanceRange.max ?? 0.7;

  // Vector between objects
  const f = Points.normalise(Points.subtract(attractor.position, attractee.position));
  
  // Distance
  const d = clamp(Points.distance(f), distRangeMin, distRangeMax);
  
  // Multiply vector by gravity, scaled by mass of things and distance
  return Points.multiply(f, (gravity * (attractor.mass ?? 1) * (attractee.mass ?? 1)) / (d * d));
};

/**
 * Returns `pt` with x and y set to `setpoint` if either is below `v`
 * @param pt 
 * @param v 
 * @returns 
 */
const roundTo = (pt:Point, v:number, setpoint:number):Point => {
  const x = Math.abs(pt.x);
  const y = Math.abs(pt.y);

  if (x < v && y < v) return {x:setpoint, y:setpoint};
  if (x < v) return {x:setpoint, y:pt.y};
  if (y < v) return {x:pt.x, y:setpoint};
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
export const apply = (t:ForceAffected, ...accelForces:readonly ForceKind[]):ForceAffected => {
  if (t === undefined) throw new Error(`t parameter is undefined`);

  accelForces.forEach(f => {
    if (f === null || f=== undefined) return;
    if (typeof f === `function`) {
      t = f(t);
    } else {
      t = {
        ...t,
        acceleration: Points.sum(t.acceleration ?? Points.Empty, f)
      };
    }
  });

  // Integate velocity from acceleration
  const velo = computeVelocity(t.acceleration ?? Points.Empty, t.velocity ?? Points.Empty);
  
  // Compute position
  const pos = computePositionFromVelocity(t.position ?? Points.Empty, velo);

  const ff:ForceAffected= {
    ...t,
    position: pos,
    velocity: velo,
    acceleration: Points.Empty
  };
  return ff;
};


/**
 * Apples vector `v` to acceleration, scaling according to mass, based on the `mass` option.
 * ```js
 * const f = accelerationForce({ x:0.1, y:0 }, `dampen`);
 * let t = { position: ..., acceleration: ... }
 * t = f(t); // Apply force  
 * ```
 * @param v 
 * @returns 
 */
export const accelerationForce = (v:Points.Point, mass:MassApplication):ForceFn => (t:ForceAffected) => Object.freeze({
  ...t,
  acceleration: massApplyAccel(v, t, mass) //Points.sum(t.acceleration ?? Points.Empty, op(t.mass ?? 1))
});


/**
 * Applies for `v` to `t`'s acceleration, returning result.
 * @param v Vector force
 * @param t Thing being affected
 * @param mass How to factor in mass of thing
 * @returns Acceleration vector
 */
const massApplyAccel = (v:Points.Point, t:ForceAffected, mass: MassApplication) => {
  //eslint-disable-next-line functional/no-let
  let op;
  if (mass === `dampen`) op =  (mass:number) => Points.divide(v, mass, mass);
  else if (mass === `multiply`) op = (mass:number) => Points.multiply(v, mass, mass);
  else if (mass === `ignored`) {
    op =  (_mass:number) => v;
  } else {
    throw new Error(`Unknown 'mass' parameter '${mass}. Exepected 'dampen', 'multiply' or 'ignored'`);
  }
  return Points.sum(t.acceleration ?? Points.Empty, op(t.mass ?? 1));
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
export const magnitudeForce = (force:number, mass:MassApplication):ForceFn =>  (t:ForceAffected):ForceAffected => {
  if (t.velocity === undefined) return t;

  const mag = Points.distance(Points.normalise(t.velocity));
  const magSq = force* mag * mag;
  const vv = Points.multiply(Points.invert(t.velocity), magSq);
  return Object.freeze({
    ...t,
    acceleration: massApplyAccel(vv, t, mass)
  });
}
;

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
export const velocityForce = (force:number, mass: MassApplication):ForceFn => {
  // Invert velocity and then multiply by force
  const pipeline = Points.pipeline(
    // Points.normalise, 
    Points.invert, 
    (v:Point) => Points.multiply(v, force),
  );

  return (t:ForceAffected):ForceAffected => {
    if (t.velocity === undefined) return t;

    // Apply pipeline
    const v = pipeline(t.velocity);    
    return Object.freeze({
      ...t,
      acceleration: massApplyAccel(v, t, mass)
    });
  };
};

export const angularForce = () => (t:ForceAffected) => {
  const acc = t.angularAcceleration ?? 0;
  const vel = t.angularVelocity ?? 0;
  const angle = t.angle ?? 0;

  const v = vel + acc;
  const a = angle + v;

  return Object.freeze({
    ...t,
    angle: a,
    angularVelocity: v,
    angularAcceleration: 0 
  });
};

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
export const angleFromAccelerationForce = (scaling:number = 20) => (t:ForceAffected) => {
  const accel = t.acceleration ?? Points.Empty;
  return Object.freeze({
    ...t,
    angularAcceleration: accel.x*scaling
  });
};

/**
 * Yields a force function that applies the thing's velocity to its angular acceleration.
 * This will mean it points in the direction of travel.
 * @param interpolateAmt If provided, the angle will be interpolated toward by this amount. Defaults to 1, no interpolation
 * @returns 
 */
export const angleFromVelocityForce = (interpolateAmt:number = 1) => (t:ForceAffected) => {
  const a = Points.angle(t.velocity ?? Points.Empty);
  return Object.freeze({
    ...t,
    angle: interpolateAmt < 1 ? interpolateAngle(interpolateAmt, t.angle ?? 0, a) : a
  });
};

export const springForce = (pinnedAt:Points.Point, restingLength:number = 1) => {
  const k = 0.05;
  return (t:ForceAffected):ForceAffected => {
    const force = Points.subtract(t.position ?? Points.Empty, pinnedAt);
    const mag = Points.distance(force);
    const stretch = mag - restingLength;
    const f = Points.pipelineApply(
      force,
      Points.normalise,
      p => Points.multiply(p, -1 * k * stretch)
    );
    return {
      ...t,
      acceleration: massApplyAccel(f, t, `dampen`)
    };
  };
};

export const pendulumForce = (pinnedAt:Points.Point = {x:0.5, y:0}, length = 10, gravity= 0.02, damping = 0.995) => (t:ForceAffected):ForceAffected => {
  //eslint-disable-next-line functional/no-let
  let angle = t.angle;
  if (angle === undefined) {
    if (t.position) {
      angle = Points.angle(pinnedAt, t.position) - Math.PI/2;
    } else {
      angle = 0; // Position wherever
    }
  }
  const accel = (-1 * gravity / length) * Math.sin(angle);
  const v = (t.angularVelocity ?? 0) + accel;
  angle += v;
    
  return Object.freeze({
    angularVelocity: v * damping,
    angle,
    position: computePositionFromAngle(length, angle+Math.PI/2, pinnedAt)
  });
};

/**
 * Compute velocity based on acceleration and current velocity
 * @param acceleration Acceleration
 * @param velocity Velocity
 * @returns 
 */
export const computeVelocity = (acceleration:Points.Point, velocity:Points.Point):Points.Point => Points.sum(velocity, acceleration);

/**
 * Compute position based on current position and velocity
 * @param position Position
 * @param velocity Velocity
 * @returns New position
 */
export const computePositionFromVelocity = (position:Points.Point, velocity:Points.Point):Points.Point => Points.sum(position, velocity);

export const computePositionFromAngle = (distance:number, angle:number, origin:Points.Point) => Polar.toCartesian(distance, angle, origin);
