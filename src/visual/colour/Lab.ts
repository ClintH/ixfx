// Source: v2.0.0 https://github.com/colorjs/color-space
/* eslint-disable */

import {Xyz} from './Xyz.js';
import { ColourSpace, XyzConvertable } from './ColourSpace.js';
import {number as guardNumber} from '../../Guards.js';

export type Lab = {l:number, a:number, b:number};

const labToZyz = (lab:Lab):Xyz => {
  let {l,a,b} = lab;

  let x, y, z, y2;
  x = 0;
  z = 0;
  if (l <= 8) {
    y = (l * 100) / 903.3;
    y2 = (7.787 * (y / 100)) + (16 / 116);
  } else {
    y = 100 * Math.pow((l + 16) / 116, 3);
    y2 = Math.pow(y / 100, 1 / 3);
  }

  x = x / 95.047 <= 0.008856 ? x = (95.047 * ((a / 500) + y2 - (16 / 116))) / 7.787 : 95.047 * Math.pow((a / 500) + y2, 3);
  z = z / 108.883 <= 0.008859 ? z = (108.883 * (y2 - (b / 200) - (16 / 116))) / 7.787 : 108.883 * Math.pow(y2 - (b / 200), 3);
  return {x, y, z};
};

//extend xyz
const xyzToLab = (xyz:Xyz):Lab => {
  let {x,y,z} = xyz;

  let l, a, b;

  x /= 95.047;
  y /= 100;
  z /= 108.883;

  x = x > 0.008856 ? Math.pow(x, 1 / 3) : (7.787 * x) + (16 / 116);
  y = y > 0.008856 ? Math.pow(y, 1 / 3) : (7.787 * y) + (16 / 116);
  z = z > 0.008856 ? Math.pow(z, 1 / 3) : (7.787 * z) + (16 / 116);

  l = (116 * y) - 16;
  a = 500 * (x - y);
  b = 200 * (y - z);

  return {l, a, b};
};

export const lerp = (amount:number, a: Lab, b:Lab):Lab => {
  guardNumber(amount, `percentage`, `amount`);

  return a;
}

export const toCss = (v:Lab):string => {
  return `lab(${v.l}, ${v.a}, ${v.b})`;
}

export const lab:ColourSpace<Lab|Lab> & XyzConvertable<Lab> = {
  name: `lab`,
  min: [0, -100, -100],
  max: [100, 100, 100],
  channel: [`lightness`, `a`, `b`],
  alias: [`LAB`, `cielab`],
  toXyz: labToZyz,
  fromXyz: xyzToLab,
  lerp,
  toCss
}