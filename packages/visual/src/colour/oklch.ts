//import type { ColorConstructor } from "./colorjs.types.js";
import type { Colourish, OkLch, OkLchAbsolute, OkLchScalar, ParsingOptions } from "./types.js";
import { numberInclusiveRangeTest, numberTest, resultThrow, throwIfFailed } from "@ixfx/guards";
import * as C from "colorizr";
import { cssDefinedHexColours } from "./css-colours.js";
import { angleConvert, angleParse, type Angle } from "@ixfx/geometry";

// const oklchGuard = (lch: OkLch) => {
//   switch (lch.unit) {
//     case `scalar`:
//       throwIfFailed(
//         numberTest(lch.l, `percentage`, `lch.l`),
//         numberTest(lch.c, `percentage`, `lch.c`),
//         numberTest(lch.h, `percentage`, `lch.h`),
//         numberTest(lch.opacity, `percentage`, `lch.opacity`)
//       );
//       break;
//     case `absolute`:
//       throwIfFailed(
//         numberTest(lch.l, `percentage`, `lch.l`),
//         numberTest(lch.c, `percentage`, `lch.c`),
//         numberTest(lch.opacity, `percentage`, `lch.opacity`)
//       );
//       break;
//     default:
//       // eslint-disable-next-line @typescript-eslint/ban-ts-comment
//       // @ts-expect-error
//       throw new Error(`Unknown unit: ${ lch.unit }`);
//   }
// }

export const guard = (lch: OkLch) => {
  const { l, c, h, opacity, space, unit } = lch;
  if (space !== `oklch`) throw new Error(`Space is expected to be 'oklch'. Got: ${ space }`);
  if (unit === `absolute`) {
    resultThrow(
      numberTest(l, `percentage`, `l`),
      numberTest(c, `percentage`, `c`),
      numberTest(h, `percentage`, `h`),
      () => {
        if (typeof opacity === `number`) {
          return numberInclusiveRangeTest(opacity, 0, 100, `opacity`);
        }
      });
  } else if (unit === `scalar`) {
    resultThrow(
      numberTest(l, `percentage`, `l`),
      numberTest(c, `percentage`, `c`),
      numberTest(h, `percentage`, `h`),
      () => {
        if (typeof opacity === `number`) {
          return numberTest(opacity, `percentage`, `opacity`);
        }
      });
  } else {
    throw new Error(`Unit is expected to be 'absolute' or 'scalar'. Got: ${ unit }`);
  }
}

const fromLibrary = (lch: C.LCH, parsingOptions: ParsingOptions<OkLchAbsolute> = {}): OkLchAbsolute => {
  if (typeof lch === `undefined` || lch === null) {
    if (parsingOptions.fallbackColour) return parsingOptions.fallbackColour;
  }
  resultThrow(
    numberInclusiveRangeTest(lch.l, 0, 360, `l`),
    numberInclusiveRangeTest(lch.c, 0, 100, `c`),
    numberInclusiveRangeTest(lch.h, 0, 100, `h`),
    () => lch.alpha !== undefined ? numberInclusiveRangeTest(lch.alpha, 0, 100, `alpha`) : { success: true, value: lch },
  );
  return {
    l: lch.l,
    c: lch.c,
    h: lch.h,
    opacity: (lch.alpha ?? 1) * 100,
    unit: `absolute`,
    space: `oklch`
  }
}
export const fromHexString = (hexString: string): OkLchAbsolute => fromLibrary(C.hex2oklch(hexString))
const oklchTransparent: OkLchAbsolute = Object.freeze({
  l: 0, c: 0, h: 0, opacity: 0, unit: `absolute`, space: `oklch`
});

export const fromCssAbsolute = (value: string, options: ParsingOptions<OkLchAbsolute> = {}): OkLchAbsolute => {
  value = value.toLowerCase();
  if (value.startsWith(`#`)) {
    return fromHexString(value);
  }
  if (value === `transparent`) return oklchTransparent;
  if (typeof cssDefinedHexColours[ value ] !== `undefined`) {
    return fromHexString(cssDefinedHexColours[ value ] as string);
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
  const c = C.extractColorParts(value);
  if (c.model !== `oklch`) {
    if (options.fallbackColour) return options.fallbackColour;
    throw new Error(`Expecting OKLCH colour space. Got: ${ c.model }`);
  }
  return fromLibrary(c as any as C.LCH, options);
}

export const fromCssScalar = (value: string, options: ParsingOptions<OkLchAbsolute> = {}): OkLchScalar => toScalar(fromCssAbsolute(value, options));

export const toScalar = (lch: OkLch): OkLchScalar => {
  guard(lch);
  if (lch.unit === `scalar`) return lch;
  return {
    l: lch.l / 360,
    c: lch.c / 100,
    h: lch.h / 100,
    opacity: (lch.opacity ?? 1) / 100,
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

export const toAbsolute = (lch: OkLch): OkLchAbsolute => {
  if (lch.unit === `absolute`) return lch;
  return {
    space: `oklch`,
    unit: `absolute`,
    l: lch.l * 100,
    c: lch.c * 100,
    h: lch.h * 360,
    opacity: lch.opacity
  }
}

export const toCssString = (lch: OkLch): string => {
  guard(lch);
  const { l, c, h, opacity } = lch;
  let css = ``;
  switch (lch.unit) {
    case `absolute`:
      css = `lch(${ l }% ${ c }% ${ h })`
  }
  if (typeof opacity !== `undefined`) {
    css += ` / ${ opacity }`;
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