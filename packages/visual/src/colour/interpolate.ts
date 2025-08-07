import type { Colour, ColourInterpolationOpts, ColourInterpolator, Colourish, ColourSpaces, ColourStepOpts, Hsl, HslScalar, OkLch, OkLchScalar, RgbScalar } from "./types.js";
import { pairwise } from '@ixfx/arrays';
import * as HslSpace from './hsl.js';
import { convert, toCssColour, type ConvertDestinations } from "./conversion.js";
import { convertScalar, OklchSpace, SrgbSpace } from "./index.js";

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
// export const interpolator = (colours: Colourish[], opts: Partial<ColourInterpolationOpts> = {}) => {
//   const spaceDestination: ConvertDestinations = `oklch-scalar`;
//   let ranges: Colour[] = [];
//   const direction = opts.direction ?? `shorter`;

//   switch (opts.space) {
//     case `hsl`:
//       ranges = interpolateInit(colours, `hsl-scalar`)
//         .map(piece => HslSpace.interpolator(piece[ 0 ], piece[ 1 ], direction));
//       break;
//     default:
//       ranges = interpolateInit(colours, `oklch-scalar`)
//         .map(piece => OklchSpace.interpolator(piece[ 0 ], piece[ 1 ], direction));
//       break;
//   }


//   return (amt: number): string => {
//     amt = clamp(amt);

//     // Scale to 0..1 to 0...ranges.length
//     const s = scaleNumber(amt, 0, 1, 0, ranges.length);
//     const index = Math.floor(s);
//     const amtAdjusted = s - index;
//     const range = ranges[ index ];

//     // If we're at the end, return the last colour

//     if (index === 1) return toHex(colours.at(-1)!);

//     const colour = range(amtAdjusted);
//     return colour.display();

//   }
// }

// const interpolatorInit = (colours: Colourish[]) => {
//   if (!Array.isArray(colours)) throw new Error(`Param 'colours' is not an array as expected. Got: ${ typeof colours }`);
//   if (colours.length < 2) throw new Error(`Param 'colours' should be at least two in length. Got: ${ colours.length }`);
//   const c = colours.map(colour => toLibraryColour(colour));
//   return [ ...pairwise(c) ];
// }

// function interpolateInit(colours: Colourish[], destination: `oklch-scalar`): OkLchScalar[][];
// function interpolateInit(colours: Colourish[], destination: `hsl-scalar`): HslScalar[][];
function interpolateInit<T extends ColourSpaces>(colours: Colourish[], destination: T):
  T extends `oklch` ? OkLchScalar[][] :
  T extends `hsl` ? HslScalar[][] :
  T extends `srgb` ? RgbScalar[][] : HslScalar[][]

function interpolateInit(colours: Colourish[], destination: ColourSpaces = `hsl`): (OkLchScalar | HslScalar | RgbScalar)[][] {
  if (!Array.isArray(colours)) throw new Error(`Param 'colours' is not an array as expected. Got: ${ typeof colours }`);
  if (colours.length < 2) throw new Error(`Param 'colours' should be at least two in length. Got: ${ colours.length }`);

  const c = colours.map(colour => convertScalar(colour, destination));
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
export const cssLinearGradient = (colours: Colourish[]) => {
  const c = colours.map(c => toCssColour(c));
  return `linear-gradient(to right, ${ c.join(`, `) })`;
}

/**
 * Returns a function that interpolates between two colours. Returns string colour values.
 * 
 * By default takes a shorter direction and uses the OkLCH colourspace.
 * ```js
 * const i = interpolator(`blue`, `red`);
 * i(0.5); // Get the colour at 50%, as a string.
 * ```
 * 
 * To work with structured colour values, use one of the space's `interpolate` functions.
 * @param colourA 
 * @param colourB 
 * @param options 
 * @returns 
 */
export const interpolator = (colourA: Colourish, colourB: Colourish, options: Partial<ColourInterpolationOpts> = {}) => {
  const space = options.space ?? `oklch`;
  const direction = options.direction ?? `shorter`;

  let inter: ColourInterpolator<Colour> | undefined;
  switch (space) {
    case `hsl`:
      inter = HslSpace.interpolator(convert(colourA, `hsl-scalar`), convert(colourB, `hsl-scalar`), direction);
      break;
    case `srgb`:
      inter = SrgbSpace.interpolator(convert(colourA, `srgb-scalar`), convert(colourB, `srgb-scalar`));
      break;
    default:
      inter = OklchSpace.interpolator(convert(colourA, `oklch-scalar`), convert(colourB, `oklch-scalar`), direction);
  }

  return (amount: number) => toCssColour(inter(amount));

}

/**
 * Produces a stepped scale of colours.
 * 
 * ```js
 * // A scale of from red to green, with three colours in-between
 * const steps = Colour.scale([ `red`, `green` ], { stepsBetween: 3 });
 * for (const step of steps) {
 *  // A CSS colour string
 * }
 * ```
 * 
 * {@link cssLinearGradient} can produce a smooth gradient in CSS on the basis
 * of the stepped colours.
 * @param colours 
 * @param opts 
 * @returns 
 */
export const scale = (colours: Colourish[], opts: Partial<ColourStepOpts> = {}): string[] => {
  const direction = opts.direction ?? `shorter`;
  const space = opts.space ?? `oklch`;
  const pieces = interpolateInit(colours, space);

  let stepsBetween = 0;
  if (typeof opts.stepsBetween === `number`) {
    stepsBetween = opts.stepsBetween;
    if (stepsBetween < 1) throw new Error(`Param 'stepsBetween' must be at least 1`);
  } else if (typeof opts.stepsTotal === `number`) {
    if (opts.stepsTotal <= colours.length) throw new Error(`Param 'stepsTotal' must be greater than number of provided colour stops (${ colours.length }) +1 per stop`);
    const totalSteps = opts.stepsTotal - colours.length;
    stepsBetween = Math.floor(totalSteps / pieces.length);
  }

  const steps = pieces.map((piece: Colour[]) => {
    //const pieceSteps = HslSpace.createSteps(piece[ 0 ], piece[ 1 ], stepsBetween, direction, true);
    const pieceSteps: Colour[] = createSteps(piece[ 0 ], piece[ 1 ], { steps: stepsBetween, space, direction, exclusive: true });

    // Add end colour
    pieceSteps.push(piece[ 1 ]);
    return pieceSteps;
  });

  // Add very first colour
  const firstPiece = pieces[ 0 ];
  steps.unshift([ firstPiece[ 0 ] ]);
  return steps.flat().map(c => toCssColour(c));
}

export type CreateStepsOptions = Partial<{ space: ColourSpaces, steps: number, direction: `longer` | `shorter`, exclusive: boolean }>

/**
 * Creates discrete colour steps between two colours. 
 * 
 * Start and end colours are included (and counted as a step) unless `exclusive` is set to _true_
 * 
 * ```js
 * // Array of five HslScalar 
 * createSteps(`red`,`blue`, { steps: 5 });
 * ```
 * 
 * Defaults to the oklch colour space, 5 steps and non-exclusive.
 * @param a Start colour
 * @param b End colour
 * @param options
 * @returns 
 */
export function createSteps<T extends CreateStepsOptions>(a: Colourish | string, b: Colourish, options: T):
  T extends { space: `oklch` } ? OkLchScalar[] :
  T extends { space: `srgb` } ? RgbScalar[] :
  T extends { space: `hsl` } ? HslScalar[] : OkLchScalar[];

export function createSteps(a: Colourish | string, b: Colourish, options: CreateStepsOptions = {}): Colour[] {
  const exclusive = options.exclusive ?? false;
  const steps = options.steps ?? 5;
  const space = options.space ?? `oklch`;
  const direction = options.direction ?? `shorter`;

  if (!exclusive && steps < 2) throw new Error(`Param 'steps' should be at least 2 when 'exclusive' is false`);
  if (exclusive && steps < 1) throw new Error(`Param 'steps' should be at least 1 when 'exlusive' is true`);

  const aa = convertScalar(a, space);
  const bb = convertScalar(b, space);

  // Create interpolator
  let inter: ColourInterpolator<Colour> | undefined;
  switch (space) {
    case `hsl`:
      inter = HslSpace.interpolator(aa as HslScalar, bb as HslScalar, direction);
      break;
    case `oklch`:
      inter = OklchSpace.interpolator(aa as OkLchScalar, bb as OkLchScalar, direction);
      break;
    case `srgb`:
      inter = SrgbSpace.interpolator(aa as RgbScalar, bb as RgbScalar);
      break;
    default:
      throw new Error(`Colour space '${ space }' not supported for interpolation.`);
  }
  if (!inter) throw new Error(`Could not create interpolator for space: ${ space }`);

  let stepBy = 0;
  let startAt = 0;
  let endAt = 1;
  if (exclusive) {
    stepBy = 1 / (steps + 1);
    startAt = stepBy;
    endAt = 1 - stepBy;
  } else {
    stepBy = 1 / (steps - 1);
  }

  const results: Colour[] = [];
  for (let interpolateAmount = startAt; interpolateAmount <= endAt; interpolateAmount += stepBy) {
    results.push(inter(interpolateAmount));
  }

  return results;
}
