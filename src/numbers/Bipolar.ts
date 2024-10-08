
import { type RandomOptions, type RandomSource } from '../random/Types.js';
import { throwNumberTest } from '../util/GuardNumbers.js';
import { interpolate } from './Interpolate.js';
import { scaler as numberScaler } from './Scale.js';
import { floatSource } from '../random/FloatSource.js';

/**
 * Wrapper around a bipolar value. Immutable.
 * 
 * ```js
 * let b = Bipolar.immutable();
 * let b = Bipolar.immutable(0.5);
 * b = b.add(0.1);
 * ```
 */
export type BipolarWrapper = {
  value: number
  towardZero: (amt: number) => BipolarWrapper
  add: (amt: number) => BipolarWrapper
  multiply: (amt: number) => BipolarWrapper
  inverse: () => BipolarWrapper
  asScalar: () => number
  interpolate: (amt: number, b: number) => BipolarWrapper
  [ Symbol.toPrimitive ]: (hint: string) => number | string | boolean
}

/**
 * Wrapper for bipolar-based values. Immutable.
 * All functions will clamp to keep it in legal range.
 * 
 * ```js
 * let v = immutable(); // Starts with 0 by default
 * v = v.add(0.1);      // v.value is 0.1
 * v = v.inverse();     // v.value is -0.1
 * v = v.multiply(0.2); // v.value is -0.02
 * 
 * v = immutable(1);
 * v = v.towardZero(0.1); // 0.9
 * v = v.interpolate(0.1, 1);
 * ```
 * 
 * Wrapped values can be coerced into number:
 * ```js
 * const v = immutable(1);
 * const x = +v+10;
 * // x = 11
 * ```
 * @param startingValueOrBipolar Initial numeric value or BipolarWrapper instance
 * @returns 
 */
export const immutable = (startingValueOrBipolar: number | BipolarWrapper = 0): BipolarWrapper => {
  if (typeof startingValueOrBipolar === `undefined`) throw new Error(`Start value is undefined`)
  const startingValue = (typeof startingValueOrBipolar === `number`) ? startingValueOrBipolar : startingValueOrBipolar.value;

  if (startingValue > 1) throw new Error(`Start value cannot be larger than 1`);
  if (startingValue < -1) throw new Error(`Start value cannot be smaller than -1`);
  if (Number.isNaN(startingValue)) throw new Error(`Start value is NaN`);

  const v = startingValue;
  return {
    [ Symbol.toPrimitive ](hint: string) {
      if (hint === `number`) return v;
      else if (hint === `string`) return v.toString();
      return true;
    },
    value: v,
    towardZero: (amt: number) => {
      return immutable(towardZero(v, amt));
    },
    add: (amt: number) => {
      return immutable(clamp(v + amt));
    },
    multiply: (amt: number) => {
      return immutable(clamp(v * amt));
    },
    inverse: () => {
      return immutable(-v);
    },
    interpolate: (amt: number, b: number) => {
      return immutable(clamp(interpolate(amt, v, b)));
    },
    asScalar: () => {
      return toScalar(v);
    }
  }
}

/**
 * Converts bipolar value to a scalar
 * ```js
 * import { Bipolar } from 'https://unpkg.com/ixfx/dist/data.js';
 * Bipolar.toScalar(-1); // 0.0
 * Bipolar.toScalar( 0); // 0.5
 * Bipolar.toScalar( 1); // 1.0
 * ```
 * 
 * Throws an error if `bipolarValue` is not a number or NaN
 * @param bipolarValue Value to convert to scalar
 * @returns Scalar value on 0..1 range.
 */
export const toScalar = (bipolarValue: number) => {
  if (typeof bipolarValue !== `number`) throw new Error(`Expected v to be a number. Got: ${ typeof bipolarValue }`);
  if (Number.isNaN(bipolarValue)) throw new Error(`Parameter is NaN`);
  return (bipolarValue + 1) / 2;
}

/**
 * Makes a scalar into a bipolar value.
 * 
 * That is, input range is 0..1, output range is -1...1
 *
 * ```js
 * import { Bipolar } from 'https://unpkg.com/ixfx/dist/data.js';
 * Bipolar.fromScalar(1);   // 1
 * Bipolar.fromScalar(0);   // -1
 * Bipolar.fromScalar(0.5); // 0
 * ```
 * 
 * Throws an error if `scalarValue` is not on 0..1 scale.
 * @param scalarValue Scalar value to convert
 * @returns Bipolar value on -1..1 scale
 */
export const fromScalar = (scalarValue: number) => {
  throwNumberTest(scalarValue, `percentage`, `v`);
  return (scalarValue * 2) - 1;
};

/**
 * Scale & clamp resulting number to bipolar range (-1..1)
 * ```js
 * import { Bipolar } from 'https://unpkg.com/ixfx/dist/data.js';
 * 
 * // Scale 100 on 0..100 scale
 * Bipolar.scale(100, 0, 100); // 1
 * Bipolar.scale(50, 0, 100);  // 0
 * Bipolar.scale(0, 0, 100);   // -1
 * ```
 * 
 * Return value is clamped.
 * @param inputValue Value to scale
 * @param inMin Minimum of scale
 * @param inMax Maximum of scale
 * @returns Bipolar value on -1..1 scale
 */
export const scale = (inputValue: number, inMin: number, inMax: number) => {
  return clamp(numberScaler(inMin, inMax, -1, 1)(inputValue));
}

/**
 * Scale a number to bipolar range (-1..1). Not clamped to scale.
 * 
 * ```js
 * import { Bipolar } from 'https://unpkg.com/ixfx/dist/data.js';
 * 
 * // Scale 100 on 0..100 scale
 * Bipolar.scale(100, 0, 100); // 1
 * Bipolar.scale(50, 0, 100);  // 0
 * Bipolar.scale(0, 0, 100);   // -1
 * ```
 * 
 * @param inputValue Value to scale
 * @param inMin Minimum of scale
 * @param inMax Maximum of scale
 * @returns Bipolar value on -1..1 scale
 */
export const scaleUnclamped = (inputValue: number, inMin: number, inMax: number) => {
  return numberScaler(inMin, inMax, -1, 1)(inputValue);
}

/**
 * Source for random bipolar values
 * ```js
 * const r = Bipolar.randomSource();
 * r(); // Produce random value on -1...1 scale
 * ```
 * 
 * Options can be provided, for example
 * ```js
 * // -0.5 to 0.5 range
 * Bipolar.randomSource({ max: 0.5 });
 * ```
 * 
 * Consider using {@link random} if you just want a one-off random
 * value.
 * @param maxOrOptions Maximum value (number) or options for random generation
 * @returns 
 */
export const randomSource = (maxOrOptions?: number | RandomOptions): RandomSource => {
  const source = floatSource(maxOrOptions);
  return () => (source() * 2) - 1;
}

/**
 * Returns a random bipolar value
 * ```js
 * const r = Bipolar.random(); // -1...1 random
 * ```
 * 
 * Options can be provided, eg.
 * ```js
 * Bipolar.random({ max: 0.5 }); // -0.5..0.5 random
 * ```
 * 
 * Use {@link randomSource} if you want to generate random
 * values with same settings repeatedly.
 * @param maxOrOptions 
 * @returns 
 */
export const random = (maxOrOptions?: number | RandomOptions): number => {
  const source = randomSource(maxOrOptions);
  return source();
}
/**
 * Clamp a bipolar value
 * ```js
 * import { Bipolar } from 'https://unpkg.com/ixfx/dist/data.js';
 * Bipolar.clamp(-1);   // -1
 * Bipolar.clamp(-1.1); // -1
 * ```
 * 
 * Throws an error if `bipolarValue` is not a number or NaN.
 * @param bipolarValue Value to clamp
 * @returns Clamped value on -1..1 scale
 */
export const clamp = (bipolarValue: number): number => {
  if (typeof bipolarValue !== `number`) throw new Error(`Param 'bipolarValue' must be a number. Got: ${ typeof bipolarValue }`);
  if (Number.isNaN(bipolarValue)) throw new Error(`Param 'bipolarValue' is NaN`);
  if (bipolarValue > 1) return 1;
  if (bipolarValue < -1) return -1;
  return bipolarValue;
}

/**
 * Pushes a bipolar value toward zero by `amount`.
 * Return value is clamped on bipolar range of -1..1
 * 
 * ```js
 * import { Bipolar } from 'https://unpkg.com/ixfx/dist/data.js';
 * Bipolar.towardZero(-1, 0.1); // -0.9
 * Bipolar.towardZero( 1, 0.1); //  0.9
 * Bipolar.towardZero( 0, 0.1); //  0.0
 * Bipolar.towardZero( 1, 1.1); //  0.0
 * ```
 * 
 * If `amount` is greater than 1, 0 is returned.
 * Throws an error if `bipolarValue` or `amount` are not numbers.
 * Throws an error if `amount` is below zero.
 * @param bipolarValue Bipolar value to nudge toward zero
 * @param amount Amount to nudge by
 * @returns Bipolar value -1...1
 */
export const towardZero = (bipolarValue: number, amount: number): number => {
  if (typeof bipolarValue !== `number`) throw new Error(`Parameter 'v' must be a number. Got: ${ typeof bipolarValue }`);
  if (typeof amount !== `number`) throw new Error(`Parameter 'amt' must be a number. Got: ${ typeof amount }`);
  if (amount < 0) throw new Error(`Parameter 'amt' must be positive`);
  if (bipolarValue < 0) {
    bipolarValue += amount;
    if (bipolarValue > 0) bipolarValue = 0;
  } else if (bipolarValue > 0) {
    bipolarValue -= amount;
    if (bipolarValue < 0) bipolarValue = 0;
  }
  return bipolarValue;
}