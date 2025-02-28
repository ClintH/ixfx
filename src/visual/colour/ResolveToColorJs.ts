import type { ColorConstructor } from "colorjs.io";
import { hslToColorJs, isHsl } from "./Hsl.js";
import type { Colourish } from "./Types.js";
import { isRgb, rgbToColorJs } from "./Rgb.js";
import { isOklch, oklchToColorJs } from "./Oklch.js";
import Color from "colorjs.io";
import { resolveCss } from "./ResolveCss.js";

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