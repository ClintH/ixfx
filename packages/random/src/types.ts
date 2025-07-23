/**
 * A random source.
 *
 * Predefined sources: Math.random, {@link gaussianSource}, {@link weightedSource}
 */
export type RandomSource = () => number;

export type WeightedOptions = RandomNumberOptions & Readonly<{
  easingFunction: (v: number) => number
  easing?: string
}>;

export type StringOptions = Readonly<{
  length: number;
  source?: RandomSource;
}>



export type RandomOptions = Readonly<{
  source?: RandomSource
}>

export type RandomNumberOptions = RandomOptions & Readonly<{
  max?: number
  min?: number
}>

/**
 * Options for generating a random boolean
 */
export type RandomBooleanOptions = RandomOptions & Readonly<{
  /**
   * If a random value is above threshold, _true_ is returned,
   * otherwise _false_.
   * Defaults to 0.5
   */
  threshold?: number
}>

export type GenerateRandomOptions = RandomNumberOptions & Readonly<{
  /**
   * If true, number range is looped
   */
  loop?: boolean;
}>;