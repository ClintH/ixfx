/* eslint-disable */
import {Rgb} from "./Rgb.js";
import {Xyz} from "./Xyz.js";

export type ColourSpace<V> = {
  name: string
  min: Whitepoint
  max: Whitepoint
  channel: string[]
  alias: string[]
  lerp(amount:number, a:V, b:V): V
  toCss(v:V):string
};

export type XyzConvertable<V> = {
  toXyz(c:V):Xyz,
  fromXyz(c:Xyz):V
}

export type RgbConvertable<V> = {
  toRgb(c:V):Rgb
  fromRgb(c:Rgb):V
}

export type Whitepoint = [x:number, y:number,z:number];
