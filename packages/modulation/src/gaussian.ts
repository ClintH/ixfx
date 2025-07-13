//const sqrt = Math.sqrt;
const pow = Math.pow;
//const pi = Math.PI;
//const piPi = Math.PI*2;
const gaussianA = 1 / Math.sqrt(2 * Math.PI);

/**
 * Returns a roughly gaussian easing function
 * ```js
 * import { Easings } from "https://unpkg.com/ixfx/dist/modulation.js";
 * const fn = Easings.gaussian();
 * ```
 *
 * Try different positive and negative values for `stdDev` to pinch
 * or flatten the bell shape.
 * @param standardDeviation
 * @returns
 */
export const gaussian = (standardDeviation = 0.4) => {
  //const a = 1 / sqrt(2 * pi);
  const mean = 0.5;

  return (t: number) => {
    const f = gaussianA / standardDeviation;
    // p:-8 pinched
    let p = -2.5; // -1/1.25;
    let c = (t - mean) / standardDeviation;
    c *= c;
    p *= c;
    const v = f * pow(Math.E, p); // * (2/pi);//0.62;
    if (v > 1) return 1;
    if (v < 0) return 0;
    return v;
  };
};