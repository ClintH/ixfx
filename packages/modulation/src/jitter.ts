import { resultThrow, numberTest } from '@ixfx/guards';
import { clamp } from '@ixfx/numbers';
import { floatSource as randomFloatFunction, float as randomFloat } from '@ixfx/random';
import type { RandomSource } from '@ixfx/random';

export type JitterOpts = {
  readonly relative?: number;
  readonly absolute?: number;
  readonly clamped?: boolean;
  readonly source?: RandomSource;
};

export type Jitterer = (value: number) => number;

/**
 * Returns a {@link Jitterer} that works with absolute values,
 * ie. values outside of 0..1 range.
 * 
 * Jitter amount is _absolute_, meaning a fixed value regardless of input value,
 * or _relative_, meaning it is scaled according to input value.
 * 
 * ```js
 * // Jitter by -10 to +10 (absolute value: 10)
 * const j1 = jitterAbsolute({ absolute: 10 });
 * j1(100); // Produces range of 90...110
 * 
 * // Jitter by -20 to +20 (relative value 20%)
 * const j2 = jitterAbsolute({ relative: 0.20 });
 * j2(100); // Produces a range of -80...120
 * ```
 * 
 * The expected used case is calling `jitterAbsolute` to set up a jitterer
 * and then reusing it with different input values, as above with the `j1` and `j2`.
 * 
 * However to use it 'one-off', just call the returned function immediately:
 * ```js
 * const v = jitterAbsolute({ absolute: 10 })(100); // v is in range of 90-110
 * ```
 * 
 * When `clamped` is true, return value is clamped to 0...value.
 * That is, rather than the usual bipolar jittering, the jittering only goes below.
 * ```js
 * const j = jitterAbsolute({ absolute: 10, clamped: true })
 * j(100); // Produces range of 90-100
 * ```
 * @param options
 * @returns 
 */
export const jitterAbsolute = (options: JitterOpts): Jitterer => {
  const { relative, absolute } = options;
  const clamped = options.clamped ?? false;
  const source = options.source ?? Math.random;
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
 * // Compute 10% jitter of input 0.5
 * const value = jitter({ relative: 0.1 })(0.5);
 * ```
 *
 * However, if the returned jitter function is to be used again,
 * assign it to a variable:
 * ```js
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
 * import { weighted } from '@ixfx/random.js';
 * jitter({ relative: 0.1, source: weighted });
 * ```
 *
 * Options
 * * clamped: If false, `value`s out of percentage range can be used and return value may be beyond percentage range. True by default
 * * random: Random source (default is Math.random)
 * @param options Options
 * @returns Function that performs jitter
 */
export const jitter = (options: JitterOpts = {}): Jitterer => {
  const clamped = options.clamped ?? true;
  let r = (_: number) => 0;
  if (options.absolute !== undefined) {
    resultThrow(numberTest(
      options.absolute,
      clamped ? `percentage` : `bipolar`,
      `opts.absolute`
    ));
    const absRand = randomFloatFunction({
      min: -options.absolute,
      max: options.absolute,
      source: options.source,
    });
    r = (v: number) => v + absRand();
  } else if (options.relative === undefined) {
    throw new TypeError(`Either absolute or relative jitter amount is required.`);
  } else {
    const rel = options.relative ?? 0.1;
    resultThrow(numberTest(
      rel,
      clamped ? `percentage` : `bipolar`,
      `opts.relative`
    ));
    r = (v: number) =>
      v +
      randomFloat({
        min: -Math.abs(rel * v),
        max: Math.abs(rel * v),
        source: options.source,
      });
  }

  const compute = (value: number) => {
    resultThrow(numberTest(value, clamped ? `percentage` : `bipolar`, `value`));
    let v = r(value);
    if (clamped) v = clamp(v);
    return v;
  };
  return compute;
};
