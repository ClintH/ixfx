import type { RandomSource } from "./Types.js";

export const calculateNonZero = (source: RandomSource = Math.random) => {
  let v = 0;
  while (v === 0) {
    //eslint-disable-next-line functional/no-expression-statements
    v = source();
  }
  return v;
}