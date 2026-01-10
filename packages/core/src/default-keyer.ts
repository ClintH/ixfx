/**
 * If values are strings, uses that as the key.
 * Otherwise uses `JSON.stringify`.
 * @param a
 * @returns
 */
export const defaultKeyer = <V>(a: V): string => {
  return typeof a === `string` ? a : JSON.stringify(a);
};