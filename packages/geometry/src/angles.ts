import type { PointAverageKinds } from './point/averager.js';
import type { Point } from './point/point-type.js';
import { piPi } from './pi.js';
import { average as pointAverage } from './point/averager.js';

/**
 * Convert angle in degrees to angle in radians.
 * @param angleInDegrees
 * @returns Radian
 */
export function degreeToRadian(angleInDegrees: number): number;

/**
 * Convert angles in degrees to angles in radians
 * @param angleInDegrees
 */
export function degreeToRadian(angleInDegrees: readonly number[]): readonly number[];

export function degreeToRadian(angleInDegrees: number | readonly number[]): number | readonly number[] {
  return Array.isArray(angleInDegrees) ? angleInDegrees.map(v => v * (Math.PI / 180)) : (angleInDegrees as number) * (Math.PI / 180);
}

/**
 * Inverts the angle so it points in the opposite direction of a unit circle
 * @param angleInRadians
 * @returns Radians
 */
export function radianInvert(angleInRadians: number): number {
  return (angleInRadians + Math.PI) % (2 * Math.PI);
}

export function degreeToGradian(angleInDegrees: number): number {
  return angleInDegrees * 1.111111;
}

/**
 * Returns the gradian value converted to degrees.
 * By default it wraps, so any value 360 or greater wraps around.
 * @param angleInGradians
 * @param wrap
 * @returns Degrees
 */
export function gradianToDegree(angleInGradians: number, wrap = true): number {
  if (wrap)
    return (angleInGradians * 0.9) % 360;
  return angleInGradians * 0.9;
}

export function radianToGradian(angleInRadians: number): number {
  return angleInRadians * 63.6619772368; // 200/pi
}

export function gradianToRadian(angleInGradian: number): number {
  return angleInGradian * 0.0157079633; // pi/200
}

/**
 * Convert angle in radians to angle in degrees
 * @param angleInRadians
 * @returns Degrees
 */
export function radianToDegree(angleInRadians: number): number;

/**
 * Convert angles in radians to angles in degrees
 * @param angleInRadians
 */
export function radianToDegree(angleInRadians: readonly number[]): readonly number[];

export function radianToDegree(angleInRadians: number | readonly number[]): number | readonly number[] {
  return Array.isArray(angleInRadians) ? angleInRadians.map(v => v * 180 / Math.PI) : (angleInRadians as number) * 180 / Math.PI;
}

/**
 * Angle from x-axis to point (ie. `Math.atan2`)
 * @param point
 * @returns Radians
 */
export const radiansFromAxisX = (point: Point): number => Math.atan2(point.x, point.y);

/**
 * Sum angles together, accounting for the 'wrap around'.
 *
 * `clockwise` of _true_ (default) means angles are added in clockwise direction
 *
 * ```js
 * // From 180deg, add 90deg in the clockwise direction
 * radiansSum(Math.PI, Math.PI/2, true);
 * ```
 *
 * Orientation of angles is as follows:
 * ```
 *       90deg
 *       Pi/2
 *        |
 * Pi  ---+--- 0
 * 180    |
 *       3PI/2
 *       270deg
 * ```
 * {@link degreesSum} is the same, but uses degrees (0..360)
 * @param start Starting angle, in radian
 * @param amount Angle to add, in radian
 * @param clockwise Add in clockwise direction (default: _true_)
 * @returns Sum result, in radians
 */
export function radiansSum(start: number, amount: number, clockwise = true): number {
  if (clockwise) {
    let x = start + amount;
    if (x >= piPi)
      x = x % piPi;
    return x;
  } else {
    const x = start - amount;
    if (x < 0) {
      return piPi + x;
    }
    return x;
  }
}

/**
 * Sum angles together, accounting for the 'wrap around'.
 *
 * `clockwise` of _true_ (default) means angles are added in clockwise direction
 *
 * ```js
 * // From 180deg, add 90deg in the clockwise direction
 * radiansSum(180, 90, true);
 * ```
 *
 * {@link radiansSum} is the same, but uses radians (0..2 Pi)
 *
 * Orientation of angles is as follows:
 * ```
 *       90
 *        |
 * 180 ---+--- 0
 *        |
 *       270
 * ```
 * @param start Starting angle, in degrees
 * @param amount Angle to add, in degrees
 * @param clockwise Add in clockwise direction (default: _true_)
 * @returns Sum result, in degrees
 */
export const degreesSum = (start: number, amount: number, clockwise = true): number => radianToDegree(radiansSum(degreeToRadian(start), degreeToRadian(amount), clockwise));

/**
 * Computes the angle arc between a start and end angle,
 * given in radians. It properly accounts for the wrap-around
 * values.
 *
 * Note that clockwise direction yields a negative angle.
 * ```js
 * // Between 0-90deg in clockwise direction
 * radianArc(0, Math.PI/2, true); // Yields: 3Pi/2 (270 deg)
 *
 * // In counter-clockwise direction
 * radianArc(0, Math.PI/2, false); // Yields: Math.PI/2 (90deg)
 * ```
 *
 * See {@link degreeArc} to operate in degrees.
 *
 * Orientation of angles is as follows:
 * ```
 *       90deg
 *       PI/2
 *        |
 * Pi  ---+--- 0 2PI
 * 180    |
 *       3PI/2
 *       270deg
 * ```
 * @param start Start angle, in radians
 * @param end End angle, in radians
 * @param direction Calculate in the specified direction (default: _short_)
 * @returns Angle of arc, in radians.
 */
export function radianArc(
  start: number,
  end: number,
  direction: AngleDirection = `short`,
): number {
  // Proper modulo for negatives
  const mod = (n: number, m: number) => ((n % m) + m) % m;

  // Counterclockwise travel in [0, TAU)
  const ccw = mod(end - start, piPi);

  // Clockwise travel in (-TAU, 0]
  const cw = ccw === 0 ? 0 : ccw - piPi;

  switch (direction) {
    case `ccw`:
      // Explicitly allow full revolution when inputs differ by TAU multiples
      return end > start && ccw === 0 ? piPi : ccw;

    case `cw`:
      return end < start && ccw === 0 ? -piPi : cw;

    case `short`: {
      // Equal angles => shortest path is zero
      if (ccw === 0)
        return 0;

      return Math.abs(ccw) <= Math.abs(cw) ? ccw : cw;
    }

    case `long`: {
      // Equal angles but different raw inputs => full revolution
      if (ccw === 0) {
        return start === end ? 0 : piPi;
      }

      return Math.abs(ccw) >= Math.abs(cw) ? ccw : cw;
    }
  }
}

/**
 * Computes the angle arc between a `start` and `end` angle,
 * given in degrees. It properly accounts for the wrap-around
 * values.
 *
 * Clockwise movement is negative.
 *
 * Orientation of angles on a circle is as follows:
 * ```
 *       90
 *        |
 * 180 ---+--- 0
 *        |
 *       270
 * ```
 *
 * Example, from 'east' (0deg) to 'south' (270deg)
 * ```js
 * degreeArc(0, 270);          // 'short' is default, result: -90
 * degreeArc(0, 270, `long`);  // 270
 * degreeArc(0, 270, `short`); // -90
 * degreeArc(0, 270, `cw`);    // clockwise: -90
 * degreeArc(0, 270, `ccw`);   // counter-clockwise: 270
 * ```
 *
 * Or from 'east' (0deg) to 'north' (90deg):
 * ```js
 * degreeArc(0, 90);          // 'short' is default, result: 90
 * degreeArc(0, 90, `long`);  // -270
 * degreeArc(0, 90, `short`); // 90
 * degreeArc(0, 90, `cw`);    // clockwise: -270
 * degreeArc(0, 90, `ccw`);   // counter-clockwise: 90
 * ```
 *
 * Use {@link radianArc} to operate in radians (which this function calls behind the scenes).
 *
 * @param start Start angle, in degrees
 * @param end End angle, in degrees
 * @param direction Calculate in the specified direction (default: _short_)
 * @returns Angle of arc, in degrees.
 */
export function degreeArc(start: number, end: number, direction: AngleDirection = `short`): number {
  return radianToDegree(radianArc(degreeToRadian(start), degreeToRadian(end), direction));
}

/**
 * A angle with unit.
 * - [Degrees](https://en.wikipedia.org/wiki/Degree_(angle)): 0..360
 * - [Radians](https://en.wikipedia.org/wiki/Radian): 0...2Pi
 * - [Gradians](https://en.wikipedia.org/wiki/Gradian): 0..400
 * - [Turns](https://en.wikipedia.org/wiki/Turn_(angle)): 0..1
 *
 *
 * ```
 *             100 grad
 *             1/4 turn
 *              90 deg
 *             PI/2 rad
 *                |
 *  Pi rad        |        0 or 2PI rad
 *  180deg -------+------- 0 or 360 deg
 *  1/2 turn      |        0 or 1 turn
 *  200 grad      |        0 or 400 grad
 *                |
 *             270 deg
 *            3PI/2 rad
 *             3/4 turn
 *             300 grad
 * ```
 */
export type Angle = {
  value: number;
  unit: `deg` | `rad` | `turn` | `grad`;
};

export type AngleRad = { value: number; unit: `rad` };
export type AngleConvertible = Angle | number | string;

export type AngleDirection = `cw` | `ccw` | `short` | `long`;

/**
 * Parses CSS-style angle strings into an 'Angle' type. By default assumes degrees.
 *
 * ```js
 * angleParse(`100`);     // { value: 100, unit: `deg` }
 * angleParse(100);       // { value: 100, unit: `deg` }
 * angleParse(`100deg`);  // { value: 100, unit: `deg` }
 *
 * // More exotic units:
 * angleParse(`100rad`);  // { value: 100, unit: `rad` }
 * angleParse(`100turn`); // { value: 100, unit: `turn` }
 * angleParse(`100grad`); // { value: 100, unit: `grad` }
 * angleParse(`n`); // { value: 90, unit: `deg` }
 * angleParse(`e`); // { value: 0, unit: `deg` }
 * angleParse(`s`); // { value: 270, unit: `deg` }
 * angleParse(`w`); // { value: 180, unit: `deg` }
 * angleParse(`ne`); // ne/nw/se/sw supported
 * // Once parsed, use angleConvert to convert to a different unit:
 * angleConvert(`100rad`, `deg`); // { value: 5729.57795, unit: `deg` }
 * ```
 *
 * Once parsed in this format, use {@link angleConvert} to convert to
 * a different unit.
 * @param value
 * @returns Angle
 */
export function angleParse(value: AngleConvertible): Angle {
  if (isAngleType(value))
    return value;

  if (typeof value === `number`) {
    return {
      value,
      unit: `deg`,
    };
  }
  value = value.toLowerCase();
  let unit = `deg`;
  let numberValue = Number.NaN;
  if (value.endsWith(`grad`)) {
    numberValue = Number.parseFloat(value.substring(0, value.length - 4));
    unit = `grad`;
  } else if (value.endsWith(`rad`)) {
    numberValue = Number.parseFloat(value.substring(0, value.length - 3));
    unit = `rad`;
  } else if (value.endsWith(`turn`)) {
    numberValue = Number.parseFloat(value.substring(0, value.length - 4));
    unit = `turn`;
  } else if (value.endsWith(`deg`)) {
    numberValue = Number.parseFloat(value.substring(0, value.length - 3));
    unit = `deg`;
  } else {
    numberValue = Number.parseFloat(value);
  }

  if (Number.isNaN(numberValue)) {
    if (value === `n`)
      return { value: 90, unit: `deg` };
    else if (value === `e`)
      return { value: 0, unit: `deg` };
    else if (value === `s`)
      return { value: 270, unit: `deg` };
    else if (value === `w`)
      return { value: 180, unit: `deg` };
    else if (value === `ne`)
      return { value: 45, unit: `deg` };
    else if (value === `se`)
      return { value: 315, unit: `deg` };
    else if (value === `sw`)
      return { value: 225, unit: `deg` };
    else if (value === `nw`)
      return { value: 135, unit: `deg` };
    else
      throw new Error(`Invalid angle (bad value?): '${value}'. If using cardinals, use: 'n', 'se', etc.`);
  }
  if (unit.length === 0)
    throw new Error(`Invalid angle (no unit)`);
  return {
    value: numberValue,
    unit: unit as `deg` | `grad` | `turn` | `rad`,
  };
}

export function isAngleType(v: any): v is Angle {
  if (typeof v !== `object`)
    return false;
  if (`unit` in v && `value` in v) {
    if (typeof v.unit !== `string`)
      return false;
    if (typeof v.value !== `number`)
      return false;
    return true;
  }
  return false;
}

/**
 * Returns _true_ if `v` is a number, string or `Angle` type.
 * @param v
 * @returns
 */
export function isAngleTypeConvertible(v: any): v is AngleConvertible {
  if (typeof v === `undefined`)
    return false;
  if (typeof v === `number` || typeof v === `string`)
    return true;
  if (typeof v === `object`) {
    if (`unit` in v && `value` in v) {
      if (typeof v.unit !== `string`)
        return false;
      if (typeof v.value !== `number`)
        return false;
      return true;
    }
  }
  return false;
}
/**
 * Converts some angle representation to a simple numeric radian angle.
 *
 * ```js
 * toRadian(90); // 90deg
 * toRadian(`90`); // 90deg
 * toRadian(`1.2rad`)
 * toRadian(`90deg`)
 * ```
 *
 * Unitless values provided as a number or string are assumed to be degrees.
 * @param angleOrDegrees
 * @returns Radians
 */
export function toRadian(angleOrDegrees: Angle | number | string): number {
  if (typeof angleOrDegrees === `number`)
    return angleOrDegrees;
  return angleConvert(angleOrDegrees, `rad`).value;
}

/**
 * Converts an angle to another representation.
 * Input value is assumed degrees unless it's an {@link Angle} type of has the unit.
 *
 * These are all identical inputs: 100, `100`, `100deg`
 * ```js
 * angleConvert(100, `rad`); // Converts 100deg to radians
 * ```
 *
 * Other units can be used for string input: `2turn`, `1grad`, `2rad`.
 * ```js
 * angleConvert(`2rad`, `deg`); // Converts 2radians to degrees
 * ```
 *
 * Can also use an object input:
 * ```js
 * angleConvert({ value: 10, unit: `deg`}, `rad`);
 * ```
 * @param angleOrDegrees
 * @param destination
 * @returns Angle
 */
export function angleConvert(angleOrDegrees: Angle | number | string, destination: Angle[`unit`]): Angle {
  const input = typeof angleOrDegrees === `object` ? angleOrDegrees : angleParse(angleOrDegrees);
  switch (destination) {
    case `deg`:
      if (input.unit === `deg`)
        return input;
      if (input.unit === `rad`)
        return { value: radianToDegree(input.value), unit: `deg` };
      if (input.unit === `grad`)
        return { value: gradianToDegree(input.value), unit: `deg` };
      if (input.unit === `turn`)
        return { value: turnToDegree(input.value), unit: `deg` };
      throw new Error(`Unknown unit: ${input.unit}`);
    case `grad`:
      if (input.unit === `deg`)
        return { value: degreeToGradian(input.value), unit: `grad` };
      if (input.unit === `rad`)
        return { value: radianToGradian(input.value), unit: `grad` };
      if (input.unit === `grad`)
        return input;
      if (input.unit === `turn`)
        return { value: radianToGradian(turnToRadian(input.value)), unit: `grad` };
      throw new Error(`Unknown unit: ${input.unit}`);
    case `rad`:
      if (input.unit === `deg`)
        return { value: degreeToRadian(input.value), unit: `rad` };
      if (input.unit === `rad`)
        return input;
      if (input.unit === `grad`)
        return { value: gradianToRadian(input.value), unit: `rad` };
      if (input.unit === `turn`)
        return { value: turnToRadian(input.value), unit: `rad` };
      throw new Error(`Unknown unit: ${input.unit}`);
    case `turn`:
      if (input.unit === `deg`)
        return { value: degreeToTurn(input.value), unit: `turn` };
      if (input.unit === `rad`)
        return { value: radianToTurn(input.value), unit: `turn` };
      if (input.unit === `grad`)
        return { value: radianToTurn(gradianToRadian(input.value)), unit: `turn` };
      if (input.unit === `turn`)
        return input;
      throw new Error(`Unknown unit: ${input.unit}`);
    default:
      throw new Error(`Destination unit unknown ('${destination}). Expects: deg, grad, rad or turn`);
  }
}

/**
 * Compute [unit vector](https://en.wikipedia.org/wiki/Unit_vector) of an angle. The unit vector is essentially the direction of an angle.
 *
 * ```js
 * unitVector(90); // 90 deg
 * unitVector(`1.2rad`); // 1.2 in radians
 * ```
 *
 * The coordinate space is -1..1:
 * ```
 *    y 1
 *      |
 *      |
 * -1 --+--- 1 x
 *      |
 *      |
 *     -1
 * ```
 *
 * See {@link fromUnitVector} to convert back to an angle
 * @param angleOrDegrees Angle specified in degrees, or an angle with units
 */
export function toUnitVector(angleOrDegrees: Angle | string | number): {
  x: number;
  y: number;
} {
  const radians = toRadian(angleOrDegrees);
  return {
    x: Math.cos(radians),
    y: Math.sin(radians),
  };
}

/**
 * Convert from a [unit vector](https://en.wikipedia.org/wiki/Unit_vector) to an angle,
 * by default radians.
 *
 * ```js
 * fromUnitVector({ x: 1, y: 0.5 });          // { unit: `rad`, value: ... }
 * fromUnitVector({ x: -0.2, y: 0.4 }, `deg`) // { unit: `deg`, value ... }
 * ```
 * @param vector
 * @param unit
 * @returns Angle
 */
export function fromUnitVector(vector: Point, unit: Angle[`unit`] = `rad`): Angle {
  const r = Math.atan2(vector.x, vector.y);
  if (unit === `rad`) {
    return {
      unit: `rad`,
      value: r,
    };
  }
  return angleConvert(r, unit);
}

/**
 * Converts 'turns' to degrees. By defaults wraps the value, so
 * turn value of 1 or 2 equal 0deg instead of 360 or 720deg.
 * @param turns
 * @param wrap
 * @returns Degrees
 */
export function turnToDegree(turns: number, wrap = true): number {
  if (wrap)
    return (turns * 360) % 360;
  return turns * 360;
}

/**
 * Calculates the average of angles
 * @param angles Angles to average
 * @param kind Kind of average to calculate. See {@link PointAverageKinds} for details.
 * @returns Average angle
 */
export function average(angles: Array<Angle | string | number>, kind: PointAverageKinds = `mean`): Angle {
  const anglesProper = angles.map(a => angleParse(a));
  const vectors = anglesProper.map(a => toUnitVector(a));
  const avg = pointAverage(vectors, kind);
  return fromUnitVector(avg, anglesProper[0].unit);
}

/**
 * Normalise a radian angle to 0..2*PI range
 * @param angleRadian
 * @returns Normalised angle
 */
export function radiansNormalise(angleRadian: number): number {
  angleRadian %= piPi;
  return angleRadian < 0 ? angleRadian + piPi : angleRadian;
}

/**
 * Returns _true_ if `check` is between `start` and `end` angles, using 0...2PI range.
 *
 * Assumes a clockwise order. Ie. the checked angle is a wedge from `start`,
 * clockwise to `end`.
 *
 * Tip: use {@link radiansNormalise} on all angles first if uncertain if they are on 0...2PI range.
 * @param check
 * @param start
 * @param end
 * @returns Boolean
 */
export function radiansBetweenCircular(check: number, start: number, end: number): boolean {
  if (start < 0 || start > piPi)
    throw new TypeError(`Param 'start' out of range. Expecting 0..2PI. Got: ${start}`);
  if (end < 0 || end > piPi)
    throw new TypeError(`Param 'end' out of range. Expecting 0..2PI. Got: ${end}`);

  if (start > Math.PI && end <= Math.PI) {
    // Start of line in upper part
    if (check > Math.PI) {
      return check >= start;
    } else {
      return check <= end;
    }
  }
  return check >= start && check <= end;
}

/**
 * Given two radian (0..2PI) angles, it returns the sweep angles
 * between them that is either minimised or maximised.
 * @param a
 * @param b
 */
export function radianRange(a: number, b: number): {
  min: {
    start: number;
    end: number;
    sweep: number;
  };
  max: {
    start: number;
    end: number;
    sweep: number;
  };
} {
  if (a < 0 || a > piPi)
    throw new TypeError(`Param 'a' out of range. Expecting 0..2PI. Got: ${a}`);
  if (b < 0 || b > piPi)
    throw new TypeError(`Param 'b' out of range. Expecting 0..2PI. Got: ${b}`);

  const aa = Math.min(a, b);
  const bb = Math.max(a, b);

  if (aa < Math.PI && bb > Math.PI) {
    // A in bottom half, B in top
    const dCw = (piPi - bb) + aa;
    const dCcw = bb - aa;
    if (dCw < dCcw) {
      return {
        min: {
          start: bb,
          end: aa,
          sweep: dCw,
        },
        max: {
          start: aa,
          end: bb,
          sweep: dCcw,
        },
      };
    }
  }

  return {
    min: {
      start: aa,
      end: bb,
      sweep: bb - aa,
    },
    max: {
      start: bb,
      end: aa,
      sweep: piPi - (bb - aa),
    },
  } as const;
}

export function turnToRadian(turns: number): number {
  return turns * piPi;
}

export function degreeToTurn(degrees: number): number {
  return degrees / 360;
}

export function radianToTurn(radians: number): number {
  return radians / piPi;
}
