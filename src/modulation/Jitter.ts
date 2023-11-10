import {
  float as randomFloat
} from '../random/index.js';
import { floatSource as randomFloatFunction } from '../random/FloatSource.js';
import { clamp } from '../data/Clamp.js';
import { throwNumberTest } from '../Guards.js';
import { defaultRandom, type RandomSource } from '../random/Types.js';

export type JitterOpts = {
  readonly relative?: number;
  readonly absolute?: number;
  readonly clamped?: boolean;
  readonly source?: RandomSource;
};

export type Jitterer = (value: number) => number;

/**
 * Returns a {@link Jitterer} that works with absolute values.
 * 
 * ```js
 * // Jitter by -10 to 10
 * const j = jitterAbsolute({ absolute: 10 });
 * j(100); // Produces range of 90-110
 * ```
 * 
 * When `clamped` is true, return value is clamped to 0...value
 * ```js
 * const j = jitterAbsolute({ absolute: 10, clamped: true })
 * j(100); // Produces range of 90-100
 * ```
 * @param opts 
 * @returns 
 */
export const jitterAbsolute = (opts: JitterOpts): Jitterer => {
  const { relative, absolute } = opts;
  const clamped = opts.clamped ?? false;
  const source = opts.source ?? defaultRandom;
  if (absolute !== undefined) {
    return (value: number) => {
      const abs = (source() * absolute * 2) - absolute;
      const valueNew = value + abs;
      if (clamped) return clamp(valueNew, 0, value);
      return valueNew;
    }
  }
  if (relative !== undefined) {
    return (value: number) => {
      const rel = value * relative;
      const abs = (source() * rel * 2) - rel;
      const valueNew = value + abs;
      if (clamped) return clamp(valueNew, 0, value);
      return valueNew;
    }
  }
  throw new Error(`Either absolute or relative fields expected`);
}

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
export const jitter = (opts: JitterOpts = {}): Jitterer => {
  const clamped = opts.clamped ?? true;
  //eslint-disable-next-line functional/no-let
  let r = (_: number) => 0;
  if (opts.absolute !== undefined) {
    throwNumberTest(
      opts.absolute,
      clamped ? `percentage` : `bipolar`,
      `opts.absolute`
    );
    const absRand = randomFloatFunction({
      min: -opts.absolute,
      max: opts.absolute,
      source: opts.source,
    });
    r = (v: number) => v + absRand();
  } else if (opts.relative === undefined) {
    throw new TypeError(`Either absolute or relative jitter amount is required.`);
  } else {
    throwNumberTest(
      opts.relative,
      clamped ? `percentage` : `bipolar`,
      `opts.relative`
    );
    r = (v: number) =>
      v +
      randomFloat({
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        min: -opts.relative! * v,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        max: opts.relative! * v,
        source: opts.source,
      });
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
