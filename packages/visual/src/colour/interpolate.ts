import type { Colour, ColourInterpolationOpts, ColourInterpolator, Colourish, ColourSpaces, ColourStepOpts, Hsl, HslScalar, OkLch, OkLchScalar, RgbScalar,ConvertDestinations } from "./types.js";
import { pairwise } from '@ixfx/arrays';
import * as HslSpace from './hsl.js';
import { convert, toCssColour,  } from "./conversion.js";
import { convertScalar, OklchSpace, SrgbSpace } from "./index.js";
import { clamp, scaleClamped } from "@ixfx/numbers";

/**
 * Returns a function to interpolate between colours, with results as a structured {@link Colour} object.
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
 * 
 * Example: Draw the interpolation as a spectrum on a canvas, where each pixel is one step
 * ```js
 * let v = 0;
 * let incrementBy = 0.01;
 * while (v <= 1) {
 *  // Get colour at this interpolation point 0..1
 *  const colour = fn(v);                       
 *  // Convert to a CSS string
 *  ctx.fillStyle = Colour.toCssColour(colour); 
 *  // Draw a 1px wide rect, and shuffle along to the next x position
 *  ctx.fillRect(x, y, 1, h);
 *  x += 1;
 *  v += incrementBy;
 * }
 * ```
 * @param colours Colours to interpolate between
 * @param opts Options for interpolation
 * @returns 
 */
export const interpolator = (colours: Colourish[], opts: Partial<ColourInterpolationOpts> = {}) => {
  const direction = opts.direction ?? `shorter`;
  const destination: ConvertDestinations = opts.destination ?? `oklch-scalar`;
  const space: ColourSpaces = opts.space ?? `oklch`;
  const ranges = interpolateInit(colours, space);
  const rangeInterpolators = ranges.map(range => interpolatorDual(range[0], range[1], { space, direction, destination }));
  const asTargetDestination = colours.map(c => convert(c, destination));

  return (amt: number): Colour => {
    // If we're at the end, return the last colour
    if (amt >= 1) return asTargetDestination.at(-1)!;
    // If we're at the beginning, return the first colour
    if (amt <= 0) return asTargetDestination.at(0)!;
   
    // Scale to 0..1 to 0...ranges.length
    const s = scaleClamped(amt, 0, 1, 0, ranges.length);
    const index = Math.floor(s);
    
    
    const amtAdjusted = s - index;
    const ri = rangeInterpolators[ index ];
    return ri(amtAdjusted);
  }
}

function interpolateInit<T extends ColourSpaces>(colours: Colourish[], destination: T):
  T extends `oklch` ? OkLchScalar[][] :
  T extends `hsl` ? HslScalar[][] :
  T extends `srgb` ? RgbScalar[][] : HslScalar[][]

/**
 * Returns a set of pairwise colours, convert to the destination colour space in scalar form
 * @param colours 
 * @param destination 
 * @returns 
 */
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
 * If you want the result as a structured colour, use {@link interpolatorDual} instead.
 * 
 * By default takes a shorter direction and uses the OkLCH colourspace.
 * ```js
 * const i = interpolator(`blue`, `red`);
 * i(0.5); // Get the colour at 50%, as a string.
 * ```
 * 
 * To work with structured colour values, use one of the space's `interpolate` functions.
 * 
 * If you want to create discrete steps, consider {@link createSteps} or {@link scale}.
 * 
 * @param colourA First colour
 * @param colourB Second colour
 * @param options Interpolation options. By default uses shorter direction and OkLCH colour space.
 * @returns 
 */
export const interpolatorDualToString = (colourA: Colourish, colourB: Colourish, options: Partial<ColourInterpolationOpts> = {}): ((amount: number) => string) => {
  const f = interpolatorDual(colourA, colourB, options);
  return (amount: number): string => toCssColour(f(amount));

  // const space = options.space ?? `oklch`;
  // const direction = options.direction ?? `shorter`;

  // let inter: ColourInterpolator<Colour> | undefined;
  // switch (space) {
  //   case `hsl`:
  //     inter = HslSpace.interpolator(convert(colourA, `hsl-scalar`), convert(colourB, `hsl-scalar`), direction);
  //     break;
  //   case `srgb`:
  //     inter = SrgbSpace.interpolator(convert(colourA, `srgb-scalar`), convert(colourB, `srgb-scalar`));
  //     break;
  //   default:
  //     inter = OklchSpace.interpolator(convert(colourA, `oklch-scalar`), convert(colourB, `oklch-scalar`), direction);
  // }

  // return (amount: number): string => toCssColour(inter(amount));
}

/**
 * Returns a function that interpolates between two colours. Returns structured colour values.
 * If you want the result as a ready-to-use CSS string, use {@link interpolatorDualToString} instead.
 * 
 * By default takes a shorter direction and uses the OkLCH colourspace.
 * ```js
 * const i = interpolator(`blue`, `red`);
 * i(0.5); // Get the colour at 50%, as a Colour structure.
 * ```
 * 
 * If you want to create discrete steps, consider {@link createSteps} or {@link scale}.
 * @param colourA First colour
 * @param colourB Second colour
 * @param options Interpolation options. By default uses shorter direction and OkLCH colour space.
 * @returns 
 */
export const interpolatorDual = (colourA: Colourish, colourB: Colourish, options: Partial<ColourInterpolationOpts> = {}):(amount:number)=>Colour => {
  const space = options.space ?? `oklch`;
  const direction = options.direction ?? `shorter`;
  const destination: ConvertDestinations = options.destination ?? `oklch-scalar`;

  let inter: ColourInterpolator<Colour> | undefined;
  switch (space) {
    case `hsl`:
      const hslInter = HslSpace.interpolator(convert(colourA, `hsl-scalar`), convert(colourB, `hsl-scalar`), direction);
      inter = (amount: number): Colour => {
        const c = hslInter(amount);
        return convert( c ,destination);
      }
      break;
    case `srgb`:
      const srgbInter = SrgbSpace.interpolator(convert(colourA, `srgb-scalar`), convert(colourB, `srgb-scalar`));
      inter = (amount: number): Colour => {
        const c = srgbInter(amount);
        return convert( c ,destination);
      }
      break;
    default:
      const oklchInter = OklchSpace.interpolator(convert(colourA, `oklch-scalar`), convert(colourB, `oklch-scalar`), direction);
      inter = (amount: number): Colour => {
        const c = oklchInter(amount);
        return convert( c ,destination);
      }
  }

  return (amount: number): Colour => inter(amount);
}

/**
 * Produces a stepped scale of colours.
 * 
 * Builds off {@link createSteps} which can only step between two colours.
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
 * Use {@link scale} to create steps between any number of colours.
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
