import { mean } from "./average.js";

/**
 * Calculates the standard deviation of an array of numbers.
 * 
 * If you already have the mean value of the array, this can be passed in.
 * Otherwise it will be computed.
 * 
 * If `usePopulation` is true, `array` is assumed to be the entire population (same as Excel's STDEV.P function)
 * Otherwise, it's like Excel's STDEV.S function which assumes data represents a sample of entire population.
 * 
 * @param array Array of values
 * @param meanValue Mean value if pre-computed, otherwise skip this parameter for it to be computed automatically
 * @param usePopulation If _true_ result is similar to Excel's STDEV.P. Otherwise like STDEV.S
 * @returns 
 */
export const standardDeviation = (array: number[], usePopulation = false, meanValue?: number) => {
  const meanV = typeof meanValue === `undefined` ? mean(array) : meanValue;
  return Math.sqrt(
    array
      .reduce<number[]>((accumulator, value) => accumulator.concat((value - meanV) ** 2), [])
      .reduce((accumulator, value) => accumulator + value, 0) / (array.length - (usePopulation ? 0 : 1)),
  );
};