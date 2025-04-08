import type { ColorConstructor } from "colorjs.io";
import Color from "colorjs.io";
import { hslToColorJs, isHsl } from "./hsl.js";
import type { Colourish } from "./types.js";
import { isRgb, rgbToColorJs } from "./rgb.js";
import { isOklch, oklchToColorJs } from "./oklch.js";
import { resolveCss } from "./resolve-css.js";

export const structuredToColorJsConstructor = (colour: Colourish): ColorConstructor => {

  if (isHsl(colour, true)) {
    return hslToColorJs(colour);
  }
  if (isRgb(colour, true)) {
    return rgbToColorJs(colour);
  }
  if (isOklch(colour)) {
    return oklchToColorJs(colour);
  }
  const c = new Color(resolveCss(colour));
  return {
    alpha: c.alpha,
    coords: c.coords,
    spaceId: c.spaceId
  }
}

export const structuredToColorJs = (colour: Colourish): Color => {
  const cc = structuredToColorJsConstructor(colour);
  return new Color(cc.spaceId, cc.coords, cc.alpha);
}