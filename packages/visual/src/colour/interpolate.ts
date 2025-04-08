import { clamp,scale as scaleNumber } from "@ixfxfun/numbers";
import type { ColourInterpolationOpts, Colourish } from "./types.js";
import { pairwise } from '@ixfxfun/arrays';
import { structuredToColorJsConstructor } from "./resolve-to-color.js";
import { toString as colourToString } from "./to-hex.js";
import Color from "colorjs.io";
/**
 * Returns a function to interpolate between colours
 * ```js
 * const i = interpolator([`orange`, `yellow`, `red`]);
 * 
 * // Get a random colour on the above spectrum
 * i(Math.random());
 * ```
 * 
 * Results will vary depending on the colour space used, play with the options.
 * When using a hue-based colour space, the `hue` option sets the logic for how hue values wrap.
 * 
 * ```js
 * interpolator([`orange`, `yellow`, `red`], { space: `hsl`, hue: `longer })
 * ```
 * @param colours Colours to interpolate between
 * @param opts Options for interpolation
 * @returns 
 */
export const interpolator = (colours: Array<Colourish>, opts: Partial<ColourInterpolationOpts> = {}) => {
  const space = opts.space ?? `lch`;
  const hue = opts.hue ?? `shorter`;
  const pieces = interpolatorInit(colours);

  //const ranges = pieces.map(piece => (piece[ 0 ] as any).range(piece[ 1 ], { space, hue })) as Array<Range>;
  const ranges = pieces.map(piece => piece[ 0 ].range(piece[ 1 ], { space, hue }));

  return (amt: number): string => {
    amt = clamp(amt);

    // Scale to 0..1 to 0...ranges.length
    const s = scaleNumber(amt, 0, 1, 0, ranges.length);
    const index = Math.floor(s);
    const amtAdjusted = s - index;
    const range = ranges[ index ];

    // If we're at the end, return the last colour

    if (index === 1) return colourToString(colours.at(-1)!);

    const colour = range(amtAdjusted);
    return colour.display();

  }
}

const interpolatorInit = (colours: Array<Colourish>) => {
  if (!Array.isArray(colours)) throw new Error(`Param 'colours' is not an array as expected. Got: ${ typeof colours }`);
  if (colours.length < 2) throw new Error(`Param 'colours' should be at least two in length. Got: ${ colours.length }`);
  const c = colours.map(colour => {
    const c = structuredToColorJsConstructor(colour)
    return new Color(c.spaceId, c.coords, c.alpha);
  });
  return [ ...pairwise(c) ];
}

/**
 * Returns a CSS `linear-gradient` with stops corresponding to the given list of `colours`.
 * ```js
 * element.style.background = Colour.cssLinearGradient(['red','green','blue']);
 * ```
 * @param colours 
 * @returns 
 */
export const cssLinearGradient = (colours: Array<Colourish>) => {
  const c = colours.map(c => colourToString(c));
  return `linear-gradient(to right, ${ c.join(`, `) })`;
}

/**
 * Produces a stepped scale of colours.
 * 
 * ```js
 * const steps = Colour.scale([ `red`, `green` ], 10);
 * for (const step of steps) {
 *  // A CSS colour string
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
export const scale = (colours: Array<Colourish>, numberOfSteps: number, opts: Partial<ColourInterpolationOpts> = {}): Array<string> => {
  const space = opts.space ?? `lch`;
  const hue = opts.hue ?? `shorter`;
  const pieces = interpolatorInit(colours);
  const stepsPerPair = Math.floor(numberOfSteps / pieces.length);


  const steps = pieces.map(piece => (piece[ 0 ] as any).steps(piece[ 1 ],
    { space, hue, steps: stepsPerPair, outputSpace: `srgb` }
  )) as Array<Color>;

  return steps.flat().map(c => c.display());
}