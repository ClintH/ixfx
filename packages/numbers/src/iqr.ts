import { median } from "./average.js";

/**
 * Calculate interquartile range.
 * 
 * If `n` is unspecified, `data.length` is used.
 * @param data 
 * @param n 
 * @returns 
 */
export const interquartileRange = (data: number[], n?: number) => {
  const q3 = getQuantile(data, 0.75);
  const q1 = getQuantile(data, 0.25);
  return q3 - q1;
  // if (typeof n === `undefined`) n = data.length;

  // // https://www.geeksforgeeks.org/dsa/interquartile-range-iqr/
  // const medianIndex = (l: number, r: number) => {
  //   let n = r - l + 1;
  //   n = Math.floor((n + 1) / 2) - 1;
  //   return n + l;
  // }
  // data.sort((x, y) => x - y);

  // // Index of median 
  // // of entire data
  // const mIndex = medianIndex(0, n - 1);

  // // Median of first half
  // const q1 = data[ medianIndex(0, mIndex) ];

  // // Median of second half
  // let q3;
  // if (n % 2 === 0)
  //   q3 = data[ medianIndex(mIndex + 1, n - 1) ];
  // else
  //   q3 = data[ medianIndex(mIndex + 1, n) ];

  // // IQR calculation
  // return q3 - q1;
}

/**
 * Return a copy of `data` with outliers removed.
 * 
 * Outliers are defined as: "a point which falls more than 1.5 times the interquartile range above the third quartile or below the first quartile." [Wolfram](https://mathworld.wolfram.com/Outlier.html)
 * 
 * 
 * @param data Data to filter
 * @param multiplier Multiplier of Q3 Q1. Default: 1.5 
 * @returns 
 */
export const filterOutliers = (data: number[], multiplier = 1.5) => {
  //https://stackoverflow.com/questions/20811131/javascript-remove-outlier-from-an-array
  if (data.length < 4) return data;

  const values = data.slice().sort((a, b) => a - b); // copy array fast and sort

  const q1 = getQuantile(values, 0.25, true);
  const q3 = getQuantile(values, 0.75, true);

  const iqr = q3 - q1;
  const maxValue = q3 + iqr * multiplier;
  const minValue = q1 - iqr * multiplier;

  return values.filter((x) => (x >= minValue) && (x <= maxValue));
}

/**
 * Gets the value at a specific quantile
 * ```js
 * getQuantile(data, 25); // 1st quartile
 * getQuantile(data, 75); // 3rd quartile
 * ```
 * @param data 
 * @param quantile 
 * @param presorted Pass _true_ if `data` is already sorted
 * @returns 
 */
export const getQuantile = (data: number[], quantile: number, presorted = false): number => {
  if (quantile > 1 || quantile < 0) throw new TypeError(`Param 'quantile' is expected to be in 0..1 range. Got: '${ quantile }'`);
  if (!Array.isArray(data)) throw new TypeError(`Param 'data' is expected to be an array. Got: ${ typeof data }`);
  // https://stackoverflow.com/questions/20811131/javascript-remove-outlier-from-an-array
  // Get the index the quantile is at.
  const index = quantile * (data.length - 1);

  if (!presorted) {
    data = data.toSorted((a, b) => a - b);
  }

  if (quantile === 0) return data[ 0 ];
  if (quantile === 1) return data[ data.length - 1 ];

  if (index % 1 === 0) {
    return data[ index ];
  }

  const lowerIndex = Math.floor(index);
  if (data[ lowerIndex + 1 ] !== undefined) {
    return (data[ lowerIndex ] + data[ lowerIndex + 1 ]) / 2;
  }
  return data[ lowerIndex ];
  // Get the remaining.
  //const remainder = index - lowerIndex;
  // Add the remaining to the lowerindex value.
  //return data[ lowerIndex ] + remainder * (data[ lowerIndex + 1 ] - data[ lowerIndex ]);

}