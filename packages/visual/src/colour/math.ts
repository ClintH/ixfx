import type { Colour, Colourish, Hsl, Rgb } from './types.js';
import { toColour, toCssColour } from './conversion.js';
import * as HslSpace from './hsl.js';
import * as SrgbSpace from './srgb.js';
import { clamp } from '@ixfx/numbers';

export function multiplyOpacity(colourish: string, amount: number): string {
  return withOpacity(colourish, o => clamp(o * amount));
}

export function withOpacity(colourish: string, fn: (scalarOpacity: number) => number): string;
export function withOpacity(colourish: Hsl, fn: (scalarOpacity: number) => number): Hsl;
export function withOpacity(colourish: Rgb, fn: (scalarOpacity: number) => number): Rgb;
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
    default:
      throw new Error(`Unknown space: '${ colour.space }'. Expected hsl, srgb, oklch`)
  }
  if (!result) throw new Error(`Is colour in correct form?`);
  if (typeof colourish === `string`) {
    // Convert back to string if input was a string
    return toCssColour(result);
  }
  return result;
};

// export const multiplySaturation = (colour: Colourish, amt: number): string => {
//   throwNumberTest(amt, `percentage`, `amt`);
//   const c = structuredToColorJs(colour);
//   c.s = (c.s ?? 0) * amt;
//   return c.toString();
// };