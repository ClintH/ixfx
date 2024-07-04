/**
 * Returns a copy of `data` with specified length.
 * If the input array is too long, it is truncated.
 *
 * If the input array is too short, it will be expanded based on the `expand` strategy:
 *  - 'undefined': fill with `undefined`
 *  - 'repeat': repeat array elements, starting from position 0
 *  - 'first': repeat with first element from `data`
 *  - 'last': repeat with last element from `data`
 *
 * ```js
 * import { ensureLength } from 'https://unpkg.com/ixfx/dist/arrays.js';
 *
 * ensureLength([1,2,3], 2); // [1,2]
 * ensureLength([1,2,3], 5, `undefined`); // [1,2,3,undefined,undefined]
 * ensureLength([1,2,3], 5, `repeat`);    // [1,2,3,1,2]
 * ensureLength([1,2,3], 5, `first`);     // [1,2,3,1,1]
 * ensureLength([1,2,3], 5, `last`);      // [1,2,3,3,3]
 * ```
 * @param data Input array to expand
 * @param length Desired length
 * @param expand Expand strategy
 * @typeParam V Type of array
 */
export const ensureLength = <V>(
  data: ReadonlyArray<V> | Array<V>,
  length: number,
  expand: `undefined` | `repeat` | `first` | `last` = `undefined`
): Array<V> => {
  // Unit tested
  if (data === undefined) throw new Error(`Data undefined`);
  if (!Array.isArray(data)) throw new Error(`data is not an array`);
  if (data.length === length) return [ ...data ];
  if (data.length > length) {
    return data.slice(0, length);
  }
  const d = [ ...data ];
  const add = length - d.length;

  //eslint-disable-next-line functional/no-let
  for (let index = 0; index < add; index++) {
    //eslint-disable-next-line functional/immutable-data
    switch (expand) {
      case `undefined`: {
        // @ts-expect-error
        d.push(undefined);
        break;
      }
      case `repeat`: {
        d.push(data[ index % data.length ]);
        break;
      }
      case `first`: {
        d.push(data[ 0 ]);
        break;
      }
      case `last`: {
        // @ts-expect-error
        d.push(data.at(-1));
        break;
      }
      // No default
    }
  }
  return d;
};
