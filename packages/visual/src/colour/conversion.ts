import * as C from "colorizr";
import { isColourish, isHsl, isRgb, type Colour, type Colourish } from "./types.js";
import { SrgbSpace } from "./srgb.js";
import { HslSpace } from './hsl.js';
import { cssDefinedHexColours } from "./css-colours.js";

const hexStringToColour = (hexString: string): Colour => {
  const rgb = C.hex2rgb(hexString);
  return SrgbSpace.fromLibrary(rgb);
}

export const toCssColour = (colour: any): string => {
  if (typeof colour === `string`) return colour;

  if (isHsl(colour)) {
    return HslSpace.toCss(colour);
  }
  if (isRgb(colour)) {
    return SrgbSpace.toCss(colour);
  }

  throw new Error(`Unknown colour format: '${ JSON.stringify(colour) }'`);

}

export const fromCssColour = (colour: string): Colour => {
  if (colour.startsWith(`#`)) {
    return hexStringToColour(colour);
  }

  if (typeof cssDefinedHexColours[ colour ] !== `undefined`) {
    return hexStringToColour(cssDefinedHexColours[ colour ] as string);
  }

  if (colour.startsWith(`--`)) {
    const fromCss = getComputedStyle(document.body).getPropertyValue(colour).trim();
    if (fromCss.length === 0) throw new Error(`Variable missing: ${ colour }`);
    if (fromCss.startsWith(`#`)) hexStringToColour(fromCss);
    if (fromCss.startsWith(`rgb`)) return SrgbSpace.fromCss(fromCss);
    if (fromCss.startsWith(`hsl`)) return HslSpace.fromCssScalar(fromCss);
    throw new Error(`CSS variable value not a hex, rgb or hsl colour function: '${ fromCss }'`);
  }
  throw new Error(`String colour is not a hex colour nor well-defined colour name`);
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