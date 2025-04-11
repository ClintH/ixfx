/**
 * Default comparer function is equiv to checking `a === b`.
 * Use {@link isEqualValueDefault} to compare by value, via comparing JSON string representation.
 */
export const isEqualDefault = <T>(a: T, b: T): boolean => a === b;

/**
 * A default converter to string that uses JSON.stringify if its an object, or the thing itself if it's a string
 */
export const toStringDefault = <V>(itemToMakeStringFor: V): string =>
  typeof itemToMakeStringFor === `string`
    ? itemToMakeStringFor
    : JSON.stringify(itemToMakeStringFor);