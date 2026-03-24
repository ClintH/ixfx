/**
 * Returns a random integer based on a chance probability.
 *
 * If `chance` is less than 0, `minInclusive` is returned.
 * If `chance` is greater than 1, `maxInclusive` is returned.
 *
 * Otherwise, we compute a random number to see if it's less than `chance`. It this is the case,
 * we return a random integer in the inclusive min-max range. Eg. a chance of 0.9 means that 90% of the time
 * (assuming even random distribution) we will return a random integer.
 *
 * If the random number is greater than `chance`, then we return `minInclusive`.
 * @param chance
 * @param maxInclusive Maximum value
 * @param minInclusive Minimum value. By default 0.
 * @param randomSource Random source, by default Math.random
 * @returns
 */
export function randomChanceInteger(chance: number, maxInclusive: number, minInclusive: number = 0, randomSource: (() => number) = Math.random): number {
  if (minInclusive > maxInclusive) {
    throw new Error(`minInclusive (${minInclusive}) cannot be greater than maxInclusive (${maxInclusive})`);
  }
  if (minInclusive === maxInclusive)
    throw new Error(`minInclusive (${minInclusive}) cannot be equal to maxInclusive (${maxInclusive})`);

  if (chance <= 0)
    return minInclusive;
  if (chance > 1)
    return maxInclusive;
  if (randomSource() <= chance)
    return randomInteger(maxInclusive, minInclusive, randomSource);

  return minInclusive;
}

export function randomInteger(maxInclusive: number, minInclusive: number = 0, randomSource: (() => number) = Math.random): number {
  return Math.floor(randomSource() * (maxInclusive - minInclusive + 1)) + minInclusive;
}