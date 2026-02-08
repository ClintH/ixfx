import type { Hsl, Rgb, OkLch, Colourish } from "./types.js";

export const isHsl = (v: any): v is Hsl => {
  if (typeof v !== `object`) return false;
  if (!(`h` in v)) return false;
  if (!(`s` in v)) return false;
  if (!(`l` in v)) return false;
  if (!(`unit` in v)) return false;
  if (!(`space` in v)) return false;
  if (v.space !== `hsl`) return false;
  return true;
}

export const isRgb = (v: any): v is Rgb => {
  if (typeof v !== `object`) return false;
  if (!(`r` in v)) return false;
  if (!(`g` in v)) return false;
  if (!(`b` in v)) return false;
  if (!(`space` in v)) return false;
  if (!(`unit` in v)) return false;
  if (v.space === `srgb`) return true;
  return false;
}


/**
 * If the input object has r,g&b properties, it will return a fully-
 * formed Rgb type with `unit` and `space` properties.
 * 
 * If it lacks these basic three properties or they are out of range,
 *  _undefined_ is returned.
 * 
 * If RGB values are less than 1 assumes unit:scalar. Otherwise unit:8bit.
 * If RGB values exceed 255, _undefined_ returned.
 * @param v 
 * @returns 
 */
export const tryParseObjectToRgb = (v: any): Rgb | undefined => {
  if (typeof v !== `object`) throw new TypeError(`Param 'v' is expected to be an object, got: ${ typeof v }`);
  if (!(`r` in v && `g` in v && `b` in v)) return;
  if (!(`unit` in v)) {
    if (v.r <= 1 && v.g <= 1 && v.b <= 1) {
      v.unit = `scalar`;
    } else if (v.r > 255 && v.g <= 255 && v.b <= 255) {
      return; // out of range
    } else {
      v.unit = `8bit`;
    }
  }
  if (!(`space` in v)) {
    v.space = `srgb`;
  }
  return v as Rgb;
}

export const tryParseObjectToHsl = (v: any): Hsl | undefined => {
  if (!(`h` in v && `s` in v && `l` in v)) return;
  if (!(`unit` in v)) {
    if (v.s <= 1 && v.l <= 1) {
      v.unit = `scalar`;
    } else if (v.s > 100 || v.l > 100) {
      return; // out of range
    } else {
      v.unit = `absolute`;
    }
  }
  if (!(`space` in v)) {
    v.space = `hsl`;
  }
  return v as Hsl;
}

export const isOkLch = (v: any): v is OkLch => {
  if (typeof v !== `object`) return false;
  if (!(`l` in v)) return false;
  if (!(`c` in v)) return false;
  if (!(`h` in v)) return false;
  if (!(`unit` in v)) return false;
  if (!(`space` in v)) return false;
  if (v.space === `lch`) return true;
  if (v.space === `oklch`) return true;
  return false;
}

export const isColourish = (v: any): v is Colourish => {
  if (typeof v === `string`) return true;
  if (typeof v !== `object`) return false;
  if (isHsl(v)) return true;
  if (isOkLch(v)) return true;
  if (isRgb(v)) return true;
  return false;
}