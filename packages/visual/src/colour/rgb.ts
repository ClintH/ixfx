import { clamp } from "@ixfxfun/numbers";
import type { Colourish, Rgb, Rgb8Bit, RgbRelative } from "./types.js";
import { hslToRelative, isHsl } from "./hsl.js";
import Color, { type ColorConstructor } from 'colorjs.io';
import { isOklch } from "./oklch.js";
import { resolveCss } from "./resolve-css.js";
import { numberInclusiveRangeTest,throwFromResult } from "@ixfxfun/guards";
import type { Result } from "@ixfxfun/core";
/**
 * Converts to relative Rgb value.
 * RGB are 0..255 scale, opacity is always 0..1 scale
 * @param r 
 * @param g 
 * @param b 
 * @param opacity 
 * @returns 
 */
const relativeFromAbsolute = (r: number, g: number, b: number, opacity = 255): RgbRelative => {
  r = clamp(r / 255);
  g = clamp(g / 255);
  b = clamp(b / 255);
  opacity = clamp(opacity);
  return {
    r, g, b, opacity, unit: `relative`, space: `srgb`
  }
}

const rgbToRelative = (rgb: Rgb): RgbRelative => {
  if (rgb.unit === `relative`) return rgb;
  return relativeFromAbsolute(rgb.r, rgb.g, rgb.b, rgb.opacity);
}


export const isRgb = (p: Colourish, validate = false): p is Rgb => {
  if (p === undefined || p === null) return false;
  if (typeof p !== `object`) return false;

  const space = p.space;
  if (space !== `srgb` && space !== undefined) return false;
  const pp = p as Rgb;
  if (pp.r === undefined) return false;
  if (pp.g === undefined) return false;
  if (pp.b === undefined) return false;

  if (validate) {
    if (`opacity` in pp) {
      throwFromResult(numberInclusiveRangeTest(pp.opacity, 0, 1, `opacity`));
    }
    if (pp.unit === `relative`) {
      throwFromResult(numberInclusiveRangeTest(pp.r, 0, 1, `r`));
      throwFromResult(numberInclusiveRangeTest(pp.g, 0, 1, `g`));
      throwFromResult(numberInclusiveRangeTest(pp.b, 0, 1, `b`));
    } else if (pp.unit === `8bit`) {
      throwFromResult(numberInclusiveRangeTest(pp.r, 0, 255, `r`));
      throwFromResult(numberInclusiveRangeTest(pp.g, 0, 255, `g`));
      throwFromResult(numberInclusiveRangeTest(pp.b, 0, 255, `b`));
    }
  }
  return true;
};

export const rgbToColorJs = (rgb: Rgb): ColorConstructor => {
  const rel = rgbToRelative(rgb);
  return {
    alpha: rel.opacity,
    coords: [ rgb.r, rgb.g, rgb.b ],
    spaceId: `sRGB`
  }
}

/**
 * Parses colour to `{ r, g, b }` where each field is on 0..1 scale.
 * `opacity` field is added if opacity is not 1.
 * [Named colours](https://html-color-codes.info/color-names/)
 * @param colour
 * @returns
 */
export const toRgb = (colour: Colourish): RgbRelative => {
  if (typeof colour === `string` && colour === `transparent`) return { r: 1, g: 1, b: 1, opacity: 0, space: `srgb`, unit: `relative` };
  if (isRgb(colour)) {
    return rgbToRelative(colour);
  } else if (isHsl(colour)) {
    const hslRel = hslToRelative(colour);
    const c = new Color(`hsl`, [ hslRel.h, hslRel.s, hslRel.l ], hslRel.opacity ?? 1);
    const rgb = c.srgb; // relative 0..1
    return { r: rgb[ 0 ], g: rgb[ 1 ], b: rgb[ 2 ], opacity: c.alpha, unit: `relative`, space: `srgb` }
  } else if (isOklch(colour)) {
    const c = new Color(`oklch`, [ colour.l, colour.c, colour.h ], colour.opacity ?? 1);
    const rgb = c.srgb; // relative 0..1
    return { r: rgb[ 0 ], g: rgb[ 1 ], b: rgb[ 2 ], opacity: c.alpha, unit: `relative`, space: `srgb` }
  } else {
    const c = new Color(resolveCss(colour));
    const rgb = c.srgb; // relative 0..1
    return { r: rgb[ 0 ], g: rgb[ 1 ], b: rgb[ 2 ], opacity: c.alpha, unit: `relative`, space: `srgb` }
  }
};

// export const toRgb = (colour: Colourish): Rgb => {
//   const c = resolve(colour);
//   const rgb = c.srgb;
//   return c.alpha < 1 ?
//     { r: rgb.r, g: rgb.g, b: rgb.b, opacity: c.alpha, space: `srgb`, unit: `relative` } :
//     { r: rgb.r, g: rgb.g, b: rgb.b, opacity: 1, space: `srgb`, unit: `relative` };
// };

/**
 * Converts a relative RGB value to RGB & opacity values on 0.255 scale.
 * By default values are clamped so they don't exceed scale.
 * @param rgb 
 * @param clamped 
 * @returns 
 */
export const toRgb8bit = (rgb: Rgb, clamped = true): Rgb8Bit => {
  if (rgb.unit === `8bit`) return rgb;
  let r = rgb.r * 255;
  let g = rgb.g * 255;
  let b = rgb.b * 255;
  let opacity = (rgb.opacity ?? 1) * 255;
  if (clamped) {
    r = clamp(r, 0, 255);
    g = clamp(g, 0, 255);
    b = clamp(b, 0, 255);
    opacity = clamp(opacity, 0, 255);
  }
  return { r, g, b, opacity, unit: `8bit`, space: `srgb` }
}

export const toRgbRelative = (rgb: Rgb, clamped = true): RgbRelative => {
  if (rgb.unit === `relative`) return rgb;
  if (rgb.unit === `8bit`) {
    let r = rgb.r / 255;
    let g = rgb.g / 255;
    let b = rgb.b / 255;
    let opacity = (rgb.opacity ?? 255) / 255;
    if (clamped) {
      r = clamp(r);
      g = clamp(g);
      b = clamp(b);
      opacity = clamp(opacity);
    }
    return {
      r, g, b, opacity, unit: `relative`, space: `srgb`
    }
  } else {
    throw new Error(`Unknown unit. Expected '8bit'`);
  }
}

/**
 * Ensures `rgb` uses 0..255 scale for r,g & b values.
 * If `rgb` is already in 8-bit scale (ie it has unit:'8bit')
 * it is returned.
 * @param rgb
 * @returns
 */
// export const toRgb8bit = (rgb: Rgb): Rgb8Bit => {
//   const result = parseRgbObject(rgb);
//   throwResult(result);

//   if (rgb.unit === `8bit`) return rgb as Rgb8Bit;

//   const { r, g, b, opacity } = rgb;

//   const t: Rgb8Bit = {
//     r: r * 255,
//     g: g * 255,
//     b: b * 255,
//     unit: `8bit`,
//     space: rgb.space
//   }
//   if (opacity !== undefined) return { ...t, opacity: opacity * 255 };
//   return t;
// }

/**
 * Tries to parse an object in forms:
 * `{r,g,b}`, `{red,green,blue}`.
 * Uses 'opacity', 'space' and 'unit' fields where available.
 * 
 * If 'units' is not specified, it tries to guess if it's relative (0..1) or
 * 8-bit (0..255).
 * 
 * Normalises to an Rgb structure if it can, or returns an error.
 * @param p 
 * @returns 
 */
export const parseRgbObject = (p: any): Result<Rgb> => {
  if (p === undefined || p === null) return { success: false, error: `Undefined/null` }
  if (typeof p !== `object`) return { success: false, error: `Not an object` };

  const space = p.space ?? `srgb`;
  let { r, g, b, opacity } = p;
  if (r !== undefined || g !== undefined || b !== undefined) {
    // Short field names
  } else {
    // Check for long field names
    const { red, green, blue } = p;
    if (red !== undefined || green !== undefined || blue !== undefined) {
      r = red;
      g = green;
      b = blue;
    } else return { success: false, error: `Does not contain r,g,b or red,green,blue` }
  }

  let unit = p.unit;
  if (unit === `relative`) {
    if (r > 1 || r < 0) return { success: false, error: `Relative units, but 'r' exceeds 0..1` };
    if (g > 1 || g < 0) return { success: false, error: `Relative units, but 'g' exceeds 0..1` };
    if (b > 1 || b < 0) return { success: false, error: `Relative units, but 'b' exceeds 0..1` };
    if (opacity > 1 || opacity < 0) return { success: false, error: `Relative units, but opacity exceeds 0..1` };
  } else if (unit === `8bit`) {
    if (r > 255 || r < 0) return { success: false, error: `8bit units, but r exceeds 0..255` };
    if (g > 255 || g < 0) return { success: false, error: `8bit units, but g exceeds 0..255` };
    if (b > 255 || b < 0) return { success: false, error: `8bit units, but b exceeds 0..255` };
    if (opacity > 255 || opacity < 0) return { success: false, error: `8bit units, but opacity exceeds 0..255` };
  } else if (!unit) {
    if (r > 1 || g > 1 || b > 1) {
      if (r <= 255 && g <= 255 && b <= 255) {
        unit = `8bit`;
      } else return { success: false, error: `Unknown units, outside 0..255 range` };
    } else if (r <= 1 && g <= 1 && b <= 1) {
      if (r >= 0 && g >= 0 && b >= 0) {
        unit = `relative`;
      } else return { success: false, error: `Unknown units, outside of 0..1 range` };
    } else return { success: false, error: `Unknown units for r,g,b,opacity values` };
  }
  if (opacity === undefined) {
    opacity = unit === `8bit` ? 255 : 1;
  }

  const c = {
    r, g, b, opacity, unit, space
  }
  return { success: true, value: c };
};