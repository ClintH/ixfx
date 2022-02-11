import {ColourSpace} from './colour/ColourSpace.js';
import {hsl, guard as guardHsl, Hsl, Hsla, fromRgba as hslFromRgba} from './colour/Hsl.js';
import {lab} from './colour/Lab.js';
import {rgb, rgbFromArray, rgbaFromArray } from './colour/Rgb.js';
import {xyz} from './colour/Xyz.js';
export {hsl, lab, rgb, xyz};
export type Spaces = `hsl` | `rgb` | `lab`;
import { startsEnds } from '../Util.js';
import {named} from './colour/Named.js';
import {number as guardNumber} from '../Guards.js';

export const getNamed = (name:string):Hsl|undefined => {
  const c = named.find(v => v.name === name);
  if (c === undefined) return c;
  return {h: c.hslValues[0], s: c.hslValues[1], l: c.hslValues[2] };
};

export const opacity = (c:string, reduceBy:number):string => {
  guardNumber(reduceBy, `percentage`, `reduceBy`);

  const hsla = parseToHsla(c);
  const a = hsla.a * reduceBy;
  guardNumber(a, `percentage`, `alpha`);
  return hsl.toCss({...hsla, a:a});
};

const parseCss = (c:string):readonly number[] => {
  const start = c.indexOf(`(`);
  const end = c.indexOf(`)`);
  if (start <= 0) throw new Error(`Expected (`);
  if (end <= 0) throw new Error(`Expected )`);
  if (end <= start) throw new Error(`Expected ( after )`);
  
  c = c.substring(start+1, end);
  
  //eslint-disable-next-line functional/no-let
  let cc = [];
  if (c.indexOf(`,`) >= 0) {
    cc = c.split(`,`);
  } else if (c.indexOf(` `) >= 0) {
    cc = c.split(` `);
  } else throw new Error(`Cannot parse (${c})`);

  const numbers = cc.map(v => {
    if (v.endsWith(`%`)) {
      // Converts 50% -> 0.5
      return parseFloat(v.substring(0, v.length-1).trim()) / 100;
    } else {
      return parseFloat(v.trim());
    }
  });

  return numbers;
};

/**
 * Simple colour parsing of rgb(), rgba(), hsl(), hsla() and CSS named colours.
 * @param c Colour string
 * @returns [h,s,l,a]
 */
export const parseToHsla = (c:string):Hsla => {
  //eslint-disable-next-line functional/no-let
  let r:Hsla|undefined;
  if (startsEnds(c, `hsl(`, `)`)) {
    const cc = parseCss(c);
    if (cc.length !== 3) throw new Error(`hsl() Expected three numbers (${c})`);
    r = {h:cc[0], s:cc[1], l:cc[2], a:1};
  } else if (startsEnds(c, `hsla(`, `)`)) {
    const cc = parseCss(c);
    if (cc.length !== 4) throw new Error(`hsla() Expected four numbers (${c})`);
    r = {h: cc[0], s:cc[1], l:cc[2], a: cc[3]};
  } else if (startsEnds(c, `rgb(`, `)`)) {
    const cc = parseCss(c);
    if (cc.length !== 3) throw new Error(`rgb() Expected three numbers (${c})`);
    const rgb = rgbFromArray(cc);
    r = {...hsl.fromRgb(rgb), a:1};
  } else if (startsEnds(c, `rgba(`, `)`)) {
    const cc = parseCss(c);
    if (cc.length !== 4) throw new Error(`rgba() Expected four numbers (${c})`);
    const rgb = rgbaFromArray(cc);
    r = hslFromRgba(rgb);
  } else {
    const n = getNamed(c);
    if (n !== undefined) r = {...n, a:1};
  }
  if (r === undefined) throw new Error(`Cannot parse as HSL (${c})`);
  try {
    guardHsl(r);
  } catch (ex) {
    console.log(`input: ${c} parsed: ${r}`);
    throw ex;
  }
  return r;
};

export const getColourSpace = (name:Spaces|string):ColourSpace<unknown> => {
  switch (name) {
  case `hsl`:
    return hsl;
  case `rgb`:
    return rgb;
  case `lab`:
    return lab;
  default:
    throw new Error(`Unknown colour space: ${name}. Expected hsl, rgb, lab`);
  }

};