import { numberInclusiveRangeTest, throwNumberTest } from '@ixfxfun/guards';
import Color from 'colorjs.io';
import type { Colourish, Hsl, HslAbsolute, HslRelative } from './types.js';
import { clamp } from '@ixfxfun/numbers';
import { isRgb, toRgbRelative } from './rgb.js';
import { isOklch } from './oklch.js';
import { resolveCss } from './resolve-css.js';
import type { ColorConstructor } from 'colorjs.io';
import { throwFromResult } from '@ixfxfun/guards';

export const hslToColorJs = (hsl: Hsl): ColorConstructor => {
  const abs = hslToAbsolute(hsl);
  return {
    alpha: (abs.opacity ?? 1),
    coords: [ abs.h, abs.s, abs.l ],
    spaceId: `hsl`
  }
}

export const isHsl = (p: Colourish, validate = false): p is Hsl => {
  if (p === undefined || p === null) return false;
  if (typeof p !== `object`) return false;

  const pp = p as Hsl;
  if (pp.h === undefined) return false;
  if (pp.s === undefined) return false;
  if (pp.l === undefined) return false;

  if (validate) {
    if (pp.unit === `relative`) {
      throwFromResult(numberInclusiveRangeTest(pp.h, 0, 1, `h`));
      throwFromResult(numberInclusiveRangeTest(pp.s, 0, 1, `s`));
      throwFromResult(numberInclusiveRangeTest(pp.l, 0, 1, `l`));
    } else if (pp.unit === `absolute`) {
      //throwFromResult(numberInclusiveRangeTest(pp.h, 0, 360, `h`));
      throwFromResult(numberInclusiveRangeTest(pp.s, 0, 100, `s`));
      throwFromResult(numberInclusiveRangeTest(pp.l, 0, 100, `l`));
    }

    if (`opacity` in pp) {
      throwNumberTest(pp.opacity, `percentage`, `opacity`);
    }
  }

  return true;
};

export const hslToString = (hsl: Hsl): string => {
  const { h, s, l, opacity } = hslToAbsolute(hsl, true);
  return `hsl(${ h }deg ${ s }% ${ l }% / ${ opacity }%)`;
}


/**
 * Returns hue in 0..360, saturation, lightness in 0..100 scale.
 * Opacity is alwqys 0..1 scale
 * @param hsl 
 * @param safe 
 * @returns 
 */
export const hslToAbsolute = (hsl: Hsl, safe = true): HslAbsolute => {
  if (hsl.unit === `absolute`) return hsl;

  const h = hsl.h === null ? (safe ? 0 : null) : hsl.h;
  const opacity = hsl.opacity === undefined ? 1 : hsl.opacity;
  throwNumberTest(h, `percentage`, `hsl.h`);
  throwNumberTest(hsl.s, `percentage`, `hsl.s`);
  throwNumberTest(hsl.l, `percentage`, `hsl.l`);
  throwNumberTest(opacity, `percentage`, `hsl.opacity`);

  return {
    h: h! * 360,
    s: hsl.s * 100,
    l: hsl.l * 100,
    opacity,
    unit: `absolute`,
    space: `hsl`
  }

  //return new Color(`hsl`, coords, opacity);
}

// const hslToColorJs = (hsl: Hsl, safe: boolean) => {
//   const h = hsl.h === null ? (safe ? 0 : null) : hsl.h;
//   const opacity = hsl.opacity === undefined ? 1 : hsl.opacity;
//   throwNumberTest(h, `percentage`, `hsl.h`);
//   throwNumberTest(hsl.s, `percentage`, `hsl.s`);
//   throwNumberTest(hsl.l, `percentage`, `hsl.l`);
//   throwNumberTest(opacity, `percentage`, `hsl.opacity`);

//   const coords: [ number, number, number ] = [
//     h! * 360,
//     hsl.s * 100,
//     hsl.l * 100
//   ];
//   return new Color(`hsl`, coords, opacity);
// }

/**
 * Returns a Colorjs 'Color' object based on relative hue, saturation, lightness
 * and opacity.
 * @param h Hue (0..1)
 * @param s Saturation (0..1) Default: 1
 * @param l Lightness (0..1) Default: 0.5
 * @param opacity Opacity (0..1) Default: 1
 * @returns 
 */
// export const fromHsl = (h: number, s = 1, l = 0.5, opacity = 1): ColorJs.ColorObject => {
//   throwNumberTest(h, `percentage`, `h`);
//   throwNumberTest(s, `percentage`, `s`);
//   throwNumberTest(l, `percentage`, `l`);

//   return resolve({ h, s, l, opacity, space: `hsl` });
// }

export const hslFromRelativeValues = (h: number = 1, s: number = 1, l: number = 0.5, opacity = 1): HslRelative => {
  return {
    h, s, l, opacity, unit: `relative`, space: `hsl`
  }
}

export const hslFromAbsoluteValues = (h: number, s: number, l: number, opacity = 1, safe = false): HslRelative => {
  const hTest = numberInclusiveRangeTest(h, 0, 360, `h`);
  if (!hTest[ 0 ]) {
    if (safe) h = 0;
    else throwFromResult(hTest);
  }
  throwFromResult(numberInclusiveRangeTest(s, 0, 100, `s`));
  throwFromResult(numberInclusiveRangeTest(l, 0, 100, `l`));
  throwFromResult(numberInclusiveRangeTest(opacity, 0, 1, `opacity`));

  if (s > 100) throw new Error(`Param 's' expected 0..100`);
  if (l > 100) throw new Error(`Param 'l' expected 0..100`);
  h = clamp(h / 360);
  s = s / 100;
  l = l / 100;
  return {
    h, s, l, opacity, unit: `relative`, space: `hsl`
  };
}

export const hslToRelative = (hsl: Hsl, safe = true): HslRelative => {
  if (hsl.unit === `relative`) return hsl;
  return hslFromAbsoluteValues(hsl.h, hsl.s, hsl.l, hsl.opacity, safe);
  // let h = hsl.h / 360;
  // let s = hsl.s / 100;
  // let l = hsl.l / 100;
  // let opacity = hsl.opacity / 100;

  // if (safe) {
  //   h = clamp(h);
  //   s = clamp(s);
  //   l = clamp(l);
  //   opacity = clamp(opacity);
  // }
  // return {
  //   h, s, l, opacity,
  //   unit: `relative`, space: `hsl`
  // }
}

/**
 * Parses colour to `{ h, s, l }`, each field being on 0..1 scale.
 * 
 * Note that some colours will return NaN for h,s or l. This is because they have
 * indeterminate hue. For example white, black and transparent. By default hue of 0 is used
 * in these cases.
 * @param colour
 * @returns
 */
export const toHsl = (colour: Colourish, safe = true): HslRelative => {
  if (typeof colour === `string` && colour === `transparent`) return { h: 0, s: 0, l: 0, opacity: 0, space: `hsl`, unit: `relative` };
  if (!colour && !safe) throw new Error(`Param 'colour' is undefined`);
  if (isHsl(colour)) {
    return hslToRelative(colour);
  } else if (isRgb(colour)) {
    const rgb = toRgbRelative(colour);
    const c = new Color(`sRGB`, [ rgb.r, rgb.g, rgb.b ], rgb.opacity ?? 1);
    //const hsl = c.hsl; // absolute
    //return hslFromAbsoluteValues(hsl[ 0 ], hsl[ 1 ], hsl[ 2 ], c.alpha, safe);
    const [ h, s, l ] = c.hsl.map(v => parseFloat(v as any));
    return hslFromAbsoluteValues(h, s, l, parseFloat(c.alpha as any), safe);

  } else if (isOklch(colour)) {
    const c = new Color(`oklch`, [ colour.l, colour.c, colour.h ], colour.opacity ?? 1);
    //const hsl = c.hsl; // absolute
    //return hslFromAbsoluteValues(hsl[ 0 ], hsl[ 1 ], hsl[ 2 ], c.alpha, safe);
    const [ h, s, l ] = c.hsl.map(v => parseFloat(v as any));
    return hslFromAbsoluteValues(h, s, l, parseFloat(c.alpha as any), safe);

  } else {
    const c = new Color(resolveCss(colour));
    // absolute values
    const [ h, s, l ] = c.hsl.map(v => parseFloat(v as any));
    return hslFromAbsoluteValues(h, s, l, parseFloat(c.alpha as any), safe);
  }
};
