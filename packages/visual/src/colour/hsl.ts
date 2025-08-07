import Colorizr, * as C from "colorizr";
import type { Colourish, Hsl, HslAbsolute, HslScalar, ParsingOptions, Rgb } from "./types.js";
import { numberInclusiveRangeTest, numberTest, percentTest } from "@ixfx/guards";
import { resultThrow } from "@ixfx/guards";
import { cssDefinedHexColours, resolveCss } from "./css-colours.js";
import { angleConvert, angleParse, type Angle } from "@ixfx/geometry";
import { clamp, interpolate } from "@ixfx/numbers";
import { isRgb } from "./guards.js";
import { calculateHueDistance, libraryRgbToHexString, wrapScalarHue } from "./utility.js";
import { parseCssRgbFunction, to8bit as rgbTo8bit, toLibraryHsl as rgbToLibraryHsl } from "./srgb.js";

/**
 * Scales the opacity value of an input HSL value
 * ```js
 * withOpacity()
 * ```
 * @param value Colour
 * @param fn Function that calcules opacity based on input scalar value
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

/**
 * Increases or decreases lightness by this percentage, returning new colour
 * 
 * Amount to change:
 * * 'fixed': a fixed amount
 * * 'delta': increase/decrease by this amount
 * * 'pdelta': proportion of current value to change by ('percentage delta')
 * 
 * ```
 * const colour = { h: 0.5, s: 0.5, l: 0.5, space: `hsl`, unit: `scalar` };
 * changeLightness(colour, { pdelta: 0.1 }); // l: 0.55
 * changeLightness(colour, { delta: 0.1 });  // l: 0.6
 * changeLightness(colour, { fixed: 0.5 });  // l: 0.5
 * ```
 * 
 * Keep in mind the numerical value will depend on the unit of `value`. If it's scalar,
 * lightness is 0..1 scale, otherwise 0..100 scale.
 * 
 * Use negative values to decrease (does not apply to 'fixed')
 * @param value Hsl colour
 * @param amount Amount to change
 */
export const changeLightness = (value: Hsl, amount: Partial<{ pdelta: number, delta: number, fixed: number }>): Hsl => {
  let newL = 0;
  if (typeof amount.pdelta !== `undefined`) {
    newL = value.l + (value.l * amount.pdelta);
  } else if (typeof amount.delta !== `undefined`) {
    newL = amount.delta + value.l;
  } else if (typeof amount.fixed !== `undefined`) {
    if (amount.fixed < 0) throw new TypeError(`Cannot use negative value with 'fixed'`);
    newL = amount.fixed;
  } else {
    throw new TypeError(`Parameter 'amount' is missing 'delta/pdelta/fixed' properties`);
  }
  return {
    ...value,
    l: scaleProperty(value, newL, `l`)
  }
}

const scaleProperty = (hsl: Hsl, value: number, property: `l` | `h` | `s`) => {
  if (hsl.unit === `scalar`) {
    // 0..1 scale
    if (value > 1) value = 1;
    else if (value < 0) value = 0;
  } else {
    // 0..100 scale
    if (value > 100) value = 100;
    else if (value < 0) value = 0;
  }
  return value;
}

const hslTransparent = Object.freeze({
  h: 0, s: 0, l: 0, opacity: 0, unit: `absolute`, space: `hsl`
});

export function fromHexString<T extends ParsingOptions<Hsl>>(hexString: string, scalar: T): T extends { scalar: true } ? HslScalar : HslAbsolute;

export function fromHexString(hexString: string, options: ParsingOptions<Hsl> = {}): Hsl {
  return fromLibrary(C.hex2hsl(hexString), options);
}

export function fromCss<T extends ParsingOptions<Hsl>>(value: string, options?: T): T extends { scalar: true } ? HslScalar : HslAbsolute;
export function fromCss(value: string, options: Partial<ParsingOptions<Hsl>> = {}): Hsl {
  value = value.toLowerCase();

  if (value.startsWith(`hsla(`)) throw new Error(`hsla() not supported`);
  if (value.startsWith(`rgba(`)) throw new Error(`rgba() not supported`);

  if (value.startsWith(`#`)) {
    return fromHexString(value, options);
  }
  if (value.startsWith(`--`)) {
    try {
      value = resolveCss(value);
    } catch (error) {
      if (typeof options.fallbackString !== `undefined`) value = options.fallbackString;
      if (typeof options.fallbackColour !== `undefined`) return options.fallbackColour;
      throw error;
    }
  }
  if (value === `transparent`) return hslTransparent;
  if (typeof cssDefinedHexColours[ value ] !== `undefined`) {
    return fromHexString(cssDefinedHexColours[ value ] as string, options);
  }

  if (value.startsWith(`rgb(`)) {
    const hsl = rgbToLibraryHsl(value);
    return fromLibrary(hsl, options);
  }

  if (!value.startsWith(`hsl(`)) {
    try {
      value = C.convert(value, `hsl`);
    } catch (error) {
      if (options.fallbackString) {
        value = options.fallbackString;
      } else {
        throw error;
      }
    }
  }

  try {
    // Hand-rolled hsl() parse because the package is broken
    const hsl = parseCssHslFunction(value);
    if (options.scalar) return toScalar(hsl);
    return toAbsolute(hsl);
  } catch (error) {
    if (options.fallbackColour) return options.fallbackColour;
    throw error;
  }

}

export const toCssString = (hsl: Hsl): string => {
  const abs = toAbsolute(hsl);
  let css = `hsl(${ abs.h }deg ${ abs.s }% ${ abs.l }%`;
  if (`opacity` in abs && abs.opacity !== undefined && abs.opacity < 100) {
    css += ` / ${ abs.opacity }%`;
  }
  css += ')';
  return css;
}

export const toHexString = (hsl: Hsl): string => {
  const rgb = toLibraryRgb(hsl);
  return libraryRgbToHexString(rgb);
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
function fromLibrary<T extends ParsingOptions<Hsl>>(hsl: C.HSL, parsingOptions: T): T extends { scalar: true } ? HslScalar : HslAbsolute;

function fromLibrary<T extends Hsl>(hsl: C.HSL, parsingOptions: ParsingOptions<T> = {}): T {
  if (typeof hsl === `undefined` || hsl === null) {
    if (parsingOptions.fallbackColour) return parsingOptions.fallbackColour;
  }
  const scalarOpt = parsingOptions.scalar ?? true;

  // Library result is absolute
  resultThrow(
    numberInclusiveRangeTest(hsl.h, 0, 360, `h`),
    numberInclusiveRangeTest(hsl.s, 0, 100, `s`),
    numberInclusiveRangeTest(hsl.l, 0, 100, `l`),
    percentTest((hsl.alpha ?? 1), `alpha`)
    // () => hsl.alpha !== undefined ? numberInclusiveRangeTest(hsl.alpha, 0, 100, `alpha`) : { success: true, value: hsl },
  );
  if (scalarOpt) {
    return scalar(hsl.h / 360, hsl.s / 100, hsl.l / 100, (hsl.alpha ?? 1)) as T;
  } else {
    return absolute(hsl.h, hsl.s, hsl.l, (hsl.alpha ?? 1) * 100) as T;
  }
}

export const toAbsolute = (hslOrString: Hsl | Rgb | string): HslAbsolute => {
  // if (typeof hslOrString === `string`) {
  //   return toAbsolute(fromLibrary(C.parseCSS(hslOrString, `hsl`), { scalar: false }));
  // }
  if (typeof hslOrString === `string`) {
    return fromCss(hslOrString, { scalar: false });
    // try {
    //   return toScalar(fromLibrary(C.parseCSS(hslOrString, `hsl`), { scalar: true }));
    // } catch (error) {
    //   console.error(`Hsl.toScalar: ${ hslOrString }`);
    //   throw error;
    // }
  }
  if (isRgb(hslOrString)) {
    return toAbsolute(fromLibrary(rgbToLibraryHsl(hslOrString), { scalar: false }));
  }
  const hsl = hslOrString;
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

/**
 * Converts a {@link Hsl} value to scalar units, or parses a colour string
 * and converts it.
 * 
 * ```js
 * toScalar({ h: 100, s: 50, l: 100, unit: `absolute` });
 * toScalar(`red`);
 * ```
 * @param hslOrString 
 * @returns 
 */
export const toScalar = (hslOrString: Rgb | Hsl | string): HslScalar => {
  if (typeof hslOrString === `string`) {
    return fromCss(hslOrString, { scalar: true });
    // try {
    //   return toScalar(fromLibrary(C.parseCSS(hslOrString, `hsl`), { scalar: true }));
    // } catch (error) {
    //   console.error(`Hsl.toScalar: ${ hslOrString }`);
    //   throw error;
    // }
  }
  if (isRgb(hslOrString)) {
    return toScalar(fromLibrary(rgbToLibraryHsl(hslOrString), { scalar: true }));
  }

  const hsl = hslOrString;
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
          return numberInclusiveRangeTest(opacity, 0, 100, `opacity`);
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

export const interpolator = (a: Hsl | string, b: Hsl | string, direction: `longer` | `shorter` = `shorter`) => {
  a = toScalar(a);
  b = toScalar(b);
  const aOpacity = a.opacity ?? 1;
  const distanceCalc = calculateHueDistance(a.h, b.h, 1);
  const hueDistance = direction === `longer` ? distanceCalc.long : distanceCalc.short;
  const satDistance = b.s - a.s;
  const lightDistance = b.l - a.l;
  const opacityDistance = (b.opacity ?? 1) - aOpacity;

  return (amount: number): HslScalar => {
    amount = clamp(amount);
    let h = interpolate(amount, 0, Math.abs(hueDistance));
    if (hueDistance < 0) h = a.h - h;
    else h = a.h + h;

    const s = interpolate(amount, 0, satDistance);
    const l = interpolate(amount, 0, lightDistance);
    const o = interpolate(amount, 0, opacityDistance);
    return scalar(wrapScalarHue(h), s + a.s, l + a.l, o + aOpacity);
  }
}

/**
 * Creates a HslScalar value from scalar (0..1) values
 * @param hue 
 * @param sat 
 * @param lightness 
 * @param opacity 
 * @returns 
 */
export function scalar(hue = 0.5, sat = 1, lightness = 0.5, opacity = 1): HslScalar {
  const hsl: HslScalar = {
    unit: `scalar`,
    space: `hsl`,
    h: hue,
    s: sat,
    l: lightness,
    opacity: opacity
  }
  guard(hsl);
  return hsl;
}

export function absolute(hue = 200, sat = 100, lightness = 50, opacity = 100): HslAbsolute {
  const hsl: HslAbsolute = {
    unit: `absolute`,
    space: `hsl`,
    h: hue,
    s: sat,
    l: lightness,
    opacity: opacity
  }
  guard(hsl);
  return hsl;
}

/**
 * It seems Colorizr can't handle 'deg' units
 * @param value 
 */
export function parseCssHslFunction(value: string): Hsl {
  if (value.startsWith(`hsla`)) throw new Error(`hsla() is not supported`);
  if (!value.startsWith(`hsl(`)) throw new Error(`Expected hsl(..) CSS colour`);

  const start = value.indexOf('(');
  const end = value.indexOf(')');
  if (end < start) throw new Error(`Is hsl() not terminated? Missing ')'`);

  const part = value.substring(start + 1, end);
  let split = part.split(/[\s,]+/);
  if (split.length < 3) throw new Error(`Expected three tokens. Got: ${ split.length } length`);

  let returnRelative = false;
  if (split[ 0 ].endsWith(`%`)) returnRelative = true;
  if (split[ 1 ].endsWith(`%`) && split[ 2 ].endsWith(`%`)) returnRelative = true;

  const valueAsScalar = (v: string, pos: number) => {
    if (v === `none`) return 0;
    if (v.endsWith(`%`)) {
      return Number.parseFloat(v.substring(0, v.length - 1)) / 100;
    }
    if (v.endsWith(`deg`) && pos === 0) {
      v = v.substring(0, v.length - 3);
    }

    const vf = Number.parseFloat(v);
    if (pos === 0) return vf / 360;
    if (pos === 3) return vf; // opacity
    return vf / 100;
  }

  const valueAsAbs = (v: string, pos: number) => {
    if (v === `none`) return 0;
    if (v.endsWith(`%`)) {
      const vf = Number.parseFloat(v.substring(0, v.length - 1));
      if (pos === 0) return vf * 360;
      return vf;
    }
    if (v.endsWith(`deg`) && pos === 0) {
      return Number.parseFloat(v.substring(0, v.length - 3));
    }
    const vf = Number.parseFloat(v);
    return vf;
  }

  // Is there opacity?
  if (split.length > 3) {
    if (split[ 3 ] === '/') {
      // Remove / part
      split = [ split[ 0 ], split[ 1 ], split[ 2 ], split[ 4 ] ];
    }
  }
  if (returnRelative) {
    return scalar(
      valueAsScalar(split[ 0 ], 0),
      valueAsScalar(split[ 1 ], 1),
      valueAsScalar(split[ 2 ], 2),
      valueAsScalar(split[ 3 ] ?? `100%`, 3)
    )
  } else {
    // Return as absolute
    return absolute(
      valueAsAbs(split[ 0 ], 0),
      valueAsAbs(split[ 1 ], 1),
      valueAsAbs(split[ 2 ], 2),
      valueAsAbs(split[ 3 ] ?? `100%`, 3)
    )
  }
}

/**
 * Converts a Hsl structure (or CSS string) to Colorizr's RGB format
 * @param hsl HSL colour
 * @returns 
 */
export function toLibraryRgb(hsl: Hsl | string): C.RGB {
  if (typeof hsl === `string`) {
    const parseResult = fromCss(hsl, { scalar: false });
    //console.log(`parseResult hsl: ${ hsl } pr: `, parseResult);
    return toLibraryRgb(parseResult);
  }
  hsl = toAbsolute(hsl);
  //console.log(`toLibraryRgb hsl`, hsl);
  const rgb = C.hsl2rgb({ h: hsl.h, s: hsl.s, l: hsl.l });
  return { ...rgb, alpha: (hsl.opacity ?? 100) / 100 * 255 };
}