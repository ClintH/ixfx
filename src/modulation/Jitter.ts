import {
  type RandomSource,
  floatSource as randomFloatFn,
  float as randomFloat,
} from '../Random.js';
import { clamp } from '../data/Clamp.js';
import { throwNumberTest } from '../Guards.js';

export type JitterOpts = {
  readonly relative?: number;
  readonly absolute?: number;
  readonly clamped?: boolean;
  readonly source?: RandomSource;
};

export type JitterFn = (value: number) => number;

/**
 * Jitters `value` by the absolute `jitter` amount. Returns a function.
 *
 * All values should be on a 0..1 scale, and the return value is by default clamped to 0..1.
 * Pass `clamped:false` as an option to allow for arbitary ranges.
 *
 * `jitter` returns a function that calculates jitter. If you only need a one-off
 * jitter, you can immediately execute the returned function:
 * ```js
 * import { jitter } from 'https://unpkg.com/ixfx/dist/modulation.js';
 * // Compute 10% jitter of input 0.5
 * const value = jitter({ relative: 0.1 })(0.5);
 * ```
 *
 * However, if the returned jitter function is to be used again,
 * assign it to a variable:
 * ```js
 * import { jitter } from 'https://unpkg.com/ixfx/dist/modulation.js';
 * const myJitter = jitter({ absolute: 0.5 });
 *
 * // Jitter an input value 1.0
 * const value = myJitter(1);
 * ```
 *
 * A custom source for random numbers can be provided. Eg, use a weighted
 * random number generator:
 *
 * ```js
 * import { weighted } from 'https://unpkg.com/ixfx/dist/random.js';
 * jitter({ relative: 0.1, source: weighted });
 * ```
 *
 * Options
 * * clamped: If false, `value`s out of percentage range can be used and return value may be beyond percentage range. True by default
 * * random: Random source (default is Math.random)
 * @param opts Options
 * @returns Function that performs jitter
 */
export const jitter = (opts: JitterOpts = {}): JitterFn => {
  const clamped = opts.clamped ?? true;
  //eslint-disable-next-line functional/no-let
  let r = (_: number) => 0;
  if (typeof opts.absolute !== 'undefined') {
    throwNumberTest(
      opts.absolute,
      clamped ? `percentage` : `bipolar`,
      `opts.absolute`
    );
    const absRand = randomFloatFn({
      min: -opts.absolute!,
      max: opts.absolute!,
      source: opts.source,
    });
    r = (v: number) => v + absRand();
  } else if (typeof opts.relative !== 'undefined') {
    throwNumberTest(
      opts.relative,
      clamped ? `percentage` : `bipolar`,
      `opts.relative`
    );
    r = (v: number) =>
      v +
      randomFloat({
        min: -opts.relative! * v,
        max: opts.relative! * v,
        source: opts.source,
      });
  } else {
    throw new Error(`Either absolute or relative jitter amount is required.`);
  }

  const compute = (value: number) => {
    throwNumberTest(value, clamped ? `percentage` : `bipolar`, `value`);
    //eslint-disable-next-line functional/no-let
    let v = r(value);
    if (clamped) v = clamp(v);
    return v;
    // let v:number;
    // if (typeof amtRel !== 'undefined') {
    //   const jitterAmt = value * amtRel;
    //   const j = jitterAmt * 2 * rand();
    //   v = value - jitterAmt + j;
    // } else if (typeof amtAbs !== 'undefined') {
    //   const r = randomFloat({})
    //   const j = (amtAbs * 2 * rand()) - amtAbs;
    //   v = value - amtAbs + j;
    // } else {
    //   throw new Error(`Either absolute or relative jitter amount is required.`);
    // }
    // if (clamped) return clamp(v);
    // return v;
  };
  return compute;
};
