export type HslRelative = { h: number; s: number; l: number; opacity: number, space?: `hsl`, unit: `relative` };

export type HslAbsolute = { h: number; s: number; l: number; opacity: number, space?: `hsl`, unit: `absolute` };

/**
 * HSL value.
 * By default assumes relative coordinates (0..1) for each field.
 * Use 'absolute' unit for hue:0...360, all other fields on 0..100 scale.
 */
export type Hsl = HslRelative | HslAbsolute;

/**
 * Rgb.
 * Units determine how to interperet rgb values.
 * * 'relative': 0..1 range
 * * '8bit': 0..255 range for RGB & opacity
 */
//export type Rgb = { r: number; g: number; b: number; opacity?: number, unit: `relative` | `8bit`, space?: `srgb` };

export type RgbBase = { r: number; g: number; b: number; opacity?: number, space?: `srgb` };
export type RgbRelative = RgbBase & { unit: `relative` };

/**
 * RGB in 0...255 range, including opacity.
 */
export type Rgb8Bit = RgbBase & { unit: `8bit` };
export type Rgb = RgbRelative | Rgb8Bit;

export type Spaces = `hsl` | `hsluv` | `rgb` | `srgb` | `lch` | `oklch` | `oklab` | `okhsl` | `p3` | `lab` | `hcl` | `cubehelix`;

export type OkLch = { l: number, c: number, h: number, opacity: number, space: `oklch` }

/**
 * A representation of colour. Eg: `blue`, `rgb(255,0,0)`, `hsl(20,100%,50%)`
 */
export type Colourish = Hsl | OkLch | Rgb | string;

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
export type ColourInterpolationOpts = {
  space: Spaces,
  hue: `longer` | `shorter` | `increasing` | `decreasing` | `raw`
};
