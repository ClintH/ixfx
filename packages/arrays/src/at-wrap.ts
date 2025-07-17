import { numberTest, resultThrow } from "@ixfx/guards"

/**
 * Similar to Javascript's in-built Array.at function, but allows offsets
 * to wrap.
 * 
 * @remarks
 * ```js
 * const test = [1,2,3,4,5,6];
 * atWrap(0);   // 1
 * atWrap(-1);  // 6
 * atWrap(-6);  // 1
 * ```
 * 
 * These values would return _undefined_ using Array.at since its beyond
 * the length of the array
 * ```js
 * atWrap(6);   // 1
 * atWrap(-7);  // 6
 * ```
 * @param array Array
 * @param index Index
 * @returns 
 */
export const atWrap = <V>(array: V[], index: number) => {
  resultThrow(numberTest(index, ``, `index`));
  if (!Array.isArray(array)) throw new Error(`Param 'array' is not an array`);

  index = index % array.length;
  return array.at(index) as V;
}