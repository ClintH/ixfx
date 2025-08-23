
/**
 * Returns the array.map() output, or a value if `array`
 * is not an array or empty.
 * 
 * ```js
 * mapWithEmptyFallback([1,2,3], v => v+2, 100); // Yields: [3,4,5]
 * mapWithEmptyFallback([], v=>v+2, 100); // Yields: [100]
 * mapWithEmptyFallback({}, v=>v+2, [100]); // Yields: [100]
 * ```
 * 
 * If the fallback value is an array, it is returned as an
 * array if needed. If it's a single value, it is wrapped as an array.
 * @param array Array of values
 * @param fn Function to use for mapping values
 * @param fallback Fallback single value or array of values
 * @returns 
 */
export const mapWithEmptyFallback = <TValue, TReturn>(array: TValue[], fn: (value: TValue) => TReturn, fallback: TReturn | TReturn[]): TReturn[] => {
  if (typeof array !== `object` || !Array.isArray(array) || array.length === 0) {
    if (Array.isArray(fallback)) return fallback;
    return [ fallback ];
  }
  return array.map(fn);
}