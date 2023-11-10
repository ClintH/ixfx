import { type RandomSource, defaultRandom } from "./Types.js";

/**
* Returns a random number from 0..weightings.length, distributed by the weighting values.
* 
* eg: produces 0 20% of the time, 1 50% of the time, 2 30% of the time
* ```js
* weightedIndex([0.2, 0.5, 0.3]);
* ```
* @param weightings 
* @param rand 
* @returns 
*/
export const weightedIndex = (weightings: Array<number>, rand: RandomSource = defaultRandom): () => number => {
  const precompute: Array<number> = [];
  let total = 0;
  // eslint-disable-next-line unicorn/no-for-loop
  for (let index = 0; index < weightings.length; index++) {
    total += weightings[ index ];
    precompute[ index ] = total;
  }
  if (total !== 1) throw new Error(`Weightings should add up to 1. Got: ${ total }`);

  return (): number => {
    const v = rand();
    // eslint-disable-next-line unicorn/no-for-loop
    for (let index = 0; index < precompute.length; index++) {
      if (v <= precompute[ index ]) return index;
    }
    throw new Error(`Bug: weightedIndex could not select index`);
  }
}