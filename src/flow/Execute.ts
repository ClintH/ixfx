import { defaultComparer, type Comparer } from '../Util.js';
import { shuffle } from '../collections/Arrays.js';

export type ExpressionOrResult<ArgsType, ResultType> =
  | ResultType
  | ((
      args: ArgsType | undefined
    ) => Promise<ResultType | undefined> | ResultType | undefined | void);

//eslint-disable-next-line functional/no-mixed-types
export type RunOpts<ResultType> = {
  /**
   * If provided, filters the set of results prior to returning.
   * @param result
   * @returns
   */
  readonly filter?: (result: ResultType) => boolean;
  /**
   * If true, execution order is shuffled each time
   */
  readonly shuffle?: boolean;
  /**
   * Function to rank results. By default uses {@link defaultComparer} which orders
   * by numeric value or alphabetical.
   */
  readonly rank?: Comparer<ResultType>;
  /**
   * If provided, stops execution if _true_ is returned.
   * Result(s) include most recent execution.
   * @param latest Latest result
   * @param sorted Sorted list of current results, not including latest
   * @returns
   */
  readonly stop?: (
    latest: ResultType | undefined,
    sorted: readonly ResultType[]
  ) => boolean;
};

export type RunSingleOpts<V> = RunOpts<V> & {
  readonly at?: number;
};
/**
 * Runs a series of async expressions, returning the results.
 * Use {@link runSingle} if it's only a single result you care about.
 *
 * @example Run three functions, returning the highest-ranked result.
 * ```js
 * const result = run([
 *  () => 10,
 *  () => 2,
 *  () => 3
 * ]);
 * // Yields: 10
 * ```
 *
 * Options can be passed for evaluation:
 * ```js
 * const result = run([
 *  (args) => {
 *    if (args === 'apple') return 100;
 *  },
 *  () => {
 *    return 10;
 *  }
 * ])
 * ```
 *
 * ```js
 * const expr = [
 *  (opts) => 10,
 *  (opts) => 2,
 *  (opts) => 3
 * ];
 * const opts = {
 *  rank: (a, b) => {
 *    if (a < b) return -1;
 *    if (a > b) return 1;
 *    return 0;
 *  }
 * }
 * const result = await run(expr, opts);
 * // Returns: 2
 * ```
 *
 * In terms of typing, it takes an generic arguments `ArgsType` and `ResultType`:
 * - `ArgsType`: type of expression arguments. This might be `void` if no arguments are used.
 * - `ResultType`:  return type of expression functions
 *
 * Thus the `expressions` parameter is an array of functions:
 * ```js
 * (args:ArgsType|undefined) => ResultType|undefined
 * // or
 * (args:ArgsType|undefined) => Promise<ResultType|undefined>
 * ```
 *
 * Example:
 * ```js
 * const expressions = [
 *  // Function takes a string arg
 *  (args:string) => return true; // boolean is the necessary return type
 * ];
 * const run<string,boolean>(expressions, opts, 'hello');
 * ```
 * @param expressions
 * @param opts
 * @param args
 * @returns
 */
export const run = async <ArgsType, ResultType>(
  expressions: //eslint-disable-next-line functional/prefer-readonly-type
  | ExpressionOrResult<ArgsType, ResultType>[]
    | ExpressionOrResult<ArgsType, ResultType>
    | readonly ExpressionOrResult<ArgsType, ResultType>[],
  opts: RunOpts<ResultType> = {},
  args?: ArgsType
): Promise<ResultType[]> => {
  const results: ResultType[] = [];
  const compareFn = opts.rank ?? defaultComparer;
  //eslint-disable-next-line functional/no-let
  let expressionsArray = Array.isArray(expressions)
    ? (expressions as ExpressionOrResult<ArgsType, ResultType>[])
    : [expressions as ExpressionOrResult<ArgsType, ResultType>];
  if (opts.shuffle) expressionsArray = shuffle(expressionsArray);

  for (let i = 0; i < expressionsArray.length; i++) {
    const exp = expressionsArray[i];
    //eslint-disable-next-line functional/no-let
    let r: ResultType;
    if (typeof exp === 'function') {
      // @ts-ignore
      r = await exp(args);
    } else {
      r = exp;
    }
    if (r !== undefined) {
      //eslint-disable-next-line functional/immutable-data
      results.push(r);
      //eslint-disable-next-line functional/immutable-data
      results.sort(compareFn);
    }

    if (typeof opts.stop !== 'undefined') {
      if (opts.stop(r, results)) {
        break;
      }
    }
  }

  if (opts.filter) {
    return results.filter(opts.filter);
  }
  return results;
};

/**
 * Like {@link run}, but it returns a single result or _undefined_.
 * Use the `at` option to specify which index of results to use.
 * By default it's -1, which is the presumably the highest-ranked result.
 *
 * @param expressions
 * @param opts
 * @param args
 * @returns
 */
export const runSingle = async <ArgsType, ResultType>(
  expressions: readonly ExpressionOrResult<ArgsType, ResultType>[],
  opts: RunSingleOpts<ResultType> = {},
  args?: ArgsType
): Promise<ResultType | undefined> => {
  const results = await run(expressions, opts, args);
  if (!results) return;
  if (results.length === 0) return;
  const at = opts.at ?? -1;
  return results.at(at);
};
