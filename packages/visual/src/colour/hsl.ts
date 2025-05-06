import * as C from "colorizr";
import type { Hsl, HslAbsolute, HslScalar, ParsingOptions } from "./types.js";
import { numberInclusiveRangeTest, numberTest } from "@ixfx/guards";
import { resultThrow } from "@ixfx/guards";
import { cssDefinedHexColours } from "./css-colours.js";
import { angleConvert, angleParse, type Angle } from "@ixfx/geometry";

/**
 * Scales the opacity value of an input HSL value
 * ```js
 * withOpacity()
 * ```
 * @param value 
 * @param fn 
 * @returns 
 */
export const withOpacity = <T extends Hsl>(value: T, fn: (opacityScalar: number, value: T) => number): T => {
  switch (value.unit) {
    case `absolute`:
      return {
        ...value,
        opacity: fn((value.opacity ?? 100) / 100, value) * 100
      }
    case `scalar`:
      return {
        ...value,
        opacity: fn((value.opacity ?? 1), value)
      }
  }
}


const hslTransparent = Object.freeze({
  h: 0, s: 0, l: 0, opacity: 0, unit: `absolute`, space: `hsl`
});
export const fromHexString = (hexString: string): HslAbsolute => fromLibrary(C.hex2hsl(hexString))

export const fromCssAbsolute = (value: string, options: ParsingOptions<HslAbsolute> = {}): HslAbsolute => {
  value = value.toLowerCase();
  if (value.startsWith(`#`)) {
    return fromHexString(value);

  }
  if (value === `transparent`) return hslTransparent;
  if (typeof cssDefinedHexColours[ value ] !== `undefined`) {
    return fromHexString(cssDefinedHexColours[ value ] as string);
  }

  if (!value.startsWith(`hsl(`) && !value.startsWith(`hsla(`)) {
    try {
      const converted = C.convert(value, `hsl`);
      value = converted;
      // eslint-disable-next-line unicorn/prevent-abbreviations
    } catch (e) {
      if (options.fallbackString) {
        value = options.fallbackString;
      } else {
        throw e;
      }
    }
  }
  const c = C.extractColorParts(value);
  if (c.model !== `hsl`) {
    if (options.fallbackColour) return options.fallbackColour;
    throw new Error(`Expecting HSL colour space. Got: ${ c.model }`);
  }
  return fromLibrary(c as any as C.HSL, options);
}

export const fromCssScalar = (value: string, options: ParsingOptions<HslAbsolute> = {}): HslScalar => toScalar(fromCssAbsolute(value, options));


export const toCssString = (hsl: Hsl): string => {
  const abs = toAbsolute(hsl);
  let css = `hsl(${ abs.h }deg ${ abs.s }% ${ abs.l }%`;
  if (`opacity` in abs && abs.opacity !== undefined && abs.opacity < 100) {
    css += ` / ${ abs.opacity }%`;
  }
  css += ')';
  return css;
}

const toLibrary = (hsl: Hsl): C.HSL => {
  const abs = toAbsolute(hsl);
  return {
    h: abs.h,
    s: abs.s,
    l: abs.l,
    alpha: abs.opacity,
  }
}

const fromLibrary = (hsl: C.HSL, parsingOptions: ParsingOptions<HslAbsolute> = {}): HslAbsolute => {
  if (typeof hsl === `undefined` || hsl === null) {
    if (parsingOptions.fallbackColour) return parsingOptions.fallbackColour;
  }
  resultThrow(
    numberInclusiveRangeTest(hsl.h, 0, 360, `h`),
    numberInclusiveRangeTest(hsl.s, 0, 100, `s`),
    numberInclusiveRangeTest(hsl.l, 0, 100, `l`),
    () => hsl.alpha !== undefined ? numberInclusiveRangeTest(hsl.alpha, 0, 100, `alpha`) : { success: true, value: hsl },
  );
  return {
    h: hsl.h,
    s: hsl.s,
    l: hsl.l,
    opacity: (hsl.alpha ?? 1) * 100,
    unit: `absolute`,
    space: `hsl`
  }
}

export const toAbsolute = (hsl: Hsl): HslAbsolute => {
  guard(hsl);
  if (hsl.unit === `absolute`) return hsl;
  return {
    h: hsl.h * 360,
    s: hsl.s * 100,
    l: hsl.l * 100,
    opacity: (hsl.opacity ?? 1) * 100,
    unit: `absolute`,
    space: `hsl`
  }

}

/**
 * Generates a {@link HslScalar} value.
 * 
 * ```js
 * generateScaler(10); // 10deg, default to full saturation, half lightness and full opacity
 * 
 * // Generate HSL value from radian angle and 50% saturation
 * generateScalar(`10rad`, 0.5); 
 * 
 * // Generate from numeric CSS variable
 * generateScalar(`--hue`);
 * ```
 * @param absoluteHslOrVariable Hue angle or CSS variable
 * @param saturation 
 * @param lightness 
 * @param opacity 
 */
export const generateScalar = (absoluteHslOrVariable: string | number | Angle, saturation = 1, lightness = 0.5, opacity = 1): HslScalar => {

  if (typeof absoluteHslOrVariable === `string`) {
    if (absoluteHslOrVariable.startsWith(`--`)) {
      absoluteHslOrVariable = getComputedStyle(document.body).getPropertyValue(absoluteHslOrVariable).trim()
    }
  }
  const hue = angleParse(absoluteHslOrVariable);
  if (saturation > 1) throw new TypeError(`Param 'saturation' must be between 0..1`);
  if (lightness > 1) throw new TypeError(`Param 'lightness' must be between 0..1`);
  if (opacity > 1) throw new TypeError(`Param 'opacity' must be between 0..1`);
  const hueDeg = angleConvert(hue, `deg`).value / 360;
  return {
    h: hueDeg,
    s: saturation,
    l: lightness,
    opacity: opacity,
    unit: `scalar`,
    space: `hsl`
  }
}

export const toScalar = (hsl: Hsl): HslScalar => {
  guard(hsl);
  if (hsl.unit === `scalar`) return hsl;
  return {
    h: hsl.h / 360,
    s: hsl.s / 100,
    l: hsl.l / 100,
    opacity: (hsl.opacity ?? 1) / 100,
    unit: `scalar`,
    space: `hsl`
  }
}

export const guard = (hsl: Hsl) => {
  const { h, s, l, opacity, space, unit } = hsl;
  if (space !== `hsl`) throw new Error(`Space is expected to be 'hsl'. Got: ${ space }`);
  if (unit === `absolute`) {
    resultThrow(
      numberTest(h, `finite`, `h`),
      numberInclusiveRangeTest(s, 0, 100, `s`),
      numberInclusiveRangeTest(l, 0, 100, `l`),
      () => {
        if (typeof opacity === `number`) {
          return numberInclusiveRangeTest(opacity, 0, 100, `s`);
        }
      });
  } else if (unit === `scalar`) {
    resultThrow(
      numberTest(h, `percentage`, `h`),
      numberTest(s, `percentage`, `s`),
      numberTest(l, `percentage`, `l`),
      () => {
        if (typeof opacity === `number`) {
          return numberTest(opacity, `percentage`, `opacity`);
        }
      });
  } else {
    throw new Error(`Unit is expected to be 'absolute' or 'scalar'. Got: ${ unit }`);
  }
}
