import type * as C from "colorizr";
import type { ParsingOptions, Rgb, Rgb8Bit, RgbScalar, YCbCr, YCbCr8bit, YCbCrScalar } from "./types.js";
import { numberInclusiveRangeTest, numberTest, resultThrow } from "@ixfx/guards";
import { isHsl, isRgb } from "./guards.js";
import * as SrgbSpace from './srgb.js';
/**
 * Creates a YCbCr8bit value from 8bit (0..255) values
 * @param y Luma 0..255
 * @param cb Chroma blue 0..255
 * @param cr Chroma red 0..255
 * @param opacity 0..255
 * @returns YCbCr8bit
 */
export function eightBit(y = 100, cb = 100, cr = 100, opacity = 255): YCbCr8bit {
  const rgb: YCbCr8bit = {
    unit: `8bit`,
    space: `ycbcr`,
    y,
    cb,
    cr,
    opacity,
  };
  guard(rgb);
  return rgb;
}

/**
 * Creates a YCbCr8bit value from scalar (0..1) values
 * @param y Luma 0..1
 * @param cb Chroma blue 0..1
 * @param cr Chroma red 0..1
 * @param opacity 0..1
 * @returns YCbCrScalar
 */
export function scalar(y = 0.5, cb = 0.5, cr = 0.5, opacity = 1): YCbCrScalar {
  const rgb: YCbCrScalar = {
    unit: `scalar`,
    space: `ycbcr`,
    y,
    cb,
    cr,
    opacity,
  };
  guard(rgb);
  return rgb;
}

/**
 * Converts from scalar or 8bit RGB to YCbCr8bit
 * @param rgb
 * @returns
 */
export function fromSrgTo8bit(rgb: Rgb): YCbCr8bit {
  const { r, g, b, opacity } = SrgbSpace.to8bit(rgb);
  return eightBit(
    (0.299 * r + 0.587 * g + 0.114 * b) + 0,
    (-0.169 * r + -0.331 * g + 0.500 * b) + 128,
    (0.500 * r + -0.419 * g + -0.081 * b) + 128,
    opacity,
  );
}

export function toSrgb8bit(ycbcr: YCbCr): Rgb8Bit {
  const { y, cb, cr, opacity } = to8bit(ycbcr);
  return {
    unit: `8bit`,
    space: `srgb`,
    r: 1 * y + 0 * (cb - 128) + 1.4 * (cr - 128),
    g: 1 * y + -0.343 * (cb - 128) + -0.711 * (cr - 128),
    b: 1 * y + 1.765 * (cb - 128) + 0 * (cr - 128),
    opacity,
  };
};

/**
 * Returns a YCbCr8bit format from either scalar or 8bit.
 * If the input is already 8bit, it is returned as-is.
 * @param ycbcr 8bit or scalar YCbCr value
 * @returns YCbCr8bit
 */
export function to8bit(ycbcr: YCbCr): YCbCr8bit {
  guard(ycbcr);
  if (ycbcr.unit === `8bit`)
    return ycbcr;
  const { y, cb, cr, opacity } = ycbcr;

  return eightBit(
    y * 255,
    cb * 255,
    cr * 255,
    typeof opacity === `number` ? opacity * 255 : 255,
  );
}

export function fromHexString<T extends ParsingOptions<YCbCr>>(hexString: string, scalar: T): T extends { scalar: true } ? YCbCrScalar : YCbCr8bit;

export function fromHexString(hexString: string, options: ParsingOptions<YCbCr> = {}): YCbCr8bit {
  const rgb = SrgbSpace.fromHexString(hexString, false);
  return fromSrgTo8bit(rgb);
}
export function fromCss<T extends ParsingOptions<YCbCr>>(value: string, options: T): T extends { scalar: true } ? YCbCrScalar : YCbCr8bit;

export function fromCss(value: string, options: ParsingOptions<YCbCr> = {}): YCbCr {
  const scalar = options.scalar ?? false;

  // TODO: Need to support 'fallbackColour' option

  const rgb = SrgbSpace.fromCss(value, {
    fallbackString: options.fallbackString,
    scalar: false,
    ensureSafe: options.ensureSafe,
  });
  if (scalar) {
    return toScalar(fromSrgTo8bit(rgb));
  } else {
    return fromSrgTo8bit(rgb);
  }
}

export function toScalar(colour: YCbCr | Rgb | string): YCbCrScalar {
  if (typeof colour === `string`) {
    return fromCss(colour, { scalar: true });
  }
  if (isHsl(colour) || isRgb(colour)) {
    const asRgb = SrgbSpace.toScalar(colour);
    return toScalar(fromSrgTo8bit(asRgb));
  }
  guard(colour);
  if (colour.unit === `scalar`)
    return colour;

  const { y, cb, cr, opacity } = colour;
  return scalar(
    y / 255,
    cb / 255,
    cr / 255,
    typeof opacity === `number` ? opacity / 255 : 1,
  );
}

export function guard(rgb: YCbCr): void {
  const { y, cb, cr, opacity, space, unit } = rgb;
  if (space !== `ycbcr`)
    throw new Error(`Space is expected to be 'ycbcr'. Got: ${space}`);
  if (unit === `8bit`) {
    resultThrow(
      numberInclusiveRangeTest(y, 0, 255, `y`),
      numberInclusiveRangeTest(cb, 0, 255, `cb`),
      numberInclusiveRangeTest(cr, 0, 255, `cr`),
      () => {
        if (typeof opacity === `number`) {
          return numberInclusiveRangeTest(opacity, 0, 255, `opacity`);
        }
      },
    );
  } else if (unit === `scalar`) {
    resultThrow(
      numberTest(y, `percentage`, `y`),
      numberTest(cb, `percentage`, `cb`),
      numberTest(cr, `percentage`, `cr`),
      () => {
        if (typeof opacity === `number`) {
          return numberTest(opacity, `percentage`, `opacity`);
        }
      },
    );
  } else {
    throw new Error(`Unit is expected to be '8bit' or 'scalar'. Got: ${unit}`);
  }
}

/**
 * Converts a YCbCr colour to a RGB hex string.
 * @param ycbcr
 * @returns
 */
export function toHexString(ycbcr: YCbCr): string {
  return SrgbSpace.toHexString(toSrgb8bit(ycbcr));
}