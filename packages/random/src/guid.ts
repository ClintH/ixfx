import type { RandomSource } from "./types.js";

/**
 * Generates a short roughly unique id
 * ```js
 * const id = shortGuid();
 * ```
 * @param options Options.
 * @returns
 */
export const shortGuid = (options: Readonly<{ source?: RandomSource }> = {}) => {
  const source = options.source ?? Math.random;
  // Via Stackoverflow...
  const firstPart = Math.trunc(source() * 46_656);
  const secondPart = Math.trunc(source() * 46_656);
  const firstPartString = `000${ firstPart.toString(36) }`.slice(-3);
  const secondPartString = `000${ secondPart.toString(36) }`.slice(-3);
  return firstPartString + secondPartString;
};