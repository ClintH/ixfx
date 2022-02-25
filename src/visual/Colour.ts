/* eslint-disable */
import * as d3Colour from 'd3-color';
import * as d3Interpolate from 'd3-interpolate';
import {number as guardNumber} from '../Guards.js'

export type Hsl = {h:number, s:number, l:number, opacity?:number};
export type Rgb = {r:number, g:number, b:number, opacity?:number}
export type Spaces = `hsl` | `rgb` | `lab` | `hcl` | `cubehelix`;
/**
 * @private
 */
export type Colour = d3Colour.RGBColor | d3Colour.HSLColor;

/**
 * A representation of colour. Eg: `blue`, `rgb(255,0,0)`, `hsl(20,100%,50%)`
 */
export type Colourish = string|d3Colour.ColorCommonInstance;

/**
 * Options for interpolation
 */
export type InterpolationOpts = {
  /**
   * Gamma correction. Eg 4 brightens values. Only applies to rgb and cubehelix
   * [Read more](https://github.com/d3/d3-interpolate#interpolate_gamma)
   */
  gamma?:number
  /**
   * Colour space
   */
  space?:Spaces
  /**
   * If true, interpolation happens the longer distance. Only applies to hsl, hcl and cubehelix
   */
  long?:boolean
}

/**
 * Parses colour to {h,s,l}. `opacity` field is added if it exists on source.
 * @param colour 
 * @returns 
 */
export const toHsl = (colour:Colourish):Hsl => {
  const rgb = toRgb(colour);
  const hsl = rgbToHsl(rgb.r, rgb.b, rgb.g);
  if (rgb.opacity) return {...hsl, opacity: rgb.opacity};
  else return hsl;
}

/**
 * Parses colour to {r,g,b}. `opacity` field is added if it exists on source.
 * @param colour 
 * @returns 
 */
export const toRgb = (colour:Colourish):Rgb => {
  const c = resolveColour(colour);
  const rgb = c.rgb();
  if (c.opacity < 1) return {r:rgb.r, g:rgb.g, b:rgb.b, opacity: c.opacity};
  else return {r:rgb.r, g:rgb.g, b:rgb.b}
}

const resolveColour = (c:Colourish):Colour => {
  if (typeof c === `string`) {
    const css = d3Colour.color(c);
    if (css !== null) return css;
  } else {
    if (isHsl(c)) return d3Colour.hsl(c.h, c.s, c.l);
    if (isRgb(c)) return d3Colour.rgb(c.r, c.g, c.b); 
  }
  throw new Error(`Could not resolve colour ${JSON.stringify(c)}`);
}

/**
 * Returns a colour in hex format `#000000`
 * @param colour
 * @returns Hex format, including #
 */
export const toHex = (colour:Colourish):string => {
  const c = resolveColour(colour);
  return c.formatHex();
}

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
 * @param colour A valid CSS colour
 * @param amt Amount to multiply opacity by
 * @returns String representation of colour
 */
export const opacity = (colour:Colourish, amt:number):string => {
  const c = resolveColour(colour);
  c.opacity *= amt;
  return c.toString(); 
}

/**
 * Gets a CSS variable.
 * @example Fetch --accent variable, or use `yellow` if not found.
 * ```
 * getCssVariable(`accent`, `yellow`);
 * ```
 * @param name Name of variable. Do not starting `--`
 * @param fallbackColour Fallback colour if not found
 * @param root  Element to search variable from
 * @returns Colour or fallback.
 */
 export const getCssVariable = (name:string, fallbackColour:string = `black`, root?:HTMLElement):string => {
  if (root === undefined) root = document.body;
  const fromCss = getComputedStyle(root).getPropertyValue(`--${name}`).trim();
  if (fromCss === undefined || fromCss.length === 0) return fallbackColour;
  return fromCss;
};

/**
 * Interpolates between two colours, returning a string
 * 
 * @example
 * ```js
 * // Get 50% between blue and red
 * interpolate(0.5, `blue`, `red`); 
 * 
 * // Get midway point, with specified colour space
 * interpolate(0.5, `hsl(200, 100%, 50%)`, `pink`, {space: `hcl`});
 * ```
 * @param amount Amount (0 = from, 0.5 halfway, 1= to)
 * @param from Starting colour
 * @param to Final colour
 * @param optsOrSpace Options for interpolation, or string name for colour space, eg `hsl`.
 * @returns String representation of colour, eg. `rgb(x,x,x)`
 */
export const interpolate = (amount:number, from:Colourish, to:Colourish, optsOrSpace?:string|InterpolationOpts):string => {
  guardNumber(amount, `percentage`, `amount`);
  if (typeof from !== `string`) throw new Error(`Expected string for 'from' param`);
  if (typeof to !== `string`) throw new Error(`Expected string for 'to' param`);

  let opts:InterpolationOpts;
  if (typeof optsOrSpace === `undefined`) opts = {};
  else if (typeof optsOrSpace === `string`) opts = { space: optsOrSpace as Spaces};
  else opts = optsOrSpace as InterpolationOpts;


  const inter = getInterpolator(opts, [from, to]);
  if (inter === undefined) throw new Error(`Could not handle colour/space`);
  return inter(amount);
}

const getInterpolator = (optsOrSpace:InterpolationOpts|string, colours:Colourish[]): ((t: number) => string) | undefined => {
  if (!Array.isArray(colours)) throw new Error(`Expected one or more colours as parameters`);
  
  let opts:InterpolationOpts;
  if (typeof optsOrSpace === `undefined`) opts = {};
  else if (typeof optsOrSpace === `string`) opts = { space: optsOrSpace as Spaces};
  else opts = optsOrSpace as InterpolationOpts;

  if (!Array.isArray(colours)) throw new Error(`Expected array for colours parameter`);
  if (colours.length < 2) throw new Error(`Interpolation expects at least two colours`);
  const {space = `rgb`, long = false} = opts;
  let inter;

  switch (space) {
  case `lab`:
    inter = d3Interpolate.interpolateLab;
    break;
  case `hsl`:
    inter = long ? d3Interpolate.interpolateHslLong : d3Interpolate.interpolateHsl;
    break;
  case `hcl`:
    inter = long ? d3Interpolate.interpolateHclLong : d3Interpolate.interpolateHcl;
    break;
  case `cubehelix`:
    inter = long ? d3Interpolate.interpolateCubehelixLong : d3Interpolate.interpolateCubehelix;
    break;
  case `rgb`:
    inter = d3Interpolate.interpolateRgb;
  default:
    inter = d3Interpolate.interpolateRgb;
  }

  if (opts.gamma) {
    if (space === `rgb` || space === `cubehelix`) {
      inter = (inter as d3Interpolate.ColorGammaInterpolationFactory).gamma(opts.gamma);      
    }
  }

  if (colours.length > 2) {
    return d3Interpolate.piecewise(inter, colours);
  } else return inter(colours[0], colours[1]);
}

/**
 * Produces a scale of colours as a string array
 * 
 * @example
 * ```js
 * // Yields array of 5 colour strings
 * const s = scale(5, {space:`hcl`}, `blue`, `red`);
 * // Produces scale between three colours
 * const s = scale(5, {space:`hcl`}, `blue`, `yellow`, `red`);
 * ```
 * @param steps Number of colours
 * @param opts Options for interpolation, or string colour space eg `hsl`
 * @param colours From/end colours (or more)
 * @returns 
 */
export const scale = (steps:number, opts:InterpolationOpts|string, ...colours:Colourish[]):string[] => {
  guardNumber(steps, `aboveZero`, `steps`);
  if (!Array.isArray(colours)) throw new Error(`Expected one or more colours as parameters`);
  const inter = getInterpolator(opts, colours);
  if (inter === undefined) throw new Error(`Could not handle colour/space`);

  const perStep = 1/(steps-1);
  const r = [];
  //eslint-disable-next-line functional/no-let
  let amt = 0;
  //eslint-disable-next-line functional/no-loop-statement,functional/no-let
  for (let i=0; i<steps; i++) {
    //eslint-disable-next-line functional/immutable-data
    r.push(inter(amt));
    amt += perStep;
    if (amt > 1) amt = 1;
  }
  return r;
}

const isHsl = (p: Colour|d3Colour.ColorCommonInstance|Hsl): p is Hsl => {
  if ((p as Hsl).h === undefined) return false;
  if ((p as Hsl).s === undefined) return false;
  if ((p as Hsl).l === undefined) return false;
  return true;
};

const isRgb = (p: Colour|d3Colour.ColorCommonInstance|Rgb): p is Rgb => {
  if ((p as Rgb).r === undefined) return false;
  if ((p as Rgb).g === undefined) return false;
  if ((p as Rgb).b === undefined) return false;
  return true;
};


const rgbToHsl = (r:number, g:number, b:number):Hsl => {
  r /= 255;
  g /= 255;
  b /= 255;

  var min = Math.min(r, g, b),
    max = Math.max(r, g, b),
    delta = max - min,
    h, s, l;

  h = 0;
  if (max === min) {
    h = 0;
  }
  else if (r === max) {
    h = (g - b) / delta;
  }
  else if (g === max) {
    h = 2 + (b - r) / delta;
  }
  else if (b === max) {
    h = 4 + (r - g) / delta;
  }

  h = Math.min(h * 60, 360);

  if (h < 0) {
    h += 360;
  }

  l = (min + max) / 2;

  if (max === min) {
    s = 0;
  }
  else if (l <= 0.5) {
    s = delta / (max + min);
  }
  else {
    s = delta / (2 - max - min);
  }

  return {h, s, l};
};
