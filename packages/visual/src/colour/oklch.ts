import type { OkLch, OkLchAbsolute, OkLchScalar, ParsingOptions } from "./types.js";
import { numberInclusiveRangeTest, percentTest, resultThrow } from "@ixfx/guards";
import Colorizr, * as C from "colorizr";
import { cssDefinedHexColours } from "./css-colours.js";
import { angleConvert, angleParse, type Angle } from "@ixfx/geometry";
import { calculateHueDistance, wrapScalarHue } from "./utility.js";
import { clamp, interpolate } from "@ixfx/numbers";
import { parseCssRgbFunction, to8bit as rgbTo8bit } from "./srgb.js";

export const OKLCH_CHROMA_MAX = 0.4;

export const guard = (lch: OkLch) => {
  const { l, c, h, opacity, space, unit } = lch;
  if (space !== `oklch`) throw new Error(`Space is expected to be 'oklch'. Got: ${ space }`);

  if (unit === `absolute`) {
    resultThrow(
      percentTest(l, `l`),
      () => {
        if (typeof c === `number`) {
          return numberInclusiveRangeTest(c, 0, OKLCH_CHROMA_MAX, `c`);
        }
      },
      () => {
        if (typeof h === `number`) {
          return numberInclusiveRangeTest(c, 0, 360, `h`);
        }
      },
      percentTest((opacity ?? 1), `opacity`)
    );
  } else if (unit === `scalar`) {
    // Percentage values for L,C,H
    resultThrow(
      percentTest(l, `l`),
      percentTest(c, `c`),
      percentTest(h, `h`),
      percentTest((lch.opacity ?? 1), `opacity`)
    );
  } else {
    throw new Error(`Unit is expected to be 'absolute' or 'scalar'. Got: ${ unit }`);
  }
}

/**
 * Coverts from the Colorizr library
 * Tests ranges:
 * * l: 0..1
 * * c: 0..1
 * * h: 0..360
 * * alpha: 0..1
 * 
 * Default option: { scalar: true }
 * @param lch LCH value
 * @param parsingOptions Options for parsing 
 * @returns 
 */
export function fromLibrary<T extends ParsingOptions<OkLch>>(lch: C.LCH, parsingOptions: T): T extends { scalar: true } ? OkLchScalar : OkLchAbsolute;

export function fromLibrary(lch: C.LCH, parsingOptions: ParsingOptions<OkLch> = {}): OkLch {
  if (typeof lch === `undefined` || lch === null) {
    if (parsingOptions.fallbackColour) return parsingOptions.fallbackColour;
  }

  const scalarReturn = parsingOptions.scalar ?? true;

  // Validate
  resultThrow(
    percentTest(lch.l, `l`),
    percentTest(lch.c, `c`),
    numberInclusiveRangeTest(lch.h, 0, 360, `h`),
    percentTest((lch.alpha ?? 1), `alpha`)
  );

  if (scalarReturn) {
    return scalar(lch.l, lch.c / OKLCH_CHROMA_MAX, lch.h / 360, (lch.alpha ?? 1));
  } else {
    return absolute(lch.l, lch.c, lch.h, (lch.alpha ?? 1));
  }
}

/**
 * Parse a HEX-formatted colour into OkLch structured format
 * @param hexString 
 * @param options 
 * @returns 
 */
export const fromHexString = (hexString: string, options: ParsingOptions<OkLch> = {}): OkLch => {
  return fromLibrary(C.hex2oklch(hexString), options);
}

const oklchTransparent: OkLchAbsolute = Object.freeze({
  l: 0, c: 0, h: 0, opacity: 0, unit: `absolute`, space: `oklch`
});

/**
 * Converts from some CSS-representation of colour to a structured OkLch format.
 * 
 * ```js
 * fromCss(`yellow`);
 * fromCss(`rgb(100,200,90)`);
 * fromCss(`#ff00ff`);
 * ```
 * 
 * By default returns a {@link OkLchScalar} (relative) representation. Use the flag 'scalar:true' to get back
 * {@link OkLchAbsolute}.
 * @param value 
 * @param options 
 */
export function fromCss<T extends ParsingOptions<OkLch>>(value: string, options: T): T extends { scalar: true } ? OkLchScalar : OkLchAbsolute;

export function fromCss(value: string, options: ParsingOptions<OkLch> = {}): OkLch {
  value = value.toLowerCase();
  if (value.startsWith(`#`)) {
    return fromHexString(value, options);
  }
  if (value === `transparent`) return oklchTransparent;
  if (typeof cssDefinedHexColours[ value ] !== `undefined`) {
    return fromHexString(cssDefinedHexColours[ value ] as string, options);
  }

  if (value.startsWith(`rgb(`)) {
    const rgb = rgbTo8bit(parseCssRgbFunction(value));
    const lch = C.rgb2oklch({ r: rgb.r, g: rgb.g, b: rgb.b });
    return fromLibrary(lch, options);
  }

  if (!value.startsWith(`hsl(`) && !value.startsWith(`oklch(`)) {
    try {
      const converted = C.convert(value, `oklch`);
      value = converted;
    } catch (error) {
      if (options.fallbackString) {
        value = options.fallbackString;
      } else {
        throw error;
      }
    }
  }
  const cc = new Colorizr(value);
  const lch = cc.oklch;
  return fromLibrary(lch, options);
}

//export const fromCssScalar = (value: string, options: ParsingOptions<OkLchAbsolute> = {}): OkLchScalar => toScalar(fromCssAbsolute(value, options));

/**
 * Returns a string or {@link OkLch} value to absolute form.
 * 
 * This means ranges are:
 * * lightness: 0..1
 * * chroma: 0...CHROMA_MAX (0.4)
 * * hue: 0..360
 * @param lchOrString 
 * @returns 
 */
export const toAbsolute = (lchOrString: OkLch | string): OkLchAbsolute => {
  if (typeof lchOrString === `string`) {
    return toAbsolute(fromCss(lchOrString, { scalar: true }));
  }
  guard(lchOrString);
  if (lchOrString.unit === `absolute`) return lchOrString;
  return {
    space: `oklch`,
    unit: `absolute`,
    l: lchOrString.l,
    c: lchOrString.c * OKLCH_CHROMA_MAX,
    h: lchOrString.h * 360,
    opacity: lchOrString.opacity
  }
}


export const toScalar = (lchOrString: OkLch | string): OkLchScalar => {
  if (typeof lchOrString === `string`) {
    return toScalar(fromCss(lchOrString, { scalar: true }));
  }
  const lch = lchOrString;
  guard(lch);

  //console.log(`toScalar input: ${ JSON.stringify(lchOrString) } lch: `, lch);
  // Already relative
  if (lch.unit === `scalar`) return lch;

  // Absolute values
  return {
    l: lch.l, // unchanged
    c: lch.c / OKLCH_CHROMA_MAX,
    h: lch.h / 360,
    opacity: (lch.opacity ?? 1),
    unit: `scalar`,
    space: `oklch`
  }
}

const toLibrary = (lch: OkLch): C.LCH => {
  const abs = toAbsolute(lch);
  return {
    l: abs.l,
    c: abs.c,
    h: abs.h,
    alpha: abs.opacity,
  }
}
// const libraryLchToScalar = (c: C.LCH): OkLchScalar => {
//   return {
//     l: c.h,
//     c: c.c,
//     h: c.h / 360,
//     opacity: c.alpha ?? 1,
//     unit: `scalar`,
//     space: `oklch`
//   }
// }


/**
 * Returns the colour as a CSS colour string: `oklch(l c h / opacity)`.
 *
 * @param lch Colour
 * @param precision Set precision of numbers, defaults to 3 
 * @returns CSS colour string
 */
export const toCssString = (lch: OkLch, precision = 3): string => {
  guard(lch);
  const { l, c, h, opacity } = lch;
  let css = ``;
  switch (lch.unit) {
    case `absolute`:
      css = `oklch(${ (l * 100).toFixed(precision) }% ${ c.toFixed(precision) } ${ h.toFixed(precision) }`
      break;
    case `scalar`:
      css = `oklch(${ l.toFixed(precision) } ${ (c * OKLCH_CHROMA_MAX).toFixed(precision) } ${ (h * 360).toFixed(precision) }`
      break;
  }
  if (typeof opacity !== `undefined` && opacity !== 1) {
    css += ` / ${ opacity.toFixed(precision) }`;
  }
  css += `)`;
  return css;
}

// export const oklchFromCss = (css: string): OkLchScalar => {
//   if (css.startsWith(`#`)) {
//     libraryLchToScalar(C.hex2oklch(css));
//   }
//   const p = C.extractColorParts(css);
//   return libraryToScalar(p);
// }

// const libraryToScalar = (colour: unknown): OkLchScalar => {
//   if (C.isLCH(colour)) {
//     return libraryLchToScalar(colour);
//   }
//   if (C.isRGB(colour)) {
//     return libraryToScalar(C.rgb2oklch(colour));
//   }
//   if (C.isLAB(colour)) {
//     return libraryToScalar(C.oklab2oklch(colour));
//   }
//   if (C.isHSL(colour)) {
//     return libraryToScalar(C.hsl2oklch(colour));
//   }
//   if (C.isHex(colour)) {
//     return libraryLchToScalar(C.hex2oklch(colour));
//   }
//   throw new Error(`Unexpected colour format`);
// }

// export const oklchToColorJs = (lch: OkLch): ColorConstructor => {
//   throwNumberTest(lch.l, `percentage`, `lch.l`);
//   throwNumberTest(lch.c, `percentage`, `lch.c`);
//   throwNumberTest(lch.h, `percentage`, `lch.h`);
//   throwNumberTest(lch.opacity, `percentage`, `lch.opacity`);
//   return {
//     alpha: lch.opacity,
//     coords: [ lch.l, lch.c * 0.4, lch.h * 360 ],
//     spaceId: `oklch`
//   }
// }

// const oklchToColorJs = (oklch: OkLch) => {
//   throwNumberTest(oklch.l, `percentage`, `oklch.l`);
//   throwNumberTest(oklch.c, `percentage`, `oklch.c`);
//   throwNumberTest(oklch.h, `percentage`, `oklch.h`);
//   throwNumberTest(oklch.opacity, `percentage`, `oklch.opacity`);
//   const coords: [ number, number, number ] = [
//     oklch.l,
//     oklch.c * 0.4,
//     oklch.h * 360
//   ]
//   return new ColorJs.default(`oklch`, coords, oklch.opacity);
// }

// export const isOklch = (p: Colourish | undefined | null): p is OkLch => {
//   if (typeof p === `undefined` || p === null) return false;
//   if (typeof p !== `object`) return false;

//   // Check if Colourjs
//   //if ((p as ColorJs.ColorObject).spaceId !== undefined) return false;
//   //if ((p as ColorJs.ColorObject).coords !== undefined) return false;
//   if (p.space !== `oklch`) return false;
//   if (typeof p.l === `undefined`) return false;
//   if (typeof p.c === `undefined`) return false;
//   if (typeof p.h === `undefined`) return false;
//   return true;
// }

export const generateScalar = (absoluteHslOrVariable: string | number | Angle, chroma = 1, lightness = 0.5, opacity = 1): OkLchScalar => {

  if (typeof absoluteHslOrVariable === `string`) {
    if (absoluteHslOrVariable.startsWith(`--`)) {
      absoluteHslOrVariable = getComputedStyle(document.body).getPropertyValue(absoluteHslOrVariable).trim()
    }
  }
  if (lightness > 1) throw new TypeError(`Param 'lightness' must be between 0..1`);
  if (chroma > 1) throw new TypeError(`Param 'chroma' must be between 0..1`);
  const hue = angleParse(absoluteHslOrVariable);
  const hueDeg = angleConvert(hue, `deg`).value / 360;
  if (opacity > 1) throw new TypeError(`Param 'opacity' must be between 0..1`);

  return {
    l: lightness,
    c: chroma,
    h: hueDeg,
    opacity: opacity,
    unit: `scalar`,
    space: `oklch`
  }
}

/**
 * Scales the opacity value of an input Oklch value
 * ```js
 * withOpacity()
 * ```
 * @param value 
 * @param fn 
 * @returns 
 */
export const withOpacity = <T extends OkLch>(value: T, fn: (opacityScalar: number, value: T) => number): T => {
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

export const interpolator = (a: OkLch | string, b: OkLch | string, direction: `longer` | `shorter` = `shorter`) => {
  a = toScalar(a);
  b = toScalar(b);
  //console.log(`a`, a);
  //console.log(`b`, b);

  const aOpacity = a.opacity ?? 1;
  const distanceCalc = calculateHueDistance(a.h, b.h, 1);
  const hueDistance = direction === `longer` ? distanceCalc.long : distanceCalc.short;
  const chromaDistance = b.c - a.c;
  const lightDistance = b.l - a.l;
  const opacityDistance = (b.opacity ?? 1) - aOpacity;
  //console.log(`distanceCalc`, distanceCalc);
  //console.log(`interpolator distances: hue: ${ hueDistance } c: ${ chromaDistance } light: ${ lightDistance } opacity: ${ opacityDistance }`);

  return (amount: number): OkLchScalar => {
    amount = clamp(amount);
    let h = interpolate(amount, 0, Math.abs(hueDistance));
    if (hueDistance < 0) h = a.h - h;
    else h = a.h + h;

    const c = interpolate(amount, 0, chromaDistance);
    const l = interpolate(amount, 0, lightDistance);
    const o = interpolate(amount, 0, opacityDistance);
    //console.log(`amount: ${ amount } h: ${ h } s: ${ s } l: ${ l } o: ${ o }`);
    return scalar(l + a.l, c + a.c, wrapScalarHue(h), o + aOpacity);
  }
}

export function scalar(lightness = 0.7, chroma = 0.1, hue = 0.5, opacity = 1): OkLchScalar {
  const lch: OkLchScalar = {
    unit: `scalar`,
    space: `oklch`,
    l: lightness,
    c: chroma,
    h: hue,
    opacity: opacity
  }
  guard(lch);
  return lch;
}

/**
 * Create an LCH colour using absolute hue
 * @param l Lightness 0..1
 * @param c Chroma 0..4
 * @param h Hue 0..360
 * @param opacity 
 * @returns 
 */
export const absolute = (l: number, c: number, h: number, opacity = 1): OkLchAbsolute => {
  const lch: OkLchAbsolute = {
    space: `oklch`,
    unit: `absolute`,
    opacity,
    l, c, h
  };
  guard(lch);
  return lch;
}
