import { defaultRandom, type StringOptions } from "./Types.js";

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
export const string = (lengthOrOptions: number | StringOptions = 5) => {
  const options =
    typeof lengthOrOptions === `number` ? { length: lengthOrOptions } : lengthOrOptions;
  const calculate = options.source ?? defaultRandom;
  return calculate()
    .toString(36)
    .slice(2, length + 2);
};