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

export type ColourSpaces = `srgb` | `hsl` | `oklch`;

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
 * * 'scalar': 0..1 range for RGB & opacity
 * * '8bit': 0..255 range for RGB & opacity
 */
export type RgbBase = { r: number; g: number; b: number; opacity?: number, space?: `srgb` };
export type RgbScalar = RgbBase & { unit: `scalar` };
/**
 * RGB in 0...255 range, including opacity.
 */
export type Rgb8Bit = RgbBase & { unit: `8bit` };

/**
 * Rgb.
 * Units determine how to interperet rgb values.
 * * 'scalar': 0..1 range for RGB & opacity
 * * '8bit': 0..255 range for RGB & opacity
 */
export type Rgb = RgbScalar | Rgb8Bit;

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


export type ColourInterpolator<T extends Colour> = (amount: number) => T;

export type OkLchBase = LchBase & { space: `oklch` }
/**
 * Oklch colour expressed in 0..1 scalar values for LCH & opacity
 */
export type OkLchScalar = OkLchBase & { unit: `scalar` }

/**
 * Oklch colour expressed with:
 * l: 0..1
 * c: 0..4
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

/**
 * Options for interpolation
 */
export type ColourInterpolationOpts = {
  direction: `longer` | `shorter`,
  space: ColourSpaces,

};

export type ColourStepOpts = ColourInterpolationOpts & {

  /**
   * If set, determines total number of steps, including colour stops.
   * Use this _or_ `stepsBetween`.
   */
  stepsTotal?: number,
  /**
   * If set, determines number of steps between colour stops.
   * Use this _or_ `stepsTotal`.
   */
  stepsBetween?: number
};

export type ParsingOptions<T> = Partial<{
  scalar: boolean
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