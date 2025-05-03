import * as C from "colorizr";
import type { Rgb, Rgb8Bit, RgbScalar } from "./types.js";
import { numberInclusiveRangeTest, numberTest } from "@ixfx/guards";
import { resultThrow } from "@ixfx/guards";

const withOpacity = <T extends Rgb>(value: T, fn: (opacityScalar: number, value: T) => number): T => {
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

const fromCss = (value: string): Rgb8Bit => {
  if (value.startsWith(`rgb`)) throw new Error(`Expecting CSS string in the form of 'rgb(...)'. Got: '${ value }'`);
  const c = C.extractColorParts(value);
  if (c.model !== `rgb`) throw new Error(`Expecting RGB colour space. Got: ${ c.model }`);
  return fromLibrary(c as any as C.RGB);
}

const toCss = (rgb: Rgb): string => {
  guard(rgb);
  switch (rgb.unit) {
    case `8bit`:
      return `rgb(${ rgb.r } ${ rgb.b } ${ rgb.g } / ${ (rgb.opacity ?? 255) / 255 })`;
    case `scalar`:
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

const to8bit = (rgb: Rgb): Rgb8Bit => {
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

const toScalar = (rgb: Rgb): RgbScalar => {
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

const guard = (rgb: Rgb) => {
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

export const SrgbSpace = { withOpacity, toCss, fromCss, toLibrary, fromLibrary, guard, toScalar, to8bit };
