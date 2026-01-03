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
  /**
   * Current value
   */
  value: number
  /**
   * Nudge toward zero by amount
   * ```js
   * let b = immutable(1);
   * b = b.towardZero(0.1); // 0.9
   * ```
   * @param amount Amount to nudge by
   * @returns Modified copy
   */
  towardZero: (amount: number) => BipolarWrapper
  /**
   * Add some amount to the bipolar value, clipping it
   * to the -1...1 range
   * ```js
   * let b = immutable(0);
   * b = b.add(0.5); // 0.5
   * ```
   * @param amount 
   * @returns 
   */
  add: (amount: number) => BipolarWrapper
  /**
   * Multiple the value by `amount`, clipping result
   * to the -1...1 range.
   * ```js
   * let b = immutable(1);
   * b = b.multiply(0.1); // 0.9
   * ````
   * @param amount 
   * @returns 
   */
  multiply: (amount: number) => BipolarWrapper
  /**
   * Inverse value
   * ```js
   * let b = immutable(1);
   * b = b.inverse(); // -1
   * ```
   * @returns 
   */
  inverse: () => BipolarWrapper
  /**
   * Convert to 0..1 scale
   * ```js
   * let b = immutable(-1);
   * b.asScalar(); // 0
   * ```
   * @returns 
   */
  asScalar: () => number
  /**
   * Interpolate toward `target` by `amount`
   * @param amount 
   * @param target 
   * @returns 
   */
  interpolate: (amount: number, target: number) => BipolarWrapper
  [ Symbol.toPrimitive ]: (hint: string) => number | string | boolean
}

export type NumericRange = Readonly<{ min: number, max: number }>

