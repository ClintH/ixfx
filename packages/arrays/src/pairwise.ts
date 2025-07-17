import { resultThrow, arrayTest } from "@ixfx/guards";

/**
 * Yields pairs made up of overlapping items from the input array.
 * 
 * Throws an error if there are less than two entries.
 * 
 * ```js
 * pairwise([1, 2, 3, 4, 5]);
 * Yields:
 * [ [1,2], [2,3], [3,4], [4,5] ]
 * ```
 * @param values 
 */
export function* pairwise<T>(values: T[]) {
  resultThrow(arrayTest(values, `values`));

  if (values.length < 2) throw new Error(`Array needs to have at least two entries. Length: ${ values.length }`);

  for (let index = 1; index < values.length; index++) {
    yield [ values[ index - 1 ], values[ index ] ];
  }
}

/**
 * Reduces in a pairwise fashion.
 *
 * Eg, if we have input array of [1, 2, 3, 4, 5], the
 * `reducer` fn will run with 1,2 as parameters, then 2,3, then 3,4 etc.
 * ```js
 * const values = [1, 2, 3, 4, 5]
 * reducePairwise(values, (acc, a, b) => {
 *  return acc + (b - a);
 * }, 0);
 * ```
 *
 * If input array has less than two elements, the initial value is returned.
 *
 * ```js
 * const reducer = (acc:string, a:string, b:string) => acc + `[${a}-${b}]`;
 * const result = reducePairwise(`a b c d e f g`.split(` `), reducer, `!`);
 * Yields: `![a-b][b-c][c-d][d-e][e-f][f-g]`
 * ```
 * @param array
 * @param reducer
 * @param initial
 * @returns
 */
export const pairwiseReduce = <V, X>(
  array: readonly V[],
  reducer: (accumulator: X, a: V, b: V) => X,
  initial: X
) => {
  resultThrow(arrayTest(array, `arr`));
  if (array.length < 2) return initial;
  for (let index = 0; index < array.length - 1; index++) {
    initial = reducer(initial, array[ index ], array[ index + 1 ]);
  }
  return initial;
};
