import type { ColorConstructor } from "colorjs.io";
import type { Colourish, OkLch } from "./types.js";
import { throwNumberTest } from "@ixfxfun/guards";
export const oklchToColorJs = (lch: OkLch): ColorConstructor => {
  throwNumberTest(lch.l, `percentage`, `lch.l`);
  throwNumberTest(lch.c, `percentage`, `lch.c`);
  throwNumberTest(lch.h, `percentage`, `lch.h`);
  throwNumberTest(lch.opacity, `percentage`, `lch.opacity`);
  return {
    alpha: lch.opacity,
    coords: [ lch.l, lch.c * 0.4, lch.h * 360 ],
    spaceId: `oklch`
  }
}

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

export const isOklch = (p: Colourish): p is OkLch => {
  if (p === undefined || p === null) return false;
  if (typeof p !== `object`) return false;

  // Check if Colourjs
  //if ((p as ColorJs.ColorObject).spaceId !== undefined) return false;
  //if ((p as ColorJs.ColorObject).coords !== undefined) return false;
  if (p.space !== `oklch`) return false;
  if (p.l === undefined) return false;
  if (p.c === undefined) return false;
  if (p.h === undefined) return false;
  return true;
}