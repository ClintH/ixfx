import type { RandomSource } from "./types.js";

export type LfsrResult = {
  stringValue: string;
  value: number;
};

export type LfsrOptions = {
  taps: number[] // bit positions (0 = LSB)
  /**
   * Width: 8 or 16.
   */
  width: number
  seed: number
  output: `integer` | `float`
};

/**
 * Creates a linear feedback shift register (LFSR). Useful for creating deterministic,
 * pseudo-random numbers.
 *
 * Uses 0 (inclusive)...1 (exclusive) scale like Math.random();
 * 
 * ```js
 * // Get a function to produce sclar (0..1) values:
 * const l = lfsrSource();
 * 
 * // Produce a value
 * l(); // 0..1 value
 * ```
 * 
 * By default, `lfsrSource` uses a fixed seed, so each time it creates the same
 * series of random numbers.
 * 
 * Custom seed
 * ```js
 * const l = lfsrSource({ seed: 0b10111101 });
 * ```
 * 
 * The algorithm natively produces integer values which are scaled to 0..1 range.
 * If you want integer results:
 * 
 * ```js
 * const l = lfsrSource({ output: `integer` });
 * ```
 * 
 * Note: not very high-resolution.
 * @param options 
 * @returns 
 */
export function lfsrSource(options: Partial<LfsrOptions> = {}): RandomSource {
  const l = lfsrCompute(options);
  return () => l().value;
}

// Default taps for common maximal-length LFSRs
const defaultTaps: Record<number, number[]> = {
  8: [ 7, 5, 4, 3 ], // 255
  16: [ 15, 13, 12, 10 ], // 65535
} as const;

export function lfsrCompute(
  options: Partial<LfsrOptions> = {}
): () => LfsrResult {
  const seed = options.seed ?? 0b10110101;
  if (seed <= 0) throw new TypeError(`Param 'seed' must be a positive non-zero integer. Got: '${ seed }'`);
  const output = options.output ?? `integer`;
  const asFloat = output === `float`

  const width = options.width ?? Math.floor(Math.log2(seed)) + 1;
  const taps = options.taps ?? defaultTaps[ width ];
  if (!taps || taps.length === 0) throw new TypeError(`Param 'taps' empty or undefined for width: '${ width }'`);

  let state = seed & ((1 << width) - 1);
  return (): LfsrResult => {
    let feedback = 0;

    for (const tap of taps) {
      feedback ^= (state >> tap) & 1;
    }

    state = ((state << 1) | feedback) & ((1 << width) - 1);

    let value = state;
    if (asFloat) {
      if (width === 8) value = (value - 1) / 256
      if (width === 16) value = (value - 1) / 65536
    }
    return {
      value,
      stringValue: state.toString(2).padStart(width, "0"),
    };
  };
}
