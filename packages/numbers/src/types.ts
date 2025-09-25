export type NumbersComputeResult = {
  /**
   * Tally of number of items
   */
  readonly count: number;

  /**
   * Smallest value in array
   */
  readonly min: number;
  /**
   * Total of all items
   */
  readonly total: number;
  /**
   * Largest value in array
   */
  readonly max: number;
  /**
   * Average value in array
   */
  readonly avg: number;
};

export type NumbersComputeOptions = Readonly<{
  /**
   * Start index, inclusive
   */
  //startIndex?: number;
  /**
   * End index, exclusive
   */
  //endIndex?: number;

  nonNumbers?: `throw` | `ignore` | `nan`
}>;

export type NumberScaler = (v: number) => number;

export type NumberScalerTwoWay = {
  out: NumberScaler
  in: NumberScaler
}

/**
 * Wrapper around a bipolar value. Immutable.
 * 
 * ```js
 * let b = Bipolar.immutable();
 * let b = Bipolar.immutable(0.5);
 * b = b.add(0.1);
 * ```
 */
export type BipolarWrapper = {
  value: number
  towardZero: (amt: number) => BipolarWrapper
  add: (amt: number) => BipolarWrapper
  multiply: (amt: number) => BipolarWrapper
  inverse: () => BipolarWrapper
  asScalar: () => number
  interpolate: (amt: number, b: number) => BipolarWrapper
  [ Symbol.toPrimitive ]: (hint: string) => number | string | boolean
}

export type NumericRange = Readonly<{ min: number, max: number }>

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