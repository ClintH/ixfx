import { number as guardNumber } from "./Guards.js";
import { untilMatch } from "./Text.js";

export * as IterableAsync from './IterableAsync.js';
export * as Debug from './Debug.js';

//export { KeyValue } from './KeyValue.js';

/**
 * Returns `fallback` if `v` is NaN, otherwise returns `v`
 * @param v
 * @param fallback 
 * @returns 
 */
export const ifNaN = (v:number, fallback:number):number => {
  if (Number.isNaN(v)) return fallback;
  return v;
};


/**
 * Returns true if `x` is a power of two
 * @param x 
 * @returns True if `x` is a power of two
 */
export const isPowerOfTwo = (x:number) => Math.log2(x) % 1 === 0;

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
export const relativeDifference = (initial:number) => (v:number) => v/initial;

// try {
//   if (typeof window !== `undefined`) {
//     //eslint-disable-next-line functional/immutable-data,@typescript-eslint/no-explicit-any
//     (window as any).ixfx = {...(window as any).ixfx, clamp, clampIndex, flip, interpolate, interpolateAngle, proportion, relativeDifference, scale, scalePercent, wrap, wrapInteger, wrapRange};
//   }
// } catch { /* no-op */ }

/**
 * Returns a field on object `o` by a dotted path.
 * ```
 * const d = {
 *  accel: {x: 1, y: 2, z: 3},
 *  gyro:  {x: 4, y: 5, z: 6}
 * };
 * getFieldByPath(d, `accel.x`); // 1
 * getFieldByPath(d, `gyro.z`);  // 6
 * getFieldByPath(d, `gyro`);    // {x:4, y:5, z:6}
 * getFieldByPath(d, ``);        // Returns original object
 * ```
 * 
 * If a field does not exist, `undefined` is returned.
 * Use {@link getFieldPaths} to get a list of paths.
 * @param o 
 * @param path 
 * @returns 
 */
//eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getFieldByPath = (o:any, path:string = ``):any|undefined => {
  if (path.length === 0) return o;
  if (path in o) {
    return o[path];
  } else {
    const start = untilMatch(path, `.`);
    if (start in o) {
      return getFieldByPath(o[start], path.substring(start.length+1));
    } else {
      return undefined;
    }
  }
};

/**
 * Returns a list of paths for all the fields on `o`
 * ```
 * const d = {
 *  accel: {x: 1, y: 2, z: 3},
 *  gyro:  {x: 4, y: 5, z: 6}
 * };
 * const paths = getFieldPaths(d); 
 * // Yields [ `accel.x`, `accel.y`,`accel.z`,`gyro.x`,`gyro.y`,`gyro.z` ]
 * ```
 * 
 * Use {@link getFieldByPath} to fetch data by this 'path' string.
 * @param o 
 * @returns 
 */
//eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getFieldPaths = (o:any):readonly string[] => {
  const paths:string[] = [];
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  const probe = (o:any, prefix = ``) => {
    if (typeof o === `object`) {
      const keys = Object.keys(o);
      if (prefix.length > 0) prefix += `.`;
      keys.forEach(k => probe(o[k], prefix + k));
    } else {
      //eslint-disable-next-line functional/immutable-data
      paths.push(prefix);
    }
  };
  probe(o);
  return paths;
};

/**
 * Rounds `v` up to the nearest multiple of `multiple`
 * ```
 * roundMultiple(19, 20); // 20
 * roundMultiple(21, 20); // 40
 * ```
 * @param v 
 * @param multiple 
 * @returns 
 */
export const roundUpToMultiple = (v:number, multiple:number):number => {
  guardNumber(v, `nonZero`, `v`);
  guardNumber(multiple, `nonZero`, `muliple`);
  return Math.ceil(v/multiple)*multiple;
};

export type ToString<V> = (itemToMakeStringFor:V)=>string;

/**
 * Function that returns true if `a` and `b` are considered equal
 */
export type IsEqual<V> = (a:V, b:V)=>boolean;

/**
 * Default comparer function is equiv to checking `a === b`
 */
export const isEqualDefault = <V>(a:V, b:V):boolean => a === b;

/**
 * Comparer returns true if string representation of `a` and `b` are equal.
 * Uses `toStringDefault` to generate a string representation (`JSON.stringify`)
 * @returns True if the contents of `a` and `b` are equal
 */
export const isEqualValueDefault = <V>(a:V, b:V):boolean => {
  // ✔ UNIT TESTED
  if (a === b) return true; // Object references are the same, or string values are the same
  return toStringDefault(a) === toStringDefault(b); // String representations are the same
};

/**
 * A default converter to string that uses JSON.stringify if its an object, or the thing itself if it's a string
 */
export const toStringDefault = <V>(itemToMakeStringFor:V):string => ((typeof itemToMakeStringFor === `string`) ? itemToMakeStringFor : JSON.stringify(itemToMakeStringFor));

export const runningiOS = () => [
  `iPad Simulator`,
  `iPhone Simulator`,
  `iPod Simulator`,
  `iPad`,
  `iPhone`,
  `iPod`
].includes(navigator.platform)
  // iPad on iOS 13 detection
  || (navigator.userAgent.includes(`Mac`) && `ontouchend` in document);

/**
 * Default sort comparer, following same sematics as Array.sort
 * @param x 
 * @param y 
 * @returns 
 */
//eslint-disable-next-line @typescript-eslint/no-explicit-any
export const defaultComparer = (x:any, y:any) => {
  // Via https://stackoverflow.com/questions/47334234/how-to-implement-array-prototype-sort-default-compare-function
  if (x === undefined && y === undefined) return 0;
  if (x === undefined) return 1;
  if (y === undefined) return -1;

  const xString = defaultToString(x);
  const yString = defaultToString(y);

  if (xString < yString) return -1;
  if(xString > yString) return 1;
  return 0;
};

//eslint-disable-next-line @typescript-eslint/no-explicit-any
const defaultToString = (obj:any) => {
  //ECMA specification: http://www.ecma-international.org/ecma-262/6.0/#sec-tostring
  if (obj === null) return `null`;
  if (typeof obj === `boolean` ||  typeof obj === `number`) return (obj).toString();

  if (typeof obj === `string`) return obj;
  if (typeof obj === `symbol`) throw new TypeError();
  return (obj).toString();
};

try {
  if (typeof window !== `undefined`) {
    //eslint-disable-next-line functional/immutable-data,@typescript-eslint/no-explicit-any
    (window as any).ixfx = { ...(window as any).ixfx,  getFieldByPath, getFieldPaths };
  }
} catch { /* no-op */ }