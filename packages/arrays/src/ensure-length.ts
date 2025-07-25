
export function ensureLength<V>(
  data: readonly V[] | V[],
  length: number,
  expand: `repeat` | `first` | `last`
): (V)[];

export function ensureLength<V>(
  data: readonly V[] | V[],
  length: number,
  expand?: `undefined`
): (V | undefined)[];

/**
 * Returns a copy of an array with specified length - padded or truncated as needed.
 *
 * If the input array is too short, it will be expanded based on the `expand` strategy:
 *  - 'undefined': fill with _undefined_ (default)
 *  - 'repeat': repeat array elements, starting from position 0
 *  - 'first': repeat with first element from `data`
 *  - 'last': repeat with last element from `data`
 *
 * Truncate:
 * ```js
 * ensureLength([1,2,3], 2); // [1,2]
 * ```
 * 
 * Padded:
 * ```js
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
export function ensureLength<V>(
  data: readonly V[] | V[],
  length: number,
  expand: `undefined` | `repeat` | `first` | `last` = `undefined`
): (V | undefined)[] {
  if (data === undefined) throw new Error(`Data undefined`);
  if (!Array.isArray(data)) throw new Error(`data is not an array`);
  if (data.length === length) return [ ...data ];
  if (data.length > length) {
    return data.slice(0, length);
  }
  const d = [ ...data ];
  const add = length - d.length;

  for (let index = 0; index < add; index++) {
    switch (expand) {
      case `undefined`: {
        // @ts-expect-error all fine .....
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
        // @ts-expect-error all fine .....
        d.push(data.at(-1));
        break;
      }
      // No default
    }
  }
  return d;
};
