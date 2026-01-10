import { type StringOptions } from "./types.js";

/**
 * Returns a string of random letters and numbers of a given `length`.
 *
 * ```js
 * string();  // Random string of length 5
 * string(4); // eg. `4afd`
 * ```
 * @param lengthOrOptions Length of random string, or options.
 * @returns Random string
 */
export const string = (lengthOrOptions: number | StringOptions = 5): string => {
  const options =
    typeof lengthOrOptions === `number` ? { length: lengthOrOptions } : lengthOrOptions;
  const calculate = options.source ?? Math.random;
  const length = options.length ?? 5
  let returnValue = ``;
  while (returnValue.length < length) {
    returnValue += calculate()
      .toString(36)
      .slice(2);
  }
  return returnValue.substring(0, length);
};
