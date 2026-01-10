import Colorizr, * as C from "colorizr";

import type { Hsl, ParsingOptions, Rgb, Rgb8Bit, RgbScalar } from "./types.js";
import { numberInclusiveRangeTest, numberTest } from "@ixfx/guards";
import { resultThrow } from "@ixfx/guards";
import { cssDefinedHexColours } from "./css-colours.js";
import { clamp, interpolate } from "@ixfx/numbers";
import { toLibraryRgb as hslToLibraryRgb } from "./hsl.js";
import { isHsl } from "./guards.js";
import { libraryRgbToHexString } from "./utility.js";

export const withOpacity = <T extends Rgb>(value: T, fn: (opacityScalar: number, value: T) => number): T => {
  switch (value.unit) {
    case `8bit`:
      return {
        ...value,
        opacity: fn((value.opacity ?? 255) / 255, value) * 255
      }
    case `scalar`:
      return {
        ...value,
        opacity: fn((value.opacity ?? 1), value)
      }
  }
}

export function fromHexString<T extends boolean>(hexString: string, scalar: T): T extends true ? RgbScalar : Rgb8Bit;
export function fromHexString(hexString: string, scalar = true): RgbScalar | Rgb8Bit {
  return fromLibrary(C.hex2rgb(hexString), { scalar });
};

const srgbTansparent: Rgb8Bit = Object.freeze({
  r: 0, g: 0, b: 0, opacity: 0, unit: `8bit`, space: `srgb`
})

export function fromCss<T extends ParsingOptions<Rgb>>(value: string, options: T): T extends { scalar: true } ? RgbScalar : Rgb8Bit;

/**
 * Converts a colour in a legal CSS form into Rgb value, by default RgbScalar (0..1) scale.
 * ```js
 * fromCss(`rebeccapurple`);
 * fromCss(`rgb(40% 20% 60%)`);
 * 
 * // Get 8bit version on 0..255 scale
 * fromCss(`blue`, { scalar: false });
 * ```
 * 
 * @param value 
 * @param options 
 * @returns 
 */
export function fromCss(value: string, options: ParsingOptions<Rgb> = {}): Rgb {
  value = value.toLowerCase();
  if (value.startsWith(`hsla(`)) throw new Error(`hsla() not supported`);
  if (value.startsWith(`rgba(`)) throw new Error(`rgba() not supported`);


  const scalar = options.scalar ?? true;

  // Convert from hex
  if (value.startsWith(`#`)) return fromHexString(value, scalar);
  // Special-case transparent
  if (value === `transparent`) return srgbTansparent;
  // Convert from named colour
  if (typeof cssDefinedHexColours[ value ] !== `undefined`) fromHexString(cssDefinedHexColours[ value ] as string, scalar);

  if (value.startsWith(`hsl(`)) {
    const rgb = hslToLibraryRgb(value);
    return fromLibrary(rgb, options);
  }

  // if (value.startsWith(`hsl(`)) {

  //   const hslRel = hslToScalar(parseCssHslFunction(value));
  //   const rgb = C.hsl2rgb({ h: hslRel.h, s: hslRel.s, l: hslRel.l, alpha: hslRel.opacity ?? 1 });
  //   return fromLibrary(rgb, options);

  // }

  // Convert to rgb() colour function
  if (!value.startsWith(`rgb(`)) {
    try {
      value = C.convert(value, `rgb`);
    } catch (error) {
      if (options.fallbackString) {
        value = options.fallbackString;
      } else {
        throw error;
      }
    }
  }

  try {
    // Hand-rolled rgb() parse because the package is broken
    const rgb = parseCssRgbFunction(value);
    if (scalar) return toScalar(rgb);
    return to8bit(rgb);
  } catch (error) {
    if (options.fallbackColour) return options.fallbackColour;
    throw error;
  }
}

export const toHexString = (rgb: Rgb): string => {
  const rgb1 = toLibrary(rgb);
  return libraryRgbToHexString(rgb1);
}

export const toCssString = (rgb: Rgb): string => {
  guard(rgb);
  switch (rgb.unit) {
    case `8bit`:
      if (rgb.opacity === undefined || rgb.opacity === 255) {
        return `rgb(${ rgb.r } ${ rgb.g } ${ rgb.b })`;
      }
      return `rgb(${ rgb.r } ${ rgb.g } ${ rgb.b } / ${ (rgb.opacity ?? 255) / 255 })`;
    case `scalar`:
      if (rgb.opacity === undefined || rgb.opacity === 1) {
        return `rgb(${ rgb.r * 100 }% ${ rgb.g * 100 }% ${ rgb.b * 100 }%)`;
      }
      return `rgb(${ rgb.r * 100 }% ${ rgb.g * 100 }% ${ rgb.b * 100 }% / ${ (rgb.opacity ?? 1) * 100 }%)`;
    default:

      throw new Error(`Unknown unit: ${ (rgb as any).unit }`);
  }
}

const toLibrary = (rgb: Rgb): C.RGB => {
  const abs = to8bit(rgb);
  return {
    r: abs.r,
    g: abs.g,
    b: abs.b,
    alpha: abs.opacity,
  }
}

function fromLibrary<T extends ParsingOptions<Rgb>>(rgb: C.RGB, parsingOptions: T):
  T extends { scalar: true } ? RgbScalar : Rgb8Bit

function fromLibrary(rgb: C.RGB, parsingOptions: ParsingOptions<Rgb> = {}): Rgb8Bit | RgbScalar {
  if (parsingOptions.scalar) {
    return {
      r: rgb.r / 255,
      g: rgb.g / 255,
      b: rgb.b / 255,
      opacity: rgb.alpha ?? 1,
      unit: `scalar`,
      space: `srgb`
    }
  } else {
    return {
      r: rgb.r,
      g: rgb.g,
      b: rgb.b,
      opacity: rgb.alpha ?? 255,
      unit: `8bit`,
      space: `srgb`
    }
  }
}


export const to8bit = (rgbOrString: Rgb | string): Rgb8Bit => {
  if (typeof rgbOrString === `string`) {
    return fromCss(rgbOrString, { scalar: false });
  }
  if (isHsl(rgbOrString)) {
    return to8bit(fromLibrary(hslToLibraryRgb(rgbOrString), { scalar: false }));
  }
  guard(rgbOrString);
  if (rgbOrString.unit === `8bit`) return rgbOrString;
  return {
    r: rgbOrString.r * 255,
    g: rgbOrString.g * 255,
    b: rgbOrString.b * 255,
    opacity: (rgbOrString.opacity ?? 1) * 255,
    unit: `8bit`,
    space: `srgb`
  }
}

export const toScalar = (rgbOrString: Rgb | Hsl | string): RgbScalar => {
  if (typeof rgbOrString === `string`) {
    return fromCss(rgbOrString, { scalar: true });
  }
  if (isHsl(rgbOrString)) {
    return toScalar(fromLibrary(hslToLibraryRgb(rgbOrString), { scalar: true }));
  }
  guard(rgbOrString);
  if (rgbOrString.unit === `scalar`) return rgbOrString;
  return {
    r: rgbOrString.r / 255,
    g: rgbOrString.g / 255,
    b: rgbOrString.b / 255,
    opacity: (rgbOrString.opacity ?? 1) / 255,
    unit: `scalar`,
    space: `srgb`
  }
}

export const guard = (rgb: Rgb): void => {
  const { r, g, b, opacity, space, unit } = rgb;
  if (space !== `srgb`) throw new Error(`Space is expected to be 'srgb'. Got: ${ space }`);
  if (unit === `8bit`) {
    resultThrow(
      numberInclusiveRangeTest(r, 0, 255, `r`),
      numberInclusiveRangeTest(g, 0, 255, `g`),
      numberInclusiveRangeTest(b, 0, 255, `b`),
      () => {
        if (typeof opacity === `number`) {
          return numberInclusiveRangeTest(opacity, 0, 255, `opacity`);
        }
      }
    );
  } else if (unit === `scalar`) {
    resultThrow(
      numberTest(r, `percentage`, `r`),
      numberTest(g, `percentage`, `g`),
      numberTest(b, `percentage`, `b`),
      () => {
        if (typeof opacity === `number`) {
          return numberTest(opacity, `percentage`, `opacity`);
        }
      });
  } else {
    throw new Error(`Unit is expected to be '8bit' or 'scalar'. Got: ${ unit }`);
  }
}

/**
 * Sets the lightness value.
 * 
 * Amount to change:
 * * 'fixed': a fixed amount
 * * 'delta': increase/decrease by this amount
 * * 'pdelta': proportion of current value to change by ('percentage delta')
 * 
 * Use negative values to decrease
 * @param rgb Colour
 * @param amount Amount to change
 */
export const changeLightness = (rgb: Rgb, amount: Partial<{ pdelta: number, delta: number, fixed: number }>): Rgb => {
  let newL = 0;
  const co = new Colorizr(toCssString(rgb));
  const scalarUnit = rgb.unit === `scalar`;
  if (typeof amount.pdelta !== `undefined`) {
    newL = co.oklab.l + (co.oklab.l * amount.pdelta);
  } else if (typeof amount.delta !== `undefined`) {
    newL = co.oklab.l + amount.delta;
  } else if (typeof amount.fixed !== `undefined`) {
    if (amount.fixed < 0) throw new TypeError(`Amount cannot be negative when using 'fixed'`);
    newL = amount.fixed;
  } else {
    throw new TypeError(`Parameter 'amount' is missing 'pdelta/delta/fixed' properties`);
  }
  if (newL < 0) newL = 0;
  else if (newL > 1) newL = 1;

  const rgbResult = C.oklab2rgb({ a: co.oklab.a, b: co.oklab.b, l: newL, alpha: co.oklab.alpha });
  return fromLibrary(rgbResult, { scalar: scalarUnit });
  //return eightBit ? fromLibrary8bit(rgbResult) : fromLibraryScalar(rgbResult);
}

/**
 * Returns a lightness value (0..1) for an RGB input
 * 
 * Calculates lightness by converting to Oklab and using the 'L' value
 * @param rgb 
 * @returns 
 */
export function lightness(rgb: Rgb): number {
  const co = new Colorizr(toCssString(rgb));
  return co.oklab.l;
}

const scaleProperty = (rgb: Rgb, value: number, property: `r` | `g` | `b` | `opacity`) => {
  if (rgb.unit === `scalar`) {
    // 0..1 scale
    if (value > 1) value = 1;
    else if (value < 0) value = 0;
  } else {
    // 0..255 scale
    if (value > 255) value = 255;
    else if (value < 0) value = 0;
  }
  return value;
}

/**
 * Creates a Rgb8Bit value from 8bit (0..255) values
 * @param red 
 * @param green 
 * @param blue 
 * @param opacity 
 * @returns 
 */
export function eightBit(red = 100, green = 100, blue = 100, opacity = 255): Rgb8Bit {
  const rgb: Rgb8Bit = {
    unit: `8bit`,
    space: `srgb`,
    r: red,
    g: green,
    b: blue,
    opacity: opacity
  }
  guard(rgb);
  return rgb;
}

/**
 * Creates a RgbScalar value from scalar (0..1) values
 * @param red 
 * @param green 
 * @param blue 
 * @param opacity 
 * @returns 
 */
export function scalar(red = 0.5, green = 0.5, blue = 0.5, opacity = 1): RgbScalar {
  const rgb: RgbScalar = {
    unit: `scalar`,
    space: `srgb`,
    r: red,
    g: green,
    b: blue,
    opacity: opacity
  }
  guard(rgb);
  return rgb;
}


/**
 * It seems Colorizr can't handle % values properly :'(
 * @param value 
 */
export function parseCssRgbFunction(value: string): Rgb {
  if (value.startsWith(`rgba`)) throw new Error(`RGBA is not supported`);
  if (!value.startsWith(`rgb(`)) throw new Error(`Expected rgb(..) CSS colour`);

  const start = value.indexOf('(');
  const end = value.indexOf(')');
  if (end < start) throw new Error(`Is rgb() not terminated? Missing ')'`);

  const part = value.substring(start + 1, end);
  let split = part.split(/[\s,]+/);
  if (split.length < 3) throw new Error(`Expected three tokens. Got: ${ split.length } length`);

  let relativeCount = 0;
  for (const s of split) {
    if (s.endsWith('%')) relativeCount++;
  }

  const valueAsScalar = (v: string, pos: number) => {
    if (v.endsWith(`%`)) {
      return Number.parseFloat(v.substring(0, v.length - 1)) / 100;
    }
    if (pos < 3) {
      // r, g or b
      return Number.parseFloat(v) / 255;
    } else {
      // opacity should already be in scalar value
      return Number.parseFloat(v);
    }
  }

  const valueAs8bit = (v: string, pos: number) => {
    if (v.endsWith(`%`)) {
      return Number.parseFloat(v.substring(0, v.length - 1)) / 100 * 255;
    }
    if (pos < 3) {
      // r, g or b
      return Number.parseFloat(v);
    } else {
      // opacity should already be in scalar value
      return Number.parseFloat(v) * 255;
    }
  }

  // Is there opacity?
  if (split.length > 3) {
    if (split[ 3 ] === '/') {
      // Remove / part
      split = [ split[ 0 ], split[ 1 ], split[ 2 ], split[ 4 ] ];
    }
  }
  if (relativeCount > 1) {
    // Return as scalar
    return scalar(
      valueAsScalar(split[ 0 ], 0),
      valueAsScalar(split[ 1 ], 1),
      valueAsScalar(split[ 2 ], 2),
      valueAsScalar(split[ 3 ] ?? `1`, 3)
    )
  } else {
    // Return as 8bit
    return eightBit(
      valueAs8bit(split[ 0 ], 0),
      valueAs8bit(split[ 1 ], 1),
      valueAs8bit(split[ 2 ], 2),
      valueAs8bit(split[ 3 ] ?? `1`, 3)
    )
  }
}

/**
 * Interpolates colours in Srgb space. Probably
 * really ugly, use OkLch space isntead.
 * 
 * ```js
 * const i = interpolator(`red`, `blue`);
 * i(0.5); // Get 50% between these colours
 * ```
 * @param colourA 
 * @param colourB 
 * @returns 
 */
export const interpolator = (colourA: Rgb | string, colourB: Rgb | string) => {
  const aa = toScalar(colourA);
  const bb = toScalar(colourB);

  const aOpacity = aa.opacity ?? 1;
  const opacityDistance = (bb.opacity ?? 1) - aOpacity;

  const r = bb.r - aa.r;
  const g = bb.g - aa.g;
  const b = bb.b - aa.b;

  return (amount: number): RgbScalar => {
    amount = clamp(amount);
    return scalar(
      aa.r + interpolate(amount, 0, r),
      aa.g + interpolate(amount, 0, g),
      aa.b + interpolate(amount, 0, b),
      aOpacity + interpolate(amount, 0, opacityDistance));
  }
}

/**
 * Converts a Rgb structure (or CSS string) to Colorizr's HSL format
 * @param rgb 
 * @returns 
 */
export function toLibraryHsl(rgb: Rgb | string): C.HSL {
  if (typeof rgb === `string`) {
    const parseResult = fromCss(rgb, { scalar: false });
    return toLibraryHsl(parseResult);
  }
  rgb = to8bit(rgb);
  const hsl = C.rgb2hsl({ r: rgb.r, g: rgb.g, b: rgb.b });
  return { ...hsl, alpha: (rgb.opacity ?? 255) / 255 };
}