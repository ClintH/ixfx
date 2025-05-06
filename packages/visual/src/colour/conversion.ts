import * as C from "colorizr";
import { isColourish, isHsl, isRgb, tryParseObjectToHsl, tryParseObjectToRgb, type Colour, type Colourish } from "./types.js";
import * as  SrgbSpace from "./srgb.js";
import * as HslSpace from './hsl.js';
import { fromCssColour } from "./css-colours.js";


export const toCssColour = (colour: any): string => {
  if (typeof colour === `string`) return colour;

  if (isHsl(colour)) {
    return HslSpace.toCssString(colour);
  }
  if (isRgb(colour)) {
    return SrgbSpace.toCssString(colour);
  }

  const asRgb = tryParseObjectToRgb(colour);
  if (asRgb) return SrgbSpace.toCssString(asRgb);

  const asHsl = tryParseObjectToHsl(colour);
  if (asHsl) return HslSpace.toCssString(asHsl);

  throw new Error(`Unknown colour format: '${ JSON.stringify(colour) }'`);

}



export const convert = (colour: string, destination: 'hex' | 'hsl' | 'oklab' | 'oklch' | 'srgb' | `rgb`): string => {
  if (destination === `srgb`) destination = `rgb`;
  return C.convert(colour, destination);
}

export const guard = (colour: Colour) => {
  switch (colour.space) {
    case `hsl`:
      HslSpace.guard(colour);
      break;
    case `srgb`:
      SrgbSpace.guard(colour);
      break;
    default:
      throw new Error(`Unknown colour space: '${ colour.space }'`);
  }
}

export const toColour = (colourish: any): Colour => {
  if (!isColourish(colourish)) throw new Error(`Could not parse input. Expected CSS colour string or structured colour {r,g,b}, {h,s,l} etc.`);
  let c: Colour | undefined;
  if (typeof colourish === `string`) c = fromCssColour(colourish);
  else c = colourish;
  if (c === undefined) throw new Error(`Could not parse input. Expected CSS colour string or structured colour {r,g,b}, {h,s,l} etc.`);

  guard(c);
  return c;
}

/**
 * Returns a CSS-ready string
 * representation.
 * ```js
 * element.style.backgroundColor = resolveToString(`red`);
 * ```
 * 
 * Tries each parameter in turn, returning the value
 * for the first that resolves. This can be useful for
 * having fallback values.
 * 
 * ```js
 * // Try a CSS variable, a object property or finally fallback to red.
 * element.style.backgroundColor = toStringFirst('--some-var', opts.background, `red`);
 * ```
 * @param colours Array of colours to resolve
 * @returns 
 */
export const toStringFirst = (...colours: (Colourish | undefined)[]): string => {
  for (const colour of colours) {
    if (colour === undefined) continue;
    if (colour === null) continue;
    try {
      const c = toColour(colour);
      return toCssColour(c);
    } catch { /* empty */ }
  }
  return `rebeccapurple`;
}