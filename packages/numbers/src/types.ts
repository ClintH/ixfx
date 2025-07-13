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