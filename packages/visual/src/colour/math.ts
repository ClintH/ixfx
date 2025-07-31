import type { Colour, Colourish, Hsl, Rgb } from './types.js';
import { toColour, toCssColour } from './conversion.js';
import * as HslSpace from './hsl.js';
import * as SrgbSpace from './srgb.js';
import { clamp } from '@ixfx/numbers';
import { OklchSpace } from './index.js';
import * as C from 'colorizr';

/**
 * Multiplies the opacity of a colour by `amount`, returning a computed CSS colour.
 * 
 * ```js
 * multiplyOpacity(`red`, 0.5); // Returns a colour string
 * ```
 * 
 * For example, to half the opacity, use `amount: 0.5`.
 * Clamps the result to ensure it's between 0..1
 * @param colourish Colour
 * @param amount Amount
 * @returns 
 */
export function multiplyOpacity(colourish: string, amount: number): string {
  return withOpacity(colourish, o => clamp(o * amount));
}

/**
 * Does a computation with the opacity of a colour, returning colour string
 * @param colourish Colour
 * @param fn Function that takes original opacity as input and returns output opacity
 */
export function withOpacity(colourish: string, fn: (scalarOpacity: number) => number): string;

/**
 * Does a computation with the opacity of a colour in a HSL structure
 * @param hsl Colour
 * @param fn Function that takes original opacity as input and returns output opacity
 */
export function withOpacity(hsl: Hsl, fn: (scalarOpacity: number) => number): Hsl;

/**
 * Does a computation with the opacity of a colour in a RGB structure
 * @param colourish Colour
 * @param fn Function that takes original opacity as input and returns output opacity
 */

export function withOpacity(rgb: Rgb, fn: (scalarOpacity: number) => number): Rgb;

/**
 * Does a computation with the opacity of a colour, returning colour.
 * 
 * Passes operation to `HslSpace` or `SrgbSpace` depending on space of `colourish`.
 * @param colourish Colour
 * @param fn Function that takes original opacity as input and returns output opacity
 */
export function withOpacity(colourish: Colourish, fn: (scalarOpacity: number) => number): Colourish {
  const colour = toColour(colourish);
  let result: Colour | undefined;
  switch (colour.space) {
    case `hsl`:
      result = HslSpace.withOpacity(colour, fn);
      break;
    case `srgb`:
      result = SrgbSpace.withOpacity(colour, fn);
      break;
    case `oklch`:
      result = OklchSpace.withOpacity(colour, fn);
      break;
    default:
      throw new Error(`Unknown space: '${ colour.space }'. Expected hsl, srgb, oklch`)
  }
  if (!result) throw new Error(`Is colour in correct form?`);

  // If input type was string, return result as string
  if (typeof colourish === `string`) {
    return toCssColour(result);
  }
  return result;
};

export function setOpacity<T extends Colourish>(colourish: T, opacity: number): T extends string ? string : Colour
export function setOpacity(colourish: Colourish, opacity: number): Colourish {
  const colour = toColour(colourish);
  colour.opacity = opacity;
  if (typeof colourish === `string`) {
    return toCssColour(colour);
  }
  return colour;
}

// export function lighten(colour: string, amount: number): string;
// export function lighten(colour: Colour, amount: number): Colour;
// export function lighten(colourish: Colourish, amount: number): Colourish {
//   const asString = toCssColour(colourish);
//   const result = C.lighten(asString, amount, ``)
// }



// export const multiplySaturation = (colour: Colourish, amt: number): string => {
//   throwNumberTest(amt, `percentage`, `amt`);
//   const c = structuredToColorJs(colour);
//   c.s = (c.s ?? 0) * amt;
//   return c.toString();
// };