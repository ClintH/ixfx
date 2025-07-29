import type { Hsl, Rgb, OkLch, Colourish } from "./types.js";

export const isHsl = (v: any): v is Hsl => {
  if (typeof v === `object`) {
    if (!(`h` in v && `s` in v && `l` in v)) return false;
    if (!(`unit` in v)) return false;
    if (`space` in v) {
      if (v.space !== `hsl`) return false;
    }
  }
  return false;
}

export const isRgb = (v: any): v is Rgb => {
  if (typeof v === `object`) {
    if (!(`r` in v && `g` in v && `b` in v)) return false;
    if (!(`unit` in v)) return false;
    if (`space` in v) {
      if (v.space !== `srgb`) return false;
    }
  }
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
    if (v.r <= 1 && v.g <= 1 && v.b <= 1) {
      v.unit = `scalar`;
    } else if (v.s > 100 && v.l <= 100) {
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

export const isLch = (v: any): v is OkLch => {
  if (typeof v === `object`) {
    if (!(`l` in v && `c` in v && `h` in v)) return false;
    if (!(`unit` in v)) return false;
    if (`space` in v) {
      if (v.space === `lch`) return true;
      if (v.space == `oklch`) return true;
    }
  }
  return false;
}

export const isColourish = (v: any): v is Colourish => {
  if (typeof v === `string`) return true;
  if (typeof v !== `object`) return false;
  if (isHsl(v)) return true;
  if (isLch(v)) return true;
  if (isRgb(v)) return true;
  return false;
}