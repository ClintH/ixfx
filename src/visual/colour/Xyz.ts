// Source: v2.0.0 https://github.com/colorjs/color-space
/* eslint-disable */

import {ColourSpace, Whitepoint} from './ColourSpace.js';
import {Rgb} from './Rgb.js';

export type Xyz = {x:number, y:number,z:number};

/**
 * Whitepoint reference values with observer/illuminant
 *
 * http://en.wikipedia.org/wiki/Standard_illuminant
 */
const whitepoint = {
  //1931 2°
  2: {
    //incadescent
    A: [109.85, 100, 35.585],
    // B:[],
    C: [98.074, 100, 118.232],
    D50: [96.422, 100, 82.521],
    D55: [95.682, 100, 92.149],
    //daylight
    D65: [95.045592705167, 100, 108.9057750759878],
    D75: [94.972, 100, 122.638],
    //flourescent
    // F1: [],
    F2: [99.187, 100, 67.395],
    // F3: [],
    // F4: [],
    // F5: [],
    // F6:[],
    F7: [95.044, 100, 108.755],
    // F8: [],
    // F9: [],
    // F10: [],
    F11: [100.966, 100, 64.370],
    // F12: [],
    E: [100, 100, 100]
  },

  //1964  10°
  10: {
    //incadescent
    A: [111.144, 100, 35.200],
    C: [97.285, 100, 116.145],
    D50: [96.720, 100, 81.427],
    D55: [95.799, 100, 90.926],
    //daylight
    D65: [94.811, 100, 107.304],
    D75: [94.416, 100, 120.641],
    //flourescent
    F2: [103.280, 100, 69.026],
    F7: [95.792, 100, 107.687],
    F11: [103.866, 100, 65.627],
    E: [100, 100, 100]
  }
};

/**
 * Top values are the whitepoint’s top values, default are D65
 */
const max = whitepoint[2].D65 as Whitepoint;

/**
 * Transform xyz to rgb
 *
 * @param {Array} xyz Array of xyz values
 *
 * @return {Array} RGB values
 */
const xyzToRegb = (_xyz:Xyz, white:Whitepoint):Rgb => {
  //FIXME: make sure we have to divide like this. Probably we have to replace matrix as well then
  white = white || whitepoint[2].E;

  let x = _xyz.x / white[0],
    y = _xyz.y / white[1],
    z = _xyz.z / white[2],
    r, g, b;

  // assume sRGB
  // http://www.brucelindbloom.com/index.html?Eqn_RGB_XYZ_Matrix.html
  r = (x * 3.240969941904521) + (y * -1.537383177570093) + (z * -0.498610760293);
  g = (x * -0.96924363628087) + (y * 1.87596750150772) + (z * 0.041555057407175);
  b = (x * 0.055630079696993) + (y * -0.20397695888897) + (z * 1.056971514242878);

  r = r > 0.0031308 ? ((1.055 * Math.pow(r, 1.0 / 2.4)) - 0.055)
    : r = (r * 12.92);

  g = g > 0.0031308 ? ((1.055 * Math.pow(g, 1.0 / 2.4)) - 0.055)
    : g = (g * 12.92);

  b = b > 0.0031308 ? ((1.055 * Math.pow(b, 1.0 / 2.4)) - 0.055)
    : b = (b * 12.92);

  r = Math.min(Math.max(0, r), 1);
  g = Math.min(Math.max(0, g), 1);
  b = Math.min(Math.max(0, b), 1);

  return {r:r * 255, g:g * 255, b:b * 255};
};


/**
 * RGB to XYZ
 *
 * @param {Array} rgb RGB channels
 *
 * @return {Array} XYZ channels
 */
const rgbToXyz = (rgb:Rgb, white:Xyz):Xyz => {
  let r = rgb.r / 255,
    g = rgb.g / 255,
    b = rgb.b / 255;

  // assume sRGB
  r = r > 0.04045 ? Math.pow(((r + 0.055) / 1.055), 2.4) : (r / 12.92);
  g = g > 0.04045 ? Math.pow(((g + 0.055) / 1.055), 2.4) : (g / 12.92);
  b = b > 0.04045 ? Math.pow(((b + 0.055) / 1.055), 2.4) : (b / 12.92);

  const x = (r * 0.41239079926595) + (g * 0.35758433938387) + (b * 0.18048078840183);
  const y = (r * 0.21263900587151) + (g * 0.71516867876775) + (b * 0.072192315360733);
  const z = (r * 0.019330818715591) + (g * 0.11919477979462) + (b * 0.95053215224966);

  white = white || whitepoint[2].E;

  return {x:x * white.x, y:y * white.y, z:z * white.z};
};

const lerp = (amount:number, a:Xyz, b:Xyz):Xyz => {
  return a;
}


export const toCss = (v:Xyz):string => {
  
  return `xyz(${v.x}, ${v.y}, ${v.z})`;
}

export const xyz:ColourSpace<Xyz> = {
  name: `xyz`,
  min: [0, 0, 0],
  channel: [`X`, `Y`, `Z`],
  alias: [`XYZ`, `ciexyz`, `cie1931`],
  max,
  lerp,
  toCss
};