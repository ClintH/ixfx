import type { CssAngle } from "@ixfx/dom";

export type HslBase = {
  /**
   * Hue
   */
  h: number;
  /**
   * Saturation
   */
  s: number;
  /**
   * Lightness
   */
  l: number;
  /**
   * Opacity
   */
  opacity?: number,
  space?: `hsl`
}

export const isHsl = (v: any): v is Hsl => {
  if (typeof v === `object`) {
    if (!(`h` in v && `s` in v && `l` in v)) return false;
    if (!(`unit` in v)) return false;
    if (`space` in v) {
      if (v.space !== `hsl`) return false;
    }
  }
  return false;
}

/**
 * Scalar values use 0..1 for each field
 */
export type HslScalar = HslBase & { unit: `scalar` };

/**
 * Absolute values use hue:0..360, all other fields 0..100
 */
export type HslAbsolute = HslBase & { unit: `absolute` };

/**
 * HSL value.
 * By default assumes scalar coordinates (0..1) for each field.
 * Use 'absolute' unit for hue:0...360, all other fields on 0..100 scale.
 */
export type Hsl = HslScalar | HslAbsolute;

/**
 * Rgb.
 * Units determine how to interperet rgb values.
 * * 'relative': 0..1 range for RGB & opacity
 * * '8bit': 0..255 range for RGB & opacity
 */
//export type Rgb = { r: number; g: number; b: number; opacity?: number, unit: `scalar` | `8bit`, space?: `srgb` };

export type RgbBase = { r: number; g: number; b: number; opacity?: number, space?: `srgb` };
export type RgbScalar = RgbBase & { unit: `scalar` };

export const isRgb = (v: any): v is Rgb => {
  if (typeof v === `object`) {
    if (!(`r` in v && `g` in v && `b` in v)) return false;
    if (!(`unit` in v)) return false;
    if (`space` in v) {
      if (v.space !== `srgb`) return false;
    }
  }
  return false;
}
/**
 * RGB in 0...255 range, including opacity.
 */
export type Rgb8Bit = RgbBase & { unit: `8bit` };
export type Rgb = RgbScalar | Rgb8Bit;

// export type Spaces = `hsl` | `hsluv` | `rgb` | `srgb` | `lch` | `oklch` | `oklab` | `okhsl` | `p3` | `lab` | `hcl` | `cubehelix`;

export type LchBase = {
  /**
   * Lightness/perceived brightnes
   */
  l: number,
  /**
   * Chroma ('amount of colour')
   */
  c: number,
  /**
   * Hue
   */
  h: number,
  /**
   * Opacity on 0..1 scale
   */
  opacity?: number,
  space: `lch` | `oklch`
}

export const isLch = (v: any): v is OkLch => {
  if (typeof v === `object`) {
    if (!(`l` in v && `c` in v && `h` in v)) return false;
    if (!(`unit` in v)) return false;
    if (`space` in v) {
      if (v.space !== `lch` && v.space !== `oklch`) return false;
    }
  }
  return false;
}

export type OkLchBase = LchBase & { space: `oklch` }
/**
 * Oklch colour expressed in 0..1 scalar values for LCH & opacity
 */
export type OkLchScalar = OkLchBase & { unit: `scalar` }
/**
 * Oklch colour expressed with:
 * l: 0..100
 * c: 0..100
 * h: 0..360 degrees 
 * opacity: 0..1
 */
export type OkLchAbsolute = OkLchBase & { unit: `absolute` }
export type OkLch = OkLchAbsolute | OkLchScalar;

export type Colour = { opacity?: number } & (Hsl | OkLch | Rgb);

/**
 * A representation of colour. Eg: `blue`, `rgb(255,0,0)`, `hsl(20,100%,50%)`
 */
export type Colourish = Colour | string;

export const isColourish = (v: any): v is Colourish => {
  if (typeof v === `string`) return true;
  if (typeof v !== `object`) return false;
  if (isHsl(v)) return true;
  if (isLch(v)) return true;
  if (isRgb(v)) return true;
  return false;
}

// export type ColourRgb = {
//   space:`rgb`
//   coords: Rgba
// }
// export type ColourHsl = {
//   space:`hsl`;
//   coords: Hsla;
// }

// export type Colour = ColourHsl|ColourRgb;

/**
 * Options for interpolation
 */
// export type ColourInterpolationOpts = {
//   space: Spaces,
//   hue: `longer` | `shorter` | `increasing` | `decreasing` | `raw`
// };

export type ParsingOptions<T> = Partial<{
  ensureSafe: boolean
  /**
   * Value to use if input is invalid
   */
  fallbackString: string
  /**
   * Fallback colour to use if value cannot be parsed
   */
  fallbackColour: T
}>