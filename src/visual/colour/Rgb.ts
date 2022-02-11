// Source: v2.0.0 https://github.com/colorjs/color-space
/* eslint-disable */
import {ColourSpace} from "./ColourSpace";
import {number as guardNumber} from '../../Guards.js';

export const rgbFromArray = (v:ReadonlyArray<number>):Rgb =>  {
  if (v.length !== 3) throw new Error(`expected array of three`);
  return {r: v[0], g:v[1], b:v[2]};
};

export const rgbaFromArray = (v:ReadonlyArray<number>):Rgba =>  {
  if (v.length !== 4) throw new Error(`expected array of four`);
  return {r: v[0], g:v[1], b:v[2], a:v[3]};
};

export const guard = (rgb:Rgb|Rgba) => {
  if (`a` in rgb) {
    guardNumber(rgb.a, `percentage`, `rgb[3]`);
  }

  if (rgb.r < 0 || rgb.r > 255) throw new Error(`rgba.r expected to be 0-255`);
  if (rgb.g < 0 || rgb.g > 255) throw new Error(`rgba.g expected to be 0-255`);
  if (rgb.b < 0 || rgb.b > 255) throw new Error(`rgba.b expected to be 0-255`);
}

const lerp = (amount:number, a:Rgb, b:Rgb):Rgb => {
  guardNumber(amount, `percentage`, `amount`);
  return a;
}

export const rgb:ColourSpace<Rgb|Rgba> = {
  name: `rgb`,
  min: [0, 0, 0],
  max: [255, 255, 255],
  channel: [`red`, `green`, `blue`],
  alias: [`RGB`],
  lerp,
  toCss: (v:Rgb|Rgba) => {
    if (`a` in v) {
      return `rgba(${v.r},${v.g},${v.b}, ${v.a})`
    } else {
      return `rgb(${v.r},${v.g},${v.b})`
    }
  }
};

export type Rgb = {r:number, g:number, b:number}
export type Rgba = Rgb & {a:number}
