// Source: v2.0.0 https://github.com/colorjs/color-space
/* eslint-disable */
import {ColourSpace, RgbConvertable} from './ColourSpace.js';
import {Rgb, Rgba, guard as guardRgb} from './Rgb.js';
import {lerp as lerpNumber} from '../../Util.js';
import {number as guardNumber} from '../../Guards.js';


export type Hsl = {h:number, s:number, l:number};
export type Hsla = Hsl& {a:number};

export const guard = (hsl:Hsl|Hsla) => {
  guardNumber(hsl.h,``, `hsl.h`);
  if (hsl.s > 360) throw new Error(`hsl.s expected to be 0-360`);
  guardNumber(hsl.s, `percentage`, `hsl.s`);
  guardNumber(hsl.l, `percentage`, `hsl.l`);
  if (`a` in hsl) {
    guardNumber(hsl.a, `percentage`, `hsl.a`);
  }
}

const toRgb = (hsl:Hsl):Rgb => {
  //var h = hsl / 360, s = hsl[1] / 100, l = hsl[2] / 100, t1, t2, t3, rgb, val, i = 0;
  let {h,s,l} = hsl;
  let t1, t2, t3, rgb, i = 0;

  if (s === 0) {
    //val = l * 255, [val, val, val];
    let val = l*255;
    return {r:val, g:val, b:val};
  } 

  t2 = l < 0.5 ? l * (1 + s) : l + s - l * s;
  t1 = 2 * l - t2;

  rgb = [0, 0, 0];
  for (; i < 3;) {
    t3 = h + 1 / 3 * - (i - 1);
    t3 < 0 ? t3++ : t3 > 1 && t3--;
    let val = 6 * t3 < 1 ? t1 + (t2 - t1) * 6 * t3 :
      2 * t3 < 1 ? t2 :
        3 * t3 < 2 ? t1 + (t2 - t1) * (2 / 3 - t3) * 6 :
          t1;
    rgb[i++] = val * 255;
  }

  return {r:rgb[0], g:rgb[1], b:rgb[2]};
};

export const fromRgba = (rgba:Rgba):Hsla => {
  guard
  const hsl = fromRgb(rgba);
  const hsla = {...hsl, a: rgba.a};
  return hsla;
}

//extend rgb
const fromRgb = (rgb:Rgb|Rgba):Hsl => {
  guardRgb(rgb);
  let {r,g,b} = rgb;
  r /= 255;
  g /= 255;
  b /= 255;

  var min = Math.min(r, g, b),
    max = Math.max(r, g, b),
    delta = max - min,
    h, s, l;

  h = 0;
  if (max === min) {
    h = 0;
  }
  else if (r === max) {
    h = (g - b) / delta;
  }
  else if (g === max) {
    h = 2 + (b - r) / delta;
  }
  else if (b === max) {
    h = 4 + (r - g) / delta;
  }

  h = Math.min(h * 60, 360);

  if (h < 0) {
    h += 360;
  }

  l = (min + max) / 2;

  if (max === min) {
    s = 0;
  }
  else if (l <= 0.5) {
    s = delta / (max + min);
  }
  else {
    s = delta / (2 - max - min);
  }

  const result = {h, s, l};
  guard(result);
  return result;
};

export const lerp = (amount:number, a:Hsl, b:Hsl):Hsl => {
  guardNumber(amount, `percentage`, `amount`);

  let ha = a.h;
  let hb = b.h;
  let f = false;
  let dist = hb - ha;

  if (dist < 0) {
    // End wraps around to start
    ha = a.h - b.h;
    hb = a.h + b.h;
    
  }
  // if (hb < ha) {
  //   ha = hb;
  //   hb = b.h + a.h;
  //   f = true;
  // }

  console.log(`a: ${a.h} (${ha}) b: ${b.h} (${hb}) dist: ${dist}`);
 
  let h = lerpNumber(amount, ha, hb);
  if (dist < 0) {
    h -= a.h;
  }

  const s = lerpNumber(amount, a.s, b.s);
  const l = lerpNumber(amount, a.l, b.l);
  return {h, s, l};
}

export const toCss = (hsl:Hsl|Hsla) => {
  if (`a` in hsl) {
    return `hsl(${hsl.h}, ${hsl.s*100}%, ${hsl.l*100}%, ${hsl.a*100}%)`
  } else {
    return `hsl(${hsl.h}, ${hsl.s*100}%, ${hsl.l*100}%)`
  }
}

export const hsl:ColourSpace<Hsl|Hsla> & RgbConvertable<Hsl|Hsla> = {
  name: 'hsl',
  min: [0, 0, 0],
  max: [360, 100, 100],
  channel: ['hue', 'saturation', 'lightness'],
  alias: ['HSL'],
  toRgb,
  fromRgb,
  lerp,
  toCss
}