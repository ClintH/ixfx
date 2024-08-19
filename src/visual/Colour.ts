import Color, { type Range } from 'colorjs.io';

import { defaultRandom, type RandomSource } from '../random/Types.js';
import { throwNumberTest } from '../util/GuardNumbers.js';
import { pairwise } from '../data/arrays/Pairwise.js';
import { scale as scaleNumber } from '../numbers/Scale.js';
import { clamp } from '../numbers/Clamp.js';

export type Hsl = { h: number; s: number; l: number; opacity: number, space?: `hsl` };
export type Rgb = { r: number; g: number; b: number; opacity: number, space?: `srgb` };
export type Spaces = `hsl` | `hsluv` | `rgb` | `srgb` | `lch` | `oklch` | `oklab` | `okhsl` | `p3` | `lab` | `hcl` | `cubehelix`;

export type OkLch = { l: number, c: number, h: number, opacity: number, space: `oklch` }

/**
 * A representation of colour. Eg: `blue`, `rgb(255,0,0)`, `hsl(20,100%,50%)`
 */
export type Colourish = Color | Hsl | OkLch | Rgb | string;

// export type ColourRgb = {
//   space:`rgb`
//   coords: Rgba
// }
// export type ColourHsl = {
//   space:`hsl`;
//   coords: Hsla;
// }

// export type Colour = ColourHsl|ColourRgb;

/**
 * Options for interpolation
 */
export type InterpolationOpts = {
  space: Spaces,
  hue: `longer` | `shorter` | `increasing` | `decreasing` | `raw`
};

// export const toHsl = (colour: Colourish): Hsla => {
//   const hsl = toHsl(colour);
//   if (`opacity` in hsl) return hsl as Hsla;
//   else return {
//     ...hsl,
//     opacity: 1
//   }
// }

/**
 * Parses colour to `{ h, s, l }`, each field being on 0..1 scale.
 * 
 * Note that some colours will return NaN for h,s or l. This is because they have
 * indeterminate hue. For example white, black and transparent. Use 'safe = true'
 * to ensure a safe colour is returned.
 * @param colour
 * @param safe When true, returned colour will not include NaN. Default: false
 * @returns
 */
export const toHsl = (colour: Colourish, safe = false): Hsl => {
  if (typeof colour === `string` && colour === `transparent`) return { h: 0, s: 0, l: 0, opacity: 0, space: `hsl` };
  const c = resolve(colour);
  const hsl = c.hsl;
  //console.log(hsl);
  let hue = hsl[ 0 ];
  if (Number.isNaN(hue) && safe) hue = 0;

  let sat = hsl[ 1 ];
  if (Number.isNaN(sat) && safe) sat = 0;
  const parsedHsl = {
    h: hue / 360,
    s: sat / 100,
    l: hsl[ 2 ] / 100,
    opacity: 1,
    space: `hsl`
  } as const
  if (c.alpha !== 1) {
    if (`type` in (c.alpha as any)) {
      //const alphaType = (c.alpha as any).type;
      const alphaRaw = Number.parseFloat((c.alpha as any).raw);
      return { ...parsedHsl, opacity: alphaRaw }
    }
    return { ...parsedHsl, opacity: c.alpha / 100 };
  }
  return parsedHsl;

  // if (isHsl(colour)) return colour;
  // const c = resolveColour(colour);
  // // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  // if (c === null) throw new Error(`Could not resolve colour ${ colour }`);

  // if (isHsl(c)) {
  //   if (Number.isNaN(c.h) && Number.isNaN(c.s)) {
  //     return { h: Number.NaN, s: Number.NaN, l: c.l, opacity: c.opacity }
  //   }
  //   return c;
  // }
  // if (isRgb(c)) {
  //   const asHsl = d3Colour.hsl(c);
  //   if (c.opacity) return { ...asHsl, opacity: c.opacity };
  //   return asHsl;
  // }
  // // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  // throw new Error(`Could not resolve colour ${ colour }`);
};

const hslToColorJs = (hsl: Hsl, safe: boolean): Color => {
  let h = hsl.h === null ? (safe ? 0 : null) : hsl.h;
  let opacity = hsl.opacity === undefined ? 1 : hsl.opacity;
  throwNumberTest(h, `percentage`, `hsl.h`);
  throwNumberTest(hsl.s, `percentage`, `hsl.s`);
  throwNumberTest(hsl.l, `percentage`, `hsl.l`);
  throwNumberTest(opacity, `percentage`, `hsl.opacity`);

  const coords: [ number, number, number ] = [
    h! * 360,
    hsl.s * 100,
    hsl.l * 100
  ];
  return new Color(`hsl`, coords, opacity);
}

const oklchToColorJs = (oklch: OkLch) => {
  throwNumberTest(oklch.l, `percentage`, `oklch.l`);
  throwNumberTest(oklch.c, `percentage`, `oklch.c`);
  throwNumberTest(oklch.h, `percentage`, `oklch.h`);
  throwNumberTest(oklch.opacity, `percentage`, `oklch.opacity`);
  const coords: [ number, number, number ] = [
    oklch.l,
    oklch.c * 0.4,
    oklch.h * 360
  ]
  return new Color(`oklch`, coords, oklch.opacity);
}

const rgbToColorJs = (rgb: Rgb): Color => {
  const coords: [ number, number, number ] = [
    rgb.r,
    rgb.g,
    rgb.b
  ];
  return `opacity` in rgb ?
    new Color(`srgb`, coords, rgb.opacity) :
    new Color(`srgb`, coords);
}

/**
 * Returns a colour in the best-possible CSS colour form.
 * The return value can be used setting colours in the canvas or DOM manipulations.
 * @param colour 
 */
export const toString = (colour: Colourish): string => {
  const c = resolve(colour);
  return c.display();
}


/**
 * Returns a full HSL colour string (eg `hsl(20,50%,75%)`) based on a index.
 * It's useful for generating perceptually different shades as the index increments.
 *
 * ```
 * el.style.backgroundColor = goldenAgeColour(10);
 * ```
 *
 * Saturation and lightness can be specified, as numeric ranges of 0-1.
 *
 * @param saturation Saturation (0-1), defaults to 0.5
 * @param lightness Lightness (0-1), defaults to 0.75
 * @param alpha Opacity (0-1), defaults to 1.0
 * @returns HSL colour string eg `hsl(20,50%,75%)`
 */
export const goldenAngleColour = (
  index: number,
  saturation = 0.5,
  lightness = 0.75,
  alpha = 1
) => {
  throwNumberTest(index, `positive`, `index`);
  throwNumberTest(saturation, `percentage`, `saturation`);
  throwNumberTest(lightness, `percentage`, `lightness`);
  throwNumberTest(alpha, `percentage`, `alpha`);

  // Via Stackoverflow
  const hue = index * 137.508; // use golden angle approximation
  return alpha === 1 ? `hsl(${ hue },${ saturation * 100 }%,${ lightness * 100 }%)` : `hsl(${ hue },${ saturation * 100 }%,${ lightness * 100 }%,${ alpha * 100 }%)`;
};

/**
 * Returns a random hue component (0..359)
 * ```
 * // Generate hue
 * const h =randomHue(); // 0-359
 *
 * // Generate hue and assign as part of a HSL string
 * el.style.backgroundColor = `hsl(${randomHue(), 50%, 75%})`;
 * ```
 * @param rand
 * @returns
 */
export const randomHue = (rand: RandomSource = defaultRandom): number => {
  const r = rand();
  return r * 360;
};

/**
 * Returns a Colorjs 'Color' object based on relative hue, saturation, lightness
 * and opacity.
 * @param h Hue (0..1)
 * @param s Saturation (0..1) Default: 1
 * @param l Lightness (0..1) Default: 0.5
 * @param opacity Opacity (0..1) Default: 1
 * @returns 
 */
export const fromHsl = (h: number, s = 1, l = 0.5, opacity = 1): Color => {
  throwNumberTest(h, `percentage`, `h`);
  throwNumberTest(s, `percentage`, `s`);
  throwNumberTest(l, `percentage`, `l`);

  return resolve({ h, s, l, opacity, space: `hsl` });
}

/**
 * Parses colour to `{ r, g, b }` where each field is on 0..1 scale.
 * `opacity` field is added if opacity is not 1.
 * [Named colours](https://html-color-codes.info/color-names/)
 * @param colour
 * @returns
 */
export const toRgb = (colour: Colourish): Rgb => {
  const c = resolve(colour);
  const rgb = c.srgb;
  return c.alpha < 1 ?
    { r: rgb.r, g: rgb.g, b: rgb.b, opacity: c.alpha, space: `srgb` } :
    { r: rgb.r, g: rgb.g, b: rgb.b, opacity: 1, space: `srgb` };
};

/**
 * Parses a string representation of colour, or a Rgb/Hsl object.
 * If the string starts with '--' it's assumed to be a CSS variable
 * 
 * See also {@link resolveToString} to resolve to a CSS colour string.
 * @param colour Colour to resolve
 * @returns Color.js Color object
 */
export const resolve = (colour: Colourish, safe: boolean = false): Color => {
  if (typeof colour === `string`) {
    if (colour.startsWith(`--`)) {
      // Resolve CSS variable
      colour = getComputedStyle(document.body).getPropertyValue(colour);
    }
    return new Color(colour);
  } else {
    if (isHsl(colour)) return new Color(hslToColorJs(colour, safe));
    if (isRgb(colour)) return new Color(rgbToColorJs(colour));
    if (isOklch(colour)) return new Color(oklchToColorJs(colour));
  }

  return colour;
};

/**
 * Like {@link resolve}, but returns a CSS-ready string
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
 * element.style.backgroundColor = resolveToString('--some-var', opts.background, `red`);
 * ```
 * @param colours Array of colours to resolve
 * @returns 
 */
export const resolveToString = (...colours: Array<Colourish | undefined>): string => {
  for (const colour of colours) {
    if (colour === undefined) continue;
    if (colour === null) continue;
    const c = resolve(colour);
    try {
      return c.display();
    } catch (ex) {
      if (typeof colour === `string`) return colour
      throw ex;
    }
  }
  return `rebeccapurple`;
}

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
export const toHex = (colour: Colourish, safe = false): string => {
  if (typeof colour === `string` && colour === `transparent`) return `#00000000`;
  return resolve(colour, safe).to(`srgb`).toString({ format: `hex`, collapse: false });
};

/**
 * Returns a variation of colour with its opacity multiplied by `amt`.
 *
 * ```js
 * // Return a colour string for blue that is 50% opaque
 * opacity(`blue`, 0.5);
 * // eg: `rgba(0,0,255,0.5)`
 *
 * // Returns a colour string that is 50% more opaque
 * opacity(`hsla(200,100%,50%,50%`, 0.5);
 * // eg: `hsla(200,100%,50%,25%)`
 * ```
 *
 * [Named colours](https://html-color-codes.info/color-names/)
 * @param colour A valid CSS colour
 * @param amt Amount to multiply opacity by
 * @returns String representation of colour
 */
export const opacity = (colour: Colourish, amt: number): string => {
  const c = resolve(colour);
  c.alpha *= amt;
  return c.toString();
};

/**
 * Gets a CSS variable.
 * ```
 * // Fetch --accent variable, or use `yellow` if not found.
 * getCssVariable(`accent`, `yellow`);
 * ```
 * @param name Name of variable. Leading '--' is unnecessary
 * @param fallbackColour Fallback colour if not found
 * @param root  Element to search variable from
 * @returns Colour or fallback.
 */
export const getCssVariable = (
  name: string,
  fallbackColour = `black`,
  root?: HTMLElement
): string => {
  if (root === undefined) root = document.body;
  if (name.startsWith(`--`)) name = name.substring(2);
  const fromCss = getComputedStyle(root).getPropertyValue(`--${ name }`).trim();
  if (fromCss === undefined || fromCss.length === 0) return fallbackColour;
  return fromCss;
};


// export const interpolate = (
//   amount: number,
//   from: Colourish,
//   to: Colourish,
//   optsOrSpace?: string | InterpolationOpts
// ): string => {
//   throwNumberTest(amount, `percentage`, `amount`);
//   if (typeof from !== `string`)
//     throw new Error(`Expected string for 'from' param`);
//   if (typeof to !== `string`) throw new Error(`Expected string for 'to' param`);

//   let opts: InterpolationOpts;
//   if (typeof optsOrSpace === `undefined`) opts = {};
//   else if (typeof optsOrSpace === `string`)
//     opts = { space: optsOrSpace as Spaces };
//   else opts = optsOrSpace;

//   const inter = getInterpolator(opts, [ from, to ]);
//   if (inter === undefined) throw new Error(`Could not handle colour/space`);
//   return inter(amount);
// };


export const interpolator = (colours: Array<Colourish>, opts: Partial<InterpolationOpts> = {}) => {
  const space = opts.space ?? `lch`;
  const hue = opts.hue ?? `shorter`;
  const pieces = interpolatorInit(colours);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
  const ranges = pieces.map(piece => (piece[ 0 ] as any).range(piece[ 1 ], { space, hue })) as Array<Range>;

  return (amt: number) => {
    amt = clamp(amt);

    // Scale to 0..1 to 0...ranges.length
    const s = scaleNumber(amt, 0, 1, 0, ranges.length);
    const index = Math.floor(s);
    const amtAdjusted = s - index;
    return ranges[ index ](amtAdjusted);
  }
}

const interpolatorInit = (colours: Array<Colourish>) => {
  if (!Array.isArray(colours)) throw new Error(`Param 'colours' is not an array as expected. Got: ${ typeof colours }`);
  if (colours.length < 2) throw new Error(`Param 'colours' should be at least two in length. Got: ${ colours.length }`);
  const c = colours.map(colour => resolve(colour));
  return [ ...pairwise(c) ];
}

/**
 * Produces a stepped scale of colours.
 * 
 * Return result is an array of Color.js 'Colour' objects.
 * ```js
 * import { Colour } from 'ixfx/visual'
 * const steps = Colour.scale(['red','green'], 10);
 * for (const step of steps) {
 *  // Get a 'hsla(...)' string representation of colour
 *  // This can be used with the canvas, setting DOM properties etc.
 *  const css = Colour.toString(step);
 * }
 * ```
 * 
 * {@link cssLinearGradient} can produce a smooth gradient in CSS on the basis
 * of the stepped colours.
 * @param colours 
 * @param numberOfSteps 
 * @param opts 
 * @returns 
 */
export const scale = (colours: Array<Colourish>, numberOfSteps: number, opts: Partial<InterpolationOpts> = {}) => {
  const space = opts.space ?? `lch`;
  const hue = opts.hue ?? `shorter`;
  const pieces = interpolatorInit(colours);
  const stepsPerPair = Math.floor(numberOfSteps / pieces.length);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
  const steps = pieces.map(piece => (piece[ 0 ] as any).steps(piece[ 1 ],
    { space, hue, steps: stepsPerPair, outputSpace: `srgb` }
  )) as Array<Color>;

  return steps.flat();
}

/**
 * Returns a CSS `linear-gradient` with stops corresponding to the given list of `colours`.
 * ```js
 * element.style.background = Colour.cssLinearGradient(['red','green','blue']);
 * ```
 * 
 *
 * @param colours 
 * @returns 
 */
export const cssLinearGradient = (colours: Array<Colourish>) => {
  const c = colours.map(c => resolve(c));
  return `linear-gradient(to right, ${ c.map(v => v.display()).join(`, `) })`;
}

const isHsl = (p: Colourish): p is Hsl => {
  if (p === undefined || p === null) return false;
  if (typeof p !== `object`) return false;

  // Check if Colourjs
  if ((p as Color).spaceId !== undefined) return false;
  if ((p as Color).coords !== undefined) return false;

  const space = p.space;
  if (space !== `hsl` && space !== undefined) return false;
  const pp = p as Hsl;
  if (pp.h === undefined) return false;
  if (pp.s === undefined) return false;
  if (pp.l === undefined) return false;
  return true;
};

const isOklch = (p: Colourish): p is OkLch => {
  if (p === undefined || p === null) return false;
  if (typeof p !== `object`) return false;

  // Check if Colourjs
  if ((p as Color).spaceId !== undefined) return false;
  if ((p as Color).coords !== undefined) return false;
  if (p.space !== `oklch`) return false;
  if (p.l === undefined) return false;
  if (p.c === undefined) return false;
  if (p.h === undefined) return false;
  return true;
}

const isRgb = (p: Colourish): p is Rgb => {
  if (p === undefined || p === null) return false;
  if (typeof p !== `object`) return false;
  if (p.space !== `srgb` && p.space !== undefined) return false;
  if ((p as Rgb).r === undefined) return false;
  if ((p as Rgb).g === undefined) return false;
  if ((p as Rgb).b === undefined) return false;
  return true;
};
