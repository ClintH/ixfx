import {piPi} from ".";
import {wrap} from "./Wrap.js";

/**
 * Interpolates between `a` and `b` by `amount`. Aka `lerp`.
 * 
 * @example Get the halfway point between 30 and 60
 * ```js
 * import {interpolate} from 'https://unpkg.com/ixfx/dist/data.js';
 * interpolate(0.5, 30, 60);
 * ```
 * 
 * Interpolation is often used for animation. In that case, `amount`
 * would start at 0 and you would keep interpolating up to `1`
 * @example
 * ```js
 * import {interpolate} from 'https://unpkg.com/ixfx/dist/data.js';
 * import {percentPingPong} from 'https://unpkg.com/ixfx/dist/modulation.js'
 * 
 * // Go back and forth between 0 and 1 by 0.1
 * let pp = percentPingPong(0.1);
 * continuously(() => {
 *  // Get position in ping-pong
 *  const amt = pp.next().value;
 *  // interpolate between Math.PI and Math.PI*2
 *  const v = interpolate(amt, Math.PI, Math.PI*2); 
 *  // do something with v...
 * }).start();
 * ```
 * 
 * See also {@link Visual.Colour.interpolate | Visual.Colour.interpolate }, {@link Geometry.Points.interpolate | Geometry.Points.interpolate}.
 * @param amount Interpolation amount, between 0 and 1 inclusive
 * @param a Start (ie when `amt` is 0)
 * @param b End (ie. when `amt` is 1)
 * @returns Interpolated value which will be between `a` and `b`.
 */
export const interpolate =(amount:number, a:number, b:number):number => {
  const v = (1-amount) * a + amount * b;
  return v;
};

export const interpolateAngle = (amount:number, angleA:number, angleB:number):number => {
  const t = wrap(angleB-angleA, 0, piPi);
  return interpolate(amount, angleA, angleA + (t > Math.PI ? t - piPi : t));
};