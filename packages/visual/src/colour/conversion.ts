import Colorizr, * as C from "colorizr";
import { type Colour, type Colourish, type ColourSpaces, type Hsl, type HslAbsolute, type HslScalar, type OkLch, type OkLchAbsolute, type OkLchScalar, type Rgb, type Rgb8Bit, type RgbScalar } from "./types.js";
import * as SrgbSpace from "./srgb.js";
import * as HslSpace from './hsl.js';
import * as OkLchSpace from './oklch.js';
import { fromCssColour } from "./css-colours.js";
import { isHsl, isRgb, tryParseObjectToRgb, tryParseObjectToHsl, isColourish, isOkLch } from "./guards.js";
import { OklchSpace } from "./index.js";

export type ConvertDestinations = `hsl-scalar` | `hsl-absolute` | `oklch-scalar` | `oklch-absolute` | `srgb-8bit` | `srgb-scalar`;

export function convert<T extends ConvertDestinations>(colour: Colourish, destination: T):
  T extends "oklch-absolute" ? OkLchAbsolute :
  T extends "oklch-scalar" ? OkLchScalar :
  T extends "srgb-8bit" ? Rgb8Bit :
  T extends "srgb-scalar" ? RgbScalar :
  T extends "hsl-scalar" ? HslScalar :
  T extends "hsl-absolute" ? HslAbsolute : never

/**
 * Converts an object or string representation of colour to ixfx's
 * structured colour.
 * Use {@link convertToString} if you want a CSS colour string instead.
 * @param colour 
 * @param destination 
 * @returns 
 */
export function convert(colour: Colourish, destination: ConvertDestinations): Hsl | OkLch | Rgb {
  if (destination === `hsl-scalar`) {
    if (typeof colour === `string` || isHsl(colour) || isRgb(colour)) {
      return HslSpace.toScalar(colour);
    }
  } else if (destination === `hsl-absolute`) {
    if (typeof colour === `string` || isHsl(colour)) {
      return HslSpace.toAbsolute(colour);
    }
  } else if (destination === `oklch-scalar`) {
    if (typeof colour === `string` || isOkLch(colour)) {
      return OkLchSpace.toScalar(colour);
    }
  } else if (destination === `oklch-absolute`) {
    if (typeof colour === `string` || isOkLch(colour)) {
      return OkLchSpace.toAbsolute(colour);
    }
  } else if (destination === `srgb-8bit`) {
    if (typeof colour === `string` || isRgb(colour)) {
      return SrgbSpace.to8bit(colour);
    }
  } else if (destination === `srgb-scalar`) {
    if (typeof colour === `string` || isRgb(colour)) {
      return SrgbSpace.toScalar(colour);
    }
  } else {
    throw new Error(`Destination '${ destination }' not supported for input: ${ JSON.stringify(colour) }`);
  }
  return convert(toCssColour(colour), destination);
}

/**
 * Like {@link convert}, but result is a CSS colour string
 * @param colour 
 * @param destination 
 * @returns 
 */
export function convertToString(colour: Colourish, destination: ConvertDestinations): string {
  const c = convert(colour, destination);
  return toCssColour(c);
}

export function convertScalar<T extends ColourSpaces>(colour: Colourish, destination: T):
  T extends "oklch" ? OkLchScalar :
  T extends "hsl" ? HslScalar :
  T extends "srgb" ? RgbScalar : never

export function convertScalar(colour: Colourish, destination: ColourSpaces): HslScalar | OkLchScalar | RgbScalar {
  if (destination === `oklch`) return convert(colour, `oklch-scalar`);
  if (destination === `srgb`) return convert(colour, `srgb-scalar`);
  if (destination === `hsl`) return convert(colour, `hsl-scalar`);
  throw new Error(`Unknown destination: '${ destination }'`);
}

export const toCssColour = (colour: Colourish | object): string => {
  if (typeof colour === `string`) return colour;

  if (isHsl(colour)) {
    return HslSpace.toCssString(colour);
  }

  if (isRgb(colour)) {
    return SrgbSpace.toCssString(colour);
  }

  if (isOkLch(colour)) {
    return OklchSpace.toCssString(colour);
  }
  const asRgb = tryParseObjectToRgb(colour);
  if (asRgb) return SrgbSpace.toCssString(asRgb);

  const asHsl = tryParseObjectToHsl(colour);
  if (asHsl) return HslSpace.toCssString(asHsl);

  throw new Error(`Unknown colour format: '${ JSON.stringify(colour) }'`);
}

export const toLibraryColour = (colour: Colourish): Colorizr => {
  const asCss = toCssColour(colour);
  return new Colorizr(asCss);
}

// export const convertColourString = (colour: string, destination: 'hex' | 'hsl' | 'oklab' | 'oklch' | 'srgb' | `rgb`): string => {
//   if (destination === `srgb`) destination = `rgb`;
//   return C.convert(colour, destination);
// }

export const guard = (colour: Colour) => {
  switch (colour.space) {
    case `hsl`:
      HslSpace.guard(colour);
      break;
    case `srgb`:
      SrgbSpace.guard(colour);
      break;
    case `oklch`:
      OkLchSpace.guard(colour);
      break;
    default:
      throw new Error(`Unsupported colour space: '${ colour.space }'`);
  }
}

export const toColour = (colourish: any): Colour => {
  if (!isColourish(colourish)) throw new Error(`Could not parse input. Expected CSS colour string or structured colour {r,g,b}, {h,s,l} etc. Got: ${ JSON.stringify(colourish) }`);
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


export function rgbToHsl(rgb: Rgb, scalarResult: true): HslScalar
export function rgbToHsl(rgb: Rgb, scalarResult: false): HslAbsolute
export function rgbToHsl(rgb: Rgb, scalarResult: boolean): Hsl {
  // Needed because the Colorizr package has broken RGB to HSL
  // Converts rgb { model: 'rgb', r: 40, g: 20, b: 60, alpha: undefined }
  // to : { h: 270, s: 50, l: 0.06 }
  // when it should be: { h: 270, s: 50, l: 40 }

  // Source: https://www.jameslmilner.com/posts/converting-rgb-hex-hsl-colors/
  let { r, g, b } = rgb;
  const opacity = rgb.opacity ?? 1;
  if (rgb.unit === `8bit`) {
    r /= 255;
    g /= 255;
    b /= 255;
  }

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);

  let h = (max + min) / 2;
  let s = h;
  const l = h;

  if (max === min) {
    // Achromatic
    if (scalarResult) {
      return HslSpace.scalar(0, 0, 0, opacity);
    } else {
      return HslSpace.absolute(0, 0, 0, opacity);
    }
  }

  const d = max - min;
  s = l >= 0.5 ? d / (2 - (max + min)) : d / (max + min);
  switch (max) {
    case r:
      h = ((g - b) / d + 0) * 60;
      break;
    case g:
      h = ((b - r) / d + 2) * 60;
      break;
    case b:
      h = ((r - g) / d + 4) * 60;
      break;
  }

  if (scalarResult) {
    return HslSpace.scalar(h / 360, s, l, opacity)
  } else {
    return HslSpace.absolute(h, s * 100, l * 100, opacity);
  }
}