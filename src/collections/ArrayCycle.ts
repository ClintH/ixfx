
/**
 * Cycle through the contents of an array. By default starts at index 0.
 * ```js
 * const c = arrayCycle([`apples`, `oranges`, `pears`]);
 * c.current; // `apples`
 * c.next();  // `oranges`
 * c.next();  // `pears`
 * c.next();  // `apples`
 * c.prev();  // `pears`
 * ```
 * 
 * You can select an item by index or value:
 * ```
 * c.select(1); // `oranges`
 * c.select(`pears`); // `pears`
 * ```
 * 
 * Selecting by value uses === semantics.
 * @param opts 
 * @returns 
 */
export const arrayCycle = <T>(opts: ReadonlyArray<T>) => {
  let index = 0;
  const next = () => {
    index++;
    if (index === opts.length) index = 0;
    return value();
  }

  // eslint-disable-next-line unicorn/prevent-abbreviations
  const prev = () => {
    index--;
    if (index === -1) index = opts.length - 1;
    return value();
  }

  const value = (): typeof opts[ number ] => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return opts.at(index)!;
  }

  const select = (indexOrValue: number | typeof opts[ number ]) => {
    if (typeof indexOrValue === `number`) {
      index = indexOrValue;
    } else {
      const found = opts.indexOf(indexOrValue);
      if (found === -1) throw new Error(`Could not find value`);
      index = found;
    }
  }

  const toArray = () => [ ...opts ];
  return { toArray, next, prev, get current() { return value() }, select }
}