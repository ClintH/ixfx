/**
 * A random source.
 *
 * Predefined sources: {@link defaultRandom}, {@link gaussianSource}, {@link weightedSource}
 */
export type RandomSource = () => number;


export type StringOptions = Readonly<{
  length: number;
  source?: RandomSource;
}>

/**
 * Default random number generator: `Math.random`.
 */
export const defaultRandom = Math.random;

export type RandomOptions = Readonly<{
  max: number;
  min?: number;
  source?: RandomSource;
}>