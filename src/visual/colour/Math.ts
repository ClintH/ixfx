import { clamp } from '../../numbers/Clamp.js';
import { throwNumberTest } from '../../util/GuardNumbers.js';
import { structuredToColorJs } from './ResolveToColorJs.js';
import type { Colourish } from './Types.js';
/**
 * Returns a variation of colour with its opacity multiplied by `amt`.
 * Value will be clamped to 0..1
 *
 * ```js
 * // Return a colour string for blue that is 50% opaque
 * multiplyOpacity(`blue`, 0.5);
 * // eg: `rgba(0,0,255,0.5)`
 *
 * // Returns a colour string that is 50% more opaque
 * multiplyOpacity(`hsla(200,100%,50%,50%`, 0.5);
 * // eg: `hsla(200,100%,50%,25%)`
 * ```
 *
 * [Named colours](https://html-color-codes.info/color-names/)
 * @param colour A valid CSS colour
 * @param amt Amount to multiply opacity by
 * @returns String representation of colour
 */
export const multiplyOpacity = (colour: Colourish, amt: number): string => {
  throwNumberTest(amt, `percentage`, `amt`);

  const c = structuredToColorJs(colour);
  const alpha = clamp((c.alpha ?? 0) * amt);
  c.alpha = alpha;
  return c.toString();
};

export const multiplySaturation = (colour: Colourish, amt: number): string => {
  throwNumberTest(amt, `percentage`, `amt`);
  const c = structuredToColorJs(colour);
  c.s = (c.s ?? 0) * amt;
  return c.toString();
};