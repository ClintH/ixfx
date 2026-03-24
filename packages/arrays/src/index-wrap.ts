export type IndexWrapLogic = `brickwall` | `bounce` | `cycle`;

/**
 * Returns a valid index within the given range.
 *
 * Logic:
 * 'brickwall': if limit is reached, return limit
 * 'bounce': if limit is reached, continue stepping in opposite direction (default)
 * 'cycle': if limit is reached, wrap around to the other side and continue
 *
 * Examples:
 * ```js
 * // Within range
 * indexWrap(3, 2, 5) // 3
 * indexWrap(5, 2, 5) // 5
 *
 * // Bounce  logic (default)
 * indexWrap(1, 2, 5, `bounce`) // 3
 * indexWrap(0, 2, 5, `bounce`) // 4
 * indexWrap(6, 2, 5, `bounce`) // 4
 *
 * // Cycle logic
 * indexWrap(1, 2, 5, `cycle`) // 4
 * indexWrap(0, 2, 5, `cycle`) // 3
 * indexWrap(6, 2, 5, `cycle`) // 3
 * ```
 *
 * @param index
 * @param startIndex
 * @param endIndex
 * @param wrapLogic
 */
export function indexWrap(index: number, startIndex: number, endIndex: number, wrapLogic: IndexWrapLogic, iterations: number = 0): { index: number; iterations: number } {
  if (typeof wrapLogic === `undefined`)
    throw new TypeError(`Param 'wrapLogic' is required.`);
  if (startIndex > endIndex)
    throw new TypeError(`startIndex must be less than or equal to endIndex.`);
  if (index >= startIndex && index <= endIndex)
    return { index, iterations };
  if (wrapLogic === `brickwall`) {
    if (index < startIndex)
      return { index: startIndex, iterations };
    return { index: endIndex, iterations };
  }

  if (wrapLogic === `bounce`) {
    if (index < startIndex) {
      // 1, 2, 5 = Steps: 1
      // 0, 2, 5 = Steps: 2
      // -1, 2, 5 = Steps: 3
      // -2, 2, 5 = Steps: 4
      const steps = startIndex - index;
      return indexWrap(steps + startIndex, startIndex, endIndex, `bounce`, iterations + 1);
    } else {
      // Index > startIndex
      // 6,2,5 = Steps:1
      const steps = index - endIndex;
      return indexWrap(endIndex - steps, startIndex, endIndex, `bounce`, iterations + 1);
    }
  }

  if (wrapLogic === `cycle`) {
    if (index < startIndex) {
      // 1, 2, 5 = Steps: 1
      // 0, 2, 5 = Steps: 2
      // -1, 2, 5 = Steps: 3
      // -2, 2, 5 = Steps: 4
      const steps = startIndex - index;
      return indexWrap(endIndex - steps, startIndex, endIndex, `cycle`, iterations + 1);
    } else {
      // Index > startIndex
      // 6,2,5 = Steps:1
      const steps = index - endIndex;
      return indexWrap(startIndex + steps, startIndex, endIndex, `cycle`, iterations + 1);
    }
  }
  throw new TypeError(`Invalid wrapLogic: ${wrapLogic}`);
  // return { index, iterations };
}
