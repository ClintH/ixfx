import type { RandomSource } from "./types.js";

/**
 * Keeps generating a random number until
 * it's not 0
 * @param source Random number generator 
 * @returns Non-zero number
 */
export const calculateNonZero = (source: RandomSource = Math.random): number => {
  let v = 0;
  while (v === 0) {
    v = source();
  }
  return v;
}