import * as C from "colorizr";
import type { ParsingOptions, Rgb, Rgb8Bit, RgbScalar } from "./types.js";
import { numberInclusiveRangeTest, numberTest } from "@ixfx/guards";
import { resultThrow } from "@ixfx/guards";
import { cssDefinedHexColours } from "./css-colours.js";

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

export const fromHexString = (hexString: string): Rgb8Bit => fromLibrary(C.hex2rgb(hexString));
const srgbTansparent: Rgb8Bit = Object.freeze({
  r: 0, g: 0, b: 0, opacity: 0, unit: `8bit`, space: `srgb`
});

export const fromCss8bit = (value: string, options: ParsingOptions<Rgb8Bit> = {}): Rgb8Bit => {
  value = value.toLowerCase();
  if (value.startsWith(`#`)) {
    return fromHexString(value);

  }
  if (value === `transparent`) return srgbTansparent;
  if (typeof cssDefinedHexColours[ value ] !== `undefined`) {
    return fromHexString(cssDefinedHexColours[ value ] as string);
  }

  if (!value.startsWith(`rgb(`) && !value.startsWith(`rgba(`)) {
    try {
      const converted = C.convert(value, `rgb`);
      value = converted;
    } catch (error) {
      if (options.fallbackString) {
        value = options.fallbackString;
      } else {
        throw error;
      }
    }
  }
  const c = C.extractColorParts(value);
  if (c.model !== `rgb`) throw new Error(`Expecting RGB colour space. Got: ${ c.model }`);
  return fromLibrary(c as any as C.RGB);
}

export const toCssString = (rgb: Rgb): string => {
  guard(rgb);
  switch (rgb.unit) {
    case `8bit`:
      if (rgb.opacity === undefined || rgb.opacity === 255) {
        return `rgb(${ rgb.r } ${ rgb.b } ${ rgb.g })`;
      }
      return `rgb(${ rgb.r } ${ rgb.b } ${ rgb.g } / ${ (rgb.opacity ?? 255) / 255 })`;
    case `scalar`:
      if (rgb.opacity === undefined || rgb.opacity === 1) {
        return `rgb(${ rgb.r * 100 }% ${ rgb.b * 100 }% ${ rgb.g * 100 }%)`;
      }
      return `rgb(${ rgb.r * 100 }% ${ rgb.b * 100 }% ${ rgb.g * 100 }% / ${ (rgb.opacity ?? 1) * 100 }%)`;
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

const fromLibrary = (rgb: C.RGB): Rgb8Bit => {
  return {
    r: rgb.r,
    g: rgb.g,
    b: rgb.b,
    opacity: rgb.alpha ?? 255,
    unit: `8bit`,
    space: `srgb`
  }
}

export const to8bit = (rgb: Rgb): Rgb8Bit => {
  guard(rgb);
  if (rgb.unit === `8bit`) return rgb;
  return {
    r: rgb.r * 255,
    g: rgb.g * 255,
    b: rgb.b * 255,
    opacity: rgb.opacity ?? 255,
    unit: `8bit`,
    space: `srgb`
  }
}

export const toScalar = (rgb: Rgb): RgbScalar => {
  guard(rgb);
  if (rgb.unit === `scalar`) return rgb;
  return {
    r: rgb.r / 255,
    g: rgb.g / 255,
    b: rgb.b / 255,
    opacity: (rgb.opacity ?? 1) / 255,
    unit: `scalar`,
    space: `srgb`
  }
}

export const guard = (rgb: Rgb) => {
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

//export const SrgbSpace = { withOpacity, toCssString, fromHexString, fromCss8bit, toLibrary, fromLibrary, guard, toScalar, to8bit };
