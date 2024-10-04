export type DifferenceKind = `numerical` | `relative` | `relativeSigned` | `absolute`

/**
 * Returns the difference from the `initial` value. Defaults to absolute difference.
 * ```js
 * const rel = differenceFromFixed(100);
 * rel(100); // 0
 * rel(150); // 50
 * rel(50);  // 50
 * ```
 *
 * 'numerical' gives sign:
 * ```js
 * const rel = differenceFromFixed(100, `numerical`);
 * rel(100); // 0
 * rel(150); // 50
 * rel(50); // -50
 * ```
 * 
 * 'relative' gives proportion to initial
 * ```js
 * const rel = differenceFromFixed(100, `relative`);
 * rel(100); // 0
 * rel(150); // 0.5
 * rel(10);  // 0.90
 * ```
 * 
 * Using 'relativeSigned', we get negative relative result
 * when value is below the initial value.
 * 
 * Use {@link differenceFromLast} to compare against the last value,
 * rather than the same fixed value.
 * @param {number} initial Value to compare against
 * @returns Difference from initial value
 */
export const differenceFromFixed = (initial: number, kind: DifferenceKind = `absolute`) => (value: number) => differenceFrom(kind, value, initial);


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
 * Use {@link differenceFromFixed} to compare against a fixed value instead of the last value.
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
  return (value: number) => {
    const x = differenceFrom(kind, value, lastValue);
    lastValue = value;
    return x;
  }
}
//   const compute = (v: number) => {
//     if (Number.isNaN(lastValue)) {
//       lastValue = v;
//       return 0;
//     }
//     const d = v - lastValue;
//     let r = 0;
//     if (kind === `absolute`) {
//       r = Math.abs(d);
//     } else if (kind === `numerical`) {
//       r = d;
//     } else if (kind === `relative`) {
//       r = Math.abs(d / lastValue);
//     } else if (kind === `relativeSigned`) {
//       r = d / lastValue;
//     } else throw new TypeError(`Unknown kind: '${ kind }' Expected: 'absolute', 'relative', 'relativeSigned' or 'numerical'`);
//     lastValue = v;
//     return r;
//   }
//   return compute;
// }

const differenceFrom = (kind: DifferenceKind = `absolute`, value: number, from: number) => {
  if (Number.isNaN(from)) {
    return 0;
  }
  const d = value - from;
  let r = 0;
  if (kind === `absolute`) {
    r = Math.abs(d);
  } else if (kind === `numerical`) {
    r = d;
  } else if (kind === `relative`) {
    r = Math.abs(d / from);
  } else if (kind === `relativeSigned`) {
    r = d / from;
  } else throw new TypeError(`Unknown kind: '${ kind }' Expected: 'absolute', 'relative', 'relativeSigned' or 'numerical'`);
  return r;
}