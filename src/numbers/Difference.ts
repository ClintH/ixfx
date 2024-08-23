/**
 * Returns the relative difference from the `initial` value
 * ```js
 * const rel = relativeDifference(100);
 * rel(100); // 1
 * rel(150); // 1.5
 * rel(50);  // 0.5
 * ```
 *
 * The code for this is simple:
 * ```js
 * const relativeDifference = (initial) => (v) => v/initial
 * ```
 * @param {number} initial
 * @returns
 */
export const relativeDifference = (initial: number) => (v: number) =>
  v / initial;


export type DifferenceKind = `numerical` | `relative` | `relativeSigned` | `absolute`

/**
 * Returns a function which yields difference compared to last value.
 * 
 * If no initial value is provided, the first difference will be returned as 0.
 * 
 * Difference can be returned in various formats:
 * * 'absolute': numerical difference, without sign
 * * 'numerical': numerical difference, with sign, so you can see if difference is higher or lower
 * * 'relative': difference divided by last value, giving a proportional difference. Unsigned.
 * * 'relativeSigned': as above, but with sign
 * 
 * ```js
 * let d = differenceFromLast(`absolute`);
 * d(10); // 0
 * d(11); // 1
 * d(10); // 1
 * ```
 * 
 * ```js
 * let d = differenceFromLast(`numerical`);
 * d(10); // 0
 * d(11); // 1
 * d(10); // -1
 * ```
 * 
 * ```js
 * let d = differenceFromLast(`relative`);
 * d(10); // 0
 * d(11); // 0.1
 * d(10); // 0.1
 * ```
 * ```js
 * let d = differenceFromLast(`relativeSigned`);
 * d(10); // 0
 * d(11); // 0.1
 * d(10); // -0.1
 * ```
 * 
 * An initial value can be provided, eg:
 * ```js
 * let d = differenceFromLast(`absolute`, 10);
 * d(11); // 1
 * ```
 * @param kind Kind of output value
 * @param initialValue Optional initial value 
 * @returns 
 */
export const differenceFromLast = (kind: DifferenceKind = `absolute`, initialValue = Number.NaN): (v: number) => number => {
  let lastValue = initialValue;
  const compute = (v: number) => {
    if (Number.isNaN(lastValue)) {
      lastValue = v;
      return 0;
    }
    const d = v - lastValue;
    let r = 0;
    if (kind === `absolute`) {
      r = Math.abs(d);
    } else if (kind === `numerical`) {
      r = d;
    } else if (kind === `relative`) {
      r = Math.abs(d / lastValue);
    } else if (kind === `relativeSigned`) {
      r = d / lastValue;
    } else throw new TypeError(`Unknown kind: '${ kind }' Expected: 'absolute', 'relative', 'relativeSigned' or 'numerical'`);
    lastValue = v;
    return r;
  }
  return compute;
}