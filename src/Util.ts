import { numberTest, throwFromResult } from './Guards.js';

export * from './IsEqual.js';
export * from './Compare.js';
export * from './Results.js';

//export * as IterableAsync from './iterables/IterableAsync.js';

export type ArrayLengthMutationKeys = `splice` | `push` | `pop` | `shift` | `unshift` | number
export type ArrayItems<T extends Array<any>> = T extends Array<infer TItems> ? TItems : never
export type FixedLengthArray<T extends Array<any>> =
  Pick<T, Exclude<keyof T, ArrayLengthMutationKeys>>
  & { [ Symbol.iterator ]: () => IterableIterator<ArrayItems<T>> }

export const isFunction = (object: unknown): object is (...args: Array<any>) => any => object instanceof Function;

/**
 * Returns _true_ if `value` is a plain object
 * 
 * ```js
 * isPlainObject(`text`); // false
 * isPlainObject(document); // false
 * isPlainObject({ hello: `there` }); // true
 * ```
 * @param value 
 * @returns 
 */
export const isPlainObject = (value: unknown) => {
  if (typeof value !== `object` || value === null) return false;
  const prototype = Object.getPrototypeOf(value);
  return (prototype === null || prototype === Object.prototype || Object.getPrototypeOf(prototype) === null) && !(Symbol.toStringTag in value) && !(Symbol.iterator in value);
}

/**
 * Returns _true_ if `value` is an integer. Parses string input, but
 * all other data types return _false_.
 * 
 * ```js
 * isInteger(1);      // true
 * isInteger(1.1);    // false
 * isInteger(`1`);    // true
 * isInteger(`1.1`);  // false
 * isInteger(true);   // false
 * isInteger(false);  // false
 * ```
 * 
 * Returns _false_ for _undefined_, NaN, booleans and infinite numbers.
 * @param value 
 * @returns 
 */
export const isInteger = (value: string | number) => {
  if (value === undefined) return false;
  if (typeof value === `string`) {
    const v = Number.parseInt(value);
    if (Number.isNaN(v)) return false;
    if (v.toString() === value.toString()) return true;
    return false;
  }
  if (typeof value === `number`) {
    if (Number.isNaN(value)) return false;
    if (!Number.isFinite(value)) return false;
    if (Math.round(value) === value) return true;
    return false;
  }
  return false;
}

/**
 * Returns _true_ if `value` is primitive value or plain object
 * @param value 
 * @returns 
 */
export const isPlainObjectOrPrimitive = (value: unknown) => {
  const t = typeof value;
  if (t === `symbol`) return false;
  if (t === `function`) return false;
  if (t === `bigint`) return true;
  if (t === `number`) return true;
  if (t === `string`) return true;
  if (t === `boolean`) return true;
  return isPlainObject(value);
}
/**
 * Returns `fallback` if `v` is NaN, otherwise returns `v`.
 *
 * Throws if `v` is not a number type.
 * @param v
 * @param fallback
 * @returns
 */
export const ifNaN = (v: number, fallback: number): number => {
  // ✔️ Unit tested

  if (Number.isNaN(v)) return fallback;
  if (typeof v !== `number`) {
    throw new TypeError(`v is not a number. Got: ${ typeof v }`);
  }
  return v;
};


/**
 * Returns true if `x` is a power of two
 * @param x
 * @returns True if `x` is a power of two
 */
export const isPowerOfTwo = (x: number) => Math.log2(x) % 1 === 0;

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
export const roundUpToMultiple = (v: number, multiple: number): number => {
  throwFromResult(numberTest(v, `nonZero`, `v`));
  throwFromResult(numberTest(multiple, `nonZero`, `multiple`));
  return Math.ceil(v / multiple) * multiple;
};

export type ToString<V> = (itemToMakeStringFor: V) => string;

// Via Vuejs
// eslint-disable-next-line @typescript-eslint/unbound-method
const objectToString = Object.prototype.toString
const toTypeString = (value: unknown): string =>
  objectToString.call(value)
export const isMap = (value: unknown): value is Map<any, any> =>
  toTypeString(value) === `[object Map]`
export const isSet = (value: unknown): value is Set<any> =>
  toTypeString(value) === `[object Set]`

/**
 * A default converter to string that uses JSON.stringify if its an object, or the thing itself if it's a string
 */
export const toStringDefault = <V>(itemToMakeStringFor: V): string =>
  typeof itemToMakeStringFor === `string`
    ? itemToMakeStringFor
    : JSON.stringify(itemToMakeStringFor);

//eslint-disable-next-line functional/functional-parameters
export const runningiOS = () =>
  [
    `iPad Simulator`,
    `iPhone Simulator`,
    `iPod Simulator`,
    `iPad`,
    `iPhone`,
    `iPod`,
  ].includes(navigator.platform) ||
  // iPad on iOS 13 detection
  (navigator.userAgent.includes(`Mac`) && `ontouchend` in document);

export type CompareResult = number; // 0 | 1 | -1;
export type Comparer<V> = (a: V, b: V) => CompareResult;

/**
 * Sort numbers in ascending order.
 *
 * ```js
 * [10, 4, 5, 0].sort(numericComparer);
 * // Yields: [0, 4, 5, 10]
 * [10, 4, 5, 0].sort(comparerInverse(numericComparer));
 * // Yields: [ 10, 5, 4, 0]
 * ```
 * @param x
 * @param y
 * @returns
 */
export const numericComparer = (x: number, y: number): CompareResult => {
  // ✔️ Unit tested
  if (x === y) return 0;
  if (x > y) return 1;
  return -1;
};

// /**
//  * Sorts numbers in descending order
//  * @param x
//  * @param y
//  * @returns
//  */
// export const numericComparerInverse = (x: number, y: number): CompareResult => {
//   // ✔️ Unit tested
//   if (x === y) return 0;
//   if (x > y) return -1;
//   return 1;
// };

/**
 * Default sort comparer, following same sematics as Array.sort.
 * Consider using {@link defaultComparer} to get more logical sorting of numbers.
 *
 * Note: numbers are sorted in alphabetical order, eg:
 * ```js
 * [ 10, 20, 5, 100 ].sort(jsComparer); // same as .sort()
 * // Yields: [10, 100, 20, 5]
 * ```
 * @param x
 * @param y
 * @returns
 */
//eslint-disable-next-line @typescript-eslint/no-explicit-any
export const jsComparer = (x: any, y: any): CompareResult => {
  // ✔️ Unit tested

  // Via https://stackoverflow.com/questions/47334234/how-to-implement-array-prototype-sort-default-compare-function
  if (x === undefined && y === undefined) return 0;
  if (x === undefined) return 1;
  if (y === undefined) return -1;

  const xString = defaultToString(x);
  const yString = defaultToString(y);

  if (xString < yString) return -1;
  if (xString > yString) return 1;
  return 0;
};

// export const jsComparerInverse = (x: any, y: any): CompareResult =>
//   jsComparer(x, y) * -1;

/**
 * Compares numbers by numeric value, otherwise uses the default
 * logic of string comparison.
 *
 * Is an ascending sort:
 *  b, a, c -> a, b, c
 *  10, 5, 100 -> 5, 10, 100
 * @param x
 * @param y
 * @see {@link comparerInverse} Inverted order
 * @returns
 */
//eslint-disable-next-line @typescript-eslint/no-explicit-any
export const defaultComparer = (x: any, y: any): CompareResult => {
  if (typeof x === `number` && typeof y === `number`) {
    return numericComparer(x, y);
  }
  return jsComparer(x, y);
};

// /**
//  * Compares numbers by numeric value, otherwise uses the default
//  * logic of string comparison.
//  *
//  * Is an descending sort:
//  *  b, a, c -> c, a, b
//  *  10, 5, 100 -> 100, 10, 5
//  * @param x
//  * @param y
//  * @returns
//  * @see {@link defaultComparer} Asending
//  */
// export const defaultComparerInverse = (x: any, y: any): CompareResult => {
//   if (typeof x === `number` && typeof y === `number`) {
//     return numericComparerInverse(x, y);
//   }
//   return jsComparerInverse(x, y);
// };

/**
 * Inverts the source comparer.
 * @param fn
 * @returns
 */
export const comparerInverse = <V>(comparer: Comparer<V>): Comparer<V> => {
  return (x: V, y: V) => {
    const v = comparer(x, y);
    return v * -1;
  };
};



//eslint-disable-next-line @typescript-eslint/no-explicit-any
const defaultToString = (object: any): string => {
  //ECMA specification: http://www.ecma-international.org/ecma-262/6.0/#sec-tostring
  if (object === null) return `null`;
  if (typeof object === `boolean` || typeof object === `number`) {
    return object.toString();
  }

  if (typeof object === `string`) return object;
  if (typeof object === `symbol`) throw new TypeError(`Symbol cannot be converted to string`);
  return JSON.stringify(object);
};

// try {
//   if (typeof window !== `undefined`) {
//     //eslint-disable-next-line functional/immutable-data,@typescript-eslint/no-explicit-any
//     (window as any).ixfx = {
//       //eslint-disable-next-line @typescript-eslint/no-explicit-any
//       ...(window as any).ixfx,
//       getFieldByPath,
//       getFieldPaths,
//     };
//   }
// } catch {
//   /* no-op */
// }

