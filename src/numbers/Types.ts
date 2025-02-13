export type MinMaxAvgTotal = {
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

export type MinMaxAvgOpts = {
  /**
   * Start index, inclusive
   */
  readonly startIndex?: number;
  /**
   * End index, exclusive
   */
  readonly endIndex?: number;
};

export type NumberScaler = (v: number) => number;

export type NumberScalerTwoWay = {
  out: NumberScaler
  in: NumberScaler
}