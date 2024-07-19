//import { stringify } from 'json5';

/**
 * Returns _true_ if Object.entries() is empty for `value`
 * @param value 
 * @returns 
 */
export const isEmptyEntries = (value: object) => [ ...Object.entries(value) ].length === 0;

/**
 * Return _true_ if `a` and `b` ought to be considered equal
 * at a given path
 */
export type IsEqualContext<V> = (a: V, b: V | undefined, path: string) => boolean

/**
 * Returns _true_ if `a` and `b are equal based on their JSON representations.
 * `path` is ignored.
 * @param a 
 * @param b 
 * @param path 
 * @returns 
 */
export const isEqualContextString: IsEqualContext<any> = (a: any, b: any, _path: string): boolean => {
  return JSON.stringify(a) === JSON.stringify(b);
}