import type { NumericRange } from "./types.js";

/**
 * Normalisation strategies
 * 
 * In brief,
 * * minmax: Produces values on 0..1 scale. Sensitive to outliers
 * * zscore: Mean value will be normalised to 0, those on standard deviation 1. Less sensitive to outliers
 */
export type NormalisationStrategy = `minmax` | `zscore` | `robust`;
export type NormalisationStreamStrategy = `minmax`;

export type MinMaxStreamOptions = {
  minDefault: number
  maxDefault: number
}

export type MinMaxArrayOptions = {
  minForced: number
  maxForced: number
}

export type ZScoreArrayOptions = {
  meanForced: number
  standardDeviationForced: number
}

export type RobustArrayOptions = {
  medianForced: number
  iqrForced: number
}


export type NormalisationStreamOptions = MinMaxStreamOptions;
export type NormalisationArrayOptions = MinMaxArrayOptions | ZScoreArrayOptions | RobustArrayOptions;

export type NormaliseStreamContext = NumericRange & {
  /**
   * Passes a value to the normaliser, getting
   * back the normalised result
   * @param v Value to add
   * @returns Normalised result
   */
  seen: (v: number) => number
  /**
   * Reset the normaliser, by default to
   * extreme ranges so it will calibrate after the
   * next value.
   * @param minDefault Start min value (default: Number.MAX_SAFE_INTEGER)
   * @param maxDefault Start max value (default: Number.MIN_SAFE_INTERGER)
   * @returns 
   */
  reset: (minDefault?: number, maxDefault?: number) => void
  /**
   * Get the current min value of range.
   * 
   * If no values have been passed through the stream it will be
   * the initial minDefault or Number.MAX_SAFE_INTEGER
   */
  get min(): number
  /**
   * Get the current max value of range.
   * 
   * If no values have been passed through the stream it will be
   * the initial maxDefault or Number.MIN_SAFE_INTEGER
   */
  get max(): number

  /**
   * Gets the absolute range (ie. max-min) of the normaliser.
   * 
   * If normaliser hasn't received any values it will use its default min/max.
   */
  get range(): number
}