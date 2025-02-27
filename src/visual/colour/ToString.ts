import Color from "colorjs.io";
import { structuredToColorJs, structuredToColorJsConstructor } from "./ResolveToColorJs.js";
import type { Colourish } from "./Types.js";

/**
 * Returns a colour in hex format `#000000`. 
 * ```js
 * canvas.fillStyle = Colour.toHex(`blue`);
 * canvas.fillStyle = Colour.toHex({ h:0.5, s:0.1, l:1 });
 * canvas.fillStyle = Colour.toHex({ r: 1, g: 0.3, b: 0 });
 * ```
 * 
 * Input colour can be a human-friendly colour name ("blue"), a HSL
 * colour (eg. "hsl(0, 50%, 50%)")", an object {h,s,l} or {r,g,b}.
 * '#' is included in the return string.
 * 
 * Transparent colour is returned as #00000000
 * @param colour
 * @returns Hex format, including #
 */
export const toHex = (colour: Colourish): string => {
  if (typeof colour === `string` && colour === `transparent`) return `#00000000`;
  const cc = structuredToColorJsConstructor(colour);

  const c = new Color(cc.spaceId, cc.coords, cc.alpha)
  return c.to(`srgb`).toString({ format: `hex`, collapse: false });
};

/**
 * Returns a colour in the best-possible CSS colour form.
 * The return value can be used setting colours in the canvas or DOM manipulations.
 * @param colour 
 */
export const toString = (colour: Colourish): string => {
  const c = structuredToColorJs(colour);
  return c.display();
}

/**
 * Returns a CSS-ready string
 * representation.
 * ```js
 * element.style.backgroundColor = resolveToString(`red`);
 * ```
 * 
 * Tries each parameter in turn, returning the value
 * for the first that resolves. This can be useful for
 * having fallback values.
 * 
 * ```js
 * // Try a CSS variable, a object property or finally fallback to red.
 * element.style.backgroundColor = toStringFirst('--some-var', opts.background, `red`);
 * ```
 * @param colours Array of colours to resolve
 * @returns 
 */
export const toStringFirst = (...colours: Array<Colourish | undefined>): string => {
  for (const colour of colours) {
    if (colour === undefined) continue;
    if (colour === null) continue;
    try {
      const c = structuredToColorJs(colour);
      return c.display();
    } catch (_error) {
      return colour.toString();
      //if (typeof colour === `string`) return colour
      //throw Error(`${ getErrorMessage(error) } Value: '${ colour }' (${ typeof colour })`);
    }
  }
  return `rebeccapurple`;
}