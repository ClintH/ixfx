import { piPi } from './pi.js';
import type { Point } from './point/point-type.js';
/**
 * Convert angle in degrees to angle in radians.
 * @param angleInDegrees 
 * @returns 
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
 * @returns 
 */
export function radianInvert(angleInRadians: number) {
  return (angleInRadians + Math.PI) % (2 * Math.PI);
}

export function degreeToGradian(angleInDegrees: number) {
  return angleInDegrees * 1.111111
}

/**
 * Returns the gradian value converted to degrees.
 * By default it wraps, so any value 360 or greater wraps around.
 * @param angleInGradians 
 * @param wrap 
 * @returns 
 */
export function gradianToDegree(angleInGradians: number, wrap = true) {
  if (wrap) return (angleInGradians * 0.9) % 360;
  return angleInGradians * 0.9;
}


export function radianToGradian(angleInRadians: number) {
  return angleInRadians * 63.6619772368; // 200/pi
}

export function gradianToRadian(angleInGradian: number) {
  return angleInGradian * 0.0157079633; // pi/200
}

/**
 * Convert angle in radians to angle in degrees
 * @param angleInRadians
 * @returns 
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
 * @returns 
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
export const radiansSum = (start: number, amount: number, clockwise = true) => {
  if (clockwise) {
    let x = start + amount;
    if (x >= piPi) x = x % piPi;
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
export const degreesSum = (start: number, amount: number, clockwise = true) => radianToDegree(radiansSum(degreeToRadian(start), degreeToRadian(amount), clockwise));

/**
 * Computes the angle arc between a start and end angle,
 * given in radians. It properly accounts for the wrap-around
 * values.
 * 
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
 *       Pi/2
 *        |
 * Pi  ---+--- 0
 * 180    |
 *       3PI/2
 *       270deg
 * ```
 * @param start Start angle, in radians
 * @param end End angle, in radians
 * @param clockwise Calculate in clockwise direction (default: _true_)
 * @returns Angle of arc, in radians.
 */
export const radianArc = (start: number, end: number, clockwise = true) => {
  let s = start;
  if (end < s) {
    s = 0;
    end = piPi - start + end;
  }
  let d = end - s;
  if (clockwise) d = piPi - d;
  if (d >= piPi) return d % piPi;
  return d;
}

/**
 * Computes the angle arc between a start and end angle,
 * given in degrees. It properly accounts for the wrap-around
 * values.
 * 
 * ```js
 * // Between 0-90 in clockwise direction
 * degreeArc(0, 90, true); // Yields: 270
 * 
 * // In counter-clockwise direction
 * degreeArc(0, 90, false); // Yields: 90
 * ```
 * 
 * See {@link radianArc} to operate in radians.
 * 
 * Orientation of angles is as follows:
 * ```
 *       90
 *        |
 * 180 ---+--- 0
 *        |
 *       270
 * ```
 * @param start Start angle, in degrees
 * @param end End angle, in degrees
 * @param clockwise Calculate in clockwise direction (default: _true_)
 * @returns Angle of arc, in degrees.
 */
export const degreeArc = (start: number, end: number, clockwise = true) => radianToDegree(radianArc(degreeToRadian(start), degreeToRadian(end), clockwise));


export type Angle = {
  value: number
  unit: `deg` | `rad` | `turn` | `grad`
}

/**
 * Parses CSS-style angle strings. By default assumes degrees.
 * 
 * ```js
 * angleParse(`100`);     // { value: 100, unit: `deg` }
 * angleParse(100);       // { value: 100, unit: `deg` }
 * angleParse(`100deg`);   // { value: 100, unit: `deg` }
 * 
 * // More exotic units:
 * angleParse(`100rad`);  // { value: 100, unit: `rad` }
 * angleParse(`100turn`); // { value: 100, unit: `turn` }
 * angleParse(`100grad`); // { value: 100, unit: `grad` }
 * ```
 * 
 * Once parsed in this format, use {@link angleConvert} to convert to
 * a different unit.
 * @param value 
 * @returns 
 */
export const angleParse = (value: string | number | Angle): Angle => {
  if (isAngle(value)) return value;

  if (typeof value === `number`) {
    return {
      value, unit: `deg`
    }
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

  if (Number.isNaN(numberValue)) throw new Error(`Invalid angle (bad value?)`);
  if (unit.length === 0) throw new Error(`Invalid angle (no unit)`);
  return {
    value: numberValue,
    unit: unit as `deg` | `grad` | `turn` | `rad`
  }
}

const isAngle = (v: any): v is Angle => {
  if (typeof v !== `object`) return false;
  if (`unit` in v && `value` in v) {
    if (typeof v.unit !== `string`) return false;
    if (typeof v.value !== `number`) return false;
    return true;
  }
  return false;
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
 * @returns 
 */
export const angleConvert = (angleOrDegrees: Angle | number | string, destination: Angle[ `unit` ]): Angle => {
  const angle = typeof angleOrDegrees === `object` ? angleOrDegrees : angleParse(angleOrDegrees);
  switch (destination) {
    case `deg`:
      if (angle.unit === `deg`) return angle;
      if (angle.unit === `rad`) return { value: radianToDegree(angle.value), unit: `deg` };
      if (angle.unit === `grad`) return { value: gradianToDegree(angle.value), unit: `deg` };
      if (angle.unit === `turn`) return { value: turnToDegree(angle.value), unit: `deg` };
      throw new Error(`Unknown unit: ${ angle.unit }`);
    case `grad`:
      if (angle.unit === `deg`) return { value: degreeToGradian(angle.value), unit: `grad` };
      if (angle.unit === `rad`) return { value: radianToGradian(angle.value), unit: `grad` };
      if (angle.unit === `grad`) return angle;
      if (angle.unit === `turn`) return { value: radianToGradian(turnToRadian(angle.value)), unit: `grad` };
      throw new Error(`Unknown unit: ${ angle.unit }`);
    case `rad`:
      if (angle.unit === `deg`) return { value: degreeToRadian(angle.value), unit: `rad` };
      if (angle.unit === `rad`) return angle;
      if (angle.unit === `grad`) return { value: gradianToRadian(angle.value), unit: `rad` };
      if (angle.unit === `turn`) return { value: radianToGradian(turnToRadian(angle.value)), unit: `grad` };
      throw new Error(`Unknown unit: ${ angle.unit }`);
    case `turn`:
      if (angle.unit === `deg`) return { value: degreeToTurn(angle.value), unit: `turn` };
      if (angle.unit === `rad`) return { value: radianToTurn(angle.value), unit: `turn` };
      if (angle.unit === `grad`) return { value: radianToTurn(gradianToRadian(angle.value)), unit: `turn` };
      if (angle.unit === `turn`) return angle;
      throw new Error(`Unknown unit: ${ angle.unit }`);
    default:
      throw new Error(`Destination unit unknown ('${ destination }). Expects: deg, grad, rad or turn`);
  }
}

/**
 * Converts 'turns' to degrees. By defaults wraps the value, so 
 * turn value of 1 or 2 equal 0deg instead of 360 or 720deg.
 * @param turns 
 * @param wrap 
 * @returns 
 */
export const turnToDegree = (turns: number, wrap = true) => {
  if (wrap) return (turns * 360) % 360;
  return turns * 360;
}

export const turnToRadian = (turns: number) => turns * piPi;
export const degreeToTurn = (degrees: number) => degrees / 360;
export const radianToTurn = (radians: number) => radians / piPi