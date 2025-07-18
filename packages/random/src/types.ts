/**
 * A random source.
 *
 * Predefined sources: Math.random, {@link gaussianSource}, {@link weightedSource}
 */
export type RandomSource = () => number;

export type WeightedOptions = RandomOptions & Readonly<{
  easingFunction: (v: number) => number
  easing?: string
}>;

export type StringOptions = Readonly<{
  length: number;
  source?: RandomSource;
}>


export type RandomOptions = Readonly<{
  max?: number;
  min?: number;
  source?: RandomSource;
}>

export type GenerateRandomOptions = RandomOptions & Readonly<{
  /**
   * If true, number range is looped
   */
  loop?: boolean;
}>;